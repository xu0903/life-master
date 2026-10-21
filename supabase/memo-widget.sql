-- LifeMaster 備忘錄小工具（iPhone 主畫面／鎖定畫面，透過 Scriptable App 顯示）
-- 在 schema.sql 之後執行，可重複執行。
--
-- App 開啟小工具後，把要顯示的備忘上傳到這裡；Scriptable 腳本帶著一組隨機 token 來讀。
-- 表本身沒有任何 policy，只能透過下面的函式存取。

create table if not exists public.memo_widgets (
  user_id uuid primary key references auth.users on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  memos jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.memo_widgets enable row level security;

-- 上傳備忘，回傳小工具用的 token（第一次呼叫時建立）
create or replace function public.save_memo_widget(p_memos jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  t uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if jsonb_typeof(p_memos) <> 'array' or length(p_memos::text) > 20000 then raise exception 'bad memos'; end if;
  insert into memo_widgets (user_id, memos) values (auth.uid(), p_memos)
  on conflict (user_id) do update set memos = excluded.memos, updated_at = now()
  returning token into t;
  return t;
end $$;

-- 換一組 token：舊的腳本立刻失效
create or replace function public.rotate_memo_widget_token()
returns uuid language plpgsql security definer set search_path = public as $$
declare
  t uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update memo_widgets set token = gen_random_uuid() where user_id = auth.uid() returning token into t;
  return t;
end $$;

-- 關閉小工具：雲端那份刪掉
create or replace function public.delete_memo_widget()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from memo_widgets where user_id = auth.uid();
end $$;

-- Scriptable 用 anon key + token 讀取；token 不對就回傳 null
create or replace function public.get_memo_widget(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('memos', memos, 'updatedAt', updated_at) from memo_widgets where token = p_token;
$$;

revoke all on function public.save_memo_widget(jsonb) from public, anon;
revoke all on function public.rotate_memo_widget_token() from public, anon;
revoke all on function public.delete_memo_widget() from public, anon;
grant execute on function public.save_memo_widget(jsonb) to authenticated;
grant execute on function public.rotate_memo_widget_token() to authenticated;
grant execute on function public.delete_memo_widget() to authenticated;
grant execute on function public.get_memo_widget(uuid) to anon, authenticated;
