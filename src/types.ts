export type Verse = { n: number; t: string };

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  created_at: string;
};

export type Pair = {
  id: string;
  user_a: string;
  user_b: string | null;
  invite_code: string;
  days: number[];
  notify_at: string;
  started_on: string;
  created_at: string;
};

export type Passage = {
  id: string;
  date: string;
  ref: string;
  short_ref: string;
  verses: Verse[];
};

export type Entry = {
  id: string;
  pair_id: string;
  user_id: string;
  date: string;
  passage_id: string | null;
  picked_verses: number[];
  a1: string;
  a2: string;
  a3: string;
  completed_at: string | null;
  updated_at: string;
};

export type ReactionKind = 'pray' | 'empathy' | 'cheer';

export type Reaction = {
  id: string;
  entry_id: string;
  user_id: string;
  question: number;
  kind: ReactionKind;
  created_at: string;
};

export const REACTIONS: { kind: ReactionKind; label: string }[] = [
  { kind: 'pray', label: '🙏 같이 기도할게' },
  { kind: 'empathy', label: '💛 공감해' },
  { kind: 'cheer', label: '🌱 응원해' },
];

export const QUESTIONS = [
  '오늘 가장 마음에 남은 말씀은 무엇인가요?',
  '이 말씀을 내 삶에 어떻게 적용할 수 있을까요?',
  '오늘 하나님께 드리고 싶은 기도는 무엇인가요?',
] as const;

// supabase-js 제네릭용 최소 정의.
// 정식 타입은 `npx supabase gen types typescript` 로 교체하세요.
export type Database = any;
