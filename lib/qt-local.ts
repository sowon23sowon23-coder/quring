"use client";

import type { QtQuestionKey } from "@/lib/scriptures";
import { questionOrder } from "@/lib/scriptures";

const UID_KEY = "curing.uid";
const NICK_KEY = "curing.nickname";
const DRAFT_PREFIX = "curing.qt.";
const MATE_PREFIX = "curing.mate.";

export type DraftAnswers = Record<QtQuestionKey, string>;

export type DraftRecord = {
  date: string;
  answers: DraftAnswers;
  status: "draft" | "completed";
  updatedAt: string;
  completedAt?: string;
};

export const emptyAnswers = (): DraftAnswers => ({
  heart_verse: "",
  message: "",
  practice: "",
  prayer: ""
});

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `uid-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function getLocalUserId(): string {
  if (typeof window === "undefined") return "anon";
  let id = window.localStorage.getItem(UID_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(UID_KEY, id);
  }
  return id;
}

export function getNickname(): string {
  if (typeof window === "undefined") return "친구";
  return window.localStorage.getItem(NICK_KEY) || "친구";
}

export function setNickname(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NICK_KEY, name.trim() || "친구");
  emitChange();
}

function draftKey(date: string): string {
  return `${DRAFT_PREFIX}${getLocalUserId()}.${date}`;
}

export function loadDraft(date: string): DraftRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(draftKey(date));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DraftRecord>;
    return {
      date,
      answers: { ...emptyAnswers(), ...(parsed.answers ?? {}) },
      status: parsed.status === "completed" ? "completed" : "draft",
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      completedAt: parsed.completedAt
    };
  } catch {
    return null;
  }
}

export function saveDraft(date: string, patch: Partial<Omit<DraftRecord, "date">>): DraftRecord {
  const current = loadDraft(date) ?? {
    date,
    answers: emptyAnswers(),
    status: "draft" as const,
    updatedAt: new Date().toISOString()
  };

  const next: DraftRecord = {
    ...current,
    ...patch,
    answers: { ...current.answers, ...(patch.answers ?? {}) },
    date,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(draftKey(date), JSON.stringify(next));
    emitChange();
  }
  return next;
}

export function listDrafts(): DraftRecord[] {
  if (typeof window === "undefined") return [];
  const prefix = `${DRAFT_PREFIX}${getLocalUserId()}.`;
  const records: DraftRecord[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const date = key.slice(prefix.length);
    const record = loadDraft(date);
    if (record) records.push(record);
  }
  return records.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function wordStats(answers: DraftAnswers): { chars: number; answered: number } {
  const texts = questionOrder.map((key) => answers[key]?.trim() ?? "");
  const chars = texts.reduce((sum, text) => sum + text.replace(/\s/g, "").length, 0);
  const answered = texts.filter(Boolean).length;
  return { chars, answered };
}

// --- QT Mate 데모 상태 (로컬 전용) --------------------------------------------
// 실제 1:1 공개는 라이브 DB가 필요합니다. 로컬에서는 "친구도 완료" 상태를
// 수동으로 토글해 상호 공개 규칙을 확인할 수 있게만 해 둡니다.

function mateKey(date: string): string {
  return `${MATE_PREFIX}${getLocalUserId()}.${date}`;
}

export function loadMateCompleted(date: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(mateKey(date)) === "true";
}

export function setMateCompleted(date: string, value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(mateKey(date), String(value));
  emitChange();
}

// --- 변경 알림 --------------------------------------------------------------
const CHANGE_EVENT = "curing:local-change";

export function emitChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
