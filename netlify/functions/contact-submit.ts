import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

type Body = Record<string, unknown>;

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

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

async function sendResend(opts: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, reason: "RESEND_API_KEY not set" };
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Echoes of Praise <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo || undefined,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("[contact-submit] resend", text);
    return { sent: false as const, reason: text };
  }
  return { sent: true as const };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }

  let body: Body;
  try {
    body = JSON.parse(event.body || "{}") as Body;
  } catch {
    return json(400, { message: "Invalid JSON body" });
  }

  // Honeypot
  if (str(body.website)) {
    return json(200, { message: "Thank you.", id: "ok" });
  }

  const enquiryType = str(body.enquiry_type);
  const allowed = ["invite", "tickets", "partnership", "media", "general"];
  if (!allowed.includes(enquiryType)) {
    return json(400, { message: "Please select how we can help." });
  }

  const fullName = str(body.full_name);
  const email = str(body.email);
  const phone = str(body.phone);

  if (!fullName) return json(400, { message: "Full name is required." });

  if (enquiryType === "invite") {
    if (!phone) return json(400, { message: "Phone/WhatsApp number is required." });
    if (!email) return json(400, { message: "Email address is required." });
    if (!str(body.organisation)) {
      return json(400, { message: "Church/organisation is required." });
    }
    if (!str(body.event_name)) return json(400, { message: "Event name is required." });
    if (!str(body.event_type)) return json(400, { message: "Type of event is required." });
    if (!str(body.event_description)) {
      return json(400, { message: "Event description is required." });
    }
    if (!str(body.proposed_date)) {
      return json(400, { message: "Proposed date is required." });
    }
    if (!str(body.town_venue)) {
      return json(400, { message: "Town and venue are required." });
    }
  } else if (enquiryType === "tickets") {
    if (!phone) return json(400, { message: "Phone/WhatsApp number is required." });
    if (!email) return json(400, { message: "Email address is required." });
    if (!str(body.assistance_required)) {
      return json(400, { message: "Please tell us how we can assist." });
    }
  } else {
    if (!email) return json(400, { message: "Email address is required." });
    if (!str(body.message)) return json(400, { message: "Message is required." });
  }

  const eventType = str(body.event_type);
  const expectedAttendance =
    eventType === "church_service" ? "" : str(body.expected_attendance);

  const facilitation = Array.isArray(body.facilitation)
    ? body.facilitation.map((x) => String(x))
    : [];

  const row = {
    enquiry_type: enquiryType,
    status: "new",
    full_name: fullName,
    phone,
    email,
    organisation: str(body.organisation),
    position_role: str(body.position_role),
    event_name: str(body.event_name),
    event_type: eventType,
    event_description: str(body.event_description),
    proposed_date: str(body.proposed_date) || null,
    performance_time: str(body.performance_time),
    town_venue: str(body.town_venue),
    expected_length: str(body.expected_length),
    expected_attendance: expectedAttendance,
    sound_system: str(body.sound_system) || "",
    sound_equipment: str(body.sound_equipment),
    facilitation,
    facilitation_details: str(body.facilitation_details),
    programme_notes: str(body.programme_notes),
    theme_requests: str(body.theme_requests),
    additional_notes: str(body.additional_notes),
    attachment_url: str(body.attachment_url) || null,
    ticket_event_id: str(body.ticket_event_id) || null,
    ticket_event_title: str(body.ticket_event_title),
    ticket_reference: str(body.ticket_reference),
    assistance_required: str(body.assistance_required),
    message: str(body.message),
    preferred_response: str(body.preferred_response) || "",
  };

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return json(503, {
      message:
        "Contact form storage is not configured. Please email hello@echoesofpraize.com.",
    });
  }

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("contact_submissions")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[contact-submit]", error);
    return json(500, {
      message: "Could not save your enquiry. Please try again shortly.",
    });
  }

  const { data: settings } = await sb
    .from("contact_settings")
    .select("email")
    .eq("id", 1)
    .maybeSingle();

  const inbox =
    (settings?.email as string | undefined)?.trim() ||
    process.env.CONTACT_INBOX ||
    "hello@echoesofpraize.com";

  const typeLabel: Record<string, string> = {
    invite: "Choir invitation",
    tickets: "Concert / ticket enquiry",
    partnership: "Partnership or sponsorship",
    media: "Media enquiry",
    general: "General enquiry",
  };

  const summaryHtml = `
    <p><strong>Type:</strong> ${typeLabel[enquiryType] || enquiryType}</p>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email || "—"}</p>
    <p><strong>Phone:</strong> ${phone || "—"}</p>
    <p><strong>Organisation:</strong> ${row.organisation || "—"}</p>
    <p><strong>Event:</strong> ${row.event_name || row.ticket_event_title || "—"}</p>
    <p><strong>Date:</strong> ${row.proposed_date || "—"}</p>
    <p><strong>Venue:</strong> ${row.town_venue || "—"}</p>
    <p><strong>Message / notes:</strong><br/>${(
      row.message ||
      row.assistance_required ||
      row.event_description ||
      row.additional_notes ||
      "—"
    ).replace(/\n/g, "<br/>")}</p>
    <p>Submission ID: ${data.id}</p>
  `;

  await sendResend({
    to: [inbox],
    subject: `[EoP Contact] ${typeLabel[enquiryType]} — ${fullName}`,
    html: `<p>New website enquiry:</p>${summaryHtml}`,
    replyTo: email || undefined,
  });

  if (email) {
    await sendResend({
      to: [email],
      subject: "We received your message — Echoes of Praise",
      html: `
        <p>Dear ${fullName},</p>
        <p>Thank you for contacting Echoes of Praise. We have received your enquiry
        (${typeLabel[enquiryType]}) and our team will review it shortly.</p>
        <p>Submitting a form does not confirm an invitation or booking. We will contact
        you regarding availability and next steps.</p>
        <p>With gratitude,<br/>Echoes of Praise<br/>Nakuru, Kenya</p>
      `,
    });
  }

  return json(200, {
    message: "Thank you. Your enquiry has been sent.",
    id: data.id,
  });
};
