import {t as textForLocale} from './locale.mjs';
import * as T from '../three.min.mjs';
import {armLighting,borrowForge,recycleForge,retainedForge} from './armory.mjs?v=emberlight-1';
import {comboNames,skillLinks} from './weapon-combos.mjs?v=weapon-audit-1';
import {MotionArt} from './motion-art.mjs?v=clear-sight-1';
import {mountBestiary,poseBestiary,removeBestiary} from './bestiary-models.mjs?v=boss-foundry-1';
import {ArenaArt} from './arena-art.mjs?v=forge-1';
import {RoomCutaway} from './room-cutaway.mjs?v=world-3d-1';
import {RoomLandscape} from './room-landscapes.mjs?v=clear-sight-1';
import {CombatFeedback} from './combat-feedback.mjs?v=afterglow-1';
import {SpellLighting} from './spell-lighting.mjs?v=forgeburst-1';
import {monument} from './map-art.mjs?v=forge-1';
import {lightPaoDisplay} from './pao-materials.mjs?v=nightforge-1';
import {frameWardenShot,wardenShotMix} from './warden-transformation.mjs';
import {moonSlashPattern} from './warden-moon-slash.mjs';
import {moonPincerPreview} from './warden-moon-assist.mjs';
import {wardenReinforcementSpecs,wardenSummonPattern} from './warden-reinforcements.mjs';
const paoForms=new Set();

function node(tag,kind,text){
  const element=document.createElement(tag);
  if(kind)element.className=kind;
  if(text)element.textContent=textForLocale(text);
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
const previewFocus=new T.Vector3();
const afterPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const studioCamera=new T.OrthographicCamera(-2,2,2,-2,.1,40);
studioCamera.position.z=8;

function studioBounds(root){
  const bounds=new T.Box3();
  root.updateMatrixWorld(true);
  root.traverseVisible(part=>{
    if(!part.isMesh||!part.visible||part.material.transparent) return;
    const {geometry}=part;
    if(!geometry.boundingBox)geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox.clone().applyMatrix4(part.matrixWorld));
  });
  return bounds.isEmpty()?new T.Box3().setFromObject(root):bounds;
}

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
    this.hint.setAttribute('aria-live','polite');
    this.canvas=node('canvas','weapon-viewer-canvas');
    this.canvas.tabIndex=0;
    this.studioReady=new WeakSet();
    this.canvas.addEventListener('webglcontextrestored',()=>{this.studioReady=new WeakSet();});
    this.canvas.setAttribute('aria-label',textForLocale('3D 模型。拖動或用方向鍵旋轉，Home 鍵重置視角。'));
    this.zoomTools=node('div','model-zoom');
    this.zoomOut=button('−',()=>this.zoom(1/1.18));
    this.zoomIn=button('＋',()=>this.zoom(1.18));
    this.zoomOut.setAttribute('aria-label',textForLocale('縮小模型'));
    this.zoomIn.setAttribute('aria-label',textForLocale('放大模型'));
    this.faceZoom=button('面部',()=>{
      if(this.mode!=='model'||!this.bossRig)return;
      this.closeUp=!this.closeUp;
      this.faceZoom.setAttribute('aria-pressed',String(this.closeUp));
      this.resize();
    });
    this.faceZoom.classList.add('boss-face-zoom');
    this.faceZoom.setAttribute('aria-label',textForLocale('切換面部近鏡'));
    this.faceZoom.setAttribute('aria-pressed','false');
    this.faceZoom.hidden=true;
    this.zoomTools.append(this.faceZoom,this.zoomOut,this.zoomIn);
    this.viewAngles=node('div','model-view-angles');
    this.viewAngles.setAttribute('aria-label',textForLocale('模型角度'));
    this.viewAngles.setAttribute('role','group');
    for(const [key,label,angle] of [['front','正面',0],['side','側面',Math.PI/2],['back','背面',Math.PI]]){
      const control=button(label,()=>{
        if(this.mode!=='model')return;
        this.yaw=angle-(this.bossRig?.heading??.47);
        this.pitch=this.bossRig?.095:.12;
        this.turn(0,0);
      });
      control.dataset.viewAngle=key;
      this.viewAngles.append(control);
    }
    this.viewAngles.hidden=true;
    this.stage.append(this.image,this.canvas,this.hint,this.zoomTools,this.viewAngles);
    this.inspect=button('旋轉睇模型',()=>this.showModel());
    this.armour=button('裂甲造型',()=>this.showModel(1));
    this.moon=button('斷冠造型',()=>this.showModel(2));
    this.moon.hidden=this.armour.hidden=true;
    this.combo=button('播放三段普攻',()=>this.play('combo'));
    this.skill=button('播放技能',()=>this.play('skill'));
    this.tools=node('div','weapon-viewer-tools');
    this.tools.append(this.inspect,this.armour,this.moon,this.combo,this.skill);
    this.drillTools=node('div','counter-drill-tools');
    this.drillRoll=button('翻滾',()=>{if(this.practice)this.practice.controls.roll=true;});
    this.drillInteract=button('祭燈／機關',()=>{if(this.practice)this.practice.controls.interact=true;});
    this.drillHeavy=button('重擊',()=>{if(this.practice)this.practice.controls.heavy=true;});
    this.drillStart=button('開始練習',()=>{
      this.practice?.start?.();
      this.resumePlayback();
      this.canvas.focus({preventScroll:true});
    },'primary');
    this.drillTools.append(this.drillRoll,this.drillInteract,this.drillHeavy,this.drillStart);
    this.stage.append(this.drillTools);
    this.pincerTools=node('section','pincer-exercise');
    this.pincerTools.hidden=true;
    this.pincerEntry=button('試反制',()=>this.playBoss({
      pattern:moonPincerPreview,pincerDrill:{floor:this.pincerChoices[0].sourceFloor,mode:'roll'},
    },this.pincerEntry));
    this.pincerEntry.dataset.pincerDrill='';
    this.pincerOptions=node('div','pincer-options');
    this.pincerRoster=node('div','pincer-roster');
    this.pincerRoster.setAttribute('role','group');
    this.pincerRoster.setAttribute('aria-label',textForLocale('選擇殘影'));
    this.pincerModes=node('div','pincer-modes');
    this.pincerModes.setAttribute('role','group');
    this.pincerModes.setAttribute('aria-label',textForLocale('選擇練習'));
    this.pincerMove=node('p','pincer-move');
    this.pincerOptions.append(this.pincerRoster,this.pincerModes,this.pincerMove);
    this.pincerTools.append(this.pincerEntry,this.pincerOptions);
    this.weakness=node('section','boss-preview-weakness');
    this.attacks=node('div','boss-preview-attacks');
    this.attacks.setAttribute('role','group');
    this.attacks.setAttribute('aria-label',textForLocale('頭目攻擊預覽'));
    this.motions=node('div','boss-preview-attacks boss-preview-motions');
    this.motions.setAttribute('role','group');
    this.motions.setAttribute('aria-label',textForLocale('頭目動作預覽'));
    this.detail=node('p','weapon-viewer-description');
    this.notes=node('details','weapon-notes');
    this.choose=button('',()=>{
      const {commit}=this;
      this.dialog.close();
      this.clearScene();
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
    footer.append(this.detail,actions);
    this.dialog.append(header,this.stage,this.pincerTools,this.tools,this.weakness,this.motions,this.attacks,this.notes,footer);
    document.getElementById('game').append(this.dialog);
    this.dialog.addEventListener('close',()=>{
      if(this.dialog.open)return;
      this.clear();
      if(this.focusReturn?.isConnected&&!this.focusReturn.closest('[hidden]')){
        this.focusReturn.focus({preventScroll:true});
      }
      this.focusReturn=null;
      this.queueStudioWarmup();
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
      if(event.code==='KeyE'&&!this.pincerSettings)this.practice.controls.interact=true;
      if(event.code==='KeyJ'&&this.pincerSettings&&!event.repeat){
        event.preventDefault();
        this.practice.controls.heavy=true;
      }
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
        this.drag.point=this.pointAt(event);
        this.drag.started=event.timeStamp;
        this.drag.touch=event.pointerType==='touch';
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
        if(name==='pointerup'&&this.mode==='drill'&&this.pincerSettings&&this.drag.touch
            &&event.timeStamp-this.drag.started<=175&&Math.hypot(event.clientX-this.drag.x,event.clientY-this.drag.y)>=33){
          const point=this.pointAt(event),start=this.drag.point;
          if(point&&start){
            const gap=Math.hypot(point.x-start.x,point.z-start.z);
            if(gap>.03)Object.assign(this.practice.controls,{roll:true,point:null,
              rollVector:{x:(point.x-start.x)/gap,z:(point.z-start.z)/gap}});
          }
        }
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
    if(ray.ray.intersectPlane(floor,groundPoint))return this.practice.controls.point={x:groundPoint.x,z:groundPoint.z};
  }

  show(weapon,commit){
    this.boss=null;
    this.weapon=weapon;
    this.phaseControls?.forEach(control=>control.remove());
    this.phaseControls=[];
    this.attackControls=[];
    this.attacks.replaceChildren();
    this.inspect.textContent=textForLocale('旋轉睇模型');
    const notes=node('dl');
    const link=skillLinks[weapon.id];
    for(const [label,text] of [['普攻連段',comboNames(weapon).join(' → ')+'。'+weapon.basic],
      [weapon.skill,weapon.detail],[link?.name,link?.detail],['專屬祝福',weapon.blessing?weapon.blessing.name+' · '+weapon.blessing.detail:null]]){
      if(!label||!text)continue;
      const row=node('div');row.append(node('dt','',label),node('dd','',text));notes.append(row);
    }
    this.notes.replaceChildren(node('summary','','招式與祝福'),notes);
    this.openViewer({title:weapon.name,role:weapon.role,ink:weapon.ink,choice:'選擇'+weapon.name,
      image:this.main.armIcons.get(weapon.id),description:weapon.skill+' · '+weapon.detail,commit:commit&&(()=>commit(weapon))});
  }

  showBoss(dossier,names,makePractice,commit,practice){
    const {spec,entry,weakness}=dossier;
    this.dossier=dossier;
    this.boss=spec;
    this.weapon=null;
    this.moveNames={...names,...spec.moveLabels};
    const model=spec.bestiary??spec.model;
    this.motionNames=model?{
      entrance:'出場',travel:['dragon','bird','wasp'].includes(model.family)?'飛行':'移動',hit:'受擊',defeat:'倒地',
    }:null;
    this.motions.replaceChildren(...Object.entries(this.motionNames??{}).map(([motion,label])=>{
      const control=button(label,()=>this.playBoss({motion},control));
      control.dataset.motion=motion;
      return control;
    }));
    this.makeBossPractice=makePractice;
    this.inspect.textContent=textForLocale(spec.phaseTransition?'銀輝造型':spec.bestiary||spec.model?'旋轉睇模型':'睇頭目');
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
    const attacks=spec.finalWarden?[...spec.attacks,moonSlashPattern,moonPincerPreview,wardenSummonPattern]:spec.attacks;
    this.attackControls=attacks.map(pattern=>{
      const control=button(this.moveNames[pattern],()=>this.playBoss({pattern},control));
      control.dataset.attack=pattern;
      return control;
    });
    this.attacks.replaceChildren(...this.attackControls);
    if(spec.finalWarden)this.preparePincerControls(wardenReinforcementSpecs(dossier.stage.difficulty));
    this.openViewer({title:entry.name,role:entry.floor?'主線頭目 · 第 '+entry.floor+' 關':'頭目預覽',ink:new T.Color(spec.tint).getStyle(),
      choice:'挑戰此頭目',description:spec.signature,commit,practice});
  }

  get controls(){return [this.inspect,this.armour,this.moon,this.combo,this.skill,...this.phaseControls,...this.attackControls,
    ...this.motions.querySelectorAll('button'),
    ...(this.boss?this.weakness.querySelectorAll('button'):[])];}

  openViewer({title,role,choice,ink,image,description,commit,practice}){
    this.clear();
    this.commit=commit;
    this.practiceAction=practice;
    this.practiceChoice.hidden=!practice;
    this.description=description;
    this.focusReturn=document.activeElement;
    this.title.textContent=textForLocale(title);
    this.role.textContent=textForLocale(role);
    this.choose.textContent=textForLocale(choice);
    this.choose.hidden=!commit;
    this.dialog.dataset.subject=this.boss?'boss':'weapon';
    this.dialog.classList.toggle('warden-viewer',!!this.boss?.phaseTransition);
    this.dialog.classList.toggle('pao-viewer',paoForms.has(this.boss?.bestiary?.id));
    this.dialog.style.setProperty('--preview-ink',ink);
    this.combo.hidden=this.skill.hidden=!!this.boss;
    this.armour.hidden=!this.boss?.phaseTransition;
    this.moon.hidden=!this.boss?.phaseTransition?.[1];
    this.notes.hidden=!!this.boss;this.notes.open=false;
    this.attacks.hidden=!this.boss;
    this.motions.hidden=!this.boss||!this.motionNames;
    this.weakness.hidden=!this.boss;
    this.drillTools.hidden=true;
    if(image)this.image.src=image;
    else this.image.removeAttribute('src');
    this.canvas.hidden=true;
    this.image.hidden=!image;
    this.zoomTools.hidden=true;
    this.dialog.showModal();
    for(const control of this.controls)control.disabled=false;
    this.showModel();
  }

  studioRenderer(){
    if(this.renderer)return this.renderer;
    try{
      this.renderer=new T.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    }catch{return null;}
    this.renderer.setClearColor(0,0);
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.18;
    return this.renderer;
  }

  watchSelection(content,choices,findWeapon){
    this.stopSelection();
    const selection={content,queue:[...choices],seen:new Set(choices.map(weapon=>weapon.id))};
    this.selection=selection;
    const observe=()=>{
      for(const button of content.querySelectorAll('[data-arm-choice]')){
        if(!selection.observed.has(button)){
          selection.observed.add(button);
          selection.cards.observe(button);
        }
      }
    };
    selection.observed=new WeakSet();
    selection.cards=new IntersectionObserver(entries=>{
      // A catalogue can have dozens of rows. Only warm cards the player can see.
      for(const entry of entries)if(entry.isIntersecting){
        const weapon=findWeapon(entry.target.dataset.armChoice);
        if(weapon&&!selection.seen.has(weapon.id)&&selection.queue.length<3){
          selection.seen.add(weapon.id);
          selection.queue.push(weapon);
        }
      }
      this.queueStudioWarmup();
    },{threshold:.55});
    selection.dom=new MutationObserver(observe);
    selection.dom.observe(content,{childList:true,subtree:true});
    observe();
    this.queueStudioWarmup();
  }

  stopSelection(){
    this.selection?.dom.disconnect();
    this.selection?.cards.disconnect();
    this.selection=null;
  }

  queueStudioWarmup(){
    const selection=this.selection;
    if(this.open||this.studioWarmup||!selection?.queue.length||selection.scheduled)return;
    selection.scheduled=true;
    const run=()=>{
      selection.scheduled=false;
      if(this.open||this.selection!==selection||!selection.content.isConnected||this.studioWarmup)return;
      const weapon=selection.queue.shift();
      const renderer=this.studioRenderer();
      if(!renderer)return;
      if(this.studioReady.has(retainedForge(weapon))){
        this.queueStudioWarmup();
        return;
      }
      const job={weapon};
      this.studioWarmup=job;
      job.promise=this.warmWeapon(renderer,job,selection)
        .catch(error=>console.warn('Weapon preview preparation deferred',error))
        .finally(()=>{
          this.studioWarmup=null;
          this.queueStudioWarmup();
        });
    };
    // Wait for the cards to paint, then use one idle turn per model.
    afterPaint().then(()=>{
      if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:220});
      else setTimeout(run,0);
    });
  }

  async warmWeapon(renderer,job,selection){
    const item=borrowForge(job.weapon);
    const scene=new T.Scene();
    armLighting(scene);
    item.traverseVisible(part=>{
      if(part.geometry&&!part.geometry.boundingBox)part.geometry.computeBoundingBox();
    });
    scene.add(item);
    try{
      await renderer.compileAsync(scene,studioCamera);
      if(this.modelLoading?.weapon!==job.weapon&&(this.open||this.selection!==selection))return;
      renderer.render(scene,studioCamera);
      this.studioReady.add(item);
    }finally{
      recycleForge(item);
      renderer.renderLists.dispose();
      renderer.info.reset();
    }
  }

  showCanvas(){
    if(!this.studioRenderer()){
      this.canvas.hidden=true;
      for(const control of this.controls)control.disabled=true;
      this.hint.textContent=textForLocale('3D 預覽暫未能載入');
      return false;
    }
    this.canvas.hidden=false;
    this.image.hidden=true;
    return true;
  }

  resize(){
    const width=this.stage.clientWidth,height=this.stage.clientHeight;
    if(!width||!height||!this.renderer||!this.scene)return;
    const limit=this.main.mobile?(this.mode==='model'?1.6:1.25):1.7;
    const pixelRatio=Math.min(devicePixelRatio,limit);
    if(this.renderer.getPixelRatio()!==pixelRatio)this.renderer.setPixelRatio(pixelRatio);
    if(this.width!==width||this.height!==height){
      this.renderer.setSize(width,height,false);
      this.width=width;
      this.height=height;
    }
    const pao=paoForms.has(this.boss?.bestiary?.id);
    this.viewAngles.hidden=this.mode!=='model';
    fit(inspectCamera,width,height,this.closeUp?.93:pao?2.03:this.wideModel?2.82:2.30,
      this.closeUp?1.57:pao?1.98:2.24);
    const arena=!!this.view?.arenaArt;
    const vault=this.boss?.model?.artId==='forest-5';
    const battleWidth=arena?23:vault?17.2:pao?16.4:this.boss?14.4:Math.min(15.1,Math.max(10.8,7.2+this.weapon.range*.61));
    const jade=this.boss?.bestiary?.id==='m133';
    const battleHeight=arena?13:pao?10.3:jade?9.9:this.boss?8.4:7.6;
    const bossHeight=this.chapterPreviewHeight;
    fit(battleCamera,width,height,battleWidth,Math.max(battleHeight,bossHeight?bossHeight*2+(arena?10.3:2.9):0));
    if(this.mode==='model')this.requestModelFrame();
    else if(this.practice)this.renderer.render(this.scene,battleCamera);
  }

  turn(dx,dy){
    this.yaw+=dx;
    this.pitch=T.MathUtils.clamp(this.pitch+dy,-1.55,1.55);
    this.model.rotation.set(this.pitch,this.yaw,this.boss?-.04:-tilt);
    this.requestModelFrame(true);
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
    this.requestModelFrame();
  }

  setZoom(value){
    inspectCamera.zoom=T.MathUtils.clamp(value,.75,1.8);
    inspectCamera.updateProjectionMatrix();
    this.zoomOut.disabled=inspectCamera.zoom<=.75;
    this.zoomIn.disabled=inspectCamera.zoom>=1.8;
  }

  requestModelFrame(refreshEnergy=false){
    this.refreshEnergy ||= refreshEnergy;
    if(this.modelFrame)return;
    this.modelFrame=requestAnimationFrame(()=>{
      this.modelFrame=0;
      if(this.open&&this.mode==='model')this.renderModel();
    });
  }

  renderModel(){
    const rig=this.bossRig;
    if(this.refreshEnergy)rig?.aura.update(this.modelTime,this.modelPhase,0,0,0,0);
    this.refreshEnergy=false;
    cancelAnimationFrame(this.modelFrame);
    this.modelFrame=0;
    if(this.closeUp&&rig){
      const focus=rig.portraitHead??rig.mount?.helm??(this.modelPhase&&rig.armouredForm?rig.head:rig.inspectionHead)??rig.head??rig.heads?.[0]
        ??rig.body.userData.inspectionHead??rig.body.userData.dragonHead??rig.body;
      focus.getWorldPosition(previewFocus);
      inspectCamera.position.set(previewFocus.x,previewFocus.y+.045,8);
    }else{
      inspectCamera.position.set(0,this.boss?.10:0,8);
    }
    this.renderer.render(this.scene,inspectCamera);
    if(this.weapon&&this.item)this.studioReady.add(this.item);
  }

  showModel(phase=0){
    const model=this.boss?.bestiary??this.boss?.model;
    if(this.boss&&!model){this.playBoss({portrait:true},this.inspect);return;}
    this.clearScene();
    this.mode='model';
    this.modelTime=0;
    this.stage.dataset.preview='model';
    this.modelPhase=phase;
    this.setActive(phase===2?this.moon:phase===1?this.armour:this.inspect);
    this.hint.textContent=textForLocale('拖動旋轉');
    this.canvas.setAttribute('aria-label',textForLocale('3D 模型。拖動或用方向鍵旋轉，Home 鍵重置視角。'));
    this.drillTools.hidden=true;
    this.detail.textContent=textForLocale(this.description);
    this.canvas.hidden=true;
    this.image.hidden=!this.weapon;
    if(this.boss||this.studioReady.has(retainedForge(this.weapon))){
      this.mountModel(model);
      return;
    }
    const request=this.modelLoading={weapon:this.weapon};
    this.hint.textContent=textForLocale('正在準備 3D 模型⋯⋯');
    const pending=this.studioWarmup?.weapon===this.weapon?this.studioWarmup.promise:afterPaint();
    pending.then(()=>{
      if(this.open&&this.modelLoading===request)this.mountModel(model);
    });
  }

  mountModel(model){
    this.modelLoading=null;
    if(!this.showCanvas())return;
    this.hint.textContent=textForLocale('拖動旋轉');
    this.zoomTools.hidden=false;
    this.scene=new T.Scene();
    const pao=paoForms.has(this.boss?.bestiary?.id);
    if(this.boss)lightPaoDisplay(this.scene);
    else armLighting(this.scene);
    const pivot=new T.Group();
    this.model=pivot;
    let item;
    if(this.boss){
      this.bossRig=mountBestiary(this.scene,model,this.boss.height,this.main.mobile,this.boss);
      const actor={phase:0,move:0,face:1,spec:this.boss};
      poseBestiary(this.bossRig,actor,{phase:this.modelPhase},0,0,0);
      item=this.bossRig.root;
      this.displayActor=actor;
    }else item=borrowForge(this.weapon);
    this.faceZoom.hidden=!this.bossRig;
    const bounds=this.boss?studioBounds(item):new T.Box3().setFromObject(item);
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
    const wings=this.bossRig?.flight||this.bossRig?.signature?.type==='phoenix'||this.bossRig?.pattern==='wing';
    this.wideModel=Boolean(wings);
    const displaySize=this.boss?(pao?2.13:wings?2.40:1.78):1.87;
    const diameter=this.boss?Math.max(size.x,size.y,size.z):size.length();
    pivot.scale.setScalar(displaySize/diameter);
    this.scene.add(pivot);
    this.item=item;
    this.resetRotation();
    this.resize();
    this.animateModel();
  }

  animateModel(){
    if(this.displayActor&&!reducedMotion.matches){
      const start=performance.now();
      let frame=start;
      const update=now=>{
        if(!this.open||this.mode!=='model'||!this.displayActor||reducedMotion.matches)return;
        if(!this.main.mobile||now-frame>=27){
          const dt=(now-frame)/1000;
          frame=now;
          const clock=(now-start)/1000;
          this.modelTime=clock;
          poseBestiary(this.bossRig,this.displayActor,{phase:this.modelPhase,dt},clock,0,0);
          this.renderModel();
        }
        this.raf=requestAnimationFrame(update);
      };
      this.raf=requestAnimationFrame(update);
    }
  }

  get chapterPreviewHeight(){
    return this.boss&&this.dossier?.entry.floor&&this.dossier.stage.chapterBoss?this.boss.height:0;
  }

  makeStage(arena=false){
    const source=this.main;
    const view=Object.create(Object.getPrototypeOf(source));
    const scene=new T.Scene();
    const room=arena?this.dossier.stage:null;
    if(paoForms.has(this.boss?.bestiary?.id))lightPaoDisplay(scene);
    else armLighting(scene,arena);
    battleCamera.zoom=1;
    battleCamera.updateProjectionMatrix();
    battleCamera.position.set(.8,arena?16:9.2,arena?21:15);
    const bossHeight=this.chapterPreviewHeight;
    if(arena)battleCamera.lookAt(0,.3+bossHeight*.56,1.25);
    else if(bossHeight)battleCamera.lookAt(0,bossHeight*.68,.51);
    else battleCamera.lookAt(aim);
    battleCamera.updateMatrixWorld(true);
    const axis=new T.Vector3(0,1,0).applyQuaternion(battleCamera.quaternion);
    Object.assign(view,{scene,renderer:this.renderer,camera:battleCamera,cameraUp:axis,mobile:source.mobile,
      atlas:source.atlas,halo:source.halo,shadow:source.shadow,battleTextures:source.battleTextures,
      sigilTextures:source.sigilTextures,ring:source.ring,disc:source.disc,effects:[],time:0,shake:0,
      projectileShape:source.projectileShape,coinShape:source.coinShape,shardShape:source.shardShape,
      elementBudget:0,elementSeed:857302,stage:room??{dread:this.boss ? .45 : 0}});
    view.motes=view.createParticleSystem(view.mobile?125:220);
    view.feedback=new CombatFeedback(view);
    view.feedback.reduced=()=>source.feedback.subdued;
    view.motion=new MotionArt(view);
    view.makeSkillSeals();
    view.ward=view.makeWard();
    const stage=new T.Group();
    if(arena){
      view.wideBattlePosition=battleCamera.position.clone();
      view.cutaway=new RoomCutaway();
      view.sight=new T.Vector3();
      view.darkLights=scene.children.filter(node=>node.isLight).map(light=>[light,light.intensity]);
      view.landscape=new RoomLandscape(view,view.cutaway);
      view.landscape.set(room);
      view.arenaArt=new ArenaArt(view);
      for(const prop of room.props)stage.add(monument(view,prop,this.boss.tint));
      view.cutaway.cover(stage);
    }else{
      const ground=new T.Mesh(new T.CircleGeometry(this.boss?.finalWarden?14:7,52).rotateX(-Math.PI/2),
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
    view.spellLighting=new SpellLighting(view);
    this.view=view;
    this.scene=scene;
    return view;
  }

  setActive(active){
    for(const control of this.controls)control.setAttribute('aria-pressed',String(control===active));
  }

  preparePincerControls(choices){
    this.pincerChoices=choices;
    this.pincerRoster.replaceChildren(...choices.map(spec=>{
      const control=button(spec.name.replace('殘影 · ',''),()=>this.configurePincer({floor:spec.sourceFloor}));
      control.dataset.echo=String(spec.sourceFloor);
      return control;
    }));
    this.pincerModes.replaceChildren(...[['roll','翻滾避招'],['break','打斷蓄力']].map(([mode,name])=>{
      const control=button(name,()=>this.configurePincer({mode}));
      control.dataset.exercise=mode;
      return control;
    }));
  }

  configurePincer(changes){
    const settings=this.pincerSettings={...this.pincerSettings,...changes};
    for(const control of this.pincerRoster.children)control.setAttribute('aria-pressed',String(control.dataset.echo===String(settings.floor)));
    for(const control of this.pincerModes.children)control.setAttribute('aria-pressed',String(control.dataset.exercise===settings.mode));
    const echo=this.pincerChoices.find(choice=>choice.sourceFloor===settings.floor);
    this.pincerMove.textContent=textForLocale(echo.moveLabels[echo.reinforcementMove]);
    this.practice?.configure(settings);
    this.resumePlayback();
  }

  resumePlayback(){
    if(this.playbackDone&&this.practice){
      cancelAnimationFrame(this.raf);
      this.startPlayback();
    }
  }

  playBoss(action,control){
    this.clearScene();
    if(!this.showCanvas())return;
    const pincerDrill=action.pincerDrill;
    this.mode=action.drill||pincerDrill?'drill':action.phase?'phase':action.portrait?'portrait':'attack';
    const pincer=action.pattern===moonPincerPreview;
    const moonSlash=action.pattern===moonSlashPattern||pincer;
    const summon=action.pattern===wardenSummonPattern;
    if(moonSlash||summon)this.modelPhase=2;
    this.stage.dataset.preview=this.mode;
    this.setActive(control);
    this.zoomTools.hidden=true;
    this.pincerTools.hidden=!pincer;
    this.pincerEntry.hidden=!!pincerDrill;
    this.pincerOptions.hidden=!pincerDrill;
    this.drillTools.hidden=this.mode!=='drill';
    this.drillRoll.hidden=!!pincerDrill;
    this.drillHeavy.hidden=true;
    this.drillStart.hidden=true;
    const mechanism=action.phase===2?this.dossier.layout.last??this.dossier.layout:this.dossier.layout;
    this.drillInteract.hidden=!!pincerDrill||!['break','light'].includes(mechanism.mode);
    this.drillInteract.textContent=textForLocale(mechanism.mode==='light'?'重燃祭燈':'擊碎機關');
    this.canvas.setAttribute('aria-label',textForLocale(this.mode==='drill'?'反制練習場。點按、拖動或用方向鍵移動。':'頭目動畫預覽'));
    const phasePattern=action.phase===2?this.boss.lastFinishing??this.boss.finishing:this.boss.finishing;
    const name=action.motion?this.motionNames[action.motion]:this.moveNames[action.pattern??phasePattern];
    this.hint.textContent=textForLocale(action.phase?(action.phase===1?'第一階段':'第二階段'):(name??''));
    const phaseDetail=name?`變身後出招 · ${name}`:'變身預覽';
    this.detail.textContent=textForLocale(pincerDrill?(this.main.mobile?'點按或拖動走位 · 短掃或撳掣翻滾':'方向鍵或拖動走位 · Space 翻滾 · J 重擊')
      :action.drill?(this.main.mobile?'點按或拖住場地走位，撳「翻滾」閃開。':'點按或拖動場地走位 · 方向鍵移動 · Space 翻滾 · E 操作機關')
      :pincer?'紅色係斷冠 · 冰藍色係殘影 · 沿薄荷色箭嘴閃避'
      :moonSlash?'兩道命印輪流封路 · 第三斬由守夜者出手'
      :summon?'殘影擁有原頭目三分一生命及攻擊力 · 擊倒後回血同增傷'
      :action.phase?phaseDetail:action.portrait?this.description:name);
    const view=this.makeStage(!!(action.phase||moonSlash||summon));
    const seed=pincerDrill?0x4d4f4f4e:(this.bossSeed??=Math.floor(Math.random()*0x100000000));
    const form=this.boss.phaseTransition&&!action.phase?this.modelPhase:0;
    if(pincerDrill)this.configurePincer(pincerDrill);
    this.practice=this.makeBossPractice(view,this.dossier,{seed,form,...action},{
      phase:(phase,title)=>{this.hint.textContent=textForLocale(`${phase===1?'第二階段':'第三階段'} · ${title}`);},
      status:(message,done)=>{
        this.hint.textContent=textForLocale(message);
        this.stage.classList.toggle('counter-success',done);
        if(done)control.textContent=textForLocale('再試一次');
      },
      exercise:(state,message)=>{
        this.hint.textContent=textForLocale(message);
        const active=state==='charging'||state==='interrupted';
        this.drillRoll.hidden=!active;
        this.drillHeavy.hidden=state!=='charging'||this.pincerSettings.mode!=='break';
        this.drillStart.hidden=active||state==='active';
        this.drillStart.textContent=textForLocale(state==='failure'?'立即重試':state==='success'?'再練一次':'開始練習');
        this.stage.classList.toggle('counter-success',state==='success'||state==='interrupted');
        this.stage.classList.toggle('counter-failure',state==='failure');
        this.stage.dataset.exercise=state;
      },
    });
    this.startPlayback();
    if(pincer)this.stage.scrollIntoView({block:'nearest'});
  }

  play(kind){
    this.clearScene();
    if(!this.showCanvas())return;
    this.mode=kind;
    this.stage.dataset.preview=kind;
    this.zoomTools.hidden=true;
    this.setActive(kind==='combo'?this.combo:this.skill);
    const view=this.makeStage();
    this.practice=this.makePractice(view,this.weapon,kind);
    this.hint.textContent='';
    this.detail.textContent=textForLocale(kind==='combo'?comboNames(this.weapon).join(' → '):this.weapon.skill+' · '+this.weapon.detail);
    this.startPlayback();
  }

  startPlayback(){
    this.resize();
    this.playbackDone=false;
    this.previous=performance.now();
    this.animate(this.previous);
  }

  animate(now){
    if(!this.open||!this.practice)return;
    if(this.playbackDone&&this.main.mobile&&now-this.previous<30){
      this.raf=requestAnimationFrame(this.animate);
      return;
    }
    const dt=T.MathUtils.clamp((now-this.previous)/1000,0,.05);
    this.previous=now;
    if(dt>0&&!this.playbackDone)this.playbackDone=!this.practice.step(dt);
    const {view}=this;
    view.time+=dt;
    const idle=this.playbackDone&&!this.main.feedback.subdued&&this.practice.idle?.(dt);
    view.feedback.update(dt);
    view.spellLighting.tick(dt);
    view.wardenGround?.tick(dt);
    view.updateEffects(dt);
    view.renderParticles(dt,false);
    if(view.arenaArt){
      const {hero}=this.practice;
      const arena=view.arenaArt.arena;
      const darkness=arena?.darkness??0;
      const boss=arena?.boss,shot=wardenShotMix(boss,view.feedback.subdued);
      if(shot||battleCamera.zoom!==1){
        battleCamera.position.copy(view.wideBattlePosition);
        battleCamera.zoom=shot?frameWardenShot(battleCamera,boss,1,shot):1;
        battleCamera.updateProjectionMatrix();
        battleCamera.updateMatrixWorld(true);
      }
      view.arenaArt.render(view.time);
      for(const [light,intensity] of view.darkLights)light.intensity=intensity*(1-darkness*.52);
      view.sight.set(0,0,1).applyQuaternion(battleCamera.quaternion);
      view.cutaway.place(shot?T.MathUtils.lerp(hero.x,boss.x,shot):hero.x,
        shot?T.MathUtils.lerp(hero.z,boss.z,shot):hero.z,view.sight);
      view.landscape.light(darkness);
      view.landscape.tick(view.time,hero,darkness,dt,arena?.crimsonLight??0,arena?.moonMist??0,arena?.eclipseProgress);
    }
    this.renderer.render(this.scene,battleCamera);
    view.motion.budget=0;
    view.elementBudget=0;
    if(!this.playbackDone||idle)this.raf=requestAnimationFrame(this.animate);
  }

  clearScene(){
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.modelFrame);
    this.modelFrame=0;
    this.refreshEnergy=false;
    this.modelLoading=null;
    this.viewAngles.hidden=true;
    this.closeUp=false;
    this.faceZoom.hidden=true;
    this.faceZoom.setAttribute('aria-pressed','false');
    this.displayActor=null;
    this.stage.classList.remove('counter-success','counter-failure');
    delete this.stage.dataset.exercise;
    this.pincerSettings=null;
    this.pincerTools.hidden=true;
    for(const control of this.weakness.querySelectorAll('[data-drill]'))control.textContent=textForLocale('試反制');
    if(this.bossRig){
      this.bossRig.root.removeFromParent();
      removeBestiary(this.scene,this.bossRig);
      this.bossRig=null;
    }else if(this.item)recycleForge(this.item);
    this.item=null;
    if(this.view){
      const {view}=this;
      this.practice?.dispose();
      view.modelReserve?.clear();
      for(const fx of view.effects)view.release(fx);
      view.clearEffectMaterials();
      view.motion.dispose();
      view.landscape?.clear();
      const geometries=new Set(),materials=new Set();
      view.scene.traverse(part=>{
        if(part.isInstancedMesh)part.dispose();
        if(part.geometry&&!view.sharedPreviewGeometry(part.geometry))geometries.add(part.geometry);
        if(part.material)materials.add(part.material);
      });
      for(const geometry of Object.values(view.motion))if(geometry?.isBufferGeometry)geometries.add(geometry);
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
    this.bossSeed=null;
    this.renderer?.renderLists.dispose();
  }
}
