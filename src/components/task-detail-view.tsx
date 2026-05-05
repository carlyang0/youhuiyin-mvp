"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock4,
  FileText,
  MessageSquareText,
  PauseCircle,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useTasks } from "@/components/task-provider";
import { StatusBadge, buttonClass, formatDateTime } from "@/components/ui";
import { buildCompletionMessage, buildDelayMessage } from "@/lib/mock-ai";
import { statusFlow, statusMeta, Task, TaskStatus } from "@/lib/types";

export function TaskDetailView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { tasks, events, updateStatus, addEvent } = useTasks();
  const task = tasks.find((item) => item.id === params.id);

  if (!task) {
    return (
      <AppShell>
        <div className="surface rounded-xl p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-950">事项不存在</h1>
          <p className="mt-2 text-slate-500">它可能已被清理，或当前链接不完整。</p>
          <Link href="/" className={`${buttonClass("primary")} mt-5`}>
            返回今日待闭环
          </Link>
        </div>
      </AppShell>
    );
  }

  const taskEvents = events
    .filter((event) => event.taskId === task.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  function setStatus(status: TaskStatus) {
    if (!task) return;
    void updateStatus(task.id, status, `标记为${statusMeta[status].label}`);
  }

  function generateCompletion() {
    if (!task) return;
    void addEvent(task.id, "feedback_generated", buildCompletionMessage(task));
  }

  function generateDelay() {
    if (!task) return;
    void addEvent(task.id, "delay_generated", buildDelayMessage(task));
    void updateStatus(task.id, "delayed", "生成延期说明并标记为已延期");
  }

  function writeReview() {
    if (!task) return;
    void addEvent(
      task.id,
      "review_written",
      `复盘：这件事的闭环关键是「${task.closeStandard}」。下一次要更早同步进度。`,
    );
  }

  return (
    <AppShell>
      <div className="grid gap-4">
        <section className="space-y-6">
          <div className="surface rounded-xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={task.status} />
                  <span className="text-sm text-slate-500">
                    截止 {formatDateTime(task.deadline)}
                  </span>
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">
                  {task.title}
                </h1>
                <p className="mt-2 text-slate-600">相关人：{task.relatedPerson}</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className={buttonClass("quiet")}
              >
                返回
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {statusFlow.map((status, index) => {
                const activeIndex = statusFlow.indexOf(task.status);
                const active = activeIndex >= index || task.status === "closed";
                return (
                  <div
                    key={status}
                    className={`rounded-lg border p-3 ${
                      active
                        ? "border-teal-300 bg-teal-50 text-teal-900"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <div className="text-xs font-semibold">0{index + 1}</div>
                    <div className="mt-1 text-sm font-semibold">
                      {statusMeta[status].label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <InfoBlock title="闭环标准" value={task.closeStandard} />
            <InfoBlock title="下一步" value={task.nextAction} />
            <InfoBlock title="风险提示" value={task.riskTip} />
            <InfoBlock title="原始记录" value={task.rawInput} />
          </div>

          <div className="surface rounded-xl p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-slate-950">闭环链路</h2>
            <div className="mt-5 space-y-3">
              {taskEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-slate-950">
                      {event.content}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <ActionPanel
            task={task}
            onStatus={setStatus}
            onCompletion={generateCompletion}
            onDelay={generateDelay}
            onReview={writeReview}
          />
          <div className="surface rounded-xl p-5">
            <h2 className="text-lg font-semibold text-slate-950">AI 提醒</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              距离截止时间越近，越要先判断：是完成反馈，还是提前说明延期。
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="surface rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-500">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-950">{value}</p>
    </div>
  );
}

function ActionPanel({
  task,
  onStatus,
  onCompletion,
  onDelay,
  onReview,
}: {
  task: Task;
  onStatus: (status: TaskStatus) => void;
  onCompletion: () => void;
  onDelay: () => void;
  onReview: () => void;
}) {
  return (
    <div className="surface rounded-xl p-5">
      <h2 className="text-lg font-semibold text-slate-950">操作</h2>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          className={buttonClass("secondary")}
          onClick={() => onStatus("in_progress")}
        >
          <Clock4 className="h-4 w-4" aria-hidden="true" />
          标记已行动
        </button>
        <button
          type="button"
          className={buttonClass("secondary")}
          onClick={() => onStatus("need_feedback")}
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          标记待反馈
        </button>
        <button type="button" className={buttonClass("secondary")} onClick={onCompletion}>
          <Send className="h-4 w-4" aria-hidden="true" />
          生成反馈话术
        </button>
        <button type="button" className={buttonClass("secondary")} onClick={onDelay}>
          <PauseCircle className="h-4 w-4" aria-hidden="true" />
          生成延期话术
        </button>
        <button
          type="button"
          className={buttonClass("secondary")}
          onClick={() => onStatus("waiting")}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          标记等待对方
        </button>
        <button
          type="button"
          className={buttonClass("secondary")}
          onClick={() => onStatus("feedback_sent")}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          标记已反馈
        </button>
        <button
          type="button"
          className={buttonClass("primary")}
          onClick={() => onStatus("closed")}
          disabled={task.status === "closed"}
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          关闭事项
        </button>
        <button
          type="button"
          className={buttonClass("quiet")}
          onClick={onReview}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          写复盘
        </button>
      </div>
    </div>
  );
}
