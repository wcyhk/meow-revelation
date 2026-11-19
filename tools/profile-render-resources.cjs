
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



  await c('Emulation.setCPUThrottlingRate',{rate:3});
  await ev('(async()=>{const {stages,enemySpec}=await import(new URL("expedition.mjs?v=story-repair-1",document.baseURI));const best=await import(new URL("monster-bestiary.mjs?v=boss-foundry-1",document.baseURI));window.perfQA={stages,enemySpec,best};return true;})()');
  const hardware=await ev('(()=>{const gl=qa.view.renderer.getContext(),ext=gl.getExtension("WEBGL_debug_renderer_info");return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),parallelShaders:!!gl.getExtension("KHR_parallel_shader_compile"),pixelRatio:qa.view.renderer.getPixelRatio(),mobile:qa.view.mobile};})()');
  console.log('hardware',JSON.stringify(hardware));
  const series=await ev('(async()=>{const v=qa.view,rows=[];for(const floor of [1,2,3,11,12,21,22,81,82,91,92,1,2]){const stage=perfQA.stages[floor-1];const start=performance.now();v.setStage(stage);const built=performance.now();v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();const first=performance.now();v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();const end=performance.now();rows.push({floor,build:built-start,first:first-built,warm:end-first,geometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures,programs:v.renderer.info.programs.length,calls:v.renderer.info.render.calls,triangles:v.renderer.info.render.triangles,heap:performance.memory?.usedJSHeapSize});await new Promise(resolve=>setTimeout(resolve,20));}return rows;})()');
  console.log('rooms',JSON.stringify(series));
  const bosses=await ev('(async()=>{const v=qa.view,rows=[];for(const floor of [5,5,10,10,35,35,100,100]){const stage=perfQA.stages[floor-1],spec=perfQA.enemySpec(stage,"boss");const before=performance.now();const actor=v.createActor(spec.frame,spec.height);v.prepareBoss(actor,spec,true);const built=performance.now();v.actor(actor,{x:0,z:0,dx:0,dz:-1,kind:"boss",bossPhase:0,age:1,hp:spec.hp,move:0,flash:0,attack:null,stun:0,chill:0,exposed:0}, {frame:spec.frame,face:1,aura:.4,rim:spec.tint,bob:0,squash:1,tilt:0});v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();const rendered=performance.now();const root=actor.bestiary.root;const materials=new Set(),geometries=new Set();root.traverse(n=>{if(n.material)materials.add(n.material);if(n.geometry)geometries.add(n.geometry)});let bytes=0;for(const geo of geometries){for(const attr of Object.values(geo.attributes))bytes+=attr.array.byteLength;bytes+=geo.index?.array.byteLength??0;}v.removeActor(actor);v.renderer.render(v.scene,v.camera);v.renderer.getContext().finish();const removed=performance.now();rows.push({floor,build:built-before,first:rendered-built,remove:removed-rendered,meshes:root.children.length,geometryBytes:bytes,materials:materials.size,geometries:geometries.size,gpuGeometries:v.renderer.info.memory.geometries,textures:v.renderer.info.memory.textures,programs:v.renderer.info.programs.length,calls:v.renderer.info.render.calls,heap:performance.memory?.usedJSHeapSize});await new Promise(r=>setTimeout(r,20));}return rows;})()');
  console.log('bosses',JSON.stringify(bosses));
  if(errors.length)throw Error(JSON.stringify(errors));
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{
  ws?.close();chrome?.kill();server.close();
});
