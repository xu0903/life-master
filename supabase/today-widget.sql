-- LifeMaster「今日任務」小工具：和備忘錄小工具共用同一張表、同一組 token。
-- 在 memo-widget.sql 之後執行，可重複執行。
--
-- App 打開「小工具也顯示今日任務」後，把今天的習慣、連續天數、單字與到期待辦摘要存在 today 欄位；
-- Scriptable 腳本的參數填 today 時改顯示這一份。

alter table public.memo_widgets add column if not exists today jsonb;

-- 上傳今日摘要（傳 null 代表關閉），回傳小工具用的 token
create or replace function public.save_today_widget(p_today jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  t uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_today is not null and (jsonb_typeof(p_today) <> 'object' or length(p_today::text) > 20000) then
    raise exception 'bad summary';
  end if;
  insert into memo_widgets (user_id, today) values (auth.uid(), p_today)
  on conflict (user_id) do update set today = excluded.today, updated_at = now()
  returning token into t;
  return t;
end $$;

-- 取代 memo-widget.sql 的版本：多回傳 today
create or replace function public.get_memo_widget(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('memos', memos, 'today', today, 'updatedAt', updated_at) from memo_widgets where token = p_token;
$$;

revoke all on function public.save_today_widget(jsonb) from public, anon;
grant execute on function public.save_today_widget(jsonb) to authenticated;
grant execute on function public.get_memo_widget(uuid) to anon, authenticated;
