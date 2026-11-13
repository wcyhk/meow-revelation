export const damageRows=[
  ['basic','普攻','warm'],['skill','神器技能','cool'],['link','接技','violet'],
  ['blessing','祝福追加','gold'],['counter','場地反制','green'],['support','其他','neutral'],
];

const number=new Intl.NumberFormat('zh-HK',{maximumFractionDigits:1});

export class PracticeDamage {
  constructor(){
    this.amounts=new Map(damageRows.map(([id])=>[id,{damage:0,hits:0}]));
    this.total=0;
    this.revision=0;
  }

  record(source,before,after){
    const loss=before-Math.max(0,after);
    if(!(loss>0))return;
    const entry=this.amounts.get(source)??this.amounts.get('skill');
    entry.damage+=loss;
    entry.hits++;
    this.total+=loss;
    this.revision++;
  }

  label(){return number.format(this.total);}
}

export function damageReport(result){
  const report=document.createElement('section');
  report.className='practice-damage-report';
  const total=document.createElement('strong');
  total.className='practice-damage-total';
  total.textContent='總傷害 '+result.label();
  report.append(total);
  for(const [id,label,tone] of damageRows){
    const {damage,hits}=result.amounts.get(id);
    if(id==='support'&&!hits)continue;
    const row=document.createElement('div');
    row.className='practice-damage-row';
    row.dataset.damage=id;
    row.dataset.tone=tone;
    const percent=result.total?damage/result.total:0;
    const name=document.createElement('span');
    name.textContent=label;
    const value=document.createElement('b');
    value.textContent=number.format(damage);
    const meta=document.createElement('small');
    meta.textContent=hits+' 擊 · '+number.format(percent*100)+'%';
    const bar=document.createElement('i');
    bar.style.setProperty('--damage-share',percent);
    bar.setAttribute('aria-hidden','true');
    row.append(name,value,meta,bar);
    report.append(row);
  }
  const notes=document.createElement('p');
  notes.textContent='合計頭目同援兵實際扣血。祝福追加只計獨立觸發嘅傷害，祝福提高嘅面板數值已計入原招。';
  report.append(notes);
  return report;
}
