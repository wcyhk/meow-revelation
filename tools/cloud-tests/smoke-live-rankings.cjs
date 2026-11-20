
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
  await c('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2,screenWidth:390,screenHeight:844});
  await c('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await c('Page.navigate',{url});
  await attach();



  const act=async selector=>{
    await ev('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');await tap(selector);
  };
  await ev('qa.players.ready');
  assert.equal(await ev('qa.players.configured'),true);
  assert.equal(await ev('qa.players.user'),null);
  await capture('live-rankings-mobile-menu');
  await act('#player-account');
  const providers=await ev('({email:qa.players.config.email!==false,google:!!qa.players.config.google})');
  if(!providers.email||!providers.google)assert.match(await ev('document.querySelector(".player-panel").textContent'),/尚未開放/);
  else assert.doesNotMatch(await ev('document.querySelector(".player-panel").textContent'),/尚未開放/);
  assert.equal(await ev('document.querySelectorAll("#player-email,#player-otp").length'),providers.email?2:0);
  assert.equal(await ev('[...document.querySelectorAll(".player-panel button")].find(b=>b.textContent.includes("驗證碼")||b.textContent.includes("電郵登入")).disabled'),!providers.email);
  assert.equal(await ev('[...document.querySelectorAll(".player-panel button")].find(b=>b.textContent.includes("Google")).disabled'),!providers.google);
  await capture('live-rankings-mobile-login');
  await act('#modal-actions button');
  await act('#leaderboard');
  for(const mode of ['vigil','blood','abyss']){
    await act('.ranking-tabs [data-mode='+mode+']');
    await wait('document.querySelector(".ranking-panel>.player-status").textContent.startsWith("已更新")',450);
    const board=await ev('qa.players.leaderboard('+JSON.stringify(mode)+')');
    assert.equal(board.unavailable,undefined);assert.equal(board.cached,false);assert.equal(board.personal,null);
  }
  await capture('live-rankings-mobile-board');
  await act('#modal-actions button:last-child');
  await act('#begin');await act('.arm-card');await wait('qa.weaponViewer.open');
  await act('.weapon-viewer .primary');await wait('qa.state==="story"');
  await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}return true;})()');
  await wait('qa.state==="play" && !!qa.challengeRunId');
  const run=await ev('qa.challengeRunId');
  await sleep(400);
  await ev('qa.showCover();qa.players.writes');
  let history=await ev('qa.players.history()');
  assert.equal(history.length,1);assert.equal(history[0].id,run);assert.equal(history[0].sync_state,'guest');
  assert.equal(history[0].result_status,'abandoned');
  await act('#records');await wait('!!document.querySelector(".history-card")');
  await capture('live-rankings-mobile-history');
  await act('#modal-actions button');
  await wait('!!navigator.serviceWorker.controller && document.querySelector("#offline-status").textContent==="已可離線遊玩"',780);
  await c('Page.navigate',{url:'about:blank'});await wait('location.href==="about:blank"');
  await c('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await c('Page.navigate',{url});await attach();await ev('qa.players.ready');
  history=await ev('qa.players.history()');assert.equal(history.length,1);assert.equal(history[0].id,run);
  await act('#leaderboard');await wait('document.querySelector(".ranking-panel>.player-status").textContent.includes("離線快照")');
  await capture('live-rankings-mobile-offline');
  await act('#modal-actions button:last-child');
  await c('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await act('#leaderboard');await wait('document.querySelector(".ranking-panel>.player-status").textContent.startsWith("已更新")',450);
  await act('#modal-actions button:last-child');
  await c('Emulation.setDeviceMetricsOverride',{width:1440,height:900,mobile:false,deviceScaleFactor:1});
  await c('Emulation.setTouchEmulationEnabled',{enabled:false});
  await sleep(200);await capture('live-rankings-desktop-menu');
  // The offline pack retries temporary failures. Accept a recovered response
  // only when this browser observed a later success for that exact URL; cold
  // offline launch and complete-pack checks above must still pass.
  const unresolved=httpErrors.filter(message=>{
    const status=httpLatest.get(message.slice(message.indexOf(' ')+1));
    return status===undefined||status>=400;
  });
  assert.deepEqual(errors,[]);assert.deepEqual(unresolved,[]);
  if(httpErrors.length)console.log('Recovered HTTP responses after later success:',httpErrors.length);
  console.log('LIVE BACKEND: mobile guest menu, configured provider availability, all three public leaderboards, actual challenge history, offline cold restart/snapshot and reconnect passed. No cloud accounts or scores created.');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{ws?.close();chrome?.kill();server.close();});
