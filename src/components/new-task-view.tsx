"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useTasks } from "@/components/task-provider";
import { buttonClass, formatDateTime } from "@/components/ui";
import { parseTaskInput } from "@/lib/mock-ai";

const example = "我答应老王明天下午 5 点前发 AI 运营简历";

export function NewTaskView() {
  const [input, setInput] = useState(example);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const { addTask } = useTasks();

  const parsed = useMemo(() => parseTaskInput(input), [input]);

  function handleCreate() {
    const task = addTask(parsed);
    setConfirmed(true);
    setTimeout(() => router.push(`/tasks/${task.id}`), 320);
  }

  return (
    <AppShell>
      <div className="grid gap-4">
        <section className="surface rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
              <Wand2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-teal-700">新建闭环事项</p>
              <h1 className="text-2xl font-semibold text-slate-950">输入一句话</h1>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="例如：我答应老王明天下午 5 点前发 AI 运营简历"
            className="mt-6 min-h-36 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-base leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />

          <button
            type="button"
            onClick={handleCreate}
            disabled={!input.trim()}
            className={`${buttonClass("primary")} mt-4 w-full sm:w-auto`}
          >
            {confirmed ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {confirmed ? "已创建" : "确认创建"}
          </button>
        </section>

        <section className="surface rounded-xl p-5 sm:p-6">
          <p className="text-sm font-semibold text-blue-700">AI 拆解结果</p>
          <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            <PreviewRow label="事项" value={parsed.title} />
            <PreviewRow label="相关人" value={parsed.relatedPerson} />
            <PreviewRow label="截止时间" value={formatDateTime(parsed.deadline)} />
            <PreviewRow label="闭环标准" value={parsed.closeStandard} />
            <PreviewRow
              label="建议提醒"
              value="截止前一天上午 10 点、截止前 30 分钟"
            />
            <PreviewRow label="建议下一步" value={parsed.nextAction} />
            <PreviewRow label="风险提示" value={parsed.riskTip} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 px-4 py-4">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="text-sm leading-6 text-slate-950">{value}</dd>
    </div>
  );
}
