import * as T from '../three.min.mjs';

const grips={
  sword:[0,-.57,-.62,.98],seven:[0,-.54,-.45,.94],doll:[0,-.27,-.09,.82],orb:[0,-.25,.11,.79],
  spear:[0,-.27,-.48,.99],claw:[0,-.19,-.44,.75],halberd:[0,-.34,-.53,.99],axe:[0,-.42,-.65,.97],
  staff:[0,-.33,-.32,.98],ring:[-.20,-.05,-.16,.90],bow:[-.19,0,.09,.98],curve:[0,-.50,-.63,.95],
  cane:[0,-.33,-.28,.99],beads:[0,-.23,-.31,.87],trident:[0,-.30,-.47,1],bell:[0,-.34,.40,.91],
  talisman:[0,-.38,-.13,.88],snake:[0,-.32,-.39,.92],gun:[-.15,-.41,-1.37,.88],
  crossbow:[0,-.35,-1.14,.92],horn:[0,-.41,-.55,.95],feather:[0,-.42,-.40,.86],fang:[0,-.39,-.53,.90],box:[0,-.26,.18,.88],
};

export function relicGrip(weapon) {
  const [x,y,turn,scale]=grips[weapon.form];
  return {anchor:[x,y,0],turn,scale,pitch:-.24,glow:.30};
}

export function makeRelic(root,weapon,materials,{piece,blade,ring,wrap,etching}){
  const {dark,brass,stone,ivory}=materials;
  const variation=weapon.sigil;
  const spread=.83+(variation%7)*.065;
  const crest=variation%5;
  const {form}=weapon;
  const shaft=(center,length,radius=.061)=>piece(root,new T.CylinderGeometry(radius,radius*1.09,length,8),dark,0,center);
  const gem=(x,y,z,size)=>piece(root,new T.OctahedronGeometry(size),stone,x,y,z);
  const metal=(points,depth=.09,finish=ivory)=>piece(root,blade(points,depth),finish);
  const cuff=(y,r=.084)=>ring(root,r,.018,brass,y,10).rotateX(Math.PI/2);
  const tube=(points,radius,finish=brass)=>{
    const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return piece(root,new T.TubeGeometry(path,20,radius,5,false),finish);
  };
  switch(form){
    case 'sword':
    case 'seven':
    case 'curve':
    case 'fang': {
      const hand=form==='seven'?-.54:form==='curve'?-.50:form==='fang'?-.39:-.57;
      shaft(hand,.42);
      cuff(hand-.20);cuff(hand+.18);
      const turn=form==='curve'||form==='fang'?.42:crest*.026;
      metal([[-.17,-.35],[-.16,.48],[turn,.97],[turn+.14,.62],[.20,.28],[.13,-.35]]);
      metal([[-.098,-.30],[-.09,.37],[turn,.82],[turn+.062,.59],[.104,-.30]],.099,stone);
      metal([[-.33,-.31],[0,-.25],[.31,-.31],[.0,-.43]],.105,brass);
      if(form==='seven')for(const side of [-1,1])for(let tooth=0;tooth<3;tooth++){
        const y=-.22+tooth*.28;
        metal([[side*.07,y],[side*(.36+spread*.12),y+.19],[side*.23,y+.31],[side*.06,y+.14]],.061,ivory);
      }
      etching(root,brass,[[0,-.20],[-.07,.14],[.06,.41],[turn,.66]],.067);
      break;
    }
    case 'spear':
    case 'halberd':
    case 'trident':
    case 'staff':
    case 'cane': {
      shaft(-.22,1.56);
      cuff(-.92);cuff(-.35);cuff(.42,.093);
      if(form==='staff'||form==='cane'){
        tube([[0,.28,0],[0,.70,0],[.24,.92,0],[.37,.71,0],[.20,.60,0]],.052);
        gem(.19,.74,0,.14*spread);
        for(const side of [-1,1])metal([[0,.39],[side*.29,.51],[side*(.27+crest*.024),.77],[side*.11,.53]],.061,ivory);
      }else{
        metal([[-.10,.31],[-.16,.64],[.028,1.08],[.19,.64],[.10,.36]]);
        metal([[0,.42],[-.069,.62],[.028,.96],[.105,.59]],.106,stone);
        if(form==='halberd')metal([[-.04,.39],[-.45*spread,.47],[-.57*spread,.91],[-.31,.73],[.03,.62]],.10);
        if(form==='trident')for(const side of [-1,1])metal([[0,.32],[side*.27,.53],[side*.32,.95],[side*.16,.70]],.071,brass);
      }
      break;
    }
    case 'axe':
    case 'horn':
    case 'feather':
    case 'claw': {
      shaft(-.36,.77);
      cuff(-.66);cuff(-.09);
      if(form==='axe'){
        metal([[-.06,.11],[-.55*spread,.04],[-.69*spread,.56],[-.43,.84],[-.13,.66],[.13,.44]],.112);
        metal([[.02,.21],[.28,.19],[.41,.51],[.14,.48]],.085,brass);
        etching(root,stone,[[-.49,.30],[-.45,.51],[-.37,.65],[-.19,.50]],.07,.019);
      }else if(form==='claw'){
        for(let i=0;i<3;i++){
          const x=(i-1)*.18;
          metal([[x-.10,-.15],[x-.085,.37],[x+.15,.72-crest*.021],[x+.07,.32],[x+.08,-.12]],.073,i===1?stone:ivory);
        }
      }else{
        metal([[-.16,-.18],[-.29,.35],[-.22,.68],[.45*spread,.90],[.27,.57],[.17,.33],[.13,-.20]],.105,form==='horn'?ivory:stone);
        etching(root,brass,[[0,-.10],[-.12,.22],[-.10,.49],[.35,.81]],.068,.016);
        for(let i=0;i<3;i++)metal([[-.18,.02+i*.16],[-.24-i*.039,.12+i*.18],[.16,.19+i*.14],[.12,.10+i*.15]],.055,brass);
      }
      break;
    }
    case 'bow':
    case 'crossbow': {
      const limbs=[[.06,-.80,0],[-.35,-.48,0],[-.19,0,0],[-.35,.48,0],[.06,.80,0]];
      if(form==='bow'){
        tube(limbs,.056);
        tube(limbs.map(([x,y,z])=>[x+.025,y,z+.043]),.018,ivory);
        tube([[.07,-.79,0],[.07,0,0],[.07,.79,0]],.012,stone);
        for(const sign of [-1,1])gem(.048,sign*.75,0,.12*spread);
      }else{
        tube(limbs.map(([x,y,z])=>[y*.75,x+.42,z]),.062);
        tube([[-.60,.47,0],[0,.11,0],[.60,.47,0]],.014,ivory);
        metal([[-.12,-.61],[-.13,.24],[0,.78],[.13,.24],[.12,-.61]],.16,dark);
        gem(0,.60,.09,.13);
      }
      break;
    }
    case 'gun':
      piece(root,new T.LatheGeometry([[.02,-.31],[.12,-.23],[.14,.70],[.19,.90],[.11,.94],[.09,.64]]
        .map(([x,y])=>new T.Vector2(x,y)),14),dark);
      for(const y of [-.17,.28,.65,.88])cuff(y,y>.7?.174:.132);
      metal([[-.29,-.65],[-.31,-.32],[-.13,.11],[-.012,-.09],[.05,-.48],[-.17,-.60]],.145,brass);
      etching(root,stone,[[.05,-.09],[-.044,.20],[.044,.37],[0,.68]],.138,.017);
      break;
    case 'ring':
    case 'orb':
    case 'beads':
      for(let i=0;i<(form==='beads'?10:8);i++){
        const angle=i*Math.PI*2/(form==='beads'?10:8);
        const radius=form==='beads'?.39:.47;
        const jewel=gem(Math.sin(angle)*radius,Math.cos(angle)*radius,.025,.084+(i+crest)%3*.024);
        jewel.scale.y=1.34;
      }
      ring(root,.39,.037,brass,0,22);
      if(form==='ring')ring(root,.52,.019,ivory,0,20);
      if(form==='orb')piece(root,new T.IcosahedronGeometry(.31*spread,1),stone);
      if(form==='beads')gem(0,-.54,0,.12);
      break;
    case 'doll':
      piece(root,new T.SphereGeometry(.26,12,8),stone,0,.34,0);
      piece(root,new T.CapsuleGeometry(.19,.33,4,9),dark,0,-.02,0);
      for(const side of [-1,1]){
        const ear=piece(root,new T.ConeGeometry(.123,.34,5),ivory,side*.19,.61,0);
        ear.rotation.z=-side*.30;
        gem(side*.10,.36,.236,.065);
      }
      ring(root,.19,.024,brass,.07,10).rotateX(Math.PI/2);
      break;
    case 'bell':
      shaft(-.29,.63);
      piece(root,new T.LatheGeometry([[.28,-.19],[.27,-.16],[.20,.08],[.09,.28],[.03,.29]]
        .map(([x,y])=>new T.Vector2(x,y)),13),stone,0,.52,0);
      cuff(.37,.267);cuff(.54,.20);
      gem(0,.33,0,.11);
      break;
    case 'talisman':
      metal([[-.24,-.56],[-.26,.56],[-.12,.75],[.23,.68],[.22,-.48],[.03,-.64]],.052,ivory);
      etching(root,stone,[[-.13,.31],[.12,.31],[.003,.46],[.03,.13],[-.13,-.05],[.12,-.26],[-.04,-.38]],.048,.023);
      cuff(.70,.12);
      break;
    case 'snake':
      tube([[0,-.63,0],[-.27,-.35,.05],[.23,-.10,0],[-.21,.23,0],[.14,.52,0],[.30,.51,0]],.085,stone);
      piece(root,new T.IcosahedronGeometry(.145,0),ivory,.30,.53,0).scale.set(1.50,.67,1);
      gem(.35,.55,.097,.047);
      break;
    case 'box':
      piece(root,new T.BoxGeometry(.55,.59,.32),dark,0,.15,0);
      for(const side of [-1,1]){
        piece(root,new T.BoxGeometry(.045,.66,.37),brass,side*.26,.15,0);
        piece(root,new T.BoxGeometry(.56,.051,.36),ivory,0,.15+side*.31,0);
      }
      gem(0,.16,.174,.16);
      cuff(-.22,.116);
      break;
  }
  if(['sword','seven','spear','halberd','axe','staff','cane','trident','curve','horn','fang','feather','claw'].includes(form)){
    const grip=relicGrip(weapon);
    wrap(root,brass,grip.anchor[1],.20,.067);
  }
  for(let i=0;i<1+crest%3;i++)gem((i-crest%3*.5)*.064,.12+crest*.047,.14,.040+spread*.015);
  return root;
}
