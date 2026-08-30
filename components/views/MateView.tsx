"use client";

import Link from "next/link";
import { Check, Lock, Unlock } from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { questionOrder } from "@/lib/scriptures";
import { StatusPill } from "@/components/ui/StatusPill";

const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

export function MateView() {
  const { scripture, answers, completed, mateCompleted, isUnlocked, toggleMateDemo } = useQt();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <h2 className="text-xl font-black text-ocean-950">친구 QT</h2>
        <p className="mt-1 text-sm leading-7 text-ocean-700">
          1:1 QT Mate와 같은 날 말씀을 묵상하고, 둘 다 완료하면 서로의 기록이 열립니다.
        </p>

        <div className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4">
          <p className="text-xs font-bold text-ocean-600">초대 링크</p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              aria-label="초대 링크"
              value="https://curing.app/invite/quiet-sea-237"
              className="min-w-0 flex-1 rounded-xl border border-ocean-200 bg-white px-3 py-2 text-sm text-ocean-700"
            />
            <button
              type="button"
              className="rounded-xl bg-ocean-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-ocean-800"
            >
              복사
            </button>
          </div>
          <p className="mt-2 text-xs text-ocean-500">
            실제 초대 · 수락은 라이브 DB 연결 후 동작합니다.
          </p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-ocean-900">함께하는 요일</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {weekDays.map((day, index) => (
              <span
                key={day}
                className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-bold ${
                  index < 3 ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-600"
                }`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-ocean-200 p-4">
          <p className="text-xs font-bold text-ocean-500">데모</p>
          <p className="mt-1 text-sm text-ocean-700">
            친구가 오늘 QT를 완료한 상황을 흉내 내어 상호 공개 규칙을 확인해 보세요.
          </p>
          <button
            type="button"
            onClick={toggleMateDemo}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-2xl border border-ocean-200 px-4 text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
          >
            <Check className="h-4 w-4" aria-hidden />
            {mateCompleted ? "친구 완료 상태 해제" : "친구 완료 상태로 두기"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ocean-500">Mutual Unlock</p>
            <h2 className="mt-1 text-xl font-black text-ocean-950">서로 완료하면 공개</h2>
          </div>
          <span
            className={`grid h-10 w-10 place-items-center rounded-2xl ${
              isUnlocked ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-500"
            }`}
          >
            {isUnlocked ? <Unlock className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <StatusPill label="나" done={completed} doneText="완료" pendingText="작성 중" />
          <StatusPill label="친구" done={mateCompleted} doneText="완료" pendingText="대기" />
        </div>

        {isUnlocked ? (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-bold text-ocean-900">나의 묵상 · {scripture.reference}</p>
              <div className="mt-2 space-y-2">
                {questionOrder.map((key) => (
                  <div key={key} className="rounded-2xl border border-ocean-100 bg-ocean-50/50 p-3">
                    <p className="text-xs font-semibold text-ocean-500">{scripture.questions[key]}</p>
                    <p className="mt-1 text-sm leading-7 text-ocean-900">
                      {answers[key]?.trim() || "— 아직 비어 있어요"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="rounded-2xl border border-dashed border-ocean-200 p-4 text-sm text-ocean-600">
              친구의 묵상은 라이브 DB 연결 시 이 자리에 함께 표시됩니다.
            </p>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-sm leading-7 text-ocean-800">
            {completed
              ? "내 QT는 완료됐어요. 친구가 완료하면 서로의 묵상이 자동으로 열립니다."
              : "먼저 내 QT를 완료해 주세요. "}
            {!completed && (
              <Link href="/write" className="font-bold text-ocean-700 underline">
                QT 작성하러 가기
              </Link>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
