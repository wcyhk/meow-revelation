import {onlineConfig} from '../../eclipse/online-config.mjs';
let url;try{url=new URL(onlineConfig.url);}catch{throw new Error('Supabase project URL is not configured. Do not publish the account/ranking release yet.');}
if(url.protocol!=='https:'||url.pathname!=='/')throw new Error('Use the HTTPS project root URL.');
const key=onlineConfig.publishableKey;
let role;try{role=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role;}catch{}
if(!key||key.startsWith('sb_secret_')||role==='service_role'||!(key.startsWith('sb_publishable_')||role==='anon')){
  throw new Error('Only a public publishable/anon key may be bundled. Never publish a secret or service-role key.');
}
console.log('Public account/ranking config is ready for '+url.hostname+'.');
