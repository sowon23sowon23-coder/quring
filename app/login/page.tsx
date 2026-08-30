"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Waves } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/");

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("next");
    if (target && target.startsWith("/")) setNext(target);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
  }, [router, next]);

  async function submit() {
    if (!supabase) return;
    setBusy(true);
    setMessage("");

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "sign-up" && !result.data.session) {
      setMessage("가입 확인 메일을 확인해 주세요.");
    } else {
      router.replace(next);
      return;
    }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-ocean-600 hover:text-ocean-800">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          게스트로 계속 사용하기
        </Link>

        <div className="mt-4 rounded-3xl border border-ocean-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ocean-700 text-white">
              <Waves className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-base font-black text-ocean-950">CURING</p>
              <p className="text-xs font-semibold text-ocean-500">계정에 연결하기</p>
            </div>
          </div>

          {!supabase ? (
            <p className="mt-6 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-sm leading-7 text-ocean-800">
              아직 Supabase 연결이 설정되지 않았어요. 지금은 이 브라우저에만 기록이 저장됩니다.
              <br />
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 를 설정하면 계정 로그인이
              활성화됩니다.
            </p>
          ) : (
            <>
              <h1 className="mt-6 text-lg font-black text-ocean-950">
                {mode === "sign-in" ? "로그인" : "새 계정 만들기"}
              </h1>
              <p className="mt-1 text-sm text-ocean-600">
                로그인하면 기록이 계정에 저장되어 다른 기기에서도 이어집니다.
              </p>

              <div className="mt-4 space-y-2">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="이메일"
                  className="h-11 w-full rounded-2xl border border-ocean-200 bg-white px-4 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200"
                />
                <input
                  type="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호 (6자 이상)"
                  className="h-11 w-full rounded-2xl border border-ocean-200 bg-white px-4 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200"
                />
              </div>

              {message && (
                <p className="mt-3 rounded-2xl bg-ocean-50 p-3 text-sm font-semibold text-ocean-800">
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={busy || !email || password.length < 6}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ocean-700 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:bg-ocean-300"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {mode === "sign-in" ? "로그인" : "가입하기"}
              </button>

              <button
                type="button"
                onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
                className="mt-3 w-full text-sm font-bold text-ocean-700"
              >
                {mode === "sign-in" ? "처음이라면 계정 만들기" : "이미 계정이 있어요"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
