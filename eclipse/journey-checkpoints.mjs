export const chapterBreak=50;
export const isCheckpoint=floor=>Number.isInteger(floor)&&floor>=10&&floor<100&&floor%10===0;
const key='meow.journey-checkpoints.v1';
const modes=new Set(['vigil','blood','abyss']);
const numeric=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const textList=value=>Array.isArray(value)&&value.length<=150&&value.every(part=>typeof part==='string');
const floorList=value=>value===undefined||(Array.isArray(value)&&value.length<=100
  &&value.every(floor=>Number.isInteger(floor)&&floor>=1&&floor<=100));
const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
const pairs=(value,check)=>record(value)&&Object.values(value).every(check);
const valid=entry=>record(entry)&&isCheckpoint(entry.floor)&&modes.has(entry.difficulty)
  &&typeof entry.weapon==='string'&&textList(entry.relics)&&textList(entry.hunted)
  &&['routeSeed','arenaSeed'].every(name=>numeric(entry[name],0,0xffffffff))
  &&['hp','ms','kills','redraws'].every(name=>numeric(entry[name]))
  &&entry.hp>0&&pairs(entry.flags,value=>typeof value==='string')&&pairs(entry.training,value=>numeric(value,0,25))
  &&Array.isArray(entry.journal)&&entry.journal.length<=20&&entry.journal.every(row=>record(row)
    &&['title','record','chapter'].every(name=>typeof row[name]==='string'))
  &&textList(entry.skills)&&floorList(entry.relicDetours)&&floorList(entry.rewardedFloors);

export class JourneyCheckpoints {
  constructor(storage){
    this.storage=storage;
    this.data={latest:null,chapterTwo:null};
    this.refresh();
  }

  refresh(){
    try{
      const raw=JSON.parse(this.storage.getItem(key)??'null');
      if(raw?.version!==1)return;
      this.data={latest:valid(raw.latest)?raw.latest:null,
        chapterTwo:valid(raw.chapterTwo)&&raw.chapterTwo.floor===chapterBreak?raw.chapterTwo:null};
    }catch { /* Local storage may be unavailable. In-session saves still work. */ }
  }

  save(entry){
    if(!valid(entry))return false;
    this.refresh();
    const {latest,chapterTwo}=this.data;
    const data={
      latest:!latest||entry.floor>=latest.floor ? entry : latest,
      chapterTwo:entry.floor===chapterBreak ? entry : chapterTwo,
    };
    this.data=data;
    try{this.storage.setItem(key,JSON.stringify({version:1,...data}));return true;}
    catch{return false;}
  }
}

export function chapterStage(stage,reprise){
  if(!reprise||stage.floor!==100)return stage;
  return {...stage,guardian:{...stage.guardian,name:'斷誓王冠',signature:'亡約回響',effect:'void',tint:0xd3bbff,
    chapterTrial:true,attacks:['gravefan','gravity','toll','lance','prison','blink','eclipse','cinders'],
    finishing:'gravefan',moveLabels:{...stage.guardian.moveLabels,gravefan:'亡約回響'}}};
}
