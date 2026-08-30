"use client";

import { ReactNode, useEffect, useState } from "react";
import { Loader2, LogIn, Waves } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

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
    return <SupabaseSetup onDemo={() => setDemoMode(true)} />;
  }

  if (supabase && !session) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

function SupabaseSetup({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-[24px] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ocean-700 text-white">
          <Waves className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-ocean-950">CURING 연결 준비</h1>
        <p className="mt-3 leading-7 text-ocean-700">
          Supabase 프로젝트 값을 `.env.local`에 넣으면 로그인과 저장 기능이 실제 DB로 연결됩니다.
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
          데모 화면 보기
        </button>
      </section>
    </div>
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
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-[24px] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ocean-700 text-white">
          <Waves className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-ocean-950">
          {mode === "sign-in" ? "로그인" : "회원가입"}
        </h1>
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
            placeholder="비밀번호"
            className="h-11 w-full rounded-2xl border border-ocean-100 bg-white px-4 text-sm outline-none focus:border-ocean-400"
          />
        </div>
        {message && <p className="mt-4 rounded-2xl bg-ocean-50 p-3 text-sm font-semibold text-ocean-800">{message}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting || !email || password.length < 6}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ocean-700 text-sm font-bold text-white shadow-lg shadow-ocean-700/20 disabled:bg-ocean-300 disabled:shadow-none"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {mode === "sign-in" ? "로그인" : "가입하기"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 w-full text-sm font-bold text-ocean-700"
        >
          {mode === "sign-in" ? "계정 만들기" : "이미 계정이 있어요"}
        </button>
      </section>
    </div>
  );
}
