import { Pressable, StyleSheet, Text, View } from 'react-native';
import { c, r, sp } from '@/theme';
import type { Verse } from '@/types';

/**
 * 본문 목록. 앱은 본문만 제공하고 어떤 절을 고를지는 사용자가 정한다.
 * compact = 묵상 작성 화면의 고정 패널용
 */
export function VerseList({
  verses,
  picked,
  onToggle,
  compact,
}: {
  verses: Verse[];
  picked: number[];
  onToggle: (n: number) => void;
  compact?: boolean;
}) {
  return (
    <View>
      {verses.map((v) => {
        const on = picked.includes(v.n);
        return (
          <Pressable
            key={v.n}
            onPress={() => onToggle(v.n)}
            style={[s.v, compact && s.vCompact, on && s.vOn]}
          >
            <Text style={[s.text, compact && s.textCompact]}>
              <Text style={[s.num, on && { color: c.primary }]}>{v.n} </Text>
              {v.t}
            </Text>
            {on && <Text style={s.check}>✓</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  v: {
    borderRadius: r.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 2,
  },
  vCompact: { paddingVertical: 7, paddingHorizontal: 9 },
  vOn: { backgroundColor: '#EAF3FB', borderColor: c.wave },
  text: { fontSize: 14.5, lineHeight: 27, color: '#26405E' },
  textCompact: { fontSize: 13.5, lineHeight: 24 },
  num: { color: c.accent, fontWeight: '800', fontSize: 11.5 },
  check: {
    position: 'absolute',
    right: 8,
    top: 8,
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: c.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
    overflow: 'hidden',
  },
});
