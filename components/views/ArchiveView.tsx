"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useDrafts } from "@/components/app/useDrafts";
import { displayDate, getScriptureForDate } from "@/lib/scriptures";

export function ArchiveView() {
  const { drafts, ready } = useDrafts();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return drafts.map((draft) => {
      const scripture = getScriptureForDate(draft.date);
      return { draft, scripture };
    });
  }, [drafts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ draft, scripture }) => {
      const haystack = [
        draft.date,
        scripture.reference,
        scripture.title,
        ...Object.values(draft.answers)
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  return (
    <section className="rounded-3xl border border-ocean-100 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-ocean-950">QT 기록</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-400" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="말씀, 키워드, 날짜"
            aria-label="기록 검색"
            className="h-10 w-56 rounded-2xl border border-ocean-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200"
          />
        </div>
      </div>

      {!ready ? null : filtered.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-ocean-200 p-8 text-center text-sm text-ocean-600">
          {query ? "검색 결과가 없어요." : "아직 기록이 없어요. 오늘 첫 QT를 남겨보세요."}
        </p>
      ) : (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ draft, scripture }) => (
            <Link
              key={draft.date}
              href={`/archive/${draft.date}`}
              className="rounded-2xl border border-ocean-100 bg-white p-4 transition hover:bg-ocean-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-ocean-950">{displayDate(draft.date)}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    draft.status === "completed"
                      ? "bg-ocean-700 text-white"
                      : "bg-ocean-50 text-ocean-600"
                  }`}
                >
                  {draft.status === "completed" ? "완료" : "작성 중"}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-ocean-700">{scripture.reference}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ocean-600">
                {draft.answers.heart_verse?.trim() || scripture.title}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-ocean-500">
                열기 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
