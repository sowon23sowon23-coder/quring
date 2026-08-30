import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type DailyScripture = Database["public"]["Tables"]["daily_scriptures"]["Row"];
type QtEntry = Database["public"]["Tables"]["qt_entries"]["Row"];
type QuestionKey = Database["public"]["Tables"]["qt_answers"]["Row"]["question_key"];

const questionKeys: QuestionKey[] = ["heart_verse", "message", "practice", "prayer"];

export async function getTodayScripture(today = new Date()): Promise<DailyScripture | null> {
  if (!supabase) return null;

  const date = today.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_scriptures")
    .select("*")
    .eq("scripture_date", date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureQtEntry(userId: string, dailyScriptureId: string): Promise<QtEntry | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("qt_entries")
    .upsert(
      {
        user_id: userId,
        daily_scripture_id: dailyScriptureId,
        status: "draft"
      },
      { onConflict: "user_id,daily_scripture_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function saveQtAnswers(qtEntryId: string, answers: Record<number, string>) {
  if (!supabase) return;

  const rows = questionKeys.map((questionKey, index) => ({
    qt_entry_id: qtEntryId,
    question_key: questionKey,
    answer_text: answers[index] ?? "",
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase.from("qt_answers").upsert(rows, {
    onConflict: "qt_entry_id,question_key"
  });

  if (error) throw error;
}

export async function completeQtEntry(qtEntryId: string, wordCount: number) {
  if (!supabase) return;

  const { error } = await supabase
    .from("qt_entries")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      word_count: wordCount,
      updated_at: new Date().toISOString()
    })
    .eq("id", qtEntryId);

  if (error) throw error;
}
