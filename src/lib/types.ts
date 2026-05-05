export type TaskStatus =
  | "recorded"
  | "in_progress"
  | "waiting"
  | "need_feedback"
  | "feedback_sent"
  | "closed"
  | "delayed";

export type EventType =
  | "created"
  | "status_changed"
  | "feedback_generated"
  | "delay_generated"
  | "review_written";

export type Task = {
  id: string;
  title: string;
  rawInput: string;
  relatedPerson: string;
  deadline: string;
  closeStandard: string;
  status: TaskStatus;
  nextAction: string;
  riskTip: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
};

export type TaskEvent = {
  id: string;
  taskId: string;
  type: EventType;
  content: string;
  createdAt: string;
};

export type ParsedTask = Pick<
  Task,
  | "title"
  | "rawInput"
  | "relatedPerson"
  | "deadline"
  | "closeStandard"
  | "nextAction"
  | "riskTip"
>;

export const statusMeta: Record<
  TaskStatus,
  { label: string; tone: string; shortAction: string }
> = {
  recorded: {
    label: "待行动",
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
    shortAction: "先推进第一步",
  },
  in_progress: {
    label: "进行中",
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    shortAction: "同步当前进展",
  },
  waiting: {
    label: "等待对方",
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
    shortAction: "设置跟进点",
  },
  need_feedback: {
    label: "需反馈",
    tone: "bg-amber-50 text-amber-800 ring-amber-200",
    shortAction: "发送确认消息",
  },
  feedback_sent: {
    label: "已反馈",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    shortAction: "等对方确认",
  },
  closed: {
    label: "已关闭",
    tone: "bg-neutral-900 text-white ring-neutral-900",
    shortAction: "已闭环",
  },
  delayed: {
    label: "已延期",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
    shortAction: "说明新时间",
  },
};

export const statusFlow: TaskStatus[] = [
  "recorded",
  "in_progress",
  "need_feedback",
  "feedback_sent",
  "closed",
];
