import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Loading, Screen, Section } from '@/components/ui';
import { getDayState, type DayState } from '@/lib/api';
import { useSession } from '@/store/session';
import { QUESTIONS } from '@/types';
import { c, r, sp } from '@/theme';

export default function Wait() {
  const router = useRouter();
  const { pair, partner, solo } = useSession();
  const [day, setDay] = useState<DayState | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!pair) return;
      getDayState(pair.id).then((d) => {
        setDay(d);
        // 기다리는 동안 상대가 마쳤다면 바로 큐어링으로
        if (d.unlocked) router.replace('/qt/together');
      });
    }, [pair, router])
  );

  if (!day?.mine) return <Loading />;
  const mine = day.mine;
  const answers = [mine.a1, mine.a2, mine.a3];

  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingVertical: sp.xl }}>
        <Text style={{ fontSize: 58 }}>🌱</Text>
        <Text style={s.h}>오늘의 큐티 완료!</Text>
        <Text style={s.p}>
          {solo
            ? '오늘도 말씀 앞에 앉으셨네요.'
            : `${partner?.name}님의 큐티를 기다리고 있어요.\n서로 작성하면 묵상이 공개돼요.`}
        </Text>
      </View>

      {!solo && (
        <View style={s.locked}>
          <Text style={{ fontSize: 30, opacity: 0.55 }}>🔒</Text>
          <Text style={s.lockedText}>{partner?.name}님의 답변</Text>
        </View>
      )}

      <Section>내가 쓴 묵상</Section>
      <Card>
        {mine.picked_verses.length > 0 && (
          <>
            <Text style={s.label}>내가 표시한 구절</Text>
            <View style={s.chips}>
              {[...mine.picked_verses].sort((a, b) => a - b).map((n) => (
                <Text key={n} style={s.chip}>
                  {n}절
                </Text>
              ))}
            </View>
          </>
        )}
        {QUESTIONS.map((q, i) => (
          <View key={i} style={{ marginBottom: i < 2 ? sp.md : 0 }}>
            <Text style={s.label}>
              Q{i + 1}. {q}
            </Text>
            <Text style={s.answer}>{answers[i] || '—'}</Text>
          </View>
        ))}
      </Card>

      {solo && (
        <View style={s.nudge}>
          <Text style={s.nudgeTitle}>🤝 이 묵상을 나눌 사람이 있나요?</Text>
          <Text style={s.nudgeBody}>
            큐티메이트를 초대하면 다음 큐티부터 서로의 묵상을 나눌 수 있어요.
          </Text>
          <Button label="큐티메이트 초대하기" variant="soft" onPress={() => router.replace('/(tabs)/my')} />
        </View>
      )}

      <Button
        label="홈으로"
        variant="ghost"
        style={{ marginTop: sp.md }}
        onPress={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  h: { fontSize: 21, fontWeight: '800', color: c.deep, marginTop: sp.md },
  p: { fontSize: 13.5, color: c.sub, textAlign: 'center', lineHeight: 23, marginTop: sp.xs },
  locked: {
    backgroundColor: '#EFF4F9',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C7D6E6',
    borderRadius: r.lg,
    padding: 34,
    alignItems: 'center',
  },
  lockedText: { fontSize: 13, color: c.muted, fontWeight: '700', marginTop: 9 },
  label: { fontSize: 12, fontWeight: '700', color: c.muted, marginBottom: 5 },
  answer: { fontSize: 14, lineHeight: 24, color: '#2E465F' },
  chips: { flexDirection: 'row', gap: 5, marginBottom: sp.md },
  chip: {
    backgroundColor: c.waveSoft,
    color: c.blue,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11.5,
    fontWeight: '800',
    overflow: 'hidden',
  },
  nudge: {
    marginTop: sp.lg,
    backgroundColor: '#EAF3FB',
    borderWidth: 1,
    borderColor: '#DCE9F6',
    borderRadius: r.lg,
    padding: sp.lg,
    gap: sp.sm,
  },
  nudgeTitle: { fontSize: 14, fontWeight: '800', color: c.deep, textAlign: 'center' },
  nudgeBody: { fontSize: 12.5, color: c.sub, textAlign: 'center', lineHeight: 20, marginBottom: 4 },
});
