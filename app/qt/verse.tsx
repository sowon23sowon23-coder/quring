import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Loading } from '@/components/ui';
import { VerseList } from '@/components/VerseList';
import { getPassage } from '@/lib/api';
import { useDraft } from '@/store/draft';
import { c, r, sp } from '@/theme';
import type { Passage } from '@/types';

export default function Verse() {
  const router = useRouter();
  const draft = useDraft();
  const [passage, setPassage] = useState<Passage | null>(null);

  useEffect(() => {
    getPassage().then(setPassage);
  }, []);

  if (!passage) return <Loading />;

  const toggle = (n: number) =>
    draft.set({
      picked: draft.picked.includes(n)
        ? draft.picked.filter((x) => x !== n)
        : [...draft.picked, n],
    });

  const sorted = [...draft.picked].sort((a, b) => a - b);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <View style={s.head}>
        <Pressable onPress={() => router.back()} style={s.close}>
          <Text style={{ color: '#fff', fontSize: 15 }}>✕</Text>
        </Pressable>
        <Text style={s.date}>{formatDate(passage.date)}</Text>
        <Text style={s.ref}>{passage.ref}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: 40 }}>
        <Text style={s.guide}>마음에 남는 절을 탭해 표시해 보세요 · 선택은 자유예요</Text>

        <Card style={{ padding: sp.md }}>
          <VerseList verses={passage.verses} picked={draft.picked} onToggle={toggle} />
        </Card>

        <View style={s.pickBar}>
          <Text style={s.pickText}>
            {sorted.length ? '내가 표시한 구절' : '표시한 구절 없음'}
          </Text>
          <Text style={s.pickCount}>{sorted.length}절</Text>
          <Pressable onPress={() => draft.set({ picked: [] })} style={s.clear}>
            <Text style={s.clearText}>해제</Text>
          </Pressable>
        </View>

        {sorted.length > 0 && (
          <View style={s.chips}>
            {sorted.map((n) => (
              <Text key={n} style={s.chip}>
                {passage.short_ref}:{n}
              </Text>
            ))}
          </View>
        )}

        <Button
          label="묵상 시작하기"
          style={{ marginTop: sp.lg }}
          onPress={() => router.push('/qt/write')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${dow}요일`;
}

const s = StyleSheet.create({
  head: {
    backgroundColor: c.head,
    paddingHorizontal: sp.lg,
    paddingTop: sp.md,
    paddingBottom: sp.xl,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  close: {
    position: 'absolute',
    right: sp.lg,
    top: sp.md,
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  date: { fontSize: 12.5, color: c.onDark, fontWeight: '700' },
  ref: { fontSize: 23, fontWeight: '800', color: '#fff', marginTop: 7 },
  guide: { fontSize: 12.5, color: c.sub, textAlign: 'center', marginBottom: sp.sm },
  pickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: r.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: sp.md,
  },
  pickText: { fontSize: 13, fontWeight: '700', color: c.deep },
  pickCount: { marginLeft: 'auto', fontSize: 12, fontWeight: '700', color: c.muted, marginRight: 8 },
  clear: { backgroundColor: '#F1F6FB', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 },
  clearText: { fontSize: 11.5, fontWeight: '700', color: c.sub },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: sp.sm },
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
});
