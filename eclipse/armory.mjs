import * as T from '../three.min.mjs';
import {nightArms} from './nightfall-arms.mjs?v=nightfall-1';
import {forgedMaterials} from './forge-materials.mjs?v=sculpted-1';
import {huntArms} from './relic-arsenal.mjs?v=weapon-audit-1';
import {buildWeapon,disposeWeapon,shapeBow} from './weapon-forge.mjs?v=sculpted-1';

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

export {shapeBow};

export function armLighting(scene,field=false) {
  scene.add(new T.HemisphereLight(field?0xe5e2ee:0xfff2d9,field?0x64566f:0x66516d,field?1.20:2.02));
  const key=new T.DirectionalLight(0xffeaca,field?1.10:2.59);
  key.position.set(-3,6,5);
  scene.add(key);
  const rim=new T.DirectionalLight(0xa6c7ee,field?.78:2.25);
  rim.position.set(3,-1,-4);
  scene.add(rim);
  if(!field){
    const fill=new T.DirectionalLight(0xd2dbec,1.08);
    fill.position.set(4,1,4);
    scene.add(fill);
  }
}

export function forge(weapon) {
  return buildWeapon(weapon,forgedMaterials(weapon));
}

export const disposeForge=disposeWeapon;
