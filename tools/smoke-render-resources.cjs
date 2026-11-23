
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



  assert.match(await ev('document.querySelector("script[type=module]").src'),/game\.mjs\?v=/);
  await wait('!!navigator.serviceWorker.controller && document.querySelector("#offline-status").textContent==="已可離線遊玩"',780);
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  const act=async selector=>{
    await ev('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');
    await tap(selector);
  };
  await act('#begin');await wait('qa.state==="armory"');
  await wait('qa.weaponViewer.selection && !qa.weaponViewer.selection.queue.length && !qa.weaponViewer.studioWarmup',450);
  assert.equal(await ev(`(async()=>{
    const {arms,retainedForge}=await import(new URL('armory.mjs?v=emberlight-1',document.baseURI));
    const choice=document.querySelector('.arm-card').dataset.arm;
    window.studioProbe=retainedForge(arms.find(weapon=>weapon.id===choice));
    return !!studioProbe&&qa.weaponViewer.studioReady.has(studioProbe);
  })()`),true,'The first card must have an uploaded model before its first tap');
  await act('.arm-card');await wait('qa.weaponViewer.open');
  assert.equal(await ev('qa.weaponViewer.item===studioProbe'),true,'The first preview must use the already prepared mesh');
  await ev(`(()=>{
    const view=qa.view,prepare=view.prepareBattlefield;
    const hold=new Promise(resolve=>{window.completeOpeningWarmup=resolve;});
    view.prepareBattlefield=function(...args){
      view.prepareBattlefield=prepare;
      return Promise.all([prepare.apply(this,args),hold]);
    };
    return true;
  })()`);
  await act('.weapon-viewer .primary');await wait('qa.state==="story"');
  await ev('(()=>{for(let i=0;i<20&&qa.state==="story";i++){const choices=document.querySelector(".vn-options");(choices&&!choices.hidden?choices.firstElementChild:document.querySelector(".vn-next")).click();}return true;})()');
  assert.equal(await ev('qa.state==="transition" && !qa.ui.modal.hidden && qa.elapsed===0 && qa.enemies.length===0'),true,
    'Skipping the prologue during GPU preparation must keep the run clock and enemies paused');
  await ev('completeOpeningWarmup();true');
  await wait('qa.state==="play" && !qa.soundtrack.media.paused');
  await ev('qa.hero.invulnerable=10000;qa.relicHunt=null;true');
  await sleep(1400);
  await capture('warm-rooms-mobile-combat');
  assert.equal(await ev('document.querySelectorAll(".soundtrack-toggle,.soundtrack-status,iframe").length'),0);
  // Pause gameplay while exercising the real reserve and real authored rigs.
  await ev('qa.state="pause";qa.ui.cover.hidden=false;qa.clearActors();true');
  const rigs=await ev(`(async()=>{
    const v=qa.view,{stages,enemySpec}=await import(new URL('expedition.mjs?v=story-repair-1',document.baseURI));
    const spec={...enemySpec(stages[9],'boss'),height:9.2};
    const a=v.createActor(spec.frame,spec.height);v.prepareBoss(a,spec,true);
    const rig=a.bestiary,key=rig.materials.body.customProgramCacheKey();
    rig.heading=2.1;rig.root.visible=false;rig.hitFlash.value=.9;
    rig.aura.mesh.material.uniforms.releaseAge.value=0;
    v.removeActor(a);
    const b=v.createActor(spec.frame,spec.height);v.prepareBoss(b,spec,true);
    const restored=rig===b.bestiary&&b.hitFlash.value===0&&rig.heading===undefined&&rig.root.visible&&rig.aura.mesh.material.uniforms.releaseAge.value===1;
    const c=v.createActor(spec.frame,spec.height);v.prepareBoss(c,spec,true);
    b.hitFlash.value=.7;
    const isolated=b.bestiary!==c.bestiary&&b.bestiary.materials.body!==c.bestiary.materials.body&&c.hitFlash.value===0;
    const unit={x:-3,z:-2,dx:0,dz:1,kind:'boss',spec,bossPhase:1,age:1,hp:spec.hp,move:.7,flash:0,attack:{time:.4,windup:1,dx:0,dz:1,pattern:'cleave'},motion:null};
    v.actor(b,unit,{frame:spec.frame,face:1,aura:.4,rim:spec.tint,bob:0,squash:1,tilt:0});
    v.actor(c,{...unit,x:3,bossPhase:0,attack:null},{frame:spec.frame,face:-1,aura:.4,rim:spec.tint,bob:0,squash:1,tilt:0});
    v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();
    const stable=key===rig.materials.body.customProgramCacheKey();
    v.removeActor(b);v.removeActor(c);
    return {restored,isolated,stable,stats:v.modelReserve.stats};
  })()`);
  assert.equal(rigs.restored,true);assert.equal(rigs.isolated,true);assert.equal(rigs.stable,true);
  console.log('rig lifecycle',JSON.stringify(rigs));
  // Choosing instantly waits for rehearsal completion; no actor leaks into combat.
  await ev(`(()=>{
    qa.ui.cover.hidden=true;qa.state='play';qa.enter(3);qa.blessing('測試下一層');
    const prep=qa.roomPreparation;
    prep.promise.then(()=>{window.fixtureProbe=prep.fixtures;});
    qa.choose(qa.altar.options[0]);
    return true;
  })()`);
  assert.equal(await ev('qa.state==="transition"&&!qa.ui.modal.hidden'),true,'An immediate blessing selection must keep the transition visible');
  await wait('qa.level===4 && qa.state==="play"',450);
  assert.equal(await ev('qa.roomPreparation===null && qa.view.fixtures===fixtureProbe && !qa.presentingRoom'),true);
  await wait('qa.enemies.some(enemy=>enemy.kind==="boss")',450);
  assert.ok(await ev('qa.view.modelReserve.stats.hits>'+rigs.stats.hits));
  await capture('warm-rooms-mobile-boss');
  await ev('qa.hero.invulnerable=10000;qa.enemies.filter(e=>e.kind==="boss").forEach(e=>{e.hp=e.spec.hp*.4});true');
  await sleep(900);await capture('warm-rooms-mobile-phase');
  // Later rooms prime their own models, including visitors and weapon hunters.
  await ev('qa.state="pause";qa.clearActors();qa.enter(33);qa.state="pause";qa.blessing("預備後段頭目");true');
  await wait('qa.roomPreparation.level===34 && !qa.roomPreparation.pending',450);
  const late=await ev(`(()=>{
    const before=qa.view.modelReserve.stats.hits;
    qa.choose(qa.altar.options[0]);
    return {before};
  })()`);
  await wait('qa.level===34 && qa.state==="play"',450);
  await ev('qa.clearActors();qa.wave=qa.stage.waves.length-1;qa.startDelay=0;qa.hero.invulnerable=10000;true');
  await wait('qa.enemies.some(enemy=>enemy.kind==="boss")',450);
  assert.ok(await ev('qa.view.modelReserve.stats.hits>'+late.before));
  await ev(`(()=>{
    qa.clearActors();qa.enter(93);qa.relicHunt=null;qa.arenaSeed=118232;qa.routeSeed=99734;qa.blessing('雙頭目預載');
    return true;
  })()`);
  await wait('qa.roomPreparation?.level===94 && !qa.roomPreparation.pending',450);
  assert.equal(await ev('!!qa.roomPreparation.encounter?.lamps&&!!qa.roomPreparation.fixtures'),true);
  await ev(`(()=>{
    const prep=qa.roomPreparation;
    window.twinProbe={fixtures:prep.fixtures,lamps:prep.encounter.lamps.lamps,layout:prep.encounter.layout};
    qa.choose(qa.altar.options[0]);
    return true;
  })()`);
  await wait('qa.level===94 && qa.state==="play"',450);
  await ev('qa.clearActors();twinProbe.misses=qa.view.modelReserve.stats.misses;qa.wave=qa.stage.waves.length-1;qa.startDelay=0;qa.hero.invulnerable=10000;true');
  await wait('qa.enemies.filter(enemy=>enemy.kind==="boss").length===2',450);
  assert.equal(await ev('qa.view.modelReserve.stats.misses===twinProbe.misses'),true,'Both heads and the rest of their wave should reuse prepared rigs');
  assert.equal(await ev('qa.bossArena.encounter===twinProbe.layout && qa.view.fixtures===twinProbe.fixtures && qa.view.arenaArt.lamps===twinProbe.lamps'),true,
    'The twin encounter must use the prepared ritual layout, lamps and fixtures');
  await sleep(1200);await capture('warm-rooms-mobile-twin-bosses');
  await ev('qa.state="pause";qa.ui.cover.hidden=false;qa.clearActors();true');
  const memory=await ev(`(async()=>{
    const v=qa.view,{stages,enemySpec}=await import(new URL('expedition.mjs?v=story-repair-1',document.baseURI));
    const samples=[];
    for(let cycle=0;cycle<4;cycle++){
      for(let level=0;level<100;level+=5){
        v.setStage(stages[level]);
        if(level%10===0){const spec=enemySpec(stages[level+9],'boss'),a=v.createActor(spec.frame,spec.height);v.prepareBoss(a,spec,true);v.renderer.render(v.scene,v.camera);v.removeActor(a);}
      }
      v.setStage(stages[1]);v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();
      samples.push({cycle,geometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures,programs:v.renderer.info.programs.length,reserve:v.modelReserve.stats});
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    const before=v.renderer.info.memory.geometries;
    v.modelReserve.clear();v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();
    return {samples,before,after:v.renderer.info.memory.geometries,kits:v.landscape.materialKits.size,lightMaterials:v.landscape.roomLighting.materials.size};
  })()`);
  for(const sample of memory.samples){assert.ok(sample.reserve.bytes<=sample.reserve.limit);assert.ok(sample.reserve.count<=12);}
  assert.ok(memory.samples.at(-1).geometries<=memory.samples[1].geometries+10,'GPU geometry must stabilize after repeated room/boss cycles');
  assert.ok(memory.after<memory.before,'clearing detached rigs releases GPU geometry');
  assert.equal(memory.kits,13);assert.equal(memory.lightMaterials,6);
  console.log('room/rig memory stress',JSON.stringify(memory));
  // Phone skill input, attacks and full-quality boss effects must keep working.
  await ev('qa.ui.cover.hidden=true;qa.state="play";qa.enter(9);qa.hero.invulnerable=10000;true');
  await wait('qa.enemies.some(enemy=>enemy.kind==="boss")',450);
  await act('#spell');await sleep(150);
  assert.ok(await ev('qa.hero.spellCool>0'));
  const point=await pos('#spell');
  await ev('qa.hero.spellCool=0;true');
  await touch('touchStart',[[...point]]);await sleep(220);
  await touch('touchMove',[[point[0]-40,point[1]-65]]);await sleep(100);
  await capture('warm-rooms-mobile-skill-aim');
  await touch('touchEnd',[]);await sleep(100);
  assert.ok(await ev('qa.hero.spellCool>0'));
  // Desktop layout uses its original quality and independently bounded reserve.
  const hunts=await ev(`(async()=>{
    const {arms}=await import(new URL('armory.mjs?v=emberlight-1',document.baseURI));
    const {RelicHunt}=await import(new URL('relic-hunt.mjs?v=story-repair-1',document.baseURI));
    const specs=arms.filter(weapon=>weapon.spell).map(weapon=>new RelicHunt(qa,weapon).specFor());
    const valid=specs.every(spec=>Number.isFinite(spec.hp)&&spec.hp>0&&spec.height>0&&spec.model&&spec.relicWeapon&&spec.attacks.length);
    qa.clearActors();qa.bossArena=null;qa.view.setBossArena(null);
    qa.equip(arms.find(weapon=>weapon.id==='western-rifle'));
    qa.relicHunt.spawn();
    return {valid,count:specs.length,arrived:qa.relicHunt.state==='arriving',rig:!!qa.relicHunt.unit.visual.bestiary};
  })()`);
  assert.equal(hunts.valid,true);assert.ok(hunts.count>=59);
  assert.equal(hunts.arrived,true);assert.equal(hunts.rig,true);
  console.log('Weapon-hunter specifications and actual entrance',JSON.stringify(hunts));
  await c('Emulation.setDeviceMetricsOverride',{width:1366,height:768,mobile:false,deviceScaleFactor:1});
  await c('Emulation.setTouchEmulationEnabled',{enabled:false});
  await c('Page.reload',{ignoreCache:true});await attach();
  assert.equal(await ev('qa.view.mobile'),false);
  assert.equal(await ev('qa.view.modelReserve.limit'),32*1024*1024);
  await capture('warm-rooms-desktop-menu');
  await c('Page.navigate',{url:'about:blank'});await wait('location.href==="about:blank"');
  await c('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  if(!remote){server.close();server.closeAllConnections?.();}
  await c('Page.navigate',{url});await attach();
  await wait('!navigator.onLine && document.querySelector("#offline-status").textContent==="已可離線遊玩"',780);
  assert.equal(await ev('document.querySelectorAll(".soundtrack-toggle,.soundtrack-status,iframe").length'),0);
  assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
  console.log('Phone combat/phase/tap/drag, prewarming reward race, bounded GPU memory, desktop and offline cold start passed.');

})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{
  ws?.close();chrome?.kill();server.close();
});
