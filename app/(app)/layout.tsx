"use client";

import type { ReactNode } from "react";
import { QtProvider } from "@/components/app/QtProvider";
import { MateProvider } from "@/components/app/MateProvider";
import { AppShell } from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QtProvider>
      <MateProvider>
        <AppShell>{children}</AppShell>
      </MateProvider>
    </QtProvider>
  );
}
