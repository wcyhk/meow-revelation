import {bossMoveNames,monsterBattle,visitorFor} from './monster-bestiary.mjs?v=dojo-3';
import {bossDossier,bossDossiers,drillEncounter} from './boss-dossiers.mjs?v=dojo-3';
import {practiceLoadout} from './catalogue.mjs?v=dojo-1';
import {WeaponViewer} from './weapon-viewer.mjs?v=dojo-3';
import {damageHud,damageReport,PracticeDamage} from './practice-damage.mjs?v=dojo-1';
import {Scenery} from './scenery.mjs?v=dojo-3';
import {heroFrames} from './actor-art.mjs?v=gilded-1';
import {paintedRooms} from './grove-light.mjs?v=gilded-1';
import {Audio} from './audio.mjs?v=weapon-audit-1';
import {Input} from './input.mjs?v=bestiary-1';
import {arms} from './armory.mjs?v=dojo-3';
import {ending} from './campaign.mjs?v=clock-1';
import {enemySpec, patterns, stages} from './expedition.mjs?v=bestiary-1';
import {blessings, buildStats, schoolProgress, schools} from './blessings.mjs?v=ledger-1';
import {advanceThreats, telegraph} from './threats.mjs?v=codex-1';
import {dischargeFusion, finishLinkedRush, invokeArm, invokeLinkedArm, reflectHit, rushHit, strikeTravel, strikeWith} from './combat.mjs?v=ledger-1';
import {RoomObjective,fieldNotes} from './objectives.mjs?v=bestiary-1';
import {invokeSchool} from './schools.mjs?v=ledger-1';
import {BossArena} from './boss-arena.mjs?v=ledger-1';
import {bossArenas} from './arena-layouts.mjs?v=bestiary-1';
import {advanceReaction, blendPose, enemyPose, heroAction, heroPose, reactionPose, reactionTime, recoil} from './combat-motion.mjs?v=weapon-audit-1';
import {comboMove, comboNames, comboTiming, linkWindow, skillLinks} from './weapon-combos.mjs?v=weapon-audit-1';
import {linkResonances, linkTier, resonanceMarks, resonancePreview, resonanceText} from './link-blessings.mjs?v=resonance-1';
import {fusionChoices, pickFusion} from './link-fusions.mjs?v=nightfall-1';
import {ultimateProgress, ultimateRank} from './ultimate-recipes.mjs?v=nightfall-1';
import {clearUltimates, launchUltimate, updateUltimates} from './ultimate-combat.mjs?v=ledger-1';
import {nightArms} from './nightfall-arms.mjs?v=nightfall-1';
import {difficulties,eliteOmen,modeStage} from './nightfall.mjs?v=clock-1';
import {giftCast,giftFinisher,giftHurt,giftKill,giftRoll,seals} from './relic-gifts.mjs?v=ledger-1';
import {lanternRadius,roomBounds,routeLayout,twinSpec} from './lantern-route.mjs?v=patina-1';
import {actorMotion} from './actor-kinetics.mjs?v=patina-1';
import {Progression,floorGold,formatTime,milestones,moonlessLantern,moonlessTitle} from './progression.mjs?v=last-bell-1';
import {branchPicker,recordsPanel,setFracture,trainingPanel} from './progression-ui.mjs?v=last-bell-1';
import {BranchCombat} from './branch-combat.mjs?v=sigils-1';
import {storyDialogue} from './dialogue-scenes.mjs?v=last-bell-1';
import {dialoguePanel} from './dialogue.mjs?v=last-bell-1';
import {endingFor} from './endings.mjs?v=last-bell-1';
import {RelicHunt} from './relic-hunt.mjs?v=heirlooms-1';
import {relicCounter} from './relic-cast.mjs?v=ledger-1';
import {blessingIcon,blessingLedger,bonusPercent,paintBlessingHud,weaponPicker} from './relic-interface.mjs?v=codex-1';
import {relicPower} from './relic-arsenal.mjs?v=weapon-audit-1';

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (x, low, high) => Math.max(low,Math.min(x,high));
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const blend = (speed,dt) => 1-Math.exp(-speed*dt);
const fixed = value => Math.max(0, Math.ceil(value));
const random = (low,high) => low + Math.random() * (high-low);
const actionIds = ['dodge','spell','strike'];

function shuffle(list) {
  const mixed = [...list];
  for (let i = mixed.length-1; i > 0; i--) {
    const index = Math.floor(Math.random()*(i+1));
    [mixed[i],mixed[index]] = [mixed[index],mixed[i]];
  }
  return mixed;
}

function makeHero() {
  return {
    x:0,z:7.7,hp:100,maxHp:100,face:1,dx:0,dz:-1,vx:0,vz:0,move:0,
    invulnerable:0,flash:0,atk:0,atkTotal:1,attackAge:1,slash:null,combo:0,comboLeft:0,
    rolling:0,rollCool:0,rollX:0,rollZ:-1,rollDuration:.30,rollSpeed:13.6,spellCool:0,
    ward:0,surge:0,rush:null,snared:0,reaction:null,motion:null,
    link:null,linkFlash:0,linkWard:false,rushLink:null,linkGuard:null,linkFusion:null,
  };
}

function makeButton(label, callback, style='secondary') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = style;
  button.textContent = label;
  button.addEventListener('click',callback);
  return button;
}

export class Game {
  constructor(view, audio) {
    this.view = view;
    this.audio = audio;
    this.state = 'cover';
    this.difficulty=difficulties.vigil;
    this.progress=new Progression();
    this.branchCombat=new BranchCombat(view);
    this.weaponViewer=new WeaponViewer(view,makeWeaponPractice);
    this.practiceDraft={boss:bossDossiers[0],weapon:arms[0],ranks:new Map(),phase:0,seed:null};
    this.practiceRun=null;
    this.arenaSeed=Math.floor(Math.random()*0x100000000);
    this.level = 0;
    this.wave = 0;
    this.enemies = [];
    this.fallen = [];
    this.hazards = [];
    this.pickups = [];
    this.relics = [];
    this.journal = [];
    this.storyChoices = Object.create(null);
    this.rituals = [];
    this.ultimateFields = [];
    this.relicWalls=[];
    this.discovery = null;
    this.elapsed = 0;
    this.t = 0;
    this.hitstop = 0;
    this.announceLeft = 0;
    this.damageFlash = 0;
    this.startDelay = Infinity;
    this.clearDelay = 0;
    this.kills = 0;
    this.buffered = {dodge:0,spell:0,strike:0,dodgeDirection:null};
    this.previousTime = performance.now();
    this.ui = Object.fromEntries(['cover','hud','modal','begin','pause','mute','objective','boss-hud','boss-fill','hp-fill','hp-number',
      'relic-icons','route-name','route-floor','route-dots','boss-name','damage-vignette','announce','announce-kicker','announce-title','announce-line',
      'mission-status','mission-title','mission-text','mission-track','mission-fill','mission-pins','school-toast','boss-arena-hint','boss-weakness','skill-link',
      'boss-primary','boss-echo','boss-echo-name','boss-echo-fill','run-kills','run-time','run-gold','entry-gold','training','records','bestiary','time-fracture',
      'modal-kicker','modal-title','modal-copy','modal-mark','modal-content','modal-actions','journal','inspect','equipped','field-support','touch-skill-status','practice-edit',...actionIds].map(id=>[id,$(id)]));
    this.meter = this.ui['hp-fill'].parentElement;
    this.input = new Input(view.canvas,action=>{if(!this.weaponViewer.open)(action==='journal'?this.showJournal():this.togglePause());},()=>this.state==='play');
    this.ui.begin.addEventListener('click',()=>this.prepare());
    this.ui.training.addEventListener('click',()=>this.openTraining());
    this.ui.records.addEventListener('click',()=>this.openRecords());
    this.ui.bestiary.addEventListener('click',()=>this.openPracticeLoadout());
    this.ui['practice-edit'].addEventListener('click',()=>this.openPracticeLoadout());
    this.paintDamage=damageHud($('practice-damage'));
    this.updateEntryBalance();
    this.ui.pause.addEventListener('click',()=>this.togglePause());
    this.ui.mute.addEventListener('click',()=>this.ui.mute.setAttribute('aria-pressed',String(audio.toggle())));
    this.ui.inspect.addEventListener('click',()=>this.interact());
    this.ui.journal.addEventListener('click',()=>this.showJournal());
    this.ui['relic-icons'].addEventListener('click',()=>this.showRunBlessings());
    addEventListener('resize',()=>this.view.resize());
    document.addEventListener('visibilitychange',() => {if(document.hidden && this.state==='play') this.togglePause();});
    this.loop = this.loop.bind(this);
  }

  updateEntryBalance() {
    this.ui['entry-gold'].textContent='金幣 '+this.progress.data.gold.toLocaleString('zh-HK');
  }

  openTraining() {
    if (this.state!=='cover') return;
    this.progress.refresh();
    this.state='training';
    this.openModal({kind:'training',mark:'♨',kicker:'林門外',title:'守燈訓練所',
      copy:'用帶返入口嘅金幣練成能力，下次入林就會生效。',
      content:trainingPanel(this.progress,()=>this.updateEntryBalance()),
      buttons:[makeButton('返回入口',()=>this.showCover(),'primary')]});
  }

  openRecords() {
    if (this.state!=='cover') return;
    this.progress.refresh();
    this.state='records';
    this.openModal({kind:'records',mark:'◇',kicker:'司刻嘅帳簿',title:'個人紀錄',
      copy:'抵達同通過嘅樓層會即時記下。敲響歸名鐘先計通關時間。',
      content:recordsPanel(this.progress,Object.values(difficulties)),
      buttons:[makeButton('返回入口',()=>this.showCover(),'primary')]});
  }

  setPracticeBoss(entry) {
    const draft=this.practiceDraft;
    if(draft.boss===entry)return;
    draft.boss=entry;
    draft.seed=null;
    draft.phase=Math.min(draft.phase,bossDossier(entry,this.difficulty).spec.phases.length);
  }

  setPracticeWeapon(weapon) {
    const draft=this.practiceDraft;
    draft.weapon=weapon;
  }

  openPracticeLoadout() {
    if(this.state!=='cover'&&!this.practiceRun)return;
    const canResume=this.practiceCanResume=['play','pause'].includes(this.state);
    this.state='practice-loadout';
    this.audio.active=false;
    const describe=entry=>bossDossier(entry,this.difficulty);
    const content=practiceLoadout(this.practiceDraft,{weapons:arms,heads:bossDossiers,icons:this.view.armIcons,
      previewWeapon:weapon=>this.weaponViewer.show(weapon),describe,
      previewBoss:entry=>this.weaponViewer.showBoss(describe(entry),{...patterns,...bossMoveNames},makeBossPractice),
      chooseWeapon:weapon=>this.setPracticeWeapon(weapon),chooseBoss:entry=>this.setPracticeBoss(entry)});
    this.openModal({kind:'practice-loadout',mark:'◇',kicker:'',title:'練習場',copy:'',content,
      buttons:[makeButton('返回入口',()=>this.showCover()),
        ...(canResume?[makeButton('繼續本場',()=>this.togglePause())]:[]),
        makeButton('開始練習',()=>this.startPractice(),'primary')]});
    this.ui['modal-content'].scrollTop=0;
  }

  startPractice() {
    if(!['practice-loadout','practice-result','pause'].includes(this.state))return;
    const draft=this.practiceDraft;
    const {weapon,boss,phase,ranks}=draft;
    draft.seed??=Math.floor(Math.random()*0x100000000);
    const pool=weapon.blessing?[...blessings,weapon.blessing]:blessings;
    const relics=pool.flatMap(item=>Array.from({length:ranks.get(item.id)??0},()=>item));
    this.duelMonster=boss;
    this.practiceRun={phase,seed:draft.seed,relics,damage:new PracticeDamage()};
    this.audio.start().catch(()=>{});
    this.start(weapon);
  }

  startMonsterDuel() {
    const {stage:source,layout,spec}=bossDossier(this.duelMonster,this.difficulty);
    const title=this.practiceRun?'頭目練習場':'頭目試戰';
    const stage={...source,name:title,clue:null,objective:null,hazard:null};
    this.stage=stage;
    this.clearActors();
    this.clearThreats();
    this.rituals.length=0;
    this.bossArena=this.mission=this.escape=null;
    this.floorBossesDefeated=0;
    this.startDelay=Infinity;
    this.pins=[];
    this.ui['mission-pins'].replaceChildren();
    this.ui.hud.dataset.mission='';
    this.hero.x=stage.spawn.x;
    this.hero.z=stage.spawn.z;
    this.hero.invulnerable=1.15;
    this.view.focus.set(0,0,-.65);
    this.view.setStage(stage);
    this.view.setMission(null);
    this.view.setBossArena(null);
    this.view.lanternArt.set(null);
    this.branchCombat.enter(this);
    this.placeStory(null);
    const boss=this.spawn('boss',0,-3.2,null,spec);
    this.arenaSeed=(this.arenaSeed+0x9e3779b9)>>>0;
    this.bossArena=new BossArena(this,layout,boss,this.practiceRun?.seed??this.arenaSeed);
    this.view.setBossArena(this.bossArena);
    boss.phaseGuard=1.12;
    boss.recover=1.10;
    this.ui['route-name'].textContent=title;
    this.ui['route-floor'].textContent=this.difficulty.name;
    this.ui['route-dots'].replaceChildren();
    this.ui['boss-name'].textContent=spec.name;
    this.audio.danger=true;
    this.audio.dread=stage.dread;
    this.ambientClock=Infinity;
    this.audio.boss(spec.effect);
    const phase=this.practiceRun?.phase??0;
    if(phase){
      if(phase===2){boss.bossPhase=1;this.bossArena.transform(1);}
      boss.hp=spec.hp*spec.phases[phase-1];
      this.advanceBossPhase(boss);
    }else{
      this.view.bossCue(boss,'entrance');
      this.objective('擊敗 '+spec.name);
      this.announce(title,spec.name,spec.signature,1.9);
    }
    this.renderUI();
  }

  finishMonsterDuel() {
    if(this.practiceRun){this.finishPractice(true);return;}
    this.state='duel-win';
    this.audio.active=false;
    this.clearThreats();
    this.rituals.length=0;
    this.ui.announce.classList.remove('visible');
    this.openModal({kind:'duel-win',mark:'✧',kicker:'頭目試戰',title:'已擊敗 '+this.duelMonster.name,
      copy:'用時 '+formatTime(this.elapsed),buttons:[makeButton('返回練習場',()=>{
        this.showCover();this.openPracticeLoadout();
      },'primary')]});
  }

  finishPractice(won) {
    this.state='practice-result';
    this.audio.active=false;
    this.clearThreats();
    this.rituals.length=0;
    this.ui.announce.classList.remove('visible');
    this.openModal({kind:'practice-result',mark:'✧',kicker:'頭目練習場',
      title:won?'已擊敗 '+this.duelMonster.name:'練習結束',copy:'用時 '+formatTime(this.elapsed),
      content:damageReport(this.practiceRun.damage),
      buttons:[makeButton('換配搭',()=>this.openPracticeLoadout(),'primary'),makeButton('原配搭再試',()=>this.startPractice()),
        makeButton('返回入口',()=>this.showCover())]});
  }

  prepare(milestone=false) {
    this.audio.start().catch(() => {});
    this.state='armory';
    this.audio.active=false;
    const grid=document.createElement('div');
    grid.className='armory-grid';
    const pool=shuffle(milestone?arms.filter(arm=>arm.id!==this.weapon.id):arms);
    const choices=pool.slice(0,3);
    const select=weapon=>this.weaponViewer.show(weapon,milestone?item=>this.swapWeapon(item):item=>this.start(item));
    if(!milestone&&!choices.some(arm=>arm.spell))choices[2]=pool.find(arm=>arm.spell);
    for (const weapon of choices) {
      const choice=makeButton('',()=>select(weapon),'arm-card');
      choice.dataset.arm=weapon.id;
      choice.style.setProperty('--arm-ink',weapon.ink);
      const image=document.createElement('img');
      image.src=this.view.armIcons.get(weapon.id);
      image.alt='';
      image.decoding='async';
      const portrait=document.createElement('div');
      portrait.className='arm-portrait';
      portrait.append(image);
      const text=document.createElement('div');
      text.className='arm-text';
      const role=document.createElement('small'), name=document.createElement('b');
      const basic=document.createElement('span'), moves=document.createElement('span');
      const skill=document.createElement('strong'), detail=document.createElement('span'), link=document.createElement('span');
      role.textContent=(nightArms.includes(weapon)?'夜祭 · ':'')+weapon.role; name.textContent=weapon.name; basic.textContent=weapon.basic;
      moves.className='arm-combo';
      moves.textContent=comboNames(weapon).join(' → ');
      skill.textContent=weapon.skill; detail.textContent=weapon.detail;
      link.className='arm-link';
      const follow=skillLinks[weapon.id];
      link.textContent='接技 · '+follow.name+'：'+follow.detail;
      text.append(role,name,moves,basic,skill,detail,link);
      if(weapon.spell){
        const heirloom=document.createElement('span');
        heirloom.className='arm-resonance';
        heirloom.textContent='專屬祝福 · '+weapon.blessing.name+'｜'+weapon.blessing.detail;
        text.append(heirloom);
      }
      const signature={qilin:'wind',flameblade:'fire',stormbow:'thunder',turtle:'ward'}[weapon.id];
      const fusion=milestone?pickFusion(fusionChoices(weapon,this.hero.resonance),this.fusionPin):null;
      const secret=milestone?ultimateProgress(weapon,this.hero.resonance):null;
      if (fusion||milestone&&signature&&this.hero.resonance[signature]) {
        const resonance=document.createElement('span');
        resonance.className='arm-resonance';
        resonance.textContent=fusion?fusion.mark+' '+fusion.name+'｜'+fusion.detail
          :linkResonances[signature].mark+' 已有共鳴｜'+resonanceText(weapon,signature,this.hero.resonance[signature]);
        text.append(resonance);
      }
      if (secret?.known&&!secret.ready) {
        const clue=document.createElement('span');
        clue.className='arm-resonance';
        clue.textContent='隱藏合招｜'+this.ultimateClue(secret);
        text.append(clue);
      }
      choice.append(portrait,text);
      grid.append(choice);
    }
    const content=document.createElement('div');
    if(!milestone) {
      this.progress.refresh();
      content.append(this.difficultyPicker(),branchPicker(this.progress));
    }
    if(!milestone)content.append(weaponPicker(arms,this.view.armIcons,select));
    content.append(grid);
    this.openModal({kind:'armory',mark:'◇',
      kicker:milestone?'第 '+this.stage.floor+' 關 · '+this.stage.zone.name:'神獸遺物',
      title:milestone?'領取頭目遺物':this.duelMonster?'試戰 · '+this.duelMonster.name:'向林火借一件神器',
      copy:milestone?'你已擊敗'+this.stage.guardian.name+'。揀一件新神器帶走，祝福同流派技能會繼續生效。'
        :'揀難度、勾選入場技能，再帶一件神器出發。',content,
      buttons:milestone?[]:[makeButton(this.duelMonster?'返回練習場':'返回主畫面',()=>{
        const back=!!this.duelMonster;this.showCover();if(back)this.openPracticeLoadout();
      })]});
  }

  difficultyPicker() {
    const root=document.createElement('div');
    root.className='difficulty-picker';
    root.setAttribute('role','group');root.setAttribute('aria-label','選擇難度');
    const controls=document.createElement('div'),detail=document.createElement('small'),goals=document.createElement('small');
    goals.className='difficulty-rewards';
    const refresh=()=>{
      for(const button of controls.children) button.setAttribute('aria-pressed',String(button.dataset.difficulty===this.difficulty.id));
      detail.textContent=this.difficulty.detail+' 每層金幣 ×'+this.difficulty.gold;
      goals.textContent=milestones[this.difficulty.id].map(reward=>`第 ${reward.floor} 關 · ${reward.name}`).join('　');
      goals.hidden=!goals.textContent;
    };
    for(const mode of Object.values(difficulties)) {
      const button=makeButton(mode.mark+' '+mode.name,()=>{this.difficulty=mode;refresh();},'difficulty-choice');
      button.dataset.difficulty=mode.id;
      controls.append(button);
    }
    root.append(controls,detail,goals);refresh();return root;
  }

  start(weapon) {
    if (this.heroVisual) this.view.removeEquippedActor(this.heroVisual);
    this.hero = makeHero();
    this.progress.refresh();
    this.branchCombat.start(this.practiceRun?{...this.progress.data,branch:null}:this.progress.data);
    this.training=this.practiceRun?{}:{...this.progress.data.training};
    this.hero.technique=this.practiceRun?null:this.progress.data.technique;
    this.hero.lanternStyle=this.progress.data.lantern;
    this.runGold=0;
    this.redraws=0;
    this.altar=null;
    this.twinReward=null;
    this.failure=null;
    this.heroVisual = this.view.createActor(0,2.68);
    this.relics = this.practiceRun?[...this.practiceRun.relics]:[];
    this.huntedWeapons=new Set();
    this.fusionPin=null;
    this.routeSeed=Math.floor(Math.random()*0x100000000);
    this.journal = [];
    this.storyChoices = Object.create(null);
    this.learned=new Set();
    this.autoReady=new Map();
    this.schoolToast=0;
    this.ui['school-toast'].hidden=true;
    paintBlessingHud(this.ui['relic-icons'],this.relics);
    this.elapsed = 0;
    this.kills = 0;
    this.hitstop = 0;
    this.damageFlash = 0;
    this.buffered = {dodge:0,spell:0,strike:0,dodgeDirection:null};
    this.level = 0;
    this.wave = 0;
    this.equip(weapon);
    this.learned=new Set(Object.keys(schools).filter(school=>schoolProgress(this.ranks,school).distinct>=3));
    this.hero.hp=this.hero.maxHp;
    this.state = 'play';
    this.audio.active = true;
    this.ui.cover.hidden = true;
    this.ui.hud.hidden = false;
    this.ui['practice-edit'].hidden=!this.practiceRun;
    this.paintDamage(this.practiceRun?.damage);
    this.closeModal();
    if(this.duelMonster)this.startMonsterDuel();
    else this.enter(0);
    this.view.canvas.focus();
  }

  equip(weapon) {
    this.weapon=weapon;
    this.relicHunt=!this.practiceRun&&weapon.spell&&!this.huntedWeapons?.has(weapon.id)?new RelicHunt(this,weapon):null;
    this.hero.projectileAim=null;
    this.view.equip(this.heroVisual,weapon);
    this.input.touch.setWeapon(weapon);
    const floor=this.practiceRun?(this.duelMonster.floor??12):this.level+1;
    this.ranks=buildStats(this.hero,weapon,floor,this.relics,this.training);
    this.ui.equipped.textContent=weapon.name;
    this.ui.equipped.style.color=weapon.ink;
    this.action('strike',weapon.attack,'✦',weapon.ink);
    this.ui.strike.title=comboNames(weapon).join(' → ');
    this.action('spell',weapon.skill,weapon.mark,weapon.ink);
    this.refreshFusion();
    this.hero.link=null;
  }

  refreshFusion() {
    this.fusions=fusionChoices(this.weapon,this.hero.resonance);
    this.fusion=pickFusion(this.fusions,this.fusionPin);
    const skill=skillLinks[this.weapon.id].name;
    this.ui.spell.title=this.weapon.skill+' · 第三擊命中後接技：'+skill+(this.fusion?'｜'+this.fusion.name+'：'+this.fusion.detail:'');
  }

  ultimateClue(progress,school) {
    return progress.rite.schools.map(id=>linkResonances[id].name+' '+Math.min(6,schoolProgress(this.ranks,id).total+Number(id===school))+'/6').join(' · ');
  }

  fusionForLink(link) {
    if (this.weapon.id==='qilin'&&this.fusion?.id==='frostlance'
        &&!link.contacts.some(mark=>mark.kind==='break'&&mark.unit.hp>0&&mark.unit.phaseGuard<=0)) return null;
    return this.fusion;
  }

  swapWeapon(weapon) {
    if (this.state!=='armory') return;
    this.equip(weapon);
    this.state='play';
    this.audio.active=true;
    this.audio.play('blessing');
    this.closeModal();
    this.advanceAfterReward();
  }

  action(id,label,mark,tone) {
    const control=this.ui[id];
    control.setAttribute('aria-label',label);
    control.title=label;
    control.querySelector('em').textContent=label;
    control.querySelector('span').textContent=mark;
    control.style.setProperty('--action-ink',tone);
  }

  clearActors() {
    this.branchCombat.activeMaw?.clearVisuals();
    const actors = new Set([...this.enemies,...this.fallen,...this.pickups]);
    for (const unit of actors) this.view.removeActor(unit.visual);
    this.enemies.length = this.fallen.length = this.pickups.length = 0;
  }

  enter(level) {
    this.clearActors();
    this.clearThreats();
    this.rituals.length=0;
    this.level = level;
    this.wave = 0;
    this.clearDelay = 0;
    const stage = this.stage = modeStage(stages[level],this.difficulty);
    this.progress.reach(this.difficulty.id,stage.floor);
    this.floorBossesDefeated=0;
    this.escape=routeLayout(stage,this.routeSeed);
    this.floorReward=null;
    this.bossArena=null;
    this.mission=stage.objective ? new RoomObjective(this,stage.objective) : null;
    this.ui.hud.dataset.mission=this.mission?.plan.type??'';
    const h = this.hero;
    const oldMax=h.maxHp;
    this.ranks=buildStats(h,this.weapon,stage.floor,this.relics,this.training);
    h.hp=Math.min(h.maxHp,h.hp+Math.max(0,h.maxHp-oldMax));
    h.trainingWardSpent=false;
    h.relicCounter=h.relicHaste=h.projectileAim=h.poseGait=null;
    h.lanternOut=0;
    h.snuffCooldown=0;
    h.x = stage.spawn.x; h.z = stage.spawn.z; h.vx = h.vz = 0;
    h.visualMotion=null;
    h.invulnerable = 1;
    h.rolling = h.atk = h.rollCool = h.spellCool = h.ward = h.surge = h.combo = h.comboLeft = h.snared = 0;
    h.slash = h.rush = null;
    h.link=null;
    h.linkFlash=0;
    h.linkWard=false;
    h.rushLink=h.linkGuard=h.linkFusion=null;
    h.rollOrigin=null;
    h.sutureUsed=false;
    h.gravefireAt=h.votiveAt=0;
    h.reaction=h.motion=null;
    h.attackAge=1;
    h.dx = 0; h.dz = -1;
    this.ambientClock=(4.1+(stage.room%4)*.47)/this.difficulty.pace;
    this.view.focus.set(0,0,-.65);
    this.view.setStage(stage);
    this.branchCombat.enter(this);
    this.view.lanternArt.set(this.escape);
    this.view.setMission(this.mission);
    this.view.setBossArena(null);
    this.setupMissionPins();
    this.audio.danger = stage.boss;
    this.audio.dread=stage.dread;
    this.ui['boss-hud'].hidden = true;
    this.ui['boss-echo'].hidden=true;
    this.ui['route-name'].textContent = stage.name;
    this.ui['route-floor'].textContent='第 '+stage.floor+' / 100 關'+(this.difficulty.id==='vigil'?'':' · '+this.difficulty.name);
    this.ui['route-dots'].replaceChildren(...Array.from({length:10},(_,index) => {
      const gem = document.createElement('i');
      gem.className = 'route-gem '+(index===stage.chapter?'current':index<stage.chapter?'done':'');
      return gem;
    }));
    const clue=stage.clue;
    this.placeStory(null);
    this.objective(this.mission?.plan.hint??(stage.boss?'迎戰 '+stage.guardian.name:patterns[stage.hazard]+' · 留意地面預警'));
    const arrival=this.mission?.plan.title??(stage.boss?stage.guardian.name:patterns[stage.hazard]);
    this.announce(stage.zone.name+'  /  第 '+stage.floor+' 關',stage.name,arrival,2.15);
    this.startDelay=1.05;
    if(clue&&!this.journal.some(entry=>!entry.hiddenClue&&entry.chapter===stage.zone.name)){
      this.discover(clue);
    }
    this.renderUI();
  }

  announce(kicker,title,line,duration=2) {
    this.ui['announce-kicker'].textContent = kicker;
    this.ui['announce-title'].textContent = title;
    this.ui['announce-line'].textContent = line;
    this.ui.announce.classList.add('visible');
    this.announceLeft = duration;
  }

  objective(line) {
    if (line !== this.ui.objective.textContent) this.ui.objective.textContent = line;
  }

  placeStory(clue) {
    this.discovery=clue;
    this.view.placeClue(clue);
    this.ui.inspect.hidden=true;
    if (clue) this.objective('沿燈火尋找 · '+clue.title);
  }

  closeToClue() {
    return this.discovery && distance(this.hero,this.discovery)<1.82;
  }

  interact() {
    if (this.state!=='play') return;
    if (this.discovery) {
      this.readClue();
      return;
    }
    if(this.escape?.ready){this.useExit();return;}
    const arenaPoint=this.bossArena?.nearby(this.hero);
    if(arenaPoint)this.bossArena.interact(arenaPoint);
  }

  readClue() {
    if (this.state!=='play' || !this.closeToClue()) return false;
    this.discover(this.discovery);
    return true;
  }

  discover(clue) {
    this.placeStory(null);
    this.state='story';
    this.audio.play('blessing');
    const final=clue===ending;
    this.openDialogue(clue.title,final?'尾聲':this.stage.zone.name,storyDialogue(clue,this.storyChoices),
      final?'聽鐘聲':'收起線索',selected=>{
      if (selected) this.storyChoices[clue.title]=selected.id;
      if (clue.record) this.journal.push({title:clue.title,record:clue.record,chapter:this.stage.zone.name,note:selected?.note});
      this.closeModal();
      if (final) {
        this.finish(true);
        return;
      }
      this.state='play';
      this.objective(this.level===0?'敵影將至 · 紅印亮起時可翻滾':this.mission?.plan.hint??'前方的封印正在鬆動');
      this.startDelay=1.07;
    });
    return true;
  }

  recordFieldNotes() {
    const {chapter,room,zone}=this.stage;
    if(room!==7)return;
    const [title,record,secondTitle,secondRecord]=fieldNotes(chapter);
    if(!this.journal.some(entry=>entry.hiddenClue&&entry.title===title)){
      this.journal.push({title,record:record+' '+secondTitle+'。'+secondRecord,chapter:zone.name,hiddenClue:true});
    }
  }

  openDialogue(title,location,scene,finishLabel,onFinish,summary) {
    const content=dialoguePanel({title,location,scene,finishLabel,onFinish,summary});
    const picture=paintedRooms[this.stage.picture]??this.stage.picture;
    content.style.setProperty('--vn-room',`url("./${picture}")`);
    this.openModal({kind:'dialogue',mark:'',kicker:'',title,copy:'',content});
    content.querySelector('.vn-next:not([hidden]), .vn-options:not([hidden]) .vn-choice')?.focus({preventScroll:true});
  }

  showJournal() {
    if (this.state!=='play') return;
    this.state='journal';
    const journal=document.createElement('div');
    journal.className='journal-entries';
    for (const clue of this.journal) {
      const entry=document.createElement('article');
      const heading=document.createElement('b'), record=document.createElement('p');
      heading.textContent=clue.chapter+' · '+clue.title;
      record.textContent=clue.record;
      entry.append(heading,record);
      if (clue.note) {
        const note=document.createElement('p');
        note.className='journal-choice';
        note.textContent='你嘅選擇 · '+clue.note;
        entry.append(note);
      }
      journal.append(entry);
    }
    this.openModal({kind:'story',mark:'◇',kicker:'尋名記',title:'探索手記',
      copy:this.journal.length?'':'沿着祭燈調查，線索會記在這裏。',content:journal,
      buttons:[makeButton('收起手記',()=>this.togglePause(),'primary')]});
  }

  spawn(kind,x,z,omen=null,override=null) {
    const spec = override??enemySpec(this.stage,kind);
    if(omen){
      spec.hp=Math.round(spec.hp*1.22);spec.tint=omen.tint;spec.name=spec.name+' · '+omen.name;
      if(omen.id==='husk')spec.guard=true;
      if(omen.id==='hunt'){spec.speed*=1.16;spec.hurt*=1.12;}
    }
    const unit = {
      kind,spec,x,z,omen,hp:spec.hp,face:x>0?-1:1,phase:random(0,TAU),attack:null,cool:random(.55,1.22),
      kx:0,kz:0,stun:0,flash:0,age:0,step:0,recover:0,move:0,chill:0,exposed:0,bossPhase:0,phaseGuard:0,summons:0,morale:0,
      guardOpen:0,reaction:null,motion:null,frozen:0,
      visual:this.view.createActor(spec.frame,spec.height),
    };
    if(spec.effigy)this.view.prepareEffigy(unit.visual,spec.effigy);
    if (kind==='boss') this.view.prepareBoss(unit.visual,spec);
    this.bound(unit);
    if (this.isBlocked(unit,.45)) {
      const angle=this.stage.bearing;
      for (let index=0;index<8;index++) {
        const turn=angle+index*TAU/8;
        unit.x=x+Math.cos(turn)*2.05;
        unit.z=z+Math.sin(turn)*2.05;
        this.bound(unit);
        if (!this.isBlocked(unit,.45)) break;
      }
    }
    this.enemies.push(unit);
    this.view.spark(unit.x,.27,unit.z,spec.tint,12,.68,spec.effect);
    return unit;
  }

  startWave() {
    const {waves,positions,guardian}=this.stage;
    const units = shuffle(waves[this.wave]);
    const eliteIndex=units.findIndex(kind=>kind!=='boss');
    const omen=eliteOmen(this.stage,this.wave,this.arenaSeed,eliteIndex>=0);
    let head,elite;
    const count = units.length;
    for (let i=0;i<count;i++) {
      const {x,z} = units[i]==='boss'?{x:0,z:-3.2}:positions[i];
      const unit=this.spawn(units[i],x+random(-.46,.46),z+random(-.46,.46),i===eliteIndex?omen:null);
      if (unit.kind==='boss') head=unit;
      if(unit.omen)elite=unit;
    }
    const visitor=this.wave===waves.length-1?visitorFor(this.stage,this.routeSeed):null;
    if(visitor){
      this.audio.danger=true;
      const unit=this.spawn('boss',-2.8,-4.0,null,monsterBattle(visitor,this.stage.floor,this.difficulty));
      unit.phaseGuard=.75;
      unit.recover=1.16;
      this.ui['boss-echo-name'].textContent=visitor.name;
      this.view.bossCue(unit,'entrance');
      this.announce('巨商妖異',visitor.name,unit.spec.signature,2.1);
      this.audio.boss(unit.spec.effect);
    }
    this.startDelay = Infinity;
    this.wave++;
    const boss=!!head;
    this.objective(boss ? '擊敗 '+guardian.name : '清除敵人 · '+this.wave+' / '+waves.length+
      (guardian?' · 頭目尚未現身':visitor?' · '+visitor.name:' · '+patterns[this.stage.hazard])+(elite?' · '+elite.omen.name:''));
    if(elite&&!boss&&!visitor)this.announce('夜祭異變',elite.spec.name,elite.omen.detail,1.75);
    if (boss) {
      this.arenaSeed=(this.arenaSeed+0x9e3779b9)>>>0;
      this.bossArena=new BossArena(this,bossArenas.get(this.stage.floor),head,this.arenaSeed);
      this.view.setBossArena(this.bossArena);
      head.phaseGuard=1.17;
      head.recover=1.04;
      this.ui['boss-name'].textContent=guardian.name;
      this.ui['boss-primary'].hidden=false;
      this.ui['boss-hud'].hidden = false;
      const extra=twinSpec(this.stage);
      if(extra){
        const echo=this.spawn('boss',this.escape.x*.65+(this.escape.x>0?3.45:-3.45),-4.95,null,extra);
        echo.phaseGuard=1.30;echo.recover=2.35;echo.cool=2.65;
        this.ui['boss-echo'].hidden=false;
        this.ui['boss-echo-name'].textContent=extra.name;
        this.view.bossCue(echo,'entrance');
        this.objective('擊敗兩名頭目 · 封住出口嘅路障可擊破');
      }
      this.view.bossCue(head,'entrance');
      this.audio.boss(guardian.effect);
      this.announce('第 '+this.stage.floor+' 關 · '+(extra?'雙頭目':'頭目'),guardian.name,extra?'同行：'+extra.name:guardian.signature,2.35);
    }
  }

  aim(input, range=this.hero.reach+.86) {
    const h = this.hero;
    if (input.aim) {
      const center = this.view.project(h.x,.8,h.z);
      const x=input.aim.x-center.x, y=input.aim.y-center.y;
      if(Math.hypot(x,y)>7){
        const right=this.view.project(h.x+1,.8,h.z);
        const down=this.view.project(h.x,.8,h.z+1);
        const rx=right.x-center.x, ry=right.y-center.y, zx=down.x-center.x, zy=down.y-center.y;
        const det=rx*zy-ry*zx;
        if(Math.abs(det)>.01){
          const dx=(x*zy-y*zx)/det, dz=(rx*y-ry*x)/det;
          const length=Math.hypot(dx,dz);
          if(length>0)return [dx/length,dz/length];
        }
      }
    }
    let nearest = null;
    let shortest = Infinity;
    const anchors=this.bossArena?.targets??[];
    for (const foe of [...anchors,...this.enemies,...this.breakables()]) {
      const d = distance(h,foe);
      const priority=foe.kind==='arenaAnchor'?.50:foe.kind==='breakable'?1.35:1;
      if (foe.hp>0 && d*priority<shortest && d<range+(foe.kind==='boss'?.65:0)) {
        nearest = foe;
        shortest = d*priority;
      }
    }
    if (nearest) {
      const gap=distance(h,nearest);
      if (gap>.03) return [(nearest.x-h.x)/gap,(nearest.z-h.z)/gap];
    }
    return [h.dx,h.dz];
  }

  updateHero(dt,input) {
    const h = this.hero;
    h.atk -= dt;
    h.comboLeft -= dt;
    h.attackAge += dt;
    h.rollCool -= dt;
    h.spellCool -= dt;
    h.linkFlash -= dt;
    if (h.link?.until>0 && h.link.until<=this.t) h.link=null;
    h.invulnerable -= dt;
    h.ward -= dt;
    if (h.ward<=0) {h.linkWard=false;h.relicCounter=null;}
    if (h.linkGuard&&(h.linkGuard.left-=dt)<=0) h.linkGuard=null;
    h.surge -= dt;
    h.snared-=dt;
    h.lanternOut=Math.max(0,h.lanternOut-dt);
    h.snuffCooldown-=dt;
    h.flash = Math.max(0,h.flash-dt*4.3);
    const movement = Math.hypot(input.x,input.z);
    if (movement>.07 && h.rolling<=0 && !h.slash) {
      h.dx = input.x/movement; h.dz = input.z/movement;
      if (Math.abs(h.dx)>.14) h.face = Math.sign(h.dx);
    }
    if (this.buffered.dodge>0 && h.rollCool<=0 && h.rolling<=0) {
      const direction=this.buffered.dodgeDirection;
      this.buffered.dodge=0;
      this.buffered.dodgeDirection=null;
      h.rolling = h.rollDuration = .30;
      h.rollSpeed=13.6*(h.technique==='stride'?1.18:1);
      h.rollCool = h.rollTime;
      h.invulnerable = Math.max(h.invulnerable,.35);
      h.rollX = direction?.[0]??(movement>.07 ? input.x/movement : h.dx);
      h.rollZ = direction?.[1]??(movement>.07 ? input.z/movement : h.dz);
      if(direction) {
        h.dx=h.rollX; h.dz=h.rollZ;
        if(Math.abs(h.dx)>.14) h.face=Math.sign(h.dx);
      }
      h.rollOrigin={x:h.x,z:h.z};
      if (h.slash) h.atk=Math.min(h.atk,.20);
      this.interruptLink();
      h.slash = null;
      h.attackAge = 1;
      h.motion=null;
      this.audio.play('roll');
      this.view.spark(h.x,.2,h.z,0xe5b17b,13,.6);
    }
    if (h.rolling>0) {
      const previous=h.rush?{x:h.x,z:h.z}:null;
      this.moveUnit(h,h.rollX*h.rollSpeed*dt,h.rollZ*h.rollSpeed*dt,.38);
      if (previous) rushHit(this,previous);
      h.rolling -= dt;
      h.vx = h.rollX * 4; h.vz = h.rollZ * 4;
      if (h.rolling<=0) {
        if(h.rollOrigin)giftRoll(this,h.rollOrigin);
        h.rollOrigin=null;
        if (h.rushLink) finishLinkedRush(this);
        h.rush=null;
        h.rushLink=null;
      }
      if (h.rolling<=0 && h.ember) {
        this.view.shock(h.x,h.z,0xff783c,2.05,.64);
        for (const foe of this.enemies) if (distance(h,foe)<2.1) this.hit(foe,h.ember,h,.6,undefined,undefined,undefined,'blessing');
      }
    } else {
      const charging=h.slash?.move&&h.combo===3&&h.attackAge<h.slash.timing.hits[0].at;
      const haste=h.relicHaste?.until>this.t?h.relicHaste.speed:1;
      const speed = h.moveSpeed*haste*(charging?.55:h.attackAge<.18?.65:1)*(h.snared>0?.57:1);
      const drag = blend(movement>.07?18:22,dt);
      h.vx += (input.x*speed-h.vx)*drag;
      h.vz += (input.z*speed-h.vz)*drag;
      this.moveUnit(h,h.vx*dt,h.vz*dt,.38);
      const canFight=!this.discovery;
      while (h.slash?.timing&&h.attackAge>=h.slash.timing.hits[h.slash.next].at) this.landSlash();
      const ready=this.readyLink();
      const waitForHit=h.link?.pending&&!h.link.contacts.length;
      const queuesFinisher=!ready&&h.combo===2&&h.comboLeft>0&&h.atk<=.12&&this.buffered.strike>0;
      const cast=canFight&&!h.slash&&this.buffered.spell>0&&h.spellCool<=0&&!waitForHit&&!queuesFinisher;
      if (cast) {
        this.buffered.spell=0;
        this.cast(input,ready);
      } else if (canFight && !h.slash && this.buffered.strike>0 && h.atk<=0
          && !(waitForHit&&this.buffered.spell>0&&h.spellCool<=0)) {
        this.buffered.strike=0;
        this.attack(input);
      }
    }
    this.bound(h);
    h.move += (Math.min(1,Math.hypot(h.vx,h.vz)/5)-h.move)*blend(14,dt);
    if (this.discovery) {
      const near=this.closeToClue();
      this.ui.inspect.hidden=!near;
      if (near) {
        this.ui.inspect.querySelector('span').textContent=this.discovery.action;
        if (input.interact) this.interact();
      }
      return;
    }
    if(this.escape?.ready){
      const open=this.exitOpen()&&distance(h,this.escape)<1.78;
      this.ui.inspect.hidden=!open;
      if(open){this.ui.inspect.querySelector('span').textContent='穿過出口';if(input.interact)this.useExit();}
      return;
    }
    const arenaPoint=this.bossArena?.nearby(h);
    if (arenaPoint) {
      this.ui.inspect.hidden=false;
      this.ui.inspect.querySelector('span').textContent=this.bossArena.label(arenaPoint);
      if (input.interact) this.interact();
      return;
    }
    this.ui.inspect.hidden=true;
  }

  bound(unit) {
    unit.z=clamp(unit.z,roomBounds.minZ,roomBounds.maxZ);
    unit.x=clamp(unit.x,roomBounds.minX,roomBounds.maxX);
  }

  breakables() {return this.escape?.barricades.filter(item=>item.hp>0)??[];}

  isBlocked(unit,margin,previous) {
    return this.stage.props.some(prop=>distance(unit,prop)<prop.radius+margin)
      ||!!this.escape?.barricades.some(item=>item.hp>0&&distance(unit,item)<item.radius+margin)
      || !!this.bossArena?.blocks(unit,margin,previous);
  }

  moveUnit(unit,dx,dz,margin) {
    const oldX=unit.x, oldZ=unit.z;
    unit.x+=dx;
    this.bound(unit);
    if (this.isBlocked(unit,margin,{x:oldX,z:oldZ})) unit.x=oldX;
    const nextX=unit.x;
    unit.z+=dz;
    this.bound(unit);
    if (this.isBlocked(unit,margin,{x:nextX,z:oldZ})) unit.z=oldZ;
    return Math.hypot(unit.x-oldX,unit.z-oldZ);
  }

  weaponShot(dx,dz,target) {
    const hero=this.hero;
    const fallback={x:hero.x,y:.92,z:hero.z,dx,dz};
    if(!this.heroVisual?.weapon?.mount)return fallback;
    hero.projectileAim={dx,dz,until:this.t+.14};
    this.poseHero(0);
    const shot=this.view.weaponOrigin(this.heroVisual,dx,dz,target)??fallback;
    hero.projectileAim={dx:shot.dx,dz:shot.dz,until:this.t+.14};
    return shot;
  }

  aimedWeaponShot(target) {
    const hero=this.hero;
    const distance=Math.hypot(target.x-hero.x,target.z-hero.z);
    const origin=distance>.08?this.weaponShot((target.x-hero.x)/distance,(target.z-hero.z)/distance,target)
      :this.weaponShot(hero.dx,hero.dz,target);
    const {dx,dz}=origin;
    const reach=Math.max(.08,(target.x-origin.x)*dx+(target.z-origin.z)*dz);
    return {origin,dx,dz,reach};
  }

  attack(input) {
    const h = this.hero;
    h.projectileAim=null;
    const [dx,dz] = this.aim(input);
    h.dx = dx; h.dz = dz;
    if (Math.abs(dx)>.12) h.face = Math.sign(dx);
    h.combo = h.comboLeft>0 ? h.combo%3+1 : 1;
    const move=comboMove(this.weapon,h.combo);
    const speed=(this.branchCombat.activeMaw?.speed??1)*(h.relicHaste?.until>this.t?h.relicHaste.speed:1);
    const timing=comboTiming(this.weapon,move,h.attackPeriod/speed);
    h.comboLeft=timing.cycle+.57;
    h.atk=h.atkTotal=timing.cycle;
    h.attackAge = 0;
    h.slash={dx,dz,move,timing,next:0,step:h.combo,confirmed:false};
    if (h.combo===3) {
      h.link={pending:true,until:0,window:linkWindow+linkResonances.wind.window[h.resonance.wind],contacts:[],dx,dz};
      h.slash.link=h.link;
    }
    heroAction(h,'strike',move,timing);
    this.audio.attack(this.weapon.id,h.combo,'wind');
  }

  landSlash() {
    const h=this.hero, strike=h.slash;
    const {dx,dz}=strike;
    const move=strike.move??comboMove(this.weapon,h.combo);
    const step=strike.step??h.combo;
    const index=strike.next??0;
    const pulse=strike.timing?.hits[index];
    if (!strike.timing||++strike.next>=strike.timing.hits.length) h.slash=null;
    if (index===0&&move.step) this.moveUnit(h,dx*move.step,dz*move.step,.38);
    const final=step===3;
    const link=strike.link;
    const confirm=hits=>{
      if (!hits||this.state!=='play') return;
      this.hitstop = Math.max(this.hitstop,final?.061:.026);
      this.view.shake = Math.max(this.view.shake,final?.177:.074);
      if (final&&!strike.confirmed) invokeSchool(this,'wind');
      strike.confirmed=true;
    };
    this.audio.attack(this.weapon.id,step,'release',index);
    confirm(strikeWith(this,dx,dz,move,pulse?.power??1,confirm,link?(unit,kind)=>{
      this.confirmLink(link,unit,kind);
      giftFinisher(this,strike,unit,kind);
    }:undefined));
    if (link) {
      const travel=strikeTravel(move,h.reach*move.reach,true);
      const settle=()=>{
        link.pending=false;
        if (h.link===link&&!link.contacts.length) h.link=null;
      };
      if (travel) this.schedule(travel+.001,settle);
      else settle();
    }
  }

  confirmLink(link,unit,kind) {
    const h=this.hero;
    if (h.link!==link||h.spellCool>link.window||link.contacts.some(mark=>mark.unit===unit)) return;
    const first=link.contacts.length===0;
    if (link.contacts.length===6&&kind==='break'&&!link.contacts.some(mark=>mark.kind==='break')) link.contacts.pop();
    if (link.contacts.length<6) link.contacts.push({unit,kind,x:unit.x,z:unit.z});
    if (first) {
      link.until=this.t+link.window;
      if (h.spellCool<=0) this.audio.link(this.weapon.id,false);
    }
    if (this.weapon.id==='flameblade'&&link.contacts.length<=3) this.view.sealFx(unit.x,unit.z,this.weapon.tone,.72,.92);
    if (this.weapon.id==='stormbow'&&first) this.view.spark(unit.x,1.04,unit.z,this.weapon.tone,9,.79);
  }

  readyLink() {
    const h=this.hero;
    return h.spellCool<=0&&h.link?.until>this.t?h.link:null;
  }

  interruptLink() {
    if (this.hero.link?.pending&&!this.hero.link.contacts.length) {
      this.hero.link=null;
      this.buffered.spell=0;
    }
  }

  cast(input,link=this.readyLink()) {
    const h = this.hero;
    this.view.releaseSigil(h);
    this.view.castElements(h,this.weapon);
    h.spellCool = h.spellTime;
    h.link=null;
    if (link) {
      const profile=skillLinks[this.weapon.id];
      const fusion=this.fusionForLink(link);
      const wind=profile.wind+(fusion?.ultimate?.065:0);
      const recovery=.22-linkResonances.wind.recovery[h.resonance.wind];
      if (fusion?.ultimate) launchUltimate(this,link,wind,fusion);
      else invokeLinkedArm(this,link,wind,fusion);
      if (!h.rush) heroAction(h,'link',profile,{cycle:wind+recovery,hits:[{at:wind}]});
      h.atk=h.rush ? .26 : wind+recovery;
      h.atkTotal=h.atk;
      h.combo=h.comboLeft=0;
      h.linkFlash=fusion?.ultimate?1.13:.77;
      h.linkFusion=fusion;
      if (h.resonance.ward) {
        h.linkGuard={left:2.8,scale:1-linkResonances.ward.guard[h.resonance.ward],fusion:fusion?.id==='counter'?fusion:null};
        this.view.sealFx(h.x,h.z,0xa9eee0,1.10,.46);
      }
      this.audio.link(this.weapon.id,true);
      giftCast(this,link);
    } else {
      invokeArm(this,input);
      if (!h.rush) heroAction(h,'cast');
      h.atk=Math.max(h.atk,.16);
      this.audio.arm(this.weapon.id);
    }
    invokeSchool(this,'fire');
    this.view.shake = Math.max(this.view.shake,.12);
  }

  schedule(delay, fire) {
    this.rituals.push({delay,fire});
  }

  updateRituals(dt) {
    const pending=this.rituals;
    this.rituals=[];
    for (const event of pending) {
      event.delay-=dt;
      if (event.delay>0) this.rituals.push(event);
      else event.fire();
    }
  }

  impact(unit,origin,kind,tint) {
    if (kind==='break'&&unit.attack) {
      unit.attack.interrupted=true;
      unit.attack=null;
      unit.motion=null;
    }
    recoil(unit,origin,kind);
    this.view.impact(unit,origin,kind,tint);
    const material=unit.spec?.guard?'armor':unit.spec?.effect==='stone'?'stone':'hide';
    this.audio.impact(kind,material);
    const shake=kind==='break'?.19:kind==='heavy'?.13:kind==='fall'?.12:0;
    this.view.shake=Math.max(this.view.shake,shake);
    if (kind==='break') this.hitstop=Math.max(this.hitstop,.066);
  }

  hit(unit,amount,origin,knock,tint=this.weapon.tone,weight,report,source) {
    const damage=amount*(this.branchCombat.activeMaw?.damage??1);
    if (unit.kind==='arenaAnchor') return this.bossArena?.hit(unit,damage)??false;
    if (unit.kind==='breakable') {
      if(unit.hp<=0)return false;
      unit.hp=Math.max(0,unit.hp-damage);
      this.view.spark(unit.x,.42,unit.z,unit.hp?0xd3a779:0xffc484,unit.hp?5:14,.91,unit.style==='urn'?'stone':'flare');
      if(!unit.hp){this.view.lanternArt.smash(unit);this.audio.impact('break',unit.style==='urn'?'stone':'hide');}
      return true;
    }
    if (unit.hp<=0 || unit.age<.23 || unit.phaseGuard>0) return false;
    const boss=unit.kind==='boss';
    const primary=this.bossArena?.boss===unit;
    if (primary&&this.bossArena.locked) {
      this.bossArena.rejectHit(origin);
      return false;
    }
    const phaseBoundary=boss ? unit.spec.phases[unit.bossPhase]??0 : 0;
    const nextPhaseHp=phaseBoundary*unit.spec.hp;
    const shield=unit.spec.guard&&unit.guardOpen<=0&&unit.attack&&unit.attack.time>unit.spec.time*.34;
    const heavy=weight==='heavy'||(!weight&&(Math.abs(knock)>=1.21||amount>=this.hero.damage*1.44));
    const before=unit.hp;
    unit.hp -= damage*(unit.exposed>0?1.24:1)*(shield?(unit.omen?.id==='husk'&&!heavy?.55:.73):1);
    if (phaseBoundary) unit.hp=Math.max(nextPhaseHp,unit.hp);
    this.practiceRun?.damage.record(source,before,unit.hp);
    const kind=unit.hp<=0?'fall':shield?(heavy?'break':'block'):heavy?'heavy':'light';
    if (kind==='break') {
      unit.guardOpen=1.48;
      unit.exposed=Math.max(unit.exposed,1.48);
    }
    const support=source==='support';
    if (!support||kind==='fall') {
      this.impact(unit,origin,kind,tint);
      unit.stun=unit.kind==='boss'?.033:kind==='break'?.31:.14;
    } else this.view.spark(unit.x,unit.spec.height*.48,unit.z,tint,4,.65,'flare');
    if (unit.raider && distance(this.hero,unit)<4.8) unit.lured=1.45;
    const len = Math.max(.05,distance(unit,origin));
    unit.kx += (unit.x-origin.x)/len*knock*4.4/unit.spec.mass;
    unit.kz += (unit.z-origin.z)/len*knock*4.4/unit.spec.mass;
    if (phaseBoundary && unit.hp<=nextPhaseHp) {
      this.advanceBossPhase(unit);
    }
    if (unit.hp<=0) {
      this.kills++;
      if (boss) this.floorBossesDefeated++;
      const h = this.hero;
      h.hp = Math.min(h.maxHp,h.hp+h.leech);
      this.fallen.push(unit);
      this.branchCombat.activeMaw?.defeat(this,unit);
      giftKill(this,unit);
      if(unit.spec.deathOmen||unit.omen?.id==='grudge')this.deathOmen(unit);
      if (boss) this.view.bossCue(unit,'defeat');
      unit.hunt?.defeat();
      if (unit.kind!=='boss' && (this.kills%4===0 || Math.random()<.10)) this.drop(unit);
    }
    report?.(unit,kind);
    return true;
  }

  advanceBossPhase(unit) {
    const primary=this.bossArena?.boss===unit;
    unit.bossPhase++;
    unit.phaseGuard=.91;
    unit.step=Math.max(unit.step,unit.bossPhase);
    if(primary)this.bossArena.transform(unit.bossPhase);
    this.beginEnemyAttack(unit,unit.spec.finishing??unit.spec.attacks[0]);
    this.view.bossCue(unit,'phase');
    this.view.spark(unit.x,2.6,unit.z,unit.spec.tint,34,1.43,unit.spec.effect);
    const terrain=primary?this.bossArena?.plan:null;
    const form=unit.bossPhase===2?'最後攻勢':unit.spec.form;
    const title=primary&&this.bossArena?.aftershock?'場地再變':terrain?.title;
    this.announce(unit.spec.name,form+(title?' · '+title:''),terrain?.hint??unit.spec.signature,2.0);
    this.audio.boss(unit.spec.effect,true);
  }

  deathOmen(unit) {
    if(this.hazards.filter(hazard=>hazard.deathOmen).length>=3)return;
    const {x,z}=unit,delay=.67,radius=unit.omen?.id==='grudge'?2.19:1.83;
    const tint=0xff7d7f;
    this.hazards.push({kind:'circle',x,z,radius,delay,damage:unit.spec.hurt*.69,owner:null,tint,effect:'fire',pattern:'burst',deathOmen:true});
    this.view.warning('circle',x,z,radius,delay,0,0,tint);
  }

  drop(unit) {
    const pickup = {x:unit.x,z:unit.z,life:13,visual:this.view.createActor(8,.91)};
    this.pickups.push(pickup);
    this.view.spark(unit.x,.38,unit.z,0xffdfa5,12,.74);
  }

  hurt(amount,x,z,attacker,pattern) {
    const h = this.hero;
    if (h.invulnerable>0 || this.state!=='play') return false;
    const guarded=h.ward>0;
    const barrier=h.linkGuard;
    h.linkGuard=null;
    const trained=h.technique==='ward'&&!h.trainingWardSpent&&amount>0;
    if (trained) h.trainingWardSpent=true;
    h.hp = Math.max(0,h.hp-amount*(1-h.armor)*(guarded?.24:1)*(barrier?.scale??1)*(trained?.55:1));
    if (h.hp===0&&this.branchCombat.revive(this)) return true;
    h.invulnerable = .64;
    if (h.hp>0&&h.snuffCooldown<=0&&pattern==='marked'&&(attacker?.kind==='cultist'||attacker?.kind==='oracle')) {
      h.lanternOut=2.15;
      h.snuffCooldown=11;
      this.announce('提燈熄滅','小心埋伏','燈火即將自行重燃',1.7);
      this.audio.play('snuff');
    }
    const heavy=['cleave','pounce','lance','burst','counterCharge','sweep','arenaBait'].includes(pattern)
      || amount>=h.maxHp*.15;
    const origin=Math.hypot(h.x-x,h.z-z)<.18&&attacker ? attacker : {x,z};
    const blocked=guarded||barrier||trained;
    const kind=h.hp===0?'fall':blocked?'block':heavy?'heavy':'light';
    this.impact(h,origin,kind,blocked?0x91eee0:0xffad7d);
    if (barrier||trained) this.view.shock(h.x,h.z,trained?0xffba7b:0xa9eee0,1.65,.63);
    const len = Math.max(.15,Math.hypot(h.x-x,h.z-z));
    this.moveUnit(h,(h.x-x)/len*.48,(h.z-z)/len*.48,.38);
    this.interruptLink();
    h.slash = null;
    h.motion=null;
    this.bound(h);
    this.damageFlash = blocked?.24:heavy?.70:.42;
    this.hitstop = Math.max(this.hitstop,heavy?.061:.032);
    if (guarded&&this.weapon.id==='turtle') reflectHit(this,attacker);
    if(guarded&&h.hp>0)relicCounter(this,attacker);
    if (barrier?.fusion&&h.hp>0) dischargeFusion(this,attacker,barrier.fusion);
    giftHurt(this,guarded,barrier);
    if (h.hp>0) invokeSchool(this,'ward',attacker);
    if (h.hp===0) {
      clearUltimates(this);
      h.rolling=0;
      h.ward=0;
      h.move=0;
      this.state='falling';
      this.audio.active=false;
      this.input.reset();
      this.ui.inspect.hidden=true;
    }
    return true;
  }

  lanternTarget() {
    return this.mission?.started && !this.mission.finished && this.mission.light>0 ? this.mission.plan.altar : null;
  }

  enemyTarget(unit) {
    return unit.raider && !(unit.lured>0) ? this.lanternTarget()??this.hero : this.hero;
  }

  beginEnemyAttack(unit,forcedPattern) {
    const h=this.enemyTarget(unit), spec=unit.spec;
    const d=Math.max(.05,distance(unit,h));
    const dx=(h.x-unit.x)/d, dz=(h.z-unit.z)/d;
    if (Math.abs(dx)>.1) unit.face=Math.sign(dx);
    const boss=unit.kind==='boss';
    const phase=unit.bossPhase;
    let index=unit.step++;
    if (!boss) index+=this.stage.room+this.wave;
    let pattern=forcedPattern??(spec.finishing&&phase&&index%3===2?spec.finishing:spec.attacks[index%spec.attacks.length]);
    if (unit.kind==='oracle'&&this.stage.room>=6&&unit.step%4===0) {
      pattern=this.stage.enemyPattern==='summon'?'marked':this.stage.enemyPattern;
    }
    if (pattern==='summon'&&unit.summons>=2) pattern='prison';
    const time=spec.time*(1-phase*.12);
    unit.attack={pattern,time,windup:time,dx,dz};
    unit.attack.landing=telegraph(this,pattern,unit,h,{delay:time,damage:spec.hurt+phase*5,radius:spec.radius,owner:unit,phase});
    unit.hunt?.signature(unit.attack,!!forcedPattern);
    if(unit.omen?.id==='echo'&&this.hazards.length<13)telegraph(this,'marked',unit,h,{delay:time+.46,damage:spec.hurt*.58,radius:1.27,owner:unit});
    if (boss && phase>=1 && index%3===2) {
      const echo=spec.attacks[(index+1)%spec.attacks.length];
      telegraph(this,['summon','blink','rally'].includes(echo)?'marked':echo,unit,h,
        {delay:time+.52,damage:spec.hurt*.72,radius:spec.radius*.72,owner:unit,phase});
    }
    this.audio.play('warning');
  }

  resolveEnemyAttack(unit) {
    const attack=unit.attack;
    const boss=unit.kind==='boss';
    unit.attack=null;
    unit.motion={pattern:attack.pattern,dx:attack.dx,dz:attack.dz,age:0};
    unit.recover=boss?.56-unit.bossPhase*.08:.29;
    unit.cool=(boss?1.16-unit.bossPhase*.19:1.21/this.stage.pace)+random(.12,.45);
    if (attack.pattern==='pounce') {
      const impulse=boss?19:15;
      unit.kx=attack.dx*impulse;
      unit.kz=attack.dz*impulse;
    }
    if (attack.landing) {
      const {x,z}=attack.landing;
      this.view.bolt({x:unit.x,y:.72,z:unit.z},{x,y:.61,z},unit.spec.tint,1.65);
      unit.x=x;
      unit.z=z;
      this.view.spark(x,.58,z,unit.spec.tint,18,.86,'void');
    }
    this.view.elementBurst(unit.x,unit.spec.height*.38,unit.z,unit.spec.tint,unit.spec.effect,boss?12:6,
      boss?1.14:.83,Math.atan2(attack.dz,attack.dx));
    this.audio.release(attack.pattern,boss);
    if (boss) {
      if(this.bossArena?.boss===unit)this.bossArena.counters.resolveAttack(attack);
      this.view.shake=Math.max(this.view.shake,.13);
    }
  }

  updateEnemies(dt,drill) {
    const eye=this.branchCombat.skills.has('black-goat-eye')?this.branchCombat.eye:null;
    for (const unit of this.enemies) {
      if (unit.hp<=0) continue;
      const spec=unit.spec;
      unit.age+=dt;
      if (unit.motion) unit.motion.age+=dt;
      unit.guardOpen-=dt;
      unit.flash=Math.max(0,unit.flash-dt*5);
      unit.stun-=dt;
      unit.recover-=dt;
      unit.cool-=dt;
      unit.chill-=dt;
      unit.exposed-=dt;
      unit.phaseGuard-=dt;
      unit.morale-=dt;
      if (unit.lured>0) unit.lured-=dt;
      if (unit.frozen>0) {
        unit.frozen-=dt;
        unit.move=unit.kx=unit.kz=0;
        continue;
      }
      const arena=this.bossArena?.boss===unit?this.bossArena:null;
      if (arena?.counters.stagger>0||arena?.counters.moveCharge(dt)) continue;
      const lunging=unit.motion?.pattern==='pounce'&&unit.motion.age<.31;
      const old=lunging?{x:unit.x,z:unit.z}:null;
      this.moveUnit(unit,unit.kx*dt,unit.kz*dt,.35);
      if (old) this.view.motion.enemyTrail(old,unit);
      unit.kx*=Math.exp(-dt*10); unit.kz*=Math.exp(-dt*10);
      unit.move*=Math.exp(-dt*13);
      if (unit.attack) {
        unit.attack.time-=dt;
        if (unit.attack.time<=0) this.resolveEnemyAttack(unit);
        continue;
      }
      if (unit.age<.38 || unit.stun>0 || unit.recover>0) continue;
      const h=this.enemyTarget(unit);
      const dist = Math.max(.045,distance(h,unit));
      const dx=(h.x-unit.x)/dist, dz=(h.z-unit.z)/dist;
      if (Math.abs(dx)>.14) unit.face=Math.sign(dx);
      const attackRange=h===this.hero ? spec.reach : Math.min(spec.reach,spec.ranged??1.85);
      const exercise=arena?drill:null;
      if (unit.cool<=0&&arena) {
        if (arena.counters.tryCharge(dist)) continue;
        if (!exercise?.focused&&dist<attackRange+3.2&&arena.tactics.tryAttack()) continue;
      }
      if (dist<attackRange&&unit.cool<0&&(!exercise?.focused||exercise.attack)) {
        this.beginEnemyAttack(unit,exercise?.attack);
        continue;
      }
      const target = h!==this.hero ? attackRange*.64 : exercise?.followRange??spec.ranged??(unit.kind==='boss'?2.8:spec.reach*.67);
      const direction = dist>target ? 1 : spec.ranged&&dist<target*.63 ? -.82 : 0;
      let sx=0,sz=0;
      for (const other of this.enemies) {
        if (unit===other || other.hp<=0) continue;
        const between=distance(unit,other);
        if (between>.02 && between<1.30) {
          sx+=(unit.x-other.x)/between*(1.30-between)*2.3;
          sz+=(unit.z-other.z)/between*(1.30-between)*2.3;
        }
      }
      const boss=unit.kind==='boss';
      const chilled=unit.chill>0?(boss?.81:.57):1;
      const marked=eye?.contains(this.hero,unit)?(boss?.84:.65):1;
      const aggression = (1+unit.bossPhase*.17)*Math.min(chilled,marked)*(unit.morale>0?1.31:1)
        *(unit.omen?.id==='hunt'&&unit.hp<unit.spec.hp*.5?1.31:1);
      const advance=direction*spec.speed*aggression*dt;
      const traveled=this.moveUnit(unit,dx*advance+sx*dt,dz*advance+sz*dt,.35);
      if (direction && traveled<Math.abs(advance)*.38) {
        const side=unit.phase>Math.PI?-1:1;
        const sidestep=Math.abs(advance)*side;
        if (this.moveUnit(unit,-dz*sidestep,dx*sidestep,.35)<Math.abs(sidestep)*.35) {
          this.moveUnit(unit,dz*sidestep,-dx*sidestep,.35);
        }
      }
      unit.move=Math.min(1,unit.move+Math.abs(direction)*dt*9);
    }
    this.enemies = this.enemies.filter(unit=>unit.hp>0);
  }

  updateHazards(dt) {
    if (this.stage.hazard && this.enemies.length) {
      this.ambientClock-=dt;
      if (this.ambientClock<=0) {
        const {zone,room,bearing,damage,hazard}=this.stage;
        const origin={x:Math.cos(bearing)*4.9,z:-3.8+Math.sin(bearing)*1.8};
        telegraph(this,hazard,origin,this.hero,{delay:1.05+(room%4)*.11,damage:(7+zone.frame*.39)*damage,radius:1.34+room*.08});
        this.ambientClock=Math.max(3.05,(7.1-room*.19-this.stage.chapter*.13)/this.difficulty.pace);
      }
    }
    advanceThreats(this,dt);
  }

  clearThreats() {
    clearUltimates(this);
    this.relicWalls.length=0;
    for (const hazard of this.hazards) {
      if (hazard.visual) this.view.removeProjectile(hazard.visual);
    }
    this.hazards.length=0;
  }

  updatePickups(dt) {
    this.pickups = this.pickups.filter(item=>{
      item.life-=dt;
      const h=this.hero;
      const d=distance(h,item);
      if (d<.78 || item.life<=0) {
        if (d<.78) {
          h.hp=Math.min(h.maxHp,h.hp+11);
          this.audio.play('blessing');
          this.view.spark(item.x,.56,item.z,0xffdd9a,12,.65);
        }
        this.view.removeActor(item.visual);
        return false;
      }
      if (d<2.2) {
        item.x+=(h.x-item.x)*dt*3.4;
        item.z+=(h.z-item.z)*dt*3.4;
      }
      return true;
    });
  }

  updateFlow(dt) {
    if(this.duelMonster){
      if(!this.enemies.some(unit=>unit.kind==='boss'&&unit.hp>0))this.finishMonsterDuel();
      return;
    }
    if (this.discovery) return;
    const exit=this.escape;
    if(exit&&!exit.found&&this.hero.lanternOut<=0&&distance(this.hero,exit)<lanternRadius(this.stage)*.96){
      exit.found=true;
      if(exit.ready)this.audio.play('blessing');
    }
    if(exit?.ready){if(!exit.passed)this.updateEscape(dt);return;}
    if (this.startDelay !== Infinity) {
      this.startDelay-=dt;
      if (this.startDelay<=0) {
        if (this.mission) {
          this.startDelay=Infinity;
          this.mission.start();
        } else this.startWave();
      }
      return;
    }
    if (this.mission?.started) {
      this.mission.tick(dt);
      return;
    }
    if (this.enemies.length) return;
    this.clearDelay+=dt;
    if (this.clearDelay<.89) return;
    this.clearDelay=0;
    this.clearThreats();
    this.rituals.length=0;
    if (this.wave<this.stage.waves.length) {
      this.announce('結界再起','下一波','月蝕正在召喚更多的影子。',1.2);
      this.startDelay=1.18;
    } else {
      this.completeRoom();
    }
  }

  completeRoom(message,retreat=false) {
    if (this.state!=='play'||this.escape?.ready) return;
    if (this.mission) this.mission.finished=true;
    this.recordFieldNotes();
    this.ui.inspect.hidden=true;
    this.ui['mission-status'].hidden=true;
    this.ui['boss-hud'].hidden=true;
    this.clearThreats();
    this.rituals.length=0;
    if (retreat) {
      for (const enemy of this.enemies) this.view.spark(enemy.x,.55,enemy.z,this.stage.zone.color,10,.48);
      this.clearActors();
    }
    this.bossArena=null;
    this.audio.danger=false;
    this.view.setBossArena(null);
    this.setupMissionPins();
    this.ui.hud.dataset.mission='escape';
    this.escape.ready=true;
    this.escape.message=message;
    this.escape.found||=this.hero.lanternOut<=0&&distance(this.hero,this.escape)<lanternRadius(this.stage)*.96;
    this.announce('封印解除','尋找出口','留意北面拱門。黑暗入面仲有嘢跟住你。',1.95);
    this.updateEscape(0);
  }

  exitOpen() {
    return this.escape?.ready&&!this.escape.passed&&this.escape.barricades.every(item=>!item.gate||item.hp<=0);
  }

  useExit() {
    if(this.state!=='play'||!this.exitOpen()||distance(this.hero,this.escape)>=1.78)return false;
    this.escape.passed=true;
    this.clearThreats();this.rituals.length=0;this.clearActors();
    this.ui.inspect.hidden=true;
    const reward=milestones[this.difficulty.id].find(item=>item.floor===this.stage.floor);
    const gold=floorGold(this.stage);
    const unlocked=this.progress.clear(this.difficulty.id,this.stage.floor,gold,reward?.id==='crimson');
    this.runGold+=gold;
    if (reward?.id==='redraw') this.redraws++;
    if (unlocked) this.hero.lanternStyle='crimson';
    if (reward?.id==='twins'&&this.floorBossesDefeated>=2) this.twinReward={offers:new Map()};
    const notice=unlocked||reward?.id==='redraw'||this.twinReward ? reward : null;
    this.floorReward={gold,notice};
    this.blessing(this.escape.message);
    return true;
  }

  updateEscape(dt) {
    const exit=this.escape;
    const gateLeft=exit.barricades.filter(item=>item.gate&&item.hp>0).length;
    exit.searchTime+=dt;
    const dx=exit.x-this.hero.x,dz=exit.z-this.hero.z;
    const compass=(Math.abs(dx)>2?(dx<0?'西':'東'):'')+(Math.abs(dz)>2?(dz<0?'北':'南'):'');
    this.objective(exit.found?(gateLeft?'找到出口 · 擊破路障 '+(2-gateLeft)+'/2':'出口已開 · '+(compass||'靠近拱門'))
      :'提燈找出口 · '+(exit.searchTime>7&&compass?'往'+compass:'沿北面牆搜尋'));
    if(exit.found)return;
    exit.clock-=dt;
    if(exit.clock>0||this.enemies.length>=4)return;
    const count=this.stage.floor>=35?2:1;
    const visibility=lanternRadius(this.stage);
    const prowlRadius=visibility+1.25;
    let spawned=false;
    exit.clock=Math.max(2.0,4.5-this.stage.floor*.019)/this.difficulty.pace;
    for(let i=0;i<count;i++){
      let spot;
      for(let attempt=0;attempt<9;attempt++){
        const a=exit.seed+(exit.prowls+i)*2.399+attempt*.78;
        const p={x:this.hero.x+Math.cos(a)*prowlRadius,z:this.hero.z+Math.sin(a)*prowlRadius};
        this.bound(p);
        if(distance(this.hero,p)>visibility+.32&&!this.isBlocked(p,.68)){spot=p;break;}
      }
      if(!spot)continue;
      const zone=this.stage.zone.foes;
      const kind=zone[(this.stage.room+exit.prowls+i*2)%zone.length];
      const unit=this.spawn(kind,spot.x,spot.z);
      unit.prowler=true;
      spawned=true;
    }
    if(spawned)this.audio.play('warning');
    exit.prowls+=count;
  }

  setupMissionPins() {
    const arena=this.bossArena?.phase>0;
    const points=arena ? this.bossArena.points : [];
    this.pins=points.map(point=>{
      const element=document.createElement('i');
      element.textContent=point.symbol??'✧';
      element.hidden=true;
      if (arena) element.classList.add('arena-pin');
      return {point,element};
    });
    this.ui['mission-pins'].replaceChildren(...this.pins.map(pin=>pin.element));
  }

  updateMissionPins() {
    if (this.bossArena?.phase>0) {
      const {width,height}=this.view;
      const arena=this.bossArena;
      for (const {point,element} of this.pins) {
        element.hidden=!arena.locked||point.done||arena.boss.hp<=0;
        if (element.hidden) continue;
        const screen=this.view.project(point.x,arena.plan.mode==='hold'?.52:1.35,point.z);
        const x=clamp(screen.x,24,width-24);
        const y=clamp(screen.y,Math.min(136,height*.32),Math.max(height-150,height*.72));
        element.classList.toggle('edge',x!==screen.x||y!==screen.y);
        element.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px) translate(-50%,-50%)';
      }
    }
  }

  poseHero(dt) {
    const h=this.hero, t=this.t;
    const isRoll=h.rolling>0;
    const action=heroPose(h);
    const knockedDown=h.reaction?.kind==='fall';
    const gait=dt?(h.poseGait=actorMotion(h,dt,t,true)):(h.poseGait??{weight:0,width:1,sway:0,bob:0,tilt:0,compression:0,lag:0});
    const running=gait.weight>.26;
    const bracing=h.reaction&&h.reaction.age<.16;
    const striking=action&&(h.attackAge>.055||h.motion?.kind!=='strike');
    const pose=knockedDown||bracing?heroFrames.recoil:isRoll?heroFrames.run:striking?heroFrames.attack
      :running?heroFrames.run:heroFrames.idle;
    const rollPhase=isRoll?clamp(1-h.rolling/h.rollDuration,0,1):0;
    const tuck=Math.sin(rollPhase*Math.PI);
    const movingLimbs=!action&&!bracing&&!isRoll;
    const heroFrame={
      dt,shot:!isRoll&&h.projectileAim?.until>t?h.projectileAim:null,
      frame:pose,poseSize:isRoll?.92:pose===heroFrames.run?.93:1,face:action?.face??h.face,
      bob:isRoll?.024+tuck*.26:.037+gait.bob+Math.sin(t*4.1)*.018,
      tilt:isRoll?0:-gait.tilt,
      squash:isRoll?1-tuck*.32:1-gait.compression*.7,
      stretch:gait.width*(1+tuck*.13),
      sway:gait.sway,lag:gait.lag+(action?.grip.sweep??0)*.017,
      compression:isRoll?tuck*.071:gait.compression,
      stride:movingLimbs?gait.swing:0,footLift:movingLimbs?gait.footLift:0,
      feet:movingLimbs&&running?gait.foot:null,
      armReach:action?clamp((action.grip.reach-.25)*.13,-.075,.12):0,
      armLift:action?clamp((action.grip.raise-.26)*.21,-.10,.17):0,
      roll:isRoll&&!h.rush?-h.face*rollPhase*TAU:0,
      flash:h.flash,fade:h.invulnerable>0 && !isRoll && Math.sin(t*33)<-.35 ? .74 : 1,
      aura:h.ward>0||h.surge>0?.55:.24,rim:this.weapon.tone,
    };
    this.view.actor(this.heroVisual,h,blendPose(blendPose(heroFrame,action),reactionPose(h)));
  }

  poseEnemy(unit,dt) {
    const t=this.t;
    advanceReaction(unit,dt);
    const boss=unit.kind==='boss';
    const primary=this.bossArena?.boss===unit;
    const shielded=primary&&this.bossArena?.locked;
    const staggered=primary&&this.bossArena?.counters.stagger>0;
    const frozen=unit.frozen>0;
    const wind=unit.attack ? 1-clamp(unit.attack.time/(unit.attack.windup??unit.spec.time),0,1) : 0;
    const gait=actorMotion(unit,dt,t);
    const stepping=!unit.attack&&!unit.reaction&&!staggered&&!frozen;
    const fierce=unit.bossPhase>0;
    const owlDive=!unit.spec.bestiary&&unit.spec.frame===6&&(wind>.42||unit.recover>.37);
    const frame={
      frame:owlDive?7:unit.spec.frame,face:unit.face,flash:unit.flash,ink:unit.spec.ink,
      poseSize:owlDive?.84:1,
      bob:gait.bob+(boss?.035:0),fade:Math.min(1,unit.age*4.5),
      squash:1-gait.compression,
      stretch:gait.width,
      tilt:staggered?unit.face*-.25+gait.step*.052:-gait.tilt,
      sway:gait.sway-unit.face*wind*.036,
      lag:gait.lag+Math.sin(wind*Math.PI)*.037,
      compression:gait.compression+Math.sin(wind*Math.PI)*.045,
      stride:stepping?gait.swing:0,footLift:stepping?gait.footLift:0,
      feet:stepping&&gait.weight>.34?gait.foot:null,
      warm:fierce?.42:0,
      aura:frozen?.90:staggered?.82:unit.phaseGuard>0||shielded?.65:unit.omen?.61:unit.chill>0||unit.exposed>0?.38:unit.attack||boss?.25:.09,
      rim:frozen?0xb9f9ff:staggered?0x9ff4e4:shielded?this.bossArena.terrain.ink:unit.omen?.tint??(unit.chill>0?0x8de2de:unit.morale>0?0xffd48b:unit.exposed>0?0xff8255:unit.spec.tint),
      phase:unit.bossPhase,
    };
    this.view.actor(unit.visual,unit,blendPose(blendPose(frame,staggered?null:enemyPose(unit)),reactionPose(unit,boss)));
  }

  animateActors(dt) {
    const h=this.hero, t=this.t;
    this.branchCombat.activeMaw?.update(t);
    advanceReaction(h,dt);
    if(h.reaction?.kind==='fall')this.playLanding(h);
    this.poseHero(dt);
    this.view.setWard(h);
    for (const unit of this.enemies) {
      if (unit.hp<=0) continue;
      this.poseEnemy(unit,dt);
    }
    this.fallen=this.fallen.filter(unit=>{
      if(unit.maw&&maw) {
        const visible=maw.poseVictim(unit,t);
        if(!visible) this.view.removeActor(unit.visual);
        return visible;
      }
      advanceReaction(unit,dt);
      this.playLanding(unit);
      if (unit.reaction.age>=reactionTime.fall) {
        this.view.removeActor(unit.visual);
        return false;
      }
      this.view.actor(unit.visual,unit,blendPose({frame:unit.spec.frame,face:unit.face,flash:0,
        fade:1,squash:1,tilt:0,bob:0,aura:.03,phase:unit.bossPhase},reactionPose(unit)));
      return true;
    });
    for (const item of this.pickups) this.view.actor(item.visual,item,{frame:8,bob:.34+Math.sin(t*4.4)*.15,aura:.55,rim:0xffbf78});
  }

  playLanding(unit) {
    const reaction=unit.reaction;
    if (reaction.age<.32||reaction.landed) return;
    reaction.landed=true;
    this.view.fallDust(unit);
  }

  step(dt,input) {
    if (this.state==='fracture'||this.state==='gm') {
      this.updateFailure(dt);
      return;
    }
    if (this.state==='falling') {
      this.animateActors(dt);
      if (this.hero.reaction.age>=reactionTime.fall) this.finish(false);
      return;
    }
    this.buffered.dodge = input.dodge ? .39 : this.buffered.dodge-dt;
    if(input.dodge) this.buffered.dodgeDirection=input.dodgeDirection??null;
    const h=this.hero;
    const finishing=h.link?.pending||(h.combo===2&&h.comboLeft>0&&h.atk<.14&&(input.strike||this.buffered.strike>0));
    this.buffered.spell = input.spell ? (finishing?.96:.35) : this.buffered.spell-(this.hitstop>0?0:dt);
    this.buffered.strike = input.strike ? Math.max(.23,this.hero.atk+.09) : this.buffered.strike-dt;
    if (this.hitstop>0) {
      this.hitstop-=dt;
      return;
    }
    this.elapsed+=dt;
    this.t+=dt;
    this.branchCombat.activeMaw?.expire(this.t);
    this.updateHero(dt,input);
    if (this.state!=='play') return;
    this.updateRituals(dt);
    if (this.ultimateFields.length) updateUltimates(this,dt);
    this.branchCombat.update(this,dt);
    this.updateEnemies(dt);
    this.relicHunt?.tick(dt);
    if(this.relicWalls.length)this.relicWalls=this.relicWalls.filter(wall=>wall.until>this.t);
    this.bossArena?.tick(dt);
    this.updateHazards(dt);
    if (this.state==='play'&&!this.discovery&&this.enemies.length) invokeSchool(this,'thunder');
    if (this.state==='play') {
      this.updatePickups(dt);
      this.updateFlow(dt);
    }
    this.animateActors(dt);
  }

  renderUI() {
    if(this.practiceRun)this.paintDamage(this.practiceRun.damage);
    const h=this.hero;
    const maw=this.branchCombat.activeMaw;
    const stacks=maw?.stacks??0;
    const support=stacks?`噬食 ×${stacks} · ${Math.ceil(maw.remaining(this.t))} 秒`
      :this.branchCombat.skills.has('medic')?(this.branchCombat.reviveReady?'✚ 急救可用':'✚ 急救已用')
      :this.branchCombat.skills.has('radar')?'◉ 雷達運作中':'';
    const badge=this.ui['field-support'];
    badge.classList.toggle('maw-stacks',stacks>0);
    if(badge.textContent!==support) badge.textContent=support;
    badge.hidden=!support;
    const hp=fixed(h.hp);
    const label=hp+' / '+h.maxHp;
    if (this.ui['hp-number'].textContent!==label) {
      this.ui['hp-number'].textContent=label;
      this.ui['hp-fill'].style.transform='scaleX('+h.hp/h.maxHp+')';
      this.meter.setAttribute('aria-valuemax',h.maxHp);
      this.meter.setAttribute('aria-valuenow',hp);
    }
    const boss=this.enemies.find(unit=>unit.kind==='boss'&&!unit.spec.secondary);
    const echo=this.enemies.find(unit=>unit.kind==='boss'&&unit.spec.secondary);
    const bossHUD=this.ui['boss-hud'];
    bossHUD.hidden=!boss&&!echo;
    this.ui['boss-primary'].hidden=!boss;
    this.ui['boss-echo'].hidden=!echo;
    if(echo)this.ui['boss-echo-fill'].style.transform='scaleX('+clamp(echo.hp/echo.spec.hp,0,1)+')';
    const kills=String(this.kills),clock=formatTime(this.elapsed),gold=String(this.runGold??0);
    if(this.ui['run-kills'].textContent!==kills)this.ui['run-kills'].textContent=kills;
    if(this.ui['run-time'].textContent!==clock)this.ui['run-time'].textContent=clock;
    if(this.ui['run-gold'].textContent!==gold)this.ui['run-gold'].textContent=gold;
    if (boss) this.ui['boss-fill'].style.transform='scaleX('+clamp(boss.hp/boss.spec.hp,0,1)+')';
    const arena=this.bossArena;
    const arenaHint=this.ui['boss-arena-hint'];
    arenaHint.hidden=!boss||!arena?.phase;
    arenaHint.classList.toggle('tactic',!!boss&&arena?.tactics.cueTime>0);
    this.ui['boss-hud'].classList.toggle('shielded',!!boss&&!!arena?.locked);
    if (!arenaHint.hidden) {
      const line=arena.status();
      if (arenaHint.textContent!==line) arenaHint.textContent=line;
    }
    const weakness=this.ui['boss-weakness'];
    weakness.hidden=arenaHint.hidden;
    if (!weakness.hidden) {
      const counter=arena.counters;
      const hint=counter.hint;
      weakness.classList.toggle('open',counter.stagger>0);
      weakness.classList.toggle('windup',counter.chargeHint>0);
      if (weakness.textContent!==hint) weakness.textContent=hint;
    }
    const cooldowns=[h.rollCool/h.rollTime,h.spellCool/h.spellTime,h.atk/h.atkTotal];
    const combo=String(h.comboLeft>0?h.combo:0);
    if (this.ui.strike.dataset.combo!==combo) this.ui.strike.dataset.combo=combo;
    const ready=this.readyLink();
    const queued=h.link?.pending&&!ready&&this.buffered.spell>0&&h.spellCool<=0;
    const linkState=ready?'ready':queued?'queued':h.linkFlash>0?'cast':'';
    const spell=this.ui.spell, hint=this.ui['skill-link'];
    const fusion=ready?this.fusionForLink(ready):linkState==='cast'?h.linkFusion:null;
    if (spell.dataset.link!==linkState||spell.dataset.fusion!==(fusion?.id??'')) {
      spell.dataset.link=linkState;
      spell.dataset.fusion=fusion?.id??'';
      spell.classList.toggle('ultimate-ready',!!fusion?.ultimate);
      if (fusion) spell.style.setProperty('--fusion-ink',fusion.ink);
      else spell.style.removeProperty('--fusion-ink');
      hint.hidden=!linkState;
      const name=fusion?.name??skillLinks[this.weapon.id].name;
      spell.setAttribute('aria-label',ready?'接技：'+name:this.weapon.skill);
      const marks=resonanceMarks(h.resonance);
      const suffix=fusion?' '+fusion.mark:marks?' '+marks:'';
      if (linkState) hint.textContent=linkState==='queued'?'等候命中':ready?'接技 · '+name+suffix:name+'！'+suffix;
    }
    if (ready) spell.style.setProperty('--link-left',Math.round((ready.until-this.t)/ready.window*360)+'deg');
    if(this.input.touchMode) {
      const label=this.ui['touch-skill-status'];
      const seconds=Math.ceil(Math.max(0,h.spellCool));
      const text=ready?(hint.textContent||'接技就緒'):this.weapon.skill+(seconds?' · '+seconds+' 秒':' · 可用');
      if(label.textContent!==text) label.textContent=text;
      label.classList.toggle('link-ready',!!ready);
      this.input.touch.prompt.dataset.cooldown=String(!!seconds&&!ready);
    }
    actionIds.forEach((id,index)=>this.ui[id].style.setProperty('--cool',Math.round(Math.max(0,cooldowns[index])*360)+'deg'));
    this.ui['damage-vignette'].style.opacity=String(this.damageFlash);
    const mission=this.mission;
    this.ui['mission-status'].hidden=!mission?.started||!!mission.finished;
    if (mission?.started&&!mission.finished) {
      const {text,fill}=mission.status();
      this.ui['mission-status'].dataset.mode=mission.plan.type;
      if (this.ui['mission-title'].textContent!==mission.plan.title) this.ui['mission-title'].textContent=mission.plan.title;
      if (this.ui['mission-text'].textContent!==text) this.ui['mission-text'].textContent=text;
      this.ui['mission-track'].hidden=fill===null;
      if (fill!==null) this.ui['mission-fill'].style.transform='scaleX('+fill+')';
    }
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    const dt=clamp((now-this.previousTime)/1000,0,.045);
    this.previousTime=now;
    if(!this.hero||document.hidden||!this.ui.cover.hidden||this.weaponViewer.open)return;
    if (this.state==='fracture'||this.state==='gm') this.updateFailure(dt);
    const freezeWarnings=this.hitstop>0;
    if (this.state==='play'||this.state==='falling') {
      this.step(dt,this.state==='play'?this.input.read():null);
      this.damageFlash=Math.max(0,this.damageFlash-dt*1.74);
      this.announceLeft-=dt;
      if (this.announceLeft<=0) this.ui.announce.classList.remove('visible');
      if (this.schoolToast>0) {
        this.schoolToast-=dt;
        if (this.schoolToast<=0) this.ui['school-toast'].hidden=true;
      }
      this.renderUI();
      this.audio.update();
    }
    this.view.previewSkill(this.hero,this.state==='play'?this.input.touch.preview:0,dt);
    this.view.render(dt,this.hero,this.state!=='play'&&this.state!=='falling',freezeWarnings&&this.state==='play');
    this.branchCombat.render(this);
    this.updateMissionPins();
  }

  openModal({mark,kicker,title,copy,content,buttons,kind=''}) {
    if(this.weaponViewer.open)this.weaponViewer.dialog.close();
    this.input.reset();
    this.buffered = {dodge:0,spell:0,strike:0,dodgeDirection:null};
    this.ui['modal-mark'].textContent=mark;
    this.ui['modal-kicker'].textContent=kicker;
    this.ui['modal-title'].textContent=title;
    this.ui['modal-copy'].textContent=copy;
    this.ui['modal-copy'].hidden=!copy;
    this.ui.modal.dataset.kind=kind;
    this.ui['modal-content'].replaceChildren(...(content?[content]:[]));
    this.ui['modal-actions'].replaceChildren(...(buttons||[]));
    this.ui.modal.hidden=false;
    this.ui.hud.inert=true;
    this.ui.cover.inert=true;
    this.ui.modal.querySelector('button')?.focus({preventScroll:true});
  }

  closeModal() {
    this.ui.modal.hidden=true;
    this.ui.hud.inert=false;
    this.ui.cover.inert=false;
    this.input.reset();
  }

  showRunBlessings() {
    if(this.state!=='play')return;
    this.state='run-blessings';
    this.audio.active=false;
    this.openModal({kind:'run-blessings',mark:'✧',kicker:'本次旅程',title:'已獲祝福',copy:'',
      content:blessingLedger(this.relics,this.weapon,this.hero,this.training,this.stage.floor),
      buttons:[makeButton('返回戰鬥',()=>this.togglePause(),'primary')]});
  }

  blessingPool() {
    const special=this.weapon.blessing;
    const cap=this.relicHunt?.state==='defeated'?3:2;
    return special&&(this.ranks.get(special.id)??0)<cap?[...blessings,special]:blessings;
  }

  drawBlessings(pool=this.blessingPool()) {
    const shuffled=shuffle(pool);
    const signature=shuffled.find(boon=>boon.weaponId);
    const suggested=signature??shuffled.find(boon=>!this.ranks.has(boon.id)&&schoolProgress(this.ranks,boon.school).distinct>0);
    const options=[];
    for (const boon of suggested?[suggested,...shuffled]:shuffled) {
      if (!options.some(other=>other.school===boon.school)) options.push(boon);
      if (options.length===3) break;
    }
    return shuffle(options);
  }

  blessing(message,bonus=false) {
    const h=this.hero;
    const before=h.hp;
    if (!bonus) {
      const heal=Math.round(h.maxHp*((this.stage.boss?.36:.14)+h.recovery)*this.difficulty.heal);
      h.hp=Math.min(h.maxHp,h.hp+heal);
    }
    this.altar={message,heal:Math.round(h.hp-before),bonus,options:this.drawBlessings()};
    this.audio.play('blessing');
    this.showBlessing();
  }

  redrawBlessings() {
    if (this.state!=='blessing'||!this.altar||this.altar.bonus||this.redraws<=0) return;
    const pool=this.blessingPool().filter(relic=>!this.altar.options.includes(relic));
    this.redraws--;
    this.altar.options=this.drawBlessings(pool);
    this.audio.play('blessing');
    this.showBlessing();
  }

  showBlessing() {
    this.state='blessing';
    const {message,heal,bonus,options}=this.altar;
    const h=this.hero;
    const grid=document.createElement('div');
    grid.className='relic-grid';
    const secret=ultimateProgress(this.weapon,h.resonance);
    for (const relic of options) {
      const button=makeButton('',()=>this.choose(relic),'relic');
      button.dataset.blessing=relic.id;
      const mark=blessingIcon(relic), name=document.createElement('b'), detail=document.createElement('span');
      const branch=document.createElement('small'), resonance=document.createElement('small');
      const rank=this.ranks.get(relic.id)||0;
      const school=schools[relic.school];
      const {distinct:count,total}=schoolProgress(this.ranks,relic.school);
      branch.className='relic-school';
      branch.style.color=school.ink;
      const next=Math.min(3,count+Number(rank===0&&!relic.weaponId));
      branch.textContent=school.name+' '+next+'/3'+(next===3?' · '+school.skill:'');
      branch.title=school.detail;
      name.textContent=relic.name+(rank?' · '+rank+' → '+(rank+1):'');
      detail.textContent=relic.detail;
      const preview=resonancePreview(this.weapon,relic.school,total);
      resonance.className='relic-resonance'+(preview.upgrade?' upgrade':'');
      resonance.style.setProperty('--resonance-ink',school.ink);
      resonance.textContent=preview.text;
      if (next===3&&count<3) branch.textContent+='（解鎖）';
      button.append(mark,name,detail);
      if(relic.weaponId){
        resonance.textContent='本武器技能傷害 '+bonusPercent(relicPower(rank+1)-1);
        button.append(resonance);
        grid.append(button);
        continue;
      }
      button.append(resonance,branch);
      const loadout={...h.resonance,[relic.school]:linkTier(total+1)};
      const future=fusionChoices(this.weapon,loadout);
      const active=pickFusion(future,this.fusionPin);
      const changed=future.filter(fusion=>fusion.rank>(this.fusions.find(old=>old.id===fusion.id)?.rank??0));
      if (changed.length) {
        const lead=changed.find(fusion=>fusion.ultimate)??changed.find(fusion=>fusion.id===active?.id)??changed[0];
        const unlock=!this.fusions.some(fusion=>fusion.id===lead.id);
        const weave=document.createElement('small');
        weave.className='relic-fusion'+(lead.ultimate?' ultimate-clue':'');
        weave.style.setProperty('--fusion-ink',lead.ink);
        weave.textContent=(lead.ultimate?'覺醒 ':unlock?'解鎖 ':'升階 ')+lead.name+(changed.length>1?' ＋'+(changed.length-1):'')+'｜'+lead.detail;
        button.append(weave);
      } else if (secret?.known&&!secret.ready&&secret.rite.schools.includes(relic.school)&&total<6) {
        const clue=document.createElement('small');
        clue.className='relic-fusion ultimate-clue';
        clue.style.setProperty('--fusion-ink',secret.rite.ink);
        clue.textContent='隱藏合招｜'+this.ultimateClue(secret,relic.school);
        button.append(clue);
      }
      for(const seal of seals){
        if(h.seals.has(seal.id)||!seal.needs.includes(relic.id)||!seal.needs.some(id=>id!==relic.id&&this.ranks.has(id)))continue;
        const clue=document.createElement('small');
        clue.className='relic-fusion ultimate-clue';clue.style.setProperty('--fusion-ink',seal.ink);
        clue.textContent='秘印 '+seal.name+'｜'+seal.detail;
        button.append(clue);
      }
      grid.append(button);
    }
    const content=document.createElement('div');
    const reward=this.floorReward;
    if (!bonus&&reward) {
      const receipt=document.createElement('p');
      receipt.className='floor-receipt';
      receipt.textContent='金幣 +'+reward.gold+(heal?' · 回復 '+heal+' 生命':'');
      content.append(receipt);
      if (reward.notice) {
        const notice=document.createElement('p');
        notice.className='milestone-notice';
        notice.textContent=reward.notice.name+' · '+reward.notice.detail;
        content.append(notice);
      }
    }
    content.append(grid);
    const buttons=[];
    if (!bonus&&this.redraws>0) {
      const redraw=makeButton('重抽祝福 · 剩 '+this.redraws+' 次',()=>this.redrawBlessings());
      redraw.id='blessing-redraw';
      buttons.push(redraw);
    }
    this.openModal({kind:'blessing',mark:'✧',kicker:'第 '+this.stage.floor+' 關 · '+(message??'已完成'),
      title:bonus?'雙頭目遺贈':'亡者的祝福',copy:bonus?'揀多一份祝福，帶入餘下樓層。':'揀一份祝福。累積唔同流派可以解鎖合招。',content,buttons});
  }

  choose(relic) {
    if (this.state!=='blessing'||!this.altar?.options.includes(relic)) return;
    const bonus=this.altar.bonus;
    this.altar=null;
    this.applyBlessing(relic);
    if (!bonus&&this.twinReward) {
      this.showTwinReward();
      return;
    }
    this.leaveAltar();
  }

  applyBlessing(relic,slot=null) {
    if (slot===null) this.relics.push(relic);
    else this.relics[slot]=relic;
    const h=this.hero;
    const oldMax=h.maxHp;
    const previous=this.fusion;
    const oldSeals=h.seals;
    const knownUltimate=this.fusions.some(fusion=>fusion.ultimate);
    this.ranks=buildStats(h,this.weapon,this.stage.floor,this.relics,this.training);
    this.refreshFusion();
    const extra=relic.id==='spring'?h.maxHp*.31:relic.id==='flower'?h.maxHp*.19:0;
    h.hp=Math.min(h.maxHp,h.hp+(h.maxHp-oldMax)+extra);
    const branch=relic.school;
    const activeSchools=new Set(Object.keys(schools).filter(school=>schoolProgress(this.ranks,school).distinct>=3));
    const learned=!this.learned.has(branch)&&activeSchools.has(branch);
    this.learned=activeSchools;
    const awakened=!knownUltimate&&this.fusions.find(fusion=>fusion.ultimate);
    const newSeal=seals.find(seal=>h.seals.has(seal.id)&&!oldSeals.has(seal.id));
    if (awakened) {
      const note=this.ui['school-toast'];
      note.textContent='隱藏合招覺醒 · '+awakened.name+'｜'+awakened.detail;
      note.hidden=false;
      this.schoolToast=4.2;
    } else if(newSeal){
      const note=this.ui['school-toast'];
      note.textContent='秘印 · '+newSeal.name+'｜'+newSeal.detail;
      note.hidden=false;
      this.schoolToast=3.8;
    } else if (learned) {
      const note=this.ui['school-toast'];
      note.textContent='解鎖 '+schools[branch].skill+' · '+schools[branch].detail;
      note.hidden=false;
      this.schoolToast=3.2;
    } else if (this.fusion&&this.fusion.id!==previous?.id) {
      const note=this.ui['school-toast'];
      note.textContent='接技合招 · '+this.fusion.name+'｜'+this.fusion.detail;
      note.hidden=false;
      this.schoolToast=3.2;
    }
    paintBlessingHud(this.ui['relic-icons'],this.relics);
    this.audio.play('blessing');
  }

  showTwinReward() {
    this.state='twin-reward';
    const extra=makeButton('多揀一份祝福',()=>{
      if (this.state==='twin-reward'&&this.twinReward) this.blessing('雙頭目已擊敗',true);
    },'primary');
    extra.id='twin-extra';
    const replace=makeButton('更換一份祝福',()=>this.showTwinInventory());
    replace.id='twin-replace';
    this.openModal({kind:'twin-reward',mark:'✶',kicker:'無月 · 第 75 關',title:'雙頭目遺贈',
      copy:'兩名頭目都已倒下。你可以多揀一份祝福，或者換走一份已有祝福，補齊另一個流派。',buttons:[extra,replace]});
  }

  showTwinInventory() {
    if (!this.twinReward) return;
    this.state='twin-inventory';
    const list=document.createElement('div');
    list.className='twin-inventory';
    for (const relic of new Set(this.relics)) {
      const button=makeButton(`${relic.name} · ${schools[relic.school].name} ×${this.ranks.get(relic.id)}`,()=>this.showTwinSwap(relic));
      button.dataset.replace=relic.id;
      button.prepend(blessingIcon(relic));
      list.append(button);
    }
    this.openModal({kind:'twin-reward',mark:'✶',kicker:'雙頭目遺贈',title:'揀要換走嘅祝福',content:list,
      buttons:[makeButton('返回',()=>this.showTwinReward())]});
  }

  showTwinSwap(previous) {
    if (this.state!=='twin-inventory'||!this.twinReward) return;
    this.state='twin-swap';
    const slot=this.relics.indexOf(previous);
    const offers=this.twinReward.offers;
    if (!offers.has(previous.id)) offers.set(previous.id,this.drawBlessings(blessings.filter(relic=>relic.school!==previous.school)));
    const list=document.createElement('div');
    list.className='relic-grid';
    for (const relic of offers.get(previous.id)) {
      const card=makeButton('',()=>{
        if (this.state!=='twin-swap'||this.relics[slot]!==previous) return;
        this.applyBlessing(relic,slot);
        this.leaveAltar();
      },'relic');
      card.dataset.blessing=relic.id;
      const name=document.createElement('b'),detail=document.createElement('span'),school=document.createElement('small');
      name.textContent=relic.name;
      detail.textContent=relic.detail;
      school.textContent=schools[relic.school].name;
      school.style.color=schools[relic.school].ink;
      card.append(blessingIcon(relic),name,detail,school);
      list.append(card);
    }
    this.openModal({kind:'twin-reward',mark:'✶',kicker:'雙頭目遺贈',title:'換入另一流派',copy:'將會換走 '+previous.name+' ×1。',content:list,
      buttons:[makeButton('返回',()=>this.showTwinInventory())]});
  }

  leaveAltar() {
    this.twinReward=null;
    if (this.stage.boss) {
      this.prepare(true);
      return;
    }
    this.state='play';
    this.closeModal();
    this.advanceAfterReward();
  }

  advanceAfterReward() {
    if (this.stage.floor<stages.length) {
      this.enter(this.level+1);
      return;
    }
    this.placeStory(ending);
    this.announce('名字重見天日',ending.title,'往王座走，讓牠們聽見鐘聲。',2.0);
  }

  togglePause() {
    if (['pause','journal','run-blessings','practice-loadout'].includes(this.state)) {
      if(this.state==='practice-loadout'&&!this.practiceCanResume)return;
      const fromBlessings=this.state==='run-blessings';
      this.state='play';
      this.audio.active=true;
      this.closeModal();
      if(fromBlessings)this.ui['relic-icons'].focus({preventScroll:true});
      return;
    }
    if (this.state!=='play') return;
    this.state='pause';
    this.audio.active=false;
    const buttons=this.practiceRun?[makeButton('繼續練習',()=>this.togglePause(),'primary'),
      makeButton('換配搭',()=>this.openPracticeLoadout()),makeButton('原配搭再試',()=>this.startPractice()),
      makeButton('返回入口',()=>this.showCover())]
      :[makeButton('繼續旅程',()=>this.togglePause(),'primary'),makeButton('結束本次挑戰',()=>this.finish(false,'leave'))];
    this.openModal({kind:'pause',mark:'☾',kicker:'月蝕之夜',title:'稍作休息',
      copy:this.input.touchMode?'拖住移動，點一下普攻，快速短撥翻滾。長按後向上滑到神器紋章，放手施法。點「調查」可同場景互動。'
        :'WASD 移動，J 普通攻擊，空白鍵翻滾，Q 放神器技能，E 調查。',
      content:this.fusionMenu(),
      buttons});
  }

  fusionMenu() {
    if (!this.fusions.length) return null;
    const panel=document.createElement('div');
    panel.className='fusion-menu';
    const title=document.createElement('b'), detail=document.createElement('p');
    title.textContent='接技合招';
    detail.className='fusion-summary';
    const paint=()=>{
      const pinned=this.fusions.some(fusion=>fusion.id===this.fusionPin)?this.fusionPin:'auto';
      for (const option of panel.querySelectorAll('button')) option.setAttribute('aria-pressed',String(option.dataset.fusionChoice===pinned));
      detail.textContent='目前：'+this.fusion.name+(this.fusion.ultimate?' · 終極':' '+this.fusion.rank+'階')+'｜'+this.fusion.detail;
    };
    const select=id=>{
      this.fusionPin=id;
      this.refreshFusion();
      paint();
    };
    const options=document.createElement('div');
    options.className='fusion-options';
    for (const fusion of [null,...this.fusions]) {
      const name=fusion?fusion.mark+' '+fusion.name:'隨神器自動配搭';
      const option=makeButton(name,()=>select(fusion?.id??null),'fusion-option'+(fusion?.ultimate?' ultimate-clue':''));
      option.dataset.fusionChoice=fusion?.id??'auto';
      option.style.setProperty('--fusion-ink',fusion?.ink??'#ecd6a3');
      options.append(option);
    }
    panel.append(title,options,detail);
    const secret=ultimateProgress(this.weapon,this.hero.resonance);
    if (secret?.known&&!secret.ready) {
      const clue=document.createElement('p');
      clue.className='fusion-secret';
      clue.textContent='隱藏合招 · 三個指定流派各達 '+ultimateRank+' 階：'+this.ultimateClue(secret);
      panel.append(clue);
    }
    for(const seal of seals)if(this.hero.seals.has(seal.id)){
      const entry=document.createElement('p');entry.className='fusion-secret';entry.style.color=seal.ink;
      entry.textContent='秘印 · '+seal.name+'｜'+seal.detail;
      panel.append(entry);
    }
    paint();
    return panel;
  }

  finish(won,reason) {
    if (['cover','fracture','gm','won'].includes(this.state)) return;
    if(this.practiceRun){this.finishPractice(won);return;}
    this.audio.active=false;
    if (!won) {
      this.state='fracture';
      this.failure={remaining:.94,reason};
      this.input.reset();
      this.ui.inspect.hidden=true;
      this.ui.announce.classList.remove('visible');
      setFracture(this.ui['time-fracture'],formatTime(this.elapsed));
      this.audio.play('fracture');
      return;
    }
    this.state='won';
    const unlocked=this.progress.win(this.difficulty.id,Math.round(this.elapsed*1000));
    const finale=endingFor(this.branchCombat.branch,this.branchCombat.skills);
    this.audio.play('blessing');
    this.openDialogue(finale.title,finale.route,finale,'查看通關結果',()=>{
      this.openModal({kind:'win',mark:'✷',kicker:this.difficulty.name+' · 第 100 關 · '+finale.route,title:finale.title,
        copy:unlocked?`已永久解鎖「${moonlessLantern.name}」及稱號「${moonlessTitle.name}」，可到訓練所換上。`:'',
        content:this.runResults(true),buttons:[makeButton('返回入口',()=>this.showCover(),'primary')]});
    });
  }

  runResults(includeClues=false) {
    const results=document.createElement('div');
    results.className='results';
    const record=this.progress.data.records[this.difficulty.id];
    const best=record.cleared?'第 '+record.cleared+' 關':'—';
    const lines=['擊倒 '+this.kills,'用時 '+formatTime(this.elapsed),'本次金幣 +'+this.runGold,'最高通過 '+best];
    if (includeClues) {
      const hiddenClues=this.journal.filter(entry=>entry.hiddenClue).length;
      lines.unshift(this.weapon.name);
      lines.push('主線 '+(this.journal.length-hiddenClues)+'/10','隱藏 '+hiddenClues+'/10');
    }
    for (const line of lines) {
      const item=document.createElement('span');
      item.textContent=line;
      results.append(item);
    }
    return results;
  }

  updateFailure(dt) {
    if (!this.failure) return;
    this.failure.remaining-=dt;
    if (this.failure.remaining>0) return;
    if (this.state==='gm') {
      this.showCover();
      return;
    }
    this.ui['time-fracture'].hidden=true;
    this.state='gm';
    this.failure.remaining=10;
    const {reason}=this.failure;
    const event=reason==='lantern'?'祭燈熄咗。':reason==='leave'?'呢段挑戰到此為止。':'呢一輪時間碎咗。';
    const scene={cast:['keeper'],intro:[{speaker:'keeper',
      text:'螢幕前嗰位，我見到你。'+event+'金幣同紀錄已記入帳簿，我而家送你返遊戲入口。'}]};
    this.openDialogue('GM 司刻',this.difficulty.name+' · 第 '+this.stage.floor+' 關',scene,
      '立即返回入口',()=>this.showCover(),this.runResults());
  }

  showCover() {
    this.state='cover';
    if(this.practiceRun){this.clearThreats();this.clearActors();this.view.setBossArena(null);this.bossArena=null;}
    this.practiceRun=null;
    this.ui['practice-edit'].hidden=true;
    this.paintDamage(null);
    this.duelMonster=null;
    this.audio.active=false;
    this.failure=null;
    this.branchCombat.end();
    this.ui['time-fracture'].hidden=true;
    this.closeModal();
    this.ui.hud.hidden=true;
    this.ui.cover.hidden=false;
    paintBlessingHud(this.ui['relic-icons'],[]);
    this.progress.refresh();
    this.updateEntryBalance();
    this.ui.begin.focus();
  }
}

function makeWeaponPractice(view,weapon,kind) {
  const practice=Object.create(Game.prototype);
  const hero=makeHero();
  Object.assign(hero,{x:-3.2,z:.5,dx:1,dz:0});
  Object.assign(practice,{view,weapon,hero,t:0,state:'preview',rituals:[],relicWalls:[],learned:new Set(),autoReady:new Map(),
    branchCombat:{},audio:{attack(){},arm(){},ghostRifle(){},link(){}},enemies:[],stage:{props:[]}});
  practice.ranks=buildStats(hero,weapon,1,[]);
  practice.heroVisual=view.createActor(0,2.68);
  view.equip(practice.heroVisual,weapon);
  const wide=hero.spellRadius>5.8;
  const dummies=(kind==='combo'?[[.1,.5]]:wide?[[1.7,.5],[2.9,-.92],[3.4,1.65]]:[[.15,.5],[1.6,-.73],[1.95,1.49]]);
  for(const [x,z] of dummies){
    const spec={frame:3,height:2.0,tint:0xddb79b,effect:'stone',hp:15000};
    practice.enemies.push({x,z,kind:'imp',face:-1,age:5,hp:spec.hp,stun:0,chill:0,exposed:0,
      kx:0,kz:0,spec,visual:view.createActor(spec.frame,spec.height)});
  }
  practice.aim=()=>[1,0];
  practice.hit=(target,power,source,force,tint,weight,report)=>{
    const response=weight==='heavy'?'heavy':'light';
    recoil(target,source,response);
    view.impact(target,source,response,tint);
    report?.(target,response);
    return true;
  };
  let actionAt=.16,combo=0;
  const duration=kind==='combo'?2.65:Math.max(2.75,(weapon.spell?.hits??1)*(weapon.spell?.interval??0)+1.35);
  const input={x:0,z:0};
  practice.poseHero(0);
  return {
    step(dt){
      practice.t+=dt;
      hero.attackAge+=dt;
      hero.ward-=dt;
      hero.comboLeft-=dt;
      if(practice.t>=actionAt){
        if(kind==='skill'){
          practice.cast(input,null);actionAt=Infinity;
        }else{
          hero.combo=combo;
          hero.comboLeft=1;
          practice.attack(input);
          combo++;
          actionAt=combo<3?practice.t+hero.atkTotal+.10:Infinity;
        }
      }
      if(hero.rolling>0){
        const from={x:hero.x,z:hero.z};
        practice.moveUnit(hero,hero.rollX*hero.rollSpeed*dt,hero.rollZ*hero.rollSpeed*dt,.38);
        if(hero.rush)rushHit(practice,from);
        hero.rolling=Math.max(0,hero.rolling-dt);
        if(!hero.rolling)hero.rush=null;
      }
      while(hero.slash&&hero.attackAge>=hero.slash.timing.hits[hero.slash.next].at)practice.landSlash();
      practice.updateRituals(dt);
      practice.poseHero(dt);
      view.setWard(hero);
      view.previewSkill(hero,0,dt);
      for(const unit of practice.enemies){
        advanceReaction(unit,dt);
        view.actor(unit.visual,unit,blendPose({frame:unit.spec.frame,face:-1,aura:.3,rim:0xe1c5b3,
          bob:Math.sin(practice.t*3+unit.x)*.06,squash:1,tilt:0},reactionPose(unit)));
      }
      return practice.t<duration;
    },
    dispose(){
      view.removeEquippedActor(practice.heroVisual);
      for(const unit of practice.enemies)view.removeActor(unit.visual);
    },
  };
}

function makeBossPractice(view,dossier,action,signal) {
  const {spec,stage:source,layout,weakness}=dossier;
  const practice=Object.create(Game.prototype);
  const drill=action.drill;
  const stage=action.phase?source:{...source,props:[]};
  const position=action.phase?source.spawn:{x:2.95,z:.82};
  const hero=Object.assign(makeHero(),position,{moveSpeed:6.9,damage:25,face:-1});
  const controls={keys:new Set(),point:null,roll:false,interact:false};
  const weapon=arms.find(arm=>arm.id==='tiger');
  Object.assign(practice,{view,stage,hero,weapon,t:0,state:'play',hazards:[],enemies:[],relicWalls:[],wave:0,
    hitstop:0,branchCombat:{skills:new Set()},audio:{play(){},release(){},boss(){},impact(){}},
    announce(){},setupMissionPins(){},objective(){}});
  const unit=practice.spawn('boss',action.phase?0:-2.4,action.phase?-3.2:-.46,null,spec);
  unit.age=3;
  unit.face=1;
  if(action.phase){
    practice.bossArena=new BossArena(practice,layout,unit,action.seed,drill?drillEncounter(dossier):null);
    view.setBossArena(practice.bossArena);
    if(action.phase>1){
      unit.bossPhase=action.phase-1;
      unit.hp=spec.hp*spec.phases[action.phase-2];
      practice.bossArena.transform(unit.bossPhase);
      practice.bossArena.shift=2;
    }
    const cover=[...practice.bossArena.encounter.first.pillars,...stage.props];
    if(drill&&cover.length&&(weakness.type==='charge'||weakness.type==='projectile')){
      const column=cover[0];
      const gap=distance(column,unit);
      const aim={x:column.x+(column.x-unit.x)/gap*1.6,z:column.z+(column.z-unit.z)/gap*1.6};
      if(gap>1.2&&Math.abs(aim.x)<9&&aim.z<8)Object.assign(hero,aim);
    }
  }
  practice.heroVisual=view.createActor(0,2.36);
  const arena=practice.bossArena;
  const rehearsal=drill?arena.layout.weakness:null;
  const riftDrill=rehearsal?.type==='rift';
  const exercise={followRange:.7,focused:!!rehearsal,attack:null};
  let readyRift=false, trackedRift=null;
  let done=false, status='';
  practice.hurt=(amount,x,z)=>{
    if(hero.invulnerable>0)return false;
    const weight=amount>19?'heavy':'light';
    recoil(hero,{x,z},weight);
    hero.invulnerable=.28;
    view.impact({...hero,spec:{height:2.36}},{x,z},weight,spec.tint);
    return true;
  };
  practice.hit=(boss,amount,origin,knock,tint)=>{
    if(arena.locked)return false;
    boss.hp=Math.max(1,boss.hp-amount);
    practice.impact(boss,origin,'heavy',tint);
    return true;
  };
  const steer=dt=>{
    const h=hero;
    const {keys,point}=controls;
    let x=Number(keys.has('right'))-Number(keys.has('left'));
    let z=Number(keys.has('down'))-Number(keys.has('up'));
    if(!x&&!z&&point&&distance(point,h)>.16){x=point.x-h.x;z=point.z-h.z;}
    const length=Math.max(1,Math.hypot(x,z));
    if(Math.hypot(x,z)>.06&&h.rolling<=0){
      h.dx=x/length;h.dz=z/length;
      if(Math.abs(h.dx)>.14)h.face=Math.sign(h.dx);
    }
    h.rollCool-=dt;
    h.snared-=dt;
    if(controls.roll&&h.rollCool<=0&&h.rolling<=0){
      h.rolling=h.rollDuration;
      h.rollCool=.67;
      h.invulnerable=.34;
      view.spark(h.x,.20,h.z,0xe5b17b,11,.64);
    }
    controls.roll=false;
    const speed=h.moveSpeed*(h.snared>0?.57:1);
    h.vx=h.rolling>0?h.dx*h.rollSpeed:x/length*speed;
    h.vz=h.rolling>0?h.dz*h.rollSpeed:z/length*speed;
    practice.moveUnit(h,h.vx*dt,h.vz*dt,.38);
    h.x=clamp(h.x,-10.5,10.5);
    h.z=clamp(h.z,-6.8,9.7);
    h.rolling-=dt;
    h.move+=(Math.min(1,Math.hypot(h.vx,h.vz)/5)-h.move)*blend(14,dt);
    if(!controls.interact)return;
    controls.interact=false;
    const lamp=arena.nearby(h);
    if(lamp)arena.interact(lamp);
    const core=arena.targets.find(point=>distance(point,h)<1.65);
    if(core)arena.hit(core,h.damage*1.12);
  };
  const paint=dt=>{
    advanceReaction(hero,dt);
    practice.poseHero(dt);
    for(const actor of practice.enemies)practice.poseEnemy(actor,dt);
  };
  paint(0);
  let fired=!!action.portrait;
  const hold=action.phase ? .85 : .20;
  const duration=hold+spec.time+2.75;
  return {
    controls,
    step(dt) {
      practice.t+=dt;
      hero.invulnerable-=dt;
      if(drill&&fired&&!done)steer(dt);
      if(!fired&&practice.t>=hold){
        fired=true;
        if(action.phase){
          unit.hp=spec.hp*spec.phases[unit.bossPhase];
          practice.advanceBossPhase(unit);
          signal.phase(unit.bossPhase,arena.plan.title);
        }else{
          practice.beginEnemyAttack(unit,action.pattern);
        }
      }
      if(drill&&fired&&!done){
        const hasRift=riftDrill&&practice.hazards.some(hazard=>hazard.residue==='embers');
        exercise.attack=riftDrill&&!hasRift?'cinders':null;
        practice.updateEnemies(dt,exercise);
      }else{
        unit.age+=dt;
        unit.phaseGuard-=dt;
        if(unit.attack&&(unit.attack.time-=dt)<=0)practice.resolveEnemyAttack(unit);
        if(unit.motion)unit.motion.age+=dt;
        if(unit.kx||unit.kz){
          const before={x:unit.x,z:unit.z};
          practice.moveUnit(unit,unit.kx*dt,unit.kz*dt,.35);
          if(unit.motion?.pattern==='pounce')view.motion.enemyTrail(before,unit);
          const friction=Math.exp(-dt*10);
          unit.kx*=friction;unit.kz*=friction;
        }
      }
      if(arena?.phase){
        if(drill&&!done)arena.tick(dt);
        else arena.shift+=dt;
      }
      advanceThreats(practice,dt);
      if(drill&&fired&&!done){
        if(riftDrill)for(const hazard of practice.hazards){
          if(hazard.kind==='residue'&&hazard.residue==='embers'&&!hazard.rehearsal){
            hazard.rehearsal=true;
            hazard.delay+=6;
          }
        }
        const trace=riftDrill?practice.hazards.find(hazard=>hazard.kind==='residue'&&hazard.rehearsal):null;
        if(trace!==trackedRift){trackedRift=trace;readyRift=false;}
        if(trace&&arena.counters.rifts.get(trace)===false)readyRift=true;
        done=arena.counters.stagger>0&&!arena.locked;
        const next=done?'反制成功 · '+arena.counters.weakness.name:arena.counters.chargeHint>0
          ?'直衝鎖定 · 離開紅線':arena.locked?arena.status():readyRift?'頭目離開咗裂縫 · 引佢行返入去'
            :trace?'裂縫已打開 · 向側邊走，引頭目離開裂縫':arena.counters.weakness.hint;
        if(next!==status){status=next;signal.status(status,done);}
      }
      paint(dt);
      if(!drill)return practice.t<(action.portrait?1:duration);
      if(done)this.finishAt??=practice.t+1.15;
      return !done||practice.t<this.finishAt;
    },
    dispose() {
      if(arena)view.setBossArena(null);
      for(const hazard of practice.hazards)if(hazard.visual)view.removeProjectile(hazard.visual);
      for(const actor of practice.enemies)view.removeActor(actor.visual);
      view.removeActor(practice.heroVisual);
    },
  };
}

export let game;
try {
  const world=new Scenery($('world'));
  await world.load();
  game=new Game(world,new Audio());
  $('load-note').textContent='';
  $('begin').disabled=false;
  $('training').disabled=false;
  $('records').disabled=false;
  $('bestiary').disabled=false;
  requestAnimationFrame(game.loop);
} catch (error) {
  console.error('Could not initialize the Eclipse Grove',error);
  $('load-note').textContent='森林載入失敗。請重新整理，並確認瀏覽器已啟用 WebGL。';
}
