import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Button, Card, Loading, Screen, Section } from '@/components/ui';
import { clearLocalData } from '@/lib/api';
import { useDraft } from '@/store/draft';
import { useSession } from '@/store/session';
import { c, formatDays, sp } from '@/theme';

export default function My() {
  const router = useRouter();
  const draft = useDraft();
  const { profile, pair, partner, solo, loading, refresh } = useSession();
  if (loading || !pair || !profile) return <Loading />;

  const days = Math.max(
    1,
    Math.round((Date.now() - new Date(pair.started_on).getTime()) / 86400000)
  );

  function resetData() {
    Alert.alert('테스트 데이터 초기화', '이름, 초대 코드, 묵상 기록이 이 폰에서 모두 삭제돼요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          await clearLocalData();
          draft.reset();
          await refresh();
          router.replace('/(onboarding)/intro');
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={s.head}>
        <Text style={s.pic}>{profile.avatar}</Text>
        <Text style={s.name}>{profile.name}</Text>
        <Text style={s.status}>
          {solo ? '혼자 큐티 중' : `${partner?.name}님과 함께 큐티 중`}
        </Text>
        <Text style={s.period}>
          {solo ? '큐티 시작한 지' : '함께한 지'} {days}일
        </Text>
      </View>

      <Section>{solo ? '나의 큐티' : '우리의 큐티'}</Section>
      <Card>
        {solo ? (
          <>
            <Row k="큐티메이트" v="아직 없어요" />
            <Text style={s.hint}>
              아래 코드를 상대에게 보내면 연결됩니다. 지금까지의 기록은 그대로 유지돼요.
            </Text>
            <Pressable
              style={s.code}
              onPress={async () => {
                await Clipboard.setStringAsync(pair.invite_code);
                Alert.alert('복사됐어요', '초대 코드를 붙여넣어 보내세요.');
              }}
            >
              <Text style={s.codeText}>{pair.invite_code}</Text>
              <Text style={s.codeHint}>눌러서 복사</Text>
            </Pressable>
          </>
        ) : (
          <Row k="큐티메이트" v={`${partner?.avatar} ${partner?.name}`} />
        )}
        <Row k="큐티 요일" v={formatDays(pair.days)} />
        <Row k="알림 시간" v={pair.notify_at.slice(0, 5)} />
      </Card>

      <Section>앱 설정</Section>
      <Card>
        <Row k="이용약관" v="-" />
        <Row k="개인정보 처리방침" v="-" />
        <Row k="문의하기" v="-" />
      </Card>

      <Section>테스트</Section>
      <Button label="데이터 초기화" variant="soft" onPress={resetData} />

      <Text style={s.version}>CURING v0.1.0</Text>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowK}>{k}</Text>
      <Text style={s.rowV}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: {
    backgroundColor: c.head,
    borderRadius: 24,
    padding: sp.xl,
    alignItems: 'center',
  },
  pic: { fontSize: 40 },
  name: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: sp.sm },
  status: { fontSize: 12.5, color: c.onDark, marginTop: 5 },
  period: {
    marginTop: sp.md,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,.18)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  rowK: { fontSize: 14, fontWeight: '700', color: c.text },
  rowV: { marginLeft: 'auto', fontSize: 13, color: c.muted, fontWeight: '600' },
  hint: { fontSize: 12.5, color: c.sub, lineHeight: 20, marginTop: sp.sm },
  code: {
    marginTop: sp.sm,
    marginBottom: sp.xs,
    backgroundColor: '#EAF3FB',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  codeText: { fontSize: 18, fontWeight: '800', color: c.blue, letterSpacing: 3 },
  codeHint: { fontSize: 11, color: c.muted, marginTop: 4 },
  version: { textAlign: 'center', color: c.muted, fontSize: 11.5, marginTop: sp.lg },
});
