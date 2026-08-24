import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Loading, Screen } from '@/components/ui';
import { getDayState, getReactions, toggleReaction, type DayState } from '@/lib/api';
import { useSession } from '@/store/session';
import { QUESTIONS, REACTIONS, type ReactionKind } from '@/types';
import { c, r, sp } from '@/theme';

export default function Together() {
  const router = useRouter();
  const { profile, pair, partner } = useSession();
  const [day, setDay] = useState<DayState | null>(null);
  const [mine, setMine] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!pair || !profile) return;
    const d = await getDayState(pair.id);
    setDay(d);
    if (d.partner) {
      const rs = await getReactions(d.partner.id);
      setMine(new Set(rs.filter((x) => x.user_id === profile.id).map((x) => `${x.question}-${x.kind}`)));
    }
  }, [pair, profile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!day?.mine) return <Loading />;
  if (!day.partner) {
    return (
      <Screen>
        <Card>
          <Text style={s.h}>아직 열리지 않았어요</Text>
          <Text style={s.p}>두 사람이 모두 묵상을 마쳐야 서로의 글이 공개됩니다.</Text>
          <Button label="돌아가기" variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </Card>
      </Screen>
    );
  }

  const myAnswers = [day.mine.a1, day.mine.a2, day.mine.a3];
  const theirAnswers = [day.partner.a1, day.partner.a2, day.partner.a3];
  const myPicks = [...day.mine.picked_verses].sort((a, b) => a - b);
  const theirPicks = [...day.partner.picked_verses].sort((a, b) => a - b);
  const overlap = myPicks.filter((n) => theirPicks.includes(n));

  async function react(question: number, kind: ReactionKind) {
    const key = `${question}-${kind}`;
    const next = new Set(mine);
    next.has(key) ? next.delete(key) : next.add(key);
    setMine(next);
    try {
      await toggleReaction(day!.partner!.id, question, kind);
    } catch {
      load();
    }
  }

  return (
    <Screen>
      <View style={s.banner}>
        <Text style={s.bannerTitle}>🔓 오늘의 큐어링</Text>
        <Text style={s.bannerSub}>두 사람 모두 묵상을 마쳤어요</Text>
      </View>

      <Card style={{ marginTop: sp.md }}>
        <Text style={s.label}>각자 표시한 구절</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PickBox name={`${profile?.avatar} ${profile?.name}`} picks={myPicks} mine />
          <PickBox name={`${partner?.avatar} ${partner?.name}`} picks={theirPicks} />
        </View>
        {overlap.length > 0 && (
          <Text style={s.overlap}>✨ 같은 구절에 마음이 머물렀어요 ({overlap.join(', ')}절)</Text>
        )}
      </Card>

      {QUESTIONS.map((q, i) => (
        <View key={i} style={{ marginTop: sp.xl }}>
          <Text style={s.q}>
            Q{i + 1}. {q}
          </Text>

          <View style={[s.ans, s.ansMine]}>
            <Text style={s.who}>
              {profile?.avatar} {profile?.name}
            </Text>
            <Text style={s.text}>{myAnswers[i] || '—'}</Text>
          </View>

          <View style={[s.ans, s.ansTheirs]}>
            <Text style={s.who}>
              {partner?.avatar} {partner?.name}
            </Text>
            <Text style={s.text}>{theirAnswers[i] || '—'}</Text>
            <View style={s.reactions}>
              {REACTIONS.map((rx) => {
                const on = mine.has(`${i + 1}-${rx.kind}`);
                return (
                  <Pressable
                    key={rx.kind}
                    onPress={() => react(i + 1, rx.kind)}
                    style={[s.rx, on && s.rxOn]}
                  >
                    <Text style={[s.rxText, on && { color: c.blue }]}>{rx.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      ))}

      <Button
        label="홈으로"
        variant="ghost"
        style={{ marginTop: sp.xl }}
        onPress={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}

function PickBox({ name, picks, mine }: { name: string; picks: number[]; mine?: boolean }) {
  return (
    <View style={[s.pick, mine ? s.pickMine : s.pickTheirs]}>
      <Text style={s.pickName}>{name}</Text>
      <Text style={[s.pickVal, !mine && { color: '#B8852F' }]}>
        {picks.length ? picks.map((n) => `${n}절`).join(', ') : '표시 없음'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: { backgroundColor: c.mint, borderRadius: r.lg, padding: sp.lg, alignItems: 'center' },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 12.5, color: 'rgba(255,255,255,.92)', marginTop: 5 },
  h: { fontSize: 17, fontWeight: '800', color: c.deep, marginBottom: sp.xs },
  p: { fontSize: 13, color: c.sub, lineHeight: 21, marginBottom: sp.md },
  label: { fontSize: 12, fontWeight: '700', color: c.muted, marginBottom: 9 },
  pick: { flex: 1, borderRadius: 14, padding: 11, alignItems: 'center', borderWidth: 1 },
  pickMine: { backgroundColor: '#F1F6FC', borderColor: '#DCE9F6' },
  pickTheirs: { backgroundColor: '#FFF9F0', borderColor: '#F5E6CC' },
  pickName: { fontSize: 12, fontWeight: '800', color: c.deep },
  pickVal: { fontSize: 12.5, fontWeight: '700', color: c.blue, marginTop: 5 },
  overlap: { fontSize: 12.5, color: c.sub, textAlign: 'center', marginTop: 10 },
  q: { fontSize: 13.5, fontWeight: '800', color: c.deep, marginBottom: sp.sm, lineHeight: 20 },
  ans: { borderRadius: 18, padding: 15, marginBottom: 9, borderWidth: 1 },
  ansMine: { backgroundColor: '#F1F6FC', borderColor: '#DCE9F6' },
  ansTheirs: { backgroundColor: '#FFF9F0', borderColor: '#F5E6CC' },
  who: { fontSize: 12.5, fontWeight: '800', color: c.deep, marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 24, color: '#2E465F' },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 11 },
  rx: {
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  rxOn: { backgroundColor: c.waveSoft, borderColor: c.wave },
  rxText: { fontSize: 12, fontWeight: '700', color: c.sub },
});
