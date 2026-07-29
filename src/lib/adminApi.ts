import type {
  ChoirEvent,
  Fundraiser,
  GalleryAlbum,
  GalleryItem,
  TicketOrder,
  TicketTier,
} from "../types";
import { clearDataCache } from "./dataCache";
import { seedEvents, seedFundraisers, seedGallery, seedGalleryAlbums } from "./seed";
import { isSupabaseConfigured, supabase } from "./supabase";

const DEMO_EVENTS = "eop_demo_events";
const DEMO_GALLERY = "eop_demo_gallery";
const DEMO_ALBUMS = "eop_demo_gallery_albums";
const DEMO_FUNDS = "eop_demo_fundraisers";
const DEMO_ORDERS = "eop_ticket_orders";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

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

export async function adminListGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (!supabase) return read(DEMO_ALBUMS, seedGalleryAlbums);
  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("event_date", { ascending: false });
  if (error) throw error;
  return (data as GalleryAlbum[]) ?? [];
}

export async function adminSaveGalleryAlbum(
  album: Partial<GalleryAlbum> & { title: string },
): Promise<GalleryAlbum> {
  const slug = album.slug || slugify(album.title) || `album-${Date.now()}`;
  const payload = {
    slug,
    title: album.title,
    description: album.description || "",
    event_date: album.event_date || null,
    cover_image_url: album.cover_image_url || null,
    published: album.published ?? true,
    sort_order: album.sort_order ?? 0,
  };

  if (!supabase) {
    const list = read(DEMO_ALBUMS, seedGalleryAlbums);
    const next: GalleryAlbum = {
      id: album.id || crypto.randomUUID(),
      ...payload,
    };
    const idx = list.findIndex((a) => a.id === next.id);
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    write(DEMO_ALBUMS, list);
    clearDataCache("gallery-albums");
    clearDataCache("gallery");
    return next;
  }

  if (album.id) {
    const { data, error } = await supabase
      .from("gallery_albums")
      .update(payload)
      .eq("id", album.id)
      .select("*")
      .single();
    if (error) throw error;
    clearDataCache("gallery-albums");
    clearDataCache("gallery");
    return data as GalleryAlbum;
  }

  const { data, error } = await supabase
    .from("gallery_albums")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  clearDataCache("gallery-albums");
  clearDataCache("gallery");
  return data as GalleryAlbum;
}

export async function adminDeleteGalleryAlbum(id: string) {
  if (!supabase) {
    write(
      DEMO_ALBUMS,
      read(DEMO_ALBUMS, seedGalleryAlbums).filter((a) => a.id !== id),
    );
    write(
      DEMO_GALLERY,
      read(DEMO_GALLERY, seedGallery).map((g) =>
        g.album_id === id ? { ...g, album_id: null } : g,
      ),
    );
    clearDataCache("gallery-albums");
    clearDataCache("gallery");
    return;
  }
  const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
  if (error) throw error;
  clearDataCache("gallery-albums");
  clearDataCache("gallery");
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

export async function adminSaveGalleryItem(
  item: Partial<GalleryItem> & { image_url: string },
) {
  if (!supabase) {
    const list = read(DEMO_GALLERY, seedGallery);
    const next: GalleryItem = {
      id: item.id || crypto.randomUUID(),
      title: item.title || "",
      caption: item.caption || "",
      image_url: item.image_url,
      category: item.category || "concerts",
      published: item.published ?? true,
      sort_order: item.sort_order ?? list.length + 1,
      taken_at: item.taken_at || null,
      album_id: item.album_id ?? null,
    };
    const idx = list.findIndex((g) => g.id === next.id);
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
    write(DEMO_GALLERY, list);
    clearDataCache("gallery");
    clearDataCache("gallery-albums");
    return;
  }

  const payload = {
    title: item.title || "",
    caption: item.caption || "",
    image_url: item.image_url,
    category: item.category || "concerts",
    published: item.published ?? true,
    sort_order: item.sort_order ?? 0,
    taken_at: item.taken_at || null,
    album_id: item.album_id ?? null,
  };

  if (item.id) {
    const { error } = await supabase
      .from("gallery_items")
      .update(payload)
      .eq("id", item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("gallery_items").insert(payload);
    if (error) throw error;
  }
  clearDataCache("gallery");
  clearDataCache("gallery-albums");
}

export async function adminDeleteGalleryItem(id: string) {
  if (!supabase) {
    write(
      DEMO_GALLERY,
      read(DEMO_GALLERY, seedGallery).filter((g) => g.id !== id),
    );
    clearDataCache("gallery");
    clearDataCache("gallery-albums");
    return;
  }
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw error;
  clearDataCache("gallery");
  clearDataCache("gallery-albums");
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
