const status=document.getElementById('offline-status');
const retry=document.getElementById('offline-retry');
const progress=document.getElementById('offline-progress');
const workerURL=new URL('../sw.js',import.meta.url);

function show(label,canRetry=false,state='idle',value=null) {
  status.textContent=label;
  retry.hidden=!canRetry;
  status.parentElement.dataset.state=state;
  status.setAttribute('aria-busy',String(state==='downloading'));
  if(progress){
    progress.hidden=state!=='downloading';
    if(value===null)progress.removeAttribute('value');
    else progress.value=value;
  }
}

if('serviceWorker' in navigator) {
  const workers=navigator.serviceWorker;
  let receiving=false;
  workers.addEventListener('message',({data})=>{
    if(data?.kind!=='offline-pack')return;
    const {state,bytes,total}=data;
    if(state==='ready'){
      receiving=false;
      show('已可離線遊玩',false,'ready',100);
    }else if(state==='downloading'){
      receiving=true;
      const percent=total>0?Math.min(99,Math.floor(bytes/total*100)):null;
      show('下載離線資源 '+(percent??0)+'%',false,'downloading',percent);
    }else if(state==='failed'||state==='missing'&&!receiving){
      receiving=false;
      show('離線資源未下載完成',true,'failed');
    }
  });
  const report=()=>workers.controller?.postMessage('offline-status');
  workers.addEventListener('controllerchange',report);

  async function register() {
    show('準備離線資源⋯⋯',false,'downloading');
    try{
      const registration=await workers.getRegistration(workerURL);
      if(registration?.active){
        registration.active.postMessage('offline-status');
        if(retry.dataset.retry==='yes')registration.active.postMessage('offline-repair');
      }
      if(!registration?.active||navigator.onLine){
        const next=await workers.register(workerURL,{updateViaCache:'none'});
        if(next.active)next.active.postMessage('offline-status');
        if(next.installing){
          const candidate=next.installing;
          candidate.addEventListener('statechange',()=>{
            if(candidate.state==='redundant'&&!next.active)show('離線資源未下載完成',true,'failed');
          });
        }
      }
    }catch{
      if(!workers.controller&&!receiving)show('離線資源未下載完成',true,'failed');
    }
  }

  retry.addEventListener('click',()=>{
    retry.dataset.retry='yes';
    register();
  });
  register();
}else{
  show('此瀏覽器未支援離線下載');
}
