/** M-Pesa helpers shared by public checkout flows */

export function normalizeKenyaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^(7|1)\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}

export async function initiateMpesaPayment(payload: {
  phone: string;
  amount: number;
  kind: "ticket" | "donation";
  reference: string;
  description: string;
}): Promise<{ ok: boolean; message: string; checkoutRequestId?: string }> {
  try {
    const res = await fetch("/api/mpesa-stk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        message: data.message || "Payment could not be started. Please try again.",
      };
    }
    return {
      ok: true,
      message: data.message || "Check your phone for the M-Pesa prompt.",
      checkoutRequestId: data.checkoutRequestId,
    };
  } catch {
    return {
      ok: false,
      message: "Network error talking to the payment gateway.",
    };
  }
}
