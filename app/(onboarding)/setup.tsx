import { useState } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/ui';
import { createSoloPair, joinPair, updatePair, updateProfile } from '@/lib/api';
import { useSession } from '@/store/session';
import { shadow } from '@/theme';

type Step = 'profile' | 'mode' | 'invite' | 'days';

const STEPS: { key: Step; label: string }[] = [
  { key: 'profile', label: '프로필' },
  { key: 'mode', label: '시작 방식' },
  { key: 'invite', label: '큐티메이트' },
  { key: 'days', label: '요일' },
];

const AVATARS = ['🌊', '🌱', '☀️', '🕊️'];
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const stepCopy: Record<Step, { eyebrow: string; title: string; body: string }> = {
  profile: {
    eyebrow: 'Profile',
    title: '큐티메이트에게 보여질 이름을 정해요',
    body: '함께 말씀을 읽고 나눌 때 사용할 이름과 작은 표시를 선택해주세요.',
  },
  mode: {
    eyebrow: 'Together',
    title: '어떤 방식으로 큐어링을 시작할까요?',
    body: '혼자 기록을 먼저 시작해도 괜찮고, 소중한 사람을 초대해 함께 시작해도 좋아요.',
  },
  invite: {
    eyebrow: 'Invite',
    title: '함께할 사람을 초대하거나 초대 코드를 입력해요',
    body: '내 코드를 복사해 보내거나, 상대방에게 받은 코드를 입력하면 큐티메이트로 연결됩니다.',
  },
  days: {
    eyebrow: 'Rhythm',
    title: '말씀을 함께 읽을 요일을 정해요',
    body: '부담 없는 리듬으로 시작해보세요. 나중에 언제든 조정할 수 있어요.',
  },
};

export default function Setup() {
  const router = useRouter();
  const { profile, pair, refresh } = useSession();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  const [step, setStep] = useState<Step>('profile');
  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? '🌱');
  const [mode, setMode] = useState<'pair' | 'solo' | null>(null);
  const [code, setCode] = useState('');
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [busy, setBusy] = useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex((item) => item.key === step);
  const current = stepCopy[step];
  const visibleInviteCode = pair?.invite_code ?? generatedInviteCode;

  async function saveProfile() {
    if (!name.trim()) return Alert.alert('이름을 입력해주세요.');
    setBusy(true);
    try {
      await updateProfile({ name: name.trim(), avatar });
      await refresh();
    } catch (e: any) {
      console.warn('Profile save skipped during onboarding', e);
    } finally {
      setBusy(false);
      setStep('mode');
    }
  }

  async function ensurePair() {
    if (pair) return pair;
    const created = await createSoloPair(days);
    setGeneratedInviteCode(created.invite_code);
    return created;
  }

  async function copyInviteCode() {
    setBusy(true);
    try {
      const p = await ensurePair();
      await Clipboard.setStringAsync(p.invite_code);
      await refresh();
      Alert.alert('초대 코드를 복사했어요', '큐티메이트에게 붙여넣어 보내주세요.');
    } catch (e: any) {
      Alert.alert('초대 코드 생성에 실패했어요', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function useInviteCode() {
    if (!code.trim()) return Alert.alert('초대 코드를 입력해주세요.');
    setBusy(true);
    try {
      await joinPair(code);
      await refresh();
      setStep('days');
    } catch (e: any) {
      Alert.alert('연결에 실패했어요', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (days.length === 0) return Alert.alert('요일을 하나 이상 선택해주세요.');
    setBusy(true);
    try {
      const p = await ensurePair();
      await updatePair(p.id, { days });
      await refresh();
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('시작에 실패했어요', e.message);
    } finally {
      setBusy(false);
    }
  }

  function nextFromMode() {
    if (mode === 'pair') setStep('invite');
    if (mode === 'solo') setStep('days');
  }

  return (
    <SafeAreaView style={s.wrap}>
      <KeyboardAvoidingView
        style={s.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[s.page, desktop && s.pageDesktop]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.shell, desktop && s.shellDesktop]}>
            <View style={[s.side, desktop && s.sideDesktop]}>
              <View style={s.brandRow}>
                <View style={s.brandMark}>
                  <Text style={s.brandMarkText}>Q</Text>
                </View>
                <Text style={s.brandText}>Quring</Text>
              </View>

              <Text style={s.sideEyebrow}>Our faith, recorded together</Text>
              <Text style={s.sideTitle}>함께 말씀을 읽는 리듬을 만들어가요</Text>
              <Text style={s.sideBody}>
                큐어링은 혼자 이어가기 어려웠던 큐티를 소중한 사람과 함께 지속할 수
                있도록 돕는 말씀, 나눔, 기도 기록 앱입니다.
              </Text>

              <View style={s.preview}>
                <Text style={s.previewLabel}>오늘의 큐티 흐름</Text>
                <View style={s.previewLine}>
                  <Text style={s.previewDot}>1</Text>
                  <Text style={s.previewText}>말씀을 읽고 묵상해요</Text>
                </View>
                <View style={s.previewLine}>
                  <Text style={s.previewDot}>2</Text>
                  <Text style={s.previewText}>큐티메이트와 마음을 나눠요</Text>
                </View>
                <View style={s.previewLine}>
                  <Text style={s.previewDot}>3</Text>
                  <Text style={s.previewText}>서로를 위해 기도해요</Text>
                </View>
              </View>
            </View>

            <View style={[s.card, desktop && s.cardDesktop]}>
              <View style={s.progressHeader}>
                {STEPS.map((item, index) => (
                  <View key={item.key} style={s.progressItem}>
                    <View style={[s.progressBar, index <= stepIndex && s.progressBarOn]} />
                    <Text style={[s.progressLabel, index <= stepIndex && s.progressLabelOn]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={s.eyebrow}>{current.eyebrow}</Text>
              <Text style={s.title}>{current.title}</Text>
              <Text style={s.body}>{current.body}</Text>

              <View style={s.formArea}>
                {step === 'profile' && (
                  <>
                    <View style={s.avatarGrid}>
                      {AVATARS.map((item) => (
                        <Pressable
                          key={item}
                          onPress={() => setAvatar(item)}
                          style={[s.avatar, item === avatar && s.avatarOn]}
                        >
                          <Text style={s.avatarText}>{item}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={s.label}>이름</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="예: 소원"
                      placeholderTextColor="#A8B2AA"
                      returnKeyType="next"
                      onSubmitEditing={saveProfile}
                      style={s.input}
                    />

                    <Button
                      label="다음"
                      loading={busy}
                      onPress={saveProfile}
                      style={s.actionButton}
                    />
                  </>
                )}

                {step === 'mode' && (
                  <>
                    <ModeOption
                      active={mode === 'pair'}
                      title="큐티메이트와 함께 시작하기"
                      body="초대 코드를 보내 같은 말씀을 읽고 서로의 묵상과 기도제목을 나눠요."
                      badge="추천"
                      onPress={() => setMode('pair')}
                    />
                    <ModeOption
                      active={mode === 'solo'}
                      title="혼자 먼저 시작하기"
                      body="나의 큐티 기록부터 시작하고, 함께할 사람이 생기면 언제든 초대할 수 있어요."
                      badge="언제든 초대 가능"
                      onPress={() => setMode('solo')}
                    />

                    <Button
                      label={mode === 'solo' ? '혼자 시작하기' : '함께 시작하기'}
                      disabled={!mode}
                      onPress={nextFromMode}
                      style={s.actionButton}
                    />
                  </>
                )}

                {step === 'invite' && (
                  <>
                    <Text style={s.label}>내 초대 코드</Text>
                    <Pressable style={s.codeBox} onPress={copyInviteCode}>
                      <Text style={s.codeText}>
                        {visibleInviteCode ?? '눌러서 초대 코드 만들기'}
                      </Text>
                      <Text style={s.codeHint}>클릭하면 복사됩니다</Text>
                    </Pressable>

                    <Text style={s.dividerText}>또는 받은 코드로 연결하기</Text>
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      placeholder="초대 코드 입력"
                      placeholderTextColor="#A8B2AA"
                      autoCapitalize="characters"
                      returnKeyType="done"
                      onSubmitEditing={useInviteCode}
                      style={s.input}
                    />

                    <View style={s.twoActions}>
                      <Button
                        label="코드로 연결"
                        variant="soft"
                        loading={busy}
                        onPress={useInviteCode}
                        style={s.splitButton}
                      />
                      <Button
                        label="나중에 연결"
                        onPress={() => setStep('days')}
                        style={s.splitButton}
                      />
                    </View>
                  </>
                )}

                {step === 'days' && (
                  <>
                    <View style={s.dayGrid}>
                      {DAY_LABELS.map((label, index) => {
                        const day = index + 1;
                        const active = days.includes(day);
                        return (
                          <Pressable
                            key={label}
                            onPress={() =>
                              setDays(active ? days.filter((item) => item !== day) : [...days, day])
                            }
                            style={[s.day, active && s.dayOn]}
                          >
                            <Text style={[s.dayText, active && s.dayTextOn]}>{label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={s.tip}>처음에는 주 2-3회만 선택해도 충분해요.</Text>

                    <Button
                      label="Quring 시작하기"
                      loading={busy}
                      onPress={finish}
                      style={s.actionButton}
                    />
                  </>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeOption({
  active,
  title,
  body,
  badge,
  onPress,
}: {
  active: boolean;
  title: string;
  body: string;
  badge: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.mode, active && s.modeOn]}>
      <View style={s.modeTop}>
        <Text style={[s.modeTitle, active && s.modeTitleOn]}>{title}</Text>
        <Text style={[s.badge, active && s.badgeOn]}>{badge}</Text>
      </View>
      <Text style={[s.modeBody, active && s.modeBodyOn]}>{body}</Text>
    </Pressable>
  );
}

const ink = '#18251F';
const sage = '#456D55';
const sageSoft = '#EDF4EE';
const line = '#E4EADD';
const muted = '#68796D';
const cream = '#FBF8F0';
const blue = '#496F8A';

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: cream },
  keyboard: { flex: 1 },
  page: { flexGrow: 1, padding: 16 },
  pageDesktop: { justifyContent: 'center', padding: 32 },
  shell: { gap: 18, width: '100%', maxWidth: 1120, alignSelf: 'center' },
  shellDesktop: { flexDirection: 'row', alignItems: 'stretch' },
  side: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#F1E8D8',
    borderWidth: 1,
    borderColor: '#E5D7C1',
    overflow: 'hidden',
  },
  sideDesktop: { flex: 0.92, minHeight: 620, justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sage,
  },
  brandMarkText: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  brandText: { color: ink, fontSize: 19, fontWeight: '900' },
  sideEyebrow: {
    color: blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 46,
  },
  sideTitle: { color: ink, fontSize: 38, fontWeight: '900', lineHeight: 48, marginTop: 12 },
  sideBody: { color: muted, fontSize: 15.5, lineHeight: 27, marginTop: 16 },
  preview: {
    marginTop: 42,
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  previewLabel: { color: sage, fontSize: 13, fontWeight: '900', marginBottom: 12 },
  previewLine: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  previewDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 26,
    backgroundColor: '#FFFFFF',
    color: sage,
    fontSize: 12,
    fontWeight: '900',
  },
  previewText: { flex: 1, color: '#35463C', fontSize: 13.5, fontWeight: '800' },
  card: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF0EA',
    ...shadow,
  },
  cardDesktop: { flex: 1.08, minHeight: 620, padding: 32 },
  progressHeader: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  progressItem: { flex: 1, gap: 8 },
  progressBar: { height: 5, borderRadius: 999, backgroundColor: '#E9EEE7' },
  progressBarOn: { backgroundColor: sage },
  progressLabel: { color: '#A0ABA3', fontSize: 11.5, fontWeight: '800' },
  progressLabelOn: { color: sage },
  eyebrow: {
    color: blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: ink, fontSize: 28, fontWeight: '900', lineHeight: 37, marginTop: 9 },
  body: { color: muted, fontSize: 15, lineHeight: 25, marginTop: 10 },
  formArea: { marginTop: 30 },
  avatarGrid: { flexDirection: 'row', gap: 12, marginBottom: 26 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6F1',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOn: { backgroundColor: sageSoft, borderColor: sage },
  avatarText: { fontSize: 28 },
  label: { color: ink, fontSize: 13, fontWeight: '900', marginBottom: 8 },
  input: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFBF8',
    borderWidth: 1.5,
    borderColor: line,
    color: ink,
    fontSize: 16,
  },
  actionButton: { marginTop: 22, backgroundColor: sage },
  mode: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#FAFBF8',
    borderWidth: 1.5,
    borderColor: line,
    marginBottom: 12,
  },
  modeOn: { backgroundColor: sageSoft, borderColor: sage },
  modeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  modeTitle: { flex: 1, color: ink, fontSize: 16, fontWeight: '900' },
  modeTitleOn: { color: '#274735' },
  modeBody: { color: muted, fontSize: 13.5, lineHeight: 22, marginTop: 8 },
  modeBodyOn: { color: '#526F5D' },
  badge: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#EEF3F6',
    color: blue,
    fontSize: 11,
    fontWeight: '900',
  },
  badgeOn: { backgroundColor: '#FFFFFF', color: sage },
  codeBox: {
    minHeight: 104,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sageSoft,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: sage,
    padding: 18,
  },
  codeText: { color: '#274735', fontSize: 22, fontWeight: '900', letterSpacing: 1.5 },
  codeHint: { color: muted, fontSize: 12.5, fontWeight: '700', marginTop: 8 },
  dividerText: {
    color: muted,
    fontSize: 12.5,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 20,
  },
  twoActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  splitButton: { flex: 1 },
  dayGrid: { flexDirection: 'row', gap: 10 },
  day: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBF8',
    borderWidth: 1.5,
    borderColor: line,
  },
  dayOn: { backgroundColor: sage, borderColor: sage },
  dayText: { color: muted, fontSize: 15, fontWeight: '900' },
  dayTextOn: { color: '#FFFFFF' },
  tip: { color: muted, fontSize: 13, lineHeight: 21, marginTop: 14 },
});
