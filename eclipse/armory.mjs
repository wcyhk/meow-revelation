import * as T from '../three.min.mjs';

export const arms = [
  {id:'tiger', name:'白虎之聖輪', mark:'✧', tone:0xece7c5, ink:'#f1ddb2', role:'近身 · 高機動',
    attack:'風刃', basic:'近身快斬，第三擊掃及四周。', skill:'如虎添翼',
    detail:'化為風刃向前突襲，穿過敵人時造成傷害，途中可避開攻擊。',
    damage:18,reach:2.35,period:.22,delay:.052,cooldown:5.4,range:6.5,power:57},
  {id:'dragon', name:'青龍之聖珠', mark:'ϟ', tone:0x80c8ff, ink:'#b1e0ff', role:'遠程 · 連鎖',
    attack:'流雷', basic:'雷擊可跳至附近另一個目標。', skill:'天衣雷陣',
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
    attack:'地角', basic:'直線重刺可貫穿敵人，第三擊擊退。', skill:'潛能漩渦',
    detail:'在前方留下吸引敵人的漩渦。漩渦持續時，重刺傷害提高。',
    damage:30,reach:3.27,period:.39,delay:.105,cooldown:7,range:4.3,power:25},
];

function materials(weapon) {
  return {
    brass: new T.MeshStandardMaterial({color:0xc59350,metalness:.47,roughness:.36}),
    dark: new T.MeshStandardMaterial({color:0x302722,metalness:.32,roughness:.62}),
    stone: new T.MeshStandardMaterial({color:weapon.tone,metalness:.29,roughness:.32,emissive:weapon.tone,emissiveIntensity:.19}),
    ivory: new T.MeshStandardMaterial({color:0xf7d8a4,roughness:.56}),
  };
}

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

export function armLighting(scene) {
  scene.add(new T.HemisphereLight(0xffedc9,0x6a4550,2.05));
  const light = new T.DirectionalLight(0xffecd4,2.18);
  light.position.set(-3,6,6);
  scene.add(light);
  const edge = new T.DirectionalLight(0x82badb,1.26);
  edge.position.set(4,-2,-3);
  scene.add(edge);
}

export function forge(weapon) {
  const root = new T.Group();
  const {brass,dark,stone,ivory} = materials(weapon);
  switch (weapon.id) {
    case 'tiger':
      ring(root,.42,.066,dark,0,14);
      ring(root,.49,.035,ivory,0,14);
      ring(root,.33,.023,brass,0,14);
      piece(root,new T.BoxGeometry(.67,.09,.11),dark).rotation.z=.53;
      for (let i=0;i<4;i++) {
        const spur=piece(root,blade([[0,.35],[-.10,.45],[.11,.64],[.12,.45]],.06),stone);
        spur.rotation.z=i*Math.PI/2+.23;
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
      break;
    case 'qilin':
      piece(root,new T.CylinderGeometry(.057,.075,1.19,7),dark,0,-.34);
      piece(root,new T.CylinderGeometry(.088,.095,.065,8),brass,0,-.87);
      piece(root,new T.CylinderGeometry(.19,.12,.12,8),brass,0,.23);
      piece(root,blade([[-.11,.18],[-.23,.38],[-.21,.68],[.10,1.04],[.06,.77],[.19,.63],[.12,.30]],.115),ivory);
      piece(root,blade([[-.057,.25],[-.14,.44],[-.12,.65],[.08,.98],[.017,.70],[.10,.56],[.075,.32]],.134),stone);
      break;
  }
  return root;
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
