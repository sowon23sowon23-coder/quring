"use client";

import { ReactNode, useEffect, useState } from "react";
import { BookOpen, CheckCircle2, HeartHandshake, Loader2, LogIn, PenLine, Waves } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

const steps = [
  {
    title: "오늘 말씀을 읽어요",
    description: "짧게 읽고 마음에 남는 구절 하나를 붙잡습니다.",
    icon: BookOpen
  },
  {
    title: "내 QT를 작성해요",
    description: "질문에 따라 묵상, 적용, 기도를 차분히 남깁니다.",
    icon: PenLine
  },
  {
    title: "친구와 함께 열어요",
    description: "둘 다 완료하면 서로의 묵상이 공개됩니다.",
    icon: HeartHandshake
  }
];

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ocean-50">
        <Loader2 className="h-8 w-8 animate-spin text-ocean-700" />
      </div>
    );
  }

  if (!supabase && !demoMode) {
    return <EntryScreen showSetupNotice onDemo={() => setDemoMode(true)} />;
  }

  if (supabase && !session) {
    return <EntryScreen />;
  }

  return <>{children}</>;
}

function EntryScreen({
  showSetupNotice = false,
  onDemo
}: {
  showSetupNotice?: boolean;
  onDemo?: () => void;
}) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-[28px] border border-white/90 bg-white/80 p-6 shadow-soft backdrop-blur lg:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ocean-700 text-white shadow-lg shadow-ocean-700/20">
              <Waves className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black text-ocean-950">CURING</p>
              <p className="text-sm font-semibold text-ocean-500">Daily QT Workspace</p>
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <p className="text-sm font-bold text-ocean-600">처음 오셨나요?</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-ocean-950 sm:text-4xl">
              오늘은 말씀을 읽고, 한 가지 마음만 기록해보세요.
            </h1>
            <p className="mt-4 max-w-xl leading-8 text-ocean-700">
              CURING은 말씀 묵상을 어렵게 만들지 않습니다. 오늘의 말씀을 읽고, QT를 저장하고,
              친구와 같은 날의 묵상을 조용히 나누는 공간입니다.
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-3xl border border-ocean-100/80 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ocean-50 text-ocean-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-ocean-300">0{index + 1}</span>
                  </div>
                  <p className="mt-4 text-sm font-black text-ocean-950">{step.title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-ocean-600">{step.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-7 rounded-3xl border border-ocean-100/80 bg-ocean-50/70 p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ocean-700" />
              <p className="text-sm font-semibold leading-7 text-ocean-800">
                로그인하면 오늘 QT가 자동 저장되고, 나중에 기록에서 다시 볼 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <div>
          {showSetupNotice ? <SupabaseSetup onDemo={onDemo} /> : <AuthForm />}
        </div>
      </div>
    </div>
  );
}

function SupabaseSetup({ onDemo }: { onDemo?: () => void }) {
  return (
    <section className="rounded-[28px] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur">
      <h2 className="text-xl font-black text-ocean-950">연결 설정이 필요해요</h2>
      <p className="mt-3 leading-7 text-ocean-700">
        Supabase 값이 들어가면 로그인과 저장 기능이 실제 DB로 연결됩니다.
      </p>
      <div className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50 p-4 text-sm font-semibold leading-7 text-ocean-800">
        NEXT_PUBLIC_SUPABASE_URL
        <br />
        NEXT_PUBLIC_SUPABASE_ANON_KEY
      </div>
      <button
        type="button"
        onClick={onDemo}
        className="mt-5 h-11 w-full rounded-2xl bg-ocean-700 text-sm font-bold text-white shadow-lg shadow-ocean-700/20"
      >
        데모 화면 먼저 보기
      </button>
    </section>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!supabase) return;
    setIsSubmitting(true);
    setMessage("");

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "sign-up" && !result.data.session) {
      setMessage("가입 확인 메일을 확인해주세요.");
    }

    setIsSubmitting(false);
  }

  return (
    <section className="rounded-[28px] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur">
      <p className="text-sm font-bold text-ocean-600">시작하기</p>
      <h2 className="mt-2 text-2xl font-black text-ocean-950">
        {mode === "sign-in" ? "로그인하고 이어서 쓰기" : "새 계정 만들기"}
      </h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-ocean-600">
        이메일과 비밀번호만 있으면 오늘 QT를 바로 저장할 수 있어요.
      </p>

      <div className="mt-5 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일"
          className="h-11 w-full rounded-2xl border border-ocean-100 bg-white px-4 text-sm outline-none focus:border-ocean-400"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호 6자 이상"
          className="h-11 w-full rounded-2xl border border-ocean-100 bg-white px-4 text-sm outline-none focus:border-ocean-400"
        />
      </div>

      {message && <p className="mt-4 rounded-2xl bg-ocean-50 p-3 text-sm font-semibold text-ocean-800">{message}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting || !email || password.length < 6}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ocean-700 text-sm font-bold text-white shadow-lg shadow-ocean-700/20 transition hover:bg-ocean-800 disabled:bg-ocean-300 disabled:shadow-none"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {mode === "sign-in" ? "로그인" : "가입하기"}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        className="mt-4 w-full text-sm font-bold text-ocean-700"
      >
        {mode === "sign-in" ? "처음이라면 계정 만들기" : "이미 계정이 있어요"}
      </button>
    </section>
  );
}
