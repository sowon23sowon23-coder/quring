import { useRouter } from 'expo-router';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { shadow, sp } from '@/theme';

const heroImage = require('../../assets/images/quring-hero.png');

const moments = [
  '오늘 읽은 말씀을 오래 붙들고 싶을 때',
  '기도한 마음을 잊지 않고 남겨두고 싶을 때',
  '혼자보다 함께 신앙을 이어가고 싶을 때',
];

const features = [
  {
    label: 'QT',
    title: '같은 말씀을 함께 읽어요',
    body: '오늘의 본문을 읽고 각자의 묵상을 남기며 하루의 중심을 말씀에 둡니다.',
  },
  {
    label: 'Share',
    title: '서로의 삶을 나눠요',
    body: '말씀에서 끝나지 않고 일상과 마음을 나누며 큐티메이트를 더 깊이 알아갑니다.',
  },
  {
    label: 'Pray',
    title: '기도제목을 기억해요',
    body: '“기도할게”라는 말이 실제 기도로 이어지도록 서로의 기도제목을 기록합니다.',
  },
  {
    label: 'Record',
    title: '신앙의 시간을 돌아봐요',
    body: '읽은 말씀, 남긴 묵상, 나눈 기도를 차곡차곡 쌓아 한눈에 돌아봅니다.',
  },
];

export default function Intro() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={[s.hero, wide && s.heroWide]}>
          <ImageBackground source={heroImage} resizeMode="cover" style={s.heroImage}>
            <View style={s.heroWash} />
            <View style={s.heroShade} />

            <View style={s.nav}>
              <View style={s.logo}>
                <Text style={s.logoMark}>Q</Text>
                <Text style={s.logoText}>Quring</Text>
              </View>
              <Pressable style={s.navButton} onPress={() => router.replace('/(onboarding)/setup')}>
                <Text style={s.navButtonText}>시작하기</Text>
              </Pressable>
            </View>

            <View style={[s.heroCopy, wide && s.heroCopyWide]}>
              <Text style={s.kicker}>Quiet Time & Sharing</Text>
              <Text style={[s.title, wide && s.titleWide]}>혼자 어려웠던 큐티를 함께 이어가요</Text>
              <Text style={s.lead}>
                큐어링은 말씀을 읽고, 서로의 삶을 나누고, 함께 기도하며 신앙의 기록을
                쌓아가는 QT 메이트 앱입니다.
              </Text>

              <View style={s.heroActions}>
                <Button
                  label="큐어링 시작하기"
                  onPress={() => router.replace('/(onboarding)/setup')}
                  style={s.primaryButton}
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={s.panel}>
          <View style={s.panelInner}>
            <Text style={s.statement}>
              얼굴을 볼 수 없어도, 말씀과 기도로 연결될 수 있어요.
            </Text>
            <Text style={s.statementBody}>
              큐어링(Quring)은 큐티(Quiet Time)와 나눔(Sharing)을 결합한 이름입니다.
              일상 속에서 하나님과 더 가까이 지낼 수 있도록 말씀, 나눔, 기도, 기록을
              하나의 흐름으로 이어줍니다.
            </Text>
          </View>
        </View>

        <View style={s.band}>
          <View style={s.inner}>
            <Text style={s.eyebrow}>Why Quring</Text>
            <Text style={s.sectionTitle}>이런 순간에 큐어링이 필요해요</Text>

            <View style={s.momentList}>
              {moments.map((moment, index) => (
                <View key={moment} style={s.momentItem}>
                  <Text style={s.momentNumber}>0{index + 1}</Text>
                  <Text style={s.momentText}>{moment}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.featureBand}>
          <View style={s.inner}>
            <Text style={s.eyebrow}>Core Flow</Text>
            <Text style={s.sectionTitle}>말씀, 나눔, 기도가 하루의 기록이 됩니다</Text>

            <View style={s.featureList}>
              {features.map((feature) => (
                <View key={feature.label} style={s.featureRow}>
                  <View style={s.featureBadge}>
                    <Text style={s.featureBadgeText}>{feature.label}</Text>
                  </View>
                  <View style={s.featureTextBox}>
                    <Text style={s.featureTitle}>{feature.title}</Text>
                    <Text style={s.featureBody}>{feature.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.closingBand}>
          <View style={s.closing}>
            <Text style={s.closingKicker}>Our Faith, Recorded Together</Text>
            <Text style={s.closingTitle}>우리의 신앙이 쌓이는 곳, 큐어링</Text>
            <Text style={s.closingBody}>
              신앙은 한 번의 결심으로 끝나는 것이 아니라, 매일의 작은 기록과 나눔으로
              쌓여갑니다. 오늘부터 소중한 사람과 함께 큐티해보세요.
            </Text>
            <Button
              label="큐티메이트와 시작하기"
              variant="ghost"
              onPress={() => router.replace('/(onboarding)/setup')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ink = '#17251F';
const sage = '#466B55';
const muted = '#6E7D73';
const ivory = '#FBF8F0';
const blue = '#496A7F';
const gold = '#B8863B';

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ivory },
  content: { backgroundColor: ivory, paddingBottom: 38 },
  hero: {
    minHeight: 670,
    margin: 12,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#EFE7D9',
    ...shadow,
  },
  heroWide: {
    minHeight: 720,
    maxWidth: 1080,
    width: '96%',
    alignSelf: 'center',
  },
  heroImage: { flex: 1, minHeight: 670 },
  heroWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(251,248,240,0.18)',
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(23,37,31,0.12)',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp.lg,
    paddingTop: sp.lg,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 26,
    backgroundColor: sage,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  logoText: { color: ink, fontSize: 15, fontWeight: '900' },
  navButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(23,37,31,0.78)',
  },
  navButtonText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '800' },
  heroCopy: {
    marginTop: 'auto',
    paddingHorizontal: sp.lg,
    paddingBottom: 30,
    maxWidth: 560,
  },
  heroCopyWide: { paddingLeft: 46, paddingBottom: 52 },
  kicker: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.76)',
    color: sage,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: sp.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 39,
    fontWeight: '900',
    lineHeight: 48,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 2 },
  },
  titleWide: { fontSize: 55, lineHeight: 66 },
  lead: {
    color: '#FFF8EA',
    fontSize: 15.5,
    lineHeight: 26,
    fontWeight: '700',
    marginTop: sp.md,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 1 },
  },
  heroActions: { marginTop: sp.xl, width: 210 },
  primaryButton: { backgroundColor: sage },
  panel: {
    paddingHorizontal: sp.lg,
    paddingTop: 18,
  },
  panelInner: {
    maxWidth: 920,
    alignSelf: 'center',
    borderRadius: 26,
    padding: sp.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE6D8',
  },
  statement: { color: ink, fontSize: 25, fontWeight: '900', lineHeight: 34 },
  statementBody: { color: muted, fontSize: 14.5, lineHeight: 25, marginTop: sp.md },
  band: { paddingHorizontal: sp.lg, paddingTop: 42 },
  inner: { maxWidth: 920, width: '100%', alignSelf: 'center' },
  eyebrow: {
    color: gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: sp.sm,
    textTransform: 'uppercase',
  },
  sectionTitle: { color: ink, fontSize: 25, fontWeight: '900', lineHeight: 34 },
  momentList: { marginTop: sp.lg, borderTopWidth: 1, borderTopColor: '#E8DEC9' },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DEC9',
  },
  momentNumber: { width: 34, color: blue, fontSize: 13, fontWeight: '900' },
  momentText: { flex: 1, color: '#2C3C34', fontSize: 16, fontWeight: '800', lineHeight: 24 },
  featureBand: {
    marginTop: 42,
    paddingHorizontal: sp.lg,
    paddingVertical: 42,
    backgroundColor: '#EEF2ED',
  },
  featureList: { marginTop: sp.lg, gap: 12 },
  featureRow: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 22,
    padding: sp.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7DF',
  },
  featureBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF4F8',
    borderWidth: 1,
    borderColor: '#D7E5EE',
  },
  featureBadgeText: { color: blue, fontSize: 11, fontWeight: '900' },
  featureTextBox: { flex: 1 },
  featureTitle: { color: ink, fontSize: 16, fontWeight: '900' },
  featureBody: { color: muted, fontSize: 13.5, lineHeight: 22, marginTop: 6 },
  closingBand: { paddingHorizontal: sp.lg, paddingTop: 42 },
  closing: {
    maxWidth: 920,
    alignSelf: 'center',
    borderRadius: 28,
    padding: sp.xl,
    backgroundColor: ink,
  },
  closingKicker: {
    color: '#D5B06A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: sp.sm,
  },
  closingTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', lineHeight: 34 },
  closingBody: { color: '#DDE7E1', fontSize: 14.5, lineHeight: 25, marginTop: sp.sm, marginBottom: sp.lg },
});
