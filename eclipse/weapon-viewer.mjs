import * as T from '../three.min.mjs';
import {armLighting,disposeForge,forge} from './armory.mjs?v=relic-sculpts-1';
import {comboNames} from './weapon-combos.mjs?v=weapon-audit-1';
import {MotionArt} from './motion-art.mjs?v=nightforge-1';
import {mountBestiary,poseBestiary,removeBestiary} from './bestiary-models.mjs?v=chiaroscuro-1';
import {ArenaArt} from './arena-art.mjs?v=forge-1';
import {RoomCutaway} from './room-cutaway.mjs?v=world-3d-1';
import {RoomLandscape} from './room-landscapes.mjs?v=chiaroscuro-1';
import {monument} from './map-art.mjs?v=forge-1';
import {clientSpriteGuide,jushangImage,jushangReference,koreanTrialReference} from './jushang-references.mjs?v=pao-1';
import {spriteReferenceView} from './sprite-reference-view.mjs?v=forgelight-4';
import {lightPaoDisplay} from './pao-materials.mjs?v=nightforge-1';
import {paoForms} from './pao-model.mjs?v=chiaroscuro-1';

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
const floor=new T.Plane(new T.Vector3(0,1,0));
const cursor=new T.Vector2(), groundPoint=new T.Vector3(), ray=new T.Raycaster();
const drillKeys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

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
    close.addEventListener('pointerup',event=>{
      if(event.pointerType==='touch'&&document.elementFromPoint(event.clientX,event.clientY)===close){
        this.dialog.close();
      }
    });
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
    this.zoomOut.setAttribute('aria-label','縮小模型');
    this.zoomIn.setAttribute('aria-label','放大模型');
    this.zoomTools.append(this.zoomOut,this.zoomIn);
    this.viewAngles=node('div','model-view-angles');
    this.viewAngles.setAttribute('aria-label','模型角度');
    this.viewAngles.setAttribute('role','group');
    for(const [key,label,angle] of [['front','正面',-.47],['side','側面',1.10],['back','背面',2.68]]){
      const control=button(label,()=>{
        if(this.mode!=='model')return;
        this.yaw=angle;
        this.pitch=.12;
        this.turn(0,0);
      });
      control.dataset.viewAngle=key;
      this.viewAngles.append(control);
    }
    this.viewAngles.hidden=true;
    this.stage.append(this.image,this.canvas,this.hint,this.zoomTools,this.viewAngles);
    this.spriteReference=spriteReferenceView();
    const comparison=node('div','weapon-viewer-comparison');
    comparison.append(this.stage,this.spriteReference.root);
    this.inspect=button('旋轉睇模型',()=>this.showModel());
    this.combo=button('播放三段普攻',()=>this.play('combo'));
    this.skill=button('播放技能',()=>this.play('skill'));
    this.tools=node('div','weapon-viewer-tools');
    this.tools.append(this.inspect,this.combo,this.skill);
    this.drillTools=node('div','counter-drill-tools');
    const roll=button('翻滾',()=>{this.practice.controls.roll=true;});
    const interact=button('祭燈／機關',()=>{this.practice.controls.interact=true;});
    this.drillTools.append(roll,interact);
    this.stage.append(this.drillTools);
    this.weakness=node('section','boss-preview-weakness');
    this.attacks=node('div','boss-preview-attacks');
    this.attacks.setAttribute('role','group');
    this.attacks.setAttribute('aria-label','頭目攻擊預覽');
    this.motions=node('div','boss-preview-attacks pao-preview-motions');
    this.motions.setAttribute('role','group');
    this.motions.setAttribute('aria-label','破奧動作預覽');
    this.detail=node('p','weapon-viewer-description');
    const copy=node('div','weapon-viewer-copy');
    this.reference=node('a','weapon-viewer-reference','52 巨商原圖資料 ↗');
    this.reference.target='_blank';
    this.reference.rel='noopener noreferrer';
    this.koreanReference=node('a','weapon-viewer-reference','韓文原圖 ↗');
    this.koreanReference.target='_blank';
    this.koreanReference.rel='noopener noreferrer';
    copy.append(this.detail,this.reference,this.koreanReference);
    this.choose=button('',()=>{
      const {commit}=this;
      this.dialog.close();
      commit?.();
    },'primary');
    const footer=node('footer','weapon-viewer-footer');
    this.practiceChoice=button('配搭及練習',()=>{
      const action=this.practiceAction;
      this.dialog.close();
      action?.();
    });
    const actions=node('div','weapon-viewer-actions');
    actions.append(this.practiceChoice,this.choose);
    footer.append(copy,actions);
    this.dialog.append(header,comparison,this.tools,this.weakness,this.motions,this.attacks,footer);
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
      if(this.mode!=='drill'||!this.practice)return;
      const direction=drillKeys[event.code];
      if(direction){
        event.preventDefault();
        this.practice.controls.point=null;
        this.practice.controls.keys.add(direction);
      }
      if(event.code==='Space'&&event.target===this.canvas){event.preventDefault();this.practice.controls.roll=true;}
      if(event.code==='KeyE')this.practice.controls.interact=true;
    });
    this.dialog.addEventListener('keyup',event=>this.practice?.controls?.keys.delete(drillKeys[event.code]));
    this.dialog.addEventListener('focusout',event=>{
      if(!this.dialog.contains(event.relatedTarget))this.practice?.controls?.keys.clear();
    });
    this.canvas.addEventListener('pointerdown',event=>{
      if(!['model','drill'].includes(this.mode)||this.drag||event.button!==0)return;
      this.drag={id:event.pointerId,x:event.clientX,y:event.clientY};
      this.canvas.setPointerCapture(event.pointerId);
      if(this.mode==='drill'){
        this.canvas.focus({preventScroll:true});
        this.pointAt(event);
      }
    });
    this.canvas.addEventListener('pointermove',event=>{
      if(this.drag?.id!==event.pointerId)return;
      if(this.mode==='drill'){this.pointAt(event);return;}
      this.turn((event.clientX-this.drag.x)*.014,(event.clientY-this.drag.y)*.012);
      this.drag.x=event.clientX;
      this.drag.y=event.clientY;
    });
    this.canvas.addEventListener('wheel',event=>{
      if(!this.boss||this.mode!=='model'||!event.deltaY)return;
      event.preventDefault();
      this.zoom(event.deltaY<0?1.18:1/1.18);
    },{passive:false});
    for(const name of ['pointerup','pointercancel','lostpointercapture']){
      this.canvas.addEventListener(name,event=>{
        if(this.drag?.id!==event.pointerId)return;
        this.drag=null;
        if(name==='pointercancel'&&this.mode==='drill')this.practice.controls.point=null;
      });
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

  pointAt(event){
    const bounds=this.canvas.getBoundingClientRect();
    cursor.set((event.clientX-bounds.left)/bounds.width*2-1,1-(event.clientY-bounds.top)/bounds.height*2);
    ray.setFromCamera(cursor,battleCamera);
    if(ray.ray.intersectPlane(floor,groundPoint))this.practice.controls.point={x:groundPoint.x,z:groundPoint.z};
  }

  show(weapon,commit){
    this.boss=null;
    this.weapon=weapon;
    this.phaseControls?.forEach(control=>control.remove());
    this.phaseControls=[];
    this.attackControls=[];
    this.attacks.replaceChildren();
    this.inspect.textContent='旋轉睇模型';
    this.openViewer({title:weapon.name,role:weapon.role,ink:weapon.ink,choice:'選擇'+weapon.name,
      image:this.main.armIcons.get(weapon.id),description:weapon.skill+' · '+weapon.detail,commit:commit&&(()=>commit(weapon)),
      compare:!!commit});
  }

  showBoss(dossier,names,makePractice,commit,practice){
    const {spec,entry,weakness}=dossier;
    this.dossier=dossier;
    this.boss=spec;
    this.weapon=null;
    this.moveNames={...names,...spec.moveLabels};
    const model=spec.bestiary??spec.model;
    this.motionNames=model?{
      entrance:'出場',travel:model.id==='m026'?'落地步行':paoForms.has(model.id)?'低空飛行':
        ['dragon','bird','wasp'].includes(model.family)?'飛行':'移動',hit:'受擊',defeat:'倒地',
    }:null;
    this.motions.replaceChildren(...Object.entries(this.motionNames??{}).map(([motion,label])=>{
      const control=button(label,()=>this.playBoss({motion},control));
      control.dataset.motion=motion;
      return control;
    }));
    this.makeBossPractice=makePractice;
    this.inspect.textContent=spec.bestiary||spec.model?'旋轉睇模型':'睇頭目';
    this.phaseControls?.forEach(control=>control.remove());
    this.phaseControls=spec.phases.map((_,index)=>{
      const control=button(index===0?'二段變身':'三段變身',()=>this.playBoss({phase:index+1},control));
      control.dataset.phase=String(index+1);
      return control;
    });
    this.tools.append(...this.phaseControls);
    this.weakness.replaceChildren();
    for(const [index,profile] of [weakness,...(weakness.last?[weakness.last]:[])].entries()){
      const row=node('div','boss-weakness-row');
      const copy=node('div');
      const label=index===0?'弱點':'第三階段弱點';
      copy.append(node('strong','',label+' · '+profile.name),node('p','',profile.hint));
      const control=button('試反制',()=>this.playBoss({phase:index+1,drill:true},control));
      control.dataset.drill=String(index+1);
      row.append(copy,control);
      this.weakness.append(row);
    }
    this.attackControls=spec.attacks.map(pattern=>{
      const control=button(this.moveNames[pattern],()=>this.playBoss({pattern},control));
      control.dataset.attack=pattern;
      return control;
    });
    this.attacks.replaceChildren(...this.attackControls);
    this.openViewer({title:entry.name,role:entry.floor?'主線頭目 · 第 '+entry.floor+' 關':'頭目預覽',ink:new T.Color(spec.tint).getStyle(),
      choice:'挑戰此頭目',description:spec.signature,commit,practice});
  }

  get controls(){return [this.inspect,this.combo,this.skill,...this.phaseControls,...this.attackControls,
    ...this.motions.querySelectorAll('button'),
    ...(this.boss?this.weakness.querySelectorAll('button'):[])];}

  openViewer({title,role,choice,ink,image,description,commit,practice,compare=false}){
    this.clear();
    this.commit=commit;
    this.practiceAction=practice;
    this.practiceChoice.hidden=!practice;
    this.description=description;
    const entry=this.boss?this.dossier.entry:null;
    const reference=compare?jushangReference(this.weapon,entry):null;
    this.spriteReference.root.hidden=!compare;
    this.spriteReference.setReference(compare?jushangImage(this.weapon,entry):null,compare?clientSpriteGuide(this.weapon,entry):null);
    this.reference.hidden=!reference;
    if(reference)this.reference.href=reference;
    else this.reference.removeAttribute('href');
    const korean=compare?koreanTrialReference(entry):null;
    this.koreanReference.hidden=!korean;
    if(korean)this.koreanReference.href=korean;
    else this.koreanReference.removeAttribute('href');
    this.focusReturn=document.activeElement;
    this.title.textContent=title;
    this.role.textContent=role;
    this.choose.textContent=choice;
    this.choose.hidden=!commit;
    this.dialog.dataset.subject=this.boss?'boss':'weapon';
    this.dialog.classList.toggle('pao-viewer',paoForms.has(this.boss?.bestiary?.id));
    this.dialog.style.setProperty('--preview-ink',ink);
    this.combo.hidden=this.skill.hidden=!!this.boss;
    this.attacks.hidden=!this.boss;
    this.motions.hidden=!this.boss||!this.motionNames;
    this.weakness.hidden=!this.boss;
    this.drillTools.hidden=true;
    if(image)this.image.src=image;
    else this.image.removeAttribute('src');
    this.canvas.hidden=false;
    this.zoomTools.hidden=true;
    this.dialog.showModal();
    try{
      this.renderer??=new T.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    }catch{
      this.canvas.hidden=true;
      this.image.hidden=!image;
      for(const control of this.controls)control.disabled=true;
      this.hint.textContent='3D 預覽暫未能載入';
      this.detail.textContent=description;
      return;
    }
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
    const limit=this.main.mobile?(this.mode==='model'?1.6:1.25):1.7;
    const pixelRatio=Math.min(devicePixelRatio,limit);
    if(this.renderer.getPixelRatio()!==pixelRatio)this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width,height,false);
    const pao=paoForms.has(this.boss?.bestiary?.id);
    this.viewAngles.hidden=this.mode!=='model';
    fit(inspectCamera,width,height,pao?2.03:this.wideModel?2.82:2.30,pao?1.98:2.24);
    const arena=['phase','drill'].includes(this.mode);
    const battleWidth=arena?23:pao?16.4:this.boss?14.4:Math.min(15.1,Math.max(10.8,7.2+this.weapon.range*.61));
    fit(battleCamera,width,height,battleWidth,arena?13:pao?10.3:this.boss?8.4:7.6);
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
    const mounted=Boolean(this.bossRig?.mount)||this.bossRig?.entry.family==='rider';
    const low=this.bossRig&&['bulwark','crawl'].includes(this.bossRig.pattern);
    const pao=this.bossRig?.pao;
    this.yaw=pao?(pao.awakened?-.61:-1.02):mounted?-1.18:low?-.71:this.boss?-.53:-.37;
    this.pitch=pao?.15:mounted?.10:low?.35:this.boss?.16:-.09;
    this.setZoom(pao?1.07:1);
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
    const model=this.boss?.bestiary??this.boss?.model;
    if(this.boss&&!model){this.playBoss({portrait:true},this.inspect);return;}
    this.clearScene();
    this.mode='model';
    this.stage.dataset.preview='model';
    this.setActive(this.inspect);
    this.hint.textContent='拖動旋轉';
    this.canvas.setAttribute('aria-label','3D 模型。拖動或用方向鍵旋轉，Home 鍵重置視角。');
    this.zoomTools.hidden=false;
    this.drillTools.hidden=true;
    this.detail.textContent=this.description;
    this.scene=new T.Scene();
    const pao=paoForms.has(this.boss?.bestiary?.id);
    if(pao)lightPaoDisplay(this.scene);
    else armLighting(this.scene);
    const pivot=new T.Group();
    this.model=pivot;
    let item;
    if(this.boss){
      this.bossRig=mountBestiary(this.scene,model,this.boss.height,this.main.mobile);
      const actor={phase:0,move:0,face:1,spec:this.boss};
      poseBestiary(this.bossRig,actor,{phase:0},0,0,0);
      item=this.bossRig.root;
      this.displayActor=actor;
    }else item=forge(this.weapon);
    const bounds=new T.Box3().setFromObject(item);
    const size=bounds.getSize(new T.Vector3());
    if(this.boss){
      const origin=new T.Group();
      origin.position.copy(bounds.getCenter(new T.Vector3())).negate();
      origin.add(item);
      pivot.add(origin);
    }else{
      item.position.sub(bounds.getCenter(new T.Vector3()));
      pivot.add(item);
    }
    const wings=this.bossRig?.flight||this.bossRig?.signature?.type==='phoenix';
    this.wideModel=Boolean(wings);
    const displaySize=this.boss?(pao?2.13:wings?2.63:1.99):1.87;
    const diameter=this.boss?Math.max(size.x,size.y,size.z):size.length();
    pivot.scale.setScalar(displaySize/diameter);
    this.scene.add(pivot);
    this.item=item;
    this.resetRotation();
    this.resize();
    if(this.displayActor&&!reducedMotion.matches){
      const start=performance.now();
      const update=now=>{
        if(!this.open||this.mode!=='model'||!this.displayActor||reducedMotion.matches)return;
        poseBestiary(this.bossRig,this.displayActor,{phase:0},(now-start)/1000,0,0);
        this.renderer.render(this.scene,inspectCamera);
        this.raf=requestAnimationFrame(update);
      };
      this.raf=requestAnimationFrame(update);
    }
  }

  makeStage(){
    const source=this.main;
    const view=Object.create(Object.getPrototypeOf(source));
    const scene=new T.Scene();
    const arena=['phase','drill'].includes(this.mode);
    const room=arena?this.dossier.stage:null;
    if(paoForms.has(this.boss?.bestiary?.id))lightPaoDisplay(scene);
    else armLighting(scene,arena);
    battleCamera.position.set(.8,arena?16:9.2,arena?21:15);
    if(arena)battleCamera.lookAt(0,.3,1.25);
    else battleCamera.lookAt(aim);
    battleCamera.updateMatrixWorld(true);
    const axis=new T.Vector3(0,1,0).applyQuaternion(battleCamera.quaternion);
    Object.assign(view,{scene,renderer:this.renderer,camera:battleCamera,cameraUp:axis,mobile:source.mobile,
      atlas:source.atlas,halo:source.halo,shadow:source.shadow,battleTextures:source.battleTextures,
      sigilTextures:source.sigilTextures,ring:source.ring,disc:source.disc,effects:[],time:0,shake:0,
      projectileShape:source.projectileShape,coinShape:source.coinShape,shardShape:source.shardShape,
      elementBudget:0,elementSeed:857302,stage:room??{dread:this.boss ? .45 : 0}});
    view.motes=view.createParticleSystem(view.mobile?125:220);
    view.motion=new MotionArt(view);
    view.makeSkillSeals();
    view.ward=view.makeWard();
    const stage=new T.Group();
    if(arena){
      view.cutaway=new RoomCutaway();
      view.sight=new T.Vector3();
      view.darkLights=scene.children.filter(node=>node.isLight).map(light=>[light,light.intensity]);
      view.landscape=new RoomLandscape(view,view.cutaway);
      view.landscape.set(room);
      view.arenaArt=new ArenaArt(view);
      for(const prop of room.props)stage.add(monument(view,prop,this.boss.tint));
      view.cutaway.cover(stage);
    }else{
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
    this.mode=action.drill?'drill':action.phase?'phase':action.portrait?'portrait':'attack';
    this.stage.dataset.preview=this.mode;
    this.setActive(control);
    this.zoomTools.hidden=true;
    this.drillTools.hidden=!action.drill;
    const mechanism=action.phase===2?this.dossier.layout.last??this.dossier.layout:this.dossier.layout;
    this.drillTools.lastElementChild.hidden=!['break','light'].includes(mechanism.mode);
    this.drillTools.lastElementChild.textContent=mechanism.mode==='light'?'重燃祭燈':'擊碎機關';
    this.canvas.setAttribute('aria-label',action.drill?'反制練習場。點按、拖動或用方向鍵移動。':'頭目動畫預覽');
    const name=action.motion?this.motionNames[action.motion]:this.moveNames[action.pattern??this.boss.finishing];
    this.hint.textContent=action.phase?(action.phase===1?'第一階段':'第二階段'):(name??'');
    this.detail.textContent=action.drill?(this.main.mobile?'點按或拖住場地走位，撳「翻滾」閃開。':'點按或拖動場地走位 · 方向鍵移動 · Space 翻滾 · E 操作機關')
      :action.phase?`變身後出招 · ${name}`:action.portrait?this.description:name;
    const view=this.makeStage();
    const seed=this.bossSeed??=Math.floor(Math.random()*0x100000000);
    this.practice=this.makeBossPractice(view,this.dossier,{seed,...action},{
      phase:(phase,title)=>{this.hint.textContent=`${phase===1?'第二階段':'第三階段'} · ${title}`;},
      status:(message,done)=>{
        this.hint.textContent=message;
        this.stage.classList.toggle('counter-success',done);
        if(done)control.textContent='再試一次';
      },
    });
    this.startPlayback();
  }

  play(kind){
    this.clearScene();
    this.mode=kind;
    this.stage.dataset.preview=kind;
    this.zoomTools.hidden=true;
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
    const dt=T.MathUtils.clamp((now-this.previous)/1000,0,.05);
    this.previous=now;
    const active=dt>0&&this.practice.step(dt);
    const {view}=this;
    view.time+=dt;
    view.updateEffects(dt);
    view.renderParticles(dt,false);
    if(view.arenaArt){
      const {hero}=this.practice;
      const darkness=view.arenaArt.arena?.darkness??0;
      view.arenaArt.render(view.time);
      for(const [light,intensity] of view.darkLights)light.intensity=intensity*(1-darkness*.52);
      view.sight.set(0,0,1).applyQuaternion(battleCamera.quaternion);
      view.cutaway.place(hero.x,hero.z,view.sight);
      view.landscape.light(darkness);
      view.landscape.tick(view.time,hero,darkness);
    }
    this.renderer.render(this.scene,battleCamera);
    view.motion.budget=0;
    view.elementBudget=0;
    if(active||dt===0)this.raf=requestAnimationFrame(this.animate);
  }

  clearScene(){
    cancelAnimationFrame(this.raf);
    this.viewAngles.hidden=true;
    this.displayActor=null;
    this.stage.classList.remove('counter-success');
    for(const control of this.weakness.querySelectorAll('[data-drill]'))control.textContent='試反制';
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
      view.landscape?.clear();
      const geometries=new Set(),materials=new Set();
      view.scene.traverse(part=>{
        if(part.isInstancedMesh)part.dispose();
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
    this.spriteReference.setReference(null);
    this.bossSeed=null;
    this.renderer?.renderLists.dispose();
  }
}
