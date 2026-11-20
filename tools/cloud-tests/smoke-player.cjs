
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
let fixture,server;
const fixtureReady=import(require("node:url").pathToFileURL(path.join(__dirname,"fixture.mjs")).href).then(m=>m.createFixture(cwd));
let chrome,ws;
(async()=>{
  fixture=await fixtureReady;server=fixture.server;
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
  const failedReturn=new URL(url);failedReturn.searchParams.set('error','server_error');failedReturn.searchParams.set('error_code','unexpected_failure');failedReturn.searchParams.set('error_description','fixture-private-detail');
  await c('Page.navigate',{url:failedReturn.href});
  await attach();
  assert.match(await ev('document.querySelector("#player-summary").textContent'),/未能完成/,'Failed OAuth return must be visible to the player');
  assert.equal(await ev('location.search'),'','Failed OAuth details must not remain in the URL');



  await wait('!!navigator.serviceWorker.controller && document.querySelector("#offline-status").textContent==="已可離線遊玩"',780);
  await ev('qa.players.ready');assert.equal(await ev('qa.players.configured'),true);
  const act=async selector=>{await ev('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');await tap(selector);};
  await capture('rankings-mobile-menu');
  await act('#begin');await wait('qa.state==="armory"');await act('.arm-card');await wait('qa.weaponViewer.open');await act('.weapon-viewer .primary');await wait('qa.state==="story"');
  await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}qa.hero.invulnerable=10000;qa.relicHunt=null;return true;})()');
  await sleep(1300);
  console.log('LOCAL FIXTURE game clock',JSON.stringify(await ev('({state:qa.state,elapsed:qa.elapsed,clock:qa.runClock,hidden:document.hidden,cover:qa.ui.cover.hidden,viewer:qa.weaponViewer.open,discovery:!!qa.discovery,frame:qa.previousTime,now:performance.now()})')));
  await wait('qa.state==="play" && qa.elapsed>.5',220);
  // Exercise the real exit hook, not just the record-storage helper.
  await ev('qa.completeRoom();qa.escape.opening=0;qa.hero.x=qa.escape.x;qa.hero.z=qa.escape.z;qa.useExit();true');
  await wait('qa.state==="blessing"');await ev('qa.players.writes');
  let history=await ev('qa.players.history()');assert.equal(history.length,1);assert.equal(history[0].highest_floor,1);assert.equal(history[0].sync_state,'guest');
  const first=history[0].id;
  await ev('qa.showCover();qa.players.writes');
  await act('#records');await wait('document.querySelectorAll(".history-card").length===1');await capture('rankings-mobile-history');
  await ev('qa.showCover();true');
  async function login(email){
    await act('#player-account');
    const sentBefore=fixture.state.otp.length;
    await ev('document.querySelector("#player-email").value='+JSON.stringify(email)+';for(let i=0;i<3;i++)document.querySelector(".player-login").requestSubmit();true');
    await wait('document.querySelector(".player-message")?.textContent.includes("已寄出")');
    assert.equal(fixture.state.otp.length,sentBefore+1,'Repeated submission must send only one code');
    assert.equal(await ev('document.querySelector(".player-login button").disabled'),true,'Resend cooldown protects against accidental duplicate mail');
    await ev('qa.players.emailRetryAt=Date.now()-1;true');
    await act('#modal-actions button');await act('#player-account');
    assert.equal(await ev('document.querySelector("#player-email").value'),email,'Returning from the inbox retains the pending address');
    assert.equal(await ev('document.querySelector(".player-verification").hidden'),false,'Returning after cooldown must still allow entering the existing code');
    assert.equal(fixture.state.otp.length,sentBefore+1,'Reopening the code step must not send another email');
    await ev('document.querySelector("#player-otp").value="123";[...document.querySelectorAll(".player-panel button")].find(b=>b.textContent==="驗證並登入").click();true');
    await wait('document.querySelector(".player-message")?.textContent.includes("完整")');
    assert.equal(await ev('qa.players.user'),null,'Incomplete codes must not sign in');
    await ev('document.querySelector("#player-otp").value="123456";[...document.querySelectorAll(".player-panel button")].find(b=>b.textContent==="驗證並登入").click();true');
    await wait('qa.state==="cover" && !!qa.players.user',450);
  }
  await login('cat-a@example.test');await wait('qa.players.pending===0 && !qa.players.syncing',450);
  assert.equal(await ev('qa.players.user.id'),'11111111-1111-4111-8111-111111111111');
  await act('#player-account');
  await ev('document.querySelector("#player-nickname").value="守燈者 A";[...document.querySelectorAll(".player-panel button")].find(b=>b.textContent==="儲存暱稱").click();true');
  await wait('qa.players.name==="守燈者 A"');await capture('rankings-mobile-account');await ev('qa.showCover();true');
  await act('#leaderboard');await wait('document.querySelectorAll(".ranking-table tbody tr").length===1');
  assert.match(await ev('document.querySelector(".ranking-table").textContent'),/守燈者 A/);await capture('rankings-mobile-board');await ev('qa.showCover();true');
  await ev('qa.players.store.mutate('+JSON.stringify(first)+',r=>({...r,sync_state:"pending"})).then(()=>qa.players.sync())');
  await wait('!qa.players.syncing');
  const count=()=>fixture.queue(async()=>{await fixture.db.exec('reset role');return (await fixture.db.query('select count(*)::int as n from public.meow_runs')).rows[0].n;});
  assert.equal(await count(),1,'retry must not duplicate a run');
  await c('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  async function record(floor,seconds){
    return ev('(async()=>{qa.start(qa.weapon);qa.state="pause";qa.closeModal();qa.runClock.pause();qa.elapsed='+seconds+';const id=qa.challengeRunId;qa.recordChallenge("active",'+floor+');qa.recordChallenge("failed");await qa.players.writes;qa.showCover();return id;})()');
  }
  await record(35,220);await record(35,180);await ev('qa.players.writes');
  assert.equal(await ev('qa.players.pending'),2);assert.equal(await count(),1);
  await c('Page.reload',{ignoreCache:false});await attach();await ev('qa.players.ready');
  assert.equal(await ev('navigator.onLine'),false);assert.equal(await ev('qa.players.pending'),2);
  history=await ev('qa.players.history()');assert.equal(history.length,3);assert.equal(history.filter(r=>r.sync_state==="pending").length,2);
  await act('#leaderboard');await wait('document.querySelector(".ranking-table")!==null');
  assert.match(await ev('document.querySelector(".ranking-panel .player-status").textContent'),/離線快照/);
  await ev('qa.showCover();true');
  await c('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await wait('qa.players.pending===0 && !qa.players.syncing',450);assert.equal(await count(),3);
  let board=await ev('qa.players.leaderboard("vigil")');
  assert.equal(board.rows.length,1);assert.equal(board.rows[0].highest_floor,35);assert.equal(board.rows[0].cleared_ms,180000);
  // Test and practice starts must not create a local row or a network submission.
  await ev('(async()=>{const {arms}=await import(new URL("armory.mjs?v=emberlight-1",document.baseURI));qa.testMode=true;qa.start(arms[0]);qa.showCover();qa.testMode=false;qa.openPracticeLoadout();qa.startPractice();qa.showCover();await qa.players.writes;return true;})()');
  assert.equal((await ev('qa.players.history()')).length,3);assert.equal(await count(),3);
  // Start another player: detailed history is isolated, public ranking has one row each.
  await act('#player-account');await ev('[...document.querySelectorAll(".player-panel button")].find(b=>b.textContent==="登出此裝置").click();true');await wait('qa.state==="cover" && !qa.players.user');
  await login('cat-b@example.test');await record(20,100);await wait('qa.players.pending===0 && !qa.players.syncing',450);
  history=await ev('qa.players.history(true)');assert.equal(history.length,1);assert.equal(history[0].highest_floor,20);
  board=await ev('qa.players.leaderboard("vigil")');assert.equal(board.rows.length,2);assert.equal(board.personal.rank,2);
  assert.equal(await count(),4);
  await fixture.queue(async()=>{
    await fixture.db.exec('reset role');
    await fixture.db.query(`insert into public.meow_runs(id,player_id,difficulty,ruleset,highest_floor,cleared_ms,elapsed_ms,kills,weapon_id,result_status,revision,started_at)
      select gen_random_uuid(),$1,'vigil','forest-1',10,10000,12000,20,'qilin','failed',1,'2026-11-17'::timestamptz-n*interval '1 minute' from generate_series(1,105) n`,['22222222-2222-4222-8222-222222222222']);
  });
  history=await ev('qa.players.history(true)');assert.equal(history.length,100);assert.equal(await ev('qa.players.historyMore'),true);
  await ev('qa.players.moreHistory()');history=await ev('qa.players.history(false)');
  assert.equal(history.length,106,'earlier cloud history remains accessible beyond the first page');
  assert.equal(await ev('qa.players.historyMore'),false);
  assert.deepEqual(errors,[]);assert.deepEqual(httpErrors.filter(x=>!x.startsWith('503 ')),[]);
  console.log('LOCAL FIXTURE: actual Supabase SDK email OTP/session, guest claim, real exit recording, idempotent RPC, offline cold restart, automatic reconnection sync, one best per account, history isolation, test/practice exclusions and mobile UI passed.');

})().catch(err=>{console.error(err);process.exitCode=1;}).finally(async()=>{ws?.close();chrome?.kill();server?.close();await fixture?.db.close();});
