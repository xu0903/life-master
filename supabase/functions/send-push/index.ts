// 由資料庫的 pg_cron 每分鐘呼叫：把到期的通知用 Web Push 送到使用者的裝置
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'https://xu0903.github.io/life-master/',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

Deno.serve(async req => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('forbidden', { status: 403 })
  }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // 先標記為已送出再發送，避免兩次呼叫重疊時重複通知
  const { data: due, error } = await db
    .from('notifications')
    .update({ sent_at: new Date().toISOString() })
    .is('sent_at', null)
    .lte('fire_at', new Date().toISOString())
    .select('id, user_id, kind, ref, title, body')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!due?.length) return Response.json({ sent: 0 })

  const { data: subs } = await db
    .from('push_subscriptions')
    .select('endpoint, user_id, p256dh, auth')
    .in('user_id', [...new Set(due.map(n => n.user_id))])

  let sent = 0
  const expired: string[] = []
  await Promise.all(
    due.flatMap(n =>
      (subs ?? [])
        .filter(s => s.user_id === n.user_id)
        .map(async s => {
          const payload = JSON.stringify({
            title: n.kind === 'todo' ? `⏰ ${n.title}` : n.title,
            body: n.body,
            tag: n.kind === 'todo' ? n.ref : `nudge-${n.id}`,
          })
          try {
            await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 })
            sent++
          } catch (err) {
            // 訂閱已失效（使用者移除 App 或關閉通知）
            const status = (err as { statusCode?: number }).statusCode
            if (status === 404 || status === 410) expired.push(s.endpoint)
            else console.error('push failed', status, err)
          }
        }),
    ),
  )
  if (expired.length) await db.from('push_subscriptions').delete().in('endpoint', expired)

  return Response.json({ sent, due: due.length })
})
