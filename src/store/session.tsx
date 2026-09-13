import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getMyPair, getMyProfile, getPartner } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Pair, Profile } from '@/types';

type Ctx = {
  session: Session | null;
  profile: Profile | null;
  pair: Pair | null;
  partner: Profile | null;
  solo: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Ctx>({} as Ctx);
export const useSession = () => useContext(SessionContext);

async function ensureSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return anon.session;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pair, setPair] = useState<Pair | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let current: Session | null = null;
      try {
        current = await ensureSession();
      } catch (e) {
        console.warn('Using local session fallback', e);
      }
      setSession(current);

      const [p, pr] = await Promise.all([getMyProfile(), getMyPair()]);
      setProfile(p);
      setPair(pr);
      setPartner(pr ? await getPartner(pr) : null);
    } catch (e) {
      console.warn('Failed to load session', e);
      setSession(null);
      setProfile(null);
      setPair(null);
      setPartner(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
    const { data } = supabase.auth.onAuthStateChange(() => load());
    return () => data.subscription.unsubscribe();
  }, [load]);

  return (
    <SessionContext.Provider
      value={{
        session,
        profile,
        pair,
        partner,
        solo: !partner,
        loading,
        refresh: load,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
