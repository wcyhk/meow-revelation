export const difficulties={
  vigil:{id:'vigil',name:'巡燈',mark:'◇',detail:'標準百關，越深越容易遇到異變精英。',hp:1,damage:1,pace:1,heal:1,depth:.0,eliteFrom:56,eliteEvery:4},
  blood:{id:'blood',name:'血月',mark:'♨',detail:'敵人更耐打、出招更快，通關回血減少。',hp:1.16,damage:1.17,pace:1.10,heal:.81,depth:.18,eliteFrom:12,eliteEvery:2},
  abyss:{id:'abyss',name:'無月',mark:'☾',detail:'敵傷大增、場地咒印更頻密；幾乎每個戰鬥房有精英。',hp:1.31,damage:1.34,pace:1.18,heal:.65,depth:.35,eliteFrom:4,eliteEvery:1},
};

export const afflictions=[
  {id:'husk',name:'黑甲',detail:'蓄招時護甲更厚；重擊可破盾。',tint:0xf5b995},
  {id:'echo',name:'雙咒',detail:'蓄招完再留一個追身咒印。',tint:0xbca0fb},
  {id:'grudge',name:'遺怨',detail:'倒下後會留下延時爆裂。',tint:0xff758d},
  {id:'hunt',name:'飢獵',detail:'移動更快，半血後進一步狂暴。',tint:0xf27c60},
];

export function modeStage(stage,mode) {
  return {...stage,difficulty:mode,dread:Math.min(1.35,stage.dread+mode.depth),
    pressure:stage.pressure*mode.hp,pace:stage.pace*mode.pace,damage:stage.damage*mode.damage};
}

export function eliteOmen(stage,wave,seed,hasGuards) {
  const mode=stage.difficulty??difficulties.vigil;
  if (!hasGuards||stage.floor<mode.eliteFrom) return null;
  if ((stage.floor+wave)%mode.eliteEvery!==0) return null;
  const roll=(Math.imul(seed>>>0,31)+stage.floor*151+wave*37)>>>0;
  return afflictions[(roll^(roll>>>9))>>>0&3];
}
