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
  getScriptureByExactDate,
  getTodayKey,
  scriptures,
  type DailyScripture,
  type QtQuestionKey
} from "@/lib/scriptures";
import {
  emptyAnswers,
  getNickname,
  getSelectedScriptureDate,
  loadRoomSettings,
  loadDraft,
  saveRoomSettings,
  saveDraft,
  setSelectedScriptureDate,
  setNickname as persistNickname,
  subscribe,
  wordStats,
  type DraftAnswers,
  type PassageSelection,
  type RoomSettings
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
  scriptureOptions: DailyScripture[];
  selectedScriptureDate: string;
  roomSettings: RoomSettings;
  setAnswer: (key: QtQuestionKey, value: string) => void;
  completeToday: () => void;
  setNickname: (name: string) => void;
  selectScripture: (date: string) => void;
  updateRoomSettings: (settings: RoomSettings) => void;
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
  const [selectedScriptureDate, setSelectedScriptureDateState] = useState<string>(() =>
    getTodayKey()
  );
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(() =>
    loadRoomSettings(getTodayKey())
  );

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
      const settings = loadRoomSettings(key);
      const storedScriptureDate = getSelectedScriptureDate(key);
      setTodayKey(key);
      setNicknameState(getNickname());
      setRoomSettings(settings);

      if (isRemote && account.userId) {
        setMode("remote");
        try {
          await migrateLocalDrafts(account.userId);

          const remoteScripture = await getRemoteScripture(key);
          if (cancelled) return;
          const selectedScripture = storedScriptureDate
            ? getScriptureByExactDate(storedScriptureDate)
            : null;
          const selectedBySettings = resolveScriptureFromSettings(key, settings);
          const resolved = selectedBySettings ?? selectedScripture ?? remoteScripture ?? getScriptureForDate(key);
          setScripture(resolved);
          setSelectedScriptureDateState(resolved.date);

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
          const selectedScripture = storedScriptureDate
            ? getScriptureByExactDate(storedScriptureDate)
            : null;
          const selectedBySettings = resolveScriptureFromSettings(key, settings);
          const resolved = selectedBySettings ?? selectedScripture ?? getScriptureForDate(key);
          setScripture(resolved);
          setSelectedScriptureDateState(resolved.date);
          hydrateLocal(key);
          setSavedLabel("동기화 실패 · 로컬 저장");
        }
      } else {
        setMode("guest");
        setRemoteEntryId(null);
        const selectedScripture = storedScriptureDate
          ? getScriptureByExactDate(storedScriptureDate)
          : null;
        const selectedBySettings = resolveScriptureFromSettings(key, settings);
        const resolved = selectedBySettings ?? selectedScripture ?? getScriptureForDate(key);
        setScripture(resolved);
        setSelectedScriptureDateState(resolved.date);
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

  const selectScripture = useCallback(
    (date: string) => {
      const next = getScriptureByExactDate(date);
      if (!next) return;
      setSelectedScriptureDate(todayKey, date);
      setSelectedScriptureDateState(date);
      setScripture(next);
      setSavedLabel("선택한 본문으로 변경됨");
    },
    [todayKey]
  );

  const updateRoomSettings = useCallback(
    (settings: RoomSettings) => {
      saveRoomSettings(settings);
      setRoomSettings(settings);
      const selectedBySettings = resolveScriptureFromSettings(todayKey, settings);
      if (selectedBySettings) {
        setScripture(selectedBySettings);
        setSelectedScriptureDateState(selectedBySettings.date);
      } else {
        const fallback = getScriptureForDate(todayKey);
        setScripture(fallback);
        setSelectedScriptureDateState(fallback.date);
      }
      setSavedLabel("큐티 설정이 저장됨");
    },
    [todayKey]
  );

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
      scriptureOptions: scriptures,
      selectedScriptureDate,
      roomSettings,
      setAnswer,
      completeToday,
      setNickname,
      selectScripture,
      updateRoomSettings
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
      selectedScriptureDate,
      roomSettings,
      setAnswer,
      completeToday,
      setNickname,
      selectScripture,
      updateRoomSettings
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

function resolveScriptureFromSettings(
  todayKey: string,
  settings: RoomSettings
): DailyScripture | null {
  if (settings.method === "recommended") return null;
  if (settings.method === "sequence") return null;
  return passageToScripture(todayKey, settings.passage);
}

function passageToScripture(todayKey: string, passage: PassageSelection): DailyScripture {
  const reference =
    passage.startVerse === passage.endVerse
      ? `${passage.book} ${passage.chapter}:${passage.startVerse}`
      : `${passage.book} ${passage.chapter}:${passage.startVerse}-${passage.endVerse}`;

  return {
    date: todayKey,
    book: passage.book,
    reference,
    title: "직접 선택한 말씀",
    focusVerse: `${reference} 본문을 읽고 오늘 마음에 남는 말씀을 기록해보세요.`,
    verses: [
      {
        no: passage.startVerse,
        text: "선택한 범위의 성경 본문을 읽고, 가장 마음에 남는 구절을 아래 QT 기록에 남겨보세요."
      }
    ],
    questions: {
      heart_verse: "가장 마음에 남는 구절은 무엇이고, 왜 그런가요?",
      message: "오늘 이 말씀을 통해 하나님이 내게 주시는 마음은 무엇인가요?",
      practice: "이 말씀을 오늘 삶에서 어떻게 실천할 수 있을까요?",
      prayer: "이 말씀을 붙들고 어떤 기도를 드리고 싶나요?"
    }
  };
}
