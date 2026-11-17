importScripts('./offline-assets.js');

const scope=self.registration.scope;
const prefix='cat-revelation:'+scope+':';
const releaseCache=prefix+offlineRelease.version;
const files=new Map(offlineRelease.files.map(([path,bytes,hash])=>[
  new URL(path,scope).href,{bytes,hash},
]));
const total=offlineRelease.files.reduce((sum,file)=>sum+file[1],0);
let download=null;

async function publish(state,bytes=0) {
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of clients)if(client.url.startsWith(scope))client.postMessage({kind:'offline-pack',state,bytes,total});
}

async function downloadFile(cache,key,hash) {
  const address=new URL(key);
  address.searchParams.set('pack',hash.slice(0,16));
  for(let attempt=0;attempt<3;attempt++){
    try {
      const response=await fetch(address,{cache:attempt?'reload':'force-cache',integrity:'sha256-'+hash,redirect:'error'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      await cache.put(key,response);
      return;
    } catch(error) {
      if(attempt===2)throw error;
      await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
    }
  }
}

async function prepareFiles() {
  const cache=await caches.open(releaseCache);
  const stored=new Set((await cache.keys()).map(request=>request.url));
  const pending=[];
  let completed=0,finished=0,failure=null;
  for(const [key,file] of files){
    if(stored.has(key))completed+=file.bytes;
    else pending.push([key,file]);
  }
  await publish('downloading',completed);
  let cursor=0;
  const worker=async()=>{
    while(!failure&&cursor<pending.length){
      const [key,{bytes,hash}]=pending[cursor++];
      try{
        await downloadFile(cache,key,hash);
        completed+=bytes;
        if(++finished%10===0)await publish('downloading',completed);
      }catch(error){failure=error;}
    }
  };
  await Promise.all(Array.from({length:6},worker));
  if(failure){
    await publish('failed',completed);
    throw failure;
  }
}

function prepare() {
  download??=prepareFiles().finally(()=>{download=null;});
  return download;
}

self.addEventListener('install',event=>event.waitUntil(prepare()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const stale=(await caches.keys()).filter(name=>name.startsWith(prefix)&&name!==releaseCache);
  await Promise.all(stale.map(name=>caches.delete(name)));
  await self.clients.claim();
  await publish('ready',total);
})()));

self.addEventListener('message',event=>{
  if(event.data==='offline-repair'){
    event.waitUntil(prepare().then(()=>publish('ready',total),()=>{}));
  }
  if(event.data==='offline-status'){
    event.waitUntil((async()=>{
      const cache=await caches.open(releaseCache);
      const stored=new Set((await cache.keys()).map(request=>request.url));
      const ready=[...files.keys()].every(url=>stored.has(url));
      event.source?.postMessage({kind:'offline-pack',state:ready?'ready':'missing',bytes:ready?total:0,total});
    })());
  }
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(scope))return;
  const url=new URL(event.request.url);
  url.search='';
  url.hash='';
  if(url.pathname.endsWith('/'))url.pathname+='index.html';
  if(!files.has(url.href))return;
  const key=url.href;
  event.respondWith((async()=>{
    const cache=await caches.open(releaseCache);
    return (await cache.match(key))??fetch(event.request);
  })());
});
