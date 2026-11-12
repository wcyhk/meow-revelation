export const training = [
  {id:'vitality', name:'負燈鍛體', mark:'✚', costs:[35,65,105], detail:'每級增加 10 點最大生命。'},
  {id:'edge', name:'鍛刃', mark:'⚔', costs:[45,85,130], detail:'每級提高 5% 普攻傷害。'},
  {id:'focus', name:'聚息', mark:'◈', costs:[50,90,140], detail:'每級縮短 5% 神器技能冷卻。'},
];

export const techniques = [
  {id:'stride', name:'追影步', mark:'»', cost:95, detail:'普通翻滾距離加長 18%，冷卻縮短 10%。'},
  {id:'ward', name:'藏火護符', mark:'◇', cost:120, detail:'每層第一次受傷減傷 45%。'},
];

export const lanterns = [
  {id:'original', name:'守燈籠', tint:'#ffa65f'},
  {id:'crimson', name:'緋焰燈', tint:'#ff6e65'},
];

export const milestones = {
  vigil:[],
  blood:[
    {floor:25, id:'redraw', name:'血月重抽', detail:'獲得一次重抽祝福，可留待本次挑戰後面使用。'},
    {floor:50, id:'crimson', name:'緋焰燈', detail:'永久解鎖緋紅燈焰，可喺訓練所換上。'},
  ],
  abyss:[{floor:75, id:'twins', name:'雙頭目遺贈', detail:'打低雙頭目後，額外揀一份祝福，或者將現有祝福換成另一流派。'}],
};

const storageKey='meow-revelation.eclipse.profile.v1';
const integer=(value,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;

function normalize(raw) {
  const unlocked=Array.isArray(raw?.techniques)?raw.techniques:[];
  const owned=techniques.filter(item=>unlocked.includes(item.id)).map(item=>item.id);
  const crimson=raw?.crimson===true;
  const records=Object.fromEntries(Object.keys(milestones).map(mode=>{
    const old=raw?.records?.[mode];
    return [mode,{cleared:integer(old?.cleared,100),reached:integer(old?.reached,100),fastest:integer(old?.fastest)||null}];
  }));
  return {
    gold:integer(raw?.gold),
    training:Object.fromEntries(training.map(item=>[item.id,integer(raw?.training?.[item.id],item.costs.length)])),
    techniques:owned,
    technique:owned.includes(raw?.technique)?raw.technique:null,
    crimson,
    lantern:crimson&&raw?.lantern==='crimson'?'crimson':'original',
    records,
  };
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
    this.change(data=>{
      const record=data.records[mode];
      if (!record.fastest||milliseconds<record.fastest) record.fastest=Math.max(1,milliseconds);
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

  equipLantern(id) {
    return this.change(data=>{
      if (id!=='original'&&(id!=='crimson'||!data.crimson)) return false;
      data.lantern=id;
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
