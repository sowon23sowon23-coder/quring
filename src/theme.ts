// 프로토타입(curing-prototype.html)의 디자인 토큰을 그대로 옮긴 것
export const c = {
  navy: '#0B2545',
  deep: '#13315C',
  blue: '#1D4E89',
  primary: '#2E6FBF',
  accent: '#4A90D9',
  wave: '#7FB9E8',
  waveSoft: '#D6E9F8',
  mint: '#37B9A0',
  amber: '#E8A33D',
  bg: '#F8FBFE',
  card: '#FFFFFF',
  line: '#E8EFF7',
  text: '#1B3350',
  sub: '#6E88A4',
  muted: '#9DB1C6',
  onDark: '#E3F0FC',
  danger: '#D6635B',
  // 헤더 그라디언트 대신 단색 (expo-linear-gradient 없이 시작)
  head: '#4184C6',
} as const;

export const r = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 } as const;
export const sp = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 } as const;

export const shadow = {
  shadowColor: '#1D4E89',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;

/** ISO 요일 번호(1=월…7=일) 배열 → '월 · 수 · 금' */
export function formatDays(days: number[]): string {
  return [...days].sort((a, b) => a - b).map((d) => DAY_LABELS[d - 1]).join(' · ');
}

/** 로컬 기준 YYYY-MM-DD (toISOString은 UTC라 밤 9시 이후 날짜가 밀림) */
export function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 11 ? '좋은 아침이에요' : h < 18 ? '좋은 오후예요' : '좋은 저녁이에요';
  return `${part}, ${name}님 🌊`;
}
