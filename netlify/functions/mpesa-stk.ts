import type { Handler } from "@netlify/functions";

type Body = {
  phone?: string;
  amount?: number;
  kind?: "ticket" | "donation";
  reference?: string;
  description?: string;
};

function json(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

async function getDarajaToken(baseUrl: string, key: string, secret: string) {
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  if (!res.ok) throw new Error("Unable to authenticate with M-Pesa gateway");
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Missing M-Pesa access token");
  return data.access_token;
}

function timestamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }

  let body: Body;
  try {
    body = JSON.parse(event.body || "{}") as Body;
  } catch {
    return json(400, { message: "Invalid JSON body" });
  }

  const phone = (body.phone || "").replace(/\D/g, "");
  const amount = Math.round(Number(body.amount));
  const reference = (body.reference || "ECHOES").slice(0, 12);
  const description = (body.description || "Echoes of Praise").slice(0, 20);
  const kind = body.kind === "ticket" ? "ticket" : "donation";

  if (!/^254(7|1)\d{8}$/.test(phone)) {
    return json(400, { message: "Phone must be a valid Kenyan MSISDN (254…)." });
  }
  if (!Number.isFinite(amount) || amount < 1) {
    return json(400, { message: "Amount must be at least 1 KES." });
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const env = (process.env.MPESA_ENV || "sandbox").toLowerCase();
  const baseUrl =
    env === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.URL || process.env.DEPLOY_PRIME_URL || ""}/api/mpesa-callback`;

  // Demo / local mode when credentials are not configured yet
  if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
    console.info("[mpesa-stk] demo mode", { phone, amount, kind, reference });
    return json(200, {
      message:
        "Demo mode: M-Pesa credentials are not configured yet. Add Daraja keys in Netlify env to enable live STK Push to the choir account.",
      checkoutRequestId: `DEMO-${Date.now()}`,
      demo: true,
      kind,
      amount,
      reference,
    });
  }

  try {
    const token = await getDarajaToken(baseUrl, consumerKey, consumerSecret);
    const ts = timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");

    const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: reference,
        TransactionDesc: description,
      }),
    });

    const data = (await res.json()) as {
      ResponseCode?: string;
      CustomerMessage?: string;
      ResponseDescription?: string;
      CheckoutRequestID?: string;
      errorMessage?: string;
    };

    if (!res.ok || data.ResponseCode !== "0") {
      return json(502, {
        message:
          data.errorMessage ||
          data.ResponseDescription ||
          data.CustomerMessage ||
          "M-Pesa gateway rejected the request.",
      });
    }

    return json(200, {
      message:
        data.CustomerMessage ||
        "STK Push sent. Enter your M-Pesa PIN on your phone to complete payment.",
      checkoutRequestId: data.CheckoutRequestID,
      kind,
    });
  } catch (err) {
    console.error("[mpesa-stk]", err);
    return json(500, {
      message: "Secure payment gateway unavailable. Please try again shortly.",
    });
  }
};
