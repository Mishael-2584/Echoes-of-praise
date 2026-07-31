import type {
  ChoirEvent,
  DonationInput,
  Fundraiser,
  GalleryAlbum,
  GalleryItem,
  RosterMember,
  TicketOrder,
  TicketOrderInput,
  TicketTier,
} from "../types";
import {
  seedChoirMembers,
  seedEvents,
  seedFundraisers,
  seedGallery,
  seedGalleryAlbums,
} from "./seed";
import { isSupabaseConfigured, supabase } from "./supabase";
import { initiateMpesaPayment, normalizeKenyaPhone } from "./payments";

export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function progressPercent(raised: number, goal: number | null): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 1000) / 10);
}

export function isUpcoming(event: ChoirEvent): boolean {
  return new Date(event.starts_at).getTime() >= Date.now() - 6 * 60 * 60 * 1000;
}

function withTiers(events: ChoirEvent[], tiers: TicketTier[]): ChoirEvent[] {
  return events.map((e) => ({
    ...e,
    ticket_tiers: tiers
      .filter((t) => t.event_id === e.id && t.active)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function fetchEvents(): Promise<ChoirEvent[]> {
  if (!supabase) {
    try {
      const demo = localStorage.getItem("eop_demo_events");
      if (demo) {
        return JSON.parse(demo) as ChoirEvent[];
      }
    } catch {
      /* fall through */
    }
    return seedEvents.map((e) => ({
      ...e,
      ticket_tiers: [...(e.ticket_tiers ?? [])],
    }));
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) {
    console.warn("[events]", error);
    return seedEvents.map((e) => ({
      ...e,
      ticket_tiers: [...(e.ticket_tiers ?? [])],
    }));
  }

  if (!events || events.length === 0) {
    return [];
  }

  const ids = events.map((e) => e.id);
  const { data: tiers } = await supabase
    .from("ticket_tiers")
    .select("*")
    .in("event_id", ids)
    .eq("active", true)
    .order("sort_order");

  return withTiers(events as ChoirEvent[], (tiers as TicketTier[]) ?? []);
}

export async function fetchEventBySlug(slug: string): Promise<ChoirEvent | null> {
  const events = await fetchEvents();
  return events.find((e) => e.slug === slug || e.id === slug) ?? null;
}

export async function fetchFundraisers(): Promise<Fundraiser[]> {
  if (!supabase) {
    try {
      const demo = localStorage.getItem("eop_demo_fundraisers");
      if (demo) return JSON.parse(demo) as Fundraiser[];
    } catch {
      /* fall through */
    }
    return seedFundraisers;
  }

  const { data, error } = await supabase
    .from("fundraisers")
    .select("*")
    .eq("active", true)
    .is("archived_at", null)
    .order("kind", { ascending: true });

  if (error) {
    console.warn("[fundraisers]", error);
    return seedFundraisers;
  }
  return (data as Fundraiser[]) ?? [];
}

export async function fetchChoirMembers(): Promise<RosterMember[]> {
  if (!supabase) {
    try {
      const demo = localStorage.getItem("eop_demo_choir_members");
      if (demo) {
        return (JSON.parse(demo) as RosterMember[])
          .filter((m) => m.published)
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
          );
      }
    } catch {
      /* fall through */
    }
    return seedChoirMembers
      .filter((m) => m.published)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
  }

  const { data, error } = await supabase
    .from("choir_members")
    .select("*")
    .eq("published", true)
    .order("name", { ascending: true });

  if (error) {
    console.warn("[choir_members]", error);
    return seedChoirMembers.filter((m) => m.published);
  }
  if (!data || data.length === 0) {
    return seedChoirMembers.filter((m) => m.published);
  }
  return data as RosterMember[];
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  if (!supabase) {
    try {
      const demo = localStorage.getItem("eop_demo_gallery");
      if (demo) return JSON.parse(demo) as GalleryItem[];
    } catch {
      /* fall through */
    }
    return seedGallery;
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("[gallery]", error);
    return seedGallery;
  }
  return (data as GalleryItem[]) ?? [];
}

export async function fetchGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (!supabase) {
    try {
      const demo = localStorage.getItem("eop_demo_gallery_albums");
      if (demo) {
        const albums = JSON.parse(demo) as GalleryAlbum[];
        const items = await fetchGallery();
        return albums
          .filter((a) => a.published)
          .map((a) => ({
            ...a,
            items: items.filter((i) => i.album_id === a.id && i.published),
          }));
      }
    } catch {
      /* fall through */
    }
    return seedGalleryAlbums.map((a) => ({
      ...a,
      items: seedGallery.filter((i) => i.album_id === a.id),
    }));
  }

  const { data: albums, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("[gallery_albums]", error);
    // Table may not exist yet before migration 006
    const items = await fetchGallery();
    if (items.length === 0) return [];
    return [
      {
        id: "legacy",
        slug: "gallery",
        title: "Gallery",
        description: "",
        event_date: null,
        cover_image_url: items[0]?.image_url ?? null,
        cover_focus_x: 50,
        cover_focus_y: 40,
        published: true,
        sort_order: 0,
        items,
      },
    ];
  }

  if (!albums || albums.length === 0) {
    const items = await fetchGallery();
    if (items.length === 0) return [];
    return [
      {
        id: "legacy",
        slug: "gallery",
        title: "Gallery",
        description: "Moments from Echoes of Praise",
        event_date: null,
        cover_image_url: items[0]?.image_url ?? null,
        cover_focus_x: 50,
        cover_focus_y: 40,
        published: true,
        sort_order: 0,
        items,
      },
    ];
  }

  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const photos = (items as GalleryItem[]) ?? [];
  return (albums as GalleryAlbum[]).map((album) => ({
    ...album,
    cover_focus_x: album.cover_focus_x ?? 50,
    cover_focus_y: album.cover_focus_y ?? 50,
    items: photos.filter((p) => p.album_id === album.id),
    cover_image_url:
      album.cover_image_url ||
      photos.find((p) => p.album_id === album.id)?.image_url ||
      null,
  }));
}

export function formatAlbumDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const LOCAL_ORDERS_KEY = "eop_ticket_orders";

function readLocalOrders(): TicketOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]") as TicketOrder[];
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: TicketOrder[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

export async function createTicketOrder(
  input: TicketOrderInput,
  tier: TicketTier,
): Promise<{ order: TicketOrder; paymentMessage: string; needsMpesa: boolean }> {
  const phone = normalizeKenyaPhone(input.buyer_phone);
  if (!phone) throw new Error("Enter a valid Kenyan phone number (07… / 01…).");

  const amount = tier.price_kes * input.quantity;
  const needsMpesa = amount > 0;

  const base = {
    ...input,
    buyer_phone: phone,
    amount_kes: amount,
    status: needsMpesa ? ("pending" as const) : ("confirmed" as const),
  };

  let order: TicketOrder;

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("ticket_orders")
      .insert({
        event_id: input.event_id,
        tier_id: input.tier_id,
        quantity: input.quantity,
        amount_kes: amount,
        buyer_name: input.buyer_name,
        buyer_email: input.buyer_email,
        buyer_phone: phone,
        buyer_city: input.buyer_city || null,
        buyer_county: input.buyer_county || null,
        buyer_country: input.buyer_country || "Kenya",
        age_range: input.age_range || null,
        heard_about: input.heard_about || null,
        notes: input.notes || null,
        status: base.status,
      })
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message || "Could not create order");
    order = data as TicketOrder;
  } else {
    order = {
      ...base,
      id: crypto.randomUUID(),
      confirmation_code: `EOP${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
    };
    writeLocalOrders([order, ...readLocalOrders()]);
  }

  let paymentMessage = needsMpesa
    ? "Complete M-Pesa payment on your phone to confirm your ticket."
    : `Free ticket confirmed. Code: ${order.confirmation_code}`;

  if (needsMpesa) {
    const pay = await initiateMpesaPayment({
      phone,
      amount,
      kind: "ticket",
      reference: order.confirmation_code.slice(0, 12),
      description: `Ticket ${tier.name}`.slice(0, 20),
    });
    paymentMessage = pay.message;
    if (pay.ok && pay.checkoutRequestId && supabase) {
      await supabase
        .from("ticket_orders")
        .update({ mpesa_checkout_id: pay.checkoutRequestId })
        .eq("id", order.id);
    }
  }

  return { order, paymentMessage, needsMpesa };
}

export async function createDonation(
  input: DonationInput,
): Promise<{ message: string }> {
  const phone = normalizeKenyaPhone(input.donor_phone);
  if (!phone) throw new Error("Enter a valid Kenyan phone number.");

  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("donations")
      .insert({
        fundraiser_id: input.fundraiser_id,
        amount_kes: input.amount_kes,
        donor_name: input.donor_name,
        donor_email: input.donor_email || null,
        donor_phone: phone,
        donor_city: input.donor_city || null,
        donor_county: input.donor_county || null,
        message: input.message || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    const pay = await initiateMpesaPayment({
      phone,
      amount: input.amount_kes,
      kind: "donation",
      reference: `GIVE${String(data?.id || "").slice(0, 8)}`.toUpperCase(),
      description: "Choir donation",
    });
    return { message: pay.message };
  }

  const pay = await initiateMpesaPayment({
    phone,
    amount: input.amount_kes,
    kind: "donation",
    reference: "GIVE-LOCAL",
    description: "Choir donation",
  });
  return { message: pay.message };
}

export { readLocalOrders };
