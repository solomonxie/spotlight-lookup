export type SpotlightItem = {
  /** Unique across the whole index; used to route a Spotlight tap back to a record. */
  id: string;
  /** Groups items so a whole collection can be dropped from the index at once. */
  domain: string;
  /** Headword shown as the Spotlight result title. */
  title: string;
  /** First line under the title — pronunciation, part of speech, deck name. */
  subtitle?: string;
  /** Remaining preview text — the definition or the back of a card. */
  body?: string;
  /** Extra strings Spotlight should match against, such as inflections or tags. */
  keywords?: string[];
};

export type SpotlightOpenEvent = {
  id: string;
};

export type SpotlightIndexModuleEvents = {
  onSpotlightOpen: (event: SpotlightOpenEvent) => void;
};
