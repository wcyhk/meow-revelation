
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
  const pending=new Map(),errors=[],httpErrors=[],httpLatest=new Map();
  ws.addEventListener('message',event=>{
    const {id,method,params,result,error}=JSON.parse(event.data);
    if(id){const cb=pending.get(id);pending.delete(id);if(cb)error?cb.reject(error):cb.resolve(result);}
    if(method==='Runtime.exceptionThrown') errors.push(params.exceptionDetails.exception?.description||params.exceptionDetails.text);
    if(method==='Runtime.consoleAPICalled'&&params.type==='error') errors.push(params.args.map(x=>x.value||x.description).join(' '));
    if(method==='Network.responseReceived'){
      const {status,url}=params.response;httpLatest.set(url,status);
      if(status>=400&&!url.endsWith('/favicon.ico'))httpErrors.push(status+' '+url);
    }
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
  await c('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:1});
  await c('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await c('Page.navigate',{url});await attach();await wait('document.fonts.status==="loaded"');
  const act=async selector=>{await ev('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');await tap(selector);};
  for(const [width,height] of [[390,844],[320,568],[844,390],[1440,900]]){
    const mobile=width<700||height<500;
    await c('Emulation.setDeviceMetricsOverride',{width,height,mobile,deviceScaleFactor:1});
    await c('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:1});
    await sleep(160);
    const layout=await ev('({width:innerWidth,height:innerHeight,scroll:document.getElementById("cover").scrollHeight,cover:document.getElementById("cover").clientHeight,controls:[...document.querySelectorAll(".title-actions button,#player-account")].map(b=>({id:b.id,x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))})');
    for(const control of layout.controls){
      assert.ok(control.w>=44&&control.h>=43.5,'Touch target too small: '+JSON.stringify({width,height,control}));
      assert.ok(control.x>=0&&control.y>=0&&control.x+control.w<=width+1&&control.y+control.h<=height+1,'Main control outside viewport: '+JSON.stringify({width,height,control}));
    }
    assert.ok(layout.scroll<=layout.cover+2,'Lobby should fit without scrolling: '+JSON.stringify(layout));
    const pair=(a,b)=>Math.abs(layout.controls.find(c=>c.id===a).y-layout.controls.find(c=>c.id===b).y)<2;
    assert.ok(pair('bestiary','training')&&pair('records','leaderboard'),'Related navigation should stay in paired rows');
    await capture('quiet-menu-'+width+'x'+height);
    await act('#player-account');await wait('qa.state==="account"');
    assert.equal(await ev('document.querySelector(".player-verification").hidden'),true,'Code step is hidden until a code is sent');
    assert.equal(await ev('document.querySelector(".player-google").disabled'),false);
    assert.equal(await ev('document.querySelector(".player-google").getBoundingClientRect().top<document.querySelector("#player-email").getBoundingClientRect().top'),true);
    assert.ok(await ev('document.querySelector(".player-panel").scrollWidth<=document.querySelector(".player-panel").clientWidth+1'),'Account fields must not overflow');
    await capture('quiet-account-'+width+'x'+height);
    await act('#modal-actions button');await wait('qa.state==="cover"');
  }
  await c('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:1});
  await c('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await act('#training');await wait('qa.state==="training"');await capture('quiet-training-mobile');await act('#modal-actions button');
  await act('#records');await wait('qa.state==="records"');
  assert.ok(await ev('document.querySelector(".challenge-history").getBoundingClientRect().width>=document.querySelector(".records-ledger").getBoundingClientRect().width*.9'),'History should span the record panel, not a single difficulty column');
  await capture('quiet-records-mobile');
  await act('.record-rewards summary');assert.equal(await ev('document.querySelector(".record-rewards").open'),true);
  await act('#modal-actions button');await act('#leaderboard');
  await wait('document.querySelector(".ranking-panel>.player-status").textContent.startsWith("已更新")',450);
  await capture('quiet-ranking-mobile');await act('#modal-actions button:last-child');
  await act('#begin');await wait('qa.state==="armory"');await capture('quiet-weapons-mobile');
  await act('.arm-card');await wait('qa.weaponViewer.open');
  assert.equal(await ev('document.querySelector(".weapon-notes").open'),false);
  await act('.weapon-notes summary');
  assert.equal(await ev('document.querySelector(".weapon-notes").open'),true);
  assert.ok(await ev('document.querySelector(".weapon-notes").textContent.includes(qa.weaponViewer.weapon.detail)'),'Full weapon detail must remain accessible');
  await capture('quiet-weapon-details-mobile');
  await act('.weapon-viewer .primary');await wait('qa.state==="story"');
  await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}qa.hero.invulnerable=10000;qa.relicHunt=null;return true;})()');
  await wait('qa.state==="play"');
  const hud=await ev('({hp:document.querySelector(".health-hud").getBoundingClientRect().toJSON(),tools:document.querySelector(".utility").getBoundingClientRect().toJSON(),route:document.querySelector(".route-hud").getBoundingClientRect().toJSON()})');
  const separate=(a,b)=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top;
  assert.ok(separate(hud.hp,hud.tools)&&separate(hud.route,hud.tools)&&separate(hud.hp,hud.route),'Combat panels overlap: '+JSON.stringify(hud));
  await capture('quiet-combat-mobile');await ev('qa.showCover();true');
  assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
  console.log('Quiet UI: four viewport sizes, reachable touch targets, grouped navigation, progressive login, training, records, rankings, full weapon detail and non-overlapping mobile combat HUD passed.');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{ws?.close();chrome?.kill();server.close();});
