export const nightArms=[
  {id:'reaper',name:'冥契骨鐮',mark:'☽',tone:0xb993e8,ink:'#e5c6ff',role:'中距 · 收割',attack:'骨刃',
    basic:'斜割接勾拉，最後橫掃一圈。',skill:'亡契收割',detail:'從遠處拉近敵人，再沿鐮刃橫掃；受創越重嘅敵人受傷越多。',damage:25,reach:3.54,period:.34,cooldown:6.35,range:4.58,power:37},
  {id:'bell',name:'獄鐘法杖',mark:'◈',tone:0x8eead8,ink:'#c2fff1',role:'遠程 · 封場',attack:'鳴鐘',
    basic:'一道鐘鳴接兩道疊聲，最後震退前方成列敵人。',skill:'倒鐘獄',detail:'在目標位置連敲三次，越遲落下嘅鐘聲越遠。',damage:21,reach:5.75,period:.38,cooldown:6.5,range:7.25,power:34},
  {id:'fangs',name:'血月雙刃',mark:'✦',tone:0xff627c,ink:'#ffc1bd',role:'近身 · 突襲',attack:'雙刃',
    basic:'快斬接左右交割，最後衝前貫穿。',skill:'赤影迴身',detail:'先穿過敵群，再反手斬向原路。',damage:20,reach:2.41,period:.23,cooldown:5.6,range:5.5,power:44},
  {id:'cannon',name:'蝕日火銃',mark:'✷',tone:0xff9b53,ink:'#ffdd9d',role:'遠程 · 火力',attack:'銃火',
    basic:'速射、雙發、重炮；彈丸要飛到先命中。',skill:'碎日轟',detail:'三發榴彈會喺瞄準位置附近依次炸開。',damage:24,reach:7.12,period:.37,cooldown:7.1,range:8.5,power:39},
];

export const nightComboData={
  reaper:[['斜骨割','harvest',.083,.307,'arc',{width:1.12,force:.79}],
    ['送葬回勾','hook',.121,.385,'arc',{width:1.20,force:-1.30}],
    ['環棺斬','whirl',.243,.576,'circle',{reach:1.13,width:1.50,force:1.64,step:.15}]],
  bell:[['單鐘','bellTap',.089,.311,'wave',{width:.86,step:0,force:.46}],
    ['疊聲','chord',.118,.414,'wave',{width:1.03,step:0,force:.45,pulses:[{after:0,power:.60},{after:.128,power:.59}]}],
    ['獄門三鳴','shell',.249,.565,'fan',{reach:1.15,width:.99,step:0,force:1.79,chill:1.66}]],
  fangs:[['左牙','rake',.041,.171,'arc',{width:1.00,step:.20}],
    ['雙牙交割','return',.064,.248,'arc',{width:1.30,step:.14,pulses:[{after:0,power:.61},{after:.064,power:.57}]}],
    ['赤月穿心','fangPounce',.167,.395,'line',{reach:1.35,width:.72,step:.70,force:1.60}]],
  cannon:[['爐心彈','firelock',.106,.325,'arrow',{width:.52,step:0,force:.54}],
    ['雙火門','firelock',.140,.404,'arrow',{width:.51,step:0,force:.62,angles:[-.14,.14]}],
    ['日冕炮','firelockHeavy',.307,.620,'arrow',{reach:1.14,width:.92,step:0,force:2.01}]],
};

export const nightLinks={
  reaper:{name:'還契斷魂',pose:'harvest',wind:.11,detail:'將第三擊碰到嘅敵人拉返嚟，再斬向受傷目標。'},
  bell:{name:'閉獄疊鳴',pose:'bellTap',wind:.11,detail:'沿最後一下命中處敲出內外三層鐘聲；中心一擊最重。'},
  fangs:{name:'赤影交刃',pose:'fangPounce',wind:.09,detail:'喺中招敵人兩側留下赤影，從交叉方向追斬。'},
  cannon:{name:'破日引信',pose:'firelockHeavy',wind:.12,detail:'將榴彈直接落喺重炮命中處，兩次爆開。'},
};
