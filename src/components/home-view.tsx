"use client";

import type { ElementType } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Inbox,
  MessageSquareText,
  Plus,
  Sparkles,
  Siren,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, buttonClass, formatDateTime } from "@/components/ui";
import { buildReminder, parseTaskInput } from "@/lib/mock-ai";
import { statusMeta } from "@/lib/types";
import { useTasks } from "@/components/task-provider";

export function HomeView() {
  const [input, setInput] = useState("");
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const { tasks, addTask } = useTasks();
  const parsed = useMemo(
    () => (input.trim() ? parseTaskInput(input) : null),
    [input],
  );
  const openTasks = tasks
    .filter((task) => task.status !== "closed")
    .sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );
  const needsFeedback = tasks.filter((task) => task.status === "need_feedback");
  const closedCount = tasks.filter((task) => task.status === "closed").length;
  const waitingCount = tasks.filter((task) => task.status === "waiting").length;

  function handleQuickCollect() {
    if (!parsed) return;
    const task = addTask(parsed);
    setLastCreatedId(task.id);
    setInput("");
  }

  return (
    <AppShell>
      <section className="grid gap-4">
        <div className="surface rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-teal-700">闭环收集箱</p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                先把承诺收进来
              </h1>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="例如：我答应老王明天下午 5 点前发 AI 运营简历"
              className="min-h-28 w-full resize-none rounded-lg border-0 bg-slate-50 p-4 text-base leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-teal-100"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                输入一句话，AI 会自动识别相关人、截止时间和闭环标准。
              </p>
              <button
                type="button"
                onClick={handleQuickCollect}
                disabled={!input.trim()}
                className={`${buttonClass("primary")} shrink-0`}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                收集
              </button>
            </div>
          </div>

          {parsed ? (
            <div className="mt-4 grid gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950 sm:grid-cols-2">
              <span>事项：{parsed.title}</span>
              <span>相关人：{parsed.relatedPerson}</span>
              <span>截止：{formatDateTime(parsed.deadline)}</span>
              <span>下一步：{parsed.nextAction}</span>
            </div>
          ) : lastCreatedId ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
              <span>已收进闭环箱，可以继续记录下一件事。</span>
              <Link href={`/tasks/${lastCreatedId}`} className={buttonClass("secondary")}>
                查看刚创建的事项
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Metric
              icon={Clock3}
              label="待处理"
              value={String(openTasks.length)}
              tone="text-blue-700"
            />
            <Metric
              icon={MessageSquareText}
              label="待反馈"
              value={String(needsFeedback.length)}
              tone="text-orange-700"
            />
            <Metric
              icon={CheckCircle2}
              label="等待对方"
              value={String(waitingCount)}
              tone="text-emerald-700"
            />
          </div>
        </div>

        <div className="surface rounded-xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <Siren className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">闭环提醒</h2>
              <p className="mt-2 leading-7 text-slate-600">
                你有 {needsFeedback.length} 件事已经完成动作但还没反馈，
                另有 {closedCount} 件事已经形成闭环。
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900">
            {openTasks[0] ? buildReminder(openTasks[0]) : "今天没有紧急事项。"}
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">收集箱事项</h2>
          <Link href="/report" className={buttonClass("quiet")}>
            查看报告
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {openTasks.length === 0 ? (
          <div className="surface rounded-xl p-8 text-center">
            <p className="text-lg font-semibold text-slate-950">你还没有闭环事项。</p>
            <p className="mt-2 text-slate-500">
              从记录一个承诺开始，训练自己成为更靠谱的人。
            </p>
            <Link href="/new" className={`${buttonClass("primary")} mt-5`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              创建我的第一个闭环事项
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {openTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block px-4 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold leading-6 text-slate-950">
                      {task.title}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span>{task.relatedPerson}</span>
                    <span>{formatDateTime(task.deadline)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {task.nextAction || statusMeta[task.status].shortAction}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ElementType;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className={`flex items-center gap-2 text-sm font-semibold ${tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
