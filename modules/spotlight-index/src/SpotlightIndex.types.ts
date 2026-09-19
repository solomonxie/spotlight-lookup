export type SpotlightItem = {
  id: string;
  domain: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  keywords?: string[];
};

export type SpotlightOpenEvent = {
  id: string;
};
