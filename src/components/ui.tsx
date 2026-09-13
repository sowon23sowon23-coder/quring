import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { c, r, shadow, sp } from '@/theme';

export function Screen({
  children,
  scroll = true,
  dark = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  dark?: boolean;
}) {
  const bg = dark ? c.head : c.bg;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ padding: sp.lg, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: sp.lg }}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={s.title}>{children}</Text>;
}

export function Section({ children }: { children: React.ReactNode }) {
  return <Text style={s.section}>{children}</Text>;
}

export function Hint({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[s.hint, style]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'solid',
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'ghost' | 'soft';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        variant === 'solid' && s.btnSolid,
        variant === 'ghost' && s.btnGhost,
        variant === 'soft' && s.btnSoft,
        off && s.btnOff,
        pressed && !off && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? '#fff' : c.blue} />
      ) : (
        <Text
          style={[
            s.btnText,
            variant !== 'solid' && { color: c.blue },
            off && { color: '#9FB1C5' },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipText, active && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.primary} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: c.card,
    borderRadius: r.lg,
    padding: sp.lg,
    borderWidth: 1,
    borderColor: c.line,
    ...shadow,
  },
  title: { fontSize: 22, fontWeight: '800', color: c.deep, letterSpacing: -0.4 },
  section: { fontSize: 14.5, fontWeight: '800', color: c.deep, marginTop: sp.xl, marginBottom: sp.sm },
  hint: { fontSize: 12.5, color: c.sub, lineHeight: 20 },
  btn: {
    borderRadius: r.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    outlineWidth: 0,
  },
  btnSolid: { backgroundColor: c.primary },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: c.waveSoft },
  btnSoft: { backgroundColor: c.waveSoft },
  btnOff: { backgroundColor: '#DCE5EF' },
  btnText: { color: '#fff', fontSize: 15.5, fontWeight: '700' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: r.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: '#fff',
  },
  chipOn: { backgroundColor: c.waveSoft, borderColor: c.wave },
  chipText: { fontSize: 12.5, fontWeight: '700', color: c.sub },
  chipTextOn: { color: c.blue },
});
