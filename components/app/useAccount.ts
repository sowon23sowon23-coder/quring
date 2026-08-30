"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Account = {
  configured: boolean;
  loading: boolean;
  email: string | null;
  signOut: () => Promise<void>;
};

/**
 * 선택적 계정 상태. Supabase 값이 없으면 게스트 모드로 동작하며 앱을 막지 않습니다.
 */
export function useAccount(): Account {
  const configured = Boolean(supabase);
  const [loading, setLoading] = useState(configured);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return {
    configured,
    loading,
    email,
    signOut: async () => {
      await supabase?.auth.signOut();
    }
  };
}
