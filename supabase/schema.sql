-- Supabase schema for Fitness & Nutrition
-- Apply in Supabase SQL editor or via migration tooling.

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (optional, useful for display names)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  age integer,
  gender text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Plans
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Plan exercises (ExerciseDB ids + metadata snapshot)
create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  exercise_id text not null,
  name text,
  body_parts text[] default '{}'::text[],
  target_muscles text[] default '{}'::text[],
  equipments text[] default '{}'::text[],
  difficulty text,
  created_at timestamptz not null default now()
);

-- Workout sessions
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  title text,
  duration_minutes integer,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Running sessions
create table if not exists public.run_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  distance_km numeric(6,2),
  duration_minutes integer,
  pace text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Meditation sessions
create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer,
  mood text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Calorie / nutrition logs
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  image_url text,
  source text default 'manual',
  items jsonb default '[]'::jsonb,
  total_calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  created_at timestamptz not null default now()
);

-- Simple plan shares (optional)
create table if not exists public.plan_shares (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  share_code text unique not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.run_sessions enable row level security;
alter table public.meditation_sessions enable row level security;
alter table public.food_logs enable row level security;
alter table public.plan_shares enable row level security;

-- Policies
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_upsert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "plans_crud_own" on public.plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plan_exercises_crud_own" on public.plan_exercises
  for all using (
    plan_id in (select id from public.plans where user_id = auth.uid())
  ) with check (
    plan_id in (select id from public.plans where user_id = auth.uid())
  );

create policy "workouts_crud_own" on public.workout_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "runs_crud_own" on public.run_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "meditations_crud_own" on public.meditation_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "food_logs_crud_own" on public.food_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plan_shares_owner" on public.plan_shares
  for all using (
    plan_id in (select id from public.plans where user_id = auth.uid())
  ) with check (
    plan_id in (select id from public.plans where user_id = auth.uid())
  );
