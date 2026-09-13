"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { displayDate } from "@/lib/scriptures";
import type { MateMode, QtMethod, RoomSettings } from "@/lib/qt-local";

const FONT_KEY = "curing.fontSize";
const MIN = 15;
const MAX = 22;
const BIBLE_BOOKS = [
  "창세기",
  "출애굽기",
  "레위기",
  "민수기",
  "신명기",
  "여호수아",
  "사사기",
  "룻기",
  "사무엘상",
  "사무엘하",
  "열왕기상",
  "열왕기하",
  "시편",
  "잠언",
  "이사야",
  "마태복음",
  "마가복음",
  "누가복음",
  "요한복음",
  "로마서",
  "고린도전서",
  "갈라디아서",
  "에베소서",
  "빌립보서",
  "골로새서",
  "야고보서",
  "요한일서"
];

const METHOD_OPTIONS: { value: QtMethod; title: string; body: string; recommended?: boolean }[] = [
  { value: "manual", title: "매번 직접 정하기", body: "큐티할 때마다 본문을 선택해요." },
  {
    value: "shared",
    title: "한 명이 정하면 같이 하기",
    body: "한 사람이 정한 본문으로 모두 함께 큐티해요.",
    recommended: true
  },
  { value: "sequence", title: "성경 순서대로 읽기", body: "정한 성경을 순서대로 이어서 큐티해요." },
  { value: "recommended", title: "추천 말씀 받기", body: "서비스가 오늘의 본문을 추천해요." }
];

const MATE_OPTIONS: { value: MateMode; title: string; body: string }[] = [
  { value: "solo", title: "혼자 큐티하기", body: "내 기록 중심으로 큐티를 이어가요." },
  { value: "with-friends", title: "친구와 함께하기", body: "같은 본문을 그룹 친구들에게 적용해요." }
];

const DAYS = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
  { value: 7, label: "일" }
];

export function ScriptureView() {
  const { scripture, roomSettings, updateRoomSettings } = useQt();
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

  const updateSettings = (patch: Partial<RoomSettings>) => {
    updateRoomSettings({ ...roomSettings, ...patch });
  };

  const updatePassage = (patch: Partial<RoomSettings["passage"]>) => {
    const passage = { ...roomSettings.passage, ...patch };
    if (passage.endVerse < passage.startVerse) passage.endVerse = passage.startVerse;
    updateSettings({ passage });
  };

  const toggleDay = (day: number) => {
    const days = roomSettings.days.includes(day)
      ? roomSettings.days.filter((item) => item !== day)
      : [...roomSettings.days, day].sort((a, b) => a - b);
    updateSettings({ days: days.length ? days : roomSettings.days });
  };

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-ocean-100 bg-white p-6 lg:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean-500">
          Step 1 · QT Setup
        </p>
        <h2 className="mt-2 text-2xl font-black text-ocean-950">큐티를 시작하기 전에 정리해요</h2>
        <p className="mt-2 text-sm leading-7 text-ocean-700">
          먼저 큐티 방식, 오늘 읽을 본문, 함께할 사람, 일정을 정하세요. 설정이 끝나면
          아래에서 오늘 말씀을 확인하고 바로 묵상을 시작할 수 있어요.
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-ocean-100 bg-ocean-50/60 p-4 sm:p-5">
        <SettingBlock index="1" title="큐티 방식 설정">
          <div className="grid gap-2 sm:grid-cols-2">
            {METHOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSettings({ method: option.value })}
                className={`rounded-2xl border p-4 text-left transition ${
                  roomSettings.method === option.value
                    ? "border-ocean-700 bg-white shadow-sm"
                    : "border-ocean-100 bg-white/70 hover:border-ocean-300"
                }`}
              >
                <span className="block text-sm font-black text-ocean-950">
                  {option.title} {option.recommended ? "★" : ""}
                </span>
                <span className="mt-1 block text-xs leading-5 text-ocean-600">{option.body}</span>
              </button>
            ))}
          </div>
        </SettingBlock>

        {roomSettings.method !== "recommended" && (
          <SettingBlock index="2" title="큐티 본문 설정">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="성경 선택">
                <select
                  value={roomSettings.passage.book}
                  onChange={(event) => updatePassage({ book: event.target.value })}
                  className="h-11 w-full rounded-2xl border border-ocean-200 bg-white px-3 text-sm font-bold text-ocean-900 outline-none focus:border-ocean-600"
                >
                  {BIBLE_BOOKS.map((book) => (
                    <option key={book} value={book}>
                      {book}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="장 선택">
                <NumberInput
                  value={roomSettings.passage.chapter}
                  min={1}
                  onChange={(chapter) => updatePassage({ chapter })}
                />
              </Field>
              <Field label="시작 절">
                <NumberInput
                  value={roomSettings.passage.startVerse}
                  min={1}
                  onChange={(startVerse) => updatePassage({ startVerse })}
                />
              </Field>
              <Field label="끝 절">
                <NumberInput
                  value={roomSettings.passage.endVerse}
                  min={roomSettings.passage.startVerse}
                  onChange={(endVerse) => updatePassage({ endVerse })}
                />
              </Field>
            </div>
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-ocean-900">
              {roomSettings.passage.book} {roomSettings.passage.chapter}장{" "}
              {roomSettings.passage.startVerse}
              {roomSettings.passage.startVerse === roomSettings.passage.endVerse
                ? "절"
                : `–${roomSettings.passage.endVerse}절`}
            </p>
          </SettingBlock>
        )}

        <SettingBlock index="3" title="함께 큐티할 사람">
          <div className="grid gap-2 sm:grid-cols-2">
            {MATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSettings({ mateMode: option.value })}
                className={`rounded-2xl border p-4 text-left transition ${
                  roomSettings.mateMode === option.value
                    ? "border-ocean-700 bg-white shadow-sm"
                    : "border-ocean-100 bg-white/70 hover:border-ocean-300"
                }`}
              >
                <span className="block text-sm font-black text-ocean-950">{option.title}</span>
                <span className="mt-1 block text-xs leading-5 text-ocean-600">{option.body}</span>
              </button>
            ))}
          </div>
        </SettingBlock>

        <SettingBlock index="4" title="큐티 일정">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = roomSettings.days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`h-10 w-10 rounded-2xl text-sm font-black transition ${
                    active
                      ? "bg-ocean-700 text-white"
                      : "border border-ocean-100 bg-white text-ocean-700 hover:border-ocean-300"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <Field label="시작 날짜" className="mt-3">
            <input
              type="date"
              value={roomSettings.startDate}
              onChange={(event) => updateSettings({ startDate: event.target.value })}
              className="h-11 w-full rounded-2xl border border-ocean-200 bg-white px-3 text-sm font-bold text-ocean-900 outline-none focus:border-ocean-600"
            />
          </Field>
        </SettingBlock>
      </div>

      <div id="today-passage" className="mt-8 flex flex-wrap items-start justify-between gap-4 border-t border-ocean-100 pt-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean-500">
            Step 2 · Read
          </p>
          <p className="mt-2 text-sm font-bold text-ocean-500">{displayDate(scripture.date)}</p>
          <h3 className="mt-1 text-2xl font-black text-ocean-950">{scripture.reference}</h3>
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

function SettingBlock({
  index,
  title,
  children
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-ocean-100 bg-white/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ocean-700 text-xs font-black text-white">
          {index}
        </span>
        <h4 className="text-sm font-black text-ocean-950">{title}</h4>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  className = "",
  children
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-black text-ocean-700">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  min,
  onChange
}: {
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (Number.isFinite(next)) onChange(Math.max(min, next));
      }}
      className="h-11 w-full rounded-2xl border border-ocean-200 bg-white px-3 text-sm font-bold text-ocean-900 outline-none focus:border-ocean-600"
    />
  );
}
