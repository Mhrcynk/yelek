-- Sunucu işlevleri denetimi. Supabase SQL düzenleyicisinde (ya da MCP execute_sql ile) çalıştırılır.
-- Hiçbir şeyi kalıcı değiştirmez: 1. bölüm yalnız okur, 2. bölüm sonunda geri alınır.

-- 1) Derleme denetimi: plpgsql_check ile bütün işlevler taranır.
--    Belirsiz sütun adı, olmayan sütun, yanlış tür gibi hatalar ancak o satır çalışınca ortaya çıkar;
--    bu sorgu onları çalıştırmadan bulur. Boş sonuç beklenir.
--    (admin_set_roster eski yoklama işlevi, uygulama kullanmıyor; bilinen hatası listeden çıkarıldı.)
select p.oid::regprocedure::text as islev, c.lineno as satir, c.message as hata
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join lateral extensions.plpgsql_check_function_tb(p.oid) c
where n.nspname in ('public','private')
  and p.prolang = (select oid from pg_language where lanname = 'plpgsql')
  and p.prorettype <> 'trigger'::regtype
  and c.level = 'error'
  and p.proname <> 'admin_set_roster'
order by 1;

-- 2) Kupa akışı: davet → kabul → maç kaydı. Gerçek kimlikler sorguyla bulunur, dosyada yer almaz.
--    Sonuçta üç satır da true olmalı; en sonda her şey geri alınır, bildirim gitmez.
begin;
create temp table _kp on commit drop as
with k as (select * from private.ult_kupa where team_id = 1 order by start_at desc limit 1),
c as (select k.id kid, s, x.a, x.b from k, generate_series(0,7) s, lateral private.ult_kp_cift(1, k.id, k.players, 1, s) x
      where x.ok and x.a is not null and x.b is not null
        and not exists (select 1 from private.ult_events e where e.team_id = 1 and e.kind = 'kp' and e.k = 'kp|'||k.id||'|1|'||s)
        and not exists (select 1 from private.ult_davet d where d.team_id = 1 and d.k = 'kp|'||k.id||'|1|'||s))
select c.*, 'kp|'||c.kid||'|1|'||c.s as key,
  (select user_id from private.members m where m.team_id = 1 and m.status = 'onayli' and m.player_id = c.a limit 1) ua,
  (select user_id from private.members m where m.team_id = 1 and m.status = 'onayli' and m.player_id = c.b limit 1) ub
from c where exists (select 1 from private.ult_state x where x.team_id = 1 and x.player_id = c.a and x.data->>'ep' = private.ult_ep(1)::text)
limit 1;
create temp table _sonuc(adim text, ok boolean) on commit drop;
select set_config('request.jwt.claims', json_build_object('sub', ua, 'role', 'authenticated')::text, true) from _kp;
insert into _sonuc select 'davet', (public.ult_kp_gonder(key, '{"f":"2-2-2"}'::jsonb)->>'ok')::boolean from _kp;
select set_config('request.jwt.claims', json_build_object('sub', ub, 'role', 'authenticated')::text, true) from _kp;
insert into _sonuc select 'kabul', (public.ult_kp_kabul(key, '{"f":"2-2-2"}'::jsonb)->>'ok')::boolean from _kp;
select set_config('request.jwt.claims', json_build_object('sub', ua, 'role', 'authenticated')::text, true) from _kp;
insert into _sonuc select 'mac', (public.ult_event('kp', b, key, jsonb_build_object('h', a, 'ga', 2, 'gb', 1, 'w', a, 'v', 2))->>'ok')::boolean from _kp;
insert into _sonuc select 'eski motor reddedilir', (public.ult_event('kp', b, key||'x', jsonb_build_object('h', a, 'ga', 1, 'gb', 0, 'w', a))->>'error') = 'guncelle' from _kp;
select * from _sonuc;
rollback;
