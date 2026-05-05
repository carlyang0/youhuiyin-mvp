"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { seedEvents, seedTasks } from "@/lib/seed-data";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  mapDbEvent,
  mapDbTask,
  toTaskInsert,
} from "@/lib/supabase";
import { ParsedTask, Task, TaskEvent, TaskStatus } from "@/lib/types";

type DbMode = "local" | "supabase";
type AuthStatus = "checking" | "signed_out" | "signed_in";

type TaskContextValue = {
  tasks: Task[];
  events: TaskEvent[];
  dbMode: DbMode;
  authStatus: AuthStatus;
  userEmail?: string;
  syncError?: string;
  authMessage?: string;
  addTask: (parsed: ParsedTask) => Promise<Task>;
  updateStatus: (
    taskId: string,
    status: TaskStatus,
    content?: string,
  ) => Promise<void>;
  addEvent: (
    taskId: string,
    type: TaskEvent["type"],
    content: string,
  ) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

const storageKey = "youhuiyin-mvp-state";
const dbMode: DbMode = isSupabaseConfigured() ? "supabase" : "local";

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localEvent(
  taskId: string,
  type: TaskEvent["type"],
  content: string,
): TaskEvent {
  return {
    id: newId("event"),
    taskId,
    type,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(dbMode === "local" ? seedTasks : []);
  const [events, setEvents] = useState<TaskEvent[]>(
    dbMode === "local" ? seedEvents : [],
  );
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    dbMode === "supabase" ? "checking" : "signed_in",
  );
  const [syncError, setSyncError] = useState<string>();
  const [authMessage, setAuthMessage] = useState<string>();

  const user = session?.user;
  const supabase = getSupabaseClient();

  const loadRemoteData = useCallback(
    async (activeUser: User) => {
      if (!supabase) return;
      setSyncError(undefined);

      const [{ data: taskRows, error: taskError }, { data: eventRows, error: eventError }] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("*")
            .eq("user_id", activeUser.id)
            .order("deadline", { ascending: true }),
          supabase
            .from("task_events")
            .select("*")
            .eq("user_id", activeUser.id)
            .order("created_at", { ascending: false }),
        ]);

      if (taskError || eventError) {
        setSyncError(
          taskError?.message || eventError?.message || "数据库同步失败，请稍后重试。",
        );
        return;
      }

      setTasks((taskRows || []).map(mapDbTask));
      setEvents((eventRows || []).map(mapDbEvent));
    },
    [supabase],
  );

  useEffect(() => {
    if (dbMode === "local") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { tasks: Task[]; events: TaskEvent[] };
        setTasks(parsed.tasks);
        setEvents(parsed.events);
      }
      setHydrated(true);
      return;
    }

    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthStatus(data.session ? "signed_in" : "signed_out");
      if (data.session?.user) {
        void loadRemoteData(data.session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthStatus(nextSession ? "signed_in" : "signed_out");
      setAuthMessage(undefined);
      if (nextSession?.user) {
        void loadRemoteData(nextSession.user);
      } else {
        setTasks([]);
        setEvents([]);
      }
    });

    setHydrated(true);

    return () => subscription.unsubscribe();
  }, [loadRemoteData, supabase]);

  useEffect(() => {
    if (dbMode !== "local" || !hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify({ tasks, events }));
  }, [events, hydrated, tasks]);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      events,
      dbMode,
      authStatus,
      userEmail: user?.email,
      syncError,
      authMessage,
      async addTask(parsed) {
        const timestamp = new Date().toISOString();

        if (dbMode === "supabase" && supabase && user) {
          const { data, error } = await supabase
            .from("tasks")
            .insert(toTaskInsert(parsed, user))
            .select()
            .single();

          if (error) {
            setSyncError(error.message);
            throw error;
          }

          const task = mapDbTask(data);
          const eventContent = `创建事项：${task.title}`;
          const { data: eventRow, error: eventError } = await supabase
            .from("task_events")
            .insert({
              task_id: task.id,
              user_id: user.id,
              type: "created",
              content: eventContent,
            })
            .select()
            .single();

          setTasks((current) => [task, ...current]);
          if (!eventError && eventRow) {
            setEvents((current) => [mapDbEvent(eventRow), ...current]);
          }
          return task;
        }

        const task: Task = {
          id: newId("task"),
          ...parsed,
          status: "recorded",
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        const event = localEvent(task.id, "created", `创建事项：${task.title}`);
        setTasks((current) => [task, ...current]);
        setEvents((current) => [event, ...current]);
        return task;
      },
      async updateStatus(taskId, status, content) {
        const timestamp = new Date().toISOString();
        const closedAt = status === "closed" ? timestamp : undefined;
        const eventContent = content || `状态更新为 ${status}`;

        if (dbMode === "supabase" && supabase && user) {
          const { error } = await supabase
            .from("tasks")
            .update({
              status,
              updated_at: timestamp,
              closed_at: closedAt || null,
            })
            .eq("id", taskId)
            .eq("user_id", user.id);

          if (error) {
            setSyncError(error.message);
            throw error;
          }
        }

        setTasks((current) =>
          current.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                  updatedAt: timestamp,
                  closedAt: status === "closed" ? timestamp : task.closedAt,
                }
              : task,
          ),
        );

        if (dbMode === "supabase" && supabase && user) {
          const { data, error } = await supabase
            .from("task_events")
            .insert({
              task_id: taskId,
              user_id: user.id,
              type: "status_changed",
              content: eventContent,
            })
            .select()
            .single();

          if (error) {
            setSyncError(error.message);
            throw error;
          }

          setEvents((current) => [mapDbEvent(data), ...current]);
          return;
        }

        setEvents((current) => [
          localEvent(taskId, "status_changed", eventContent),
          ...current,
        ]);
      },
      async addEvent(taskId, type, content) {
        if (dbMode === "supabase" && supabase && user) {
          const { data, error } = await supabase
            .from("task_events")
            .insert({
              task_id: taskId,
              user_id: user.id,
              type,
              content,
            })
            .select()
            .single();

          if (error) {
            setSyncError(error.message);
            throw error;
          }

          setEvents((current) => [mapDbEvent(data), ...current]);
          return;
        }

        setEvents((current) => [localEvent(taskId, type, content), ...current]);
      },
      async signInWithEmail(email) {
        if (!supabase) return;
        setAuthMessage(undefined);
        setSyncError(undefined);

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          setSyncError(error.message);
          throw error;
        }

        setAuthMessage("登录链接已发送到邮箱，请打开邮件完成登录。");
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [authMessage, authStatus, events, supabase, syncError, tasks, user],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
}
