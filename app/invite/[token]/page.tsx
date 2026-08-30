"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartHandshake, Loader2, Waves } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { acceptInvite, getInvitePreview } from "@/lib/qt-remote";

type Preview = { requester_nickname: string; status: string; is_self: boolean } | null;
type Phase = "loading" | "need-login" | "not-configured" | "ready" | "accepting" | "done" | "error";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [phase, setPhase] = useState<Phase>("loading");
  const [preview, setPreview] = useState<Preview>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabase) {
        setPhase("not-configured");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setPhase("need-login");
        return;
      }
      try {
        const result = await getInvitePreview(token);
        if (cancelled) return;
        if (!result) {
          setError("초대를 찾을 수 없어요. 링크를 다시 확인해 주세요.");
          setPhase("error");
          return;
        }
        setPreview(result);
        setPhase("ready");
      } catch {
        setError("초대 정보를 불러오지 못했어요.");
        setPhase("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept() {
    setPhase("accepting");
    try {
      await acceptInvite(token);
      setPhase("done");
      window.setTimeout(() => router.replace("/mate"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "수락에 실패했어요.");
      setPhase("error");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-ocean-100 bg-white p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ocean-700 text-white">
          <Waves className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 text-base font-black text-ocean-950">CURING QT Mate 초대</p>

        {phase === "loading" && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ocean-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            확인 중…
          </p>
        )}

        {phase === "not-configured" && (
          <p className="mt-6 text-sm leading-7 text-ocean-700">
            아직 계정 연결이 설정되지 않았어요. 메이트 기능은 로그인이 필요합니다.
          </p>
        )}

        {phase === "need-login" && (
          <div className="mt-6">
            <p className="text-sm leading-7 text-ocean-700">
              초대를 수락하려면 먼저 로그인해 주세요.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-ocean-700 text-sm font-bold text-white transition hover:bg-ocean-800"
            >
              로그인하기
            </Link>
          </div>
        )}

        {phase === "ready" && preview && (
          <div className="mt-6">
            {preview.is_self ? (
              <>
                <p className="text-sm leading-7 text-ocean-700">내가 만든 초대 링크예요.</p>
                <Link href="/mate" className="mt-4 inline-block text-sm font-bold text-ocean-700 underline">
                  메이트 화면으로
                </Link>
              </>
            ) : preview.status !== "pending" ? (
              <>
                <p className="text-sm leading-7 text-ocean-700">이미 처리된 초대예요.</p>
                <Link href="/mate" className="mt-4 inline-block text-sm font-bold text-ocean-700 underline">
                  메이트 화면으로
                </Link>
              </>
            ) : (
              <>
                <p className="flex items-center justify-center gap-2 text-lg font-black text-ocean-950">
                  <HeartHandshake className="h-5 w-5 text-ocean-600" aria-hidden />
                  {preview.requester_nickname}
                </p>
                <p className="mt-1 text-sm leading-7 text-ocean-700">
                  님이 QT 메이트로 초대했어요. 수락하면 같은 날 말씀을 함께 묵상하고, 둘 다
                  완료하면 서로의 기록이 열립니다.
                </p>
                <button
                  type="button"
                  onClick={accept}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-ocean-700 text-sm font-bold text-white transition hover:bg-ocean-800"
                >
                  수락하기
                </button>
              </>
            )}
          </div>
        )}

        {phase === "accepting" && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ocean-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            연결 중…
          </p>
        )}

        {phase === "done" && (
          <p className="mt-6 text-sm font-bold text-ocean-800">연결됐어요! 메이트 화면으로 이동합니다.</p>
        )}

        {phase === "error" && (
          <div className="mt-6">
            <p className="text-sm leading-7 text-coral">{error}</p>
            <Link href="/" className="mt-4 inline-block text-sm font-bold text-ocean-700 underline">
              홈으로
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
