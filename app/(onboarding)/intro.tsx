import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { c, sp } from '@/theme';

const SLIDES = [
  {
    emoji: '🌊',
    title: '혼자 말고,\n우리 같이 큐티해요',
    body: '매일 같은 말씀을 읽고\n소중한 사람과 마음을 나눠요.',
  },
  {
    emoji: '📖',
    title: '같은 말씀을 읽고\n각자의 묵상을 나눠요',
    body: '같은 본문, 다른 마음.\n그 차이가 서로를 자라게 해요.',
  },
  {
    emoji: '💌',
    title: '함께해야\n서로의 글이 열려요',
    body: '혼자 시작해도 괜찮아요.\n함께할 사람은 언제든 초대할 수 있어요.',
  },
];

export default function Intro() {
  const [i, setI] = useState(0);
  const router = useRouter();
  const first = i === 0;
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.steps}>
        {SLIDES.map((_, n) => (
          <View key={n} style={[s.step, n <= i && s.stepOn]} />
        ))}
      </View>

      <View style={s.body}>
        <Text style={s.emoji}>{slide.emoji}</Text>
        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.desc}>{slide.body}</Text>
      </View>

      <View style={s.dots}>
        {SLIDES.map((_, n) => (
          <View key={n} style={[s.dot, n === i && s.dotOn]} />
        ))}
      </View>

      <View style={s.actions}>
        {!first && (
          <Button
            label="이전"
            variant="soft"
            style={s.backButton}
            onPress={() => setI(i - 1)}
          />
        )}
        <Button
          label={last ? '시작하기' : '다음'}
          variant="ghost"
          style={s.nextButton}
          onPress={() => (last ? router.replace('/(onboarding)/setup') : setI(i + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: c.head },
  steps: { flexDirection: 'row', gap: 4, paddingHorizontal: sp.lg, paddingTop: sp.sm },
  step: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.22)' },
  stepOn: { backgroundColor: c.wave },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp.xl },
  emoji: { fontSize: 64, marginBottom: sp.xl },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: sp.md,
  },
  desc: { fontSize: 14.5, color: c.onDark, textAlign: 'center', lineHeight: 25 },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginBottom: sp.xl },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.3)' },
  dotOn: { width: 22, backgroundColor: c.wave },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: sp.lg,
    paddingBottom: 34,
  },
  backButton: { flex: 0.7 },
  nextButton: { flex: 1 },
});
