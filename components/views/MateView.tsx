"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy, Heart, Link2, Lock, Sparkles, Unlock, UserPlus, X } from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { useMate } from "@/components/app/MateProvider";
import { questionOrder } from "@/lib/scriptures";
import type { ReactionType } from "@/lib/qt-remote";
import { StatusPill } from "@/components/ui/StatusPill";

const reactionMeta: { type: ReactionType; label: string; icon: typeof Heart }[] = [
  { type: "amen", label: "아멘", icon: Check },
  { type: "pray", label: "기도할게요", icon: Sparkles },
  { type: "heart", label: "공감", icon: Heart }
];

export function MateView() {
  const { scripture, answers, completed } = useQt();
  const mate = useMate();

  if (mate.mode === "loading") {
    return <p className="text-sm text-ocean-600">불러오는 중…</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <h2 className="text-xl font-black text-ocean-950">친구 QT</h2>
        <p className="mt-1 text-sm leading-7 text-ocean-700">
          1:1 QT Mate와 같은 날 말씀을 묵상하고, 둘 다 완료하면 서로의 기록이 열립니다.
        </p>

        {mate.mode === "remote" ? (
          <RemoteMatePanel mate={mate} />
        ) : (
          <GuestMatePanel demoCompleted={mate.mateCompleted} onToggle={mate.toggleDemo} />
        )}
      </section>

      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ocean-500">Mutual Unlock</p>
            <h2 className="mt-1 text-xl font-black text-ocean-950">서로 완료하면 공개</h2>
          </div>
          <span
            className={`grid h-10 w-10 place-items-center rounded-2xl ${
              mate.isUnlocked ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-500"
            }`}
          >
            {mate.isUnlocked ? <Unlock className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <StatusPill label="나" done={completed} doneText="완료" pendingText="작성 중" />
          <StatusPill
            label={mate.partnerNickname ?? "친구"}
            done={mate.mateCompleted}
            doneText="완료"
            pendingText={mate.partnerNickname || mate.mode === "guest" ? "대기" : "미연결"}
          />
        </div>

        {mate.isUnlocked ? (
          <div className="mt-5 space-y-4">
            <PartnerMeditation mate={mate} questions={scripture.questions} />
            <div>
              <p className="text-sm font-bold text-ocean-900">나의 묵상 · {scripture.reference}</p>
              <div className="mt-2 space-y-2">
                {questionOrder.map((key) => (
                  <div key={key} className="rounded-2xl border border-ocean-100 bg-ocean-50/50 p-3">
                    <p className="text-xs font-semibold text-ocean-500">{scripture.questions[key]}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-ocean-900">
                      {answers[key]?.trim() || "— 아직 비어 있어요"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-sm leading-7 text-ocean-800">
            {!completed ? (
              <>
                먼저 내 QT를 완료해 주세요.{" "}
                <Link href="/write" className="font-bold text-ocean-700 underline">
                  작성하러 가기
                </Link>
              </>
            ) : mate.mode === "remote" && mate.activeMate ? (
              `${mate.partnerNickname}님이 오늘 QT를 완료하면 서로의 묵상이 자동으로 열립니다.`
            ) : mate.mode === "remote" ? (
              "메이트와 연결되면 서로의 묵상을 나눌 수 있어요."
            ) : (
              "친구도 QT를 완료하면 서로의 묵상이 자동으로 열립니다."
            )}
          </p>
        )}
      </section>
    </div>
  );
}

function PartnerMeditation({
  mate,
  questions
}: {
  mate: ReturnType<typeof useMate>;
  questions: Record<(typeof questionOrder)[number], string>;
}) {
  if (!mate.partnerEntry) return null;
  const partnerAnswers = mate.partnerEntry.answers;

  return (
    <div>
      <p className="text-sm font-bold text-ocean-900">{mate.partnerNickname}님의 묵상</p>
      <div className="mt-2 space-y-2">
        {questionOrder.map((key) => (
          <div key={key} className="rounded-2xl border border-ocean-100 bg-white p-3">
            <p className="text-xs font-semibold text-ocean-500">{questions[key]}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-ocean-900">
              {partnerAnswers[key]?.trim() || "— 비어 있어요"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {reactionMeta.map(({ type, label, icon: Icon }) => {
          const active = mate.myReactions[type];
          const count = mate.reactionSummary[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => mate.react(type)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                active
                  ? "border-ocean-700 bg-ocean-700 text-white"
                  : "border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RemoteMatePanel({ mate }: { mate: ReturnType<typeof useMate> }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const inviteUrl = mate.inviteToken ? `${origin}/invite/${mate.inviteToken}` : "";

  async function copy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  if (mate.activeMate) {
    return (
      <div className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4">
        <p className="text-xs font-bold text-ocean-600">연결된 메이트</p>
        <p className="mt-1 text-lg font-black text-ocean-950">{mate.partnerNickname}</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("메이트 연결을 해제할까요?")) mate.endMate();
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-2xl border border-ocean-200 px-3 py-1.5 text-xs font-bold text-ocean-700 transition hover:bg-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          연결 해제
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4">
      {mate.inviteToken ? (
        <>
          <p className="text-xs font-bold text-ocean-600">초대 링크</p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              aria-label="초대 링크"
              value={inviteUrl}
              className="min-w-0 flex-1 rounded-xl border border-ocean-200 bg-white px-3 py-2 text-sm text-ocean-700"
            />
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ocean-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-ocean-800"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ocean-500">
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            친구가 이 링크를 열고 수락하면 연결됩니다.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-ocean-700">아직 연결된 메이트가 없어요.</p>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await mate.createInvite();
              } finally {
                setBusy(false);
              }
            }}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:bg-ocean-300"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            초대 링크 만들기
          </button>
        </>
      )}
    </div>
  );
}

function GuestMatePanel({
  demoCompleted,
  onToggle
}: {
  demoCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <div className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4">
        <p className="text-sm leading-7 text-ocean-700">
          로그인하면 실제 초대 링크로 친구와 1:1 메이트를 맺을 수 있어요.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800"
        >
          로그인하고 연결하기
        </Link>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-ocean-200 p-4">
        <p className="text-xs font-bold text-ocean-500">데모</p>
        <p className="mt-1 text-sm text-ocean-700">
          친구가 오늘 QT를 완료한 상황을 흉내 내어 상호 공개 규칙을 확인해 보세요.
        </p>
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-2xl border border-ocean-200 px-4 text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
        >
          <Check className="h-4 w-4" aria-hidden />
          {demoCompleted ? "친구 완료 상태 해제" : "친구 완료 상태로 두기"}
        </button>
      </div>
    </>
  );
}
