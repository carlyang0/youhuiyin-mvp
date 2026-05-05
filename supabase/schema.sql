create type task_status as enum (
  'recorded',
  'in_progress',
  'waiting',
  'need_feedback',
  'feedback_sent',
  'closed',
  'delayed'
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  raw_input text not null,
  related_person text not null,
  deadline timestamptz not null,
  close_standard text not null,
  status task_status not null default 'recorded',
  next_action text not null,
  risk_tip text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
alter table public.task_events enable row level security;

create policy "Users can read their tasks"
on public.tasks for select
using (auth.uid() = user_id);

create policy "Users can insert their tasks"
on public.tasks for insert
with check (auth.uid() = user_id);

create policy "Users can update their tasks"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their task events"
on public.task_events for select
using (auth.uid() = user_id);

create policy "Users can insert their task events"
on public.task_events for insert
with check (auth.uid() = user_id);
