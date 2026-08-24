import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, Loading, Screen, Section } from '@/components/ui';
import { getMonthStats } from '@/lib/api';
import { useSession } from '@/store/session';
import { c, r, sp } from '@/theme';

export default function Record() {
  const { pair, solo, loading } = useSession();
  const [stats, setStats] = useState<Record<string, number>>({});
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useFocusEffect(
    useCallback(() => {
      if (pair) getMonthStats(pair.id, year, month).then(setStats);
    }, [pair, year, month])
  );

  if (loading || !pair) return <Loading />;

  // 달력 그리드 (월요일 시작)
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const doneCount = Object.values(stats).filter((n) => (solo ? n >= 1 : n >= 2)).length;

  return (
    <Screen>
      <Text style={s.h}>기록</Text>

      <Card style={{ marginTop: sp.md }}>
        <Text style={s.month}>
          {year}년 {month}월
        </Text>
        <View style={s.grid}>
          {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
            <Text key={d} style={s.dow}>
              {d}
            </Text>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <View key={`e${i}`} style={s.cell} />;
            const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const n = stats[key] ?? 0;
            const both = solo ? n >= 1 : n >= 2;
            const partial = !solo && n === 1;
            return (
              <View key={key} style={[s.cell, both && s.cellBoth, partial && s.cellPartial]}>
                <Text style={[s.cellNum, both && { color: c.blue, fontWeight: '800' }]}>{d}</Text>
                <Text style={{ fontSize: 12 }}>{both ? (solo ? '🌱' : '🌊') : partial ? '🌤' : ''}</Text>
              </View>
            );
          })}
        </View>
        <Text style={s.legend}>
          {solo ? '🌱 큐티 완료 · ○ 쉼' : '🌊 둘 다 완료 · 🌤 나만 완료 · ○ 쉼'}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: sp.md }}>
        <Stat value={String(doneCount)} label={solo ? '이번 달 큐티' : '이번 달 함께'} />
        <Stat value={`${Object.keys(stats).length}`} label="기록된 날" />
        <Stat
          value={`${Math.round((doneCount / Math.max(daysInMonth, 1)) * 100)}%`}
          label="이번 달 달성"
        />
      </View>

      <Section>주간 나눔</Section>
      <Card>
        <Text style={s.soonTitle}>💬 이번 주 나눔 카드</Text>
        <Text style={s.soonBody}>
          한 주 치 묵상이 쌓이면 키워드와 나눔 질문을 자동으로 만들어 드릴 예정이에요.{'\n'}
          (v1.1 — Supabase Edge Function + 요약 모델)
        </Text>
      </Card>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  h: { fontSize: 20, fontWeight: '800', color: c.deep },
  month: { fontSize: 16, fontWeight: '800', color: c.deep, textAlign: 'center', marginBottom: sp.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dow: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 11, color: c.muted, fontWeight: '700', marginBottom: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  cellBoth: { backgroundColor: '#E8F3FC' },
  cellPartial: { backgroundColor: '#FFF6E8' },
  cellNum: { fontSize: 12.5, color: '#8FA3B8' },
  legend: { fontSize: 11.5, color: c.sub, textAlign: 'center', marginTop: sp.md },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.line,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: c.blue },
  statLabel: { fontSize: 11.5, color: c.muted, fontWeight: '700', marginTop: 4 },
  soonTitle: { fontSize: 14, fontWeight: '800', color: c.deep, marginBottom: sp.xs },
  soonBody: { fontSize: 12.5, color: c.sub, lineHeight: 20 },
});
