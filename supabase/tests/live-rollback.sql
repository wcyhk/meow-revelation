-- Run as the project SQL-editor owner after applying the migration.
-- All temporary Auth users, profiles and scores are rolled back, never published.
begin;
do $$
declare qa uuid:=gen_random_uuid();
begin
  insert into auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
    values(qa,'authenticated','authenticated','qa-'||qa::text||'@players.invalid','{}','{}',now(),now());
  perform set_config('request.jwt.claims',jsonb_build_object('sub',qa,'role','authenticated','is_anonymous',false)::text,true);
  perform set_config('request.jwt.claim.sub',qa::text,true);
end $$;
set local role authenticated;
select public.meow_set_name('臨時回滾測試');
do $$
declare sample jsonb; board jsonb;
begin
  sample:=jsonb_build_object('id',gen_random_uuid(),'difficulty','vigil','ruleset','forest-1',
    'highest_floor',10,'cleared_ms',60000,'elapsed_ms',61000,'kills',20,'weapon_id','qilin',
    'result_status','failed','offline',true,'revision',1,'started_at',now(),'test_mode',false,'practice',false);
  perform public.meow_submit_run(sample);
  perform public.meow_submit_run(sample);
  if (select count(*) from public.meow_runs where player_id=auth.uid())<>1 then raise exception 'Duplicate run was not deduplicated'; end if;
  sample:=sample||jsonb_build_object('id',gen_random_uuid(),'highest_floor',20,'cleared_ms',120000,'elapsed_ms',121000);
  perform public.meow_submit_run(sample);
  board:=public.meow_leaderboard('vigil',100);
  if (board->'personal'->>'highest_floor')::int<>20 then raise exception 'Best floor mismatch'; end if;
  if (board->'personal'->>'cleared_ms')::bigint<>120000 then raise exception 'Clear time mismatch'; end if;
  if (select count(*) from public.meow_runs where player_id<>auth.uid())<>0 then raise exception 'RLS exposed another player history'; end if;
  begin
    perform public.meow_submit_run(sample||jsonb_build_object('id',gen_random_uuid(),'test_mode',true));
    raise exception 'Invincible run was accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.meow_submit_run(sample||jsonb_build_object('id',gen_random_uuid(),'practice',true));
    raise exception 'Practice run was accepted';
  exception when invalid_parameter_value then null; end;
  raise notice 'MEOW_RANKING_SMOKE_OK';
end $$;
rollback;
