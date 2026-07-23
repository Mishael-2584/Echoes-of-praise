import type { Handler } from "@netlify/functions";

/**
 * Safaricom Daraja STK callback.
 * Confirms payment results; wire this to your ledger / bank settlement workflow.
 * Netlify + HTTPS ensures the callback endpoint is TLS-protected.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const payload = JSON.parse(event.body || "{}") as {
      Body?: {
        stkCallback?: {
          ResultCode?: number;
          ResultDesc?: string;
          CheckoutRequestID?: string;
          CallbackMetadata?: {
            Item?: Array<{ Name: string; Value?: string | number }>;
          };
        };
      };
    };

    const callback = payload.Body?.stkCallback;
    console.info("[mpesa-callback]", {
      resultCode: callback?.ResultCode,
      resultDesc: callback?.ResultDesc,
      checkoutRequestId: callback?.CheckoutRequestID,
      metadata: callback?.CallbackMetadata?.Item,
    });

    // Acknowledge quickly — Daraja expects a fast 200.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
    };
  } catch (err) {
    console.error("[mpesa-callback] parse error", err);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
    };
  }
};
