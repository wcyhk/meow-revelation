// Uses only the shipped public key. Never creates accounts or production scores.
import assert from 'node:assert/strict';
import {createClient} from '../../eclipse/vendor/supabase.mjs';
import {onlineConfig as config} from '../../eclipse/online-config.mjs';
const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
for(const mode of ['vigil','blood','abyss']){
  const {data,error}=await client.rpc('meow_leaderboard',{p_difficulty:mode,p_limit:100});
  assert.equal(error,null,mode+' leaderboard must work for guests');
  assert.ok(Array.isArray(data.rows));assert.equal(data.personal,null);
  assert.ok(data.rows.every(row=>!('email' in row)&&!('elapsed_ms' in row)));
}
for(const [label,request] of [
  ['private history',client.from('meow_runs').select('id')],
  ['score submission',client.rpc('meow_submit_run',{p_run:{}})],
  ['nickname update',client.rpc('meow_set_name',{p_name:'unauthorized-test'})],
  ['direct insert',client.from('meow_profiles').insert({player_id:crypto.randomUUID(),display_name:'unauthorized-test'})],
]){
  const {error}=await request;
  assert.equal(error?.code,'42501',label+' must reject unauthenticated access');
}
console.log('Live Supabase: all three public leaderboards reachable; anonymous history, submission, name changes and direct writes denied. No accounts or scores created.');
