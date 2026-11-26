import type { Handler } from "@netlify/functions";
import { createVerify } from "node:crypto";

/**
 * KCB Buni Instant Payment Notification (account notifications).
 * Exposed at /api/kcb-ipn. KCB signs the raw body with SHA256withRSA and
 * sends the signature in the `Signature` header; set KCB_IPN_PUBLIC_KEY
 * (PEM) to enforce verification.
 */

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

function reply(statusCode: number, transactionID: string, statusCodeKcb: string, statusMessage: string) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionID, statusCode: statusCodeKcb, statusMessage }),
  };
}

function normalisePem(raw: string) {
  const s = raw.replace(/\\n/g, "\n").trim();
  if (s.includes("BEGIN")) return s;
  return `-----BEGIN PUBLIC KEY-----\n${s.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
}

function verifySignature(body: string, signature: string | undefined) {
  const key = process.env.KCB_IPN_PUBLIC_KEY;
  if (!key) {
    console.warn("[kcb-ipn] KCB_IPN_PUBLIC_KEY not set; signature not verified");
    return true;
  }
  if (!signature) return false;
  try {
    const v = createVerify("RSA-SHA256");
    v.update(body, "utf8");
    v.end();
    return v.verify(normalisePem(key), signature, "base64");
  } catch (err) {
    console.error("[kcb-ipn] signature check failed", err);
    return false;
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  const signature =
    event.headers["signature"] || event.headers["Signature"] || undefined;

  let payload: AccountNotification;
  try {
    payload = JSON.parse(raw || "{}") as AccountNotification;
  } catch {
    return reply(400, "", "1", "Invalid JSON body");
  }

  const txId = payload.transactionReference || payload.requestId || "";

  if (!verifySignature(raw, signature)) {
    console.warn("[kcb-ipn] rejected: bad signature", { txId });
    return reply(401, txId, "1", "Invalid signature");
  }

  console.info("[kcb-ipn] notification", {
    transactionReference: payload.transactionReference,
    requestId: payload.requestId,
    amount: payload.transactionAmount,
    currency: payload.currency,
    customerReference: payload.customerReference,
    customerName: payload.customerName,
    customerMobileNumber: payload.customerMobileNumber,
    narration: payload.narration,
    creditAccountIdentifier: payload.creditAccountIdentifier,
    timestamp: payload.timestamp,
  });

  return reply(200, txId, "0", "Notification received successfully");
};
