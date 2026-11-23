
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
  await c('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:2});
  await c('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await c('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await c('Page.navigate',{url});await attach();
  const content=await ev(`(async()=>{
    const {arms,forge,disposeForge}=await import(new URL('armory.mjs?v=emberlight-1',document.baseURI));
    const {originalRelics}=await import(new URL('lantern-designs.mjs',document.baseURI));
    const {monsterCatalogue,monsterBattle}=await import(new URL('monster-bestiary.mjs?v=boss-foundry-1',document.baseURI));
    const {mountBestiary,poseBestiary,removeBestiary}=await import(new URL('bestiary-models.mjs?v=boss-foundry-1',document.baseURI));
    const T=await import(new URL('../three.min.mjs',document.baseURI));
    window.originalQA={arms,monsterCatalogue,monsterBattle,mountBestiary,poseBestiary,removeBestiary,T};
    const models=[];
    for(const weapon of arms){
      const root=forge(weapon),box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3());
      const finite=[size.x,size.y,size.z].every(Number.isFinite)&&Math.min(size.x,size.y,size.z)>0;
      models.push({id:weapon.id,named:root.name===weapon.name,finite});disposeForge(root);
    }
    return {count:arms.length,designCount:originalRelics.size,uniqueNames:new Set(arms.map(w=>w.name)).size,
      uniqueIcons:new Set(qa.view.armIcons.values()).size,models,catalogue:monsterCatalogue.length,
      independent:monsterCatalogue.every(e=>e.original&&e.source.startsWith('lantern-'))};
  })()`);
  assert.equal(content.count,73);assert.equal(content.designCount,73);assert.equal(content.uniqueNames,73);
  assert.equal(content.catalogue,166);assert.equal(content.independent,true);
  assert.ok(content.models.every(m=>m.finite&&m.named));
  const icons=await ev('({keys:[...qa.view.armIcons.keys()].length,unique:new Set(qa.view.armIcons.values()).size})');
  assert.equal(icons.keys,73);assert.equal(icons.unique,73,'Each weapon needs its own rendered icon');
  const rendered=await ev('[...qa.view.previewArms()]');
  assert.equal(rendered.length,73);assert.equal(new Set(rendered.map(([,data])=>data)).size,73);
  if(!process.env.MEOW_ICON_OUTPUT)for(const [id,data] of rendered){
    assert.deepEqual(fs.readFileSync(path.join(cwd,'eclipse/art/weapons',id+'.webp')),Buffer.from(data.split(',')[1],'base64'),'Published icon must be rendered from its current handheld model: '+id);
  }
  if(process.env.MEOW_ICON_OUTPUT){
    for(const [id,data] of rendered)fs.writeFileSync(path.join(process.env.MEOW_ICON_OUTPUT,id+'.webp'),Buffer.from(data.split(',')[1],'base64'));
    assert.deepEqual(errors,[]);console.log('Exported 73 distinct icon renders from the exact handheld model factory.');return;
  }
  console.log('73 original relic records, finite geometry, distinct names and rendered icons verified.');
  const retained=await ev(`(async()=>{
    const {arms,borrowForge,recycleForge,shapeBow}=await import(new URL('armory.mjs?v=emberlight-1',document.baseURI));
    const bow=arms.find(arm=>arm.id==='stormbow');
    const first=borrowForge(bow),second=borrowForge(bow);
    shapeBow(first,.94,true);
    const isolated=first!==second&&second.userData.bow.draw===0&&!second.userData.bow.arrow.visible;
    first.position.set(2,1,0);
    first.visible=false;
    const core=first.userData.finishes.core;
    core.emissiveIntensity+=2;
    recycleForge(first);
    const cached=borrowForge(bow);
    const reset=cached===first&&cached.position.lengthSq()===0&&cached.visible&&cached.userData.bow.draw===0
      &&!cached.userData.bow.arrow.visible&&core.emissiveIntensity===core.userData.restGlow;
    recycleForge(cached);recycleForge(second);
    return {isolated,reset};
  })()`);
  assert.deepEqual(retained,{isolated:true,reset:true},'A retained bow must reset its pose and stay independent of active copies');
  // Render every encounter in isolation with three angles and a charged attack.
  const roster=await ev(`(async()=>{
    const {monsterCatalogue,monsterBattle,mountBestiary,poseBestiary,removeBestiary,T}=originalQA;
    const v=qa.view,rows=[];qa.state='pause';qa.ui.cover.hidden=true;qa.closeModal();
    for(const entry of monsterCatalogue){
      const spec=monsterBattle(entry,15,{hp:1,pace:1,damage:1}),rig=mountBestiary(v.scene,entry,spec.height,true,spec);
      const unit={x:0,z:0,dx:0,dz:1,spec,move:.6,bossPhase:1,phase:0,hp:spec.hp,
        attack:{time:.10,windup:1,pattern:spec.attacks[0],dx:0,dz:1},motion:null};
      const finite=[];
      for(const angle of [0,Math.PI/2,Math.PI]){
        unit.attack.dx=unit.dx=Math.sin(angle);unit.attack.dz=unit.dz=Math.cos(angle);rig.heading=angle;
        poseBestiary(rig,unit,{phase:1},.7,0,0);v.renderer.render(v.scene,v.camera);
        const bounds=new T.Box3().setFromObject(rig.root),size=bounds.getSize(new T.Vector3());
        finite.push([size.x,size.y,size.z].every(Number.isFinite)&&size.y>1);
      }
      rig.heading=0;unit.attack.dx=unit.dx=0;unit.attack.dz=unit.dz=1;
      poseBestiary(rig,unit,{phase:1,targetHeading:0},.7,0,0);rig.root.updateMatrixWorld(true);
      const forward=rig.weapons.filter(weapon=>weapon.aim).every(weapon=>{
        const from=weapon.base.clone().applyMatrix4(weapon.node.matrixWorld),to=weapon.end.clone().applyMatrix4(weapon.node.matrixWorld);
        return to.sub(from).normalize().z>.10;
      });
      let cloth=0;
      rig.root.traverse(part=>{if(part.isSkinnedMesh)cloth++;});
      rows.push({id:entry.id,name:rig.root.name,finite:finite.every(Boolean),cloth,forward});
      removeBestiary(v.scene,rig);
      if(rows.length%15===0)await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    qa.showCover();return rows;
  })()`);
  assert.equal(roster.length,166);assert.ok(roster.every(r=>r.name&&r.finite));
  assert.ok(roster.every(r=>r.forward),'Charged handheld weapons must point forward, including bow muzzle axes');
  assert.ok(roster.some(r=>r.cloth>0));console.log('166 independent encounter rigs: front, side, back and charged pose rendered without errors.');
  // The real modal preview, phase arena and practice controls remain usable.
  const act=async selector=>{await ev('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})');await tap(selector);};
  await act('#bestiary');await wait('qa.state==="practice-loadout"');
  await act('[data-preview="boss"]');await wait('qa.weaponViewer.open');await sleep(180);await capture('original-boss-mobile-front');
  await ev('qa.weaponViewer.yaw=Math.PI/2;qa.weaponViewer.turn(0,0);true');await capture('original-boss-mobile-side');
  await ev('qa.weaponViewer.yaw=Math.PI;qa.weaponViewer.turn(0,0);true');await capture('original-boss-mobile-back');
  await ev('qa.weaponViewer.dialog.close();qa.showCover();true');
  // Retire only the known unavailable soundtrack in this game's own music slot.
  await ev(`(async()=>{
    await new Promise((resolve,reject)=>{const req=indexedDB.open('meow-revelation-music',1);
      req.onupgradeneeded=()=>req.result.createObjectStore('tracks');req.onerror=()=>reject(req.error);
      req.onsuccess=()=>{const db=req.result,tx=db.transaction('tracks','readwrite'),store=tx.objectStore('tracks');
        const key=new URL('../',new URL('soundtrack.mjs',document.baseURI)).pathname;
        store.put({name:'Infinite Requiem - legacy.mp3',blob:new Blob([])},key);
        store.put({name:'Unrelated custom track',blob:new Blob([])},'unrelated-scope');
        tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
    });return true;
  })()`);
  await c('Page.reload',{ignoreCache:true});await attach();
  await wait('qa.soundtrack.available&&!qa.soundtrack.busy');
  assert.match(await ev('qa.soundtrack.name'),/nene/);
  const migration=await ev(`(async()=>new Promise((resolve,reject)=>{
    const req=indexedDB.open('meow-revelation-music',1);req.onerror=()=>reject(req.error);
    req.onsuccess=()=>{const db=req.result,tx=db.transaction('tracks','readonly'),s=tx.objectStore('tracks');
      const old=s.get(new URL('../',new URL('soundtrack.mjs',document.baseURI)).pathname),other=s.get('unrelated-scope');
      tx.oncomplete=()=>{resolve({retired:!old.result,other:other.result?.name});db.close();};};
  }))()`);
  assert.deepEqual(migration,{retired:true,other:'Unrelated custom track'});
  await wait('document.querySelector("#offline-status").textContent==="已可離線遊玩"',900);
  await c('Page.navigate',{url:'about:blank'});
  await c('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await c('Page.navigate',{url});await attach();await wait('qa.soundtrack.available');
  assert.equal(await ev('navigator.onLine'),false);assert.match(await ev('qa.soundtrack.name'),/nene/);
  assert.ok(await ev('qa.soundtrack.media.duration>26&&qa.soundtrack.media.duration<27'));
  assert.equal(await ev('qa.soundtrack.media.loop'),true);
  await capture('original-offline-menu');
  assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
  console.log('Licensed loop decoded offline; legacy music migration preserved unrelated slots. No cloud accounts or scores created.');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{ws?.close();chrome?.kill();server.close();});
