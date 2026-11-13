import * as T from '../three.min.mjs';
import {armLighting,disposeForge,forge} from './armory.mjs?v=armory-art-1';
import {comboNames} from './weapon-combos.mjs?v=weapon-audit-1';
import {MotionArt} from './motion-art.mjs?v=weapon-audit-1';

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
    this.canvas=node('canvas','weapon-viewer-canvas');
    this.canvas.tabIndex=0;
    this.canvas.setAttribute('aria-label','神器模型。拖動或用方向鍵旋轉，Home 鍵重置視角。');
    this.stage.append(this.image,this.canvas,this.hint);
    this.inspect=button('旋轉睇模型',()=>this.showModel());
    this.combo=button('播放三段普攻',()=>this.play('combo'));
    this.skill=button('播放技能',()=>this.play('skill'));
    const tools=node('div','weapon-viewer-tools');
    tools.append(this.inspect,this.combo,this.skill);
    this.detail=node('p','weapon-viewer-description');
    this.choose=button('',()=>{
      const {weapon,commit}=this;
      this.dialog.close();
      commit(weapon);
    },'primary');
    const footer=node('footer','weapon-viewer-footer');
    footer.append(this.detail,this.choose);
    this.dialog.append(header,this.stage,tools,footer);
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
    this.clear();
    this.weapon=weapon;
    this.commit=commit;
    this.focusReturn=document.activeElement;
    this.title.textContent=weapon.name;
    this.role.textContent=weapon.role;
    this.choose.textContent='選擇'+weapon.name;
    this.dialog.style.setProperty('--preview-ink',weapon.ink);
    this.image.src=this.main.armIcons.get(weapon.id);
    this.canvas.hidden=false;
    this.dialog.showModal();
    try{
      this.renderer??=new T.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:!this.main.mobile,powerPreference:'low-power'});
    }catch{
      this.canvas.hidden=true;
      this.image.hidden=false;
      this.inspect.disabled=this.combo.disabled=this.skill.disabled=true;
      this.hint.textContent='3D 預覽暫未能載入';
      this.detail.textContent=weapon.skill+' · '+weapon.detail;
      return;
    }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.renderer.setClearColor(0,0);
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.18;
    this.canvas.hidden=false;
    this.image.hidden=true;
    this.inspect.disabled=this.combo.disabled=this.skill.disabled=false;
    this.showModel();
  }

  resize(){
    const width=this.stage.clientWidth,height=this.stage.clientHeight;
    if(!width||!height||!this.renderer)return;
    this.renderer.setSize(width,height,false);
    fit(inspectCamera,width,height,2.30,2.24);
    fit(battleCamera,width,height,Math.min(15.1,Math.max(10.8,7.2+this.weapon.range*.61)),7.6);
    if(this.mode==='model')this.renderer.render(this.scene,inspectCamera);
    else if(this.practice)this.renderer.render(this.scene,battleCamera);
  }

  turn(dx,dy){
    this.yaw+=dx;
    this.pitch=T.MathUtils.clamp(this.pitch+dy,-1.55,1.55);
    this.model.rotation.set(this.pitch,this.yaw,-tilt);
    this.renderer.render(this.scene,inspectCamera);
  }

  resetRotation(){
    this.yaw=-.37;
    this.pitch=-.13;
    this.turn(0,0);
  }

  showModel(){
    this.clearScene();
    this.mode='model';
    this.stage.dataset.preview='model';
    this.setActive(this.inspect);
    this.hint.textContent='拖動旋轉';
    this.detail.textContent=this.weapon.skill+' · '+this.weapon.detail;
    this.scene=new T.Scene();
    armLighting(this.scene);
    const pivot=new T.Group();
    this.model=pivot;
    const item=forge(this.weapon);
    const bounds=new T.Box3().setFromObject(item);
    const size=bounds.getSize(new T.Vector3());
    item.position.copy(bounds.getCenter(new T.Vector3()).negate());
    pivot.scale.setScalar(1.68/Math.hypot(size.x,size.y,size.z));
    pivot.add(item);
    this.scene.add(pivot);
    this.item=item;
    this.resize();
    this.resetRotation();
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
      elementBudget:0,elementSeed:857302,stage:{dread:0}});
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
        new T.MeshBasicMaterial({color:this.weapon.tone,transparent:true,opacity:.20}));
      ring.position.y=-.016;
      stage.add(ring);
    }
    scene.add(stage);
    this.view=view;
    this.scene=scene;
    return view;
  }

  setActive(active){
    for(const control of [this.inspect,this.combo,this.skill])control.setAttribute('aria-pressed',String(control===active));
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
    if(this.item)disposeForge(this.item);
    this.item=null;
    if(this.view){
      const {view}=this;
      this.practice.dispose();
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
