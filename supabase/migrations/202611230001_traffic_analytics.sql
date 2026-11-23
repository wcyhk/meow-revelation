begin;

create schema if not exists meow_analytics;
revoke all on schema meow_analytics from public, anon, authenticated;

create table if not exists meow_analytics.visits (
  id uuid primary key,
  source text not null check (source in (
    'direct', 'other', 'webgamejp', 'kchkd', 'game16', 'youtube',
    'bahamut', 'bilibili', 'indieradar', 'reddit', 'itchio', 'crazygames', 'threads'
  )),
  locale text not null check (locale in ('zh-Hant', 'zh-Hans', 'en', 'ja')),
  day date not null,
  starts integer not null check (starts between 0 and 10000),
  play_ms integer not null check (play_ms between 0 and 604800000 and (starts > 0 or play_ms = 0))
);

create index if not exists meow_analytics_visit_day on meow_analytics.visits(day);
alter table meow_analytics.visits enable row level security;
revoke all on meow_analytics.visits from public, anon, authenticated;

create or replace function public.meow_record_traffic(p_visits jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  hk_today date := (now() at time zone 'Asia/Hong_Kong')::date;
begin
  if jsonb_typeof(p_visits) is distinct from 'array' then
    raise exception 'Expected a batch of visit summaries' using errcode = '22023';
  end if;
  if jsonb_array_length(p_visits) not between 1 and 24 then
    raise exception 'Expected one to 24 visit summaries' using errcode = '22023';
  end if;

  insert into meow_analytics.visits as saved (id, source, locale, day, starts, play_ms)
  select visit.id, visit.source, visit.locale, least(visit.day, hk_today), visit.starts, visit.play_ms
  from jsonb_to_recordset(p_visits) as visit(id uuid, source text, locale text, day date, starts integer, play_ms integer)
  where visit.day between hk_today - 30 and hk_today + 1
  on conflict (id) do update
    set starts = greatest(saved.starts, excluded.starts),
        play_ms = greatest(saved.play_ms, excluded.play_ms)
    where (saved.source, saved.locale, saved.day) = (excluded.source, excluded.locale, excluded.day)
      and (excluded.starts > saved.starts or excluded.play_ms > saved.play_ms);
end;
$$;

revoke all on function public.meow_record_traffic(jsonb) from public, anon, authenticated;
grant execute on function public.meow_record_traffic(jsonb) to anon;

create or replace view meow_analytics.last_30_days as
select source,
       count(*) as visits,
       count(*) filter (where starts > 0) as visits_that_started,
       round(100.0 * count(*) filter (where starts > 0) / count(*), 1) as start_rate_pct,
       sum(starts) as runs_started,
       round(sum(play_ms)::numeric / 3600000, 2) as play_hours,
       round(sum(play_ms)::numeric / nullif(sum(starts), 0) / 60000, 1) as minutes_per_run
from meow_analytics.visits
where day >= (now() at time zone 'Asia/Hong_Kong')::date - 29
group by source;

revoke all on meow_analytics.last_30_days from public, anon, authenticated;

commit;
