import { TurboModule, TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  /** Resolves with `{ name, text }`, or null when the picker is dismissed. */
  pickTextFile(): Promise<UnsafeObject | null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('TextFilePicker');
