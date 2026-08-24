import { Redirect } from 'expo-router';
import { Loading } from '@/components/ui';
import { useSession } from '@/store/session';

/** 진입점 — 세션·온보딩 상태에 따라 분기 */
export default function Index() {
  const { loading, session, profile, pair } = useSession();

  if (loading) return <Loading />;
  if (!session) return <Redirect href="/(onboarding)/intro" />;
  // 프로필 이름이 없거나 pair가 없으면 온보딩 미완료
  if (!profile?.name || !pair) return <Redirect href="/(onboarding)/setup" />;
  return <Redirect href="/(tabs)" />;
}
