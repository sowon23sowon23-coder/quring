import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Loading } from '@/components/ui';
import { getDayState, getPassage, type DayState } from '@/lib/api';
import { useSession } from '@/store/session';
import { c, formatDays, greeting, r, shadow, sp } from '@/theme';
import type { Passage } from '@/types';

export default function Home() {
  const router = useRouter();
  const { profile, pair, partner, solo, loading } = useSession();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [day, setDay] = useState<DayState | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    if (!pair) return;
    setBusy(true);
    const [p, d] = await Promise.all([getPassage(), getDayState(pair.id)]);
    setPassage(p);
    setDay(d);
    setBusy(false);
  }, [pair]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !pair || !profile) return <Loading />;

  const myDone = !!day?.mine?.completed_at;
  const partnerDone = !!day?.partner?.completed_at;
  const unlocked = !!day?.unlocked;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={load} tintColor={c.primary} />}
      >
        {/* 헤더 */}
        <View style={s.head}>
          <Text style={s.greet}>{greeting(profile.name)}</Text>
          <Text style={s.sub}>
            {solo ? '오늘은 큐티하는 날이에요' : '오늘은 함께 큐티하는 날이에요'}
          </Text>
          <View style={s.strip}>
            <Text style={{ fontSize: 20 }}>{solo ? '🌱' : partner?.avatar ?? '👩'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.stripTitle}>
                {solo ? '혼자 큐티 중' : `${partner?.name}와 함께 큐티 중`}
              </Text>
              <Text style={s.stripSub}>{formatDays(pair.days)}</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: sp.lg, marginTop: -14 }}>
          {/* 오늘의 말씀 */}
          <Card>
            <Text style={s.tag}>오늘의 말씀</Text>
            <Text style={s.ref}>{passage?.ref ?? '오늘 본문이 아직 없어요'}</Text>
            {passage && (
              <View style={s.quote}>
                <Text style={s.quoteText}>오늘 함께 읽을 본문이에요</Text>
                <Text style={s.quoteStrong}>전체 {passage.verses.length}절 · 약 5분</Text>
              </View>
            )}
            <View style={{ marginTop: sp.md }}>
              {!myDone ? (
                <Button
                  label="오늘 큐티 시작하기"
                  onPress={() => router.push('/qt/verse')}
                  disabled={!passage}
                />
              ) : unlocked ? (
                <Button
                  label="오늘의 묵상 다시 보기"
                  variant="ghost"
                  onPress={() => router.push('/qt/together')}
                />
              ) : (
                <Button
                  label={solo ? '내 묵상 보기' : `🔒 ${partner?.name}님을 기다리는 중`}
                  variant="ghost"
                  onPress={() => router.push('/qt/wait')}
                />
              )}
            </View>
          </Card>

          {/* 상태 */}
          <Text style={s.section}>{solo ? '오늘 나' : '오늘 우리'}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatusCell
              label={`${profile.avatar} ${profile.name}`}
              done={myDone}
              text={myDone ? '⭕ 완료' : '⏳ 작성 전'}
            />
            {!solo && (
              <StatusCell
                label={`${partner?.avatar} ${partner?.name}`}
                done={partnerDone}
                text={partnerDone ? '⭕ 완료' : '⏳ 아직 작성 전'}
              />
            )}
          </View>

          {unlocked && (
            <View style={s.banner}>
              <Text style={s.bannerText}>🎉 오늘의 큐어링이 열렸어요</Text>
              <Button
                label="서로의 묵상 보기"
                variant="ghost"
                onPress={() => router.push('/qt/together')}
              />
            </View>
          )}

          {solo && (
            <View style={s.nudge}>
              <Text style={s.nudgeTitle}>🤝 함께할 사람이 있나요?</Text>
              <Text style={s.nudgeBody}>
                한 사람을 초대하면 서로의 묵상을 나누는 큐어링이 열려요.{'\n'}
                지금까지의 기록은 그대로 유지돼요.
              </Text>
              <Button
                label="큐티메이트 초대하기"
                variant="soft"
                onPress={() => router.push('/(tabs)/my')}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusCell({ label, done, text }: { label: string; done: boolean; text: string }) {
  return (
    <View style={[s.cell, done && s.cellDone]}>
      <Text style={s.cellLabel}>{label}</Text>
      <Text style={[s.cellText, done && { color: c.mint }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: {
    backgroundColor: c.head,
    paddingHorizontal: sp.lg,
    paddingTop: sp.md,
    paddingBottom: 34,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greet: { fontSize: 20, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: c.onDark, marginTop: 3 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: sp.lg,
    backgroundColor: 'rgba(255,255,255,.15)',
    borderRadius: 18,
    padding: 13,
  },
  stripTitle: { fontSize: 13.5, fontWeight: '700', color: '#fff' },
  stripSub: { fontSize: 11.5, color: c.onDark, marginTop: 2 },
  tag: { fontSize: 11.5, fontWeight: '800', color: c.accent, letterSpacing: 1 },
  ref: { fontSize: 19, fontWeight: '800', color: c.deep, marginTop: 8, marginBottom: 12 },
  quote: {
    backgroundColor: '#F1F7FC',
    borderRadius: r.md,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: c.wave,
  },
  quoteText: { fontSize: 14, color: c.blue, fontWeight: '600' },
  quoteStrong: { fontSize: 14, color: c.deep, fontWeight: '800', marginTop: 4 },
  section: { fontSize: 14.5, fontWeight: '800', color: c.deep, marginTop: sp.xl, marginBottom: sp.sm },
  cell: {
    flex: 1,
    backgroundColor: '#F6F9FC',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: r.md,
    padding: 13,
    alignItems: 'center',
  },
  cellDone: { backgroundColor: '#EAF7F3', borderColor: '#C9EBE1' },
  cellLabel: { fontSize: 13, fontWeight: '800', color: c.deep },
  cellText: { fontSize: 11.5, fontWeight: '700', color: c.muted, marginTop: 5 },
  banner: {
    marginTop: sp.md,
    backgroundColor: c.mint,
    borderRadius: 18,
    padding: sp.lg,
    gap: sp.sm,
  },
  bannerText: { color: '#fff', fontSize: 14.5, fontWeight: '800', textAlign: 'center' },
  nudge: {
    marginTop: sp.xl,
    backgroundColor: '#EAF3FB',
    borderWidth: 1,
    borderColor: '#DCE9F6',
    borderRadius: r.lg,
    padding: sp.lg,
    gap: sp.sm,
    ...shadow,
  },
  nudgeTitle: { fontSize: 14, fontWeight: '800', color: c.deep, textAlign: 'center' },
  nudgeBody: { fontSize: 12.5, color: c.sub, textAlign: 'center', lineHeight: 20, marginBottom: 4 },
});
