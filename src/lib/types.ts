export type BrandKit = {
  colors?: string[];
  fonts?: string[];
  tone?: string;
  pillars?: string[];
  logoSuggestion?: string;
  logoVariations?: string[];
};

export type CalendarPost = {
  day: string;
  platform: string;
  caption: string;
  imagePrompt: string;
  cta: string;
};

export type SalesCopy = {
  productDescription?: string;
  landingPageHeadline?: string;
  emailSequence?: string[];
  googleAd?: string;
  facebookAd?: string;
  tiktokScript?: string;
  shortVideoScript?: string;
};

export type Brand = {
  id: string;
  name: string;
  location: string | null;
  business_type: string | null;
  target_audience: string | null;
  language: string | null;
  questionnaire: { style?: string; website?: string } | null;
  brand_dna: BrandKit | null;
  created_at: string;
};

export type Generation = {
  id: string;
  brand_id: string;
  type: "brand_kit" | "calendar";
  content: BrandKit | { calendar: CalendarPost[]; salesCopy: SalesCopy };
  created_at: string;
};

export type Feedback = {
  id: string;
  brand_id: string;
  platform: string;
  campaign_name: string | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  engagement_rate: number | null;
  notes: string | null;
  created_at: string;
};

export type SocialConnection = {
  id: string;
  brand_id: string;
  provider: "meta";
  page_id: string;
  page_name: string | null;
  ig_business_id: string | null;
  ig_username: string | null;
  connected_at: string;
};

export type Publication = {
  id: string;
  brand_id: string;
  platform: "instagram" | "facebook";
  caption: string | null;
  asset_path: string | null;
  external_post_id: string | null;
  status: string;
  created_at: string;
};

export type Asset = {
  id: string;
  brand_id: string;
  storage_path: string;
  created_at: string;
};

export const PLATFORMS = ["Instagram", "LinkedIn", "TikTok", "Email", "Google Ads", "Facebook Ads"];
