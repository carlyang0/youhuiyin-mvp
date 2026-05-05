import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { ParsedTask, Task, TaskEvent, TaskStatus } from "@/lib/types";

type DbTask = {
  id: string;
  title: string;
  raw_input: string;
  related_person: string;
  deadline: string;
  close_standard: string;
  status: TaskStatus;
  next_action: string;
  risk_tip: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

type DbEvent = {
  id: string;
  task_id: string;
  type: TaskEvent["type"];
  content: string;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }
  return client;
}

export function mapDbTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    rawInput: row.raw_input,
    relatedPerson: row.related_person,
    deadline: row.deadline,
    closeStandard: row.close_standard,
    status: row.status,
    nextAction: row.next_action,
    riskTip: row.risk_tip,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at || undefined,
  };
}

export function mapDbEvent(row: DbEvent): TaskEvent {
  return {
    id: row.id,
    taskId: row.task_id,
    type: row.type,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function toTaskInsert(parsed: ParsedTask, user: User) {
  return {
    user_id: user.id,
    title: parsed.title,
    raw_input: parsed.rawInput,
    related_person: parsed.relatedPerson,
    deadline: parsed.deadline,
    close_standard: parsed.closeStandard,
    next_action: parsed.nextAction,
    risk_tip: parsed.riskTip,
    status: "recorded" satisfies TaskStatus,
  };
}
