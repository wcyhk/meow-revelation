export class RewardedRevive {
  constructor(publisher){
    this.publisher=/^ca-pub-\d{16}$/.test(publisher)?publisher:null;
    this.ready=false;
  }

  prepare(){
    if(!this.publisher||this.enqueue||!navigator.onLine)return;
    window.adsbygoogle??=[];
    this.enqueue=options=>window.adsbygoogle.push(options);
    this.enqueue({preloadAdBreaks:'on',onReady:()=>{this.ready=true;}});

    const tag=document.createElement('script');
    tag.async=true;
    tag.crossOrigin='anonymous';
    tag.dataset.adClient=this.publisher;
    tag.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+this.publisher;
    document.head.append(tag);
  }

  get available(){return this.ready&&navigator.onLine;}

  offer({prompt,playing,complete}){
    let state='checking',viewed=false,timer;
    const finish=reward=>{
      if(state==='finished')return;
      state='finished';
      clearTimeout(timer);
      complete(reward);
    };
    const timeOut=()=>setTimeout(()=>finish(false),2200);
    timer=timeOut();
    try{
      this.enqueue({
        type:'reward',name:'first-fall-revive',
        beforeReward:showAd=>{
          if(state!=='checking')return;
          clearTimeout(timer);
          state='offered';
          prompt(()=>{
            if(state!=='offered')return;
            if(!navigator.onLine){finish(false);return;}
            state='starting';
            timer=timeOut();
            try{showAd();}catch{finish(false);}
          },()=>finish(false));
        },
        beforeAd:()=>{
          if(state!=='starting')return;
          clearTimeout(timer);
          state='playing';
          playing();
        },
        adViewed:()=>{if(state==='playing')viewed=true;},
        adDismissed:()=>{viewed=false;},
        afterAd:()=>finish(viewed),
        adBreakDone:()=>finish(viewed),
      });
    }catch{
      finish(false);
    }
  }
}
