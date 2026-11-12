const thresholds=[1,3,6];

export const linkResonances={
  fire:{mark:'♨',name:'燼火',echoes:[0,1,2,3]},
  thunder:{mark:'ϟ',name:'奔雷',hops:[0,1,2,3],range:[0,3.54,3.75,3.96]},
  wind:{mark:'≋',name:'疾風',window:[0,.18,.32,.46],recovery:[0,.04,.07,.10],pursuit:[0,1,1,2]},
  ward:{mark:'❋',name:'霜守',guard:[0,.28,.38,.48],wardTime:[0,.55,.95,1.35]},
};

export function linkTier(total) {
  return total>=6?3:total>=3?2:total>=1?1:0;
}

export function linkLoadout(relics) {
  const totals={fire:0,thunder:0,wind:0,ward:0};
  for (const {school} of relics) if (Object.hasOwn(totals,school)) totals[school]++;
  return Object.fromEntries(Object.entries(totals).map(([school,total])=>[school,linkTier(total)]));
}

export function resonanceText(weapon,school,tier) {
  const effect=linkResonances[school];
  switch (school) {
    case 'fire': return weapon.id==='flameblade'?'火痕額外連爆 '+effect.echoes[tier]+' 次':'接技首擊額外引爆 '+effect.echoes[tier]+' 次';
    case 'thunder': return weapon.id==='stormbow'?'雷電多跳 '+effect.hops[tier]+' 個敵人':'接技首擊跳雷至 '+effect.hops[tier]+' 個敵人';
    case 'wind': {
      const delay=effect.window[tier].toFixed(2);
      return weapon.id==='qilin'?'破盾額外追刺 '+effect.pursuit[tier]+' 次；接招多 '+delay+' 秒':'接招多 '+delay+' 秒，出招後更快收勢';
    }
    case 'ward': return '接技後 2.8 秒內擋一擊，減傷 '+Math.round(effect.guard[tier]*100)+'%'+(weapon.id==='turtle'?'；冰甲更持久':'');
  }
}

export function resonancePreview(weapon,school,total) {
  const tier=linkTier(total), next=linkTier(total+1);
  const label=linkResonances[school].name+'共鳴 '+next+'階';
  const progress=next>tier||next===thresholds.length?'':' · '+(total+1)+'/'+thresholds[next];
  return {upgrade:next>tier,text:label+progress+'｜'+resonanceText(weapon,school,next)};
}

export function resonanceMarks(loadout) {
  return Object.entries(linkResonances).filter(([school])=>loadout[school]).map(([,effect])=>effect.mark).join('');
}
