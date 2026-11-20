import {OnlinePlayer} from '../eclipse/online-player.mjs';
import {onlineConfig} from '../eclipse/online-config.mjs';
const player=new OnlinePlayer({config:{...onlineConfig,email:true,google:true}});
const $=id=>document.getElementById(id);
let busy=false,googleReady=false,retryAt=0,timer;
function paint(){
  $('email').readOnly=busy||!!player.user;
  $('code').readOnly=busy||!!player.user;
  $('google').disabled=busy||!navigator.onLine||!googleReady||!!player.user;
  $('send').disabled=busy||!navigator.onLine||Date.now()<retryAt||!!player.user;
  $('verify').disabled=busy||!navigator.onLine||!!player.user;
  $('account-state').textContent=player.user?'已登入 · '+(player.name||'守燈者-'+player.user.id.slice(0,6))+(player.syncing?' · 同步中⋯⋯':player.pending?' · 待同步 '+player.pending+' 局':' · 沒有待補交紀錄'):
    navigator.onLine?'訪客 · 登入後可合併此裝置嘅未綁定紀錄':'目前離線 · 訪客紀錄仍在裝置保存';
}
async function act(action,success){
  if(busy)return;busy=true;paint();$('notice').textContent='處理中⋯⋯';
  try{await action();$('notice').textContent=success??'';}catch(error){$('notice').textContent=error.message;}
  finally{busy=false;paint();}
}
player.addEventListener('change',()=>{paint();if(player.user)$('code').value='';});
$('google').addEventListener('click',()=>act(()=>player.google()));
$('email-form').addEventListener('submit',event=>{
  event.preventDefault();if(Date.now()<retryAt)return;
  act(async()=>{await player.signIn($('email').value);retryAt=Date.now()+60000;clearTimeout(timer);timer=setTimeout(paint,60050);$('code').focus();},'已寄出驗證碼，請檢查收件匣或垃圾郵件。');
});
$('verify-form').addEventListener('submit',event=>{event.preventDefault();act(()=>player.verify($('email').value,$('code').value),'登入成功，可以返回遊戲。');});
addEventListener('online',paint);addEventListener('offline',paint);
await player.ready;
try{
  const response=await fetch(onlineConfig.url+'/auth/v1/settings',{headers:{apikey:onlineConfig.publishableKey}});
  const settings=await response.json();googleReady=!!settings.external?.google;
  if(!googleReady)$('notice').textContent='Google 服務設定尚未完成，可以稍後再試。';
}catch{$('notice').textContent='暫時未能檢查服務，請連網後重試。';}
paint();
