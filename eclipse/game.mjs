import './page-locale.mjs';
import {format, language, t as textForLocale} from './locale.mjs';
import {bossMoveNames,monsterBattle,visitorFor} from './monster-bestiary.mjs?v=boss-foundry-1';
import {bossDossier,bossDossiers,drillEncounter} from './boss-dossiers.mjs?v=boss-foundry-1';
import {practiceLoadout} from './catalogue.mjs?v=ascendant-1';
import {WeaponViewer} from './weapon-viewer.mjs?v=clear-sight-1';
import {damageHud,damageReport,PracticeDamage} from './practice-damage.mjs?v=dojo-1';
import {Scenery} from './scenery.mjs?v=combat-pace-1';
import {OnlinePlayer} from './online-player.mjs';
import {PlayerUI} from './player-ui.mjs';
import {ActiveRunClock} from './challenge-records.mjs';
import {traffic} from './traffic.mjs';
import {InterfaceMotion} from './interface-motion.mjs?v=lantern-ui-1';
import {StoryDepth} from './story-depth.mjs?v=afterglow-1';
import {titleFlare} from './title-flare.mjs?v=golden-veil-1';
import {heroFrames} from './actor-art.mjs?v=ascendant-1';
import {Audio} from './audio.mjs?v=local-theme-1';
import {Input} from './input.mjs?v=desktop-controls-1';
import {Soundtrack} from './soundtrack.mjs?v=bundled-requiem-1';
import {arms} from './armory.mjs?v=emberlight-1';
import {ending,storyPrimer} from './campaign.mjs?v=story-repair-1';
import {enemySpec, patterns, stages} from './expedition.mjs?v=story-repair-1';
import {blessingRankCap, blessings, buildStats, schoolProgress, schools} from './blessings.mjs?v=ascendant-1';
import {advanceThreats, telegraph, withinThreat} from './threats.mjs?v=world-3d-1';
import {basicReach, dischargeFusion, finishLinkedRush, invokeArm, invokeLinkedArm, reflectHit, rushHit, skillFootprint, strikeTravel, strikeWith} from './combat.mjs?v=relic-awakenings-1';
import {RoomObjective,fieldNotes} from './objectives.mjs?v=story-repair-1';
import {invokeSchool} from './schools.mjs?v=nightforge-1';
import {BossArena} from './boss-arena.mjs?v=ledger-1';
import {BossReversal,bossDamageScale} from './boss-reversal.mjs';
import {drawBossEncounter} from './arena-draw.mjs?v=shifting-2';
import {bossArenas} from './arena-layouts.mjs?v=bestiary-1';
import {advanceReaction, blendPose, enemyPose, heroAction, heroPose, reactionPose, reactionTime, recoil} from './combat-motion.mjs?v=weapon-audit-1';
import {comboMove, comboNames, comboTiming, linkWindow, skillLinks} from './weapon-combos.mjs?v=weapon-audit-1';
import {linkResonances, linkTier, resonanceMarks, resonancePreview, resonanceText} from './link-blessings.mjs?v=resonance-1';
import {fusionChoices, pickFusion} from './link-fusions.mjs?v=nightfall-1';
import {ultimateProgress, ultimateRank} from './ultimate-recipes.mjs?v=nightfall-1';
import {clearUltimates, launchUltimate, updateUltimates} from './ultimate-combat.mjs?v=afterglow-1';
import {difficulties,eliteOmen,modeStage} from './nightfall.mjs?v=clock-1';
import {giftCast,giftFinisher,giftHurt,giftKill,giftRoll,seals} from './relic-gifts.mjs?v=ledger-1';
import {inExitThreshold,lanternRadius,roomBounds,routeLayout,twinSpec} from './lantern-route.mjs?v=giant-gates-1';
import {actorMotion} from './actor-kinetics.mjs?v=forgelight-4';
import {Progression,floorGold,formatTime,milestones,moonlessLantern,moonlessTitle,training} from './progression.mjs?v=story-repair-1';
import {branchPicker,recordsPanel,setFracture,trainingPanel} from './progression-ui.mjs?v=story-repair-1';
import {BranchCombat} from './branch-combat.mjs?v=story-repair-1';
import {chapterInterlude,openingPayoff,storyDialogue} from './dialogue-scenes.mjs?v=journey-1';
import {dialoguePanel} from './dialogue.mjs?v=story-repair-1';
import {endingFor} from './endings.mjs?v=story-repair-1';
import {RelicHunt} from './relic-hunt.mjs?v=story-repair-1';
import {relicCounter} from './relic-cast.mjs?v=giant-gates-1';
import {blessingIcon,blessingLedger,bonusPercent,paintBlessingHud,weaponCatalogue,weaponPicker} from './relic-interface.mjs?v=codex-1';
import {relicPower} from './relic-arsenal.mjs?v=weapon-audit-1';
import {clearAwakenings,updateAwakenings,updateTurnedEnemy} from './relic-awakenings.mjs';
import {wardenStrikeLook} from './warden-ground.mjs';
import {moonSlashDuration,moonSlashPattern,queueMoonSlash} from './warden-moon-slash.mjs';
import {moonPincerPreview} from './warden-moon-assist.mjs';
import {RewardedRevive} from './rewarded-revive.mjs';
import {chapterBreak,chapterStage,isCheckpoint,JourneyCheckpoints} from './journey-checkpoints.mjs';
import {blessingDetails,blessingSummary,briefingLines,colorExplanation,effectDetails,local,
  weaponDetailRows,weaponSummary,weaponTheme,weaponThemeInk} from './journey-copy.mjs';
import {dismissWardenReinforcements,isWardenSummoner,resolveWardenSummon,rewardWardenReinforcement,
  wardenBoon,wardenReinforcementSpecs,wardenSummonPattern,wardenSummonReady} from './warden-reinforcements.mjs';

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (x, low, high) => Math.max(low,Math.min(x,high));
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const blend = (speed,dt) => 1-Math.exp(-speed*dt);
const fixed = value => Math.max(0, Math.ceil(value));
const random = (low,high) => low + Math.random() * (high-low);
const actionIds = ['dodge','spell','strike'];
const weaponById=new Map(arms.map(weapon=>[weapon.id,weapon]));
const blessingById=new Map([...blessings,...arms.flatMap(weapon=>weapon.blessing?[weapon.blessing]:[])]
  .map(blessing=>[blessing.id,blessing]));
const afterPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const rewardMusicStates=new Set(['blessing','twin-reward','twin-inventory','twin-swap','transition']);
const testTraining=Object.fromEntries(training.map(({id,costs})=>[id,costs.length]));

function testBlessings(){
  const book=[...blessings,...arms.flatMap(weapon=>weapon.blessing?[weapon.blessing]:[])];
  return book.flatMap(blessing=>Array(blessingRankCap(blessing)).fill(blessing));
}

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
  button.textContent = textForLocale(label);
  button.addEventListener('click',callback);
  return button;
}

export class Game {
  constructor(view, audio) {
    this.view = view;
    this.audio = audio;
    this.rewardedRevive=new RewardedRevive(document.querySelector('meta[name="meow-adsense-client"]')?.content??'');
    this.state = 'cover';
    this.players=new OnlinePlayer();
    this.playerUI=new PlayerUI(this,this.players);
    this.runClock=new ActiveRunClock();
    this.checkpoints=new JourneyCheckpoints({
      getItem:key=>localStorage.getItem(key),
      setItem:(key,value)=>localStorage.setItem(key,value),
    });
    this.difficulty=difficulties.vigil;
    this.progress=new Progression();
    this.branchCombat=new BranchCombat(view);
    this.weaponViewer=new WeaponViewer(view,makeWeaponPractice);
    this.practiceDraft={boss:bossDossiers[0],weapon:arms[0],ranks:new Map(),phase:0,seed:null};
    this.practiceRun=null;
    this.testMode=false;
    this.testRun=false;
    this.titleTaps=[];
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
    this.buffered = {dodge:0,spell:0,strike:0,dodgeDirection:null,spellAim:null};
    this.previousTime = performance.now();
    this.storyDepth=new StoryDepth(view.canvas);
    this.syncEffects=()=>view.canvas.parentElement.classList.toggle('subdued-effects',view.feedback.subdued);
    this.syncEffects();
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',this.syncEffects);
    this.ui = Object.fromEntries(['cover','cover-title','test-mode-status','hud','modal','begin','pause','mute','objective','boss-hud','boss-fill','hp-fill','hp-number',
      'relic-icons','route-name','route-floor','route-dots','boss-name','damage-vignette','announce','announce-kicker','announce-title','announce-line',
      'mission-status','mission-title','mission-text','mission-track','mission-fill','mission-pins','school-toast','boss-arena-hint','boss-weakness','skill-link',
      'boss-primary','boss-echo','boss-echo-name','boss-echo-fill','run-kills','run-time','run-gold','entry-gold','training','records','bestiary','time-fracture',
      'modal-kicker','modal-title','modal-copy','modal-mark','modal-content','modal-actions','journal','inspect','equipped','field-support','spell-cooldown','practice-edit',...actionIds].map(id=>[id,$(id)]));
    this.meter = this.ui['hp-fill'].parentElement;
    this.input = new Input(view.canvas,action=>{if(!this.weaponViewer.open)(action==='journal'?this.showJournal():this.togglePause());},()=>this.state==='play');
    this.ui.begin.addEventListener('click',()=>this.prepare());
    $('journey-checkpoint').addEventListener('click',()=>this.openCheckpoints());
    this.flashTitle=titleFlare($('title-flare'));
    this.ui['cover-title'].addEventListener('click',event=>this.tapTitle(event.timeStamp));
    this.ui.training.addEventListener('click',()=>this.openTraining());
    this.ui.records.addEventListener('click',()=>this.openRecords());
    $('player-account').addEventListener('click',()=>this.playerUI.openAccount());
    $('leaderboard').addEventListener('click',()=>this.playerUI.openLeaderboard());
    this.ui.bestiary.addEventListener('click',()=>this.openPracticeLoadout());
    this.ui['practice-edit'].addEventListener('click',()=>this.openPracticeLoadout());
    this.paintDamage=damageHud($('practice-damage'));
    this.updateEntryBalance();
    this.ui.pause.addEventListener('click',()=>this.togglePause());
    this.soundtrack=audio.soundtrack=new Soundtrack(audio);
    this.ui.mute.addEventListener('click',()=>{
      const muted=audio.toggle();
      this.ui.mute.setAttribute('aria-pressed',String(muted));
    });
    this.ui.inspect.addEventListener('click',()=>this.interact());
    this.ui.journal.addEventListener('click',()=>this.showJournal());
    this.ui['relic-icons'].addEventListener('click',()=>this.showRunBlessings());
    addEventListener('resize',()=>this.view.resize());
    document.addEventListener('visibilitychange',() => {if(document.hidden && this.state==='play') this.togglePause();});
    this.loop = this.loop.bind(this);
    this.interfaceMotion=new InterfaceMotion({subdued:()=>this.view.feedback.subdued});
  }

  tapTitle(now) {
    if(this.state!=='cover')return;
    this.titleTaps=this.titleTaps.filter(tap=>now-tap<=900);
    this.titleTaps.push(now);
    if(this.titleTaps.length!==3)return;
    this.titleTaps.length=0;
    this.testMode=!this.testMode;
    this.ui.cover.toggleAttribute('data-ascendant',this.testMode);
    this.flashTitle(this.view.feedback.subdued);
    this.ui['cover-title'].setAttribute('aria-pressed',String(this.testMode));
    const status=this.ui['test-mode-status'];
    status.textContent=textForLocale(this.testMode?'無敵測試模式 · 已開啟':'無敵測試模式 · 已關閉');
    status.hidden=false;
    clearTimeout(this.testStatusTimer);
    if(!this.testMode)this.testStatusTimer=setTimeout(()=>{status.hidden=true;},2100);
    this.updateCheckpointMenu();
  }

  updateEntryBalance() {
    this.ui['entry-gold'].textContent=format('金幣 《0》',this.progress.data.gold.toLocaleString(language));
    this.updateCheckpointMenu();
  }

  updateCheckpointMenu(){
    this.checkpoints.refresh();
    $('journey-checkpoint').hidden=this.testMode||!this.checkpoints.data.latest;
  }

  openCheckpoints(){
    if(this.state!=='cover')return;
    this.checkpoints.refresh();
    const {latest,chapterTwo}=this.checkpoints.data;
    if(!latest)return;
    const resume=makeButton(local(`由第 ${latest.floor+1} 層續玩`,`从第 ${latest.floor+1} 层继续`,
      `Continue at floor ${latest.floor+1}`,`${latest.floor+1}階から再開`),()=>this.resumeJourney(latest,false),'primary');
    const buttons=[resume];
    if(chapterTwo)buttons.push(makeButton(local('第二章試煉 · 第 51–100 層','第二章试炼 · 第 51–100 层',
      'Chapter II Trial · Floors 51–100','第2章の試練 · 51〜100階'),()=>this.resumeJourney(chapterTwo,true)));
    buttons.push(makeButton('返回入口',()=>this.showCover()));
    this.state='checkpoint-menu';
    this.openModal({kind:'checkpoint-menu',mark:'◇',
      kicker:difficulties[latest.difficulty].name,
      title:local('旅程存檔','旅程存档','Journey checkpoints','旅の記録'),
      copy:local('續玩會保留當時嘅神器、祝福同劇情選擇。續玩同第二章試煉各自獨立於排行榜及金幣獎勵。',
        '续玩会保留当时的神器、祝福和剧情选择。续玩和第二章试炼独立于排行榜与金币奖励。',
        'Continue with your saved relic, blessings, and story choices. Checkpoint runs and the chapter trial are separate from rankings and gold rewards.',
        '神器・祝福・物語の選択を引き継ぎます。再開と第2章の試練はランキング・コイン報酬の対象外です。'),buttons});
  }

  resumeJourney(saved,reprise){
    const weapon=weaponById.get(saved.weapon);
    if(!weapon||saved.relics.some(id=>!blessingById.has(id)))return;
    this.difficulty=difficulties[saved.difficulty];
    this.audio.start().catch(()=>{});
    this.start(weapon,saved,reprise);
  }

  saveJourney(){
    if(this.testRun||this.practiceRun||this.duelMonster||this.storyRun==='chapter'||!isCheckpoint(this.stage.floor))return;
    this.checkpoints.save({floor:this.stage.floor,difficulty:this.difficulty.id,weapon:this.weapon.id,
      hp:this.hero.hp,ms:this.runClock.milliseconds,kills:this.kills,redraws:this.redraws,
      routeSeed:this.routeSeed,arenaSeed:this.arenaSeed,relics:this.relics.map(relic=>relic.id),hunted:[...this.huntedWeapons],
      flags:{...this.storyChoices},journal:this.journal.map(entry=>({...entry})),
      training:{...this.training},technique:this.hero.technique,lantern:this.hero.lanternStyle,
      branch:this.branchCombat.branch?.id??null,skills:[...this.branchCombat.skills],medic:this.branchCombat.reviveReady,
      fusionPin:this.fusionPin,reviveOffered:this.reviveOffered,relicDetourUsed:this.relicDetourUsed});
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
    const content=recordsPanel(this.progress,Object.values(difficulties));
    content.append(this.playerUI.historyPanel());
    this.openModal({kind:'records',mark:'◇',kicker:'司刻嘅帳簿',title:'個人紀錄',
      copy:'抵達同通過嘅樓層會即時記下。敲響歸名鐘先計通關時間。',
      content,
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

  previewPracticeBoss(entry) {
    this.weaponViewer.showBoss(bossDossier(entry,this.difficulty),{...patterns,...bossMoveNames},
      (view,dossier,action,signal)=>makeBossPractice(view,dossier,action,signal,this.audio));
  }

  openPracticeLoadout() {
    if(this.state!=='cover'&&!this.practiceRun)return;
    const canResume=this.practiceCanResume=['play','pause'].includes(this.state);
    this.state='practice-loadout';
    this.audio.active=false;
    const describe=entry=>bossDossier(entry,this.difficulty);
    const content=practiceLoadout(this.practiceDraft,{weapons:arms,heads:bossDossiers,icons:this.view.armIcons,
      previewWeapon:weapon=>this.weaponViewer.show(weapon),describe,
      previewBoss:entry=>this.previewPracticeBoss(entry),
      chooseWeapon:weapon=>this.setPracticeWeapon(weapon),chooseBoss:entry=>this.setPracticeBoss(entry)});
    this.openModal({kind:'practice-loadout',mark:'◇',kicker:'',title:'練習場',copy:'',content,
      buttons:[makeButton('返回入口',()=>this.showCover()),
        makeButton({ja:'エフェクト試演',en:'Effect Lab','zh-Hans':'特效演练','zh-Hant':'特效演練'}[language],
          ()=>import('./effect-lab.mjs').then(module=>{if(this.state==='practice-loadout')module.openEffectLab();})),
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
    this.ui['route-name'].textContent=textForLocale(title);
    this.ui['route-floor'].textContent=textForLocale(this.difficulty.name);
    this.ui['route-dots'].replaceChildren();
    this.ui['boss-name'].textContent=textForLocale(spec.name);
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
    this.audio.active=milestone;
    if(this.testRun||(!milestone&&this.testMode)){
      const content=document.createElement('div');
      content.className='ascendant-arsenal';
      if(!milestone)content.append(this.difficultyPicker());
      content.append(weaponCatalogue(arms,this.view.armIcons,weapon=>this.weaponViewer.show(weapon,
        item=>milestone?this.swapWeapon(item):this.start(item))));
      const back=milestone?makeButton('保留目前神器',()=>{
        this.advanceAfterReward();
      }):makeButton('返回主畫面',()=>this.showCover());
      this.openModal({kind:'armory',mark:'✷',kicker:'無敵測試模式 · '+arms.length+' 件神器',
        title:milestone?'更換神器':'選擇神器',copy:'全技能同滿級祝福已啟用。',content,buttons:[back]});
      this.weaponViewer.watchSelection(content,[],id=>weaponById.get(id));
      return;
    }
    const grid=document.createElement('div');
    grid.className='armory-grid';
    const pool=shuffle(milestone?arms.filter(arm=>arm.id!==this.weapon.id):arms);
    const choices=pool.slice(0,3);
    const select=weapon=>this.weaponViewer.show(weapon,milestone?item=>this.swapWeapon(item):item=>this.start(item));
    if(!milestone&&!choices.some(arm=>arm.spell))choices[2]=pool.find(arm=>arm.spell);
    for (const weapon of choices) {
      const choice=makeButton('',()=>select(weapon),'arm-card');
      choice.dataset.arm=weapon.id;
      choice.style.setProperty('--arm-ink',weaponThemeInk(weapon));
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
      const short=document.createElement('span');
      const brief=weaponSummary(weapon);
      role.textContent=weaponTheme(weapon);
      name.textContent=textForLocale(weapon.name);
      short.className='arm-summary';
      short.textContent=brief.attack;
      const effect=document.createElement('span');
      effect.className='arm-skill-detail';
      effect.textContent=brief.effect;
      text.append(role,name,short,effect);
      const details=effectDetails();
      for(const [label,copy] of weaponDetailRows(weapon)){
        const title=document.createElement('strong'), body=document.createElement('span');
        title.textContent=label;
        body.textContent=copy;
        details.append(title,body);
      }
      const signature={qilin:'wind',flameblade:'fire',stormbow:'thunder',turtle:'ward'}[weapon.id];
      const fusion=milestone?pickFusion(fusionChoices(weapon,this.hero.resonance),this.fusionPin):null;
      const secret=milestone?ultimateProgress(weapon,this.hero.resonance):null;
      if (fusion||milestone&&signature&&this.hero.resonance[signature]) {
        const resonance=document.createElement('span');
        resonance.className='arm-resonance';
        resonance.textContent=textForLocale(fusion?fusion.mark+' '+fusion.name+'｜'+fusion.detail
          :linkResonances[signature].mark+' 已有共鳴｜'+resonanceText(weapon,signature,this.hero.resonance[signature]));
        details.append(resonance);
      }
      if (secret?.known&&!secret.ready) {
        const clue=document.createElement('span');
        clue.className='arm-resonance';
        clue.textContent=textForLocale('隱藏合招｜'+this.ultimateClue(secret));
        details.append(clue);
      }
      choice.append(portrait,text);
      const card=document.createElement('article');
      card.className='selection-card';
      card.append(choice,details);
      grid.append(card);
    }
    const content=document.createElement('div');
    if(!milestone) {
      this.progress.refresh();
      content.append(this.difficultyPicker(),branchPicker(this.progress));
    }
    const legend=document.createElement('p');
    legend.className='weapon-theme-legend';
    legend.textContent=colorExplanation();
    content.append(legend);
    if(!milestone)content.append(weaponPicker(arms,this.view.armIcons,select));
    content.append(grid);
    this.openModal({kind:'armory',mark:'◇',
      kicker:milestone?'第 '+this.stage.floor+' 關 · '+this.stage.zone.name:'神獸遺物',
      title:milestone?'領取頭目遺物':this.duelMonster?'試戰 · '+this.duelMonster.name:'選擇神器',
      copy:milestone?'你已擊敗'+this.stage.guardian.name+'。揀一件新神器帶走，祝福同流派技能會繼續生效。'
        :'點選神器查看模型與招式，再帶一件出發。',content,
      buttons:milestone?[]:[makeButton(this.duelMonster?'返回練習場':'返回主畫面',()=>{
        const back=!!this.duelMonster;this.showCover();if(back)this.openPracticeLoadout();
      })]});
    this.weaponViewer.watchSelection(content,choices,id=>weaponById.get(id));
  }

  difficultyPicker() {
    const root=document.createElement('div');
    root.className='difficulty-picker';
    root.setAttribute('role','group');root.setAttribute('aria-label',textForLocale('選擇難度'));
    const heading=document.createElement('strong');
    heading.textContent=textForLocale('選擇難度');
    const controls=document.createElement('div'),detail=document.createElement('small'),goals=document.createElement('small');
    goals.className='difficulty-rewards';
    const refresh=()=>{
      for(const button of controls.children) button.setAttribute('aria-pressed',String(button.dataset.difficulty===this.difficulty.id));
      detail.textContent=textForLocale(this.difficulty.detail+' 每層金幣 ×'+this.difficulty.gold);
      goals.textContent=milestones[this.difficulty.id].map(reward=>format('第 《0》 關 · 《1》',reward.floor,reward.name)).join('　');
      goals.hidden=!goals.textContent;
    };
    for(const mode of Object.values(difficulties)) {
      const button=makeButton(mode.mark+' '+mode.name,()=>{this.difficulty=mode;refresh();},'difficulty-choice');
      button.dataset.difficulty=mode.id;
      controls.append(button);
    }
    root.append(heading,controls,detail,goals);refresh();return root;
  }

  start(weapon,saved=null,reprise=false) {
    this.recordChallenge('abandoned');
    if (this.heroVisual) this.view.removeEquippedActor(this.heroVisual);
    this.hero = makeHero();
    this.storyRun=saved?(reprise?'chapter':'resume'):null;
    this.testRun=!saved&&this.testMode;
    this.hero.ascendant=this.testRun;
    this.ui.hud.toggleAttribute('data-ascendant',this.testRun);
    this.progress.refresh();
    const kit=saved?{branch:saved.branch,branchSkills:saved.skills,disabledBranchSkills:[]}:this.progress.data;
    this.branchCombat.start(this.practiceRun?{...kit,branch:null}:kit,this.testRun);
    if(saved)this.branchCombat.reviveReady&&=!!saved.medic;
    this.training=saved?{...saved.training}:this.testRun?testTraining:this.practiceRun?{}:{...this.progress.data.training};
    this.hero.technique=saved?saved.technique:this.testRun?'stride':this.practiceRun?null:this.progress.data.technique;
    this.hero.lanternStyle=saved?.lantern??(this.testRun?'moonless':this.progress.data.lantern);
    this.runGold=0;
    this.redraws=saved?.redraws??0;
    this.altar=null;
    this.twinReward=null;
    this.failure=null;
    this.reviveOffered=!!saved?.reviveOffered;
    this.relicDetourUsed=!!saved?.relicDetourUsed;
    this.replayThrough=-1;
    if(!this.testRun&&!this.practiceRun&&!this.duelMonster&&!this.storyRun)this.rewardedRevive.prepare();
    this.heroVisual = this.view.createActor(0,2.68,true);
    this.relics=saved?saved.relics.map(id=>blessingById.get(id)):this.testRun?testBlessings():this.practiceRun?[...this.practiceRun.relics]:[];
    this.huntedWeapons=new Set(saved?.hunted);
    this.fusionPin=saved?.fusionPin??null;
    this.routeSeed=saved?.routeSeed??Math.floor(Math.random()*0x100000000);
    if(saved)this.arenaSeed=saved.arenaSeed;
    this.journal=saved?.journal.map(entry=>({...entry}))??[];
    this.storyChoices=Object.assign(Object.create(null),saved?.flags);
    this.learned=new Set();
    this.autoReady=new Map();
    this.schoolToast=0;
    this.ui['school-toast'].hidden=true;
    paintBlessingHud(this.ui['relic-icons'],this.relics);
    this.elapsed=(saved?.ms??0)/1000;
    this.kills=saved?.kills??0;
    this.runClock.reset();
    this.runClock.milliseconds=saved?.ms??0;
    this.challengeRunId=this.testRun||this.practiceRun||this.storyRun?null:crypto.randomUUID();
    if(this.challengeRunId){
      traffic?.beginRun(()=>this.runClock.milliseconds);
      this.players.begin(this.challengeRunId,{difficulty:this.difficulty.id,test_mode:false,practice:false,
        weapon_id:weapon.id,branch:this.branchCombat.branch?.id??null});
    }
    this.hitstop = 0;
    this.damageFlash = 0;
    this.buffered = {dodge:0,spell:0,strike:0,dodgeDirection:null,spellAim:null};
    this.level=saved?.floor??0;
    this.wave = 0;
    this.equip(weapon);
    this.learned=new Set(Object.keys(schools).filter(school=>schoolProgress(this.ranks,school).distinct>=3));
    this.hero.hp=Math.min(this.hero.maxHp,saved?.hp??this.hero.maxHp);
    this.state = 'play';
    this.audio.active = true;
    this.ui.cover.hidden = true;
    this.ui.hud.hidden = false;
    this.ui['practice-edit'].hidden=!this.practiceRun;
    this.paintDamage(this.practiceRun?.damage);
    this.closeModal();
    if(this.duelMonster)this.startMonsterDuel();
    else this.enter(this.level);
    if(this.ui.modal.hidden)this.view.canvas.focus({preventScroll:true});
  }

  equip(weapon) {
    this.weapon=weapon;
    this.relicHunt=!this.practiceRun&&weapon.spell&&!this.huntedWeapons?.has(weapon.id)?new RelicHunt(this,weapon):null;
    this.hero.projectileAim=null;
    this.view.equip(this.heroVisual,weapon);
    this.input.touch.setWeapon(weapon);
    const floor=this.practiceRun?(this.duelMonster.floor??12):this.level+1;
    this.ranks=buildStats(this.hero,weapon,floor,this.relics,this.training);
    this.ui.equipped.textContent=textForLocale(weapon.name);
    this.ui.equipped.style.color=weaponThemeInk(weapon);
    this.action('strike',weapon.attack,'✦',weapon.ink);
    this.ui.strike.title=textForLocale(comboNames(weapon).join(' → '));
    this.action('spell',weapon.skill,weapon.mark,weapon.ink);
    this.refreshFusion();
    this.hero.link=null;
  }

  refreshFusion() {
    this.fusions=fusionChoices(this.weapon,this.hero.resonance);
    this.fusion=pickFusion(this.fusions,this.fusionPin);
    const skill=skillLinks[this.weapon.id].name;
    this.ui.spell.title=textForLocale(this.weapon.skill+' · 第三擊命中後接技：'+skill+(this.fusion?'｜'+this.fusion.name+'：'+this.fusion.detail:''));
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
    this.advanceAfterReward();
  }

  action(id,label,mark,tone) {
    const control=this.ui[id];
    control.setAttribute('aria-label',textForLocale(label));
    control.title=textForLocale(label);
    control.querySelector('em').textContent=textForLocale(label);
    control.querySelector('span').textContent=textForLocale(mark);
    control.style.setProperty('--action-ink',tone);
  }

  clearActors() {
    this.clearReversal();
    clearAwakenings(this);
    this.branchCombat.activeMaw?.clearVisuals();
    const actors = new Set([...this.enemies,...this.fallen,...this.pickups]);
    for (const unit of actors) this.view.removeActor(unit.visual);
    this.enemies.length = this.fallen.length = this.pickups.length = 0;
  }

  clearReversal() {
    if(this.roomReversal)this.view.arenaArt.setReversals(null);
    this.roomReversal=null;
    this.reversalPending=false;
  }

  enter(level) {
    this.clearActors();
    this.clearThreats();
    this.rituals.length=0;
    this.level = level;
    this.wave = 0;
    this.clearDelay = 0;
    const pending=this.roomPreparation;
    const prepared=pending?.level===level&&pending.hero===this.hero&&pending.stage.difficulty===this.difficulty?pending:null;
    if(!prepared)this.cancelRoomPreparation();
    const stage=this.stage=prepared?.stage??this.journeyStage(level);
    this.clearStageEncounter();
    this.stageEncounter=prepared?.encounter;
    if(!this.testRun&&!this.storyRun)this.progress.reach(this.difficulty.id,stage.floor);
    this.bossBriefed=false;
    this.floorBossesDefeated=0;
    this.wardenSummonDeck=null;
    this.wardenRewardSound=null;
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
    h.relicGiantUntil=0;
    h.lanternOut=0;
    h.wardenBoonStacks=h.wardenBoonUntil=0;
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
    this.view.setStage(stage,prepared?.fixtures);
    if(prepared){
      prepared.fixtures=null;
      prepared.encounter=null;
      this.cancelRoomPreparation();
    }
    this.branchCombat.enter(this);
    this.view.lanternArt.set(this.escape);
    this.view.setMission(this.mission);
    this.view.setBossArena(null);
    this.setupMissionPins();
    this.audio.danger = stage.boss;
    this.audio.dread=stage.dread;
    this.ui['boss-hud'].hidden = true;
    this.ui['boss-echo'].hidden=true;
    this.ui['route-name'].textContent = textForLocale(stage.name);
    this.ui['route-floor'].textContent=this.difficulty.id==='vigil'
      ? format('第 《0》 / 100 關',stage.floor)
      : format('第 《0》 / 100 關 · 《1》',stage.floor,this.difficulty.name);
    this.ui['route-dots'].replaceChildren(...Array.from({length:10},(_,index) => {
      const gem = document.createElement('i');
      gem.className = 'route-gem '+(index===stage.chapter?'current':index<stage.chapter?'done':'');
      return gem;
    }));
    const clue=stage.clue;
    this.placeStory(null);
    this.objective(this.mission?.plan.hint??(stage.boss?'迎戰 '+stage.guardian.name:patterns[stage.hazard]+' · 留意地面預警'));
    const arrival=this.mission?.plan.title??(stage.boss?stage.guardian.name:patterns[stage.hazard]);
    this.announce(format('《0》 · 第 《1》 關',stage.zone.name,stage.floor),stage.name,arrival,2.15);
    this.startDelay=.70;
    if(clue&&!this.journal.some(entry=>!entry.hiddenClue&&entry.chapter===stage.zone.name)){
      this.discover(clue);
    }
    this.renderUI();
  }

  journeyStage(level){
    return chapterStage(modeStage(stages[level],this.difficulty),this.storyRun==='chapter');
  }

  announce(kicker,title,line,duration=2) {
    this.ui['announce-kicker'].textContent = textForLocale(kicker);
    this.ui['announce-title'].textContent = textForLocale(title);
    this.ui['announce-line'].textContent = textForLocale(line);
    this.ui.announce.classList.add('visible');
    this.announceLeft = duration;
  }

  objective(line) {
    const label = textForLocale(line);
    if (label !== this.ui.objective.textContent) this.ui.objective.textContent = label;
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
    if(this.escape?.ready)return;
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
    const opening=this.level===0&&!final;
    const hero=this.hero,stage=this.stage;
    const current=()=>this.hero===hero&&this.stage===stage&&(this.state==='story'||this.state==='transition');
    let preparation;
    if(opening){
      this.poseHero(0);
      preparation=this.openingPreparation={current,pending:true};
      preparation.promise=this.view.prepareBattlefield(hero,this.enemies,current,false,this.weapon)
        .catch(error=>console.warn('Opening battlefield preparation deferred',error))
        .finally(()=>{
          preparation.pending=false;
          if(this.openingPreparation===preparation)this.openingPreparation=null;
        });
    }
    this.openDialogue(clue.title,final?'尾聲':this.stage.zone.name,storyDialogue(clue,this.storyChoices),
      final?'聽鐘聲':'收起線索',async selected=>{
      if (selected) this.storyChoices[clue.title]=selected.id;
      if (clue.record) this.journal.push({title:clue.title,record:clue.record,chapter:this.stage.zone.name,note:selected?.note});
      if(preparation?.pending){
        this.state='transition';
        const next=this.ui['modal-content'].querySelector('.vn-next');
        if(next){next.disabled=true;next.textContent=textForLocale('燈火引路⋯⋯');}
        await preparation.promise;
        if(!current()||this.state!=='transition')return;
      }
      this.closeModal();
      if (final) {
        this.finish(true);
        return;
      }
      this.state='play';
      this.view.canvas.focus({preventScroll:true});
      this.objective(this.level===0?'敵影將至 · 紅印亮起時可翻滾':this.mission?.plan.hint??'前方的封印正在鬆動');
      this.startDelay=.72;
    });
    this.storyDepth.setActive(opening);
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
    const focus=content.querySelector('.vn-next:not([hidden]), .vn-options:not([hidden]) .vn-choice');
    this.openModal({kind:'dialogue',mark:'',kicker:'',title,copy:'',content,focus});
  }

  showJournal() {
    if (this.state!=='play') return;
    this.state='journal';
    const journal=document.createElement('div');
    journal.className='journal-entries';
    const entries=[...storyPrimer.map(([title,record])=>({title,record,chapter:'旅程提要'})),...this.journal];
    for (const clue of entries) {
      const entry=document.createElement('article');
      const heading=document.createElement('b'), record=document.createElement('p');
      heading.textContent=textForLocale(clue.chapter+' · '+clue.title);
      record.textContent=textForLocale(clue.record);
      entry.append(heading,record);
      if (clue.note) {
        const note=document.createElement('p');
        note.className='journal-choice';
        note.textContent=textForLocale('你嘅選擇 · '+clue.note);
        entry.append(note);
      }
      journal.append(entry);
    }
    this.openModal({kind:'story',mark:'◇',kicker:'尋名記',title:'探索手記',
      copy:this.journal.length?'':'沿着祭燈調查，線索會記在這裏。',content:journal,
      buttons:[makeButton('收起手記',()=>this.togglePause(),'primary')]});
  }

  spawn(kind,x,z,omen=null,override=null) {
    const base=override??enemySpec(this.stage,kind);
    const bodyScale=kind==='boss'?(base.bodyScale??2):1;
    const spec=bodyScale>1||omen?{...base,height:base.height*bodyScale}:base;
    if(omen){
      spec.hp=Math.round(spec.hp*1.22);spec.tint=omen.tint;spec.name=spec.name+' · '+omen.name;
      if(omen.id==='husk')spec.guard=true;
      if(omen.id==='hunt'){spec.speed*=1.16;spec.hurt*=1.12;}
    }
    const unit = {
      kind,spec,bodyScale,x,z,omen,hp:spec.hp,face:x>0?-1:1,phase:random(0,TAU),attack:null,cool:random(.55,1.22),
      kx:0,kz:0,stun:0,flash:0,age:0,step:0,recover:0,move:0,chill:0,exposed:0,bossPhase:0,phaseGuard:0,summons:0,morale:0,
      guardOpen:0,reaction:null,motion:null,frozen:0,
      visual:this.view.createActor(spec.frame,spec.height),
    };
    if (kind==='boss'||spec.model||spec.bestiary) this.view.prepareBoss(unit.visual,spec,kind==='boss');
    else if(spec.effigy)this.view.prepareEffigy(unit.visual,spec.effigy);
    this.bound(unit);
    const clearance=.45*bodyScale;
    if (this.isBlocked(unit,clearance)) {
      const angle=this.stage.bearing;
      for (let index=0;index<8;index++) {
        const turn=angle+index*TAU/8;
        unit.x=x+Math.cos(turn)*2.05;
        unit.z=z+Math.sin(turn)*2.05;
        this.bound(unit);
        if (!this.isBlocked(unit,clearance)) break;
      }
    }
    this.enemies.push(unit);
    if(kind==='boss'&&!this.roomReversal)this.reversalPending=true;
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
      this.ui['boss-echo-name'].textContent=textForLocale(visitor.name);
      this.view.bossCue(unit,'entrance');
      this.announce('契約異象',visitor.name,unit.spec.signature,2.1);
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
      const prepared=this.stageEncounter;
      this.bossArena=new BossArena(this,bossArenas.get(this.stage.floor),head,this.arenaSeed,
        prepared?.seed===this.arenaSeed?prepared.layout:undefined);
      const visuals=prepared?.seed===this.arenaSeed?prepared:null;
      if(visuals)this.stageEncounter=null;
      else this.clearStageEncounter();
      this.view.setBossArena(this.bossArena,visuals);
      head.phaseGuard=1.17;
      head.recover=1.04;
      this.ui['boss-name'].textContent=textForLocale(guardian.name);
      this.ui['boss-primary'].hidden=false;
      this.ui['boss-hud'].hidden = false;
      const extra=twinSpec(this.stage);
      if(extra){
        const echo=this.spawn('boss',this.escape.x*.65+(this.escape.x>0?3.45:-3.45),-4.95,null,extra);
        echo.phaseGuard=1.30;echo.recover=2.35;echo.cool=2.65;
        this.ui['boss-echo'].hidden=false;
        this.ui['boss-echo-name'].textContent=textForLocale(extra.name);
        this.view.bossCue(echo,'entrance');
        this.objective('擊敗兩名頭目 · 全數擊倒後出口會打開');
      }
      this.view.bossCue(head,'entrance');
      this.audio.boss(guardian.effect);
      this.announce('第 '+this.stage.floor+' 關 · '+(extra?'雙頭目':'頭目'),guardian.name,extra?'同行：'+extra.name:guardian.signature,2.35);
    }
  }

  briefBoss(){
    const stage=this.stage;
    const content=document.createElement('div');
    content.className='boss-briefing';
    for(const [title,copy] of briefingLines(bossArenas.get(stage.floor))){
      const section=document.createElement('section');
      const label=document.createElement('b'), instruction=document.createElement('p');
      label.textContent=title;
      instruction.textContent=copy;
      section.append(label,instruction);
      content.append(section);
    }
    this.ui.announce.classList.remove('visible');
    this.state='boss-briefing';
    const begin=makeButton(local('開始戰鬥','开始战斗','Start battle','戦闘開始'),()=>{
      if(this.state!=='boss-briefing'||this.stage!==stage)return;
      this.bossBriefed=true;
      this.state='play';
      this.closeModal();
      this.startWave();
      this.renderUI();
      this.view.canvas.focus({preventScroll:true});
    },'primary');
    this.openModal({kind:'boss-briefing',mark:'◇',kicker:local('頭目戰前提示','首领战前提示','Before the boss fight','戦闘前のヒント'),
      title:stage.guardian.name,content,buttons:[begin],focus:begin});
  }

  screenDirection(x,y,center=this.view.project(this.hero.x,.8,this.hero.z)) {
    const h = this.hero;
    const right=this.view.project(h.x+1,.8,h.z);
    const down=this.view.project(h.x,.8,h.z+1);
    const rx=right.x-center.x,ry=right.y-center.y,zx=down.x-center.x,zy=down.y-center.y;
    const det=rx*zy-ry*zx;
    if(Math.abs(det)<=.01)return null;
    const dx=(x*zy-y*zx)/det,dz=(rx*y-ry*x)/det;
    const length=Math.hypot(dx,dz);
    return length>0?[dx/length,dz/length]:null;
  }

  skillAim(drag) {
    const h=this.hero, range=h.spellRadius;
    let direction,reach=range;
    if(drag){
      direction=this.screenDirection(drag.x,drag.y);
      reach*=drag.strength;
    }else{
      let nearest=Infinity;
      for(const enemy of this.enemies){
        if(enemy.hp<=0||enemy.age<.23)continue;
        const x=enemy.x-h.x,z=enemy.z-h.z,gap=Math.hypot(x,z);
        if(gap<=.03||gap>range+(enemy.kind==='boss'?.65*(enemy.bodyScale??1):.22)||gap>=nearest)continue;
        nearest=gap;
        direction=[x/gap,z/gap];
        reach=Math.min(gap,range);
      }
    }
    const [dx,dz]=direction??this.aim({},range);
    const center={x:h.x+dx*reach,z:h.z+dz*reach};
    this.bound(center);
    return {dx,dz,center};
  }

  aim(input, range=basicReach(this)+.86) {
    const h = this.hero;
    if(input.aim){
      const center=this.view.project(h.x,.8,h.z);
      const x=input.aim.x-center.x,y=input.aim.y-center.y;
      const direction=Math.hypot(x,y)>7?this.screenDirection(x,y,center):null;
      if(direction)return direction;
    }
    let nearest = null;
    let shortest = Infinity;
    const anchors=this.bossArena?.targets??[];
    for (const foe of [...anchors,...this.enemies,...this.breakables()]) {
      const d = distance(h,foe);
      const priority=foe.kind==='arenaAnchor'?.50:foe.kind==='breakable'?1.35:1;
      if (foe.hp>0&&!(foe.turnedUntil>this.t) && d*priority<shortest && d<range+(foe.kind==='boss'?.65*(foe.bodyScale??1):0)) {
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
      const spellAim=this.buffered.spellAim;
      const manual=this.buffered.spell>0&&!!spellAim?.drag;
      const ready=manual?null:this.readyLink();
      const waitForHit=!manual&&h.link?.pending&&!h.link.contacts.length;
      const queuesFinisher=!manual&&!ready&&h.combo===2&&h.comboLeft>0&&h.atk<=.12&&this.buffered.strike>0;
      const cast=canFight&&!h.slash&&this.buffered.spell>0&&h.spellCool<=0&&!waitForHit&&!queuesFinisher;
      if (cast) {
        this.buffered.spell=0;
        this.buffered.spellAim=null;
        this.cast({...input,spellAim},ready);
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
        this.ui.inspect.querySelector('span').textContent=textForLocale(this.discovery.action);
        if (input.interact) this.interact();
      }
      return;
    }
    if(this.escape?.ready){
      this.ui.inspect.hidden=true;
      return;
    }
    const arenaPoint=this.bossArena?.nearby(h);
    if (arenaPoint) {
      this.ui.inspect.hidden=false;
      this.ui.inspect.querySelector('span').textContent=textForLocale(this.bossArena.label(arenaPoint));
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
      ||!!this.view.landscape?.solid.some(prop=>distance(unit,prop)<prop.radius+margin)
      ||!!this.escape?.barricades.some(item=>item.hp>0&&distance(unit,item)<item.radius+margin)
      || !!this.bossArena?.blocks(unit,margin,previous)
      || !!this.roomReversal?.blocks(unit,margin,previous);
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
      this.hitstop=Math.max(this.hitstop,final?.071:.029);
      this.view.feedback.kick(final?.184:.043,final?.235:.16,Math.atan2(dz,dx));
      if (final&&!strike.confirmed) invokeSchool(this,'wind');
      strike.confirmed=true;
    };
    this.audio.attack(this.weapon.id,step,'release',index);
    confirm(strikeWith(this,dx,dz,move,pulse?.power??1,confirm,link?(unit,kind)=>{
      this.confirmLink(link,unit,kind);
      giftFinisher(this,strike,unit,kind);
    }:undefined));
    if (link) {
      const travel=strikeTravel(move,basicReach(this)*move.reach,true);
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
    const aim=input.spellAim&&!link?this.skillAim(input.spellAim.drag):null;
    this.view.releaseSigil(h);
    this.view.castElements(h,this.weapon,aim?[aim.dx,aim.dz]:this.aim(input,Math.max(h.reach+.8,h.spellRadius+.55)));
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
      invokeArm(this,input,aim);
      if (!h.rush) heroAction(h,'cast');
      h.atk=Math.max(h.atk,.16);
      this.audio.arm(this.weapon.id);
    }
    invokeSchool(this,'fire');
  }

  schedule(delay, fire) {
    this.rituals.push({delay,fire});
  }

  awakeningBossSpec(kind) {
    return enemySpec(modeStage(stages[kind==='goat'?4:69],this.difficulty??difficulties.vigil),'boss');
  }

  releaseEnemyForAwakening(unit) {
    if(unit.attack)unit.attack.interrupted=true;
    unit.attack=unit.motion=null;
    unit.frozen=unit.kx=unit.kz=0;
    this.hazards=(this.hazards??[]).filter(hazard=>{
      if(hazard.owner!==unit)return true;
      if(hazard.windup)hazard.windup.interrupted=true;
      if(hazard.visual)this.view.removeProjectile(hazard.visual);
      return false;
    });
  }

  queueRelicDetour() {
    if(this.state!=='play'||this.relicDetourUsed||this.practiceRun||this.duelMonster||this.storyRun==='chapter'
      ||this.discovery||this.escape?.ready||this.enemies.some(u=>u.kind==='boss'&&u.hp>0))return false;
    const optional=s=>s&&!s.boss&&!s.clue&&!s.objective;
    const from=this.level;
    if(!optional(this.stage))return false;
    const choices=[from-1,from+1].filter(level=>optional(stages[level]));
    if(!choices.length)return false;
    const destination=choices[Math.floor(Math.random()*choices.length)];
    // A short casting tell plays before the regular room transition takes over.
    this.hero.invulnerable=Math.max(this.hero.invulnerable,.72);
    this.schedule(.46,()=>{
      if(this.level!==from||this.state!=='play'||this.escape?.ready||this.enemies.some(u=>u.kind==='boss'&&u.hp>0))return;
      this.relicDetourUsed=true;
      if(destination<from)this.replayThrough=from-1;
      this.recordChallenge('abandoned');
      this.continueAfterReward(destination);
      this.announce('神器覺醒',this.weapon.skill,'翻頁歧途已啟動，呢局停止計入排行榜。',2.6);
    });
    return true;
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
    this.view.impact(unit,origin,kind,tint,unit===this.hero?this.heroVisual:unit.visual);
    const material=unit.spec?.guard||unit.visual?.bestiary?.pao?'armor':unit.spec?.effect==='stone'?'stone':'hide';
    this.audio.impact(kind,material);
    if (kind==='break') this.hitstop=Math.max(this.hitstop,.083);
  }

  hit(unit,amount,origin,knock,tint=this.weapon.tone,weight,report,source) {
    const boon=source==='counter'?0:wardenBoon(this.hero,this.t);
    const damage=amount*(this.branchCombat.activeMaw?.damage??1)*(1+boon*.15);
    if (unit.kind==='arenaAnchor') return this.bossArena?.hit(unit,damage)??false;
    if (unit.kind==='breakable') {
      if(unit.hp<=0)return false;
      unit.hp=Math.max(0,unit.hp-damage);
      this.view.spark(unit.x,.42,unit.z,unit.hp?0xd3a779:0xffc484,unit.hp?5:14,.91,unit.style==='urn'?'stone':'flare');
      if(!unit.hp){this.view.lanternArt.smash(unit);this.audio.impact('break',unit.style==='urn'?'stone':'hide');}
      return true;
    }
    if (unit.hp<=0 || unit.age<.23 || unit.phaseGuard>0 || unit.turnedUntil>this.t) return false;
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
    unit.hp -= damage*bossDamageScale(unit,source,this.testRun)
      *(unit.exposed>0?1.24:1)*(shield?(unit.omen?.id==='husk'&&!heavy?.55:.73):1);
    if (phaseBoundary) unit.hp=Math.max(nextPhaseHp,unit.hp);
    this.practiceRun?.damage.record(source,before,unit.hp);
    const kind=unit.hp<=0?'fall':heavy&&(shield||unit.attack?.moonAssist)?'break':shield?'block':heavy?'heavy':'light';
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
      if(boss&&!unit.summoner)this.floorBossesDefeated++;
      const h = this.hero;
      h.hp = Math.min(h.maxHp,h.hp+h.leech);
      if(unit.summoner)rewardWardenReinforcement(this);
      if(primary&&unit.spec.finalWarden)dismissWardenReinforcements(this,unit);
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
    const duration=primary?unit.spec.phaseTransition?.[unit.bossPhase-1]:0;
    if(duration){
      const phase=unit.bossPhase;
      unit.phaseChange={phase,duration,elapsed:0,progress:0};
      unit.phaseGuard=duration+.91;
      if(unit.attack)unit.attack.interrupted=true;
      unit.attack=unit.motion=unit.reaction=null;
      unit.kx=unit.kz=unit.move=0;
      this.hazards=this.hazards.filter(hazard=>{
        if(hazard.owner!==unit)return true;
        if(hazard.windup)hazard.windup.interrupted=true;
        if(hazard.visual)this.view.removeProjectile(hazard.visual);
        return false;
      });
      this.bossArena.transform(phase);
      this.objective(phase===1?'銀輪正在碎裂':'血冠正在崩裂');
      this.audio.impact('heavy','armor');
      return;
    }
    if(primary)this.bossArena.transform(unit.bossPhase);
    this.releaseBossPhase(unit,primary);
  }

  tickBossTransform(unit,dt) {
    const change=unit.phaseChange;
    if(!change)return false;
    const previous=change.progress;
    change.elapsed+=dt;
    change.progress=Math.min(1,change.elapsed/change.duration);
    const fracture=change.phase===2?.24:.12;
    if(previous<fracture&&change.progress>=fracture){
      this.audio.impact('break','armor');
      this.view.feedback.kick(.11,.28,Math.PI*.63);
    }
    if(change.progress>=1){
      unit.phaseChange=null;
      unit.phaseGuard=.91;
      this.bossArena.showMechanisms();
      this.releaseBossPhase(unit,true);
    }
    return true;
  }

  releaseBossPhase(unit,primary) {
    const finisher=unit.bossPhase===2?unit.spec.lastFinishing??unit.spec.finishing:unit.spec.finishing;
    this.beginEnemyAttack(unit,finisher??unit.spec.attacks[0]);
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
    if(this.testRun){
      h.invulnerable=.20;
      if(attacker){
        if(!h.trainingWardSpent){
          h.trainingWardSpent=true;
          this.view.shock(h.x,h.z,0xffba7b,1.65,.63);
        }
        invokeSchool(this,'ward',attacker);
        this.view.spark(h.x,1.24,h.z,0xffd991,this.view.mobile?5:9,.49,'light');
      }
      return false;
    }
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
    const finisher=phase===2?spec.lastFinishing??spec.finishing:spec.finishing;
    const signature=index%2===0?spec.reinforcementMove:null;
    let pattern=forcedPattern??signature??(finisher&&phase&&index%3===2?finisher:spec.attacks[index%spec.attacks.length]);
    if(pattern==='summon'&&isWardenSummoner(this,unit))pattern=wardenSummonReady(this,unit)?wardenSummonPattern:'cleave';
    if(pattern===moonSlashPattern){
      if(queueMoonSlash(this,unit))return;
      pattern='cinders';
    }
    if (unit.kind==='oracle'&&this.stage.room>=6&&unit.step%4===0) {
      pattern=this.stage.enemyPattern==='summon'?'marked':this.stage.enemyPattern;
    }
    if (pattern==='summon'&&unit.summons>=2) pattern='prison';
    const time=pattern===wardenSummonPattern?1.18:spec.time*(1-phase*.12);
    unit.attack={pattern,time,windup:time,dx,dz};
    unit.attack.landing=telegraph(this,pattern,unit,h,{delay:time,damage:spec.hurt+phase*5,radius:spec.radius,owner:unit,phase});
    if(boss)this.view.chargeBoss(unit);
    unit.hunt?.signature(unit.attack,!!forcedPattern);
    if(unit.omen?.id==='echo'&&this.hazards.length<13)telegraph(this,'marked',unit,h,{delay:time+.46,damage:spec.hurt*.58,radius:1.27,owner:unit});
    if (boss && phase>=1 && index%3===2&&pattern!==wardenSummonPattern) {
      const echo=spec.attacks[(index+1)%spec.attacks.length];
      telegraph(this,['summon','blink','rally'].includes(echo)?'marked':echo,unit,h,
        {delay:time+.52,damage:spec.hurt*.72,radius:spec.radius*.72,owner:unit,phase});
    }
    this.warnEnemyAttack(unit);
  }

  warnEnemyAttack(unit) {
    if(unit.spec.finalWarden)this.audio.wardenStrike(unit.bossPhase,'charge');
    else this.audio.play('warning');
  }

  stepEnemyAttack(unit,dt) {
    const attack=unit.attack;
    const previous=attack.time;
    const readyLead=attack.readyLead??.17;
    attack.time-=dt;
    if(attack.time<=0)this.resolveEnemyAttack(unit);
    else if(unit.spec.finalWarden&&!attack.interrupted&&previous>readyLead&&attack.time<=readyLead)
      this.audio.wardenStrike(unit.bossPhase,'ready');
  }

  resolveEnemyAttack(unit) {
    const attack=unit.attack;
    const boss=unit.kind==='boss';
    unit.attack=null;
    if(attack.reversal){
      this.roomReversal?.release(unit,attack);
      return;
    }
    unit.motion={pattern:attack.pattern,dx:attack.dx,dz:attack.dz,age:0,moonStroke:attack.moonSlash?.index};
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
    const look=unit.spec.finalWarden?wardenStrikeLook(unit.bossPhase):null;
    this.view.elementBurst(unit.x,unit.spec.height*.38,unit.z,look?.tint??unit.spec.tint,look?.spark??unit.spec.effect,boss?12:6,
      boss?1.14:.83,Math.atan2(attack.dz,attack.dx));
    if(look)this.audio.wardenStrike(unit.bossPhase,'release');
    else this.audio.release(attack.pattern,boss,unit.spec.bestiary?.id);
    if(attack.pattern===wardenSummonPattern)resolveWardenSummon(this,unit,attack);
    if (boss) {
      if(this.bossArena?.boss===unit)this.bossArena.counters.resolveAttack(attack);
      if(!attack.moonAssist)this.view.feedback.kick(.11,.21,Math.atan2(attack.dz,attack.dx));
    }
  }

  updateEnemies(dt,drill) {
    const eye=this.branchCombat.skills.has('black-goat-eye')?this.branchCombat.eye:null;
    let echoCasting=this.bossArena?.phase===2&&(this.hazards.some(mark=>mark.moonSlash||mark.owner?.summoner)
      ||this.enemies.some(unit=>unit.summoner&&unit.hp>0&&unit.attack));
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
      if(updateTurnedEnemy(this,unit,dt))continue;
      if(this.tickBossTransform(unit,dt))continue;
      if(this.roomReversal?.dash?.unit===unit)continue;
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
      const bodyScale=unit.bodyScale??1;
      const clearance=.35*bodyScale;
      this.moveUnit(unit,unit.kx*dt,unit.kz*dt,clearance);
      if (old) this.view.motion.enemyTrail(old,unit);
      unit.kx*=Math.exp(-dt*10); unit.kz*=Math.exp(-dt*10);
      unit.move*=Math.exp(-dt*13);
      if (unit.attack) {
        if(!unit.attack.moonSlash&&!unit.attack.moonAssist)this.stepEnemyAttack(unit,dt);
        continue;
      }
      if (unit.age<.38 || unit.stun>0 || unit.recover>0) continue;
      const h=this.enemyTarget(unit);
      const dist = Math.max(.045,distance(h,unit));
      const dx=(h.x-unit.x)/dist, dz=(h.z-unit.z)/dist;
      if (Math.abs(dx)>.14) unit.face=Math.sign(dx);
      const attackRange=h===this.hero ? spec.reach : Math.min(spec.reach,spec.ranged??1.85);
      const exercise=arena?drill:null;
      if(!drill&&unit.kind==='boss'&&unit.cool<=0&&this.roomReversal?.tryLure(unit))continue;
      if (unit.cool<=0&&arena) {
        if(!exercise?.focused&&wardenSummonReady(this,unit)){
          this.beginEnemyAttack(unit,wardenSummonPattern);
          continue;
        }
        if (arena.counters.tryCharge(dist)) continue;
        if (!exercise?.focused&&dist<attackRange+3.2&&arena.tactics.tryAttack()) continue;
      }
      const canCast=!unit.summoner||(!echoCasting&&!unit.summoner.attack?.moonSlash);
      if (canCast&&dist<attackRange&&unit.cool<0&&(!exercise?.focused||exercise.attack)) {
        this.beginEnemyAttack(unit,exercise?.attack);
        if(unit.summoner)echoCasting=true;
        continue;
      }
      const target = h!==this.hero ? attackRange*.64 : exercise?.followRange??spec.ranged??(unit.kind==='boss'?2.8:spec.reach*.67);
      const direction = dist>target ? 1 : spec.ranged&&dist<target*.63 ? -.82 : 0;
      let sx=0,sz=0;
      for (const other of this.enemies) {
        if (unit===other || other.hp<=0) continue;
        const between=distance(unit,other);
        const spacing=.65*(bodyScale+(other.bodyScale??1));
        if (between>.02 && between<spacing) {
          sx+=(unit.x-other.x)/between*(spacing-between)*2.3;
          sz+=(unit.z-other.z)/between*(spacing-between)*2.3;
        }
      }
      const boss=unit.kind==='boss';
      const chilled=unit.chill>0?(boss?.81:.57):1;
      const marked=eye?.contains(this.hero,unit)?(boss?.84:.65):1;
      const aggression = (1+unit.bossPhase*.17)*Math.min(chilled,marked)*(unit.morale>0?1.31:1)
        *(unit.omen?.id==='hunt'&&unit.hp<unit.spec.hp*.5?1.31:1);
      const advance=direction*spec.speed*aggression*dt;
      const traveled=this.moveUnit(unit,dx*advance+sx*dt,dz*advance+sz*dt,clearance);
      if (direction && traveled<Math.abs(advance)*.38) {
        const side=unit.phase>Math.PI?-1:1;
        const sidestep=Math.abs(advance)*side;
        if (this.moveUnit(unit,-dz*sidestep,dx*sidestep,clearance)<Math.abs(sidestep)*.35) {
          this.moveUnit(unit,dz*sidestep,-dx*sidestep,clearance);
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
    for(const unit of this.enemies){
      if(unit.attack?.wardenPortal||unit.attack?.moonAssist)unit.attack=null;
    }
    for (const hazard of this.hazards) {
      if (hazard.visual) this.view.removeProjectile(hazard.visual);
      if(hazard.moonSlash&&hazard.windup&&hazard.owner.attack===hazard.windup)hazard.owner.attack=null;
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
        } else if(!this.testRun&&!this.bossBriefed&&this.stage.waves[this.wave]?.includes('boss')) {
          this.briefBoss();
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
    const anotherWave=this.wave<this.stage.waves.length;
    if (this.clearDelay<(anotherWave?.55:.65)) return;
    this.clearDelay=0;
    this.clearThreats();
    this.rituals.length=0;
    if (anotherWave) {
      this.announce('結界再起','下一波','月蝕正在召喚更多的影子。',.78);
      this.startDelay=.72;
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
    this.clearReversal();
    this.audio.danger=false;
    this.view.setBossArena(null);
    this.setupMissionPins();
    this.ui.hud.dataset.mission='escape';
    const exit=this.escape;
    exit.ready=true;
    exit.opening=.24;
    exit.message=message;
    exit.found||=this.hero.lanternOut<=0&&distance(this.hero,exit)<lanternRadius(this.stage)*.96;
    for(const gate of exit.barricades){
      if(!gate.gate||gate.hp<=0)continue;
      gate.hp=0;
      this.view.lanternArt.smash(gate);
      this.view.spark(gate.x,.42,gate.z,exit.frame.light,8,.85,'flare');
    }
    this.announce('封印解除','出口已開','行入拱門就可以前往下一層。',1.95);
    this.updateEscape(0);
  }

  exitOpen() {
    return this.escape?.ready&&!this.escape.passed;
  }

  useExit() {
    if(this.state!=='play'||!this.exitOpen()||this.escape.opening>0||!inExitThreshold(this.hero,this.escape))return false;
    this.escape.passed=true;
    this.clearThreats();this.rituals.length=0;this.clearActors();
    this.ui.inspect.hidden=true;
    if(this.testRun){
      this.hero.hp=this.hero.maxHp;
      this.leaveAltar();
      return true;
    }
    if(this.level<=this.replayThrough){
      this.continueAfterReward();
      return true;
    }
    const reward=milestones[this.difficulty.id].find(item=>item.floor===this.stage.floor);
    const gold=this.storyRun?0:floorGold(this.stage);
    const unlocked=!this.storyRun&&this.progress.clear(this.difficulty.id,this.stage.floor,gold,reward?.id==='crimson');
    this.recordChallenge('active',this.stage.floor);
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
    exit.opening=Math.max(0,exit.opening-dt);
    if(this.useExit())return;
    exit.searchTime+=dt;
    const dx=exit.x-this.hero.x,dz=exit.z-this.hero.z;
    const compass=(Math.abs(dx)>2?(dx<0?'西':'東'):'')+(Math.abs(dz)>2?(dz<0?'北':'南'):'');
    const direction=compass?format('往《0》',compass):'';
    this.objective(exit.found
      ?format('出口已開 · 《0》',direction||'行入拱門')
      :format('提燈找出口 · 《0》',exit.searchTime>7&&direction?direction:'沿北面牆搜尋'));
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
      element.textContent=textForLocale(point.symbol??'✧');
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
      frame:pose,modelScale:h.relicGiantUntil>t?2:1,poseSize:(isRoll?.92:pose===heroFrames.run?.93:1)*(h.relicGiantUntil>t?2:1),face:action?.face??h.face,
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
      flash:h.flash,fade:h.awakeningForm?.until>t&&(!h.awakeningForm.host||h.awakeningForm.host.hp>0)?0:
        !h.ascendant&&h.invulnerable>0&&!isRoll&&Math.sin(t*33)<-.35?.74:1,
      aura:h.ascendant?.86:h.ward>0||h.surge>0?.55:.24,rim:h.ascendant?0xffcc6e:this.weapon.tone,
    };
    this.view.actor(this.heroVisual,h,blendPose(blendPose(heroFrame,action),reactionPose(h)));
  }

  poseEnemy(unit,dt) {
    const t=this.t;
    advanceReaction(unit,dt);
    const boss=unit.kind==='boss';
    const primary=this.bossArena?.boss===unit;
    const shielded=primary&&this.bossArena?.locked;
    const staggered=boss&&(unit.stun>.20||primary&&this.bossArena?.counters.stagger>0);
    const frozen=unit.frozen>0;
    const wind=unit.attack ? 1-clamp(unit.attack.time/(unit.attack.windup??unit.spec.time),0,1) : 0;
    const gait=actorMotion(unit,dt,t);
    const turned=unit.turnedUntil>t;
    const target=(turned?unit.turnedTarget:null)??this.enemyTarget(unit);
    const xToTarget=target.x-unit.x,zToTarget=target.z-unit.z;
    const targetHeading=Math.hypot(xToTarget,zToTarget)>.09?Math.atan2(xToTarget,zToTarget):undefined;
    const stepping=!unit.attack&&!unit.reaction&&!staggered&&!frozen;
    const fierce=unit.bossPhase>0;
    const owlDive=!unit.visual.bestiary&&unit.spec.frame===6&&(wind>.42||unit.recover>.37);
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
      aura:turned?.96:frozen?.90:staggered?.82:unit.phaseGuard>0||shielded?.65:unit.omen?.61:unit.chill>0||unit.exposed>0?.38:unit.attack||boss?.25:.09,
      rim:turned?0xa4ffcf:frozen?0xb9f9ff:staggered?0x9ff4e4:shielded?this.bossArena.terrain.ink:unit.omen?.tint??(unit.chill>0?0x8de2de:unit.morale>0?0xffd48b:unit.exposed>0?0xff8255:unit.spec.tint),
      phase:unit.bossPhase,
      gaitPhase:gait.phase,stepWeight:gait.weight,heading:gait.heading,targetHeading,dt,
    };
    this.view.actor(unit.visual,unit,blendPose(blendPose(frame,staggered?null:enemyPose(unit)),reactionPose(unit,boss)));
  }

  animateActors(dt) {
    const h=this.hero, t=this.t;
    const maw=this.branchCombat.activeMaw;
    maw?.update(t);
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
      if (this.hero.reaction.age>=reactionTime.fall) this.offerRevive();
      return;
    }
    this.buffered.dodge = input.dodge ? .39 : this.buffered.dodge-dt;
    if(input.dodge) this.buffered.dodgeDirection=input.dodgeDirection??null;
    const h=this.hero;
    const finishing=h.link?.pending||(h.combo===2&&h.comboLeft>0&&h.atk<.14&&(input.strike||this.buffered.strike>0));
    this.buffered.spell = input.spell ? (finishing?.96:.35) : this.buffered.spell-(this.hitstop>0?0:dt);
    if(input.spell)this.buffered.spellAim=input.spellAim??null;
    this.buffered.strike = input.strike ? Math.max(.23,this.hero.atk+.09) : this.buffered.strike-dt;
    if (this.hitstop>0) {
      this.hitstop-=dt;
      return;
    }
    if(!this.runClock)this.elapsed+=dt;
    this.t+=dt;
    this.branchCombat.activeMaw?.expire(this.t);
    this.updateHero(dt,input);
    if (this.state!=='play') return;
    this.updateRituals(dt);
    if (this.state!=='play') return;
    updateAwakenings(this,dt);
    if (this.ultimateFields.length) updateUltimates(this,dt);
    this.branchCombat.update(this,dt);
    if(this.reversalPending){
      this.reversalPending=false;
      this.roomReversal=new BossReversal(this);
      this.view.arenaArt.setReversals(this.roomReversal);
    }
    this.roomReversal?.tick(dt);
    if(this.state!=='play')return;
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
    let support=this.testRun?(stacks?`✷ 無敵 · 噬食 ×${stacks}`:'✷ 無敵'):stacks?`噬食 ×${stacks} · ${Math.ceil(maw.remaining(this.t))} 秒`
      :this.branchCombat.skills.has('medic')?(this.branchCombat.reviveReady?'✚ 急救可用':'✚ 急救已用')
      :this.branchCombat.skills.has('radar')?'◉ 雷達運作中':'';
    const boon=wardenBoon(h,this.t);
    if(boon)support+=(support?' · ':'')+'殘影增傷 +'+boon*15+'% · '+Math.ceil(h.wardenBoonUntil-this.t)+'秒';
    const badge=this.ui['field-support'];
    badge.classList.toggle('maw-stacks',stacks>0);
    if(badge.textContent!==textForLocale(support)) badge.textContent=textForLocale(support);
    badge.hidden=!support;
    const hp=fixed(h.hp);
    const label=hp+' / '+h.maxHp;
    if (this.ui['hp-number'].textContent!==textForLocale(label)) {
      this.ui['hp-number'].textContent=textForLocale(label);
      this.ui['hp-fill'].style.transform='scaleX('+h.hp/h.maxHp+')';
      this.meter.setAttribute('aria-valuemax',h.maxHp);
      this.meter.setAttribute('aria-valuenow',hp);
    }
    const boss=this.enemies.find(unit=>unit.kind==='boss'&&!unit.spec.secondary);
    const echo=this.enemies.find(unit=>unit.kind==='boss'&&unit.spec.secondary&&!unit.summoner);
    let summons=0,echoHp=0,echoMax=0;
    for(const unit of this.enemies)if(unit.summoner&&unit.hp>0){
      summons++;
      echoHp+=unit.hp;
      echoMax+=unit.spec.hp;
    }
    const bossHUD=this.ui['boss-hud'];
    bossHUD.hidden=!boss&&!echo&&!summons;
    this.ui['boss-primary'].hidden=!boss;
    this.ui['boss-echo'].hidden=!echo&&!summons;
    if(echo||summons){
      const name=summons?'殘影頭目 ×'+summons:echo.spec.name;
      if(this.ui['boss-echo-name'].textContent!==textForLocale(name))this.ui['boss-echo-name'].textContent=textForLocale(name);
      const ratio=summons?echoHp/echoMax:echo.hp/echo.spec.hp;
      this.ui['boss-echo-fill'].style.transform='scaleX('+clamp(ratio,0,1)+')';
    }
    const kills=String(this.kills),clock=formatTime(this.elapsed),gold=String(this.runGold??0);
    if(this.ui['run-kills'].textContent!==textForLocale(kills))this.ui['run-kills'].textContent=textForLocale(kills);
    if(this.ui['run-time'].textContent!==textForLocale(clock))this.ui['run-time'].textContent=textForLocale(clock);
    if(this.ui['run-gold'].textContent!==textForLocale(gold))this.ui['run-gold'].textContent=textForLocale(gold);
    if (boss) this.ui['boss-fill'].style.transform='scaleX('+clamp(boss.hp/boss.spec.hp,0,1)+')';
    const arena=this.bossArena;
    const arenaHint=this.ui['boss-arena-hint'];
    arenaHint.hidden=!boss||!arena?.phase||!!boss.phaseChange;
    arenaHint.classList.toggle('tactic',!!boss&&arena?.tactics.cueTime>0);
    this.ui['boss-hud'].classList.toggle('shielded',!!boss&&!!arena?.locked);
    if (!arenaHint.hidden) {
      const line=arena.status();
      if (arenaHint.textContent!==textForLocale(line)) arenaHint.textContent=textForLocale(line);
    }
    const weakness=this.ui['boss-weakness'];
    const reversal=this.roomReversal;
    weakness.hidden=arenaHint.hidden&&(!reversal||(!boss&&!echo&&!summons)||!!boss?.phaseChange);
    if (!weakness.hidden) {
      const counter=arena?.counters;
      const usingDevice=reversal&&(reversal.windup||reversal.dash||reversal.nearby()||!counter?.active);
      const hint=usingDevice?reversal.cue:counter?.hint??'';
      weakness.classList.toggle('open',!!boss&&boss.exposed>0);
      weakness.classList.toggle('windup',!!(reversal?.windup||reversal?.dash)||counter?.chargeHint>0);
      if (weakness.textContent!==textForLocale(hint)) weakness.textContent=textForLocale(hint);
    }
    const cooldowns=[h.rollCool/h.rollTime,h.spellCool/h.spellTime,h.atk/h.atkTotal];
    const combo=String(h.comboLeft>0?h.combo:0);
    if (this.ui.strike.dataset.combo!==combo) this.ui.strike.dataset.combo=combo;
    const ready=this.readyLink();
    const queued=h.link?.pending&&!ready&&this.buffered.spell>0&&h.spellCool<=0;
    const linkState=ready?'ready':queued?'queued':h.linkFlash>0?'cast':'';
    const spell=this.ui.spell, hint=this.ui['skill-link'];
    const fusion=ready?this.fusionForLink(ready):linkState==='cast'?h.linkFusion:null;
    const name=fusion?.name??skillLinks[this.weapon.id].name;
    if (spell.dataset.link!==linkState||spell.dataset.fusion!==(fusion?.id??'')) {
      spell.dataset.link=linkState;
      spell.dataset.fusion=fusion?.id??'';
      spell.classList.toggle('ultimate-ready',!!fusion?.ultimate);
      if (fusion) spell.style.setProperty('--fusion-ink',fusion.ink);
      else spell.style.removeProperty('--fusion-ink');
      hint.hidden=!linkState;
      const marks=resonanceMarks(h.resonance);
      const suffix=fusion?' '+fusion.mark:marks?' '+marks:'';
      if (linkState) hint.textContent=textForLocale(linkState==='queued'?'等候命中':ready?'接技 · '+name+suffix:name+'！'+suffix);
    }
    if (ready) spell.style.setProperty('--link-left',Math.round((ready.until-this.t)/ready.window*360)+'deg');
    const seconds=Math.ceil(Math.max(0,h.spellCool));
    const hideSpell=this.state!=='play'||!!this.discovery;
    const disabled=String(hideSpell||seconds>0);
    const countdown=this.ui['spell-cooldown'];
    const count=seconds?String(seconds):'';
    const spellLabel=ready?'接技：'+name:this.weapon.skill+(seconds?'，冷卻 '+seconds+' 秒':'');
    if(spell.hidden!==hideSpell) spell.hidden=hideSpell;
    if(spell.getAttribute('aria-disabled')!==disabled) spell.setAttribute('aria-disabled',disabled);
    if(spell.getAttribute('aria-label')!==textForLocale(spellLabel)) spell.setAttribute('aria-label',textForLocale(spellLabel));
    if(countdown.textContent!==textForLocale(count)) {
      countdown.textContent=textForLocale(count);
      countdown.hidden=!seconds;
      this.input.touch.prompt.dataset.cooldown=String(!!seconds);
    }
    actionIds.forEach((id,index)=>this.ui[id].style.setProperty('--cool',Math.round(Math.max(0,cooldowns[index])*360)+'deg'));
    this.ui['damage-vignette'].style.opacity=String(this.damageFlash);
    const mission=this.mission;
    this.ui['mission-status'].hidden=!mission?.started||!!mission.finished;
    if (mission?.started&&!mission.finished) {
      const {text,fill}=mission.status();
      this.ui['mission-status'].dataset.mode=mission.plan.type;
      if (this.ui['mission-title'].textContent!==textForLocale(mission.plan.title)) this.ui['mission-title'].textContent=textForLocale(mission.plan.title);
      if (this.ui['mission-text'].textContent!==textForLocale(text)) this.ui['mission-text'].textContent=textForLocale(text);
      this.ui['mission-track'].hidden=fill===null;
      if (fill!==null) this.ui['mission-fill'].style.transform='scaleX('+fill+')';
    }
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    const dt=clamp((now-this.previousTime)/1000,0,.045);
    this.previousTime=now;
    if(this.hero)this.elapsed=this.runClock.tick(now,this.state==='play'&&!document.hidden&&!this.weaponViewer.open&&!this.discovery)/1000;
    if(document.hidden||this.weaponViewer.open)return;
    if(!this.ui.cover.hidden)return;
    if(!this.hero)return;
    this.audio.active=this.state==='play'||rewardMusicStates.has(this.state)
      ||this.state==='armory'&&this.ui.cover.hidden;
    if(this.storyDepth.render(this.view.renderer,dt,this.view.feedback.subdued))return;
    if(this.openingPreparation?.pending&&this.openingPreparation.current())return;
    if(this.state==='transition'&&this.presentingRoom)return;
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
    const drag=this.input.spellGesture?.drag;
    const aiming=drag&&this.state==='play'&&!this.discovery&&this.hero.spellCool<=0;
    this.view.previewAim(aiming?skillFootprint(this,this.skillAim(drag)):null,this.weapon.tone);
    this.view.render(dt,this.hero,this.state!=='play'&&this.state!=='falling',freezeWarnings&&this.state==='play',this.enemies);
    this.branchCombat.render(this);
    this.updateMissionPins();
  }

  openModal({mark,kicker,title,copy,content,buttons,kind='',focus}) {
    if(this.weaponViewer.open)this.weaponViewer.dialog.close();
    this.weaponViewer.stopSelection();
    this.input.reset();
    this.buffered = {dodge:0,spell:0,strike:0,dodgeDirection:null,spellAim:null};
    this.ui['modal-mark'].textContent=textForLocale(mark);
    this.ui['modal-kicker'].textContent=textForLocale(kicker);
    this.ui['modal-title'].textContent=textForLocale(title);
    this.ui['modal-copy'].textContent=textForLocale(copy);
    this.ui['modal-copy'].hidden=!copy;
    this.ui.modal.dataset.kind=kind;
    this.ui['modal-content'].replaceChildren(...(content?[content]:[]));
    this.ui['modal-actions'].replaceChildren(...(buttons||[]));
    this.ui.modal.hidden=false;
    this.ui.hud.inert=true;
    this.ui.cover.inert=true;
    (focus??this.ui.modal.querySelector('button'))?.focus({preventScroll:true});
    this.interfaceMotion.enter(this.ui.modal);
  }

  closeModal() {
    this.weaponViewer.stopSelection();
    this.storyDepth.setActive(false);
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
    this.prepareNextRoom();
  }

  clearStageEncounter(){
    this.view.arenaArt.disposePreparation(this.stageEncounter);
    this.stageEncounter=null;
  }

  cancelRoomPreparation(){
    const pending=this.roomPreparation;
    this.roomPreparation=null;
    if(pending?.fixtures)this.view.disposeFixtures(pending.fixtures);
    this.view.arenaArt.disposePreparation(pending?.encounter);
  }

  prepareNextRoom(level=this.level+1){
    const hero=this.hero;
    if(level>=stages.length)return null;
    const ready=this.roomPreparation;
    if(ready?.level===level&&ready.hero===hero&&ready.stage.difficulty===this.difficulty)return ready;
    this.cancelRoomPreparation();
    const stage=this.journeyStage(level);
    const preparation={level,hero,stage,pending:true};
    this.roomPreparation=preparation;
    const valid=()=>this.roomPreparation===preparation&&this.hero===hero&&this.state!=='cover';
    preparation.promise=this.prepareRoom(preparation,valid)
      .catch(error=>console.warn('Room preparation deferred',error))
      .finally(()=>{preparation.pending=false;});
    return preparation;
  }

  async prepareRoom(preparation,valid){
    await afterPaint();
    if(!valid())return;
    const {stage}=preparation;
    const specs=[];
    if(this.relicHunt?.state==='waiting')specs.push(this.relicHunt.specFor(stage));
    const waveCounts=new Map();
    for(const wave of stage.waves){
      const counts=new Map();
      for(const kind of wave)counts.set(kind,(counts.get(kind)??0)+1);
      for(const [kind,count] of counts){
        waveCounts.set(kind,Math.max(count,waveCounts.get(kind)??0));
      }
    }
    if(stage.objective)for(const kind of stage.zone.foes)if(!waveCounts.has(kind))waveCounts.set(kind,1);
    for(const [kind,count] of waveCounts){
      if(kind==='boss')continue;
      const spec=enemySpec(stage,kind);
      for(let i=0;i<count;i++)specs.push(spec);
    }
    const bosses=[];
    if(stage.boss){
      bosses.push(enemySpec(stage,'boss'));
      const layout=bossArenas.get(stage.floor),seed=(this.arenaSeed+0x9e3779b9)>>>0;
      preparation.encounter={seed,layout:drawBossEncounter(stage,layout,seed)};
    }
    const twin=twinSpec(stage);
    if(twin)bosses.push(twin);
    const visitor=visitorFor(stage,this.routeSeed);
    if(visitor)bosses.push(monsterBattle(visitor,stage.floor,this.difficulty));
    const summons=bosses.some(spec=>spec.finalWarden)?wardenReinforcementSpecs(stage.difficulty):[];
    await this.view.prepareEncounters([...specs,...bosses,...summons],valid);
    if(!valid())return;
    const fixtures=await this.view.prepareFixtures(stage,valid);
    if(!valid()){
      if(fixtures)this.view.disposeFixtures(fixtures);
      return;
    }
    preparation.fixtures=fixtures;
    if(preparation.encounter){
      const lamps=await this.view.prepareArenaLamps(preparation.encounter.layout,valid);
      if(!valid()){
        if(lamps)this.view.arenaArt.clear(lamps.root);
        return;
      }
      preparation.encounter.lamps=lamps;
      const phases=await this.view.prepareArenaPhases(stage,preparation.encounter.layout,valid);
      if(!valid()){
        this.view.arenaArt.disposePreparation({phases});
        return;
      }
      preparation.encounter.phases=phases;
    }
    if(bosses.length)await this.view.prepareBossEntrances(bosses,stage,valid);
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
      branch.textContent=textForLocale(school.name+' '+next+'/3'+(next===3?' · '+school.skill:''));
      branch.title=textForLocale(school.detail);
      name.textContent=textForLocale(relic.name+(rank?' · '+rank+' → '+(rank+1):''));
      detail.textContent=blessingSummary(relic);
      const preview=resonancePreview(this.weapon,relic.school,total);
      resonance.className='relic-resonance'+(preview.upgrade?' upgrade':'');
      resonance.style.setProperty('--resonance-ink',school.ink);
      resonance.textContent=textForLocale(preview.text);
      if (next===3&&count<3) branch.textContent+=textForLocale('（解鎖）');
      button.append(mark,name,detail);
      const extra=document.createElement('p');
      extra.textContent=blessingDetails(relic);
      const details=effectDetails(...(extra.textContent&&extra.textContent!==detail.textContent?[extra]:[]));
      const card=document.createElement('article');
      card.className='selection-card';
      card.append(button,details);
      if(relic.weaponId){
        const bonus=bonusPercent(relicPower(rank+1)-1);
        resonance.textContent=local(`神器技能傷害 ${bonus}`,`神器技能伤害 ${bonus}`,`Relic skill damage ${bonus}`,`神器スキルのダメージ ${bonus}`);
        details.append(resonance);
        grid.append(card);
        continue;
      }
      details.append(resonance,branch);
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
        weave.textContent=textForLocale((lead.ultimate?'覺醒 ':unlock?'解鎖 ':'升階 ')+lead.name+(changed.length>1?' ＋'+(changed.length-1):'')+'｜'+lead.detail);
        details.append(weave);
      } else if (secret?.known&&!secret.ready&&secret.rite.schools.includes(relic.school)&&total<6) {
        const clue=document.createElement('small');
        clue.className='relic-fusion ultimate-clue';
        clue.style.setProperty('--fusion-ink',secret.rite.ink);
        clue.textContent=textForLocale('隱藏合招｜'+this.ultimateClue(secret,relic.school));
        details.append(clue);
      }
      for(const seal of seals){
        if(h.seals.has(seal.id)||!seal.needs.includes(relic.id)||!seal.needs.some(id=>id!==relic.id&&this.ranks.has(id)))continue;
        const clue=document.createElement('small');
        clue.className='relic-fusion ultimate-clue';clue.style.setProperty('--fusion-ink',seal.ink);
        clue.textContent=textForLocale('秘印 '+seal.name+'｜'+seal.detail);
        details.append(clue);
      }
      grid.append(card);
    }
    const content=document.createElement('div');
    const reward=this.floorReward;
    if (!bonus&&reward) {
      if(reward.gold||heal){
        const receipt=document.createElement('p');
        receipt.className='floor-receipt';
        receipt.textContent=textForLocale([reward.gold?'金幣 +'+reward.gold:'',heal?'回復 '+heal+' 生命':''].filter(Boolean).join(' · '));
        content.append(receipt);
      }
      if (reward.notice) {
        const notice=document.createElement('p');
        notice.className='milestone-notice';
        notice.textContent=textForLocale(reward.notice.name+' · '+reward.notice.detail);
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
    this.openModal({kind:'blessing',mark:'✧',kicker:format('第 《0》 關 · 《1》',this.stage.floor,message??'已完成'),
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
      note.textContent=textForLocale('隱藏合招覺醒 · '+awakened.name+'｜'+awakened.detail);
      note.hidden=false;
      this.schoolToast=4.2;
    } else if(newSeal){
      const note=this.ui['school-toast'];
      note.textContent=textForLocale('秘印 · '+newSeal.name+'｜'+newSeal.detail);
      note.hidden=false;
      this.schoolToast=3.8;
    } else if (learned) {
      const note=this.ui['school-toast'];
      note.textContent=textForLocale('解鎖 '+schools[branch].skill+' · '+schools[branch].detail);
      note.hidden=false;
      this.schoolToast=3.2;
    } else if (this.fusion&&this.fusion.id!==previous?.id) {
      const note=this.ui['school-toast'];
      note.textContent=textForLocale('接技合招 · '+this.fusion.name+'｜'+this.fusion.detail);
      note.hidden=false;
      this.schoolToast=3.2;
    }
    paintBlessingHud(this.ui['relic-icons'],this.relics);
    this.audio.play('blessing');
    this.interfaceMotion.reward({id:relic.id,name:relic.name,rank:this.ranks.get(relic.id)||1,ink:schools[relic.school].ink,icon:blessingIcon(relic)});
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
      name.textContent=textForLocale(relic.name);
      detail.textContent=blessingSummary(relic);
      school.textContent=textForLocale(schools[relic.school].name);
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
    this.advanceAfterReward();
  }

  async advanceAfterReward() {
    const floor=this.stage.floor;
    this.saveJourney();
    if(floor===chapterBreak&&!this.testRun&&!this.practiceRun&&!this.duelMonster){
      this.state='chapter-break';
      const next=selected=>{
        if(this.state!=='chapter-break')return;
        if(selected?.id==='return')this.showCover();
        else this.continueAfterReward();
      };
      this.openDialogue(local('第一章完 · 金庫門前','第一章完 · 金库门前','Chapter I Clear · The Vault Gate','第1章完・金庫の門'),
        local('第 50 層','第 50 层','Floor 50','50階'),chapterInterlude(this.storyChoices),
        local('確認去向','确认去向','Confirm choice','行き先を決める'),next);
      return;
    }
    return this.continueAfterReward();
  }

  async continueAfterReward(level=this.level+1){
    if(level<stages.length){
      const previous=this.level;
      const preparation=this.prepareNextRoom(level);
      this.state='transition';
      this.openModal({kind:'transition',mark:'◇',kicker:'第 '+(level+1)+' 關',
        title:'燈火引路',copy:'正在準備下一層⋯⋯'});
      await afterPaint();
      await preparation.promise;
      if(this.roomPreparation!==preparation||this.level!==previous||this.state!=='transition')return;
      this.presentingRoom=preparation;
      try{
        this.enter(level);
        if(this.state!=='transition')return;
        const current=()=>this.presentingRoom===preparation&&this.hero===preparation.hero&&this.state==='transition';
        this.poseHero(0);
        await this.view.prepareBattlefield(this.hero,this.enemies,current,true,this.weapon)
          .catch(error=>console.warn('Room rendering preparation deferred',error));
        if(!current())return;
        this.state='play';
        this.closeModal();
      }finally{
        if(this.presentingRoom===preparation)this.presentingRoom=null;
      }
      return;
    }
    this.state='play';
    this.closeModal();
    this.placeStory(ending);
    this.announce('王冠主印已破',ending.title,'叫回晏燈，再敲下最後一聲鐘。',2.0);
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
      :[makeButton('繼續旅程',()=>this.togglePause(),'primary'),this.testRun
        ?makeButton('返回入口',()=>this.showCover())
        :makeButton('結束本次挑戰',()=>this.finish(false,'leave'))];
    const content=this.fusionMenu();
    const feedback=this.view.feedback;
    const setting=document.createElement('label');
    setting.className='reduced-effects';
    const checkbox=document.createElement('input');
    checkbox.type='checkbox';
    checkbox.checked=feedback.subdued;
    checkbox.addEventListener('change',()=>{
      feedback.setSubdued(checkbox.checked);
      this.syncEffects();
    });
    setting.append(checkbox,'減少閃光與震動');
    const pauseContent=document.createElement('div');
    if(content)pauseContent.append(content);
    pauseContent.append(setting);
    this.openModal({kind:'pause',mark:'☾',kicker:'月蝕之夜',title:'稍作休息',
      copy:this.input.touchMode?'拖住移動，點一下普攻，快速短撥翻滾。點神器紋章會自動瞄準，拖住紋章可以手動瞄準，放手施技。點「調查」可同場景互動。'
        :'WASD 移動，J 普通攻擊，空白鍵翻滾，Q 放神器技能，E 調查。',
      content:pauseContent,
      buttons});
  }

  fusionMenu() {
    if (!this.fusions.length) return null;
    const panel=document.createElement('div');
    panel.className='fusion-menu';
    const title=document.createElement('b'), detail=document.createElement('p');
    title.textContent=textForLocale('接技合招');
    detail.className='fusion-summary';
    const paint=()=>{
      const pinned=this.fusions.some(fusion=>fusion.id===this.fusionPin)?this.fusionPin:'auto';
      for (const option of panel.querySelectorAll('button')) option.setAttribute('aria-pressed',String(option.dataset.fusionChoice===pinned));
      detail.textContent=textForLocale('目前：'+this.fusion.name+(this.fusion.ultimate?' · 終極':' '+this.fusion.rank+'階')+'｜'+this.fusion.detail);
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
      clue.textContent=textForLocale('隱藏合招 · 三個指定流派各達 '+ultimateRank+' 階：'+this.ultimateClue(secret));
      panel.append(clue);
    }
    for(const seal of seals)if(this.hero.seals.has(seal.id)){
      const entry=document.createElement('p');entry.className='fusion-secret';entry.style.color=seal.ink;
      entry.textContent=textForLocale('秘印 · '+seal.name+'｜'+seal.detail);
      panel.append(entry);
    }
    paint();
    return panel;
  }

  offerRevive(){
    if(this.reviveOffered||this.testRun||this.practiceRun||this.duelMonster||this.storyRun||!this.rewardedRevive.available){
      this.finish(false);
      return;
    }
    this.reviveOffered=true;
    this.state='revive-offer';
    const hero=this.hero;
    let restoreSound=false;
    this.rewardedRevive.offer({
      prompt:(watch,decline)=>{
        if(this.state!=='revive-offer'||this.hero!==hero){decline();return;}
        const accept=makeButton('睇 1 個廣告復活',()=>{
          accept.disabled=leave.disabled=true;
          watch();
        },'primary');
        const leave=makeButton('結束本局',decline);
        this.openModal({kind:'revive-offer',mark:'✦',kicker:'第 '+this.stage.floor+' 關',title:'再點一盞燈',
          copy:'睇完 1 個廣告可原地復活，回復一半生命。本局只可用一次，遠征排行以倒地前嘅成績為準。',
          buttons:[accept,leave],focus:leave});
      },
      playing:()=>{
        restoreSound=!this.audio.muted;
        if(restoreSound)this.audio.toggle();
      },
      complete:reward=>{
        if(restoreSound&&this.audio.muted)this.audio.toggle();
        if(this.state!=='revive-offer'||this.hero!==hero)return;
        this.closeModal();
        if(!reward){this.finish(false);return;}
        this.recordChallenge('failed');
        hero.hp=Math.ceil(hero.maxHp*.5);
        hero.invulnerable=2.4;
        hero.reaction=null;
        hero.snared=hero.vx=hero.vz=0;
        this.damageFlash=this.hitstop=0;
        this.state='play';
        this.audio.active=true;
        this.view.shock(hero.x,hero.z,0x9cffda,2.3,.83);
        this.view.elementBurst(hero.x,.36,hero.z,0x9bffd2,'light',19,1.16);
        this.audio.play('branch-revive');
        this.announce('守燈貓','燈火重燃','已回復一半生命 · 本局廣告復活已用',2.1);
        this.view.canvas.focus({preventScroll:true});
      },
    });
  }

  finish(won,reason) {
    if (['cover','fracture','gm','won'].includes(this.state)) return;
    if(this.practiceRun){this.finishPractice(won);return;}
    this.recordChallenge(won?'completed':'failed');
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
    const unlocked=!this.testRun&&!this.storyRun&&this.progress.win(this.difficulty.id,Math.round(this.elapsed*1000));
    const finale=endingFor(this.branchCombat.branch,this.branchCombat.skills);
    this.audio.play('blessing');
    const payoff=openingPayoff(this.storyChoices);
    const scene={...finale,intro:payoff?[...finale.intro.slice(0,-1),payoff,...finale.intro.slice(-1)]:finale.intro};
    const route=this.storyRun==='chapter'?local('第二章試煉','第二章试炼','Chapter II Trial','第2章の試練'):finale.route;
    this.openDialogue(finale.title,route,scene,'查看通關結果',()=>{
      this.openModal({kind:'win',mark:'✷',kicker:this.difficulty.name+' · 第 100 關 · '+route,title:finale.title,
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
      item.textContent=textForLocale(line);
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
      text:'螢幕前嗰位，我見到你。'+event+'我只夠把守燈貓帶返入口。破印金幣、訓練同紀錄存喺圈外，下一輪可以再嚟。'}]};
    this.openDialogue('GM 司刻',this.difficulty.name+' · 第 '+this.stage.floor+' 關',scene,
      '立即返回入口',()=>this.showCover(),this.runResults());
  }

  showCover() {
    this.recordChallenge('abandoned');
    this.state='cover';
    this.clearReversal();
    this.cancelRoomPreparation();
    this.clearStageEncounter();
    if(this.testRun){
      this.clearThreats();
      this.clearActors();
      this.view.setBossArena(null);
      this.bossArena=null;
      if(this.heroVisual){
        this.view.removeEquippedActor(this.heroVisual);
        this.heroVisual=null;
      }
    }
    else if(this.practiceRun){this.clearThreats();this.clearActors();this.view.setBossArena(null);this.bossArena=null;}
    this.practiceRun=null;
    this.testRun=false;
    this.storyRun=null;
    this.titleTaps.length=0;
    this.ui.hud.removeAttribute('data-ascendant');
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

  recordChallenge(status='active',floor){
    if(!this.challengeRunId||this.testRun||this.practiceRun||!this.hero)return;
    const id=this.challengeRunId;
    this.players.checkpoint(id,{floor,elapsed_ms:Math.round(this.elapsed*1000),kills:this.kills,
      weapon_id:this.weapon?.id,branch:this.branchCombat.branch?.id??null,status});
    if(status!=='active'){
      traffic?.finishRun();
      this.challengeRunId=null;
    }
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
  const duration=kind==='combo'?2.65:weapon.awakening?5.4:Math.max(2.75,(weapon.spell?.hits??1)*(weapon.spell?.interval??0)+1.35);
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
      updateAwakenings(practice,dt);
      for(const unit of practice.enemies)updateTurnedEnemy(practice,unit,dt);
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
      clearAwakenings(practice);
      view.removeEquippedActor(practice.heroVisual);
      for(const unit of practice.enemies)view.removeActor(unit.visual);
    },
  };
}

function moonPincerExercise(practice,warden,position,controls,steer,paint,dispose,signal,settings){
  const {hero,view,weapon,audio,bossArena:arena}=practice;
  const roster=wardenReinforcementSpecs(practice.stage.difficulty);
  const finisher=comboMove(weapon,3);
  const timing=comboTiming(weapon,finisher,weapon.period);
  let echo,goal,slash,charge,elapsed,rolled,interrupted,tookHit,status='ready',wind=0,settle=0;
  const show=(state,message)=>{
    status=state;
    signal.exercise(state,message);
  };
  const reset=({floor,mode})=>{
    practice.clearThreats();
    view.wardenGround?.reset();
    view.spellLighting.reset();
    if(echo?.spec.sourceFloor!==floor){
      if(echo)view.removeActor(echo.visual);
      practice.enemies=[warden];
      const spec=roster.find(entry=>entry.sourceFloor===floor);
      practice.wardenSummonDeck=[spec];
      echo=resolveWardenSummon(practice,warden,{wardenPortal:{x:5.45,z:4.35}});
    }
    echo.age=1;
    echo.motion=echo.reaction=null;
    warden.motion=warden.reaction=null;
    Object.assign(hero,makeHero(),position,{moveSpeed:6.9,damage:25,face:1,reach:weapon.reach,finisher:1.5});
    controls.keys.clear();
    Object.assign(controls,{point:null,roll:false,rollVector:null,heavy:false});
    goal=mode;
    elapsed=wind=settle=0;
    slash=charge=null;
    rolled=interrupted=tookHit=false;
    show('ready',goal==='roll'?'睇準薄荷色箭嘴，向箭嘴方向翻滾。':'見到殘影腳下金圈，行近再重擊。');
    paint(0);
  };
  practice.hurt=(amount,x,z)=>{
    if(hero.invulnerable>0)return false;
    tookHit=true;
    recoil(hero,{x,z},'heavy');
    hero.invulnerable=.28;
    view.impact(hero,{x,z},'heavy',warden.spec.tint,practice.heroVisual);
    return true;
  };
  practice.hit=(target,amount,origin,knock,tint,weight)=>{
    if(target!==echo||weight!=='heavy')return false;
    const charging=echo.attack===slash?.assist?.attack;
    if(charging)interrupted=true;
    practice.impact(echo,origin,charging?'break':'heavy',tint);
    return true;
  };
  const release=()=>{
    const gap=Math.max(.02,distance(echo,hero));
    hero.dx=(echo.x-hero.x)/gap;
    hero.dz=(echo.z-hero.z)/gap;
    if(Math.abs(hero.dx)>.12)hero.face=Math.sign(hero.dx);
    hero.combo=3;
    hero.attackAge=0;
    heroAction(hero,'strike',finisher,timing);
    audio.attack(weapon.id,3,'wind');
    wind=timing.hits[0].at;
  };
  reset(settings);
  return {
    controls,hero,configure:reset,dispose,
    start(){
      reset({floor:echo.spec.sourceFloor,mode:goal});
      show('active','準備 · 留意地面預警');
    },
    step(dt){
      practice.t+=dt;
      if(status==='ready'){paint(dt);return false;}
      if(status!=='active'&&status!=='charging'&&status!=='interrupted'){
        settle+=dt;
        for(const unit of practice.enemies)if(unit.motion)unit.motion.age+=dt;
        paint(dt);
        return settle<.5;
      }
      if(!slash){
        elapsed+=dt;
        if(elapsed>=.42){
          queueMoonSlash(practice,warden);
          slash=practice.hazards.find(mark=>mark.moonSlash);
          if(!slash?.assist){
            practice.clearThreats();
            show('failure','今次未形成合圍，請重試。');
            return true;
          }
          charge=slash.assist;
          show('charging',goal==='roll'?'沿薄荷色箭嘴翻滾，避開兩邊攻擊。':'殘影蓄力中 · 向金圈行近再重擊');
        }
      }else{
        hero.invulnerable-=dt;
        hero.attackAge+=dt;
        const previousRoll=hero.rolling;
        steer(dt);
        if(hero.rolling>0&&previousRoll<=0)rolled=true;
        if(controls.heavy&&!wind&&hero.rolling<=0&&goal==='break'&&!interrupted)release();
        if(wind>0){
          wind-=dt;
          if(wind<=0){
            wind=0;
            audio.attack(weapon.id,3,'release',0);
            strikeWith(practice,hero.dx,hero.dz,finisher);
            if(interrupted)show('interrupted','蓄力已打斷 · 斷冠仍會出斬，快避開紅線。');
          }
        }
        advanceThreats(practice,dt);
        if(slash.delay<=0){
          practice.clearThreats();
          const clear=![slash,...charge.zones,...arena.hazards].some(mark=>withinThreat(hero,mark));
          if(goal==='break'){
            show(interrupted?'success':'failure',interrupted?'成功 · 已打斷殘影蓄力':'失手 · 要喺冰藍預警消失之前重擊命中');
          }else{
            const success=rolled&&!tookHit&&clear;
            show(success?'success':'failure',success?'成功 · 已翻滾避開合擊':rolled?'失手 · 試下沿箭嘴翻滾，離開預警範圍':'未完成 · 見到箭嘴後撳「翻滾」');
          }
        }
      }
      controls.heavy=false;
      paint(dt);
      return true;
    },
  };
}

function makeBossPractice(view,dossier,action,signal,sound) {
  const {spec,stage:source,layout,weakness}=dossier;
  const practice=Object.create(Game.prototype);
  const drill=action.drill;
  const pincer=action.pattern===moonPincerPreview;
  const moonSlash=action.pattern===moonSlashPattern||pincer;
  const summon=action.pattern===wardenSummonPattern;
  const arenaPreview=action.phase||moonSlash||summon;
  const stage=arenaPreview?source:{...source,props:[]};
  const demonstration=action.motion;
  const pao=['m025','m026'].includes(spec.bestiary?.id);
  const position=pincer?{x:1.25,z:4.65}:arenaPreview?source.spawn:pao?{x:1.4,z:3.05}:{x:2.95,z:.82};
  const hero=Object.assign(makeHero(),position,{moveSpeed:6.9,damage:25,face:-1});
  const controls={keys:new Set(),point:null,roll:false,rollVector:null,interact:false,heavy:false};
  const weapon=arms.find(arm=>arm.id==='tiger');
  const audible=pao||spec.finalWarden;
  const audio=audible?sound:{play(){},release(){},boss(){},impact(){}};
  if(audible)audio.start().catch(()=>{});
  Object.assign(practice,{view,stage,hero,weapon,t:0,state:'play',hazards:[],enemies:[],relicWalls:[],ultimateFields:[],wave:0,
    hitstop:0,branchCombat:{skills:new Set()},audio,
    announce(){},setupMissionPins(){},objective(){}});
  const unit=practice.spawn('boss',arenaPreview?0:pao?-2.1:-2.4,arenaPreview?-3.2:pao?-1.65:-.46,null,spec);
  unit.age=3;
  unit.face=1;
  if(action.form){
    unit.bossPhase=action.form;
    unit.hp=spec.hp*spec.phases[action.form-1];
  }
  if(demonstration&&unit.visual.bestiary)unit.visual.bestiary.heading=.55;
  if(arenaPreview){
    practice.bossArena=new BossArena(practice,layout,unit,action.seed,drill?drillEncounter(dossier):null);
    view.setBossArena(practice.bossArena);
    if(moonSlash||summon){
      practice.bossArena.transform(2);
      practice.bossArena.shift=2;
      if(pincer&&!action.pincerDrill){
        for(const [x,z] of [[-6.5,4],[6.4,4.5],[-5.6,-1.2],[5.8,-.8]]){
          resolveWardenSummon(practice,unit,{wardenPortal:{x,z}});
        }
        for(const echo of practice.enemies)if(echo.summoner)echo.age=1;
      }
    }else if(action.phase>1){
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
    view.impact({...hero,spec:{height:2.36}},{x,z},weight,spec.tint,practice.heroVisual);
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
      if(controls.rollVector){
        ({x:h.dx,z:h.dz}=controls.rollVector);
        if(Math.abs(h.dx)>.14)h.face=Math.sign(h.dx);
      }
      h.rolling=h.rollDuration;
      h.rollCool=.67;
      h.invulnerable=.34;
      if(action.pincerDrill)audio.play('roll');
      view.spark(h.x,.20,h.z,0xe5b17b,11,.64);
    }
    controls.roll=false;
    controls.rollVector=null;
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
    if(demonstration)advanceReaction(unit,dt);
    practice.poseHero(dt);
    for(const actor of practice.enemies){
      if(action.pincerDrill)advanceReaction(actor,dt);
      practice.poseEnemy(actor,dt);
    }
  };
  const dispose=()=>{
    if(arena)view.setBossArena(null);
    for(const hazard of practice.hazards)if(hazard.visual)view.removeProjectile(hazard.visual);
    for(const actor of practice.enemies)view.removeActor(actor.visual);
    view.removeActor(practice.heroVisual);
  };
  if(action.pincerDrill){
    view.equip(practice.heroVisual,weapon);
    return moonPincerExercise(practice,unit,position,controls,steer,paint,dispose,signal,action.pincerDrill);
  }
  paint(0);
  let fired=!!action.portrait;
  let replayed=false;
  const hold=action.phase ? .85 : .20;
  const lastSlash=moonSlash||action.phase===2&&spec.lastFinishing===moonSlashPattern;
  const duration=demonstration?3.05:hold+(lastSlash?moonSlashDuration+1.45:spec.time+2.75)
    +(spec.phaseTransition?.[action.phase-1]??0)+(pincer?moonSlashDuration+1.3:0);
  return {
    controls,
    hero,
    step(dt) {
      practice.t+=dt;
      hero.invulnerable-=dt;
      if(drill&&fired&&!done)steer(dt);
      if(!fired&&practice.t>=hold){
        fired=true;
        if(demonstration){
          if(demonstration==='entrance'){
            view.bossCue(unit,'entrance');
            audio.boss(spec.effect);
          }
          if(demonstration==='hit'){
            practice.impact(unit,hero,'heavy',spec.tint);
          }
          if(demonstration==='defeat'){
            recoil(unit,hero,'fall');
            view.bossCue(unit,'defeat');
            audio.impact('fall','armor');
          }
        }else if(action.phase){
          unit.hp=spec.hp*spec.phases[unit.bossPhase];
          practice.advanceBossPhase(unit);
          if(!unit.phaseChange)signal.phase(unit.bossPhase,arena.plan.title);
        }else{
          practice.beginEnemyAttack(unit,pincer?moonSlashPattern:action.pattern);
        }
      }
      if(pincer&&!replayed&&practice.t>=hold+moonSlashDuration+.85&&!unit.attack&&!practice.hazards.some(mark=>mark.moonSlash)){
        replayed=true;
        practice.beginEnemyAttack(unit,moonSlashPattern);
      }
      if(demonstration==='travel'&&fired&&practice.t<2.38){
        const speed=spec.bestiary?.id==='m026'?2.15:2.55;
        const t=practice.t-hold;
        practice.moveUnit(unit,dt*speed,Math.sin(t*2.8)*dt*.60,.35);
        unit.move=1;
      }else if(demonstration==='travel')unit.move*=Math.exp(-dt*10);
      if(drill&&fired&&!done&&!unit.phaseChange){
        const hasRift=riftDrill&&practice.hazards.some(hazard=>hazard.residue==='embers');
        exercise.attack=riftDrill&&!hasRift?'cinders':null;
        practice.updateEnemies(dt,exercise);
      }else if(unit.phaseChange){
        practice.tickBossTransform(unit,dt);
        if(!unit.phaseChange)signal.phase(unit.bossPhase,arena.plan.title);
      }else{
        unit.age+=dt;
        unit.phaseGuard-=dt;
        if(unit.attack&&!unit.attack.moonSlash)practice.stepEnemyAttack(unit,dt);
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
      if(summon||pincer)for(const copy of practice.enemies)if(copy.summoner){
        copy.age+=dt;
        if(copy.motion)copy.motion.age+=dt;
      }
      if(drill&&fired&&!done&&!unit.phaseChange){
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
    idle(dt){
      if(drill||demonstration==='defeat'||!unit.visual.bestiary?.weapons.length)return false;
      practice.t+=dt;
      if(unit.motion)unit.motion.age+=dt;
      paint(dt);
      return true;
    },
    dispose,
  };
}

export let game;
try {
  const world=new Scenery($('world'));
  await world.load();
  game=new Game(world,new Audio());
  $('load-note').textContent=textForLocale('正在載入戰鬥配樂⋯⋯');
  await game.soundtrack.ready;
  $('load-note').textContent='';
  $('begin').disabled=false;
  $('begin').setAttribute('aria-busy','false');
  $('training').disabled=false;
  $('records').disabled=false;
  $('bestiary').disabled=false;
  $('player-account').disabled=false;
  $('leaderboard').disabled=false;
  requestAnimationFrame(game.loop);
  const review=new URLSearchParams(location.search).get('review');
  const reviewBoss=review&&bossDossiers.find(entry=>entry.id===(review==='jade'?'m133':review));
  if(reviewBoss){
    game.setPracticeBoss(reviewBoss);
    game.openPracticeLoadout();
    game.previewPracticeBoss(reviewBoss);
  }
} catch (error) {
  $('begin').setAttribute('aria-busy','false');
  console.error('Could not initialize the Eclipse Grove',error);
  $('load-note').textContent=textForLocale('森林載入失敗。請重新整理，並確認瀏覽器已啟用 WebGL。');
}
