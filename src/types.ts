export type TicketTier = {
  id: string;
  name: string;
  priceKes: number;
  perks: string[];
};

export type ChoirEvent = {
  id: string;
  title: string;
  tagline: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  status: "upcoming" | "past" | "sold-out";
  image: string;
  description: string;
  ticketTiers: TicketTier[];
  externalTicketUrl?: string;
  featured?: boolean;
};

export type FundraiserMilestone = {
  label: string;
  amountKes: number;
};

export type Fundraiser = {
  id: string;
  title: string;
  subtitle: string;
  goalKes: number;
  raisedKes: number;
  currency: string;
  updatedAt: string;
  story: string;
  milestones: FundraiserMilestone[];
};

export type PaymentKind = "ticket" | "donation";

export type StkRequest = {
  phone: string;
  amount: number;
  kind: PaymentKind;
  reference: string;
  description: string;
};
