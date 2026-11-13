import * as T from '../three.min.mjs';
import {armLighting,disposeForge,forge} from './armory.mjs?v=armory-art-1';
import {comboNames} from './weapon-combos.mjs?v=weapon-audit-1';
import {MotionArt} from './motion-art.mjs?v=weapon-audit-1';
import {mountBestiary,poseBestiary,removeBestiary} from './bestiary-models.mjs?v=bestiary-1';

function node(tag,kind,text){
  const element=document.createElement(tag);
  if(kind)element.className=kind;
  if(text)element.textContent=text;
  return element;
}

function button(text,action,style='secondary'){
  const result=node('button',style,text);
  result.type='button';
  result.addEventListener('click',action);
  return result;
}

const tilt=.26;
const inspectCamera=new T.OrthographicCamera(-1,1,1,-1,.1,80);
inspectCamera.position.set(0,0,8);
inspectCamera.lookAt(0,0,0);
const battleCamera=new T.OrthographicCamera(-1,1,1,-1,.1,80);
const aim=new T.Vector3(.8,.30,0);

function fit(camera,width,height,viewWidth,viewHeight){
  const ratio=width/height;
  const half=Math.max(viewHeight,viewWidth/ratio)/2;
  camera.top=half;
  camera.bottom=-half;
  camera.left=-half*ratio;
  camera.right=half*ratio;
  camera.updateProjectionMatrix();
}

export class WeaponViewer {
  constructor(mainView,makePractice){
    this.main=mainView;
    this.makePractice=makePractice;
    this.dialog=node('dialog','weapon-viewer');
    this.dialog.setAttribute('aria-labelledby','weapon-viewer-title');
    const header=node('header','weapon-viewer-head');
    this.title=node('h2','','');
    this.title.id='weapon-viewer-title';
    this.role=node('p','weapon-viewer-role');
    const heading=node('div');
    heading.append(this.role,this.title);
    const close=button('返回',()=>this.dialog.close());
    close.autofocus=true;
    header.append(heading,close);
    this.stage=node('div','weapon-viewer-stage');
    this.image=node('img','weapon-viewer-fallback');
    this.image.alt='';
    this.hint=node('p','weapon-viewer-hint');
    this.hint.setAttribute('aria-live','polite');
    this.canvas=node('canvas','weapon-viewer-canvas');
    this.canvas.tabIndex=0;
    this.canvas.setAttribute('aria-label','3D 模型。拖動或用方向鍵旋轉，Home 鍵重置視角。');
    this.zoomTools=node('div','model-zoom');
    this.zoomOut=button('−',()=>this.zoom(1/1.18));
    this.zoomIn=button('＋',()=>this.zoom(1.18));
    this.zoomOut.setAttribute('aria-label','縮小頭目模型');
    this.zoomIn.setAttribute('aria-label','放大頭目模型');
    this.zoomTools.append(this.zoomOut,this.zoomIn);
    this.stage.append(this.image,this.canvas,this.hint,this.zoomTools);
    this.inspect=button('旋轉睇模型',()=>this.showModel());
    this.combo=button('播放三段普攻',()=>this.play('combo'));
    this.skill=button('播放技能',()=>this.play('skill'));
    this.tools=node('div','weapon-viewer-tools');
    this.tools.append(this.inspect,this.combo,this.skill);
    this.attacks=node('div','boss-preview-attacks');
    this.attacks.setAttribute('role','group');
    this.attacks.setAttribute('aria-label','頭目攻擊預覽');
    this.detail=node('p','weapon-viewer-description');
    this.choose=button('',()=>{
      const {commit}=this;
      this.dialog.close();
      commit();
    },'primary');
    const footer=node('footer','weapon-viewer-footer');
    footer.append(this.detail,this.choose);
    this.dialog.append(header,this.stage,this.tools,this.attacks,footer);
    document.getElementById('game').append(this.dialog);
    this.dialog.addEventListener('close',()=>{
      if(this.dialog.open)return;
      this.clear();
      if(this.focusReturn?.isConnected&&!this.focusReturn.closest('[hidden]')){
        this.focusReturn.focus({preventScroll:true});
      }
      this.focusReturn=null;
    });
    this.dialog.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        event.preventDefault();
        this.dialog.close();
      }
    });
    this.canvas.addEventListener('pointerdown',event=>{
      if(this.mode!=='model'||this.drag||event.button!==0)return;
      this.drag={id:event.pointerId,x:event.clientX,y:event.clientY};
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove',event=>{
      if(this.drag?.id!==event.pointerId)return;
      this.turn((event.clientX-this.drag.x)*.014,(event.clientY-this.drag.y)*.012);
      this.drag.x=event.clientX;
      this.drag.y=event.clientY;
    });
    this.canvas.addEventListener('wheel',event=>{
      if(!this.boss||this.mode!=='model'||!event.deltaY)return;
      event.preventDefault();
      this.zoom(event.deltaY<0?1.18:1/1.18);
    },{passive:false});
    for(const event of ['pointerup','pointercancel','lostpointercapture']){
      this.canvas.addEventListener(event,event=>{if(this.drag?.id===event.pointerId)this.drag=null;});
    }
    this.canvas.addEventListener('keydown',event=>{
      if(this.mode!=='model')return;
      const directions={ArrowLeft:[-.21,0],ArrowRight:[.21,0],ArrowUp:[0,-.17],ArrowDown:[0,.17]};
      if(event.key==='Home'){
        event.preventDefault();
        this.resetRotation();
      }else if(directions[event.key]){
        event.preventDefault();
        this.turn(...directions[event.key]);
      }
    });
    this.observer=new ResizeObserver(()=>{if(this.dialog.open)this.resize();});
    this.observer.observe(this.stage);
    this.animate=this.animate.bind(this);
  }

  get open(){return this.dialog.open;}

  show(weapon,commit){
    this.boss=null;
    this.weapon=weapon;
    this.phaseControls?.forEach(control=>control.remove());
    this.phaseControls=[];
    this.attackControls=[];
    this.attacks.replaceChildren();
    this.inspect.textContent='旋轉睇模型';
    this.openViewer({title:weapon.name,role:weapon.role,ink:weapon.ink,choice:'選擇'+weapon.name,
      image:this.main.armIcons.get(weapon.id),description:weapon.skill+' · '+weapon.detail,commit:()=>commit(weapon)});
  }

  showBoss(spec,names,makePractice,commit){
    this.boss=spec;
    this.weapon=null;
    this.moveNames=names;
    this.makeBossPractice=makePractice;
    this.inspect.textContent='旋轉睇模型';
    this.phaseControls?.forEach(control=>control.remove());
    this.phaseControls=spec.phases.map((_,index)=>{
      const control=button(index===0?'二段變身':'三段變身',()=>this.playBoss({phase:index+1},control));
      control.dataset.phase=String(index+1);
      return control;
    });
    this.tools.append(...this.phaseControls);
    this.attackControls=spec.attacks.map(pattern=>{
      const control=button(names[pattern],()=>this.playBoss({pattern},control));
      control.dataset.attack=pattern;
      return control;
    });
    this.attacks.replaceChildren(...this.attackControls);
    const {bestiary}=spec;
    this.openViewer({title:bestiary.name,role:'頭目圖鑑',ink:new T.Color(spec.tint).getStyle(),
      choice:'挑戰此頭目',description:spec.signature,commit});
  }

  get controls(){return [this.inspect,this.combo,this.skill,...this.phaseControls,...this.attackControls];}

  openViewer({title,role,choice,ink,image,description,commit}){
    this.clear();
    this.commit=commit;
    this.description=description;
    this.focusReturn=document.activeElement;
    this.title.textContent=title;
    this.role.textContent=role;
    this.choose.textContent=choice;
    this.dialog.dataset.subject=this.boss?'boss':'weapon';
    this.dialog.style.setProperty('--preview-ink',ink);
    this.combo.hidden=this.skill.hidden=!!this.boss;
    this.attacks.hidden=!this.boss;
    if(image)this.image.src=image;
    else this.image.removeAttribute('src');
    this.canvas.hidden=false;
    this.zoomTools.hidden=true;
    this.dialog.showModal();
    try{
      this.renderer??=new T.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:!this.main.mobile,powerPreference:'low-power'});
    }catch{
      this.canvas.hidden=true;
      this.image.hidden=!image;
      for(const control of this.controls)control.disabled=true;
      this.hint.textContent='3D 預覽暫未能載入';
      this.detail.textContent=description;
      return;
    }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.renderer.setClearColor(0,0);
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.18;
    this.canvas.hidden=false;
    this.image.hidden=true;
    for(const control of this.controls)control.disabled=false;
    this.showModel();
  }

  resize(){
    const width=this.stage.clientWidth,height=this.stage.clientHeight;
    if(!width||!height||!this.renderer)return;
    this.renderer.setSize(width,height,false);
    fit(inspectCamera,width,height,2.30,2.24);
    const battleWidth=this.boss?14.4:Math.min(15.1,Math.max(10.8,7.2+this.weapon.range*.61));
    fit(battleCamera,width,height,battleWidth,this.boss?8.4:7.6);
    if(this.mode==='model')this.renderer.render(this.scene,inspectCamera);
    else if(this.practice)this.renderer.render(this.scene,battleCamera);
  }

  turn(dx,dy){
    this.yaw+=dx;
    this.pitch=T.MathUtils.clamp(this.pitch+dy,-1.55,1.55);
    this.model.rotation.set(this.pitch,this.yaw,this.boss?-.04:-tilt);
    this.renderer.render(this.scene,inspectCamera);
  }

  resetRotation(){
    this.yaw=this.boss?-.53:-.37;
    this.pitch=-.13;
    this.setZoom(1);
    this.turn(0,0);
  }

  zoom(factor){
    if(this.mode!=='model')return;
    this.setZoom(inspectCamera.zoom*factor);
    this.renderer.render(this.scene,inspectCamera);
  }

  setZoom(value){
    inspectCamera.zoom=T.MathUtils.clamp(value,.75,1.8);
    inspectCamera.updateProjectionMatrix();
    this.zoomOut.disabled=inspectCamera.zoom<=.75;
    this.zoomIn.disabled=inspectCamera.zoom>=1.8;
  }

  showModel(){
    this.clearScene();
    this.mode='model';
    this.stage.dataset.preview='model';
    this.setActive(this.inspect);
    this.hint.textContent='拖動旋轉';
    this.zoomTools.hidden=!this.boss;
    this.detail.textContent=this.description;
    this.scene=new T.Scene();
    armLighting(this.scene);
    const pivot=new T.Group();
    this.model=pivot;
    let item;
    if(this.boss){
      this.bossRig=mountBestiary(this.scene,this.boss.bestiary,this.boss.height);
      poseBestiary(this.bossRig,{phase:0,move:0,face:1,spec:this.boss},{phase:0},0,0,0);
      item=this.bossRig.root;
    }else item=forge(this.weapon);
    const bounds=new T.Box3().setFromObject(item);
    const size=bounds.getSize(new T.Vector3());
    item.position.sub(bounds.getCenter(new T.Vector3()));
    pivot.scale.setScalar((this.boss?2:1.68)/size.length());
    pivot.add(item);
    this.scene.add(pivot);
    this.item=item;
    this.resetRotation();
    this.resize();
  }

  makeStage(){
    const source=this.main;
    const view=Object.create(Object.getPrototypeOf(source));
    const scene=new T.Scene();
    armLighting(scene);
    battleCamera.position.set(.8,9.2,15);
    battleCamera.lookAt(aim);
    battleCamera.updateMatrixWorld(true);
    const axis=new T.Vector3(0,1,0).applyQuaternion(battleCamera.quaternion);
    Object.assign(view,{scene,renderer:this.renderer,camera:battleCamera,cameraUp:axis,mobile:source.mobile,
      atlas:source.atlas,halo:source.halo,shadow:source.shadow,battleTextures:source.battleTextures,
      sigilTextures:source.sigilTextures,ring:source.ring,disc:source.disc,effects:[],time:0,shake:0,
      projectileShape:source.projectileShape,coinShape:source.coinShape,shardShape:source.shardShape,
      elementBudget:0,elementSeed:857302,stage:{dread:this.boss ? .45 : 0}});
    view.motes=view.createParticleSystem(view.mobile?125:220);
    view.motion=new MotionArt(view);
    view.makeSkillSeals();
    view.ward=view.makeWard();
    const stage=new T.Group();
    const ground=new T.Mesh(new T.CircleGeometry(7,52).rotateX(-Math.PI/2),
      new T.MeshStandardMaterial({color:0x272533,roughness:.89,metalness:.19}));
    ground.position.y=-.031;
    stage.add(ground);
    for(const radius of [3.12,4.86,6.48]){
      const ring=new T.Mesh(new T.RingGeometry(radius-.018,radius,60).rotateX(-Math.PI/2),
        new T.MeshBasicMaterial({color:this.weapon?.tone??this.boss.tint,transparent:true,opacity:.20}));
      ring.position.y=-.016;
      stage.add(ring);
    }
    scene.add(stage);
    this.view=view;
    this.scene=scene;
    return view;
  }

  setActive(active){
    for(const control of this.controls)control.setAttribute('aria-pressed',String(control===active));
  }

  playBoss(action,control){
    this.clearScene();
    this.mode=action.phase?'phase':'attack';
    this.stage.dataset.preview=this.mode;
    this.setActive(control);
    this.zoomTools.hidden=true;
    const name=this.moveNames[action.pattern??this.boss.finishing];
    this.hint.textContent=action.phase?(action.phase===1?'第一階段':'第二階段'):name;
    this.detail.textContent=action.phase?`變身後出招 · ${name}`:name;
    const view=this.makeStage();
    this.practice=this.makeBossPractice(view,this.boss,action,phase=>{
      this.hint.textContent=phase===1?'第二階段 · 邪相現形':'第三階段 · 最後攻勢';
    });
    this.startPlayback();
  }

  play(kind){
    this.clearScene();
    this.mode=kind;
    this.stage.dataset.preview=kind;
    this.setActive(kind==='combo'?this.combo:this.skill);
    const view=this.makeStage();
    this.practice=this.makePractice(view,this.weapon,kind);
    this.hint.textContent='';
    this.detail.textContent=kind==='combo'?comboNames(this.weapon).join(' → '):this.weapon.skill+' · '+this.weapon.detail;
    this.startPlayback();
  }

  startPlayback(){
    this.resize();
    this.previous=performance.now();
    this.animate(this.previous);
  }

  animate(now){
    if(!this.open||!this.practice)return;
    const dt=Math.min(.05,(now-this.previous)/1000);
    this.previous=now;
    const active=this.practice.step(dt);
    const {view}=this;
    view.time+=dt;
    view.updateEffects(dt);
    view.renderParticles(dt,false);
    this.renderer.render(this.scene,battleCamera);
    view.motion.budget=0;
    view.elementBudget=0;
    if(active)this.raf=requestAnimationFrame(this.animate);
  }

  clearScene(){
    cancelAnimationFrame(this.raf);
    if(this.bossRig){
      this.bossRig.root.removeFromParent();
      removeBestiary(this.scene,this.bossRig);
      this.bossRig=null;
    }else if(this.item)disposeForge(this.item);
    this.item=null;
    if(this.view){
      const {view}=this;
      this.practice?.dispose();
      for(const fx of view.effects)view.release(fx);
      const geometries=new Set(),materials=new Set();
      view.scene.traverse(part=>{
        if(part.geometry&&!view.sharedPreviewGeometry(part.geometry))geometries.add(part.geometry);
        if(part.material)materials.add(part.material);
      });
      for(const geometry of Object.values(view.motion))if(geometry.isBufferGeometry)geometries.add(geometry);
      for(const geometry of view.motion.cleaves.values())geometries.add(geometry);
      geometries.forEach(geometry=>geometry.dispose());
      materials.forEach(material=>material.dispose());
    }
    this.view=null;
    this.practice=null;
    this.drag=null;
    this.scene=null;
  }

  clear(){
    this.clearScene();
    this.renderer?.renderLists.dispose();
  }
}
