import { AuthGate } from "@/components/AuthGate";
import { CuringShell } from "@/components/CuringShell";

export default function Home() {
  return (
    <AuthGate>
      <CuringShell />
    </AuthGate>
  );
}
