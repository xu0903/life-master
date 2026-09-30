-- LifeMaster 雲端功能（背景推播 + 夥伴房間）
-- 在 Supabase Dashboard → SQL Editor 整段貼上執行一次即可，可重複執行。

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------- 推播訂閱 ----------

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

drop policy if exists "own subscriptions" on public.push_subscriptions;
create policy "own subscriptions" on public.push_subscriptions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 同一個 endpoint 換了匿名帳號時也能接手，所以用 security definer
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end $$;

-- ---------- 待發送的通知（待辦提醒、夥伴督促） ----------

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null default 'todo' check (kind in ('todo', 'nudge')),
  ref text,
  from_user uuid references auth.users on delete set null,
  title text not null,
  body text not null default '',
  fire_at timestamptz not null,
  sent_at timestamptz,
  unique (user_id, kind, ref)
);
create index if not exists notifications_due on public.notifications (fire_at) where sent_at is null;
alter table public.notifications enable row level security;

drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());

-- 用目前裝置上的待辦提醒整批取代雲端排程
create or replace function public.sync_reminders(items jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if jsonb_array_length(items) > 300 then raise exception 'too many reminders'; end if;

  delete from notifications
  where user_id = auth.uid() and kind = 'todo' and sent_at is null
    and ref not in (select x->>'ref' from jsonb_array_elements(items) x);

  insert into notifications (user_id, kind, ref, title, body, fire_at)
  select auth.uid(), 'todo', x->>'ref', left(x->>'title', 200), left(coalesce(x->>'body', ''), 200), (x->>'fire_at')::timestamptz
  from jsonb_array_elements(items) x
  on conflict (user_id, kind, ref) do update
    set title = excluded.title, body = excluded.body, fire_at = excluded.fire_at, sent_at = null;
end $$;

-- ---------- 夥伴房間 ----------

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  owner uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.rooms on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  nickname text not null,
  progress jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index if not exists room_members_user on public.room_members (user_id);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- security definer 避免 room_members 的 policy 查自己造成遞迴
create or replace function public.is_room_member(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from room_members where room_id = rid and user_id = auth.uid());
$$;

drop policy if exists "members read room" on public.rooms;
create policy "members read room" on public.rooms
  for select to authenticated using (public.is_room_member(id));
drop policy if exists "owner deletes room" on public.rooms;
create policy "owner deletes room" on public.rooms
  for delete to authenticated using (owner = auth.uid());

drop policy if exists "members read members" on public.room_members;
create policy "members read members" on public.room_members
  for select to authenticated using (public.is_room_member(room_id));
drop policy if exists "update own membership" on public.room_members;
create policy "update own membership" on public.room_members
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "leave or kick" on public.room_members;
create policy "leave or kick" on public.room_members
  for delete to authenticated using (
    user_id = auth.uid() or exists (select 1 from public.rooms r where r.id = room_id and r.owner = auth.uid())
  );

-- 建立 / 加入只能走下面的函式；自己的那一列只能改暱稱和進度
revoke insert, update on public.rooms from anon, authenticated;
revoke insert, update on public.room_members from anon, authenticated;
grant update (nickname, progress, updated_at) on public.room_members to authenticated;

create or replace function public.create_room(p_name text, p_nickname text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  new_code text;
  new_id uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if length(trim(p_name)) = 0 or length(trim(p_nickname)) = 0 then raise exception 'name required'; end if;
  if (select count(*) from room_members where user_id = auth.uid()) >= 10 then raise exception 'room limit'; end if;
  loop
    select string_agg(substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), '') into new_code
    from generate_series(1, 6);
    begin
      insert into rooms (code, name, owner) values (new_code, left(trim(p_name), 30), auth.uid()) returning id into new_id;
      exit;
    exception when unique_violation then
      -- 邀請碼撞號就再抽一次
    end;
  end loop;
  insert into room_members (room_id, user_id, nickname) values (new_id, auth.uid(), left(trim(p_nickname), 20));
  return new_id;
end $$;

create or replace function public.join_room(p_code text, p_nickname text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  rid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if length(trim(p_nickname)) = 0 then raise exception 'name required'; end if;
  select id into rid from rooms where code = upper(trim(p_code));
  if rid is null then raise exception 'room not found'; end if;
  if not is_room_member(rid) then
    if (select count(*) from room_members where room_id = rid) >= 20 then raise exception 'room full'; end if;
    if (select count(*) from room_members where user_id = auth.uid()) >= 10 then raise exception 'room limit'; end if;
  end if;
  insert into room_members (room_id, user_id, nickname) values (rid, auth.uid(), left(trim(p_nickname), 20))
  on conflict (room_id, user_id) do update set nickname = excluded.nickname;
  return rid;
end $$;

-- ---------- 觸發推播（每分鐘 + 督促時立刻） ----------

create schema if not exists private;
create table if not exists private.config (key text primary key, value text not null);

create or replace function private.trigger_push()
returns void language plpgsql security definer set search_path = '' as $$
declare
  base_url text;
  secret text;
begin
  if not exists (select 1 from public.notifications where sent_at is null and fire_at <= now()) then return; end if;
  select value into base_url from private.config where key = 'functions_url';
  select value into secret from private.config where key = 'cron_secret';
  if base_url is null or secret is null then return; end if;
  perform net.http_post(
    url := base_url || '/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := '{}'::jsonb
  );
end $$;

-- 督促同房間的夥伴：對同一個人 1 分鐘內只能送一次
create or replace function public.nudge(p_room uuid, p_to uuid, p_message text)
returns void language plpgsql security definer set search_path = public as $$
declare
  sender text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_to = auth.uid() then raise exception 'cannot nudge yourself'; end if;
  select nickname into sender from room_members where room_id = p_room and user_id = auth.uid();
  if sender is null or not exists (select 1 from room_members where room_id = p_room and user_id = p_to) then
    raise exception 'not in room';
  end if;
  if exists (
    select 1 from notifications
    where kind = 'nudge' and from_user = auth.uid() and user_id = p_to and fire_at > now() - interval '1 minute'
  ) then
    raise exception 'too fast';
  end if;
  insert into notifications (user_id, kind, from_user, title, body, fire_at)
  values (p_to, 'nudge', auth.uid(), sender || ' 督促你', left(coalesce(p_message, ''), 100), now());
  perform private.trigger_push();
end $$;

select cron.unschedule(jobid) from cron.job where jobname in ('lifemaster-send-push', 'lifemaster-cleanup');
select cron.schedule('lifemaster-send-push', '* * * * *', $$select private.trigger_push()$$);
-- 已送出的通知留 7 天就清掉
select cron.schedule('lifemaster-cleanup', '17 3 * * *', $$delete from public.notifications where sent_at < now() - interval '7 days'$$);

-- 夥伴進度即時更新
do $$
begin
  alter publication supabase_realtime add table public.room_members;
exception when duplicate_object then null;
end $$;
