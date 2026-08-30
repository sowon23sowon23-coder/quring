"use client";

import { listDrafts, wordStats } from "@/lib/qt-local";
import { completeEntry, ensureEntry, saveAnswers } from "@/lib/qt-remote";

const flagKey = (userId: string) => `curing.migrated.${userId}`;

export function alreadyMigrated(userId: string): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(flagKey(userId)) === "true";
}

function markMigrated(userId: string) {
  window.localStorage.setItem(flagKey(userId), "true");
}

/**
 * 게스트로 브라우저에 쌓인 로컬 기록을 로그인 계정으로 1회 이전합니다.
 * 원격에 이미 내용이 있는 날짜는 건드리지 않습니다(원격 우선).
 */
export async function migrateLocalDrafts(userId: string): Promise<number> {
  if (alreadyMigrated(userId)) return 0;

  let migrated = 0;
  for (const draft of listDrafts()) {
    const hasContent = Object.values(draft.answers).some((value) => value.trim());
    if (!hasContent && draft.status !== "completed") continue;

    try {
      const remote = await ensureEntry(userId, draft.date);
      if (!remote) continue; // 그 날 본문이 DB에 없으면 건너뜀

      const remoteHasContent = Object.values(remote.answers).some((value) => value.trim());
      if (remoteHasContent || remote.entry.status === "completed") continue;

      await saveAnswers(remote.entry.id, draft.answers);
      if (draft.status === "completed") {
        await completeEntry(remote.entry.id, wordStats(draft.answers).chars);
      }
      migrated += 1;
    } catch {
      // 개별 실패는 무시하고 계속 (다음 로그인에서 재시도되지 않도록 플래그는 아래에서 설정)
    }
  }

  markMigrated(userId);
  return migrated;
}
