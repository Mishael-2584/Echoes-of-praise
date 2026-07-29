import type { ChoirEvent, Fundraiser, GalleryItem, TicketOrder, TicketTier } from "../types";
import { clearDataCache } from "./dataCache";
import { seedEvents, seedFundraisers, seedGallery } from "./seed";
import { isSupabaseConfigured, supabase } from "./supabase";

const DEMO_EVENTS = "eop_demo_events";
const DEMO_GALLERY = "eop_demo_gallery";
const DEMO_FUNDS = "eop_demo_fundraisers";
const DEMO_ORDERS = "eop_ticket_orders";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function adminListEvents(): Promise<ChoirEvent[]> {
  if (!supabase) {
    return read(DEMO_EVENTS, seedEvents);
  }
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_tiers(*)")
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data as ChoirEvent[]).map((e) => ({
    ...e,
    ticket_tiers: ((e as ChoirEvent & { ticket_tiers?: TicketTier[] }).ticket_tiers || [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function adminSaveEvent(
  event: Partial<ChoirEvent> & { title: string; slug: string; starts_at: string },
  tiers: Omit<TicketTier, "event_id">[],
): Promise<void> {
  if (!supabase) {
    const list = read(DEMO_EVENTS, seedEvents);
    const id = event.id || crypto.randomUUID();
    const next: ChoirEvent = {
      id,
      slug: event.slug,
      title: event.title,
      tagline: event.tagline || "",
      description: event.description || "",
      starts_at: event.starts_at,
      ends_at: event.ends_at || null,
      venue: event.venue || "",
      city: event.city || "Nakuru",
      county: event.county || "Nakuru",
      location_notes: event.location_notes || "",
      cover_image_url: event.cover_image_url || "/images/choir-main.jpg",
      status: event.status || "published",
      is_free: event.is_free ?? false,
      featured: event.featured ?? false,
      external_ticket_url: event.external_ticket_url || null,
      ticket_tiers: tiers.map((t, i) => ({
        ...t,
        id: t.id || crypto.randomUUID(),
        event_id: id,
        sort_order: t.sort_order ?? i,
        active: t.active ?? true,
        perks: t.perks || [],
        description: t.description || "",
        capacity: t.capacity ?? null,
      })),
    };
    const idx = list.findIndex((e) => e.id === id);
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    write(DEMO_EVENTS, list);
    clearDataCache("events");
    return;
  }

  const payload = {
    slug: event.slug,
    title: event.title,
    tagline: event.tagline || "",
    description: event.description || "",
    starts_at: event.starts_at,
    ends_at: event.ends_at || null,
    venue: event.venue || "",
    city: event.city || "Nakuru",
    county: event.county || "Nakuru",
    location_notes: event.location_notes || "",
    cover_image_url: event.cover_image_url || null,
    status: event.status || "published",
    is_free: event.is_free ?? false,
    featured: event.featured ?? false,
    external_ticket_url: event.external_ticket_url || null,
  };

  let eventId = event.id;
  if (eventId) {
    const { error } = await supabase.from("events").update(payload).eq("id", eventId);
    if (error) throw error;
    await supabase.from("ticket_tiers").delete().eq("event_id", eventId);
  } else {
    const { data, error } = await supabase.from("events").insert(payload).select("id").single();
    if (error || !data) throw error || new Error("Insert failed");
    eventId = data.id;
  }

  if (tiers.length) {
    const { error } = await supabase.from("ticket_tiers").insert(
      tiers.map((t, i) => ({
        event_id: eventId,
        name: t.name,
        description: t.description || "",
        price_kes: t.price_kes,
        capacity: t.capacity,
        perks: t.perks || [],
        sort_order: t.sort_order ?? i,
        active: t.active ?? true,
      })),
    );
    if (error) throw error;
  }
  clearDataCache("events");
}

export async function adminDeleteEvent(id: string) {
  if (!supabase) {
    write(
      DEMO_EVENTS,
      read(DEMO_EVENTS, seedEvents).filter((e) => e.id !== id),
    );
    clearDataCache("events");
    return;
  }
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  clearDataCache("events");
}

export async function adminListGallery(): Promise<GalleryItem[]> {
  if (!supabase) return read(DEMO_GALLERY, seedGallery);
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as GalleryItem[];
}

export async function adminSaveGalleryItem(item: Partial<GalleryItem> & { image_url: string }) {
  if (!supabase) {
    const list = read(DEMO_GALLERY, seedGallery);
    const next: GalleryItem = {
      id: item.id || crypto.randomUUID(),
      title: item.title || "",
      caption: item.caption || "",
      image_url: item.image_url,
      category: item.category || "general",
      published: item.published ?? true,
      sort_order: item.sort_order ?? list.length + 1,
      taken_at: item.taken_at || null,
    };
    const idx = list.findIndex((g) => g.id === next.id);
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    write(DEMO_GALLERY, list);
    clearDataCache("gallery");
    return;
  }

  if (item.id) {
    const { error } = await supabase.from("gallery_items").update(item).eq("id", item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("gallery_items").insert({
      title: item.title || "",
      caption: item.caption || "",
      image_url: item.image_url,
      category: item.category || "general",
      published: item.published ?? true,
      sort_order: item.sort_order ?? 0,
      taken_at: item.taken_at || null,
    });
    if (error) throw error;
  }
  clearDataCache("gallery");
}

export async function adminDeleteGalleryItem(id: string) {
  if (!supabase) {
    write(
      DEMO_GALLERY,
      read(DEMO_GALLERY, seedGallery).filter((g) => g.id !== id),
    );
    clearDataCache("gallery");
    return;
  }
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw error;
  clearDataCache("gallery");
}

export async function adminListFundraisers(): Promise<Fundraiser[]> {
  if (!supabase) return read(DEMO_FUNDS, seedFundraisers);
  const { data, error } = await supabase.from("fundraisers").select("*").order("created_at", {
    ascending: false,
  });
  if (error) throw error;
  return data as Fundraiser[];
}

export async function adminSaveFundraiser(
  fund: Partial<Fundraiser> & { title: string; slug: string; kind: Fundraiser["kind"] },
) {
  if (!supabase) {
    const list = read(DEMO_FUNDS, seedFundraisers);
    const next: Fundraiser = {
      id: fund.id || crypto.randomUUID(),
      slug: fund.slug,
      title: fund.title,
      subtitle: fund.subtitle || "",
      story: fund.story || "",
      kind: fund.kind,
      goal_kes: fund.goal_kes ?? null,
      raised_kes: fund.raised_kes ?? 0,
      show_progress: fund.show_progress ?? false,
      cover_image_url: fund.cover_image_url || "/images/choir-main.jpg",
      active: fund.active ?? true,
      event_id: fund.event_id || null,
      starts_at: fund.starts_at || null,
      ends_at: fund.ends_at || null,
    };
    const idx = list.findIndex((f) => f.id === next.id);
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    write(DEMO_FUNDS, list);
    clearDataCache("fundraisers");
    return;
  }

  const payload = {
    slug: fund.slug,
    title: fund.title,
    subtitle: fund.subtitle || "",
    story: fund.story || "",
    kind: fund.kind,
    goal_kes: fund.goal_kes ?? null,
    raised_kes: fund.raised_kes ?? 0,
    show_progress: fund.show_progress ?? false,
    cover_image_url: fund.cover_image_url || null,
    active: fund.active ?? true,
    event_id: fund.event_id || null,
    starts_at: fund.starts_at || null,
    ends_at: fund.ends_at || null,
  };

  if (fund.id) {
    const { error } = await supabase.from("fundraisers").update(payload).eq("id", fund.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("fundraisers").insert(payload);
    if (error) throw error;
  }
  clearDataCache("fundraisers");
}

export async function adminListOrders(): Promise<TicketOrder[]> {
  if (!supabase) {
    return read(DEMO_ORDERS, [] as TicketOrder[]);
  }
  const { data, error } = await supabase
    .from("ticket_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as TicketOrder[];
}

export async function adminUploadImage(
  bucket: "gallery" | "events" | "fundraisers",
  file: File,
): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    // Demo: store as object URL note — for persistence use data URL (small files)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
  }

  const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
