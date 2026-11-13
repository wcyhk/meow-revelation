import * as T from '../three.min.mjs';

// The coordinates describe engraved seams, collars and ornaments worked onto each relic.
// They use the weapon forge's design units and are worked on both visible faces.
const fullers={
  flameblade:[.42,.057,'edge',[[.03,-1.86],[-.05,.26],[-.13,4.07],[-.06,6.64],[.10,8.91],[.35,10.58]],-.48,.82],
  reaper:[.62,.109,'body',[[.58,4.25],[1.86,5.62],[3.98,7.15],[5.68,7.92],[7.61,7.41],[9.24,5.85]],.08,2.23],
  'sam-in':[.56,.062,'core',[[-.38,-2.08],[-.36,.44],[-.29,4.31],[-.24,7.56],[.03,8.94]],.12,.63],
  'glacier-sword':[.59,.116,'core',[[-.51,-2.25],[-.94,-.40],[-.67,1.24],[-1.17,2.77],[-1.00,4.24],[-1.70,5.94],[-1.30,7.03],[-2.12,9.30]],-.56,.91],
  'thunder-sword':[.54,.103,'edge',[[.58,-2.16],[.13,-.58],[.78,1.12],[.28,2.48],[.98,3.51],[.72,4.17],[1.33,5.48],[.85,6.58],[1.16,7.41],[1.43,9.18]],.38,.75],
  'moon-kukri':[.58,.092,'trim',[[-.89,-2.36],[-1.21,-.20],[-2.23,1.58],[-3.38,3.55],[-3.62,5.17],[-3.24,6.38],[-2.53,7.90]],-1.50,1.13],
  'dragon-kukri':[.64,.119,'core',[[-.64,-2.13],[-.67,-.44],[-2.44,1.16],[-3.87,2.72],[-4.28,4.3],[-4.52,5.42],[-3.48,7.20]],-2.44,1.39],
  'skanda-kukri':[.64,.112,'trim',[[-.66,-2.04],[-.61,-.29],[-1.38,1.32],[-3.28,2.91],[-3.84,4.21],[-4.32,5.55],[-5.02,6.86],[-5.94,7.57]],-1.49,1.56],
  goumang:[.59,.104,'core',[[.49,-2.25],[.59,-.38],[.24,1.32],[-.71,2.79],[-1.07,3.96],[-1.70,5.47],[-1.45,6.40],[-.54,7.82]],-.86,2.11],
  'blood-sword':[.84,.093,'body',[[-1.42,-2.23],[-1.66,.09],[-1.32,1.88],[-1.58,3.54],[-1.46,5.47],[-1.54,7.32],[-.57,9.46]],-1.28,2.23],
  'nether-sword':[.58,.103,'body',[[.21,-2.22],[.34,-.47],[.22,1.57],[.50,3.60],[.86,5.39],[1.47,7.24],[2.40,9.14],[3.82,11.34]],.35,.51],
  windhalberd:[.74,.093,'edge',[[0,3.62],[-.64,5.33],[-.27,7.14],[.14,8.84],[.06,10.78]],-.19,4.57],
  'sky-halberd':[.71,.115,'core',[[.27,4.12],[.02,5.27],[.43,7.13],[.33,9.67]],.75,6.06],
  'red-corporal':[.61,.107,'core',[[.82,2.82],[.56,4.3],[.82,5.29],[.23,6.21],[-.76,6.79],[-1.94,8.76],[-2.10,10.18],[-1.63,11.57]],.44,4.27],
  'blue-corporal':[.59,.094,'edge',[[.43,2.94],[.18,4.62],[.56,5.58],[-.58,6.42],[-1.31,8.3],[-.83,10.66]],-.58,6.1],
  'shiva-trident':[.74,.11,'dark',[[.03,4.07],[-.19,5.78],[-.22,8.32],[-.02,10.52]],0,5.98],
  xuanming:[.59,.125,'core',[[.26,3.08],[-.29,4.79],[.22,5.86],[.12,7.38],[-.11,9.12],[.21,11.03]],.13,5.94],
  'vritra-spear':[.70,.126,'dark',[[.22,3.40],[-.08,4.62],[-.21,6.52],[.12,8.57],[.08,11.09]],.24,6.42],
  'nether-halberd':[.71,.123,'core',[[.32,3.67],[.32,5.22],[.09,6.52],[.15,8.24],[.21,11.58]],.33,5.63],
  'snow-axe':[.77,.097,'body',[[-6.57,3.9],[-6.38,5.08],[-5.86,6.14],[-5.23,6.78],[-3.68,7.31],[-2.49,7.53]],-4.13,6.81],
  'blood-axe':[.71,.143,'dark',[[-7.0,4.13],[-6.21,2.94],[-5.01,2.33],[-3.64,2.13],[-1.49,2.80]],-2.72,3.59],
  'zhurong-axe':[.79,.109,'core',[[-4.91,3.36],[-3.4,2.56],[-1.59,2.65],[-.51,3.39],[1.01,4.87],[3.12,4.61],[4.22,4.92]],-1.24,3.09],
};

const staffs={
  'sky-dragon-staff':[.59,'edge',[-10.15,-8.53,-5.62,2.31,4.89,7.18,8.56],[[.46,-8.01],[.74,-7.32],[.38,-5.92],[-.19,-4.82],[-.76,-3.86]]],
  'treasure-staff':[.50,'trim',[-10.65,-9.64,-7.45,-2.33,3.20,6.54,8.58],[[.23,-1.91],[.28,-.5],[.3,1.3],[.22,2.96]]],
  'venom-cane':[.58,'trim',[-9.84,-5.59,-4.51,3.71,5.42,6.46],[[.59,5.47],[.99,6.30],[1.84,7.22],[1.84,8.18],[.97,9.43],[-.43,9.68],[-1.05,8.74]]],
  'yama-cane':[.54,'edge',[-9.82,-8.53,-7.29,-6.03,-4.73,3.74,5.51],[[.05,7.81],[-.61,7.57],[-.54,7.15],[.43,7.13],[.54,7.59],[.05,7.81]]],
  'bat-cane':[.58,'body',[-9.95,-7.16,-3.07,2.74,5.68,6.44],[[-2.81,8.82],[-2.56,7.92],[-1.59,7.57],[-.68,6.63],[0,6.51],[.68,6.66],[1.79,7.62],[2.66,7.99],[2.92,9.06]]],
  'cursed-cane':[.59,'edge',[-9.79,-7.22,-5.63,.22,3.93,5.15,6.14],[[-1.57,6.81],[-.95,7.39],[.48,7.35],[1.55,8.02],[.94,8.95],[-.42,8.85],[-1.5,9.25]]],
  'rushou-cane':[.55,'core',[-9.71,-7.63,-6.87,-5.1,-1.32,3.30,5.28],[[.05,6.40],[1.14,6.89],[2.84,7.32],[3.70,8.37],[3.17,9.51],[2.20,9.49]]],
  'emperor-rod':[.49,'trim',[-10.31,-9.49,-7.01,-.46,3.85,6.78,7.57],[[.75,7.93],[1.15,8.67],[.70,9.31],[.19,9.38],[-.18,8.92],[-.45,8.21]]],
};

const bowFacets={
  stormbow:[.485,.153,'trim',[[0,-8.88],[-3.24,-6.94],[-4,-4.54],[-1.94,-.84],[-2.26,1.48],[-3.97,5.98],[-2.35,8.05],[.90,9.21]]],
  'oni-bow':[.475,.123,'dark',[[.38,-8.57],[-2.3,-6.90],[-4.18,-3.77],[-2.77,-2.15],[-1.94,1.03],[-3.24,3.78],[-2.48,5.75],[.10,8.02]]],
  'turtle-bow':[.57,.134,'edge',[[1.47,-7.37],[-.92,-6.20],[-2.57,-4.67],[-2.86,-2.79],[-2.03,.89],[-2.88,3.1],[-2.09,5.42],[.68,7.03]]],
  'red-bow':[.51,.142,'trim',[[1.76,-8.63],[-.51,-8.29],[-3.19,-5.82],[-3.15,-3.37],[-2.11,.84],[-3.44,3.89],[-2.96,6.18],[-.93,8.38]]],
  'nether-bow':[.58,.151,'edge',[[1.93,-8.93],[-.81,-8.30],[-3.68,-5.31],[-3.34,-3.43],[-2.11,.91],[-3.68,4.06],[-3.19,6.08],[.25,8.75]]],
};

const wheelWork={
  chakra:[5.25,.57,16,'core','edge',.09],
  'han-spear':[3.22,.52,8,'dark','edge',.12],
  'wave-wheel':[4.70,.68,4,'core','edge',.43],
  'kali-wheel':[3.22,.72,3,'dark','trim',.57],
};

const solidWork={
  fangs:[.71,.15,'edge',[[-1.60,-.64],[-1.65,.56],[-1.12,2.34],[-.01,3.63],[1.38,4.75]]],
  frostlute:[-1.35,.14,'trim',[[-2.5,-6.21],[-1.22,-6.75],[1.34,-6.44],[2.68,-5.52],[.91,-3.74],[-.18,-4.45],[-1.38,-3.83]]],
  'kunoichi-claw':[.64,.091,'dark',[[-4.47,1.57],[-2.33,1.91],[-.84,2.13],[.88,2.02],[2.20,2.48],[3.91,2.54]]],
  'dragon-fish':[1.95,.14,'core',[[-.21,1.00],[.13,1.71],[-.27,2.48],[-1.02,2.59],[-1.40,2.24]]],
  'ice-talisman':[.67,.142,'core',[[-1.5,.23],[-1.63,1.22],[-.45,1.85],[.82,1.52],[1.52,.44],[1.32,-.74],[.2,-1.4],[-.72,-.76],[-.42,.15],[.28,.24]]],
  'sniper-crossbow':[.73,.124,'trim',[[.49,-2.39],[.44,-.80],[.58,.45],[.50,2.20],[.52,4.13],[.27,6.84]]],
  'lion-crossbow':[.79,.159,'edge',[[-4.31,4.19],[-3.59,4.62],[-2.25,4.91],[-1.16,4.27],[.05,3.55],[1.07,4.26],[2.4,4.97],[3.55,4.55],[4.41,4.11]]],
  'western-rifle':[.66,.103,'trim',[[1.07,-7.14],[.98,-5.93],[.72,-4.94],[.87,-3.56],[.34,-2.18],[.39,.44],[.44,2.54],[.29,4.21]]],
  cannon:[1.62,.12,'dark',[[-.82,-2.68],[-.64,-1.69],[-.32,.48],[.06,2.18],[.24,3.61],[.28,5.47]]],
  airavata:[.96,.121,'dark',[[-4.84,3.18],[-4.52,2.28],[-3.42,1.47],[-2.68,.51],[-1.45,.17],[-.06,-.48]]],
  hundun:[.82,.128,'trim',[[-2.15,-3.99],[-.26,-3.55],[2.13,-3.11],[1.93,-1.34],[.02,-.97],[-2.41,-1.13]]],
  qiongqi:[.49,.134,'core',[[1.02,-.68],[1.34,1.83],[1.37,3.95],[2.05,5.81],[2.40,7.08],[2.96,8.52]]],
  taotie:[.89,.177,'trim',[[-1.95,-4.16],[-1.9,-1.67],[-1.3,.38],[-.1,.87],[1.67,.53],[2.03,-2.41]]],
  taowu:[.97,.130,'body',[[-1.45,-2.01],[-1.7,-.58],[-1.24,1.11],[-1.31,2.97],[-1.52,4.86],[-1.05,7.62]]],
  snake:[.54,.093,'edge',[[.08,.85],[.28,2.02],[.32,3.17],[.31,4.19],[.11,5.37],[-.36,6.08],[-1.64,6.48]]],
};

function engrave(h,spec){
  const [face,width,finish,points,x,y]=spec;
  h.inlay(points,face,width,finish,false);
  if(x===undefined)return;
  for(const side of [-1,1]){
    const z=face*1.12*side;
    h.plate([-.30,0,0,.54,.37,0,0,-.54],'trim',.11,[x,y,z],.057);
    h.gem([x,y,1.15*z],.18,'core',[.91,1.38,.45],1);
  }
}

function collarWork(h,spec){
  const [radius,finish,positions,motif]=spec;
  for(const [index,y] of positions.entries()){
    h.loop([0,y,0],radius+.09,.108,finish,'xz',15);
    h.loop([0,y+.16,0],radius,.064,'dark','xz',13);
    if(index%2===0)for(const side of [-1,1])h.gem([0,y,side*(radius+.12)],.16,'edge',[.88,1.63,.61]);
  }
  h.inlay(motif,motif[0][1]>4?.86:.53,.126,finish);
}

function bowWork(h,spec){
  const [depth,width,finish,points]=spec;
  const bow=h.root.userData.bow;
  for(const [index,[x,y]] of points.entries()){
    const part=h.loop([x,y,0],depth,width,finish,'xz',14);
    part.rotation.z=(index<points.length*.5?-1:1)*.34;
    bow.attachments.push({mesh:part,rest:part.position.clone()});
    if(index%2===1){
      for(const side of [-1,1]){
        const cap=h.gem([x,y,side*depth],.21,'core',[.92,1.46,.49],1);
        bow.attachments.push({mesh:cap,rest:cap.position.clone()});
      }
    }
  }
}

function bowOrnaments(h,id){
  const style={
    stormbow:{wood:'trim',gilt:'edge',curve:1.2,crest:.64,steps:5},
    'oni-bow':{wood:'dark',gilt:'trim',curve:.76,crest:.84,steps:4},
    'turtle-bow':{wood:'trim',gilt:'edge',curve:.91,crest:.49,steps:3},
    'red-bow':{wood:'body',gilt:'trim',curve:1.24,crest:.96,steps:3},
    'nether-bow':{wood:'body',gilt:'edge',curve:1.54,crest:1.18,steps:5},
  }[id];
  const bow=h.root.userData.bow;
  for(const side of [-1,1]){
    const y=side*4.55;
    const x=-3.30;
    const branch=new T.Group();
    branch.position.set(x*.1,y*.1,0);
    h.root.add(branch);
    bow.attachments.push({mesh:branch,rest:branch.position.clone()});
    const keep=mesh=>{
      mesh.position.sub(branch.position);
      branch.add(mesh);
    };
    for(const back of [-1,1]){
      const z=back*.53;
      if(id==='red-bow'){
        for(const direction of [-1,1]){
          const horn=h.line([[x,y,z],[x-.89,y+side*.67*direction,z*1.28],[x-.66,y+side*1.62*direction,z*1.13],
            [x+.12,y+side*2.05*direction,z*.81],[x+.82,y+side*1.92*direction,z*.43]],.165,style.gilt);
          keep(horn);
        }
      }else{
        const sideFin=h.line([[x+.53,y-side*.73,z],[x-.31,y+side*.62,z*1.21],[x-.53*style.curve,y+side*1.45,z],
          [x+.16,y+side*2.34,z*.8]],.153,style.wood);
        keep(sideFin);
        for(let i=0;i<style.steps;i++){
          const fy=y+side*(i-1.24)*.75;
          const fx=x+(i-.5)*.14;
          const spur=h.solid([[fx+.12,fy,z,.24,.25],[fx-.52,fy+side*.51,z*1.15,.28,.21],
            [fx-style.crest*(i%2?.78:1.32),fy+side*1.12,z*.97,.088,.12],
            [fx-style.crest*1.31,fy+side*1.41,z*.82,.022,.02]],
          i%3===1?'core':style.gilt,{sides:8,rings:7,section:1.75,ridge:.11});
          keep(spur);
        }
      }
    }
  }
}

function chasedWheel(h,spec){
  const [radius,z,count,faceFinish,pointFinish,offset]=spec;
  for(const side of [-1,1])for(let i=0;i<count;i++){
    const angle=i*Math.PI*2/count+offset;
    const p=(distance,shift,lift)=>[Math.sin(angle+shift)*distance,Math.cos(angle+shift)*distance,side*(z+lift)];
    h.line([p(radius-.54,-.084,0),p(radius+.15,-.026,.04),p(radius+.33,.14,.10)],.125,faceFinish,false);
    h.gem(p(radius+.13,.025,.09),.18,pointFinish,[.92,1.22,.56],1);
  }
}

export function signWeapon(h,id){
  if(fullers[id])engrave(h,fullers[id]);
  if(staffs[id])collarWork(h,staffs[id]);
  if(bowFacets[id]){
    bowWork(h,bowFacets[id]);
    bowOrnaments(h,id);
  }
  if(wheelWork[id])chasedWheel(h,wheelWork[id]);
  if(solidWork[id])engrave(h,solidWork[id]);
  if(id==='earth-beads'||id==='lotus-beads'){
    const earth=id==='earth-beads',count=earth?12:10;
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count;
      const x=Math.sin(a)*(earth?3.88:3.44);
      const y=Math.cos(a)*(earth?4.62:3.72)+.9;
      const z=Math.sin(a*2)*.72;
      if(earth){
        for(const side of [-1,1]){
          h.gem([x,y,z+side*.61],.22,i%3?'edge':'core',[.73,.83,.40],1);
          h.line([[x-.22,y-.16,z+side*.57],[x+.22,y+.13,z+side*.64]],.066,'dark',false);
        }
      }else{
        for(let petal=0;petal<4;petal++){
          const phase=petal*Math.PI*.5+i*.51;
          const oval=h.gem([x+Math.sin(phase)*.37,y+Math.cos(phase)*.37,z+.63],
            .29,'edge',[.76,1.42,.41],1);
          oval.rotation.z=-phase;
        }
      }
    }
  }
}
