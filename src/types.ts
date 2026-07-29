export type EventStatus = "draft" | "published" | "cancelled";
export type FundraiserKind = "ongoing_support" | "campaign";
export type OrderStatus = "pending" | "confirmed" | "cancelled" | "refunded";
export type DonationStatus = "pending" | "confirmed" | "failed";

export type TicketTier = {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price_kes: number;
  capacity: number | null;
  perks: string[];
  sort_order: number;
  active: boolean;
};

export type ChoirEvent = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  venue: string;
  city: string;
  county: string;
  location_notes: string;
  cover_image_url: string | null;
  status: EventStatus;
  is_free: boolean;
  featured: boolean;
  external_ticket_url: string | null;
  ticket_tiers?: TicketTier[];
};

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  event_date: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  items?: GalleryItem[];
};

export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  category: string;
  published: boolean;
  sort_order: number;
  taken_at: string | null;
  album_id: string | null;
};

export type Fundraiser = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  story: string;
  kind: FundraiserKind;
  goal_kes: number | null;
  raised_kes: number;
  show_progress: boolean;
  cover_image_url: string | null;
  active: boolean;
  event_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export type TicketOrderInput = {
  event_id: string;
  tier_id: string;
  quantity: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_city?: string;
  buyer_county?: string;
  buyer_country?: string;
  age_range?: string;
  heard_about?: string;
  notes?: string;
};

export type TicketOrder = TicketOrderInput & {
  id: string;
  status: OrderStatus;
  amount_kes: number;
  confirmation_code: string;
  created_at: string;
};

export type DonationInput = {
  fundraiser_id: string;
  amount_kes: number;
  donor_name: string;
  donor_email?: string;
  donor_phone: string;
  donor_city?: string;
  donor_county?: string;
  message?: string;
};

export type AttendeeAnalytics = {
  city: string;
  county: string;
  count: number;
};
