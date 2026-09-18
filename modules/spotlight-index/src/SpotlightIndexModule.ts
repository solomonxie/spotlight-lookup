import { NativeModule, requireOptionalNativeModule } from 'expo';

import { SpotlightIndexModuleEvents } from './SpotlightIndex.types';

declare class SpotlightIndexNativeModule extends NativeModule<SpotlightIndexModuleEvents> {
  isAvailable(): boolean;
  takePendingOpen(): string | null;
  indexItems(items: unknown[]): Promise<void>;
  deleteItems(ids: string[]): Promise<void>;
  deleteDomains(domains: string[]): Promise<void>;
  deleteAll(): Promise<void>;
}

/** Null in Expo Go and on any platform without the native module compiled in. */
export default requireOptionalNativeModule<SpotlightIndexNativeModule>('SpotlightIndex');
