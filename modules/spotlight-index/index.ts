import { type EmitterSubscription, NativeEventEmitter } from 'react-native';

import NativeSpotlightIndex from './src/NativeSpotlightIndex';
import { SpotlightItem, SpotlightOpenEvent } from './src/SpotlightIndex.types';

export * from './src/SpotlightIndex.types';

const emitter = new NativeEventEmitter(NativeSpotlightIndex as never);

/** False where iOS refuses to index at all — low storage, or a device with Spotlight off. */
export function isSpotlightAvailable(): boolean {
  return NativeSpotlightIndex.isAvailable();
}

export async function indexItems(items: SpotlightItem[]): Promise<void> {
  if (items.length === 0) return;
  await NativeSpotlightIndex.indexItems(items);
}

export async function deleteItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await NativeSpotlightIndex.deleteItems(ids);
}

export async function deleteDomains(domains: string[]): Promise<void> {
  if (domains.length === 0) return;
  await NativeSpotlightIndex.deleteDomains(domains);
}

export async function deleteAll(): Promise<void> {
  await NativeSpotlightIndex.deleteAll();
}

/** Identifier of a Spotlight result tapped before JS was listening; cleared once read. */
export function takePendingOpen(): string | null {
  return NativeSpotlightIndex.takePendingOpen() || null;
}

export function addOpenListener(
  listener: (event: SpotlightOpenEvent) => void
): EmitterSubscription {
  return emitter.addListener('onSpotlightOpen', listener);
}
