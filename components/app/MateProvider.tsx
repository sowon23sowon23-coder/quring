"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { loadMateCompleted, setMateCompleted } from "@/lib/qt-local";
import {
  createInvite as createInviteRemote,
  endMate as endMateRemote,
  getActiveMate,
  getMateEntry,
  getPendingInvite,
  getReactions,
  toggleReaction,
  type ActiveMate,
  type ReactionType,
  type RemoteEntry
} from "@/lib/qt-remote";
import { useQt } from "@/components/app/QtProvider";
import { useAccount } from "@/components/app/useAccount";

type ReactionSummary = { amen: number; pray: number; heart: number };
type MyReactions = Record<ReactionType, boolean>;

type MateContextValue = {
  mode: "loading" | "guest" | "remote";
  mateCompleted: boolean;
  isUnlocked: boolean;
  partnerNickname: string | null;
  // guest
  toggleDemo: () => void;
  // remote
  activeMate: ActiveMate | null;
  inviteToken: string | null;
  partnerEntry: RemoteEntry | null;
  reactionSummary: ReactionSummary;
  myReactions: MyReactions;
  createInvite: () => Promise<void>;
  endMate: () => Promise<void>;
  react: (type: ReactionType) => Promise<void>;
  refresh: () => void;
};

const MateContext = createContext<MateContextValue | null>(null);

const emptyReactions = (): ReactionSummary => ({ amen: 0, pray: 0, heart: 0 });
const emptyMine = (): MyReactions => ({ amen: false, pray: false, heart: false });

export function MateProvider({ children }: { children: ReactNode }) {
  const account = useAccount();
  const { todayKey, completed } = useQt();

  const isRemote = account.configured && Boolean(account.userId);
  const [mode, setMode] = useState<"loading" | "guest" | "remote">("loading");

  const [demoCompleted, setDemoCompleted] = useState(false);
  const [activeMate, setActiveMate] = useState<ActiveMate | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [partnerEntry, setPartnerEntry] = useState<RemoteEntry | null>(null);
  const [reactionSummary, setReactionSummary] = useState<ReactionSummary>(emptyReactions);
  const [myReactions, setMyReactions] = useState<MyReactions>(emptyMine);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // 게스트 모드
  useEffect(() => {
    if (account.loading || isRemote) return;
    setMode("guest");
    setDemoCompleted(loadMateCompleted(todayKey));
  }, [account.loading, isRemote, todayKey]);

  // 원격 모드
  useEffect(() => {
    if (account.loading || !isRemote || !account.userId) return;
    let cancelled = false;
    setMode("remote");

    async function load() {
      try {
        const mate = await getActiveMate(account.userId!);
        if (cancelled) return;
        setActiveMate(mate);

        if (mate) {
          setInviteToken(null);
          const partner = await getMateEntry(mate.partner.id, todayKey);
          if (cancelled) return;
          setPartnerEntry(partner);

          if (partner) {
            const rows = await getReactions(partner.entry.id);
            if (cancelled) return;
            const summary = emptyReactions();
            const mine = emptyMine();
            for (const row of rows) {
              summary[row.reaction_type as ReactionType] += 1;
              if (row.user_id === account.userId) mine[row.reaction_type as ReactionType] = true;
            }
            setReactionSummary(summary);
            setMyReactions(mine);
          } else {
            setReactionSummary(emptyReactions());
            setMyReactions(emptyMine());
          }
        } else {
          setPartnerEntry(null);
          const pending = await getPendingInvite(account.userId!);
          if (cancelled) return;
          setInviteToken(pending?.invite_token ?? null);
        }
      } catch {
        if (!cancelled) {
          setActiveMate(null);
          setPartnerEntry(null);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [account.loading, isRemote, account.userId, todayKey, completed, nonce]);

  const toggleDemo = useCallback(() => {
    setDemoCompleted((prev) => {
      const next = !prev;
      setMateCompleted(todayKey, next);
      return next;
    });
  }, [todayKey]);

  const createInvite = useCallback(async () => {
    if (!account.userId) return;
    const invite = await createInviteRemote(account.userId);
    setInviteToken(invite.invite_token);
  }, [account.userId]);

  const endMate = useCallback(async () => {
    if (!activeMate) return;
    await endMateRemote(activeMate.mate.id);
    setActiveMate(null);
    setPartnerEntry(null);
    refresh();
  }, [activeMate, refresh]);

  const react = useCallback(
    async (type: ReactionType) => {
      if (!partnerEntry || !account.userId) return;
      const added = await toggleReaction(partnerEntry.entry.id, account.userId, type);
      setMyReactions((prev) => ({ ...prev, [type]: added }));
      setReactionSummary((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + (added ? 1 : -1)) }));
    },
    [partnerEntry, account.userId]
  );

  const value = useMemo<MateContextValue>(() => {
    const remoteUnlocked = mode === "remote" && Boolean(partnerEntry);
    const guestUnlocked = mode === "guest" && completed && demoCompleted;
    return {
      mode,
      mateCompleted: mode === "guest" ? demoCompleted : remoteUnlocked,
      isUnlocked: remoteUnlocked || guestUnlocked,
      partnerNickname: activeMate?.partner.nickname ?? null,
      toggleDemo,
      activeMate,
      inviteToken,
      partnerEntry,
      reactionSummary,
      myReactions,
      createInvite,
      endMate,
      react,
      refresh
    };
  }, [
    mode,
    partnerEntry,
    completed,
    demoCompleted,
    activeMate,
    inviteToken,
    reactionSummary,
    myReactions,
    toggleDemo,
    createInvite,
    endMate,
    react,
    refresh
  ]);

  return <MateContext.Provider value={value}>{children}</MateContext.Provider>;
}

export function useMate(): MateContextValue {
  const ctx = useContext(MateContext);
  if (!ctx) throw new Error("useMate must be used within <MateProvider>");
  return ctx;
}
