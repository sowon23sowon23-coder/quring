import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { today } from '@/theme';
import type { Entry, Pair, Passage, Profile, ReactionKind } from '@/types';

const LOCAL_KEYS = [
  'curing:guest-profile',
  'curing:guest-pair',
  'curing:guest-entries',
  'curing:guest-reactions',
];

const LOCAL_PROFILE_KEY = LOCAL_KEYS[0];
const LOCAL_PAIR_KEY = LOCAL_KEYS[1];

function inviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function localId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getLocalProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

async function getLocalPair(): Promise<Pair | null> {
  const raw = await AsyncStorage.getItem(LOCAL_PAIR_KEY);
  return raw ? (JSON.parse(raw) as Pair) : null;
}

const FALLBACK_PASSAGE: Passage = {
  id: 'fallback-passage',
  date: today(),
  ref: '요한복음 15:1-8',
  short_ref: '요 15',
  verses: [
    { n: 1, t: '나는 참포도나무요 내 아버지는 농부라' },
    {
      n: 2,
      t: '무릇 내게 붙어 있어 열매를 맺지 아니하는 가지는 아버지께서 그것을 제거해 버리시고 열매를 맺는 가지는 더 열매를 맺게 하려 하여 그것을 깨끗하게 하시느니라',
    },
    { n: 3, t: '너희는 내가 일러준 말로 이미 깨끗하여졌으니' },
    {
      n: 4,
      t: '내 안에 거하라 나도 너희 안에 거하리라 가지가 포도나무에 붙어 있지 아니하면 스스로 열매를 맺을 수 없음 같이 너희도 내 안에 있지 아니하면 그러하리라',
    },
    {
      n: 5,
      t: '나는 포도나무요 너희는 가지라 그가 내 안에 내가 그 안에 거하면 사람이 열매를 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라',
    },
  ],
};

async function uid(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('사용자 세션을 찾을 수 없어요.');
  return data.user.id;
}

export async function clearLocalData() {
  await AsyncStorage.multiRemove(LOCAL_KEYS);
  await supabase.auth.signOut();
}

export async function getMyProfile(): Promise<Profile | null> {
  try {
    const id = await uid();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  } catch {
    return getLocalProfile();
  }
}

export async function updateProfile(patch: Partial<Pick<Profile, 'name' | 'avatar'>>) {
  try {
    const id = await uid();
    const { error } = await supabase
      .from('profiles')
      .upsert({ id, ...patch }, { onConflict: 'id' });
    if (error) throw error;
  } catch {
    const existing = await getLocalProfile();
    const next: Profile = {
      id: existing?.id ?? localId('profile'),
      name: patch.name ?? existing?.name ?? '',
      avatar: patch.avatar ?? existing?.avatar ?? '🌱',
      created_at: existing?.created_at ?? new Date().toISOString(),
    };
    await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
  }
}

export async function getMyPair(): Promise<Pair | null> {
  try {
    const id = await uid();
    const { data, error } = await supabase
      .from('pairs')
      .select('*')
      .or(`user_a.eq.${id},user_b.eq.${id}`)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as Pair | null;
  } catch {
    return getLocalPair();
  }
}

export async function createSoloPair(days: number[]): Promise<Pair> {
  const existing = await getMyPair();
  if (existing) return existing;

  try {
    const id = await uid();
    const { data, error } = await supabase
      .from('pairs')
      .insert({ user_a: id, days })
      .select()
      .single();
    if (error) throw error;
    return data as Pair;
  } catch {
    const profile = await getLocalProfile();
    const now = new Date().toISOString();
    const pair: Pair = {
      id: localId('pair'),
      user_a: profile?.id ?? localId('profile'),
      user_b: null,
      invite_code: inviteCode(),
      days,
      notify_at: '09:00',
      started_on: now.slice(0, 10),
      created_at: now,
    };
    await AsyncStorage.setItem(LOCAL_PAIR_KEY, JSON.stringify(pair));
    return pair;
  }
}

export async function joinPair(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_pair', { p_code: code.trim() });
  if (error) throw error;
  return data as string;
}

export async function updatePair(pairId: string, patch: Partial<Pick<Pair, 'days' | 'notify_at'>>) {
  try {
    const { error } = await supabase.from('pairs').update(patch).eq('id', pairId);
    if (error) throw error;
  } catch {
    const existing = await getLocalPair();
    if (!existing) return;
    await AsyncStorage.setItem(LOCAL_PAIR_KEY, JSON.stringify({ ...existing, ...patch }));
  }
}

export async function getPartner(pair: Pair): Promise<Profile | null> {
  try {
    const me = await uid();
    const other = pair.user_a === me ? pair.user_b : pair.user_a;
    if (!other) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', other).maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  } catch {
    return null;
  }
}

export async function getPassage(date = today()): Promise<Passage | null> {
  try {
    const { data, error } = await supabase
      .from('passages')
      .select('*')
      .eq('date', date)
      .maybeSingle();
    if (error) throw error;
    return (data as Passage | null) ?? { ...FALLBACK_PASSAGE, date };
  } catch {
    return { ...FALLBACK_PASSAGE, date };
  }
}

export async function getDayEntries(pairId: string, date = today()): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('pair_id', pairId)
    .eq('date', date);
  if (error) throw error;
  return (data ?? []) as Entry[];
}

export async function getDayDetail(pairId: string, date: string) {
  const [passage, entries] = await Promise.all([getPassage(date), getDayEntries(pairId, date)]);
  return { passage, entries };
}

export type DayState = {
  mine: Entry | null;
  partner: Entry | null;
  unlocked: boolean;
};

export async function getDayState(pairId: string, date = today()): Promise<DayState> {
  const me = await uid();
  const rows = await getDayEntries(pairId, date);
  const mine = rows.find((entry) => entry.user_id === me) ?? null;
  const partner = rows.find((entry) => entry.user_id !== me) ?? null;
  return {
    mine,
    partner,
    unlocked: !!mine?.completed_at && !!partner?.completed_at,
  };
}

export async function saveDraft(input: {
  pairId: string;
  passageId: string | null;
  date?: string;
  picked: number[];
  a1: string;
  a2: string;
  a3: string;
}): Promise<Entry> {
  const me = await uid();
  const { data, error } = await supabase
    .from('entries')
    .upsert(
      {
        pair_id: input.pairId,
        user_id: me,
        date: input.date ?? today(),
        passage_id: input.passageId,
        picked_verses: input.picked,
        a1: input.a1,
        a2: input.a2,
        a3: input.a3,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'pair_id,user_id,date' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as Entry;
}

export async function completeEntry(entryId: string): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', entryId)
    .select()
    .single();
  if (error) throw error;
  return data as Entry;
}

export async function getReactions(entryId: string) {
  const { data, error } = await supabase.from('reactions').select('*').eq('entry_id', entryId);
  if (error) throw error;
  return data ?? [];
}

export async function toggleReaction(entryId: string, question: number, kind: ReactionKind) {
  const me = await uid();
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('entry_id', entryId)
    .eq('user_id', me)
    .eq('question', question)
    .eq('kind', kind)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from('reactions')
    .insert({ entry_id: entryId, user_id: me, question, kind });
  if (error) throw error;
  return true;
}

export async function getMonthStats(pairId: string, year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = new Date(year, month, 0);
  const toStr = `${year}-${String(month).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('entries')
    .select('date, user_id, completed_at')
    .eq('pair_id', pairId)
    .gte('date', from)
    .lte('date', toStr)
    .not('completed_at', 'is', null);
  if (error) throw error;

  const byDate: Record<string, number> = {};
  for (const row of data ?? []) byDate[row.date] = (byDate[row.date] ?? 0) + 1;
  return byDate;
}
