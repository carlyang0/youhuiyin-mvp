"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database, Home, LogOut, PlusCircle, Radio } from "lucide-react";
import { useState } from "react";
import { useTasks } from "@/components/task-provider";
import { buttonClass } from "@/components/ui";

const nav = [
  { href: "/", label: "收集箱", icon: Home },
  { href: "/new", label: "拆解", icon: PlusCircle },
  { href: "/report", label: "报告", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authStatus, dbMode, userEmail, syncError, signInWithEmail, signOut } =
    useTasks();

  return (
    <div className="min-h-dvh bg-slate-100 sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background sm:h-[860px] sm:min-h-0 sm:rounded-[34px] sm:border sm:border-slate-300 sm:bg-slate-950 sm:p-1.5 sm:shadow-2xl sm:shadow-slate-300/70">
        <IOSPreviewChrome />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background sm:rounded-[28px]">
          <header
            className="border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
          >
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Radio className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold tracking-normal">
                  有回音
                </span>
                <span className="block text-xs text-slate-500">
                  让每件事都有交代
                </span>
              </span>
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                {dbMode === "supabase" ? "云端数据库" : "本地预览"}
              </span>
              {userEmail ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  退出
                </button>
              ) : null}
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {syncError ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
                {syncError}
              </div>
            ) : null}
            {dbMode === "supabase" && authStatus !== "signed_in" ? (
              <AuthGate onSignIn={signInWithEmail} />
            ) : (
              children
            )}
          </main>

          <nav
            className="grid grid-cols-3 gap-1 border-t border-slate-200 bg-white/95 px-3 pt-2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
          >
            {nav.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

function AuthGate({
  onSignIn,
}: {
  onSignIn: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!email.trim()) return;
    setPending(true);
    setMessage("");
    try {
      await onSignIn(email.trim());
      setMessage("登录链接已发送，请打开邮箱完成登录。");
    } catch {
      setMessage("发送失败，请检查邮箱或稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="surface rounded-xl p-5">
      <p className="text-sm font-semibold text-teal-700">登录后同步云端</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">进入有回音</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        输入邮箱获取登录链接。登录后，你的闭环事项会保存到 Supabase 数据库。
      </p>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="mt-5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!email.trim() || pending}
        className={`${buttonClass("primary")} mt-3 w-full`}
      >
        {pending ? "发送中" : "发送登录链接"}
      </button>
      {message ? (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function IOSPreviewChrome() {
  return (
    <div className="relative hidden items-center justify-between px-5 pb-3 pt-3 text-white sm:flex">
      <span className="font-mono text-xs font-semibold">9:41</span>
      <span className="absolute left-1/2 top-3 h-5 w-28 -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-4 rounded-[2px] border border-white/80" />
        <span className="h-2.5 w-2 rounded-[2px] bg-white/90" />
      </div>
    </div>
  );
}
