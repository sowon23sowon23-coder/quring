"use client";

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import {
  questionOrder,
  type DailyScripture,
  type QtQuestionKey
} from "@/lib/scriptures";
import type { DraftAnswers } from "@/lib/qt-local";

type ScriptureRow = Database["public"]["Tables"]["daily_scriptures"]["Row"];
type EntryRow = Database["public"]["Tables"]["qt_entries"]["Row"];
type MateRow = Database["public"]["Tables"]["qt_mates"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ActiveMate = {
  mate: MateRow;
  partner: Pick<ProfileRow, "id" | "nickname" | "avatar_url">;
};

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export const remoteEnabled = () => Boolean(supabase);

// --- 본문 --------------------------------------------------------------------
export function scriptureRowToDaily(row: ScriptureRow): DailyScripture {
  const parts = row.bible_text
    .split(/\s*\/\s*/)
    .map((t) => t.trim())
    .filter(Boolean);
  const start = Number.parseInt(row.verse, 10);
  const verses = parts.map((text, index) => ({
    no: Number.isFinite(start) ? start + index : index + 1,
    text
  }));

  return {
    date: row.scripture_date,
    book: row.bible_book,
    reference: `${row.bible_book} ${row.chapter}:${row.verse}`,
    title: row.focus_verse.slice(0, 24),
    focusVerse: row.focus_verse,
    verses: verses.length > 0 ? verses : [{ no: 1, text: row.bible_text }],
    questions: {
      heart_verse: "가장 마음에 남는 구절은 무엇이고, 왜 그런가요?",
      message: row.qt_question_1,
      practice: row.qt_question_2,
      prayer: row.prayer_question || row.qt_question_3
    }
  };
}

export async function getRemoteScripture(dateKey: string): Promise<DailyScripture | null> {
  const { data, error } = await client()
    .from("daily_scriptures")
    .select("*")
    .lte("scripture_date", dateKey)
    .order("scripture_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? scriptureRowToDaily(data) : null;
}

async function scriptureIdForDate(dateKey: string): Promise<string | null> {
  const { data, error } = await client()
    .from("daily_scriptures")
    .select("id")
    .eq("scripture_date", dateKey)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

// --- 프로필 ------------------------------------------------------------------
export async function ensureProfile(userId: string, email: string | null, nickname: string) {
  const { error } = await client()
    .from("profiles")
    .upsert({ id: userId, email, nickname }, { onConflict: "id", ignoreDuplicates: true });
  if (error && error.code !== "23505") throw error;
}

// --- 엔트리 / 답변 ----------------------------------------------------------
export type RemoteEntry = { entry: EntryRow; answers: DraftAnswers };

const emptyAnswers = (): DraftAnswers => ({
  heart_verse: "",
  message: "",
  practice: "",
  prayer: ""
});

export async function ensureEntry(userId: string, dateKey: string): Promise<RemoteEntry | null> {
  const scriptureId = await scriptureIdForDate(dateKey);
  if (!scriptureId) return null; // DB에 그 날 본문이 없으면 원격 저장 불가

  const { data: entry, error } = await client()
    .from("qt_entries")
    .upsert(
      { user_id: userId, daily_scripture_id: scriptureId, status: "draft" },
      { onConflict: "user_id,daily_scripture_id", ignoreDuplicates: true }
    )
    .select("*")
    .maybeSingle();

  let resolved = entry;
  if (error && error.code !== "23505") throw error;
  if (!resolved) {
    const { data, error: readError } = await client()
      .from("qt_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_scripture_id", scriptureId)
      .single();
    if (readError) throw readError;
    resolved = data;
  }

  return { entry: resolved, answers: await getAnswers(resolved.id) };
}

export async function getAnswers(entryId: string): Promise<DraftAnswers> {
  const { data, error } = await client()
    .from("qt_answers")
    .select("question_key, answer_text")
    .eq("qt_entry_id", entryId);
  if (error) throw error;

  const answers = emptyAnswers();
  for (const row of data ?? []) {
    answers[row.question_key as QtQuestionKey] = row.answer_text;
  }
  return answers;
}

export async function saveAnswers(entryId: string, answers: DraftAnswers) {
  const rows = questionOrder.map((key) => ({
    qt_entry_id: entryId,
    question_key: key,
    answer_text: answers[key] ?? ""
  }));
  const { error } = await client()
    .from("qt_answers")
    .upsert(rows, { onConflict: "qt_entry_id,question_key" });
  if (error) throw error;
}

export async function completeEntry(entryId: string, wordCount: number) {
  const { error } = await client()
    .from("qt_entries")
    .update({ status: "completed", completed_at: new Date().toISOString(), word_count: wordCount })
    .eq("id", entryId);
  if (error) throw error;
}

// --- 메이트 ----------------------------------------------------------------
export async function getActiveMate(userId: string): Promise<ActiveMate | null> {
  const { data: mate, error } = await client()
    .from("qt_mates")
    .select("*")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .maybeSingle();
  if (error) throw error;
  if (!mate) return null;

  const partnerId = mate.requester_id === userId ? mate.receiver_id : mate.requester_id;
  if (!partnerId) return null;

  const { data: partner, error: partnerError } = await client()
    .from("profiles")
    .select("id, nickname, avatar_url")
    .eq("id", partnerId)
    .single();
  if (partnerError) throw partnerError;

  return { mate, partner };
}

export async function getPendingInvite(userId: string): Promise<MateRow | null> {
  const { data, error } = await client()
    .from("qt_mates")
    .select("*")
    .eq("requester_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createInvite(userId: string): Promise<MateRow> {
  const existing = await getPendingInvite(userId);
  if (existing) return existing;

  const { data, error } = await client()
    .from("qt_mates")
    .insert({ requester_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getInvitePreview(token: string) {
  const { data, error } = await client().rpc("get_invite", { token });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function acceptInvite(token: string): Promise<MateRow> {
  const { data, error } = await client().rpc("accept_invite", { token });
  if (error) throw error;
  return data;
}

export async function endMate(mateId: string) {
  const { error } = await client().from("qt_mates").update({ status: "ended" }).eq("id", mateId);
  if (error) throw error;
}

// 상대의 오늘 엔트리 + 답변 (RLS 가 둘 다 완료했을 때만 통과시킴)
export async function getMateEntry(
  partnerId: string,
  dateKey: string
): Promise<RemoteEntry | null> {
  const scriptureId = await scriptureIdForDate(dateKey);
  if (!scriptureId) return null;

  const { data: entry, error } = await client()
    .from("qt_entries")
    .select("*")
    .eq("user_id", partnerId)
    .eq("daily_scripture_id", scriptureId)
    .maybeSingle();
  if (error) throw error;
  if (!entry) return null;

  return { entry, answers: await getAnswers(entry.id) };
}

// --- 반응 ----------------------------------------------------------------
export type ReactionType = "amen" | "pray" | "heart";

export async function getReactions(entryId: string) {
  const { data, error } = await client()
    .from("qt_reactions")
    .select("reaction_type, user_id")
    .eq("qt_entry_id", entryId);
  if (error) throw error;
  return data ?? [];
}

export async function toggleReaction(entryId: string, userId: string, type: ReactionType) {
  const { data: existing } = await client()
    .from("qt_reactions")
    .select("id")
    .eq("qt_entry_id", entryId)
    .eq("user_id", userId)
    .eq("reaction_type", type)
    .maybeSingle();

  if (existing) {
    const { error } = await client().from("qt_reactions").delete().eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await client()
    .from("qt_reactions")
    .insert({ qt_entry_id: entryId, user_id: userId, reaction_type: type });
  if (error) throw error;
  return true;
}
