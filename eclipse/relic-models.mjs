const grips={
  sword:[0,-.57,-.62,.98],seven:[0,-.54,-.45,.94],doll:[0,-.27,-.09,.82],orb:[0,-.25,.11,.79],
  spear:[0,-.27,-.48,.99],claw:[0,-.19,-.44,.75],halberd:[0,-.34,-.53,.99],axe:[0,-.42,-.65,.97],
  staff:[0,-.33,-.32,.98],ring:[-.20,-.05,-.16,.90],bow:[-.19,0,.09,.98],curve:[0,-.50,-.63,.95],
  cane:[0,-.33,-.28,.99],beads:[0,-.23,-.31,.87],trident:[0,-.30,-.47,1],bell:[0,-.34,.40,.91],
  talisman:[0,-.38,-.13,.88],snake:[0,-.32,-.39,.92],gun:[-.15,-.41,-1.37,.88],
  crossbow:[0,-.35,-1.14,.92],horn:[0,-.41,-.55,.95],feather:[0,-.42,-.40,.86],fang:[0,-.39,-.53,.90],box:[0,-.26,.18,.88],
};

const individual={
  'thunder-pearl':[.02,-.29,.08,.84], 'ice-orb':[.02,-.29,.09,.86], 'fire-orb':[0,-.37,.13,.84],
  'spark-orb':[0,-.23,-.10,.80], 'golden-orb':[.02,-.25,.22,.86],
  'han-spear':[-.21,-.19,-.19,.80], 'kunoichi-claw':[.02,-.19,-.42,.84],
  'earth-beads':[0,.42,-.34,.82], 'lotus-beads':[0,.36,-.26,.82],
  'dragon-fish':[-.11,-.31,.29,.85], 'lotus-fish':[-.10,-.29,.34,.85],
  'ice-talisman':[0,-.28,.13,.79], snake:[0,-.38,-.12,.86],
  'nether-box':[0,-.36,.29,.84],
  hundun:[0,-.34,-.48,.81], taotie:[0,-.33,-.40,.82], airavata:[0,-.34,-.58,.93],
  'western-rifle':[.10,-.37,-1.37,.85],
};

export function relicGrip(weapon) {
  const [x,y,turn,scale]=individual[weapon.id]??grips[weapon.form];
  return {anchor:[x,y,0],turn,scale,pitch:-.24,glow:.30};
}
