"use client";

import Link from "next/link";
import { Check, Save } from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { questionOrder } from "@/lib/scriptures";

export function WriteView() {
  const { scripture, answers, completed, savedLabel, stats, setAnswer, completeToday } = useQt();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <p className="text-sm font-bold text-ocean-500">{scripture.reference}</p>
        <h2 className="mt-1 text-xl font-black text-ocean-950">{scripture.title}</h2>
        <p className="mt-4 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-base font-semibold leading-8 text-ocean-900">
          {scripture.focusVerse}
        </p>
        <div className="mt-4 space-y-3">
          {scripture.verses.map((verse) => (
            <p key={verse.no} className="leading-8 text-ocean-800">
              <sup className="mr-1.5 font-bold text-ocean-400">{verse.no}</sup>
              {verse.text}
            </p>
          ))}
        </div>
        <Link href="/scripture" className="mt-4 inline-block text-sm font-bold text-ocean-600 hover:text-ocean-800">
          전체 본문 보기
        </Link>
      </section>

      <section className="rounded-3xl border border-ocean-100 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-ocean-950">나의 묵상</h2>
            <p className="mt-1 text-xs font-semibold text-ocean-500">
              {savedLabel} · {stats.answered}/4 질문 · {stats.chars}자
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ocean-100 bg-white px-3 py-1.5 text-xs font-bold text-ocean-600">
            <Save className="h-3.5 w-3.5" aria-hidden />
            자동 저장
          </span>
        </div>

        <div className="space-y-4">
          {questionOrder.map((key, index) => (
            <div key={key}>
              <label htmlFor={`qt-${key}`} className="block text-sm font-bold text-ocean-900">
                {index + 1}. {scripture.questions[key]}
              </label>
              <textarea
                id={`qt-${key}`}
                value={answers[key]}
                onChange={(event) => setAnswer(key, event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-ocean-200 bg-white p-3.5 leading-7 text-ocean-950 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={completeToday}
          disabled={completed}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:cursor-not-allowed disabled:bg-ocean-300 sm:w-auto"
        >
          <Check className="h-4 w-4" aria-hidden />
          {completed ? "QT 완료됨" : "QT 완료하기"}
        </button>
        {completed && (
          <p className="mt-3 text-sm text-ocean-600">
            완료했어요. <Link href="/mate" className="font-bold text-ocean-700 underline">친구 QT 확인하러 가기</Link>
          </p>
        )}
      </section>
    </div>
  );
}
