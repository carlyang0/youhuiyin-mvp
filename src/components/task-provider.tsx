"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { seedEvents, seedTasks } from "@/lib/seed-data";
import { ParsedTask, Task, TaskEvent, TaskStatus } from "@/lib/types";

type TaskContextValue = {
  tasks: Task[];
  events: TaskEvent[];
  addTask: (parsed: ParsedTask) => Task;
  updateStatus: (taskId: string, status: TaskStatus, content?: string) => void;
  addEvent: (taskId: string, type: TaskEvent["type"], content: string) => void;
};

const TaskContext = createContext<TaskContextValue | null>(null);

const storageKey = "youhuiyin-mvp-state";

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [events, setEvents] = useState<TaskEvent[]>(seedEvents);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as { tasks: Task[]; events: TaskEvent[] };
      setTasks(parsed.tasks);
      setEvents(parsed.events);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify({ tasks, events }));
  }, [events, hydrated, tasks]);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      events,
      addTask(parsed) {
        const timestamp = new Date().toISOString();
        const task: Task = {
          id: newId("task"),
          ...parsed,
          status: "recorded",
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        const event: TaskEvent = {
          id: newId("event"),
          taskId: task.id,
          type: "created",
          content: `创建事项：${task.title}`,
          createdAt: timestamp,
        };
        setTasks((current) => [task, ...current]);
        setEvents((current) => [event, ...current]);
        return task;
      },
      updateStatus(taskId, status, content) {
        const timestamp = new Date().toISOString();
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
        setEvents((current) => [
          {
            id: newId("event"),
            taskId,
            type: "status_changed",
            content: content || `状态更新为 ${status}`,
            createdAt: timestamp,
          },
          ...current,
        ]);
      },
      addEvent(taskId, type, content) {
        setEvents((current) => [
          {
            id: newId("event"),
            taskId,
            type,
            content,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      },
    }),
    [events, hydrated, tasks],
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
