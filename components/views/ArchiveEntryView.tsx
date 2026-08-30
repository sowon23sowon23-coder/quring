"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadDraft, subscribe, type DraftRecord } from "@/lib/qt-local";
import { displayDate, getScriptureForDate, questionOrder } from "@/lib/scriptures";

export function ArchiveEntryView({ date }: { date: string }) {
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [ready, setReady] = useState(false);
  const scripture = getScriptureForDate(date);

  useEffect(() => {
    const refresh = () => setDraft(loadDraft(date));
    refresh();
    setReady(true);
    return subscribe(refresh);
  }, [date]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/archive" className="inline-flex items-center gap-1.5 text-sm font-bold text-ocean-600 hover:text-ocean-800">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        기록으로
      </Link>

      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <p className="text-sm font-bold text-ocean-500">{displayDate(date)}</p>
        <h2 className="mt-1 text-2xl font-black text-ocean-950">{scripture.reference}</h2>
        <p className="mt-1 text-sm text-ocean-600">{scripture.title}</p>
        <p className="mt-4 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-base font-semibold leading-8 text-ocean-900">
          {scripture.focusVerse}
        </p>
      </section>

      {!ready ? null : draft ? (
        <section className="rounded-3xl border border-ocean-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-ocean-950">나의 묵상</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                draft.status === "completed" ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-600"
              }`}
            >
              {draft.status === "completed" ? "완료" : "작성 중"}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            {questionOrder.map((key, index) => (
              <div key={key}>
                <p className="text-sm font-bold text-ocean-900">
                  {index + 1}. {scripture.questions[key]}
                </p>
                <p className="mt-1.5 whitespace-pre-wrap rounded-2xl border border-ocean-100 bg-white p-3.5 text-sm leading-7 text-ocean-800">
                  {draft.answers[key]?.trim() || "— 비어 있어요"}
                </p>
              </div>
            ))}
          </div>
          {date === scripture.date && (
            <Link
              href="/write"
              className="mt-5 inline-flex h-10 items-center rounded-2xl border border-ocean-200 px-4 text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
            >
              이어서 편집
            </Link>
          )}
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-ocean-200 bg-white p-8 text-center text-sm text-ocean-600">
          이 날짜에는 기록이 없어요.
        </p>
      )}
    </div>
  );
}
