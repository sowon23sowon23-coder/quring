import { useRef, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Loading } from '@/components/ui';
import { VerseList } from '@/components/VerseList';
import { completeEntry, getPassage, saveDraft } from '@/lib/api';
import { useDraft } from '@/store/draft';
import { useSession } from '@/store/session';
import { QUESTIONS, type Passage } from '@/types';
import { c, r, shadow, sp } from '@/theme';

export default function Write() {
  const router = useRouter();
  const draft = useDraft();
  const scrollRef = useRef<ScrollView>(null);
  const { pair, partner, solo } = useSession();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPassage().then(setPassage);
  }, []);

  if (!passage || !pair) return <Loading />;

  const answers = [draft.a1, draft.a2, draft.a3];
  const filled = answers.filter((a) => a.trim().length > 0).length;
  const sorted = [...draft.picked].sort((a, b) => a - b);

  function quote() {
    if (sorted.length === 0) return Alert.alert('먼저 본문에서 구절을 표시해 주세요');
    const text =
      sorted
        .map((n) => `“${passage!.verses[n - 1].t}” (${passage!.short_ref}:${n})`)
        .join('\n') + '\n';
    draft.set({ a1: text + draft.a1 });
  }

  async function submit() {
    setBusy(true);
    try {
      const entry = await saveDraft({
        pairId: pair!.id,
        passageId: passage!.id,
        picked: draft.picked,
        a1: draft.a1,
        a2: draft.a2,
        a3: draft.a3,
      });
      await completeEntry(entry.id);
      draft.reset();
      router.replace('/qt/wait');
    } catch (e: any) {
      Alert.alert('저장 실패', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 16, color: c.deep }}>‹</Text>
        </Pressable>
        <Text style={s.navTitle}>묵상 작성</Text>
        <Text style={s.prog}>{filled} / 3</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: sp.lg, paddingBottom: 320 }}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[0]}
        >
          {/* 스크롤해도 따라오는 말씀 패널 */}
          <View style={s.dockWrap}>
            <View style={s.dock}>
              <Pressable style={s.dockHead} onPress={() => setOpen(!open)}>
                <Text style={{ fontSize: 15 }}>📖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.dockRef}>{passage.ref}</Text>
                  <Text style={s.dockSub} numberOfLines={1}>
                    {sorted.length
                      ? `내가 표시한 구절 ${sorted.map((n) => `${passage.short_ref}:${n}`).join(', ')}`
                      : `전체 ${passage.verses.length}절 · 탭하면 구절을 표시할 수 있어요`}
                  </Text>
                </View>
                <Text style={s.chev}>{open ? '⌃' : '⌄'}</Text>
              </Pressable>

              {open && (
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  <View style={{ padding: 12 }}>
                    <VerseList
                      compact
                      verses={passage.verses}
                      picked={draft.picked}
                      onToggle={(n) =>
                        draft.set({
                          picked: draft.picked.includes(n)
                            ? draft.picked.filter((x) => x !== n)
                            : [...draft.picked, n],
                        })
                      }
                    />
                  </View>
                </ScrollView>
              )}

              <View style={s.tools}>
                <Pressable onPress={() => setOpen(!open)} style={s.tool}>
                  <Text style={s.toolText}>{open ? '접기' : '본문 펼치기'}</Text>
                </Pressable>
                <Pressable onPress={quote} style={[s.tool, sorted.length === 0 && { opacity: 0.45 }]}>
                  <Text style={s.toolText}>
                    ＋ 표시한 {sorted.length > 0 ? `${sorted.length}절 ` : ''}인용
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {QUESTIONS.map((q, i) => (
            <View key={i}>
              <View style={s.qbar}>
                <Text style={s.qnum}>{i + 1}</Text>
                <Text style={s.q}>{q}</Text>
              </View>
              <TextInput
                multiline
                value={answers[i]}
                onChangeText={(t) => draft.set({ [`a${i + 1}`]: t } as any)}
                onFocus={() => {
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: 180 + i * 190, animated: true });
                  }, 120);
                }}
                placeholder={
                  ['마음에 남은 구절과 이유를 적어보세요', '오늘 하루 안에서 실천할 수 있는 한 가지', '짧아도 괜찮아요'][i]
                }
                placeholderTextColor={c.muted}
                style={s.input}
              />
            </View>
          ))}

          <Button
            label="오늘 큐티 완료하기"
            disabled={filled < 3}
            loading={busy}
            onPress={submit}
            style={{ marginTop: sp.lg }}
          />
          <Text style={s.lock}>
            {solo ? '🔒 내 묵상은 나만 볼 수 있어요' : `🔒 ${partner?.name}님도 작성해야 서로에게 공개돼요`}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: sp.md, paddingVertical: sp.sm },
  back: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  navTitle: { fontSize: 15.5, fontWeight: '700', color: c.text },
  prog: { marginLeft: 'auto', fontSize: 12.5, color: c.muted, fontWeight: '700' },
  dockWrap: { backgroundColor: c.bg, paddingBottom: 6 },
  dock: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.line,
    overflow: 'hidden',
    ...shadow,
  },
  dockHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 },
  dockRef: { fontSize: 13, fontWeight: '800', color: c.deep },
  dockSub: { fontSize: 11.5, color: c.sub, marginTop: 2 },
  chev: { fontSize: 12, color: c.muted, fontWeight: '800' },
  tools: { flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingBottom: 12 },
  tool: {
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: '#F8FBFE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toolText: { fontSize: 11.5, fontWeight: '700', color: c.sub },
  qbar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: sp.xl, marginBottom: sp.sm },
  qnum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: c.primary,
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  q: { flex: 1, fontSize: 14.5, fontWeight: '800', color: c.deep, lineHeight: 21 },
  input: {
    minHeight: 104,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: c.line,
    borderRadius: r.sm,
    padding: 15,
    fontSize: 14.5,
    lineHeight: 24,
    color: c.text,
    textAlignVertical: 'top',
  },
  lock: { fontSize: 12.5, color: c.sub, textAlign: 'center', marginTop: sp.sm },
});
