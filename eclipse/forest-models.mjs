// Silhouettes and palettes for the original enemies in the campaign.
// Columns are model, finish, signature detail, body proportions, and palette.
const creatures={
  imp:['ogre','stone','masonry',[.91,.82,1],[0x332b29,0x74604d,0xbc9a70,0xffa45d]],
  cultist:['priest','cloth','lantern',[.78,1.08,.83],[0x39202b,0x785449,0xe3b87d,0xffac46]],
  knight:['duelist','iron','bramble',[1.10,1.01,.93],[0x382a25,0x6e5541,0xc4a87a,0xebbc73]],
  stalker:['beast','hide','claws',[.93,.87,1.28],[0x442b37,0x774454,0xd5987f,0xff6564]],
  wisp:['shade','cloth','veils',[.72,1.09,.65],[0x1b4244,0x458785,0xb5dfca,0x94fff0]],
  sentinel:['duelist','iron','greatblade',[.95,1.04,.86],[0x2b354a,0x4a657a,0xb6dafa,0x80d7ff]],
  oracle:['priest','cloth','orb',[.80,1.07,.83],[0x2a1e41,0x613f71,0xb58ec6,0xe5a4ff]],
  scarab:['beast','stone','scarab',[1.08,.76,1.26],[0x263e55,0x4e7ba0,0xc6eaff,0x8bebff]],
  salamander:['beast','stone','salamander',[.85,.80,1.55],[0x3a2525,0x6f4140,0xb6754b,0xff7e3d]],
  weaver:['spider','bone','silk',[.86,.88,.92],[0x2e2739,0x755769,0xe0c8b9,0xfaacd9]],
  drummer:['ogre','wood','drum',[1.05,.92,1],[0x433024,0x99644a,0xd2b075,0xffd881]],
  crane:['bird','cloth','paper',[.90,1.05,.93],[0x62444c,0xc8a88c,0xfaf0c9,0xf7a597]],
  spriggan:['ogre','wood','roots',[.88,.87,1.02],[0x263431,0x587141,0xa2b778,0x7cffac]],
  coin:['captain','bronze','coin',[.96,1.04,1],[0x3d3024,0x725739,0xd5a469,0xffd38b]],
  kite:['bird','cloth','moth',[1.02,1.10,1],[0x241f39,0x504363,0x946baf,0xdfa0ff]],
  veil:['shade','cloth','veils',[.80,1.08,.94],[0x301f34,0x63506c,0xd1a7d1,0xe9ade7]],
  coffin:['ogre','wood','coffin',[1.07,1.10,1.16],[0x31252d,0x6e5349,0xb98863,0xffae7d]],
  wax:['ogre','bone','wax',[.68,.81,.83],[0x4c332b,0x8b5941,0xe8bb82,0xff8a48]],
  toller:['priest','bronze','bell',[.90,1.11,.98],[0x27383b,0x5a7469,0xa6b894,0x91f5df]],
  eyes:['eggs','hide','eyes',[.96,1.08,.97],[0x362537,0x7b4557,0xbb816b,0xff767c]],
  hound:['beast','bone','bones',[.85,.90,1.20],[0x42303c,0x806451,0xd3b998,0xff7773]],
};

const guardians=[
  ['bird','hide','owl',[1.18,1.10,1],[0x382e31,0x8d4c3b,0xd9a36b,0xff9457]],
  ['priest','cloth','lotus',[1.01,1.14,1.01],[0x344342,0x577d71,0xced8bb,0x81f5dd]],
  ['priest','cloth','fox',[.90,1.07,1],[0x35364f,0x80778e,0xe5dce6,0xafdfff]],
  ['ogre','iron','boar',[1.29,.95,1.13],[0x462526,0x87443b,0xc78058,0xff7c31]],
  ['spider','bone','silk',[1.03,.97,1.03],[0x34263c,0x695675,0xd6c2d4,0xf0abff]],
  ['turtle','bronze','coin',[1.22,.84,1.15],[0x3e2b25,0x927047,0xd6ab65,0xffd586]],
  ['serpent','stone','eclipse',[.94,1.12,1.20],[0x493434,0x846048,0xc89a64,0xff9d5c]],
  ['beast','wood','antler',[.94,1.12,1.14],[0x284241,0x54785f,0xb8d09b,0xa0ffb3]],
  ['bird','cloth','moth',[1.24,1.03,1.07],[0x2b2546,0x5b4979,0xc6a8d4,0xe0aaff]],
  ['emperor','iron','crown',[1.16,1.08,1],[0x372733,0x824951,0xd49b79,0xff6a59]],
  ['ogre','bronze','goat',[1.17,1.05,1],[0x443023,0x85734a,0xdbc388,0xffd082]],
  ['serpent','bone','oar',[1.02,1.01,1.16],[0x264440,0x5c8076,0xd5e1ca,0x8cf3de]],
  ['emperor','iron','bell',[1.15,.98,.97],[0x333e57,0x668095,0xb1d7e2,0x9ddcff]],
  ['beast','iron','salamander',[1.01,.97,1.23],[0x452a29,0x81423b,0xcc8664,0xff7439]],
  ['bird','bone','paper',[1.11,1.07,.92],[0x534653,0xa58b97,0xf3dcd8,0xe8caff]],
  ['ogre','bronze','coin',[1.17,1,1.03],[0x483427,0x826645,0xcfaa6e,0xffd089]],
  ['duelist','bronze','greatblade',[1.03,1.11,.91],[0x453031,0x905852,0xe2a572,0xff9465]],
  ['dragon','wood','roots',[1.03,1,1.18],[0x283f39,0x537659,0xb8c391,0x8af4a4]],
  ['bird','iron','glass',[1.17,1.01,1],[0x29233e,0x675078,0xba9ed5,0xdbadff]],
  ['duelist','iron','bloodblade',[1.07,1.12,1.04],[0x42272b,0x7a3d41,0xcb8f75,0xff6252]],
];

const entry=(id,[family,finish,crest,proportions,palette],field)=>({id,artId:id,family,finish,crest,proportions,palette,field});
const models=new Map([
  ...Object.entries(creatures).map(([id,profile])=>[id,entry(id,profile,true)]),
  ...guardians.map((profile,index)=>{
    const frame=index===0?6:index<10?index+8:index+20;
    return [frame,entry('forest-'+index,profile,false)];
  }),
]);

export function forestModel(kind,frame){
  return models.get(kind==='boss'?frame:kind);
}

export function forestVariant(frame,name,creature,tint){
  const base=forestModel('boss',frame);
  const themed=models.get(creature);
  if(!base)return null;
  const source=themed??base;
  const palette=[...source.palette.slice(0,3),tint];
  return {...source,id:name,palette,field:false};
}
