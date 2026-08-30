"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  getScriptureForDate,
  getTodayKey,
  type DailyScripture,
  type QtQuestionKey
} from "@/lib/scriptures";
import {
  emptyAnswers,
  getNickname,
  loadDraft,
  saveDraft,
  setNickname as persistNickname,
  subscribe,
  wordStats,
  type DraftAnswers
} from "@/lib/qt-local";
import {
  completeEntry,
  ensureEntry,
  getRemoteScripture,
  remoteEnabled,
  saveAnswers
} from "@/lib/qt-remote";
import { migrateLocalDrafts } from "@/lib/qt-migrate";
import { useAccount } from "@/components/app/useAccount";

export type QtMode = "loading" | "guest" | "remote";

type QtContextValue = {
  mode: QtMode;
  ready: boolean;
  todayKey: string;
  scripture: DailyScripture;
  answers: DraftAnswers;
  status: "draft" | "completed";
  completed: boolean;
  remoteEntryId: string | null;
  nickname: string;
  savedLabel: string;
  stats: { chars: number; answered: number };
  setAnswer: (key: QtQuestionKey, value: string) => void;
  completeToday: () => void;
  setNickname: (name: string) => void;
};

const QtContext = createContext<QtContextValue | null>(null);

export function QtProvider({ children }: { children: ReactNode }) {
  const account = useAccount();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<QtMode>("loading");
  const [todayKey, setTodayKey] = useState<string>(() => getTodayKey());
  const [scripture, setScripture] = useState<DailyScripture>(() =>
    getScriptureForDate(getTodayKey())
  );
  const [answers, setAnswers] = useState<DraftAnswers>(emptyAnswers);
  const [status, setStatus] = useState<"draft" | "completed">("draft");
  const [remoteEntryId, setRemoteEntryId] = useState<string | null>(null);
  const [nickname, setNicknameState] = useState("친구");
  const [savedLabel, setSavedLabel] = useState("아직 저장 전");

  const saveTimer = useRef<number | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const isRemote = account.configured && Boolean(account.userId);

  const hydrateLocal = useCallback((dateKey: string) => {
    const draft = loadDraft(dateKey);
    setAnswers(draft?.answers ?? emptyAnswers());
    setStatus(draft?.status ?? "draft");
    setSavedLabel(draft?.updatedAt ? `${formatTime(draft.updatedAt)} 저장됨` : "아직 저장 전");
  }, []);

  // 계정 상태가 정해지면 모드 결정 + 오늘 데이터 로드
  useEffect(() => {
    if (account.loading) return;
    let cancelled = false;

    async function boot() {
      const key = getTodayKey();
      setTodayKey(key);
      setNicknameState(getNickname());

      if (isRemote && account.userId) {
        setMode("remote");
        try {
          await migrateLocalDrafts(account.userId);

          const remoteScripture = await getRemoteScripture(key);
          if (cancelled) return;
          const resolved = remoteScripture ?? getScriptureForDate(key);
          setScripture(resolved);

          const entry = await ensureEntry(account.userId, key);
          if (cancelled) return;
          if (entry) {
            setRemoteEntryId(entry.entry.id);
            setAnswers({ ...emptyAnswers(), ...entry.answers });
            setStatus(entry.entry.status);
            setSavedLabel(
              entry.entry.updated_at ? `${formatTime(entry.entry.updated_at)} 동기화됨` : "아직 저장 전"
            );
          } else {
            // DB에 오늘 본문이 없음 → 로컬로 폴백
            setRemoteEntryId(null);
            hydrateLocal(key);
            setSavedLabel("오늘 본문 미등록 · 로컬 저장");
          }
        } catch {
          setRemoteEntryId(null);
          setScripture(getScriptureForDate(key));
          hydrateLocal(key);
          setSavedLabel("동기화 실패 · 로컬 저장");
        }
      } else {
        setMode("guest");
        setRemoteEntryId(null);
        setScripture(getScriptureForDate(key));
        hydrateLocal(key);
      }

      if (!cancelled) setReady(true);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [account.loading, isRemote, account.userId, hydrateLocal]);

  // 닉네임 외부 변경 감지
  useEffect(() => subscribe(() => setNicknameState(getNickname())), []);

  // 자정을 지나 날짜가 바뀌면 새로고침으로 오늘 데이터를 다시 로드
  useEffect(() => {
    const startKey = getTodayKey();
    const interval = window.setInterval(() => {
      if (getTodayKey() !== startKey) window.location.reload();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const flushRemote = useCallback(() => {
    if (!remoteEntryId) return;
    saveAnswers(remoteEntryId, answersRef.current)
      .then(() => setSavedLabel(`${formatTime(new Date().toISOString())} 동기화됨`))
      .catch(() => setSavedLabel("동기화 실패 · 로컬 보관"));
  }, [remoteEntryId]);

  const setAnswer = useCallback(
    (key: QtQuestionKey, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        // 로컬은 항상 즉시 (오프라인 캐시)
        const saved = saveDraft(todayKey, { answers: next });
        setSavedLabel(
          mode === "remote" ? "입력 중…" : `${formatTime(saved.updatedAt)} 자동 저장됨`
        );
        return next;
      });

      if (mode === "remote") {
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(flushRemote, 700);
      }
    },
    [todayKey, mode, flushRemote]
  );

  const completeToday = useCallback(() => {
    setStatus("completed");
    saveDraft(todayKey, { status: "completed", completedAt: new Date().toISOString() });

    if (mode === "remote" && remoteEntryId) {
      const count = wordStats(answersRef.current).chars;
      Promise.resolve()
        .then(() => saveAnswers(remoteEntryId, answersRef.current))
        .then(() => completeEntry(remoteEntryId, count))
        .then(() => setSavedLabel("QT 완료 · 동기화됨"))
        .catch(() => setSavedLabel("완료 저장 실패"));
    } else {
      setSavedLabel(`${formatTime(new Date().toISOString())} 완료됨`);
    }
  }, [todayKey, mode, remoteEntryId]);

  const setNickname = useCallback((name: string) => {
    persistNickname(name);
    setNicknameState(name.trim() || "친구");
  }, []);

  const value = useMemo<QtContextValue>(
    () => ({
      mode,
      ready,
      todayKey,
      scripture,
      answers,
      status,
      completed: status === "completed",
      remoteEntryId,
      nickname,
      savedLabel,
      stats: wordStats(answers),
      setAnswer,
      completeToday,
      setNickname
    }),
    [
      mode,
      ready,
      todayKey,
      scripture,
      answers,
      status,
      remoteEntryId,
      nickname,
      savedLabel,
      setAnswer,
      completeToday,
      setNickname
    ]
  );

  return <QtContext.Provider value={value}>{children}</QtContext.Provider>;
}

export function useQt(): QtContextValue {
  const ctx = useContext(QtContext);
  if (!ctx) throw new Error("useQt must be used within <QtProvider>");
  return ctx;
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(
      new Date(iso)
    );
  } catch {
    return "";
  }
}

export { remoteEnabled };
