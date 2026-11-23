
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const http = require('node:http');
const assert = require('node:assert/strict');
const cwd = path.resolve(process.argv[2]);
const remote = process.argv[3];
const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(),'eclipse-chrome-'));
const captures = path.join(os.tmpdir(),'eclipse-review');
fs.mkdirSync(captures,{recursive:true});
const server=http.createServer((req,res)=>{
  const route=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(cwd,'.'+(route.endsWith('/')?route+'index.html':route));
  if(!file.startsWith(cwd+path.sep) || !fs.existsSync(file)){res.writeHead(404).end();return;}
  const ext=path.extname(file);
  res.setHeader('Content-Type',{'.mjs':'text/javascript','.js':'text/javascript','.mp3':'audio/mpeg','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'}[ext]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
let chrome,ws;
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url = remote || 'http://127.0.0.1:'+server.address().port+ (process.env.ECLIPSE_ENTRY || '/');
  chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--autoplay-policy=document-user-activation-required','--use-angle=default','--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  const portFile=path.join(profile,'DevToolsActivePort');
  let port;
  for(let i=0;i<100&&!port;i++){
    try{port=fs.readFileSync(portFile,'utf8').split('\n')[0].trim();}catch(error){if(!['ENOENT','EBUSY'].includes(error.code))throw error;}
    if(!port)await sleep(100);
  }
  const [tab]=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let id=0;
  const pending=new Map(),errors=[],httpErrors=[];
  ws.addEventListener('message',event=>{
    const {id,method,params,result,error}=JSON.parse(event.data);
    if(id){const cb=pending.get(id);pending.delete(id);if(cb)error?cb.reject(error):cb.resolve(result);}
    if(method==='Runtime.exceptionThrown') errors.push(params.exceptionDetails.exception?.description||params.exceptionDetails.text);
    if(method==='Runtime.consoleAPICalled'&&params.type==='error') errors.push(params.args.map(x=>x.value||x.description).join(' '));
    if(method==='Network.responseReceived'&&params.response.status>=400 && !params.response.url.endsWith('/favicon.ico')) httpErrors.push(params.response.status+' '+params.response.url);
  });
  function c(method,params={}){return new Promise((resolve,reject)=>{
    const msg={id:++id,method,params};
    pending.set(id,{resolve,reject});
    ws.send(JSON.stringify(msg));
  });}
  async function ev(expression){
    const r=await c('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result.value;
  }
  async function wait(expression,attempts=150){
    for(let i=0;i<attempts;i++){if(await ev(expression)) return; await sleep(130);}
    throw Error('Timed out: '+expression+' errors: '+errors+' network: '+httpErrors);
  }
  async function capture(name){
    const shot=await c('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(captures,name+'.png'),Buffer.from(shot.data,'base64'));
  }
  async function clickAt(x,y) {
    for(const type of ['mousePressed','mouseReleased']) await c('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});
  }
  async function pos(id){return await ev('(()=>{const r=document.querySelector('+JSON.stringify(id)+').getBoundingClientRect();return [Math.round(r.x+r.width/2),Math.round(r.y+r.height/2)]})()');}
  async function key(type,code,key,virtualKeyCode){await c('Input.dispatchKeyEvent',{type,code,key,windowsVirtualKeyCode:virtualKeyCode,nativeVirtualKeyCode:virtualKeyCode});}
  async function touch(type,points){await c('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id=0])=>({x,y,id}))});}




  async function attach(){
    try {await wait('document.querySelector("#begin")?.disabled === false');} catch (error) {
      console.log(await ev('({url:location.href,ready:document.readyState,begin:document.querySelector("#begin")?.disabled,loading:document.querySelector("#load-note")?.textContent,body:document.body?.innerText.slice(-260),scripts:[...document.scripts].map(s=>s.src),assets:performance.getEntriesByType("resource").map(e=>[e.name.split("/").at(-1),Math.round(e.duration),e.responseStatus])})'));
      throw error;
    }
    await ev('import(document.querySelector("script[type=module]").src).then(m=>{window.qa=m.game;return !!qa})');
  }
  async function tap(selector){
    const [x,y]=await pos(selector); await touch('touchStart',[[x,y]]); await touch('touchEnd',[]);
  }
  async function press(code,label,num){
    await key('keyDown',code,label,num); await key('keyUp',code,label,num);
  }





  await Promise.all(['Runtime.enable','Page.enable','Network.enable'].map(n=>c(n)));
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await c('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2,screenWidth:390,screenHeight:844});
  await c('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await c('Page.navigate',{url});
  await attach();



  const act=async selector=>{
    await ev('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');
    await tap(selector);
  };
  await act('#begin');await wait('qa.state==="armory"');
  await act('.arm-card');await wait('qa.weaponViewer.open');
  await act('.weapon-viewer .primary');await wait('qa.state==="story"');
  await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}return true;})()');
  await wait('qa.state==="play" && !qa.soundtrack.media.paused && qa.soundtrack.audible');
  const before=await ev(`(()=>{
    qa.hero.invulnerable=10000;qa.relicHunt=null;qa.clearActors();qa.enter(1);
    window.musicQA={media:qa.soundtrack.media,pauses:0,seeks:0,reloads:0};
    musicQA.media.addEventListener('pause',()=>musicQA.pauses++);
    musicQA.media.addEventListener('seeking',()=>musicQA.seeks++);
    musicQA.media.addEventListener('emptied',()=>musicQA.reloads++);
    const before={time:musicQA.media.currentTime,elapsed:qa.elapsed,hp:qa.hero.hp};
    qa.blessing('過關配樂測試');return before;
  })()`);
  await sleep(900);
  const reward=await ev('({state:qa.state,paused:qa.soundtrack.media.paused,audible:qa.soundtrack.audible,time:qa.soundtrack.media.currentTime,pauses:musicQA.pauses,elapsed:qa.elapsed,hp:qa.hero.hp})');
  console.log('blessing playback',JSON.stringify({before,reward}));
  assert.equal(reward.state,'blessing');assert.equal(reward.paused,false,'Music must continue during blessing selection');
  assert.equal(reward.audible,true);assert.ok(reward.time>before.time+.4);
  assert.equal(reward.pauses,0);assert.equal(reward.elapsed,before.elapsed);assert.equal(reward.hp,before.hp);
  await ev('qa.redraws=1;qa.redrawBlessings();true');await sleep(200);
  assert.equal(await ev('qa.soundtrack.media.paused'),false);
  await act('[data-blessing]');await wait('qa.level===2 && qa.state==="play"',450);
  await sleep(300);
  assert.equal(await ev('qa.soundtrack.media===musicQA.media && !qa.soundtrack.media.paused'),true);
  assert.equal(await ev('musicQA.pauses+musicQA.seeks+musicQA.reloads'),0);
  await ev('qa.hero.invulnerable=10000;qa.clearActors();qa.enter(4);qa.blessing("頭目獎勵配樂測試");true');
  await act('[data-blessing]');await wait('qa.state==="armory"');await sleep(300);
  assert.equal(await ev('qa.soundtrack.media.paused'),false,'Boss weapon selection must preserve the song');
  await act('.arm-card');await wait('qa.weaponViewer.open');await sleep(250);
  assert.equal(await ev('qa.soundtrack.media.paused'),false,'Weapon previews must preserve reward music');
  await act('.weapon-viewer .primary');await wait('qa.level===5 && qa.state==="play"',450);
  await ev('qa.hero.invulnerable=10000;qa.clearActors();qa.twinReward={offers:new Map()};qa.showTwinReward();true');
  await sleep(180);
  assert.equal(await ev('qa.soundtrack.media.paused'),false);
  await ev('qa.showTwinInventory();true');await sleep(150);
  assert.equal(await ev('qa.soundtrack.media.paused'),false);
  await ev('qa.showTwinSwap(qa.relics[0]);true');await sleep(150);
  assert.equal(await ev('qa.soundtrack.media.paused'),false);
  assert.equal(await ev('musicQA.pauses+musicQA.seeks+musicQA.reloads'),0,'Reward flow must not pause, seek or replace audio');
  // Explicit mute and pause keep their existing behavior, including in rewards.
  await ev('qa.audio.toggle();true');await sleep(120);
  assert.equal(await ev('qa.audio.muted && qa.soundtrack.media.paused'),true);
  await ev('qa.audio.toggle();true');await wait('!qa.soundtrack.media.paused && qa.soundtrack.audible');
  await ev('qa.state="play";qa.closeModal();qa.togglePause();true');await sleep(120);
  assert.equal(await ev('qa.state==="pause" && qa.soundtrack.media.paused'),true);
  await ev('qa.togglePause();true');await wait('qa.state==="play" && !qa.soundtrack.media.paused');
  await ev('qa.showCover();true');await sleep(120);
  assert.equal(await ev('qa.soundtrack.media.paused'),true);
  assert.equal(await ev('document.querySelectorAll(".soundtrack-toggle,.soundtrack-status,iframe").length'),0);
  if(process.env.MUSIC_OFFLINE==='1'){
    await wait('!!navigator.serviceWorker.controller && document.querySelector("#offline-status").textContent==="已可離線遊玩"',780);
    await c('Page.navigate',{url:'about:blank'});await wait('location.href==="about:blank"');
    await c('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
    if(!remote){server.close();server.closeAllConnections?.();}
    await c('Page.navigate',{url});await attach();
    await act('#begin');await wait('qa.state==="armory"');
    await act('.arm-card');await wait('qa.weaponViewer.open');await act('.weapon-viewer .primary');
    await wait('qa.state==="story"');
    await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}return true;})()');
    await wait('qa.state==="play"');
    await ev('qa.hero.invulnerable=10000;qa.clearActors();qa.blessing("離線配樂測試");true');
    await wait('!navigator.onLine && qa.state==="blessing" && !qa.soundtrack.media.paused && qa.soundtrack.audible');
  }
  assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
  console.log('Continuous blessing/redraw/transition/boss weapon/twin rewards, frozen combat, mute, pause, cover and optional offline music passed.');

})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{
  ws?.close();chrome?.kill();server.close();
});
