-- LifeMaster 房間功能更新：鼓勵訊息 + 每晚自動提醒還沒打卡的夥伴
-- 在 schema.sql 之後執行，可重複執行。

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('todo', 'nudge', 'cheer', 'remind'));

-- 督促或鼓勵同房間的夥伴：對同一個人 1 分鐘內只能送一次
drop function if exists public.nudge(uuid, uuid, text);
create or replace function public.nudge(p_room uuid, p_to uuid, p_message text, p_cheer boolean default false)
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
    where kind in ('nudge', 'cheer') and from_user = auth.uid() and user_id = p_to and fire_at > now() - interval '1 minute'
  ) then
    raise exception 'too fast';
  end if;
  insert into notifications (user_id, kind, from_user, title, body, fire_at)
  values (
    p_to,
    case when p_cheer then 'cheer' else 'nudge' end,
    auth.uid(),
    sender || case when p_cheer then ' 為你加油' else ' 督促你' end,
    left(coalesce(p_message, ''), 100),
    now()
  );
  perform private.trigger_push();
end $$;

-- 每天晚上 9 點（台灣時間）提醒房間裡今天還沒完成習慣的人；一個人一天最多一則
create or replace function private.remind_inactive()
returns void language plpgsql security definer set search_path = '' as $$
declare
  today text := to_char(now() at time zone 'Asia/Taipei', 'YYYY-MM-DD');
begin
  insert into public.notifications (user_id, kind, ref, title, body, fire_at)
  select distinct on (m.user_id)
    m.user_id, 'remind', today, '今天還沒完成打卡', '「' || r.name || '」的夥伴在等你，打開 LifeMaster 看看吧', now()
  from public.room_members m
  join public.rooms r on r.id = m.room_id
  where (select count(*) from public.room_members x where x.room_id = m.room_id) > 1
    and (
      m.progress->>'date' is distinct from today
      or coalesce((m.progress->>'habitsDone')::int, 0) < coalesce((m.progress->>'habitsTotal')::int, 0)
    )
  order by m.user_id, m.joined_at
  on conflict (user_id, kind, ref) do nothing;
  perform private.trigger_push();
end $$;

select cron.unschedule(jobid) from cron.job where jobname = 'lifemaster-remind-inactive';
select cron.schedule('lifemaster-remind-inactive', '0 13 * * *', $$select private.remind_inactive()$$);
