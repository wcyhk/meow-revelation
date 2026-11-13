export const training = [
  {id:'vitality', name:'負燈鍛體', mark:'✚', costs:[35,65,105], detail:'每級增加 10 點最大生命。'},
  {id:'edge', name:'鍛刃', mark:'⚔', costs:[45,85,130], detail:'每級提高 5% 普攻傷害。'},
  {id:'focus', name:'聚息', mark:'◈', costs:[50,90,140], detail:'每級縮短 5% 神器技能冷卻。'},
];

export const techniques = [
  {id:'stride', name:'閃身步', mark:'»', cost:95, detail:'普通翻滾距離加長 18%，冷卻縮短 10%。'},
  {id:'ward', name:'思念護符', mark:'◇', cost:120, detail:'每層第一次受傷減傷 45%。'},
];

export const branches = [
  {id:'tech', name:'科技', tint:'#a9e3ee', skills:[
    {id:'robot-squad',name:'機械人小隊',cost:180,detail:'三台機械人跟隨你，自動發射遠程火箭、近程衝鋒槍同中程機槍。'},
    {id:'radar',name:'搜敵雷達',cost:140,detail:'持續標示視野內敵人嘅腳下位置，提燈熄滅時仍然可見。'},
    {id:'medic',name:'召喚急救小隊',cost:220,detail:'每次挑戰可用一次。受到致命傷害時原地復活，回滿生命。'},
  ]},
  {id:'mystic',name:'神祕',tint:'#e4b8ef',skills:[
    {id:'cthun-hand',name:'克蘇恩之手',cost:180,detail:'三條背生觸手自動出擊。黑色近掃、紅色穿刺、紫色遠處破地。'},
    {id:'veil',name:'月影護身',cost:135,detail:'翻滾結束後 2 秒內，下一次受傷減少 30%，冷卻 8 秒。'},
    {id:'funeral-seal',name:'送魂祭印',cost:190,detail:'擊倒敵人會留下延時祭印，爆發時傷害附近敵人，冷卻 5 秒。'},
  ]},
];

export function hasBranch(data,id) {
  return branches.find(branch=>branch.id===id)?.skills.some(skill=>data.branchSkills.includes(skill.id))??false;
}

export const moonlessTitle={id:'moonless',name:'無月歸名者',tint:'#bcdfff'};
export const moonlessLantern={id:'moonless',name:'無月引魂燈',tint:'#bcdfff',detail:'完成無月第 100 關並敲響歸名鐘。'};

export const lanterns = [
  {id:'original', name:'守燈籠', tint:'#ffa65f', detail:'守燈貓在入口領到的第一盞燈。'},
  {id:'crimson', name:'緋焰燈', tint:'#ff6e65', detail:'通過血月第 50 關永久解鎖。'},
  moonlessLantern,
];

export const milestones = {
  vigil:[],
  blood:[
    {floor:25, id:'redraw', name:'血月重抽', detail:'獲得一次重抽祝福，可留待本次挑戰後面使用。'},
    {floor:50, id:'crimson', name:'緋焰燈', detail:'永久解鎖緋紅燈焰，可喺訓練所換上。'},
  ],
  abyss:[
    {floor:75, id:'twins', name:'雙頭目遺贈', detail:'打低雙頭目後，額外揀一份祝福，或者將現有祝福換成另一流派。'},
    {floor:100, id:'moonless', name:moonlessLantern.name+'與'+moonlessTitle.name, detail:moonlessLantern.detail},
  ],
};

const storageKey='meow-revelation.eclipse.profile.v1';
const integer=(value,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;

export function lanternUnlocked(data,id) {
  if (id==='crimson') return data.crimson;
  if (id===moonlessLantern.id) return data.records.abyss.fastest!==null;
  return id==='original';
}

function normalize(raw) {
  const unlocked=Array.isArray(raw?.techniques)?raw.techniques:[];
  const owned=techniques.filter(item=>unlocked.includes(item.id)).map(item=>item.id);
  const learned=Array.isArray(raw?.branchSkills)?raw.branchSkills:[];
  const crimson=raw?.crimson===true;
  const records=Object.fromEntries(Object.keys(milestones).map(mode=>{
    const old=raw?.records?.[mode];
    return [mode,{cleared:integer(old?.cleared,100),reached:integer(old?.reached,100),fastest:integer(old?.fastest)||null}];
  }));
  const data={
    gold:integer(raw?.gold),
    training:Object.fromEntries(training.map(item=>[item.id,integer(raw?.training?.[item.id],item.costs.length)])),
    techniques:owned,
    technique:owned.includes(raw?.technique)?raw.technique:null,
    branchSkills:branches.flatMap(branch=>branch.skills.filter(skill=>learned.includes(skill.id)).map(skill=>skill.id)),
    crimson,
    records,
  };
  data.lantern=lanternUnlocked(data,raw?.lantern)?raw.lantern:'original';
  data.branch=hasBranch(data,raw?.branch)?raw.branch:null;
  data.title=raw?.title===moonlessTitle.id&&records.abyss.fastest!==null?raw.title:null;
  return data;
}

export class Progression {
  constructor() {
    this.data=this.read()??normalize();
  }

  read() {
    try {
      const saved=localStorage.getItem(storageKey);
      return saved?normalize(JSON.parse(saved)):null;
    } catch {
      return null;
    }
  }

  refresh() {
    this.data=this.read()??this.data;
  }

  change(edit) {
    this.refresh();
    const result=edit(this.data);
    try {localStorage.setItem(storageKey,JSON.stringify(this.data));} catch { /* Keep progress in memory when storage is unavailable. */ }
    return result;
  }

  reach(mode,floor) {
    if (floor<=(this.data.records[mode]?.reached??0)) return;
    this.change(data=>{data.records[mode].reached=Math.max(data.records[mode].reached,floor);});
  }

  clear(mode,floor,gold,unlockCrimson) {
    return this.change(data=>{
      const record=data.records[mode];
      record.reached=Math.max(record.reached,floor);
      record.cleared=Math.max(record.cleared,floor);
      data.gold+=gold;
      if (!unlockCrimson||data.crimson) return false;
      data.crimson=true;
      data.lantern='crimson';
      return true;
    });
  }

  win(mode,milliseconds) {
    return this.change(data=>{
      const record=data.records[mode];
      const firstMoonlessWin=mode==='abyss'&&record.fastest===null;
      if (!record.fastest||milliseconds<record.fastest) record.fastest=Math.max(1,milliseconds);
      return firstMoonlessWin;
    });
  }

  train(id) {
    const item=training.find(entry=>entry.id===id);
    if (!item) return false;
    return this.change(data=>{
      const level=data.training[id];
      const cost=item.costs[level];
      if (cost===undefined||data.gold<cost) return false;
      data.gold-=cost;
      data.training[id]++;
      return true;
    });
  }

  equipTechnique(id) {
    const item=techniques.find(entry=>entry.id===id);
    if (!item) return false;
    return this.change(data=>{
      if (!data.techniques.includes(id)) {
        if (data.gold<item.cost) return false;
        data.gold-=item.cost;
        data.techniques.push(id);
      }
      data.technique=data.technique===id?null:id;
      return true;
    });
  }

  learnBranchSkill(id) {
    const branch=branches.find(entry=>entry.skills.some(skill=>skill.id===id));
    const skill=branch?.skills.find(entry=>entry.id===id);
    if (!skill) return false;
    return this.change(data=>{
      if (data.branchSkills.includes(id)||data.gold<skill.cost) return false;
      data.gold-=skill.cost;
      data.branchSkills.push(id);
      data.branch??=branch.id;
      return true;
    });
  }

  equipBranch(id) {
    return this.change(data=>{
      if (id!==null&&!hasBranch(data,id)) return false;
      data.branch=id;
      return true;
    });
  }

  equipLantern(id) {
    return this.change(data=>{
      if (!lanternUnlocked(data,id)) return false;
      data.lantern=id;
      return true;
    });
  }

  toggleTitle() {
    return this.change(data=>{
      if (data.records.abyss.fastest===null) return false;
      data.title=data.title===moonlessTitle.id?null:moonlessTitle.id;
      return true;
    });
  }
}

export function floorGold(stage) {
  return (7+Math.floor((stage.floor-1)/5)+(stage.boss?12:0))*stage.difficulty.gold;
}

export function formatTime(seconds) {
  const total=Math.floor(seconds);
  return Math.floor(total/60)+':'+String(total%60).padStart(2,'0');
}
