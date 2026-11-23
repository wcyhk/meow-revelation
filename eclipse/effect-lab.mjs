import * as T from '../three.min.mjs';
import {effects,loaders} from './vendor/00gamedevs/catalogue.mjs';
import {language,t} from './locale.mjs';

const labels={
  'zh-Hant':['特效演練','搜尋特效','重播','返回練習場','正在準備特效…','無法播放呢款特效。'],
  'zh-Hans':['特效演练','搜索特效','重播','返回练习场','正在准备特效…','无法播放此特效。'],
  en:['Effect Lab','Search effects','Replay','Back to practice','Preparing effect…','This effect could not be played.'],
  ja:['エフェクト試演','エフェクトを検索','リプレイ','練習場に戻る','エフェクトを準備中…','このエフェクトを再生できません。'],
};
const [title,searchLabel,replayLabel,backLabel,pending,failure]=labels[language];
const east=new T.Vector3(1,0,0);
const target=new T.Vector3(2.65,1.1,0);
const source=new T.Vector3(-2.65,1.1,0);

export class EffectStage {
  constructor(canvas) {
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    this.renderer.toneMapping=T.NoToneMapping;
    this.scene=new T.Scene();
    this.scene.background=new T.Color(0x14141e);
    this.camera=new T.PerspectiveCamera(44,1,.1,130);
    this.scene.add(new T.HemisphereLight(0xd7edff,0x443642,2.1));
    const key=new T.DirectionalLight(0xffcfab,2.5);
    key.position.set(-4,8,3);
    this.scene.add(key);
    this.floor=new T.Mesh(new T.CircleGeometry(32,64),new T.MeshStandardMaterial({color:0x282837,roughness:.94}));
    this.floor.rotation.x=-Math.PI/2;
    this.floor.position.y=-.035;
    this.scene.add(this.floor);
    this.platform=new T.GridHelper(32,32,0x45435b,0x333344);
    this.scene.add(this.platform);
    this.dummy=new T.Mesh(new T.CapsuleGeometry(.42,1.06,5,14),new T.MeshStandardMaterial({color:0x988176,roughness:.56}));
    this.dummy.position.copy(target);
    this.scene.add(this.dummy);
    this.blade=new T.Mesh(new T.BoxGeometry(.14,2.0,.09),new T.MeshStandardMaterial({color:0xd0c7b9,metalness:.55,roughness:.38}));
    this.blade.position.set(-1.15,1.25,0);
    this.scene.add(this.blade);
    this.frame=0;
    this.azimuth=.53;
  }

  layout(width,height) {
    if(this.width===width&&this.height===height)return;
    this.width=width;
    this.height=height;
    this.renderer.setSize(width,height,false);
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
    const ratio=this.renderer.getPixelRatio();
    this.buffer?.setSize(Math.round(width*ratio),Math.round(height*ratio));
  }

  play(entry,create) {
    this.clear();
    this.entry=entry;
    const options={};
    if(entry.level==='high'&&entry.parameters.density?.min)options.density=Math.max(.25,entry.parameters.density.min);
    if(entry.type==='postprocess'&&matchMedia('(prefers-reduced-motion: reduce)').matches)options.intensity=.35;
    this.effect=create(options);
    const fx=this.effect;
    this.age=0;this.ending=false;
    this.dummy.visible=entry.category==='beam'||entry.category==='projectile'||entry.type==='postprocess';
    this.blade.visible=!!fx.attachWeapon;
    this.wide=['starblade-cataclysm','celestial-arrow-rain','hellfire-pillar','meteor-strike','lightning-fire-tornado'].includes(entry.id);
    if(entry.type==='postprocess'){
      const ratio=this.renderer.getPixelRatio();
      this.buffer=new T.WebGLRenderTarget(Math.round(this.width*ratio),Math.round(this.height*ratio));
      fx.renderToScreen=true;
      fx.setSubjects(this.scene,this.camera,[this.dummy]);
      fx.trigger({x:.59,y:.53});
      return;
    }
    this.scene.add(fx.group);
    if(entry.category==='projectile'&&entry.playback==='continuous'){
      fx.group.position.copy(source);
      fx.setDirection?.(east,0);
    }
    fx.setEndpoints?.(source,target);
    fx.attachWeapon?.(this.blade,{base:[0,-.94,0],tip:[0,.98,0]});
    if(entry.id==='interactive-ground-fog'){
      fx.setTerrain(()=>0);
      fx.prepare(this.renderer);
    }
    if(entry.id==='starblade-cataclysm')fx.setSweepPath(new T.Vector3(-4,0,0),new T.Vector3(5,0,0));
  }

  draw(dt) {
    const {renderer,scene,camera,effect:fx,entry}=this;
    const distance=(this.wide?17:9.4)*Math.max(1,.95/camera.aspect);
    camera.position.set(distance*Math.sin(this.azimuth),distance*.66,distance*Math.cos(this.azimuth));
    camera.lookAt(0,this.wide?1.7:.65,0);
    if(!fx){renderer.render(scene,camera);return;}
    this.age+=dt;
    if(entry.type==='postprocess'){
      fx.update(dt);
      if(!fx.active){renderer.render(scene,camera);return;}
      renderer.setRenderTarget(this.buffer);
      renderer.render(scene,camera);
      renderer.setRenderTarget(null);
      fx.render(renderer,null,this.buffer,dt);
      return;
    }
    if(!this.ending&&entry.playback==='continuous'&&entry.category==='projectile'){
      fx.group.position.lerpVectors(source,target,Math.min(this.age/1.06,1));
      if(this.age>=1.06){fx.hit?.(target);this.ending=true;}
    }else if(!this.ending&&entry.playback==='continuous'&&this.age>=3.2&&entry.category!=='environment'){
      fx.stop?.();this.ending=true;
    }
    if(fx.attachWeapon){
      this.blade.rotation.z=-1.2+2.4*Math.sin(this.age*5.2);
      this.blade.rotation.y=this.age*2.2;
    }
    if(entry.id==='interactive-ground-fog'&&this.age<2.1)fx.stir(target,east);
    fx.setCameraPosition?.(camera.position);
    fx.update(dt);
    if(fx.render)fx.render(renderer,scene,camera);
    else {
      fx.prepareRender?.(camera);
      renderer.render(scene,camera);
    }
  }

  clear() {
    this.effect?.detachWeapon?.();
    this.effect?.group?.removeFromParent();
    this.effect?.dispose();
    this.effect=null;
    this.buffer?.dispose();
    this.buffer=null;
  }

  dispose() {
    this.clear();
    for(const object of [this.floor,this.platform,this.dummy,this.blade]){
      object.geometry.dispose();object.material.dispose();
    }
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

export function openEffectLab() {
  const dialog=document.createElement('dialog');
  dialog.className='weapon-viewer fx-lab';
  dialog.setAttribute('aria-label',title);
  dialog.innerHTML='<header class="weapon-viewer-head"><h2></h2><button type="button" class="secondary"></button></header><div class="fx-lab-pick"><input type="search"><select></select></div><canvas></canvas><footer class="weapon-viewer-footer"><p role="status"></p><button type="button" class="secondary"></button></footer>';
  const [back,replay]=dialog.querySelectorAll('button');
  const query=dialog.querySelector('input'),select=dialog.querySelector('select');
  const canvas=dialog.querySelector('canvas'),status=dialog.querySelector('[role=status]');
  dialog.querySelector('h2').textContent=title;
  back.textContent=backLabel;
  replay.textContent=replayLabel;
  query.placeholder=searchLabel;
  query.setAttribute('aria-label',searchLabel);
  select.setAttribute('aria-label',title);
  const name=entry=>language==='en'||language==='ja'?entry.name.en:t(entry.name.zh);
  const description=entry=>language==='en'||language==='ja'?entry.description.en:t(entry.description.zh);
  let stage,frame,sequence=0,last=0,active=false,drag;
  function options(){
    const current=select.value,filter=query.value.trim().toLowerCase();
    select.replaceChildren(...effects.filter(entry=>[entry.id,entry.name.zh,entry.name.en,name(entry)].some(value=>value.toLowerCase().includes(filter)))
      .map(entry=>new Option(name(entry),entry.id)));
    if([...select.options].some(option=>option.value===current))select.value=current;
    if(select.value!==current)void play();
  }
  async function play(){
    const version=++sequence;
    const entry=effects.find(item=>item.id===select.value);
    status.textContent=entry?pending:'';
    replay.disabled=true;
    stage?.clear();
    if(!entry)return;
    try{
      const {default:create}=await loaders[entry.id]();
      if(version!==sequence||!dialog.open)return;
      stage??=new EffectStage(canvas);
      stage.layout(canvas.clientWidth,canvas.clientHeight);
      stage.play(entry,create);
      status.textContent=description(entry);
      replay.disabled=false;
      last=performance.now();
      if(!active){active=true;frame=requestAnimationFrame(draw);}
    }catch{
      if(version===sequence){status.textContent=failure;replay.disabled=false;}
    }
  }
  function draw(time){
    const dt=Math.min(.045,(time-last)/1000);
    last=time;
    try{
      stage.layout(canvas.clientWidth,canvas.clientHeight);
      stage.draw(dt);
      if(!stage.effect||stage.effect.finished||(stage.entry.type==='postprocess'&&!stage.effect.active)){
        active=false;
        return;
      }
      frame=requestAnimationFrame(draw);
    }catch{
      stage.clear();status.textContent=failure;active=false;
    }
  }
  back.addEventListener('click',()=>dialog.close());
  query.addEventListener('input',options);
  select.addEventListener('change',play);
  replay.addEventListener('click',play);
  canvas.addEventListener('pointerdown',event=>{drag=event.clientX;canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{
    if(drag===undefined||!stage)return;
    stage.azimuth+=(event.clientX-drag)*.012;drag=event.clientX;
  });
  canvas.addEventListener('lostpointercapture',()=>{drag=undefined;});
  dialog.addEventListener('close',()=>{
    ++sequence;cancelAnimationFrame(frame);stage?.dispose();dialog.remove();
  },{once:true});
  document.body.append(dialog);
  dialog.showModal();
  options();
}
