import type { ChoirEvent, Fundraiser } from "../types";

export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEventDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 1000) / 10);
}

/** Normalize Kenyan phone to 2547XXXXXXXX for Daraja STK. */
export function normalizeKenyaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^2547\d{8}$/.test(digits)) return digits;
  if (/^07\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^7\d{8}$/.test(digits)) return `254${digits}`;
  if (/^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  return null;
}

export async function loadEvents(): Promise<ChoirEvent[]> {
  const res = await fetch("/data/events.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to load events");
  return res.json();
}

export async function loadFundraiser(): Promise<Fundraiser> {
  // Prefer live Netlify function so raised amount can update without redeploying static JSON.
  try {
    const live = await fetch("/api/fundraiser-status", { cache: "no-store" });
    if (live.ok) return live.json();
  } catch {
    /* fall through to static file for local/static preview */
  }
  const res = await fetch("/data/fundraiser.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to load fundraiser");
  return res.json();
}

export async function initiateMpesaPayment(payload: {
  phone: string;
  amount: number;
  kind: "ticket" | "donation";
  reference: string;
  description: string;
}): Promise<{ ok: boolean; message: string; checkoutRequestId?: string }> {
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
}
