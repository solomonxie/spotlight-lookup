import { TurboModule, TurboModuleRegistry } from 'react-native';
import type { Double, UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  isAvailable(): boolean;
  /** Empty string when nothing is pending; the wrapper turns that into null. */
  takePendingOpen(): string;
  indexItems(items: Array<UnsafeObject>): Promise<void>;
  deleteItems(ids: Array<string>): Promise<void>;
  deleteDomains(domains: Array<string>): Promise<void>;
  deleteAll(): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: Double): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SpotlightIndex');
