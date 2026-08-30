"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Lock,
  Save,
  Share2,
  Unlock,
  Waves
} from "lucide-react";
import {
  history,
  mobileNav,
  navItems,
  notifications,
  PageKey,
  qtQuestions,
  scripture,
  statusCards,
  weekDays
} from "@/lib/data";
import { completeQtEntry, ensureQtEntry, getTodayScripture, saveQtAnswers } from "@/lib/qt-api";
import { supabase } from "@/lib/supabase";

type Answers = Record<number, string>;

const emptyAnswers: Answers = {
  0: "",
  1: "",
  2: "",
  3: ""
};

export function CuringShell() {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [savedAt, setSavedAt] = useState("아직 저장 전");
  const [completed, setCompleted] = useState(false);
  const [mateCompleted, setMateCompleted] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [qtEntryId, setQtEntryId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState("로컬 저장");

  const isUnlocked = completed && mateCompleted;
  const pageTitle = navItems.find((item) => item.key === activePage)?.label ?? "홈";
  const wordCount = useMemo(
    () => Object.values(answers).join(" ").trim().split(/\s+/).filter(Boolean).length,
    [answers]
  );

  useEffect(() => {
    const raw = window.localStorage.getItem("curing.qt.answers");
    const done = window.localStorage.getItem("curing.qt.completed");
    if (raw) setAnswers(JSON.parse(raw) as Answers);
    if (done) setCompleted(done === "true");
  }, []);

  useEffect(() => {
    if (!supabase) return;

    async function prepareQtEntry() {
      const { data } = await supabase!.auth.getUser();
      if (!data.user) return;

      const todayScripture = await getTodayScripture();
      if (!todayScripture) {
        setSyncStatus("오늘 말씀 DB 없음");
        return;
      }

      const entry = await ensureQtEntry(data.user.id, todayScripture.id);
      if (entry) {
        setQtEntryId(entry.id);
        setCompleted(entry.status === "completed");
        setSyncStatus("Supabase 연결됨");
      }
    }

    prepareQtEntry().catch(() => setSyncStatus("DB 연결 확인 필요"));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem("curing.qt.answers", JSON.stringify(answers));
      const stamp = new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
      setSavedAt(`${stamp} 자동 저장됨`);
      if (qtEntryId) {
        saveQtAnswers(qtEntryId, answers)
          .then(() => setSyncStatus("Supabase 저장됨"))
          .catch(() => setSyncStatus("Supabase 저장 실패"));
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [answers, qtEntryId]);

  useEffect(() => {
    window.localStorage.setItem("curing.qt.completed", String(completed));
  }, [completed]);

  async function handleCompleteQt() {
    setCompleted(true);
    if (!qtEntryId) return;

    try {
      await completeQtEntry(qtEntryId, wordCount);
      setSyncStatus("QT 완료 저장됨");
    } catch {
      setSyncStatus("완료 저장 실패");
    }
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_292px]">
        <aside className="hidden border-r border-white/80 bg-white/70 px-4 py-5 shadow-soft backdrop-blur-xl lg:block">
          <Brand />
          <nav className="mt-7 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePage(item.key)}
                  className={`flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition ${
                    selected ? "bg-ocean-700 text-white shadow-lg shadow-ocean-700/15" : "text-ocean-900 hover:bg-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-3xl border border-ocean-100/80 bg-white/70 p-4 text-sm leading-7 text-ocean-800">
            <Waves className="mb-3 h-5 w-5 text-ocean-500" />
            오늘은 말씀을 읽고,
            <br />
            하나만 기록해도 충분해요.
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-7">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ocean-600">{pageTitle}</p>
              <h1 className="mt-1 text-xl font-bold text-ocean-950 sm:text-2xl">어서오세요, 소원님</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-2 text-sm font-semibold text-ocean-800 shadow-soft backdrop-blur">
              <Clock3 className="h-4 w-4 text-ocean-500" />
              오늘 QT 10분
            </div>
          </header>

          {activePage === "home" && (
            <HomeView
              completed={completed}
              isUnlocked={isUnlocked}
              onNavigate={setActivePage}
              onStart={() => setActivePage("workspace")}
            />
          )}
          {activePage === "scripture" && (
            <ScriptureView fontSize={fontSize} onFontSize={setFontSize} onStart={() => setActivePage("workspace")} />
          )}
          {activePage === "workspace" && (
            <WorkspaceView
              answers={answers}
              completed={completed}
              savedAt={savedAt}
              syncStatus={syncStatus}
              setAnswers={setAnswers}
              wordCount={wordCount}
              onComplete={handleCompleteQt}
            />
          )}
          {activePage === "mate" && (
            <MateView
              completed={completed}
              isUnlocked={isUnlocked}
              mateCompleted={mateCompleted}
              onMateComplete={() => setMateCompleted(true)}
            />
          )}
          {activePage === "archive" && <ArchiveView />}
        </main>

        <RightSidebar completed={completed} isUnlocked={isUnlocked} onNavigate={setActivePage} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-ocean-100 bg-white/95 px-2 py-2 shadow-soft backdrop-blur lg:hidden">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const selected = activePage === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActivePage(item.key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold ${
                selected ? "bg-ocean-600 text-white" : "text-ocean-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ocean-700 text-white shadow-lg shadow-ocean-700/20">
        <Waves className="h-6 w-6" />
      </div>
      <div>
        <p className="text-lg font-black text-ocean-950">CURING</p>
        <p className="text-xs font-semibold text-ocean-500">QT Workspace</p>
      </div>
    </div>
  );
}

function HomeView({
  completed,
  isUnlocked,
  onNavigate,
  onStart
}: {
  completed: boolean;
  isUnlocked: boolean;
  onNavigate: (page: PageKey) => void;
  onStart: () => void;
}) {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur lg:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ocean-500 via-sunshine to-coral" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold text-ocean-700">
              오늘의 말씀 · {scripture.date}
            </p>
            <h2 className="max-w-2xl text-[26px] font-black leading-tight text-ocean-950">{scripture.title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ocean-800">"{scripture.highlight}"</p>
            <p className="mt-3 text-sm font-bold text-ocean-500">{scripture.reference}</p>
          </div>
          <OceanTile />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white shadow-lg shadow-ocean-700/20 transition hover:bg-ocean-800"
          >
            QT 작성하기
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("scripture")}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-ocean-100 bg-white px-4 text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
          >
            말씀만 읽기
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {statusCards.map((card) => {
          const isToday = card.label === "오늘 QT";
          const isMate = card.label === "친구 QT";
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigate(isMate ? "mate" : isToday ? "workspace" : "archive")}
              className="rounded-3xl border border-white/90 bg-white/85 p-4 text-left shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
            >
              <p className="text-xs font-bold text-ocean-500">{card.label}</p>
              <p className="mt-2 text-lg font-black text-ocean-950">
                {isToday && completed ? "완료" : isMate && isUnlocked ? "공개됨" : card.value}
              </p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <TodayPriority completed={completed} isUnlocked={isUnlocked} onNavigate={onNavigate} />
        <RecentList />
      </section>
    </div>
  );
}

function OceanTile() {
  return (
    <div className="relative min-h-40 overflow-hidden rounded-[24px] border border-white/70 bg-gradient-to-b from-ocean-50 via-ocean-100 to-ocean-300 shadow-inner">
      <div className="absolute inset-x-0 bottom-0 h-20 bg-ocean-600/15" />
      <div className="absolute inset-x-0 bottom-8 h-px bg-white/70" />
      <span className="absolute bottom-7 left-7 h-8 w-16 rounded-[50%] bg-coral/85 shadow-lg shadow-coral/20" />
      <span className="absolute bottom-11 right-9 h-14 w-8 rounded-full bg-ocean-800/15" />
      <span className="absolute right-6 top-5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-ocean-700">
        calm
      </span>
      <Waves className="absolute bottom-5 left-1/2 h-16 w-16 -translate-x-1/2 text-white/80" />
    </div>
  );
}

function TodayPriority({
  completed,
  isUnlocked,
  onNavigate
}: {
  completed: boolean;
  isUnlocked: boolean;
  onNavigate: (page: PageKey) => void;
}) {
  const items = [
    {
      title: "오늘 말씀 읽기",
      description: scripture.reference,
      done: true,
      page: "scripture" as PageKey
    },
    {
      title: "내 QT 작성하기",
      description: completed ? "완료됨" : "아직 작성 중",
      done: completed,
      page: "workspace" as PageKey
    },
    {
      title: "친구 QT 확인",
      description: isUnlocked ? "서로의 묵상이 열렸어요" : "둘 다 완료하면 열려요",
      done: isUnlocked,
      page: "mate" as PageKey
    }
  ];

  return (
    <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
      <h2 className="text-lg font-black text-ocean-950">오늘의 우선순위</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onNavigate(item.page)}
            className="flex w-full items-center gap-3 rounded-2xl border border-ocean-100/70 bg-white p-4 text-left transition hover:bg-ocean-50"
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                item.done ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-500"
              }`}
            >
              <Check className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-ocean-950">{item.title}</span>
              <span className="mt-1 block text-sm font-semibold text-ocean-600">{item.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-ocean-500" />
          </button>
        ))}
      </div>
    </section>
  );
}

function ScriptureView({
  fontSize,
  onFontSize,
  onStart
}: {
  fontSize: number;
  onFontSize: (size: number) => void;
  onStart: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean-500">{scripture.date}</p>
          <h2 className="mt-2 text-2xl font-black text-ocean-950">{scripture.reference}</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ocean-100/70 bg-white px-4 py-3">
          <span className="text-sm font-bold text-ocean-700">글자</span>
          <input
            aria-label="Font size"
            type="range"
            min="15"
            max="21"
            value={fontSize}
            onChange={(event) => onFontSize(Number(event.target.value))}
          />
          <Bookmark className="h-4 w-4 text-ocean-600" />
        </div>
      </div>
      <article className="mx-auto mt-7 max-w-3xl">
        <p className="rounded-3xl border border-ocean-100/70 bg-ocean-50/70 p-5 text-base font-bold leading-8 text-ocean-900">
          {scripture.highlight}
        </p>
        <p className="mt-7 leading-9 text-ocean-950" style={{ fontSize }}>
          {scripture.text}
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white shadow-lg shadow-ocean-700/20 transition hover:bg-ocean-800"
        >
          묵상 시작하기
          <ChevronRight className="h-4 w-4" />
        </button>
      </article>
    </section>
  );
}

function WorkspaceView({
  answers,
  completed,
  savedAt,
  syncStatus,
  setAnswers,
  wordCount,
  onComplete
}: {
  answers: Answers;
  completed: boolean;
  savedAt: string;
  syncStatus: string;
  setAnswers: (answers: Answers) => void;
  wordCount: number;
  onComplete: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
        <p className="text-sm font-bold text-ocean-500">{scripture.reference}</p>
        <h2 className="mt-2 text-xl font-black text-ocean-950">{scripture.title}</h2>
        <p className="mt-5 rounded-3xl border border-ocean-100/70 bg-ocean-50/70 p-4 text-base font-semibold leading-8 text-ocean-900">
          {scripture.highlight}
        </p>
        <p className="mt-4 leading-8 text-ocean-800">{scripture.text}</p>
      </section>

      <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-ocean-950">나의 묵상</h2>
            <p className="mt-1 text-sm font-semibold text-ocean-500">
              {savedAt} · {syncStatus} · {wordCount} words
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ocean-100/70 bg-white px-3 py-2 text-sm font-bold text-ocean-700">
            <Save className="h-4 w-4" />
            자동 저장
          </span>
        </div>
        <div className="space-y-4">
          {qtQuestions.map((question, index) => (
            <label key={question} className="block">
              <span className="text-sm font-bold text-ocean-900">
                {index + 1}. {question}
              </span>
              <textarea
                value={answers[index] ?? ""}
                onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })}
                className="mt-2 min-h-28 w-full rounded-3xl border border-ocean-100 bg-white/80 p-4 leading-7 text-ocean-950 outline-none transition focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-700/5"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={completed}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white shadow-lg shadow-ocean-700/20 transition hover:bg-ocean-800 disabled:bg-ocean-300 disabled:shadow-none sm:w-auto"
        >
          <Check className="h-4 w-4" />
          {completed ? "QT 완료됨" : "QT 완료하기"}
        </button>
      </section>
    </div>
  );
}

function MateView({
  completed,
  isUnlocked,
  mateCompleted,
  onMateComplete
}: {
  completed: boolean;
  isUnlocked: boolean;
  mateCompleted: boolean;
  onMateComplete: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
        <h2 className="text-xl font-black text-ocean-950">친구 QT</h2>
        <p className="mt-2 leading-7 text-ocean-700">MVP는 1:1 QT Mate만 지원합니다.</p>
        <div className="mt-5 rounded-3xl border border-ocean-100/70 bg-ocean-50/70 p-4">
          <p className="text-sm font-bold text-ocean-700">초대 링크</p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value="https://curing.app/invite/quiet-sea-237"
              className="min-w-0 flex-1 rounded-2xl border border-ocean-100 bg-white px-4 text-sm text-ocean-800"
            />
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-ocean-700 text-white shadow-lg shadow-ocean-700/20"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-5">
          <p className="text-sm font-bold text-ocean-900">함께하는 요일</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weekDays.map((day, index) => (
              <button
                key={day}
                type="button"
                className={`h-10 w-10 rounded-2xl text-sm font-black ${
                  index < 3 ? "bg-ocean-700 text-white shadow-lg shadow-ocean-700/15" : "bg-white text-ocean-700"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onMateComplete}
          disabled={mateCompleted}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-coral px-4 text-sm font-bold text-white disabled:bg-ocean-200"
        >
          <Check className="h-4 w-4" />
          친구 완료 상태 데모
        </button>
      </section>
      <MutualUnlock completed={completed} isUnlocked={isUnlocked} mateCompleted={mateCompleted} />
    </div>
  );
}

function MutualUnlock({
  completed,
  isUnlocked,
  mateCompleted
}: {
  completed: boolean;
  isUnlocked: boolean;
  mateCompleted: boolean;
}) {
  return (
      <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean-500">Mutual Unlock</p>
          <h2 className="mt-1 text-xl font-black text-ocean-950">서로 완료 후 공개</h2>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${isUnlocked ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-600"}`}>
          {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <StatusPill label="나" done={completed} />
        <StatusPill label="친구" done={mateCompleted} />
      </div>
      <p className="mt-5 rounded-3xl border border-ocean-100/70 bg-ocean-50/70 p-4 leading-7 text-ocean-800">
        {isUnlocked
          ? "서로의 QT가 공개되었습니다. 조용히 읽고 공감할 수 있어요."
          : "친구도 QT를 완료하면 서로의 묵상이 자동으로 열립니다."}
      </p>
    </section>
  );
}

function StatusPill({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${done ? "border-ocean-700 bg-ocean-700 text-white" : "border-ocean-100/70 bg-white text-ocean-700"}`}>
      <p className="text-xs font-bold opacity-75">{label}</p>
      <p className="mt-1 text-base font-black">{done ? "완료" : "작성 중"}</p>
    </div>
  );
}

function ArchiveView() {
  return (
    <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-ocean-950">QT 기록</h2>
        <input
          placeholder="말씀, 키워드, 날짜로 검색"
          className="h-10 min-w-0 rounded-2xl border border-ocean-100 bg-white/80 px-4 text-sm outline-none focus:border-ocean-400"
        />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {history.map((item) => (
          <button key={item.date} className="rounded-3xl border border-ocean-100 bg-white/70 p-4 text-left transition hover:bg-ocean-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-ocean-950">{item.date}</p>
              <span className={`h-3 w-3 rounded-full ${item.complete ? "bg-ocean-500" : "bg-sunshine"}`} />
            </div>
            <p className="mt-3 text-sm font-bold text-ocean-500">{item.reference}</p>
            <p className="mt-1 text-sm text-ocean-700">{item.status}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function RecentList() {
  return (
    <section className="rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur">
      <h2 className="text-lg font-black text-ocean-950">최근 기록</h2>
      <div className="mt-4 space-y-3">
        {history.slice(0, 3).map((item) => (
          <button
            key={item.date}
            className="flex w-full items-center justify-between rounded-2xl border border-ocean-100/70 bg-white p-3 text-left text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
          >
            <span>
              <span className="block">{item.reference}</span>
              <span className="mt-1 block text-xs text-ocean-500">{item.date}</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ))}
      </div>
    </section>
  );
}

function RightSidebar({
  completed,
  isUnlocked,
  onNavigate
}: {
  completed: boolean;
  isUnlocked: boolean;
  onNavigate: (page: PageKey) => void;
}) {
  return (
    <aside className="hidden border-l border-white/80 bg-white/45 px-4 py-5 backdrop-blur-xl xl:block">
      <section className="rounded-[24px] border border-white/90 bg-white/85 p-4 shadow-soft">
        <h3 className="font-black text-ocean-950">오늘 상태</h3>
        <div className="mt-4 space-y-3">
          <StatusPill label="오늘 QT" done={completed} />
          <StatusPill label="친구 공개" done={isUnlocked} />
        </div>
        <button
          type="button"
          onClick={() => onNavigate("workspace")}
          className="mt-4 h-10 w-full rounded-2xl bg-ocean-700 text-sm font-bold text-white shadow-lg shadow-ocean-700/20 transition hover:bg-ocean-800"
        >
          이어서 작성
        </button>
      </section>

      <section className="mt-5 rounded-[24px] border border-white/90 bg-white/85 p-4 shadow-soft">
        <h3 className="font-black text-ocean-950">알림</h3>
        <div className="mt-4 space-y-2">
          {notifications.slice(0, 2).map((notice) => (
            <p key={notice} className="flex gap-2 rounded-2xl border border-ocean-100/70 bg-white p-3 text-sm font-semibold leading-6 text-ocean-700">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" />
              {notice}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[24px] border border-white/90 bg-white/85 p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ocean-50 text-ocean-600">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-ocean-950">QT Mate</p>
            <p className="text-sm font-semibold text-ocean-500">지수 · 이번 주 3 / 3</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("mate")}
          className="mt-4 h-10 w-full rounded-2xl border border-ocean-100/70 bg-white text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
        >
          친구 QT 보기
        </button>
      </section>
    </aside>
  );
}
