"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, PenLine } from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { useDrafts } from "@/components/app/useDrafts";
import { WaveMark } from "@/components/ui/WaveMark";
import { displayDate } from "@/lib/scriptures";

export function HomeView() {
  const { scripture, completed, isUnlocked, todayKey } = useQt();
  const { drafts } = useDrafts();

  const recent = drafts.filter((d) => d.date !== todayKey).slice(0, 4);

  const checklist = [
    {
      title: "오늘 말씀 읽기",
      description: scripture.reference,
      href: "/scripture",
      done: true
    },
    {
      title: "내 QT 작성하기",
      description: completed ? "완료했어요" : "아직 작성 중이에요",
      href: "/write",
      done: completed
    },
    {
      title: "친구 QT 확인하기",
      description: isUnlocked ? "서로의 묵상이 열렸어요" : "둘 다 완료하면 열려요",
      href: "/mate",
      done: isUnlocked
    }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-ocean-100 bg-white">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="p-6 lg:p-7">
            <p className="inline-flex rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold text-ocean-700">
              오늘의 말씀 · {displayDate(scripture.date)}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-ocean-950">
              {scripture.title}
            </h2>
            <p className="mt-3 text-base leading-8 text-ocean-800">“{scripture.focusVerse}”</p>
            <p className="mt-2 text-sm font-bold text-ocean-500">{scripture.reference}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/write"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800"
              >
                <PenLine className="h-4 w-4" aria-hidden />
                QT 작성하기
              </Link>
              <Link
                href="/scripture"
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-ocean-200 bg-white px-4 text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                말씀만 읽기
              </Link>
            </div>
          </div>
          <WaveMark className="h-40 w-full md:h-full" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-ocean-950">오늘의 순서</h2>
        <div className="mt-3 space-y-2">
          {checklist.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-ocean-100 bg-white p-4 transition hover:bg-ocean-50"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  item.done ? "bg-ocean-700 text-white" : "bg-ocean-50 text-ocean-400"
                }`}
              >
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ocean-950">{item.title}</span>
                <span className="mt-0.5 block text-sm text-ocean-600">{item.description}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-ocean-400" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ocean-950">최근 기록</h2>
          <Link href="/archive" className="text-xs font-bold text-ocean-600 hover:text-ocean-800">
            전체 보기
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-ocean-200 bg-white p-6 text-center text-sm text-ocean-600">
            아직 기록이 없어요. 오늘 첫 QT를 남겨보세요.
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {recent.map((draft) => (
              <Link
                key={draft.date}
                href={`/archive/${draft.date}`}
                className="flex items-center justify-between rounded-2xl border border-ocean-100 bg-white p-4 transition hover:bg-ocean-50"
              >
                <span>
                  <span className="block text-sm font-bold text-ocean-950">
                    {displayDate(draft.date)}
                  </span>
                  <span className="mt-0.5 block text-xs text-ocean-600">
                    {draft.status === "completed" ? "완료" : "작성 중"}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-ocean-400" aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
