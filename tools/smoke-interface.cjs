
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
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await ev('qa.view.feedback.override=false;qa.syncEffects();true');
  assert.equal(await ev('qa.interfaceMotion.reduced'),false);
  await capture('interface-mobile-menu');
  // A real touch presses without stealing the game's event or changing its transform.
  const training=await pos('#training');
  await touch('touchStart',[training]);
  assert.equal(await ev('qa.interfaceMotion.presses.size'),1);
  assert.ok(await ev('document.querySelectorAll(".interface-ripple").length>0'));
  await touch('touchEnd',[]);
  await wait('document.querySelector("#modal").dataset.kind==="training"');
  await sleep(440);
  await capture('interface-mobile-training');
  await act('#modal-actions button');
  await wait('qa.ui.modal.hidden');
  // Title activation retains the original triple-tap gold-poster behavior.
  for(let i=0;i<3;i++)await act('#cover-title');
  assert.equal(await ev('qa.testMode'),true);
  for(let i=0;i<3;i++)await act('#cover-title');
  assert.equal(await ev('qa.testMode'),false);
  await act('#begin');await wait('qa.state==="armory"');
  await sleep(400);await capture('interface-mobile-artifacts');
  await act('.arm-card');await wait('qa.weaponViewer.open');
  const zoom=await pos('.model-zoom button:last-child');
  await touch('touchStart',[zoom]);
  assert.ok(await ev('qa.weaponViewer.dialog.querySelectorAll(".interface-ripple").length>0'),'Ripple must appear inside native modal top layer');
  await touch('touchEnd',[]);
  await act('.weapon-viewer .primary');await wait('qa.state==="story"');
  await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}return true;})()');
  await wait('qa.state==="play"');
  await ev('qa.hero.invulnerable=10000;qa.relicHunt=null;qa.clearActors();qa.blessing("操作回饋測試");true');
  await sleep(500);await capture('interface-mobile-blessings');
  assert.equal(await ev('(()=>{const card=document.querySelector(".relic"),icon=card.querySelector("img").getBoundingClientRect(),title=card.querySelector("b").getBoundingClientRect();return icon.right<=title.left})()'),true,'Mobile icons must not overlap blessing names');
  const before=await ev('({count:qa.relics.length,id:qa.altar.options[0].id})');
  await ev('window.nextRoomForUI=qa.prepareNextRoom();nextRoomForUI.promise??null');
  await act('.relic');
  assert.equal(await ev('qa.relics.length'),before.count+1,'One tap must acquire exactly one blessing');
  assert.equal(await ev('qa.relics.at(-1).id'),before.id);
  assert.equal(await ev('qa.interfaceMotion.toast.hidden'),false);
  assert.match(await ev('qa.interfaceMotion.toast.textContent'),/祝福已融入提燈/);
  const notification=await ev('({toast:qa.interfaceMotion.toast.getBoundingClientRect().toJSON(),announcement:qa.ui.announce.getBoundingClientRect().toJSON(),route:document.querySelector(".route-hud").getBoundingClientRect().toJSON()})');
  assert.ok(notification.toast.bottom<notification.announcement.top||notification.toast.top>notification.announcement.bottom,'Reward confirmation must not cover the floor announcement: '+JSON.stringify(notification));
  assert.ok(await ev('qa.interfaceMotion.effects.size>0'));
  await capture('interface-mobile-reward');
  await wait('qa.state==="play"',450);
  await sleep(1900);
  assert.equal(await ev('qa.interfaceMotion.effects.size'),0);
  assert.equal(await ev('qa.interfaceMotion.animations.size'),0);
  assert.equal(await ev('qa.interfaceMotion.toast.hidden'),true);
  // Repeated taps are bounded; cancellation returns a held button to its natural size.
  const stress=await ev(`(()=>{
    const fx=qa.interfaceMotion,b=document.getElementById('pause'),r=b.getBoundingClientRect();
    for(let i=0;i<90;i++){const e={target:b,button:0,pointerId:i,clientX:r.x+10,clientY:r.y+10};fx.down(e);fx.up(e);}
    const bounded=fx.effects.size<=28&&fx.animations.size<=64;
    fx.down({target:b,button:0,pointerId:99,clientX:r.x+10,clientY:r.y+10});
    window.dispatchEvent(new Event('blur'));
    return {bounded,effects:fx.effects.size,presses:fx.presses.size,scale:getComputedStyle(b).scale};
  })()`);
  assert.deepEqual(stress,{bounded:true,effects:0,presses:0,scale:'none'});
  // Disabled controls and canvas gestures must not create button feedback.
  assert.equal(await ev(`(()=>{const f=qa.interfaceMotion;const b=document.createElement('button');b.disabled=true;document.body.append(b);f.down({target:b,button:0,pointerId:1,clientX:0,clientY:0});b.remove();f.down({target:qa.view.canvas,button:0,pointerId:2,clientX:0,clientY:0});return f.effects.size+f.presses.size})()`),0);
  // OS preference always wins, even if gameplay effects were manually set to full.
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await wait('qa.interfaceMotion.reduced');
  await ev('qa.clearActors();qa.blessing("減少動態測試");true');
  await act('.relic');
  assert.equal(await ev('qa.interfaceMotion.effects.size'),0);
  assert.equal(await ev('qa.interfaceMotion.animations.size'),0);
  assert.equal(await ev('!qa.interfaceMotion.toast.hidden||(!qa.ui["school-toast"].hidden&&qa.ui["school-toast"].textContent.length>0)'),true,'Reduced mode retains static confirmation, giving a newly unlocked combo priority');
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await ev('qa.view.feedback.setSubdued(true);qa.syncEffects();true');
  assert.equal(await ev('qa.interfaceMotion.reduced'),true);
  await wait('qa.state==="play"',450);
  await ev('qa.togglePause();true');
  assert.equal(await ev('document.querySelector(".reduced-effects input").checked'),true);
  await act('.reduced-effects input');
  assert.equal(await ev('qa.view.feedback.subdued'),false,'Switch must change the real effects preference');
  assert.equal(await ev('getComputedStyle(document.querySelector(".reduced-effects input")).width'),'42px');
  await act('.reduced-effects input');
  assert.equal(await ev('qa.interfaceMotion.reduced'),true);
  await ev('qa.view.feedback.setSubdued(false);qa.syncEffects();qa.showCover();true');
  await c('Emulation.setDeviceMetricsOverride',{width:1440,height:900,mobile:false,deviceScaleFactor:1});
  await c('Emulation.setTouchEmulationEnabled',{enabled:false});
  await sleep(300);await capture('interface-desktop-menu');
  const [bx,by]=await pos('#begin');await clickAt(bx,by);
  await wait('qa.state==="armory"');await sleep(360);await capture('interface-desktop-artifacts');
  await wait('!!navigator.serviceWorker.controller && document.querySelector("#offline-status").textContent==="已可離線遊玩"',780);
  assert.equal(await ev('document.querySelector(".offline-pack").dataset.state'),'ready');
  assert.equal(await ev('document.querySelector("#offline-progress").hidden'),true);
  assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
  console.log('UI touch/spring/ripple/native-preview, single acquisition/reward cleanup, bounded effects, cancellation, reduced motion, desktop and offline readiness passed.');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{
  ws?.close();chrome?.kill();server.close();
});
