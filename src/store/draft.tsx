import { create } from './tiny-store';

/**
 * 큐티 작성 중 상태 (verse → write 로 넘어가며 공유).
 * 서버 저장 전 임시값이라 전역 스토어 하나면 충분하다.
 */
export type Draft = {
  picked: number[];
  a1: string;
  a2: string;
  a3: string;
};

export const emptyDraft: Draft = { picked: [], a1: '', a2: '', a3: '' };

export const useDraft = create<Draft & { set: (p: Partial<Draft>) => void; reset: () => void }>(
  (set) => ({
    ...emptyDraft,
    set: (p) => set(p),
    reset: () => set(emptyDraft),
  })
);
