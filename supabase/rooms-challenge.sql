-- LifeMaster 房間共同挑戰：房主設定「每人本週打卡 N 次」，全員達成就一起慶祝
-- 在 schema.sql 之後執行，可重複執行。

alter table public.rooms add column if not exists weekly_goal int not null default 0;

create or replace function public.set_room_goal(p_room uuid, p_goal int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_goal < 0 or p_goal > 100 then raise exception 'invalid goal'; end if;
  update rooms set weekly_goal = p_goal where id = p_room and owner = auth.uid();
  if not found then raise exception 'not owner'; end if;
end $$;
