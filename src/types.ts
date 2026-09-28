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
  /** 0–100, CSS object-position X */
  cover_focus_x: number;
  /** 0–100, CSS object-position Y */
  cover_focus_y: number;
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

/** Full choir roster row (admin-managed). */
export type RosterMember = {
  id: string;
  name: string;
  section: string | null;
  sort_order: number;
  published: boolean;
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
  /** Soft-delete timestamp — row kept as backup when set */
  archived_at: string | null;
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

export type EnquiryType =
  | "invite"
  | "tickets"
  | "partnership"
  | "media"
  | "general";

export type ContactStatus =
  | "new"
  | "under_review"
  | "more_info"
  | "available"
  | "confirmed"
  | "declined"
  | "completed";

export type ContactSettings = {
  id: number;
  email: string;
  whatsapp: string;
  response_time: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  x_url: string;
};

export type ContactSubmission = {
  id: string;
  enquiry_type: EnquiryType;
  status: ContactStatus;
  full_name: string;
  phone: string;
  email: string;
  organisation: string;
  position_role: string;
  event_name: string;
  event_type: string;
  event_description: string;
  proposed_date: string | null;
  performance_time: string;
  town_venue: string;
  expected_length: string;
  expected_attendance: string;
  sound_system: "" | "yes" | "no" | "not_confirmed";
  sound_equipment: string;
  facilitation: string[];
  facilitation_details: string;
  programme_notes: string;
  theme_requests: string;
  additional_notes: string;
  attachment_url: string | null;
  ticket_event_id: string | null;
  ticket_event_title: string;
  ticket_reference: string;
  assistance_required: string;
  message: string;
  preferred_response: "" | "phone" | "whatsapp" | "email";
  admin_notes: string;
  created_at: string;
  updated_at?: string;
};
