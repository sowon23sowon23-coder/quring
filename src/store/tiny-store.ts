import { useSyncExternalStore } from 'react';

/**
 * zustand 없이 쓰는 30줄짜리 전역 스토어.
 * 나중에 zustand로 갈아끼울 거면 API가 같아서 import만 바꾸면 된다.
 */
export function create<T extends object>(
  init: (set: (patch: Partial<T>) => void) => T
): () => T {
  let state: T;
  const listeners = new Set<() => void>();

  const set = (patch: Partial<T>) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };

  state = init(set);

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  return function useStore(): T {
    return useSyncExternalStore(
      subscribe,
      () => state,
      () => state
    );
  };
}
