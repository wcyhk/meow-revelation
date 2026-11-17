const trackId='LtBvLLL5CGM';

export class Soundtrack {
  constructor(audio,resize) {
    this.audio=audio;
    this.resize=resize;
    this.panel=document.getElementById('soundtrack');
    this.video=document.getElementById('soundtrack-video');
    document.getElementById('soundtrack-close').addEventListener('click',()=>this.close(true));
    addEventListener('online',()=>this.updateButtons());
    addEventListener('offline',()=>{
      this.close();
      this.updateButtons();
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)this.close();
    });
  }

  bind(button) {
    button.setAttribute('aria-controls',this.panel.id);
    button.addEventListener('click',()=>{
      if(this.panel.hidden)this.open();
      else this.close();
    });
    this.updateButton(button);
  }

  updateButton(button) {
    button.disabled=!navigator.onLine;
    button.setAttribute('aria-expanded',String(!this.panel.hidden));
    button.textContent=button.disabled?'主題曲需連線'
      :this.panel.hidden?'循環播放主題曲':'關閉主題曲播放器';
  }

  updateButtons() {
    for(const button of document.querySelectorAll('.soundtrack-toggle'))this.updateButton(button);
  }

  open() {
    if(!navigator.onLine||document.hidden||!this.panel.hidden)return;
    const frame=document.createElement('iframe');
    const address=new URL('https://www.youtube.com/embed/'+trackId);
    address.search=new URLSearchParams({loop:'1',playlist:trackId,autoplay:'1',playsinline:'1',rel:'0'});
    frame.src=address.href;
    frame.title='Infinite Requiem · Deoksoon';
    frame.referrerPolicy='strict-origin-when-cross-origin';
    frame.allow='autoplay; encrypted-media; fullscreen';
    this.panel.hidden=false;
    this.video.append(frame);
    this.audio.useExternalMusic(true);
    this.updateButtons();
    this.resize();
  }

  close(restoreFocus=false) {
    if(this.panel.hidden)return;
    this.video.replaceChildren();
    this.panel.hidden=true;
    this.audio.useExternalMusic(false);
    this.updateButtons();
    this.resize();
    if(restoreFocus){
      const options=document.querySelectorAll('.soundtrack-toggle,#pause');
      [...options].find(button=>!button.disabled&&button.getClientRects().length)
        ?.focus({preventScroll:true});
    }
  }
}
