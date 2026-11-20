import {monsterCatalogue} from './monster-catalogue.mjs?v=boss-foundry-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?9:14,rings:mobile?13:19,section:2.26,ridge:.22,seed,
}));
const line=(k,j,m,path,steps=12)=>k.sculpt.sweep(j,m,path,{steps,sides:7,ridge:.2});
const shell=(k,j,m,face,depth=.039)=>k.sculpt.plate(j,m,face,depth,.014);

function springMantle(k,parts,mobile,hinges){
  for(const side of sides){
    for(let i=0;i<4;i++){
      const h=.152+i*.085;
      const bough=k.bone(parts.body,side*(.22+i*.036),.42+i*.066,-.187-i*.067);
      bough.name='沉鐘追契者 · 冠上生枝';
      const tree=mirror(side,[[.014,.021,-.038,.053,.046],[.136,.145,-.124,.079,.060],
        [.254,.257+h*.18,-.285,.059,.042],[.369,.39+h*.35,-.415,.033,.024],[.447,.495+h*.47,-.483,.005,.005]]);
      cast(k,bough,i%3?'deep':'body',tree,mobile,side+i*.81);
      line(k,bough,i===2?'glow':'edge',tree.map(([x,y,z,r])=>[x,y+.025,z+.028,r*.32]));
      const leaf=mirror(side,[[.076,.137,-.158],[.151,.342,-.281],[.314,.420+h*.39,-.337],
        [.339,.31+h*.17,-.316],[.251,.187,-.224],[.101,.098,-.137]]);
      shell(k,bough,i%2?'edge':'trim',leaf,.031);
      line(k,bough,'glow',leaf.slice(0,4).map(([x,y,z],j)=>[x,y+.019,z+.016,[.006,.014,.011,.004][j]]));
      hinges.push({joint:bough,side,phase:i*.73,angle:.18+i*.035});
    }
  }
}

function autumnCrown(k,parts,mobile,hinges){
  for(const side of sides){
    const hood=k.bone(parts.head,side*.132,.123,-.05);
    hood.name='織風追契者 · 枯穗冠';
    const crown=mirror(side,[[.037,.045,.115,.033,.031],[.094,.214,.008,.053,.049],
      [.102,.388,-.082,.052,.04],[.197,.483,-.184,.042,.031],[.285,.504,-.290,.006,.006]]);
    cast(k,hood,'trim',crown,mobile,2.1+side);
    for(let i=0;i<5;i++){
      const lift=i*.073,x=.035+i*.016;
      const leaf=mirror(side,[[x,-.085+lift,.114],[x+.091,.016+lift,.084],[x+.160,.141+lift,-.089],
        [x+.229,.106+lift,-.151],[x+.159,-.011+lift,-.05],[x+.086,-.097+lift,.09]]);
      shell(k,hood,i%2?'deep':'edge',leaf,.028);
      line(k,hood,i%3?'trim':'glow',leaf.slice(0,5).map(([x,y,z],j)=>[x,y+.019,z+.024,[.007,.014,.018,.011,.003][j]]));
    }
    hinges.push({joint:hood,side,phase:1.37,angle:.13});
    const mantle=k.bone(parts.body,side*.255,.31,-.365);
    mantle.name='織風追契者 · 枯刃背幡';
    for(let i=0;i<3;i++){
      const x=.037+i*.071,length=.49+i*.13;
      const stalk=mirror(side,[[x,.19,-.078,.058,.046],[x+.056,.032,-.175,.077,.065],
        [x+.13,-.226,-.248,.067,.047],[x+.218,-length,-.385,.033,.024],[x+.27,-length-.22,-.519,.004,.005]]);
      cast(k,mantle,i%2?'body':'deep',stalk,mobile,i*.88);
      line(k,mantle,'trim',stalk.map(([x,y,z,r])=>[x,y+.017,z-.027,r*.3]));
    }
    hinges.push({joint:mantle,side,phase:4.04,angle:.25});
  }
}

function droughtSpines(k,parts,mobile,hinges){
  for(const side of sides){
    const spine=k.bone(parts.body,side*.309,.359,-.219);
    spine.name='鳴隙追契者 · 枯雷棘';
    for(let i=0;i<4;i++){
      const x=.068+i*.091,z=-.091-i*.145,y=i*.072;
      const pitch=mirror(side,[[x,y-.041,z+.087,.067,.054],[x+.129,y+.033,z+.042,.128,.081],
        [x+.277,y+.175,z-.155,.092,.053],[x+.349,y+.261,z-.312,.046,.024],[x+.408,y+.29,z-.369,.005,.005]]);
      cast(k,spine,i%2?'edge':'body',pitch,mobile,side*i*.59);
      line(k,spine,'glow',pitch.map(([x,y,z,r])=>[x,y+.042,z+.026,r*.23]));
      const small=mirror(side,[[x+.15,y+.044,z-.066,.036],[x+.27,y+.126,z-.046,.052],
        [x+.40,y+.197,z-.171,.021],[x+.47,y+.174,z-.219,.004]]);
      line(k,spine,'trim',small,14);
    }
    hinges.push({joint:spine,side,phase:side*.84,angle:.23});
  }
}

const deities={
  goumang:{id:'m009',form:springMantle,shape:'ribbons'},
  'rushou-cane':{id:'m109',form:autumnCrown,shape:'sigils'},
  'vritra-spear':{id:'m125',form:droughtSpines,shape:'bolts'},
};
for(const item of Object.values(deities))item.entry=monsterCatalogue.find(entry=>entry.id===item.id);

export function relicDeitySource(weapon){
  return deities[weapon?.id]?.entry??null;
}

export function sculptDeityRelic(k,parts,weapon,mobile){
  const {form,shape}=deities[weapon.id],hinges=[];
  form(k,parts,mobile,hinges);
  const base=parts.cataloguePose;
  parts.polishEnergy={tint:weapon.tone,shape,anchor:parts.body,offset:[0,.42,-.15],span:[.89,.88,.91]};
  parts.cataloguePose=pose=>{
    base?.(pose);
    for(const {joint,side,phase,angle} of hinges){
      joint.rotation.z=side*(Math.sin(pose.beat*.77+phase)*angle-pose.wind*.21+pose.strike*.34);
      joint.rotation.x=-pose.wind*.13+pose.strike*.23;
    }
  };
}
