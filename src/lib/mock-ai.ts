import { ParsedTask, Task } from "@/lib/types";

const now = new Date("2026-05-05T12:00:00+08:00");

function isoWithTime(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date(now);
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function pickPerson(input: string) {
  const match =
    input.match(/答应(.+?)(今天|明天|后天|周[一二三四五六日天]|下周|前|下午|晚上|中午|早上|帮|给)/) ||
    input.match(/给(.+?)(发|确认|同步|回复|看|问)/) ||
    input.match(/帮(.+?)(看|改|整理|确认)/);
  return match?.[1]?.replace(/[，。,.\s]/g, "") || "相关人";
}

function pickDeadline(input: string) {
  if (input.includes("明天")) return isoWithTime(1, input.includes("上午") ? 10 : 17);
  if (input.includes("后天")) return isoWithTime(2, 18);
  if (input.includes("周五")) return "2026-05-08T18:00:00+08:00";
  if (input.includes("今晚") || input.includes("今天")) return isoWithTime(0, input.includes("8") ? 20 : 18);
  return isoWithTime(1, 18);
}

function compactTitle(input: string, person: string) {
  if (input.includes("简历")) return `发 AI 运营简历给${person}`;
  if (input.includes("方案")) return `帮${person}看活动方案`;
  if (input.includes("报价")) return `给${person}确认报价`;
  if (input.includes("资源")) return `问${person}资源进展`;
  return input.replace(/[。.!！]/g, "").slice(0, 22);
}

export function parseTaskInput(input: string): ParsedTask {
  const relatedPerson = pickPerson(input);
  const title = compactTitle(input, relatedPerson);

  return {
    title,
    rawInput: input,
    relatedPerson,
    deadline: pickDeadline(input),
    closeStandard: input.includes("方案")
      ? "看完内容并反馈修改建议，确认对方收到。"
      : input.includes("简历")
        ? "资料已发送，并告知对方查收。"
        : "事项有明确结果，并已同步给相关人。",
    nextAction: input.includes("方案")
      ? "先确认对方是否已经把方案发来。"
      : input.includes("简历")
        ? "先整理可发送的简历初稿。"
        : "先完成最小可推进的一步，并记录结果。",
    riskTip: "如果原定时间赶不上，需要提前说明当前进度和新的交付时间。",
  };
}

export function buildCompletionMessage(task: Task) {
  return `${task.relatedPerson}，我这边已经处理好了：${task.title}。你看下是否收到，有问题我再调整。`;
}

export function buildDelayMessage(task: Task) {
  return `${task.relatedPerson}，这件事我这边还需要再多一点时间，原定时间可能赶不上。我会尽快给你一个明确结果，避免你一直等。`;
}

export function buildReminder(task: Task) {
  return `你答应${task.relatedPerson}的「${task.title}」快到承诺时间了。如果已完成，建议马上发送确认消息；如果还没完成，先同步进度或说明延期。`;
}
