"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { displayDate } from "@/lib/scriptures";

const FONT_KEY = "curing.fontSize";
const MIN = 15;
const MAX = 22;

export function ScriptureView() {
  const { scripture } = useQt();
  const [fontSize, setFontSize] = useState(17);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(FONT_KEY));
    if (stored >= MIN && stored <= MAX) setFontSize(stored);
  }, []);

  const changeFont = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(MAX, Math.max(MIN, prev + delta));
      window.localStorage.setItem(FONT_KEY, String(next));
      return next;
    });
  };

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-ocean-100 bg-white p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean-500">{displayDate(scripture.date)}</p>
          <h2 className="mt-1 text-2xl font-black text-ocean-950">{scripture.reference}</h2>
          <p className="mt-1 text-sm text-ocean-600">{scripture.title}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-2xl border border-ocean-200 bg-white p-1">
          <button
            type="button"
            onClick={() => changeFont(-1)}
            disabled={fontSize <= MIN}
            aria-label="글자 작게"
            className="grid h-9 w-9 place-items-center rounded-xl text-ocean-700 transition hover:bg-ocean-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="w-10 text-center text-xs font-bold text-ocean-600">{fontSize}px</span>
          <button
            type="button"
            onClick={() => changeFont(1)}
            disabled={fontSize >= MAX}
            aria-label="글자 크게"
            className="grid h-9 w-9 place-items-center rounded-xl text-ocean-700 transition hover:bg-ocean-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <p className="mt-6 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-base font-semibold leading-8 text-ocean-900">
        {scripture.focusVerse}
      </p>

      <div className="mt-6 space-y-3" style={{ fontSize }}>
        {scripture.verses.map((verse) => (
          <p key={verse.no} className="leading-9 text-ocean-950">
            <sup className="mr-1.5 font-bold text-ocean-400">{verse.no}</sup>
            {verse.text}
          </p>
        ))}
      </div>

      <Link
        href="/write"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800"
      >
        묵상 시작하기
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
