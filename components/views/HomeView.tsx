"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  HeartHandshake,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useQt } from "@/components/app/QtProvider";
import { useMate } from "@/components/app/MateProvider";
import { useDrafts } from "@/components/app/useDrafts";
import { displayDate } from "@/lib/scriptures";

const features = [
  {
    icon: BookOpen,
    title: "함께하는 QT",
    body: "오늘의 말씀을 읽고 각자의 묵상을 남기며 같은 본문 안에서 하루를 시작해요.",
  },
  {
    icon: MessageCircle,
    title: "삶의 나눔",
    body: "말씀에서 끝나지 않고 일상과 마음을 나누며 큐티메이트를 더 깊이 알아가요.",
  },
  {
    icon: HeartHandshake,
    title: "기도제목 공유",
    body: "서로의 기도제목을 기억하고, '기도할게'라는 말이 실제 기도로 이어지게 해요.",
  },
];

export function HomeView() {
  const { scripture, completed, todayKey } = useQt();
  const { isUnlocked } = useMate();
  const { drafts } = useDrafts();

  const recent = drafts.filter((d) => d.date !== todayKey).slice(0, 3);

  const checklist = [
    {
      title: "오늘 말씀 읽기",
      description: scripture.reference,
      href: "/scripture",
      done: true,
    },
    {
      title: "나의 QT 기록하기",
      description: completed ? "오늘의 묵상을 완료했어요" : "말씀을 읽고 마음을 남겨보세요",
      href: "/write",
      done: completed,
    },
    {
      title: "큐티메이트와 나누기",
      description: isUnlocked ? "서로의 묵상이 열렸어요" : "둘 다 완료하면 나눔이 열려요",
      href: "/mate",
      done: isUnlocked,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-ocean-100 bg-white shadow-sm">
        <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              <p className="inline-flex rounded-full bg-[#edf4ee] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#456d55]">
                Quiet Time & Sharing
              </p>
              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#18251f] sm:text-5xl">
                혼자 어려웠던 큐티를 함께 이어가요
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#65766b] sm:text-lg">
                큐어링은 말씀을 읽고, 서로의 삶을 나누고, 함께 기도하며 신앙의 기록을
                쌓아가는 QT 메이트 앱입니다.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/write"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#456d55] px-5 text-sm font-black text-white transition hover:bg-[#345741]"
                >
                  오늘 QT 시작하기
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/mate"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#dce7df] bg-white px-5 text-sm font-black text-[#274735] transition hover:bg-[#f4f8f5]"
                >
                  큐티메이트 보기
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MiniStat label="오늘 말씀" value={scripture.reference} />
                <MiniStat label="나의 기록" value={completed ? "완료" : "작성 전"} />
                <MiniStat label="나눔 상태" value={isUnlocked ? "열림" : "대기"} />
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] bg-[#f1e8d8]">
            <Image
              src="/quring-hero.png"
              alt="말씀과 노트, 차 한 잔이 놓인 조용한 큐티 시간"
              fill
              sizes="(min-width: 1024px) 460px, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18251f]/35 via-transparent to-white/10" />
            <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#496f8a]">
                Today&apos;s Quring
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#18251f]">
                얼굴을 볼 수 없어도, 말씀과 기도로 연결될 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="rounded-3xl border border-ocean-100 bg-white p-5 shadow-sm"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf4ee] text-[#456d55]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-black text-[#18251f]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#65766b]">{feature.body}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-ocean-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#496f8a]">
                {displayDate(scripture.date)}
              </p>
              <h2 className="mt-1 text-xl font-black text-[#18251f]">오늘의 큐티 흐름</h2>
            </div>
            <Sparkles className="h-5 w-5 text-[#b8863b]" aria-hidden />
          </div>

          <div className="mt-5 space-y-3">
            {checklist.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-[#e4eadd] bg-[#fbfcf8] p-4 transition hover:border-[#456d55] hover:bg-[#f4f8f5]"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    item.done ? "bg-[#456d55] text-white" : "bg-white text-[#9aa79d]"
                  }`}
                >
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-[#18251f]">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-[#65766b]">{item.description}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-[#9aa79d]" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-ocean-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-[#18251f]">최근 신앙 기록</h2>
            <Link href="/archive" className="text-xs font-black text-[#456d55] hover:text-[#274735]">
              전체 보기
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-[#dce7df] bg-[#fbfcf8] p-5 text-center text-sm leading-7 text-[#65766b]">
              아직 기록이 없어요. 오늘 말씀을 읽고 첫 QT를 남겨보세요.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {recent.map((draft) => (
                <Link
                  key={draft.date}
                  href={`/archive/${draft.date}`}
                  className="flex items-center justify-between rounded-2xl border border-[#e4eadd] p-4 transition hover:bg-[#f4f8f5]"
                >
                  <span>
                    <span className="block text-sm font-black text-[#18251f]">
                      {displayDate(draft.date)}
                    </span>
                    <span className="mt-0.5 block text-xs font-bold text-[#65766b]">
                      {draft.status === "completed" ? "완료" : "작성 중"}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#9aa79d]" aria-hidden />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e4eadd] bg-[#fbfcf8] p-4">
      <p className="text-xs font-black text-[#65766b]">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[#18251f]">{value}</p>
    </div>
  );
}
