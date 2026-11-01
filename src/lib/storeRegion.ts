export type StoreRegion = 'us' | 'cn';

let region: StoreRegion = 'us';

/** Set once from the native root props (Info.plist `AppStoreRegion`). */
export function setStoreRegion(value: string | undefined): void {
  region = value === 'cn' ? 'cn' : 'us';
}

/** App Store region this install was built for (`make device STORE=cn`); `us` covers Canada/US. */
export function storeRegion(): StoreRegion {
  return region;
}
