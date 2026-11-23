import assert from 'node:assert/strict';
import {BossReversal,bossDamageScale} from '../eclipse/boss-reversal.mjs';
import {drawBossEncounter} from '../eclipse/arena-draw.mjs';
import {bossArenas} from '../eclipse/arena-layouts.mjs';
import {stages} from '../eclipse/expedition.mjs';

const noop=()=>{};
const makeGame=(stage,routeSeed)=>({
  t:0,state:'play',routeSeed,stage,hero:{...stage.spawn},
  view:{warning:noop,chargeBoss:noop,bolt:noop,shock:noop,spark:noop,feedback:{kick:noop}},
  audio:{play:noop},warnEnemyAttack:noop,
  hurt(){throw Error('The player should have moved away from the telegraph');},
  hit(unit,amount,origin,knock,tint,weight,report,source){
    assert.equal(source,'counter');unit.hp-=amount;
  },
  isBlocked(point,margin){
    return stage.props.some(prop=>Math.hypot(point.x-prop.x,point.z-prop.z)<prop.radius+margin)
      ||this.roomReversal?.blocks(point,margin);
  },
});
const boss=(x,z)=>({kind:'boss',hp:100,bossPhase:0,phaseGuard:0,x,z,recover:0,exposed:0,
  spec:{hp:100,hurt:21,height:2}});

for(const stage of stages){
  for(const seed of [19,238,11729]){
    const game=makeGame(stage,seed);
    if(stage.boss)game.bossArena={encounter:drawBossEncounter(stage,bossArenas.get(stage.floor),seed)};
    const reversal=game.roomReversal=new BossReversal(game);
    assert.deepEqual(reversal.sites.map(site=>site.kind),['mirror','pillar'],
      'floor '+stage.floor+' seed '+seed+' should have both reusable devices');
  }
}

const game=makeGame({floor:5,props:[],spawn:{x:0,z:7}},8);
const encounter=game.roomReversal=new BossReversal(game);
const [mirror,pillar]=encounter.sites;
const primary=boss(pillar.x+5,pillar.z);
game.hero={x:pillar.x-1.28,z:pillar.z};
assert.equal(encounter.tryLure(primary),true);
assert.equal(primary.attack.pattern,'counterCharge');
game.hero.z+=2.7;
const collision=primary.attack;
primary.attack=null;
encounter.release(primary,collision);
for(let i=0;i<90&&encounter.dash;i++)encounter.tick(.04);
assert.equal(primary.hp,65);
assert.ok(primary.recover>0);
assert.ok(primary.stun>1.5);
assert.equal(encounter.tryLure(primary),false,'the next attack waits for the device to recharge');

const shadow=boss(mirror.x+5,mirror.z);
game.t=5;
game.hero={x:mirror.x,z:mirror.z};
assert.equal(encounter.tryLure(shadow),true);
const reflection=shadow.attack;
game.hero.z+=2.6;
shadow.attack=null;
encounter.release(shadow,reflection);
assert.equal(shadow.hp,65);
assert.equal(primary.hp,65,'an echo can be countered directly without damaging the main boss');

const seals=[{x:0,z:0,hp:5},{x:1,z:5,hp:5},{x:-2,z:3,hp:5}];
game.bossArena={boss:primary,plan:{mode:'break'},locked:true,points:seals,
  hit(seal,amount){seal.hp-=amount;if(!seal.hp)seal.done=true;this.locked=seals.some(point=>!point.done);}};
encounter.impact(primary,mirror);
assert.equal(primary.hp,65);
assert.equal(seals.filter(seal=>seal.done).length,1);
encounter.impact(primary,mirror);
encounter.impact(primary,mirror);
assert.equal(game.bossArena.locked,false);
assert.equal(primary.hp,30);
encounter.impact(primary,mirror);
assert.ok(primary.hp<=0,'repeatable counter damage can deal the finishing blow');

assert.equal(bossDamageScale(boss(0,0),'basic'),.48);
assert.equal(bossDamageScale({...boss(0,0),exposed:2},'skill'),.92);
assert.equal(bossDamageScale(boss(0,0),'counter'),1);
assert.equal(bossDamageScale(boss(0,0),'skill',true),1);
assert.equal(bossDamageScale({kind:'imp'},'basic'),1);
console.log('Both devices on 300 layouts, pillar charge, mirror reflection, echo targeting, shields, finishing blows and damage scaling passed.');
