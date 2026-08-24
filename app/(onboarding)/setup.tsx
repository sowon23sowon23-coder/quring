import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
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
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/ui';
import { createSoloPair, joinPair, updatePair, updateProfile } from '@/lib/api';
import { useSession } from '@/store/session';
import { DAY_LABELS, c, r, sp } from '@/theme';

type Step = 'profile' | 'mode' | 'invite' | 'days';

const STEPS: Step[] = ['profile', 'mode', 'invite', 'days'];
const AVATARS = ['🌊', '🌱', '☀️', '🕊️'];

export default function Setup() {
  const router = useRouter();
  const { profile, pair, refresh } = useSession();

  const [step, setStep] = useState<Step>('profile');
  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? '🌊');
  const [mode, setMode] = useState<'pair' | 'solo' | null>(null);
  const [code, setCode] = useState('');
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [busy, setBusy] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  async function saveProfile() {
    if (!name.trim()) return Alert.alert('이름을 입력해 주세요');
    setBusy(true);
    try {
      await updateProfile({ name: name.trim(), avatar });
      await refresh();
      setStep('mode');
    } catch (e: any) {
      Alert.alert('저장 실패', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function ensurePair() {
    if (pair) return pair;
    return createSoloPair(days);
  }

  async function useInviteCode() {
    if (!code.trim()) return Alert.alert('초대 코드를 입력해 주세요');
    setBusy(true);
    try {
      await joinPair(code);
      await refresh();
      setStep('days');
    } catch (e: any) {
      Alert.alert('연결 실패', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (days.length === 0) return Alert.alert('요일을 하나 이상 선택해 주세요');
    setBusy(true);
    try {
      const p = await ensurePair();
      await updatePair(p.id, { days });
      await refresh();
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('저장 실패', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={s.wrap}>
      <KeyboardAvoidingView
        style={s.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={s.steps}>
          {STEPS.map((_, n) => (
            <View key={n} style={[s.step, n <= stepIndex && s.stepOn]} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={[s.body, keyboardOpen && s.bodyKeyboard]}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'profile' && (
            <>
              <Text style={s.h}>어떻게 불러드릴까요?</Text>
              <Text style={s.p}>큐티메이트에게 보여지는 이름이에요.</Text>
              <View style={s.avatars}>
                {AVATARS.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => setAvatar(a)}
                    style={[s.avatar, a === avatar && s.avatarOn]}
                  >
                    <Text style={{ fontSize: 26 }}>{a}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="이름"
                placeholderTextColor="#9CC3E4"
                returnKeyType="next"
                onSubmitEditing={saveProfile}
                style={s.input}
              />
            </>
          )}

          {step === 'mode' && (
            <>
              <Text style={s.h}>어떻게 시작할까요?</Text>
              <Text style={s.p}>나중에도 언제든 바꿀 수 있어요.</Text>
              <ModeCard
                icon="🌊"
                title="큐티메이트와 함께"
                body="초대 코드를 보내 같은 말씀을 읽고 서로의 묵상을 나눠요."
                badge="추천"
                on={mode === 'pair'}
                onPress={() => setMode('pair')}
              />
              <ModeCard
                icon="🌱"
                title="혼자 시작하기"
                body="나만의 큐티 기록부터 시작해요. 함께할 사람이 생기면 그때 초대하면 돼요."
                badge="언제든 초대 가능"
                on={mode === 'solo'}
                onPress={() => setMode('solo')}
              />
            </>
          )}

          {step === 'invite' && (
            <>
              <Text style={s.h}>함께할 사람을 초대해 주세요</Text>
              <Text style={s.p}>
                내 초대 코드를 보내거나, 상대가 보낸 코드를 입력하면 연결돼요.
              </Text>

              <Text style={s.label}>내 초대 코드</Text>
              <Pressable
                style={s.codeBox}
                onPress={async () => {
                  const p = await ensurePair();
                  await Clipboard.setStringAsync(p.invite_code);
                  await refresh();
                  Alert.alert('복사됐어요', '초대 코드를 붙여넣어 보내세요.');
                }}
              >
                <Text style={s.codeText}>{pair?.invite_code ?? '누르면 코드가 생성돼요'}</Text>
              </Pressable>

              <Text style={s.label}>받은 초대 코드</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="초대 코드 입력"
                placeholderTextColor="#9CC3E4"
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={useInviteCode}
                style={s.input}
              />
              {!keyboardOpen && (
                <Button
                  label="코드로 연결하기"
                  variant="soft"
                  loading={busy}
                  onPress={useInviteCode}
                  style={s.inlineButton}
                />
              )}
            </>
          )}

          {step === 'days' && (
            <>
              <Text style={s.h}>{mode === 'solo' ? '언제 큐티할까요?' : '언제 함께할까요?'}</Text>
              <Text style={s.p}>부담 없는 요일부터 시작해요. 언제든 바꿀 수 있어요.</Text>
              <View style={s.dayRow}>
                {DAY_LABELS.map((label, i) => {
                  const d = i + 1;
                  const on = days.includes(d);
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                      style={[s.day, on && s.dayOn]}
                    >
                      <Text style={[s.dayText, on && s.dayTextOn]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={s.tip}>주 2-3회로 시작해도 충분해요.</Text>
            </>
          )}
        </ScrollView>

        <View style={[s.actions, keyboardOpen && s.actionsKeyboard]}>
          {step === 'profile' && (
            <Button label="다음" variant="ghost" loading={busy} onPress={saveProfile} />
          )}
          {step === 'mode' && (
            <Button
              label={mode === 'solo' ? '혼자 시작하기' : '함께 시작하기'}
              variant="ghost"
              disabled={!mode}
              onPress={() => setStep(mode === 'pair' ? 'invite' : 'days')}
            />
          )}
          {step === 'invite' && (
            <Button label="나중에 연결할게요" variant="ghost" onPress={() => setStep('days')} />
          )}
          {step === 'days' && (
            <Button label="CURING 시작하기" variant="ghost" loading={busy} onPress={finish} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeCard({
  icon,
  title,
  body,
  badge,
  on,
  onPress,
}: {
  icon: string;
  title: string;
  body: string;
  badge: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.mode, on && s.modeOn]}>
      <Text style={{ fontSize: 24, marginBottom: sp.xs }}>{icon}</Text>
      <Text style={[s.modeTitle, on && { color: c.deep }]}>{title}</Text>
      <Text style={[s.modeBody, on && { color: c.sub }]}>{body}</Text>
      <Text style={[s.badge, on && { backgroundColor: c.waveSoft, color: c.blue }]}>{badge}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: c.head },
  keyboard: { flex: 1 },
  steps: { flexDirection: 'row', gap: 4, paddingHorizontal: sp.lg, paddingTop: sp.sm },
  step: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.22)' },
  stepOn: { backgroundColor: c.wave },
  body: { flexGrow: 1, padding: sp.lg, paddingTop: sp.xl },
  bodyKeyboard: { paddingBottom: sp.sm },
  h: { fontSize: 23, fontWeight: '800', color: '#fff', lineHeight: 33 },
  p: { fontSize: 13.5, color: c.onDark, lineHeight: 22, marginTop: sp.xs, marginBottom: sp.xl },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,.8)',
    marginBottom: sp.xs,
    marginTop: sp.md,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,.25)',
    borderRadius: r.sm,
    padding: 15,
    fontSize: 15,
    color: '#fff',
  },
  avatars: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: sp.lg },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.14)',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  avatarOn: { borderColor: c.wave, backgroundColor: 'rgba(127,185,232,.35)' },
  mode: {
    backgroundColor: 'rgba(255,255,255,.13)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,.22)',
    borderRadius: r.lg,
    padding: sp.lg,
    marginBottom: sp.md,
  },
  modeOn: { backgroundColor: '#fff', borderColor: '#fff' },
  modeTitle: { fontSize: 15.5, fontWeight: '800', color: '#fff' },
  modeBody: { fontSize: 12.5, color: c.onDark, lineHeight: 20, marginTop: 5 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: sp.sm,
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,.22)',
    borderRadius: r.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  codeBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,.4)',
    borderRadius: r.sm,
    padding: 16,
    alignItems: 'center',
  },
  codeText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  inlineButton: { marginTop: sp.sm },
  dayRow: { flexDirection: 'row', gap: 7 },
  day: {
    flex: 1,
    aspectRatio: 0.86,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,.2)',
  },
  dayOn: { backgroundColor: c.wave, borderColor: c.wave },
  dayText: { color: c.onDark, fontWeight: '700' },
  dayTextOn: { color: '#08243F' },
  tip: { color: '#EAF4FD', fontSize: 12.5, marginTop: sp.lg, lineHeight: 20 },
  actions: { padding: sp.lg, paddingBottom: 34 },
  actionsKeyboard: { paddingTop: sp.sm, paddingBottom: sp.sm },
});
