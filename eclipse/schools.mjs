import {schoolProgress,schools} from './blessings.mjs?v=battle-1';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const point=(unit,y)=>({x:unit.x,y,z:unit.z});

export function invokeSchool(game,school,attacker) {
  if (!game.learned.has(school) || game.t<(game.autoReady.get(school)??0) || game.state!=='play') return false;
  const {hero,view}=game;
  const targets=game.enemies.filter(enemy=>enemy.hp>0&&enemy.age>=.23);
  if (!targets.length && school!=='ward') return false;
  const level=schoolProgress(game.ranks,school).total;
  const power=(21+game.level*.61)*(1+Math.min(.8,(level-3)*.065));
  let target;
  let range=school==='thunder'?8.3:school==='fire'?7.4:5.6;
  for (const enemy of targets) {
    const gap=distance(hero,enemy);
    if (gap<range) {
      range=gap;
      target=enemy;
    }
  }
  if ((school==='thunder'||school==='fire')&&!target) return false;
  game.autoReady.set(school,game.t+schools[school].cooldown*Math.max(.69,1-(level-3)*.028));
  if (school==='wind') {
    const {x,z,dx,dz}=hero;
    const reach=5.3+Math.min(1.4,level*.13);
    for (const side of [-1,1]) view.wave(x-dz*side*.49,z+dx*side*.49,dx,dz,reach,0xbaf1ca);
    for (const enemy of targets) {
      const ex=enemy.x-x,ez=enemy.z-z;
      if (ex*dx+ez*dz>-.2&&ex*dx+ez*dz<reach&&Math.abs(-ex*dz+ez*dx)<1.79) {
        game.hit(enemy,power,hero,1.65);
      }
    }
  } else if (school==='thunder') {
    view.bolt(point(target,6),point(target,.65),0x93ceff,2.1);
    view.shock(target.x,target.z,0xa3e9ff,1.38,.65);
    game.hit(target,power*1.22,hero,.43);
    const next=targets.find(enemy=>enemy!==target&&distance(enemy,target)<3.7);
    if (next) {
      view.bolt(point(target,.83),point(next,.69),0xc5f3ff,1.25);
      game.hit(next,power*.68,target,.26);
    }
  } else if (school==='fire') {
    const center={x:target.x,z:target.z};
    game.schedule(.21,()=>{
      view.threatImpact({...center,kind:'circle',radius:2.6,tint:0xff9b5e,pattern:'marked',effect:'fire'});
      for (const enemy of game.enemies) if (distance(center,enemy)<2.8) game.hit(enemy,power*1.65,center,.89);
    });
  } else {
    hero.ward=Math.max(hero.ward,1.35);
    view.shock(hero.x,hero.z,0xa8f5de,3.2,.85);
    for (const enemy of targets) {
      if (enemy!==attacker&&distance(hero,enemy)>3.35) continue;
      enemy.chill=Math.max(enemy.chill,1.9);
      game.hit(enemy,power*.95,hero,1.3);
    }
  }
  game.audio.play(school==='thunder'?'warning':'blessing');
  return true;
}
