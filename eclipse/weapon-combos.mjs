function strike(name,pose,wind,cycle,shape,options={}) {
  return {name,pose,wind,cycle,shape,reach:1,width:.70,force:.83,step:.12,...options};
}

const combos={
  tiger:[
    strike('掠風','rake',.046,.185,'arc',{width:1.04,step:.21,force:.72}),
    strike('回爪','return',.058,.207,'arc',{width:1.32,step:.24,force:.91}),
    strike('白虎旋斬','spin',.135,.342,'circle',{reach:1.13,step:.24,force:1.82}),
  ],
  dragon:[
    strike('引雷','spark',.082,.310,'chain',{width:1.06,step:0,force:.28}),
    strike('走雷','relay',.121,.385,'chain',{width:1.09,step:0,force:.38,hops:2}),
    strike('青龍震雷','thunder',.235,.492,'chain',{width:1.16,step:0,force:1.35,hops:2,burst:1.38}),
  ],
  phoenix:[
    strike('啄焰','peck',.071,.281,'wave',{width:.72,step:.08,force:.50}),
    strike('翼焰','wings',.119,.349,'wave',{width:1.11,step:.13,force:.75}),
    strike('赤翼鳳鳴','phoenix',.212,.489,'fan',{width:.97,step:.16,force:1.54}),
  ],
  turtle:[
    strike('寒棘挑','lift',.101,.295,'arc',{width:.93,force:.82,chill:1.45}),
    strike('甲背回掃','brace',.136,.369,'arc',{width:1.29,force:1.06,chill:1.75}),
    strike('玄甲鎮地','shell',.253,.549,'circle',{reach:1.10,step:0,force:1.65,chill:2.70}),
  ],
  qilin:[
    strike('探角刺','jab',.064,.240,'line',{width:.57,step:.18,force:.74}),
    strike('連角刺','double',.076,.348,'line',{width:.61,step:.12,force:.45,
      pulses:[{after:0,power:.60},{after:.108,power:.57}]}),
    strike('破陣重突','lunge',.225,.526,'line',{reach:1.14,width:.81,step:.49,force:2.65}),
  ],
  flameblade:[
    strike('點火挑斬','ember',.089,.278,'arc',{width:1.02,step:.16,force:.82}),
    strike('回焰橫劍','backfire',.124,.359,'arc',{width:1.36,step:.18,force:1.01}),
    strike('赤炎墜劈','overhead',.301,.597,'cleave',{reach:1.12,width:.88,step:.29,force:2.05,burst:1.42}),
  ],
  stormbow:[
    strike('瞬弦箭','draw',.111,.322,'arrow',{width:.49,step:0,force:.48}),
    strike('掣雷二矢','splitdraw',.156,.404,'arrow',{width:.50,step:0,force:.56,angles:[-.105,.105]}),
    strike('滿弦雷矢','fulldraw',.362,.620,'arrow',{reach:1.17,width:.63,step:0,force:1.44}),
  ],
  windhalberd:[
    strike('挑風','spear',.079,.284,'line',{width:.72,step:.18,force:.81}),
    strike('回戟勾','hook',.126,.372,'arc',{width:1.25,step:.07,force:-1.06}),
    strike('橫斷風環','whirl',.209,.491,'circle',{reach:1.15,step:.15,force:2.52}),
  ],
  frostlute:[
    strike('勾弦','pluck',.094,.295,'wave',{width:.73,step:0,force:.48,chill:1.55}),
    strike('回音二疊','chord',.128,.426,'wave',{width:.93,step:0,force:.37,chill:1.75,
      pulses:[{after:0,power:.63},{after:.115,power:.51}]}),
    strike('凜弦落霜','frost',.250,.558,'wave',{reach:1.12,width:1.32,step:0,force:1.18,chill:2.95}),
  ],
  chakra:[
    strike('擲輪','toss',.084,.303,'disk',{width:.70,step:.04,force:.42}),
    strike('側掠回輪','bank',.124,.372,'disk',{width:.88,step:.07,force:.56,curve:.66}),
    strike('滿月裂輪','moon',.222,.518,'disk',{reach:1.13,width:1.18,step:.10,force:1.59,curve:.83}),
  ],
};

export function comboMove(weapon,step) {
  return combos[weapon.id][Math.max(1,step)-1];
}

export function comboNames(weapon) {
  return combos[weapon.id].map(move=>move.name);
}

export function comboTiming(weapon,move,attackPeriod) {
  const speed=attackPeriod/weapon.period;
  const hits=move.pulses??[{after:0,power:1}];
  return {
    cycle:move.cycle*speed,
    hits:hits.map(pulse=>({at:(move.wind+pulse.after)*speed,power:pulse.power})),
  };
}
