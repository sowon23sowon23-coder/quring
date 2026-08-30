import { Check, Minus } from "lucide-react";

export function StatusPill({
  label,
  done,
  doneText = "완료",
  pendingText = "진행 중"
}: {
  label: string;
  done: boolean;
  doneText?: string;
  pendingText?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 ${
        done ? "border-ocean-700 bg-ocean-700 text-white" : "border-ocean-100 bg-white text-ocean-800"
      }`}
    >
      <span className="text-xs font-bold">{label}</span>
      <span className="inline-flex items-center gap-1 text-xs font-semibold">
        {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Minus className="h-3.5 w-3.5" aria-hidden />}
        {done ? doneText : pendingText}
      </span>
    </div>
  );
}
