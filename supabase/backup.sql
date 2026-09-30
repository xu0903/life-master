-- LifeMaster 雲端備份與換機還原
-- 在 schema.sql 之後執行，可重複執行。

create table if not exists public.backups (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.backups enable row level security;

drop policy if exists "own backup" on public.backups;
create policy "own backup" on public.backups
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 還原碼只存雜湊值；沒有任何 policy，只能透過下面的函式存取
create table if not exists public.recovery_codes (
  user_id uuid primary key references auth.users on delete cascade,
  code_hash text not null unique,
  created_at timestamptz not null default now()
);
alter table public.recovery_codes enable row level security;

create or replace function public.set_recovery_code(p_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if length(p_code) < 16 then raise exception 'code too short'; end if;
  insert into recovery_codes (user_id, code_hash)
  values (auth.uid(), encode(sha256(convert_to(p_code, 'utf8')), 'hex'))
  on conflict (user_id) do update set code_hash = excluded.code_hash, created_at = now();
end $$;

-- 在新裝置輸入還原碼：把舊帳號的備份、房間、提醒全部搬到目前這個帳號，並回傳備份內容
create or replace function public.redeem_recovery_code(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  old uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  select user_id into old from recovery_codes where code_hash = encode(sha256(convert_to(p_code, 'utf8')), 'hex');
  if old is null then raise exception 'invalid code'; end if;

  if old <> me then
    delete from backups where user_id = me;
    update backups set user_id = me where user_id = old;

    -- 兩個帳號都在同一個房間時，保留舊帳號的那一筆（有暱稱與進度）
    delete from room_members where user_id = me and room_id in (select room_id from room_members where user_id = old);
    update room_members set user_id = me where user_id = old;
    update rooms set owner = me where owner = old;

    delete from notifications where user_id = me and kind = 'todo';
    update notifications set user_id = me where user_id = old;
    update notifications set from_user = me where from_user = old;

    -- 舊裝置不再收到推播；新裝置會自己重新登記
    delete from push_subscriptions where user_id = old;

    delete from recovery_codes where user_id = me;
    update recovery_codes set user_id = me where user_id = old;
  end if;

  return (select data from backups where user_id = me);
end $$;
