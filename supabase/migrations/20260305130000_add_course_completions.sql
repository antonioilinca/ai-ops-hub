-- Track course / lesson completion per user
create table if not exists public.course_completions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  course_slug text not null,
  lesson_id   text,                       -- null = entire course marked complete
  completed_at timestamptz not null default now(),

  unique (user_id, course_slug, lesson_id) -- prevent duplicates
);

-- Index for fast lookups by user
create index idx_course_completions_user on public.course_completions(user_id);

-- RLS
alter table public.course_completions enable row level security;

create policy "Users can view own completions"
  on public.course_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.course_completions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own completions"
  on public.course_completions for delete
  using (auth.uid() = user_id);
