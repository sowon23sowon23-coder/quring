"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Lock,
  MessageCircle,
  Save,
  Send,
  Share2,
  Sparkles,
  Unlock,
  Waves
} from "lucide-react";
import {
  growthMilestones,
  history,
  mobileNav,
  navItems,
  notifications,
  PageKey,
  qtQuestions,
  quickActions,
  scripture,
  statusCards,
  weekDays
} from "@/lib/data";

type Answers = Record<number, string>;

const starterAnswers: Answers = {
  0: "",
  1: "",
  2: "",
  3: ""
};

export function CuringShell() {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [answers, setAnswers] = useState<Answers>(starterAnswers);
  const [savedAt, setSavedAt] = useState("아직 저장 전");
  const [completed, setCompleted] = useState(false);
  const [mateCompleted, setMateCompleted] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const wordCount = useMemo(
    () => Object.values(answers).join(" ").trim().split(/\s+/).filter(Boolean).length,
    [answers]
  );
  const isUnlocked = completed && mateCompleted;

  useEffect(() => {
    const raw = window.localStorage.getItem("curing.qt.answers");
    const done = window.localStorage.getItem("curing.qt.completed");
    if (raw) setAnswers(JSON.parse(raw) as Answers);
    if (done) setCompleted(done === "true");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem("curing.qt.answers", JSON.stringify(answers));
      const stamp = new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
      setSavedAt(`${stamp} 자동 저장됨`);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem("curing.qt.completed", String(completed));
  }, [completed]);

  const pageTitle = navItems.find((item) => item.key === activePage)?.label ?? "홈";

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto grid min-h-screen w-full max-w-[1720px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="hidden border-r border-white/80 bg-white/70 px-5 py-6 shadow-soft backdrop-blur lg:block">
          <Brand />
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePage(item.key)}
                  className={`flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-left text-sm font-semibold transition ${
                    selected
                      ? "bg-ocean-600 text-white shadow-lg shadow-ocean-700/15"
                      : "text-ocean-900 hover:bg-ocean-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-3xl border border-ocean-100 bg-ocean-50/80 p-5 text-sm leading-7 text-ocean-800">
            <Waves className="mb-3 h-6 w-6 text-ocean-500" />
            하나님과 함께하는
            <br />
            오늘의 묵상은
            <br />
            깊은 바다가 됩니다.
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ocean-600">{pageTitle}</p>
              <h1 className="mt-1 text-xl font-bold tracking-normal text-ocean-950 sm:text-2xl">
                어서오세요, 소원님
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white bg-white/75 px-4 py-2 text-sm font-semibold text-ocean-800 shadow-soft">
              <Clock3 className="h-4 w-4 text-ocean-500" />
              오늘 말씀으로 하루를 채워볼까요?
            </div>
          </header>

          {activePage === "home" && (
            <HomeView
              onStart={() => setActivePage("workspace")}
              onNavigate={setActivePage}
              completed={completed}
            />
          )}
          {activePage === "scripture" && (
            <ScriptureView fontSize={fontSize} onFontSize={setFontSize} onStart={() => setActivePage("workspace")} />
          )}
          {activePage === "workspace" && (
            <WorkspaceView
              answers={answers}
              setAnswers={setAnswers}
              savedAt={savedAt}
              wordCount={wordCount}
              completed={completed}
              onComplete={() => setCompleted(true)}
            />
          )}
          {activePage === "mate" && (
            <MateView
              completed={completed}
              mateCompleted={mateCompleted}
              isUnlocked={isUnlocked}
              onMateComplete={() => setMateCompleted(true)}
            />
          )}
          {activePage === "archive" && <ArchiveView />}
          {activePage === "journey" && <JourneyView />}
          {activePage === "notifications" && <NotificationView />}
          {activePage === "profile" && <ProfileView />}
          {activePage === "admin" && <AdminView />}
        </main>

        <RightSidebar onNavigate={setActivePage} completed={completed} isUnlocked={isUnlocked} />
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
      <div className="grid h-12 w-12 place-items-center rounded-3xl bg-ocean-600 text-white shadow-lg shadow-ocean-700/20">
        <Waves className="h-7 w-7" />
      </div>
      <div>
        <p className="text-lg font-black tracking-normal text-ocean-950">CURING</p>
        <p className="text-xs font-semibold text-ocean-500">QT Workspace</p>
      </div>
    </div>
  );
}

function HomeView({
  onStart,
  onNavigate,
  completed
}: {
  onStart: () => void;
  onNavigate: (page: PageKey) => void;
  completed: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] border border-white bg-white shadow-soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:p-8">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-ocean-50 px-3 py-1 text-sm font-bold text-ocean-700">
              오늘의 말씀 · {scripture.date}
            </p>
            <h2 className="max-w-2xl text-2xl font-black tracking-normal text-ocean-950 sm:text-3xl">
              {scripture.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ocean-800">"{scripture.highlight}"</p>
            <p className="mt-3 text-sm font-bold text-ocean-500">{scripture.reference}</p>
            <button
              type="button"
              onClick={onStart}
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-ocean-600 px-5 text-sm font-bold text-white shadow-lg shadow-ocean-700/20"
            >
              오늘 QT 시작하기
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <OceanIllustration />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statusCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onNavigate(card.label.includes("친구") ? "mate" : "workspace")}
            className={`rounded-3xl border border-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 ${card.tone}`}
          >
            <p className="text-sm font-bold opacity-75">{card.label}</p>
            <p className="mt-3 text-xl font-black">{card.label === "오늘 QT" && completed ? "완료" : card.value}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <ArchivePreview />
        <MatePrivacyPanel completed={completed} mateCompleted={false} isUnlocked={false} compact />
      </section>
    </div>
  );
}

function OceanIllustration() {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[24px] bg-gradient-to-b from-ocean-100 to-ocean-300 p-5">
      <div className="absolute inset-x-0 bottom-0 h-28 bg-ocean-500/20" />
      <div className="absolute bottom-8 left-8 h-12 w-24 rounded-[50%] bg-coral/70" />
      <div className="absolute bottom-12 right-10 h-20 w-10 rounded-full bg-ocean-700/20" />
      <div className="absolute right-8 top-8 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-ocean-700">
        Calm sea
      </div>
      <div className="absolute left-8 top-20 flex gap-3">
        <span className="h-8 w-14 rounded-[50%] bg-sunshine/90" />
        <span className="mt-8 h-7 w-12 rounded-[50%] bg-lavender/80" />
      </div>
      <Waves className="absolute bottom-8 left-1/2 h-24 w-24 -translate-x-1/2 text-white/70" />
    </div>
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
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean-500">{scripture.date}</p>
          <h2 className="mt-2 text-2xl font-black text-ocean-950">{scripture.reference}</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-ocean-50 px-4 py-3">
          <span className="text-sm font-bold text-ocean-700">글자</span>
          <input
            aria-label="Font size"
            type="range"
            min="16"
            max="24"
            value={fontSize}
            onChange={(event) => onFontSize(Number(event.target.value))}
          />
          <Bookmark className="h-5 w-5 text-ocean-600" />
        </div>
      </div>
      <article className="mx-auto mt-8 max-w-3xl">
        <p className="rounded-3xl bg-ocean-50 p-5 text-lg font-bold leading-8 text-ocean-900">
          {scripture.highlight}
        </p>
        <p className="mt-8 leading-9 text-ocean-950" style={{ fontSize }}>
          {scripture.text}
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-ocean-600 px-5 text-sm font-bold text-white"
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
  setAnswers,
  savedAt,
  wordCount,
  completed,
  onComplete
}: {
  answers: Answers;
  setAnswers: (answers: Answers) => void;
  savedAt: string;
  wordCount: number;
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
        <p className="text-sm font-bold text-ocean-500">{scripture.reference}</p>
        <h2 className="mt-2 text-xl font-black text-ocean-950">{scripture.title}</h2>
        <p className="mt-6 rounded-3xl bg-ocean-50 p-5 text-base font-semibold leading-8 text-ocean-900">
          {scripture.highlight}
        </p>
        <p className="mt-5 leading-8 text-ocean-800">{scripture.text}</p>
      </section>

      <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-ocean-950">나의 묵상</h2>
            <p className="mt-1 text-sm font-semibold text-ocean-500">{savedAt} · {wordCount} words</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-ocean-50 px-3 py-2 text-sm font-bold text-ocean-700">
            <Save className="h-4 w-4" />
            자동 저장
          </span>
        </div>
        <div className="space-y-5">
          {qtQuestions.map((question, index) => (
            <label key={question} className="block">
              <span className="text-sm font-bold text-ocean-900">{index + 1}. {question}</span>
              <textarea
                value={answers[index] ?? ""}
                onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })}
                className="mt-2 min-h-32 w-full rounded-3xl border border-ocean-100 bg-ocean-50/60 p-4 leading-7 text-ocean-950 outline-none transition focus:border-ocean-400 focus:bg-white"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-5 text-sm font-bold text-white disabled:bg-ocean-300 sm:w-auto"
          disabled={completed}
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
  mateCompleted,
  isUnlocked,
  onMateComplete
}: {
  completed: boolean;
  mateCompleted: boolean;
  isUnlocked: boolean;
  onMateComplete: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
        <h2 className="text-xl font-black text-ocean-950">QT Mate</h2>
        <p className="mt-2 leading-7 text-ocean-700">MVP는 1:1 관계만 지원합니다. 함께 묵상할 요일을 정하고 초대 링크를 공유하세요.</p>
        <div className="mt-6 rounded-3xl bg-ocean-50 p-4">
          <p className="text-sm font-bold text-ocean-700">초대 링크</p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value="https://curing.app/invite/quiet-sea-237"
              className="min-w-0 flex-1 rounded-2xl border border-ocean-100 bg-white px-4 text-sm text-ocean-800"
            />
            <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl bg-ocean-600 text-white" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-bold text-ocean-900">함께하는 요일</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weekDays.map((day, index) => (
              <button
                key={day}
                type="button"
                className={`h-11 w-11 rounded-2xl text-sm font-black ${
                  index < 3 ? "bg-ocean-600 text-white" : "bg-ocean-50 text-ocean-700"
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
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-coral px-5 text-sm font-bold text-white disabled:bg-ocean-200"
        >
          <Check className="h-4 w-4" />
          친구 완료 상태 데모
        </button>
      </section>
      <MatePrivacyPanel completed={completed} mateCompleted={mateCompleted} isUnlocked={isUnlocked} />
    </div>
  );
}

function MatePrivacyPanel({
  completed,
  mateCompleted,
  isUnlocked,
  compact = false
}: {
  completed: boolean;
  mateCompleted: boolean;
  isUnlocked: boolean;
  compact?: boolean;
}) {
  return (
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean-500">Mutual Unlock</p>
          <h2 className="mt-1 text-xl font-black text-ocean-950">서로 완료 후 공개</h2>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${isUnlocked ? "bg-ocean-600 text-white" : "bg-ocean-50 text-ocean-600"}`}>
          {isUnlocked ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatusPill label="나" done={completed} />
        <StatusPill label="친구" done={mateCompleted} />
      </div>
      <div className="mt-6 rounded-3xl bg-ocean-50 p-5 leading-7 text-ocean-800">
        {isUnlocked
          ? "서로의 QT가 공개되었습니다. 조용히 읽고 공감이나 함께 기도를 남길 수 있어요."
          : "친구도 QT를 완료하면 서로의 묵상이 자동으로 열립니다."}
      </div>
      {!compact && isUnlocked && (
        <div className="mt-5 space-y-4">
          <p className="text-sm font-black text-ocean-950">친구가 받은 마음</p>
          <p className="rounded-3xl border border-ocean-100 p-4 leading-7 text-ocean-800">
            겸손하게 함께 걷는다는 말이 오늘 마음에 오래 남았어.
          </p>
          <div className="flex gap-2">
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-50 px-4 text-sm font-bold text-ocean-700">
              <Heart className="h-4 w-4" /> 공감
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-50 px-4 text-sm font-bold text-ocean-700">
              <Send className="h-4 w-4" /> 함께 기도
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-50 px-4 text-sm font-bold text-ocean-700">
              <MessageCircle className="h-4 w-4" /> 댓글
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusPill({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${done ? "bg-ocean-600 text-white" : "bg-ocean-50 text-ocean-700"}`}>
      <p className="text-sm font-bold opacity-75">{label}</p>
      <p className="mt-1 text-base font-black">{done ? "완료" : "작성 중"}</p>
    </div>
  );
}

function ArchiveView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <ArchivePreview />
      <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black text-ocean-950">2026.08.30</h2>
        <p className="mt-2 text-sm font-bold text-ocean-500">미가 6:6-8</p>
        <div className="mt-5 space-y-3">
          <button className="flex h-12 w-full items-center justify-between rounded-2xl bg-ocean-50 px-4 text-sm font-bold text-ocean-800">
            오늘 QT <ChevronRight className="h-4 w-4" />
          </button>
          <button className="flex h-12 w-full items-center justify-between rounded-2xl bg-ocean-50 px-4 text-sm font-bold text-ocean-800">
            친구 QT <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function ArchivePreview() {
  return (
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-ocean-950">QT 기록</h2>
        <input
          placeholder="말씀, 키워드, 날짜로 검색"
          className="h-11 min-w-0 rounded-2xl border border-ocean-100 bg-ocean-50 px-4 text-sm outline-none focus:border-ocean-400"
        />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {history.map((item) => (
          <button key={item.date} className="rounded-3xl border border-ocean-100 p-4 text-left transition hover:bg-ocean-50">
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

function JourneyView() {
  return (
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
      <h2 className="text-xl font-black text-ocean-950">나의 바다</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {["전체 QT 86", "함께한 말씀 24", "연속 QT 23", "친구와 QT 12"].map((metric) => (
          <div key={metric} className="rounded-3xl bg-ocean-50 p-5">
            <p className="text-lg font-black text-ocean-950">{metric}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 min-h-72 overflow-hidden rounded-[24px] bg-gradient-to-b from-ocean-100 to-ocean-400 p-8">
        <div className="flex h-56 items-end justify-around">
          <span className="h-14 w-24 rounded-[50%] bg-sunshine/90" />
          <span className="h-24 w-12 rounded-full bg-coral/80" />
          <span className="h-16 w-28 rounded-[50%] bg-lavender/90" />
          <span className="h-28 w-10 rounded-full bg-ocean-800/20" />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {growthMilestones.map(([day, reward]) => (
          <span key={day} className="rounded-full bg-ocean-50 px-4 py-2 text-sm font-bold text-ocean-700">
            {day} · {reward}
          </span>
        ))}
      </div>
    </section>
  );
}

function NotificationView() {
  return (
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
      <h2 className="text-xl font-black text-ocean-950">알림</h2>
      <div className="mt-5 space-y-3">
        {notifications.map((notice) => (
          <div key={notice} className="flex items-center gap-3 rounded-3xl bg-ocean-50 p-4 text-ocean-800">
            <Bell className="h-5 w-5 text-ocean-600" />
            <p className="font-semibold">{notice}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfileView() {
  return (
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
      <h2 className="text-xl font-black text-ocean-950">마이페이지</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {["프로필 이미지", "닉네임", "이메일", "QT Mate", "QT 요일", "알림 설정", "비밀번호 변경", "로그아웃"].map((item) => (
          <button key={item} className="flex h-14 items-center justify-between rounded-2xl bg-ocean-50 px-4 text-sm font-bold text-ocean-800">
            {item}
            <ChevronRight className="h-4 w-4" />
          </button>
        ))}
      </div>
    </section>
  );
}

function AdminView() {
  return (
    <section className="rounded-[24px] border border-white bg-white p-6 shadow-soft">
      <h2 className="text-xl font-black text-ocean-950">Admin Scripture</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {["Date", "Bible Book", "Chapter", "Verse"].map((field) => (
          <input key={field} placeholder={field} className="h-12 rounded-2xl border border-ocean-100 bg-ocean-50 px-4 outline-none focus:border-ocean-400" />
        ))}
      </div>
      <textarea placeholder="Bible Text" className="mt-4 min-h-36 w-full rounded-3xl border border-ocean-100 bg-ocean-50 p-4 outline-none focus:border-ocean-400" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {["QT Question 1", "QT Question 2", "QT Question 3", "Prayer Question"].map((field) => (
          <input key={field} placeholder={field} className="h-12 rounded-2xl border border-ocean-100 bg-ocean-50 px-4 outline-none focus:border-ocean-400" />
        ))}
      </div>
      <button className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-ocean-600 px-5 text-sm font-bold text-white">
        <Save className="h-4 w-4" />
        등록
      </button>
    </section>
  );
}

function RightSidebar({
  onNavigate,
  completed,
  isUnlocked
}: {
  onNavigate: (page: PageKey) => void;
  completed: boolean;
  isUnlocked: boolean;
}) {
  return (
    <aside className="hidden border-l border-white/80 bg-white/55 px-5 py-6 backdrop-blur xl:block">
      <section className="rounded-[24px] border border-white bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ocean-50 text-ocean-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-ocean-950">함께하는 QT Mate</p>
            <p className="text-sm font-semibold text-ocean-500">지수 · 이번 주 3 / 3</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("mate")}
          className="mt-4 h-11 w-full rounded-2xl bg-ocean-600 text-sm font-bold text-white"
        >
          친구 QT 보기
        </button>
      </section>

      <section className="mt-5 rounded-[24px] border border-white bg-white p-5 shadow-soft">
        <h3 className="font-black text-ocean-950">오늘 알림</h3>
        <div className="mt-4 space-y-3">
          {notifications.map((notice) => (
            <p key={notice} className="rounded-2xl bg-ocean-50 p-3 text-sm font-semibold leading-6 text-ocean-700">
              {notice}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[24px] border border-white bg-white p-5 shadow-soft">
        <h3 className="font-black text-ocean-950">Quick Menu</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.page)}
                className="flex min-h-24 flex-col items-start justify-between rounded-2xl bg-ocean-50 p-3 text-left text-sm font-bold text-ocean-800"
              >
                <Icon className="h-5 w-5" />
                {action.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-[24px] border border-white bg-white p-5 shadow-soft">
        <h3 className="font-black text-ocean-950">최근 QT</h3>
        <div className="mt-4 space-y-3">
          {history.slice(0, 3).map((item) => (
            <button key={item.reference} className="flex w-full items-center justify-between rounded-2xl bg-ocean-50 p-3 text-left text-sm font-bold text-ocean-800">
              {item.reference}
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[24px] bg-ocean-600 p-5 text-white shadow-soft">
        <p className="text-sm font-bold opacity-80">상태</p>
        <p className="mt-2 text-base font-black">{completed ? "오늘 QT 완료" : "오늘 QT 작성 중"}</p>
        <p className="mt-1 text-sm opacity-80">{isUnlocked ? "친구 QT 공개됨" : "친구 QT 잠금"}</p>
      </section>
    </aside>
  );
}
