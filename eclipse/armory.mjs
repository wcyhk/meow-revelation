import * as T from '../three.min.mjs';
import {nightArms} from './nightfall-arms.mjs?v=nightfall-1';
import {forgedMaterials} from './forge-materials.mjs?v=patina-1';
import {huntArms} from './relic-arsenal.mjs?v=heirlooms-1';
import {makeRelic} from './relic-models.mjs?v=heirlooms-1';

export const arms = [
  {id:'tiger', name:'白虎之聖輪', mark:'✧', tone:0xece7c5, ink:'#f1ddb2', role:'近身 · 高機動',
    attack:'風刃', basic:'近身快斬，第三擊掃及四周。', skill:'如虎添翼',
    detail:'化為風刃向前突襲，穿過敵人時造成傷害，途中可避開攻擊。',
    damage:18,reach:2.35,period:.22,delay:.052,cooldown:5.4,range:6.5,power:57},
  {id:'dragon', name:'青龍之聖珠', mark:'ϟ', tone:0x80c8ff, ink:'#b1e0ff', role:'遠程 · 連鎖',
    attack:'流雷', basic:'先引雷，再連鎖，最後以震雷波及近敵。', skill:'天衣雷陣',
    detail:'三道天雷依次追擊敵人，每道波及落點附近。對群敵有利。',
    damage:19,reach:6.45,period:.36,delay:.09,cooldown:6.4,range:7.6,power:34},
  {id:'phoenix', name:'朱雀之聖嘴', mark:'❂', tone:0xff7d54, ink:'#ffc19c', role:'中距 · 破防',
    attack:'鳴焰', basic:'火焰音波貫穿直線上的敵人。', skill:'崩鳴音',
    detail:'朝同一方向連發三道鳳鳴，使敵人在短時間內承受更多傷害。',
    damage:21,reach:5.1,period:.34,delay:.085,cooldown:6.2,range:7.5,power:23},
  {id:'turtle', name:'玄武之聖棘', mark:'❄', tone:0x85ead3, ink:'#b9f2df', role:'近身 · 反擊',
    attack:'寒棘', basic:'橫掃讓敵人減速，便於拉開距離。', skill:'金剛不壞',
    detail:'冰甲維持 3 秒並降低傷害。受擊時向攻擊者反震冰刺。',
    damage:26,reach:2.78,period:.31,delay:.088,cooldown:7.3,range:2.9,power:35},
  {id:'qilin', name:'麒麟之聖角', mark:'◈', tone:0xffc269, ink:'#ffdc99', role:'中距 · 聚敵',
    attack:'地角', basic:'短刺接兩下快刺，最後踏前重突貫穿敵人。', skill:'潛能漩渦',
    detail:'在前方留下吸引敵人的漩渦。漩渦持續時，重刺傷害提高。',
    damage:30,reach:3.27,period:.39,delay:.105,cooldown:7,range:4.3,power:25},
  {id:'flameblade',name:'天王火劍',mark:'♨',tone:0xff6836,ink:'#ffc099',role:'近身 · 火陣',
    attack:'烈斬',basic:'挑斬接橫劍，最後舉劍蓄力，重劈引爆落點。',skill:'炎龍殺陣',
    detail:'三柄火劍落在目標周圍，先後爆開，適合截擊聚集的敵群。',
    damage:27,reach:2.88,period:.32,delay:.08,cooldown:6.8,range:6.2,power:42},
  {id:'stormbow',name:'天王雷弓',mark:'ϟ',tone:0x83d8ff,ink:'#a9eaff',role:'遠程 · 貫穿',
    attack:'疾雷箭',basic:'快箭接雙矢，最後拉滿弦射出一支貫穿重箭。',skill:'天弓雷擊',
    detail:'沿瞄準方向連續落下四道雷擊，貫穿長列敵人。',
    damage:18,reach:7.35,period:.34,delay:.072,cooldown:6.0,range:9.5,power:31},
  {id:'windhalberd',name:'天王風戟',mark:'≋',tone:0xbbefb5,ink:'#d4f5c4',role:'近身 · 退敵',
    attack:'戟風',basic:'向前挑刺、回勾拉近，再旋身將敵人掃開。',skill:'風龍閃',
    detail:'連續三次以自身為中心橫掃，走位時也會繼續出招。',
    damage:25,reach:3.13,period:.35,delay:.083,cooldown:6.1,range:3.65,power:32},
  {id:'frostlute',name:'天王琵琶',mark:'❄',tone:0x98e9ec,ink:'#c6f5f4',role:'中距 · 冰控',
    attack:'清弦',basic:'勾弦後連撥兩聲，最後以闊冰浪延長減速。',skill:'清冰激流',
    detail:'指定範圍連續湧起三道冰浪，延長減速並限制追擊。',
    damage:20,reach:5.65,period:.39,delay:.10,cooldown:6.9,range:6.4,power:37},
  {id:'chakra',name:'毗濕奴的圓盤',mark:'◎',tone:0xffd16a,ink:'#ffe2a4',role:'中距 · 回旋',
    attack:'回輪',basic:'直擲接側掠，最後甩出大圓盤。去程和回程都能傷敵。',skill:'電擊鉤',
    detail:'三層電環由外向內收縮，近遠敵人會喺不同時間中招。',
    damage:19,reach:5.9,period:.36,delay:.077,cooldown:6.5,range:5.1,power:42},
  ...nightArms,
  ...huntArms,
];

function piece(parent, geometry, material, x=0, y=0, z=0) {
  const mesh = new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  parent.add(mesh);
  return mesh;
}

function blade(points, depth) {
  const path = new T.Shape();
  points.forEach(([x,y],index)=>index ? path.lineTo(x,y) : path.moveTo(x,y));
  path.closePath();
  const geometry = new T.ExtrudeGeometry(path,{depth,bevelEnabled:true,bevelThickness:.021,bevelSize:.018,bevelSegments:1,steps:1});
  geometry.translate(0,0,-depth/2);
  return geometry;
}

function ring(parent, radius, thickness, material, y=0, sides=28) {
  return piece(parent,new T.TorusGeometry(radius,thickness,6,sides),material,0,y);
}

function wrap(parent,material,center,length,radius) {
  for(let i=-2;i<=2;i++){
    const strap=piece(parent,new T.TorusGeometry(radius,.010,4,9).rotateX(Math.PI/2),material,0,center+i*length*.20);
    strap.rotation.z=i*.039;
  }
}

function etching(parent,material,path,z,width=.009) {
  for(const side of [-1,1]) {
    const curve=new T.CatmullRomCurve3(path.map(([x,y])=>new T.Vector3(x,y,z*side)));
    piece(parent,new T.TubeGeometry(curve,13,width,4,false),material);
  }
}

export function armLighting(scene,field=false) {
  scene.add(new T.HemisphereLight(field?0xe0deeb:0xffedc9,0x504052,field?1.03:1.86));
  const light = new T.DirectionalLight(0xffecd4,field?1.0:1.96);
  light.position.set(-3,6,6);
  scene.add(light);
  const edge = new T.DirectionalLight(0x9bb7cb,field?.63:1.31);
  edge.position.set(4,-2,-3);
  scene.add(edge);
}

export function forge(weapon) {
  const root = new T.Group();
  const materials=forgedMaterials(weapon);
  if(weapon.spell)return makeRelic(root,weapon,materials,{piece,blade,ring,wrap,etching});
  const {brass,dark,stone,ivory} = materials;
  switch (weapon.id) {
    case 'tiger':
      ring(root,.42,.066,dark,0,14);
      ring(root,.49,.035,ivory,0,14);
      ring(root,.33,.023,brass,0,14);
      piece(root,new T.BoxGeometry(.67,.09,.11),dark).rotation.z=.53;
      for (let i=0;i<4;i++) {
        const spur=piece(root,blade([[0,.35],[-.10,.45],[.11,.64],[.12,.45]],.06),stone);
        spur.rotation.z=i*Math.PI/2+.23;
        const cap=piece(root,blade([[.02,.44],[-.038,.48],[.11,.635],[.078,.48]],.037),ivory,0,0,.026);
        cap.rotation.z=spur.rotation.z;
      }
      break;
    case 'dragon':
      piece(root,new T.IcosahedronGeometry(.32,1),stone);
      ring(root,.45,.038,brass).rotation.y=.44;
      ring(root,.40,.031,ivory).rotation.set(.84,1.20,.54);
      ring(root,.48,.021,dark).rotation.y=-.42;
      for (let i=0;i<3;i++) {
        const angle=i*Math.PI*2/3;
        const clasp=piece(root,new T.OctahedronGeometry(.11),brass,Math.sin(angle)*.45,Math.cos(angle)*.45);
        clasp.rotation.z=-angle;
      }
      etching(root,ivory,[[-.26,-.20],[-.14,-.05],[.12,-.05],[.23,.10],[.13,.22]],.19,.014);
      break;
    case 'phoenix':
      piece(root,new T.CylinderGeometry(.07,.10,.51,7),dark,0,-.42);
      piece(root,new T.CylinderGeometry(.12,.12,.08,9),brass,0,-.17);
      piece(root,blade([[-.14,-.19],[-.20,.12],[-.01,.67],[.37,.77],[.19,.50],[.13,.07]],.12),brass);
      piece(root,blade([[-.08,-.07],[-.11,.21],[.04,.62],[.34,.76],[.13,.41],[.067,.11]],.136),stone);
      for (const side of [-1,1]) {
        const pinion=piece(root,blade([[0,-.14],[.1,.27],[.27,.38],[.18,.08]],.055),ivory);
        pinion.position.set(side*.064,-.03,side*.09);
        pinion.rotation.z=side*.53;
      }
      etching(root,ivory,[[-.05,-.04],[-.085,.22],[.06,.48],[.28,.70]],.079);
      break;
    case 'turtle':
      piece(root,new T.CylinderGeometry(.068,.078,.71,7),dark,0,-.35);
      piece(root,new T.CylinderGeometry(.15,.11,.11,7),brass,0,-.05);
      piece(root,new T.IcosahedronGeometry(.27,0),dark,0,.19).scale.set(1.14,1,.83);
      for (let i=0;i<6;i++) {
        const angle=i*Math.PI/3;
        const needle=piece(root,new T.ConeGeometry(.122,.43,5),stone,Math.sin(angle)*.24,.25,Math.cos(angle)*.24);
        needle.rotation.set(Math.cos(angle)*1.09,0,-Math.sin(angle)*1.09);
      }
      piece(root,new T.ConeGeometry(.13,.46,6),ivory,0,.49);
      ring(root,.22,.019,brass,.12,9).rotation.x=Math.PI/2;
      break;
    case 'qilin':
      piece(root,new T.CylinderGeometry(.057,.075,1.19,7),dark,0,-.34);
      piece(root,new T.CylinderGeometry(.088,.095,.065,8),brass,0,-.87);
      piece(root,new T.CylinderGeometry(.19,.12,.12,8),brass,0,.23);
      piece(root,blade([[-.11,.18],[-.23,.38],[-.21,.68],[.10,1.04],[.06,.77],[.19,.63],[.12,.30]],.115),ivory);
      piece(root,blade([[-.057,.25],[-.14,.44],[-.12,.65],[.08,.98],[.017,.70],[.10,.56],[.075,.32]],.134),stone);
      etching(root,brass,[[.009,.29],[-.067,.48],[-.045,.63],[.063,.84]],.077);
      break;
    case 'flameblade':
      piece(root,new T.CylinderGeometry(.06,.075,.48,7),dark,0,-.60);
      piece(root,blade([[-.32,-.28],[0,-.12],[.32,-.28],[0,-.40]],.08),brass);
      piece(root,blade([[-.16,-.30],[-.17,.50],[0,1.01],[.19,.47],[.17,-.30]],.11),ivory);
      piece(root,blade([[0,-.25],[-.082,.42],[0,.96],[.09,.43]],.13),stone);
      etching(root,brass,[[.0,-.18],[-.041,.05],[.035,.30],[-.031,.49],[.0,.81]],.078,.010);
      break;
    case 'stormbow': {
      const path=new T.CatmullRomCurve3([
        new T.Vector3(.06,-.82,0),new T.Vector3(-.31,-.53,0),new T.Vector3(-.18,0,0),
        new T.Vector3(-.31,.53,0),new T.Vector3(.06,.82,0),
      ]);
      const limbs=piece(root,new T.TubeGeometry(path,22,.058,7,false),brass);
      const brace=new T.CatmullRomCurve3([new T.Vector3(-.29,-.52,.042),new T.Vector3(-.21,-.22,.073),
        new T.Vector3(-.15,0,.074),new T.Vector3(-.21,.22,.073),new T.Vector3(-.29,.52,.042)]);
      piece(root,new T.TubeGeometry(brace,14,.014,5,false),ivory);
      const string=Array.from({length:2},()=>piece(root,new T.CylinderGeometry(.014,.014,1,5),ivory));
      const arrow=piece(root,new T.CylinderGeometry(.024,.019,.71,6).rotateZ(Math.PI*.5),stone);
      arrow.visible=false;
      const tips=[];
      for (const end of [-1,1]) {
        const tip=piece(root,new T.OctahedronGeometry(.16),stone,.04,end*.79);
        tip.scale.set(.63,1.27,.63);
        tips.push(tip);
      }
      const position=limbs.geometry.getAttribute('position');
      position.setUsage(T.DynamicDrawUsage);
      root.userData.bow={limbs,position,rest:position.array.slice(),string,arrow,tips,draw:-1,nocked:false};
      shapeBow(root,0,false);
      break;
    }
    case 'windhalberd':
      piece(root,new T.CylinderGeometry(.053,.060,1.42,7),dark,0,-.31);
      piece(root,blade([[-.065,.31],[-.10,.71],[.028,1.08],[.12,.72],[.08,.37]],.09),stone);
      piece(root,blade([[-.03,.31],[-.38,.40],[-.48,.72],[-.32,.69],[-.21,.53],[.04,.49]],.095),ivory);
      piece(root,new T.CylinderGeometry(.093,.093,.10,7),brass,0,-.91);
      etching(root,brass,[[-.40,.64],[-.31,.49],[-.19,.45],[-.085,.46]],.058);
      break;
    case 'frostlute': {
      const body=piece(root,new T.SphereGeometry(.38,12,10),stone,0,-.33);
      body.scale.set(.83,1.23,.37);
      piece(root,new T.CylinderGeometry(.061,.082,.92,7),brass,0,.22);
      piece(root,new T.OctahedronGeometry(.13),ivory,0,.75);
      for (const x of [-.075,-.026,.027,.077]) {
        piece(root,new T.CylinderGeometry(.009,.009,1.17,5),ivory,x,.02,.13);
      }
      const rim=ring(root,.291,.019,ivory,-.35,18);
      rim.position.z=.09;rim.scale.y=1.34;
      piece(root,new T.BoxGeometry(.27,.028,.033),brass,0,-.48,.132);
      break;
    }
    case 'chakra':
      ring(root,.55,.052,brass,0,22);
      ring(root,.46,.043,ivory,0,22);
      ring(root,.31,.022,dark);
      for (let i=0;i<8;i++) {
        const tooth=piece(root,blade([[0,.40],[-.077,.53],[.08,.70],[.11,.49]],.055),stone);
        tooth.rotation.z=i*Math.PI/4;
      }
      ring(root,.376,.012,stone,0,26).position.z=.037;
      break;
    case 'reaper':
      piece(root,new T.CylinderGeometry(.054,.073,1.82,8),dark,0,-.24);
      piece(root,new T.CylinderGeometry(.085,.088,.34,8),brass,0,.50);
      piece(root,blade([[-.12,.55],[.18,.85],[.54,.94],[.87,.71],[1.01,.31],[.78,.53],[.47,.59],[.16,.45]],.13),ivory);
      piece(root,blade([[.03,.59],[.23,.78],[.55,.87],[.84,.64],[.92,.43],[.73,.58],[.45,.65]],.16),stone);
      piece(root,new T.OctahedronGeometry(.17),stone,0,.66);
      etching(root,brass,[[.06,.64],[.34,.76],[.59,.74],[.83,.55]],.089,.011);
      break;
    case 'bell': {
      piece(root,new T.CylinderGeometry(.057,.078,1.48,7),dark,0,-.37);
      piece(root,new T.CylinderGeometry(.096,.107,.36,7),brass,0,.37);
      const cup=piece(root,new T.LatheGeometry([[.33,-.21],[.27,-.17],[.19,.06],[.12,.23],[.05,.28]].map(([x,y])=>new T.Vector2(x,y)),14),brass,0,.76);
      cup.material.side=T.DoubleSide;
      piece(root,new T.TorusGeometry(.331,.036,6,16).rotateX(Math.PI/2),ivory,0,.55);
      piece(root,new T.OctahedronGeometry(.19),stone,0,.53);
      ring(root,.46,.025,dark,.74);
      for(let i=0;i<6;i++){
        const angle=i*Math.PI/3;
        const band=piece(root,blade([[-.031,-.095],[0,.095],[.031,-.095],[0,-.060]],.027),ivory,
          Math.sin(angle)*.226,.703,Math.cos(angle)*.226);
        band.rotation.y=angle;
      }
      break;
    }
    case 'fangs':
      for (const side of [-1,1]) {
        const tooth=new T.Group();root.add(tooth);
        tooth.position.x=side*.23;tooth.rotation.z=side*.25;
        piece(tooth,new T.CylinderGeometry(.055,.075,.40,6),dark,0,-.36);
        piece(tooth,blade([[-.13,-.20],[.19,-.11],[.30,.20],[.28,.69],[.02,.38],[-.14,.16]],.105),ivory);
        piece(tooth,blade([[-.07,-.14],[.11,-.04],[.23,.24],[.25,.59],[.04,.29]],.128),stone);
        etching(tooth,brass,[[.02,-.09],[.16,.13],[.225,.36],[.27,.56]],.075);
        wrap(tooth,brass,-.36,.21,.066);
      }
      break;
    case 'cannon':
      piece(root,new T.LatheGeometry([[.008,-.23],[.137,-.23],[.177,-.13],[.157,.05],[.142,.44],[.183,.67],
        [.192,.79],[.148,.83],[.109,.81],[.104,.48],[.008,.42]].map(([x,y])=>new T.Vector2(x,y)),16),dark);
      for (const [y,r] of [[-.15,.17],[.03,.167],[.40,.151],[.71,.193],[.79,.187]]) {
        piece(root,new T.TorusGeometry(r,.021,5,16).rotateX(Math.PI/2),brass,0,y);
      }
      piece(root,blade([[-.18,-.52],[-.25,-.36],[-.16,-.14],[-.07,-.11],[.08,-.24],[.018,-.49]],.16),dark);
      piece(root,blade([[-.17,-.45],[-.21,-.36],[-.13,-.19],[-.08,-.17],[-.02,-.24],[-.068,-.41]],.163),brass);
      for(const side of [-1,1]) {
        const plate=piece(root,blade([[-.071,.07],[0,.001],[.071,.12],[.047,.42],[0,.52],[-.047,.42]],.022),brass,0,.02,side*.142);
        plate.rotation.x=side*.045;
      }
      etching(root,stone,[[.002,.13],[.035,.22],[-.027,.32],[.0,.47]],.159,.012);
      break;
  }
  const wrapped={phoenix:[-.43,.25,.087],turtle:[-.32,.29,.078],qilin:[-.27,.27,.065],flameblade:[-.59,.24,.071],
    windhalberd:[-.36,.35,.058],reaper:[-.30,.34,.068],bell:[-.31,.32,.066]};
  if(wrapped[weapon.id])wrap(root,brass,...wrapped[weapon.id]);
  return root;
}

const up=new T.Vector3(0,1,0);
const stringDirection=new T.Vector3();

export function shapeBow(root,pull,nocked) {
  const bow=root.userData.bow;
  if (!bow) return;
  const draw=Math.round(pull*96)/96;
  if (draw===bow.draw&&nocked===bow.nocked) return;
  bow.draw=draw;
  bow.nocked=nocked;
  const {position,rest,string,arrow,tips}=bow;
  for (let index=0;index<position.count;index++) {
    const i=index*3;
    const y=rest[i+1];
    const bend=Math.min(1,Math.abs(y)/.81)**2;
    position.setXYZ(index,rest[i]+draw*.133*bend,y*(1-draw*.075),rest[i+2]);
  }
  position.needsUpdate=true;
  const nock=.061+draw*.59;
  for (const [index,sign] of [-1,1].entries()) {
    const x=.061+draw*.133,y=sign*(.813-draw*.061);
    const strand=string[index];
    strand.position.set((nock+x)*.5,y*.5,0);
    stringDirection.set(x-nock,y,0);
    strand.scale.y=stringDirection.length();
    strand.quaternion.setFromUnitVectors(up,stringDirection.normalize());
    tips[index].position.set(x-.018,sign*(.79-draw*.059),0);
  }
  arrow.position.set(nock-.36,0,.015);
  arrow.visible=nocked;
}

export function disposeForge(group) {
  const materials = new Set();
  group.traverse(mesh=>{
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    materials.add(mesh.material);
  });
  for (const material of materials) material.dispose();
}
