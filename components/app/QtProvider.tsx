"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  loadMateCompleted,
  saveDraft,
  setMateCompleted as persistMateCompleted,
  setNickname as persistNickname,
  subscribe,
  wordStats,
  type DraftAnswers
} from "@/lib/qt-local";

type QtContextValue = {
  ready: boolean;
  todayKey: string;
  scripture: DailyScripture;
  answers: DraftAnswers;
  status: "draft" | "completed";
  completed: boolean;
  mateCompleted: boolean;
  isUnlocked: boolean;
  nickname: string;
  savedLabel: string;
  stats: { chars: number; answered: number };
  setAnswer: (key: QtQuestionKey, value: string) => void;
  completeToday: () => void;
  toggleMateDemo: () => void;
  setNickname: (name: string) => void;
};

const QtContext = createContext<QtContextValue | null>(null);

export function QtProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [todayKey, setTodayKey] = useState<string>(() => getTodayKey());
  const [answers, setAnswers] = useState<DraftAnswers>(emptyAnswers);
  const [status, setStatus] = useState<"draft" | "completed">("draft");
  const [mateCompleted, setMateCompleted] = useState(false);
  const [nickname, setNicknameState] = useState("친구");
  const [savedLabel, setSavedLabel] = useState("아직 저장 전");

  const scripture = useMemo(() => getScriptureForDate(todayKey), [todayKey]);

  const hydrate = useCallback((dateKey: string) => {
    const draft = loadDraft(dateKey);
    setAnswers(draft?.answers ?? emptyAnswers());
    setStatus(draft?.status ?? "draft");
    setMateCompleted(loadMateCompleted(dateKey));
    setNicknameState(getNickname());
    if (draft?.updatedAt) {
      setSavedLabel(`${formatTime(draft.updatedAt)} 저장됨`);
    } else {
      setSavedLabel("아직 저장 전");
    }
  }, []);

  useEffect(() => {
    let currentKey = getTodayKey();
    setTodayKey(currentKey);
    hydrate(currentKey);
    setReady(true);

    // 자정을 넘겨 날짜가 바뀌면 오늘 본문/기록도 갱신
    const interval = window.setInterval(() => {
      const nextKey = getTodayKey();
      if (nextKey !== currentKey) {
        currentKey = nextKey;
        setTodayKey(nextKey);
        hydrate(nextKey);
      }
    }, 60_000);

    const unsubscribe = subscribe(() => setNicknameState(getNickname()));
    return () => {
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [hydrate]);

  const setAnswer = useCallback(
    (key: QtQuestionKey, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        const saved = saveDraft(todayKey, { answers: next });
        setSavedLabel(`${formatTime(saved.updatedAt)} 자동 저장됨`);
        return next;
      });
    },
    [todayKey]
  );

  const completeToday = useCallback(() => {
    setStatus("completed");
    saveDraft(todayKey, {
      status: "completed",
      completedAt: new Date().toISOString()
    });
    setSavedLabel(`${formatTime(new Date().toISOString())} 완료됨`);
  }, [todayKey]);

  const toggleMateDemo = useCallback(() => {
    setMateCompleted((prev) => {
      const next = !prev;
      persistMateCompleted(todayKey, next);
      return next;
    });
  }, [todayKey]);

  const setNickname = useCallback((name: string) => {
    persistNickname(name);
    setNicknameState(name.trim() || "친구");
  }, []);

  const value = useMemo<QtContextValue>(() => {
    const completed = status === "completed";
    return {
      ready,
      todayKey,
      scripture,
      answers,
      status,
      completed,
      mateCompleted,
      isUnlocked: completed && mateCompleted,
      nickname,
      savedLabel,
      stats: wordStats(answers),
      setAnswer,
      completeToday,
      toggleMateDemo,
      setNickname
    };
  }, [
    ready,
    todayKey,
    scripture,
    answers,
    status,
    mateCompleted,
    nickname,
    savedLabel,
    setAnswer,
    completeToday,
    toggleMateDemo,
    setNickname
  ]);

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
