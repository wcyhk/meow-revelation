begin;

create table if not exists public.meow_profiles (
  player_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 24 and display_name !~ '[[:cntrl:]]'),
  created_at timestamptz not null default now()
);
create table if not exists public.meow_runs (
  id uuid primary key,
  player_id uuid not null references auth.users(id) on delete cascade,
  difficulty text not null check (difficulty in ('vigil','blood','abyss')),
  ruleset text not null default 'forest-1' check (ruleset='forest-1'),
  highest_floor integer not null check (highest_floor between 0 and 100),
  cleared_ms bigint not null check (cleared_ms>=highest_floor*100 and cleared_ms<=elapsed_ms),
  elapsed_ms bigint not null check (elapsed_ms between 0 and 604800000),
  kills integer not null check (kills between 0 and 10000000),
  weapon_id text not null check (char_length(weapon_id) between 1 and 64),
  branch text check (branch in ('tech','mystic')),
  result_status text not null check (result_status in ('active','failed','completed','abandoned')),
  offline boolean not null default false,
  revision integer not null check (revision between 1 and 100000),
  started_at timestamptz not null,
  received_at timestamptz not null default now(),
  check (result_status<>'completed' or highest_floor=100),
  check (highest_floor<>0 or cleared_ms=0)
);
create index if not exists meow_runs_player_history on public.meow_runs(player_id,started_at desc);
create index if not exists meow_runs_ranking on public.meow_runs(difficulty,ruleset,player_id,highest_floor desc,cleared_ms);

alter table public.meow_profiles enable row level security;
alter table public.meow_runs enable row level security;
drop policy if exists meow_profiles_public_names on public.meow_profiles;
create policy meow_profiles_public_names on public.meow_profiles for select to anon,authenticated using (true);
drop policy if exists meow_runs_own_history on public.meow_runs;
create policy meow_runs_own_history on public.meow_runs for select to authenticated using ((select auth.uid())=player_id);
revoke all on public.meow_profiles,public.meow_runs from public,anon,authenticated;
grant select on public.meow_profiles to anon,authenticated;
grant select on public.meow_runs to authenticated;

create or replace function public.meow_set_name(p_name text) returns text
language plpgsql security definer set search_path=pg_catalog as $$
declare v_uid uuid:=auth.uid(); v_name text:=btrim(p_name);
begin
  if v_uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'Sign in to save your player name' using errcode='42501';
  end if;
  if v_name is null or char_length(v_name) not between 1 and 24 or v_name ~ '[[:cntrl:]]' then
    raise exception 'Use a name of 1 to 24 characters' using errcode='22023';
  end if;
  insert into public.meow_profiles(player_id,display_name) values(v_uid,v_name)
    on conflict(player_id) do update set display_name=excluded.display_name;
  return v_name;
end; $$;

create or replace function public.meow_submit_run(p_run jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare
  v_uid uuid:=auth.uid(); v_id uuid:=(p_run->>'id')::uuid;
  v_revision integer:=(p_run->>'revision')::integer;
  v_floor integer:=(p_run->>'highest_floor')::integer;
  v_cleared bigint:=(p_run->>'cleared_ms')::bigint;
  v_elapsed bigint:=(p_run->>'elapsed_ms')::bigint;
  v_kills integer:=(p_run->>'kills')::integer;
  v_status text:=p_run->>'result_status';
  old public.meow_runs; saved public.meow_runs;
begin
  if v_uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'A permanent player account is required' using errcode='42501';
  end if;
  if coalesce((p_run->>'test_mode')::boolean,false) or coalesce((p_run->>'practice')::boolean,false) then
    raise exception 'Practice and invincible runs are not ranked' using errcode='22023';
  end if;
  if (p_run->>'started_at')::timestamptz>now()+interval '1 day' then
    raise exception 'Invalid start time' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_id::text,0));
  insert into public.meow_profiles(player_id,display_name) values(v_uid,'守燈者-'||left(v_uid::text,6))
    on conflict(player_id) do nothing;
  select * into old from public.meow_runs where id=v_id for update;
  if found then
    if old.player_id<>v_uid then raise exception 'This run belongs to another player' using errcode='42501'; end if;
    if v_revision<=old.revision then return jsonb_build_object('id',old.id,'revision',old.revision); end if;
    if old.difficulty<>p_run->>'difficulty' or old.ruleset<>p_run->>'ruleset'
      or old.started_at<>(p_run->>'started_at')::timestamptz or v_floor<old.highest_floor
      or v_elapsed<old.elapsed_ms or v_kills<old.kills
      or (v_floor=old.highest_floor and v_cleared<>old.cleared_ms)
      or (v_floor>old.highest_floor and v_cleared<old.elapsed_ms)
      or old.result_status<>'active' then
      raise exception 'Run checkpoints must advance without rewriting history' using errcode='22023';
    end if;
  end if;
  insert into public.meow_runs as runs(id,player_id,difficulty,ruleset,highest_floor,cleared_ms,elapsed_ms,kills,
    weapon_id,branch,result_status,offline,revision,started_at)
  values(v_id,v_uid,p_run->>'difficulty',p_run->>'ruleset',v_floor,v_cleared,v_elapsed,v_kills,
    p_run->>'weapon_id',p_run->>'branch',v_status,coalesce((p_run->>'offline')::boolean,false),v_revision,(p_run->>'started_at')::timestamptz)
  on conflict(id) do update set highest_floor=excluded.highest_floor,cleared_ms=excluded.cleared_ms,
    elapsed_ms=excluded.elapsed_ms,kills=excluded.kills,weapon_id=excluded.weapon_id,branch=excluded.branch,
    result_status=excluded.result_status,offline=runs.offline or excluded.offline,revision=excluded.revision,received_at=now()
    where runs.player_id=v_uid and runs.revision<excluded.revision
  returning * into saved;
  if saved.id is null then
    select * into saved from public.meow_runs where id=v_id;
    if saved.player_id<>v_uid then raise exception 'This run belongs to another player' using errcode='42501'; end if;
  end if;
  return jsonb_build_object('id',saved.id,'revision',saved.revision);
end; $$;

create or replace function public.meow_leaderboard(p_difficulty text,p_limit integer default 50) returns jsonb
language sql stable security definer set search_path=pg_catalog as $$
  with best as (
    select distinct on (r.player_id) r.* from public.meow_runs r
    where r.difficulty=p_difficulty and r.ruleset='forest-1' and r.highest_floor>0
    order by r.player_id,r.highest_floor desc,r.cleared_ms,r.started_at,r.id
  ), ranked as (
    select row_number() over(order by b.highest_floor desc,b.cleared_ms,b.started_at,b.id) as rank,
      b.player_id,p.display_name,b.highest_floor,b.cleared_ms,b.weapon_id,b.branch,b.offline,b.id as run_id
    from best b join public.meow_profiles p on p.player_id=b.player_id
  )
  select jsonb_build_object('rows',coalesce((select jsonb_agg(to_jsonb(toprows) order by rank)
    from (select * from ranked order by rank limit greatest(1,least(p_limit,100))) toprows),'[]'::jsonb),
    'personal',(select to_jsonb(mine) from ranked mine where player_id=auth.uid()),'updated_at',now());
$$;

revoke all on function public.meow_set_name(text),public.meow_submit_run(jsonb),public.meow_leaderboard(text,integer) from public,anon,authenticated;
grant execute on function public.meow_set_name(text),public.meow_submit_run(jsonb) to authenticated;
grant execute on function public.meow_leaderboard(text,integer) to anon,authenticated;
commit;
