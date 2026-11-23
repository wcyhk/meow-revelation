import {insideArena, onArenaHazard} from './arena-draw.mjs?v=shifting-2';

export const reversalRadius = 1.72;
const radius = reversalRadius;
const impact = .35;
const stone = 0xa3ffcf;
const mirror = 0x84d9ff;
const gap = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const along = (start,dx,dz,length) => ({x:start.x+dx*length,z:start.z+dz*length});

export function bossDamageScale(unit,source,testMode=false) {
  if (unit.kind!=='boss'||testMode||source==='counter') return 1;
  return unit.exposed>0?.92:.48;
}

function placements(game) {
  const plans = [game.bossArena?.encounter.first,game.bossArena?.encounter.last].filter(Boolean);
  const hazards = plans.flatMap(plan=>plan.hazards??[]);
  const fixtures = plans.flatMap(plan=>[...(plan.sites??[]),...(plan.pillars??[])]);
  const side = ((game.routeSeed??0)+game.stage.floor)%2 ? 1 : -1;
  const depth = ((game.routeSeed??0)>>>2)%3;
  const spots = [];
  for (const z of [3+depth,6+depth,1,-1.6,8.3]) {
    for (const x of [3.7,-3.7,6.1,-6.1,8.35,-8.35]) spots.push({x:x*side,z});
  }
  const used = [];
  for (const kind of ['mirror','pillar']) {
    const width = kind==='pillar'?.73:0;
    const candidates = spots.filter(point=>insideArena(point,radius+.08)
      && !game.isBlocked(point,width+.56)
      && gap(point,game.hero)>radius+.28
      && used.every(site=>gap(site,point)>radius*2));
    const safe = candidates.find(point=>fixtures.every(item=>gap(item,point)>(item.radius??.63)+radius)
      && hazards.every(zone=>!onArenaHazard(point,zone,.44)));
    const site = safe??candidates[0];
    if (site) used.push({...site,kind,radius:width,ink:kind==='pillar'?stone:mirror});
  }
  return used;
}

function targetLine(point,start,dx,dz,length,width) {
  const x=point.x-start.x,z=point.z-start.z;
  const projection=x*dx+z*dz;
  return projection>=-.28&&projection<=length+.34&&Math.abs(x*dz-z*dx)<width;
}

export class BossReversal {
  constructor(game) {
    this.game = game;
    this.sites = placements(game);
    this.readyAt = 0;
  }

  blocks(unit,margin,previous) {
    return this.sites.some(site=>site.kind==='pillar'&&gap(unit,site)<site.radius+margin
      &&(!previous||gap(unit,site)<=gap(previous,site)));
  }

  get cue() {
    if(this.windup||this.dash)return '頭目鎖定機關 · 離開紅線';
    if(this.game.t<this.readyAt)return '場地機關重新蓄力';
    const arena=this.game.bossArena;
    if(arena?.locked&&arena.plan.mode==='break')return '用石柱或銅鏡引頭目擊碎封印';
    return '踏入光環，借石柱或銅鏡反制頭目';
  }

  nearby() {
    return this.sites.find(point=>gap(point,this.game.hero)<radius);
  }

  tryLure(unit) {
    const {game}=this;
    if (this.windup||this.dash||game.t<this.readyAt||unit.phaseGuard>0||unit.phaseChange) return false;
    const site = this.nearby();
    if (!site) return false;
    const length=gap(site,unit);
    if(length<1.85||length>18)return false;
    const dx=(site.x-unit.x)/length,dz=(site.z-unit.z)/length;
    const start={x:unit.x,z:unit.z};
    const contact=site.kind==='pillar' ? length-site.radius-.32 : length;
    const reach=length+(site.kind==='mirror'?.78:1.14);
    if(!targetLine(game.hero,start,dx,dz,reach,.67))return false;
    if(site.kind==='pillar'){
      if(!targetLine(game.hero,site,dx,dz,1.78,.67))return false;
      for(let distance=.65;distance<contact-.30;distance+=.65){
        if(game.isBlocked(along(start,dx,dz,distance),.24))return false;
      }
    }
    const time=site.kind==='pillar'?1.37:1.48;
    const attack={reversal:true,pattern:site.kind==='pillar'?'counterCharge':'lance',time,windup:time,
      dx,dz,start,site,contact,reach,phase:unit.bossPhase};
    unit.attack=attack;
    unit.kx=unit.kz=0;
    if(Math.abs(dx)>.10)unit.face=Math.sign(dx);
    this.windup={unit,attack};
    this.readyAt=game.t+2.95;
    const center=along(start,dx,dz,reach*.5);
    game.view.warning('line',center.x,center.z,reach,time,-Math.atan2(dz,dx),.70,0xff715c,
      ()=>unit.hp>0&&unit.attack===attack&&this.windup?.attack===attack);
    game.view.chargeBoss(unit);
    game.warnEnemyAttack(unit);
    return true;
  }

  release(unit,attack) {
    this.windup=null;
    if(unit.hp<=0||unit.phaseGuard>0||unit.bossPhase!==attack.phase)return;
    unit.motion={pattern:attack.pattern,dx:attack.dx,dz:attack.dz,age:0};
    if(attack.site.kind==='pillar'){
      this.dash={unit,attack,travel:0};
      return;
    }
    const {game}=this;
    const {site,start,dx,dz,reach}=attack;
    game.view.bolt({...start,y:1.42},{...site,y:.95},site.ink,1.85);
    if(targetLine(game.hero,start,dx,dz,reach,.73))game.hurt(unit.spec.hurt*.75,start.x,start.z,unit,'lance');
    if(game.state==='play')this.impact(unit,site);
  }

  tick(dt) {
    if(this.windup){
      const {unit,attack}=this.windup;
      if(unit.attack!==attack||unit.hp<=0||unit.bossPhase!==attack.phase||unit.phaseChange){
        if(unit.attack===attack)unit.attack=null;
        this.windup=null;
      }
    }
    if(!this.dash)return;
    const {game}=this;
    const dash=this.dash;
    const {unit,attack}=dash;
    if(unit.hp<=0||unit.phaseGuard>0||unit.bossPhase!==attack.phase||unit.phaseChange){
      this.dash=null;return;
    }
    const {site,start,dx,dz,contact}=attack;
    const from=along(start,dx,dz,dash.travel);
    const next=Math.min(contact,dash.travel+25*dt);
    const position=along(start,dx,dz,next);
    if(!dash.hitHero&&targetLine(game.hero,from,dx,dz,next-dash.travel,.77)){
      dash.hitHero=game.hurt(unit.spec.hurt*.85,from.x,from.z,unit,'counterCharge');
    }
    unit.x=position.x;unit.z=position.z;unit.move=1;
    dash.travel=next;
    if(next<contact)return;
    this.dash=null;
    if(game.state==='play')this.impact(unit,site);
  }

  impact(unit,site) {
    const {game}=this;
    const arena=game.bossArena?.boss===unit ? game.bossArena : null;
    if(arena?.locked&&arena.plan.mode==='break'){
      const seals=arena.points.filter(point=>!point.done);
      const seal=seals.reduce((nearest,point)=>!nearest||gap(point,site)<gap(nearest,site)?point:nearest,null);
      if(seal){
        game.view.bolt({...site,y:.95},{...seal,y:.75},site.ink,2.0);
        arena.hit(seal,seal.hp);
      }
    }
    unit.attack=null;
    unit.motion=null;
    unit.move=0;
    unit.kx=unit.kz=0;
    unit.recover=Math.max(unit.recover,1.8);
    const phase=unit.bossPhase;
    game.view.shock(site.x,site.z,site.ink,2.7,1.05);
    game.view.spark(unit.x,unit.spec.height*.42,unit.z,site.ink,game.view.mobile?14:23,1.1,'stone');
    game.view.feedback.kick(.19,.25);
    game.audio.play('heavy');
    if(!arena?.locked)game.hit(unit,unit.spec.hp*impact,site,0,site.ink,'heavy',undefined,'counter');
    if(unit.hp>0&&unit.bossPhase===phase){
      unit.stun=Math.max(unit.stun??0,1.72);
      unit.exposed=Math.max(unit.exposed,2.35);
    }
  }
}
