import type { ContactSettings, ContactSubmission, EnquiryType } from "../types";
import { supabase } from "./supabase";

export const defaultContactSettings: ContactSettings = {
  id: 1,
  email: "hello@echoesofpraize.com",
  whatsapp: "",
  response_time: "We aim to respond within 2–3 business days.",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  tiktok_url: "",
  x_url: "",
};

export const enquiryLabels: Record<EnquiryType, string> = {
  invite: "Invite the choir",
  tickets: "Concert or ticket enquiry",
  partnership: "Partnership or sponsorship",
  media: "Media enquiry",
  general: "General enquiry",
};

export const contactStatusLabels: Record<ContactSubmission["status"], string> = {
  new: "New",
  under_review: "Under review",
  more_info: "More information required",
  available: "Available",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
};

export async function fetchContactSettings(): Promise<ContactSettings> {
  if (!supabase) return defaultContactSettings;
  const { data, error } = await supabase
    .from("contact_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn("[contact_settings]", error);
    return defaultContactSettings;
  }
  return data as ContactSettings;
}

export type ContactSubmitPayload = Omit<
  ContactSubmission,
  "id" | "status" | "created_at" | "updated_at" | "admin_notes"
> & { website?: string };

export async function submitContactForm(
  payload: ContactSubmitPayload,
): Promise<{ ok: true; id?: string } | { ok: false; message: string }> {
  try {
    const res = await fetch("/.netlify/functions/contact-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { message?: string; id?: string };
    if (!res.ok) {
      return {
        ok: false,
        message: data.message || "Could not send your message. Please try again.",
      };
    }
    return { ok: true, id: data.id };
  } catch {
    // Fallback: try direct Supabase insert when function unavailable (local)
    if (!supabase) {
      return {
        ok: false,
        message:
          "Contact form is not connected yet. Email hello@echoesofpraize.com directly.",
      };
    }
    const { website: _hp, ...row } = payload;
    void _hp;
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({ ...row, status: "new" })
      .select("id")
      .single();
    if (error) {
      return {
        ok: false,
        message: error.message || "Could not send your message.",
      };
    }
    return { ok: true, id: data.id };
  }
}

export function trackContactConversion(enquiryType: EnquiryType) {
  try {
    const w = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "contact_form_submit",
      enquiry_type: enquiryType,
    });
    w.gtag?.("event", "conversion", {
      send_to: undefined,
      event_category: "contact",
      event_label: enquiryType,
    });
    w.gtag?.("event", "contact_form_submit", {
      enquiry_type: enquiryType,
    });
  } catch {
    /* ignore */
  }
}
