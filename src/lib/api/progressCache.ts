export type CachedTopicProgress = {
  topicId: string;
  completedBlockIds: string[];
  currentBlockId: string;
  stepIndex: number;
};

type CacheState = {
  progress: Record<string, CachedTopicProgress>;
  checkInToday: boolean;
  regulateToday: boolean;
};

let cache: CacheState | null = null;

export function clearProgressCache(): void {
  cache = null;
}

export function hydrateProgressCache(state: {
  progress: CachedTopicProgress[];
  checkInToday: boolean;
  regulateToday: boolean;
}): void {
  cache = {
    progress: Object.fromEntries(state.progress.map((p) => [p.topicId, p])),
    checkInToday: state.checkInToday,
    regulateToday: state.regulateToday,
  };
}

export function getCachedTopicProgress(
  topicId: string,
): CachedTopicProgress | null {
  return cache?.progress[topicId] ?? null;
}

export function setCachedTopicProgress(progress: CachedTopicProgress): void {
  if (!cache) {
    cache = { progress: {}, checkInToday: false, regulateToday: false };
  }
  cache.progress[progress.topicId] = progress;
}

export function apiCheckInToday(): boolean {
  return cache?.checkInToday ?? false;
}

export function apiRegulateToday(): boolean {
  return cache?.regulateToday ?? false;
}

export function setApiCheckInToday(done: boolean): void {
  if (cache) cache.checkInToday = done;
}

export function setApiRegulateToday(done: boolean): void {
  if (cache) cache.regulateToday = done;
}

export function isProgressCacheReady(): boolean {
  return cache !== null;
}
