import { TaskStatus, statusMeta } from "@/lib/types";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold ring-1 ${meta.tone}`}
    >
      {meta.label}
    </span>
  );
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buttonClass(kind: "primary" | "secondary" | "quiet" = "secondary") {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition disabled:opacity-50";
  if (kind === "primary") return `${base} bg-slate-950 text-white hover:bg-slate-800`;
  if (kind === "quiet") return `${base} text-slate-600 hover:bg-slate-100`;
  return `${base} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`;
}
