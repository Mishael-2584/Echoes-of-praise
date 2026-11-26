import type { Handler } from "@netlify/functions";
import { createVerify } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * KCB Buni Instant Payment Notification, exposed at /api/kcb-ipn.
 *
 * Accepts both KCB formats:
 *  - Till notification (Lipa na KCB till / paybill 522533 + till number)
 *  - Account notification (payments into a KCB bank account)
 *
 * KCB signs the raw body with SHA256withRSA and sends it in the `Signature`
 * header. Set KCB_IPN_PUBLIC_KEY (PEM) to verify. Only verified payments are
 * added to the live fundraiser total. For sandbox testing before KCB shares
 * its key, KCB_IPN_ALLOW_UNSIGNED=true treats unsigned notifications as
 * verified; never leave that on in production.
 */

type TillNotification = {
  header?: {
    messageID?: string;
    originatorConversationID?: string;
    channelCode?: string;
    timeStamp?: string;
  };
  requestPayload?: {
    primaryData?: { businessKey?: string; businessKeyType?: string };
    additionalData?: {
      notificationData?: {
        businessKey?: string;
        businessKeyType?: string;
        debitMSISDN?: string;
        transactionAmt?: string;
        transactionDate?: string;
        transactionID?: string;
        firstName?: string;
        middleName?: string;
        lastName?: string;
        currency?: string;
        narration?: string;
        transactionType?: string;
      };
    };
  };
};

type AccountNotification = {
  transactionReference?: string;
  requestId?: string;
  channelCode?: string;
  timestamp?: string;
  transactionAmount?: string;
  currency?: string;
  customerReference?: string;
  customerName?: string;
  customerMobileNumber?: string;
  narration?: string;
  creditAccountIdentifier?: string;
  organizationShortCode?: string;
  tillNumber?: string;
};

type Payment = {
  type: "till" | "account";
  transactionId: string;
  amount: number;
  currency: string;
  payerName: string;
  payerPhone: string;
  reference: string;
  narration: string;
  channel: string;
  header?: TillNotification["header"];
};

function normalise(body: unknown): Payment | null {
  const till = body as TillNotification;
  const n = till?.requestPayload?.additionalData?.notificationData;
  if (n) {
    return {
      type: "till",
      transactionId: n.transactionID || till.header?.originatorConversationID || "",
      amount: Number(n.transactionAmt || 0),
      currency: n.currency || "KES",
      payerName: [n.firstName, n.middleName, n.lastName].filter(Boolean).join(" ").trim(),
      payerPhone: n.debitMSISDN || "",
      reference: n.businessKey || till.requestPayload?.primaryData?.businessKey || "",
      narration: n.narration || "",
      channel: n.transactionType || till.header?.channelCode || "",
      header: till.header,
    };
  }
  const acc = body as AccountNotification;
  if (acc && (acc.transactionReference || acc.transactionAmount)) {
    return {
      type: "account",
      transactionId: acc.transactionReference || acc.requestId || "",
      amount: Number(acc.transactionAmount || 0),
      currency: acc.currency || "KES",
      payerName: acc.customerName || "",
      payerPhone: acc.customerMobileNumber || "",
      reference: acc.customerReference || acc.creditAccountIdentifier || "",
      narration: acc.narration || "",
      channel: acc.channelCode || "",
    };
  }
  return null;
}

function ack(p: Payment | null, ok: boolean, message: string, statusCode = 200) {
  const body =
    p?.type === "till"
      ? {
          header: {
            messageID: p.header?.messageID || "",
            originatorConversationID: p.header?.originatorConversationID || "",
            statusCode: ok ? "0" : "1",
            statusMessage: message,
          },
          responsePayload: { transactionInfo: { transactionId: p.transactionId } },
        }
      : {
          transactionID: p?.transactionId || "",
          statusCode: ok ? "0" : "1",
          statusMessage: message,
        };
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function normalisePem(raw: string) {
  const s = raw.replace(/\\n/g, "\n").trim();
  if (s.includes("BEGIN")) return s;
  return `-----BEGIN PUBLIC KEY-----\n${s.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
}

function checkSignature(raw: string, signature: string | undefined) {
  const key = process.env.KCB_IPN_PUBLIC_KEY;
  if (!key) {
    return {
      valid: true,
      verified: process.env.KCB_IPN_ALLOW_UNSIGNED === "true",
    };
  }
  if (!signature) return { valid: false, verified: false };
  try {
    const v = createVerify("RSA-SHA256");
    v.update(raw, "utf8");
    v.end();
    const ok = v.verify(normalisePem(key), signature, "base64");
    return { valid: ok, verified: ok };
  } catch (err) {
    console.error("[kcb-ipn] signature check failed", err);
    return { valid: false, verified: false };
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  const signature = event.headers["signature"] || event.headers["Signature"];

  let body: unknown;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return ack(null, false, "Invalid JSON body", 400);
  }

  const p = normalise(body);
  if (!p || !p.transactionId || !Number.isFinite(p.amount)) {
    return ack(p, false, "Unrecognised notification", 400);
  }

  const sig = checkSignature(raw, signature);
  if (!sig.valid) {
    console.warn("[kcb-ipn] rejected: bad signature", p.transactionId);
    return ack(p, false, "Invalid signature", 401);
  }

  console.info("[kcb-ipn]", {
    type: p.type,
    transactionId: p.transactionId,
    amount: p.amount,
    reference: p.reference,
    verified: sig.verified,
  });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[kcb-ipn] SUPABASE_SERVICE_ROLE_KEY not set; payment not saved");
    // Still acknowledge so KCB does not keep retrying; the payment is in the logs.
    return ack(p, true, "Notification received successfully");
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await sb.from("kcb_payments").insert({
    transaction_id: p.transactionId,
    amount_kes: p.amount,
    currency: p.currency,
    payer_name: p.payerName,
    payer_phone: p.payerPhone,
    reference: p.reference,
    narration: p.narration,
    channel: p.channel,
    notification_type: p.type,
    signature_verified: sig.verified,
    raw: body as Record<string, unknown>,
  });

  // 23505 = already recorded (KCB retry). Acknowledge without counting twice.
  if (error && error.code !== "23505") {
    console.error("[kcb-ipn] save failed", error);
    return ack(p, false, "Temporary error, please retry", 500);
  }

  return ack(p, true, "Notification received successfully");
};
