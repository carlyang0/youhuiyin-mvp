"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, CircleAlert, Target, TimerReset } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useTasks } from "@/components/task-provider";
import { buttonClass } from "@/components/ui";

export function ReportView() {
  const { tasks } = useTasks();
  const total = tasks.length;
  const closed = tasks.filter((task) => task.status === "closed").length;
  const delayed = tasks.filter((task) => task.status === "delayed").length;
  const needFeedback = tasks.filter((task) => task.status === "need_feedback").length;
  const inProgress = tasks.filter((task) =>
    ["recorded", "in_progress", "waiting", "feedback_sent"].includes(task.status),
  ).length;
  const rate = total ? Math.round((closed / total) * 1000) / 10 : 0;

  return (
    <AppShell>
      <section className="surface rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">本周闭环报告</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              本周你创建了 {total} 个闭环事项。
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              已闭环 {closed} 个，延期 {delayed} 个，待反馈 {needFeedback} 个，进行中 {inProgress} 个。
            </p>
          </div>
          <Link href="/new" className={buttonClass("primary")}>
            继续创建
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ReportMetric icon={Target} label="闭环完成率" value={`${rate}%`} />
          <ReportMetric icon={BarChart3} label="已闭环" value={String(closed)} />
          <ReportMetric icon={TimerReset} label="延期" value={String(delayed)} />
          <ReportMetric icon={CircleAlert} label="需反馈" value={String(needFeedback)} />
        </div>
      </section>

      <section className="mt-5 grid gap-4">
        <div className="surface rounded-xl p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">主要问题</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            你有 {needFeedback} 件事是在完成动作后，没有及时反馈给相关人。
            这类事项最容易让对方感觉“事情没有下文”。
          </p>
        </div>

        <div className="surface rounded-xl p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">下周训练重点</h2>
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-teal-950">
            <p className="font-semibold">做完后主动反馈。</p>
            <p className="mt-2 leading-7">
              每次完成任务后，先问自己一句：我有没有告诉相关人结果？
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function ReportMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
