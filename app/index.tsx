import { Redirect } from 'expo-router';
import { Loading } from '@/components/ui';
import { useSession } from '@/store/session';

export default function Index() {
  const { loading, session, profile, pair } = useSession();

  if (loading) return <Loading />;
  if (!session && !profile && !pair) return <Redirect href="/(onboarding)/intro" />;
  if (!profile?.name || !pair) return <Redirect href="/(onboarding)/setup" />;
  return <Redirect href="/(tabs)" />;
}
