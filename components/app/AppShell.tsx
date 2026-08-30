"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Clock3, LogIn, UserRound, Waves } from "lucide-react";
import type { ReactNode } from "react";
import { navItems } from "@/lib/nav";
import { displayDate } from "@/lib/scriptures";
import { useQt } from "@/components/app/QtProvider";
import { useAccount } from "@/components/app/useAccount";
import { StatusPill } from "@/components/ui/StatusPill";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { scripture, completed, isUnlocked, mateCompleted, nickname, todayKey } = useQt();
  const account = useAccount();

  const activeLabel = navItems.find((item) => item.match(pathname))?.label ?? "홈";

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)_300px]">
        {/* 좌측 네비게이션 (데스크톱) */}
        <aside className="hidden border-r border-ocean-100 bg-white px-4 py-6 lg:block">
          <Brand />
          <nav className="mt-8 space-y-1" aria-label="주요 메뉴">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={selected ? "page" : undefined}
                  className={`flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                    selected
                      ? "bg-ocean-700 text-white"
                      : "text-ocean-900 hover:bg-ocean-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="mt-8 rounded-2xl border border-ocean-100 bg-ocean-50/60 p-4 text-sm leading-7 text-ocean-800">
            오늘은 말씀을 읽고, 한 가지만 기록해도 충분해요.
          </p>
        </aside>

        {/* 본문 */}
        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ocean-100 bg-white/80 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ocean-500">{activeLabel}</p>
              <h1 className="mt-1 text-lg font-bold text-ocean-950 sm:text-xl">
                안녕하세요, {nickname}님
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-ocean-100 bg-white px-3 py-2 text-xs font-semibold text-ocean-800">
                <Clock3 className="h-4 w-4 text-ocean-500" aria-hidden />
                {displayDate(todayKey)} · QT 10분
              </span>
              <AccountButton
                configured={account.configured}
                email={account.email}
                onSignOut={account.signOut}
              />
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>

        {/* 우측 요약 (넓은 화면) */}
        <aside className="hidden border-l border-ocean-100 bg-white px-4 py-6 xl:block">
          <section className="rounded-2xl border border-ocean-100 bg-white p-4">
            <h2 className="text-sm font-bold text-ocean-950">오늘 상태</h2>
            <div className="mt-3 space-y-2">
              <StatusPill label="내 QT" done={completed} doneText="완료" pendingText="작성 중" />
              <StatusPill label="친구 완료" done={mateCompleted} doneText="완료" pendingText="대기" />
              <StatusPill label="서로 공개" done={isUnlocked} doneText="공개됨" pendingText="잠김" />
            </div>
            <Link
              href="/write"
              className="mt-4 flex h-10 w-full items-center justify-center rounded-2xl bg-ocean-700 text-sm font-bold text-white transition hover:bg-ocean-800"
            >
              {completed ? "내 QT 다시 보기" : "이어서 작성"}
            </Link>
          </section>

          <section className="mt-4 rounded-2xl border border-ocean-100 bg-white p-4">
            <h2 className="text-sm font-bold text-ocean-950">오늘 말씀</h2>
            <p className="mt-2 text-sm font-semibold text-ocean-700">{scripture.reference}</p>
            <p className="mt-1 text-sm leading-6 text-ocean-800">{scripture.title}</p>
            <Link
              href="/scripture"
              className="mt-3 flex h-10 w-full items-center justify-center rounded-2xl border border-ocean-200 text-sm font-bold text-ocean-800 transition hover:bg-ocean-50"
            >
              본문 읽기
            </Link>
          </section>

          <section className="mt-4 rounded-2xl border border-ocean-100 bg-white p-4">
            <div className="flex items-start gap-2 text-sm leading-6 text-ocean-800">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-ocean-500" aria-hidden />
              {isUnlocked
                ? "친구와 서로의 묵상이 열렸어요."
                : "둘 다 완료하면 서로의 묵상이 열립니다."}
            </div>
          </section>
        </aside>
      </div>

      {/* 모바일 하단 네비게이션 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-ocean-100 bg-white px-2 py-2 lg:hidden"
        aria-label="주요 메뉴"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold ${
                selected ? "bg-ocean-700 text-white" : "text-ocean-700"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ocean-700 text-white">
        <Waves className="h-5 w-5" aria-hidden />
      </span>
      <span>
        <span className="block text-base font-black tracking-tight text-ocean-950">CURING</span>
        <span className="block text-xs font-semibold text-ocean-500">QT Workspace</span>
      </span>
    </Link>
  );
}

function AccountButton({
  configured,
  email,
  onSignOut
}: {
  configured: boolean;
  email: string | null;
  onSignOut: () => Promise<void>;
}) {
  if (!configured) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-ocean-100 bg-white px-3 py-2 text-xs font-semibold text-ocean-600">
        <UserRound className="h-4 w-4" aria-hidden />
        게스트
      </span>
    );
  }

  if (email) {
    return (
      <button
        type="button"
        onClick={() => onSignOut()}
        className="inline-flex items-center gap-2 rounded-full border border-ocean-100 bg-white px-3 py-2 text-xs font-semibold text-ocean-800 transition hover:bg-ocean-50"
      >
        <UserRound className="h-4 w-4 text-ocean-500" aria-hidden />
        <span className="max-w-[10ch] truncate">{email}</span>
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 rounded-full border border-ocean-100 bg-white px-3 py-2 text-xs font-semibold text-ocean-800 transition hover:bg-ocean-50"
    >
      <LogIn className="h-4 w-4 text-ocean-500" aria-hidden />
      로그인
    </Link>
  );
}
