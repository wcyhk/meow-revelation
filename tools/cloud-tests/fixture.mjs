// Local-only integration fixture: real PostgreSQL migration/RLS with a fake
// email provider. This never sends email or connects to a production project.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash,createHmac} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';

export async function createFixture(root){
  const db=new PGlite();
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create function auth.uid() returns uuid language sql stable as $$select nullif(auth.jwt()->>'sub','')::uuid$$;
    grant usage on schema auth to anon,authenticated;`);
  await db.exec(fs.readFileSync(new URL('../../supabase/migrations/202611190001_player_rankings.sql',import.meta.url),'utf8'));
  const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'];
  await db.query('insert into auth.users values ($1),($2)',ids);
  const state={failNextSubmit:0,submissions:0,otp:[],users:new Map(),tokens:new Map()};
  let serialized=Promise.resolve(),release;
  const queue=fn=>{const next=serialized.catch(()=>{}).then(fn);serialized=next;return next;};
  const session=email=>{
    const id=email==='cat-b@example.test'?ids[1]:ids[0];
    const user={id,aud:'authenticated',role:'authenticated',email,is_anonymous:false,
      app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-11-19T00:00:00Z',email_confirmed_at:'2026-11-19T00:00:00Z'};
    const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
    const data=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:id,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600});
    const token=data+'.'+createHmac('sha256','local-fixture-only').update(data).digest('base64url');
    state.tokens.set(token,user);state.users.set(email,user);
    return {access_token:token,refresh_token:'fixture-'+id,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user};
  };
  const server=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost'),route=url.pathname;
    const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    try{
      let raw='';for await(const chunk of req)raw+=chunk;
      const input=raw?JSON.parse(raw):{};
      const user=state.tokens.get(req.headers.authorization?.replace(/^Bearer /,''));
      if(route==='/auth/v1/otp'){state.otp.push(input.email);send(200,{});return;}
      if(route==='/auth/v1/verify'){
        if(input.token!=='123456'){send(403,{msg:'Invalid code'});return;}
        send(200,session(input.email));return;
      }
      if(route==='/auth/v1/token'){
        const email=input.refresh_token==='fixture-'+ids[1]?'cat-b@example.test':'cat-a@example.test';send(200,session(email));return;
      }
      if(route==='/auth/v1/user'){send(user?200:401,user??{msg:'Unauthorized'});return;}
      if(route==='/auth/v1/logout'){send(200,{});return;}
      if(route.startsWith('/rest/v1/')){
        await queue(async()=>{
          await db.exec('reset role');
          await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify(user?{sub:user.id,is_anonymous:false}:{})]);
          await db.exec('set role '+(user?'authenticated':'anon'));
          try{
            if(route==='/rest/v1/rpc/meow_submit_run'){
              state.submissions++;
              if(state.failNextSubmit-->0){send(503,{code:'503',message:'Fixture transient failure'});return;}
              send(200,(await db.query('select public.meow_submit_run($1::jsonb) as result',[JSON.stringify(input.p_run)])).rows[0].result);
            }else if(route==='/rest/v1/rpc/meow_set_name'){
              send(200,(await db.query('select public.meow_set_name($1) as result',[input.p_name])).rows[0].result);
            }else if(route==='/rest/v1/rpc/meow_leaderboard'){
              send(200,(await db.query('select public.meow_leaderboard($1,$2) as result',[input.p_difficulty,input.p_limit??50])).rows[0].result);
            }else if(route==='/rest/v1/meow_profiles'){
              send(200,(await db.query('select display_name from public.meow_profiles where player_id=$1',[url.searchParams.get('player_id')?.slice(3)??user?.id])).rows);
            }else if(route==='/rest/v1/meow_runs'){
              const limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit')??100)));
              const offset=Math.max(0,Number(url.searchParams.get('offset')??0));
              send(200,(await db.query('select * from public.meow_runs order by started_at desc,id desc limit $1 offset $2',[limit,offset])).rows);
            }else send(404,{message:'Not found'});
          }catch(error){console.log('LOCAL FIXTURE SQL ERROR',error.code,error.message,JSON.stringify(input.p_run??{}));send(400,{code:error.code,message:error.message});}
        });
        return;
      }
      const config='export const onlineConfig='+JSON.stringify({url:'http://127.0.0.1:'+server.address().port,publishableKey:'sb_publishable_local_fixture',google:false,ruleset:'forest-1'})+';\n';
      if(route==='/eclipse/online-config.mjs'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(config);return;}
      if(route==='/offline-assets.js'){
        release??=vm.runInNewContext(fs.readFileSync(path.join(root,'offline-assets.js'),'utf8')+';offlineRelease');
        const files=release.files.map(row=>row[0]==='eclipse/online-config.mjs'?[row[0],Buffer.byteLength(config),createHash('sha256').update(config).digest('base64')]:row);
        const version=createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0,20);
        res.writeHead(200,{'Content-Type':'text/javascript'});res.end('const offlineRelease='+JSON.stringify({version,files})+';\n');return;
      }
      const file=path.resolve(root,'.'+(route.endsWith('/')?route+'index.html':route));
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
      res.setHeader('Content-Type',{'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'}[path.extname(file)]??'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    }catch(error){if(!res.headersSent)send(500,{message:error.message});else res.end();}
  });
  return {server,state,db,queue};
}
