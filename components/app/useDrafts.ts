"use client";

import { useEffect, useState } from "react";
import { listDrafts, subscribe, type DraftRecord } from "@/lib/qt-local";

export function useDrafts(): { drafts: DraftRecord[]; ready: boolean } {
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setDrafts(listDrafts());
    refresh();
    setReady(true);
    return subscribe(refresh);
  }, []);

  return { drafts, ready };
}
