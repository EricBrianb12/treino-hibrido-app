-- Semana Híbrida: tabela de progresso compartilhado por código
-- Rode no Supabase: SQL Editor → New query → colar e Run

create table if not exists public.progress (
  sync_code   text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Anon pode ler/escrever (dados não sensíveis; código de 7 chars = "senha")
create policy "progress_select_anon"
  on public.progress for select
  to anon using (true);

create policy "progress_insert_anon"
  on public.progress for insert
  to anon with check (true);

create policy "progress_update_anon"
  on public.progress for update
  to anon using (true) with check (true);
