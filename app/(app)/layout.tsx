"use client";

import type { ReactNode } from "react";
import { QtProvider } from "@/components/app/QtProvider";
import { AppShell } from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QtProvider>
      <AppShell>{children}</AppShell>
    </QtProvider>
  );
}
