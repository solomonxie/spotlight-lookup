import { EventSubscription } from 'expo-modules-core';

import { SpotlightItem, SpotlightOpenEvent } from './src/SpotlightIndex.types';
import SpotlightIndexModule from './src/SpotlightIndexModule';

export * from './src/SpotlightIndex.types';

/**
 * False inside Expo Go, where Core Spotlight is not compiled in. Every call below
 * degrades to a no-op so the rest of the app can be developed against Expo Go.
 */
export function isSpotlightAvailable(): boolean {
  return SpotlightIndexModule?.isAvailable() ?? false;
}

export async function indexItems(items: SpotlightItem[]): Promise<void> {
  if (!SpotlightIndexModule || items.length === 0) return;
  await SpotlightIndexModule.indexItems(items);
}

export async function deleteItems(ids: string[]): Promise<void> {
  if (!SpotlightIndexModule || ids.length === 0) return;
  await SpotlightIndexModule.deleteItems(ids);
}

export async function deleteDomains(domains: string[]): Promise<void> {
  if (!SpotlightIndexModule || domains.length === 0) return;
  await SpotlightIndexModule.deleteDomains(domains);
}

export async function deleteAll(): Promise<void> {
  await SpotlightIndexModule?.deleteAll();
}

/** Identifier of a Spotlight result tapped before JS was listening; cleared once read. */
export function takePendingOpen(): string | null {
  return SpotlightIndexModule?.takePendingOpen() ?? null;
}

export function addOpenListener(
  listener: (event: SpotlightOpenEvent) => void
): EventSubscription | null {
  return SpotlightIndexModule?.addListener('onSpotlightOpen', listener) ?? null;
}
