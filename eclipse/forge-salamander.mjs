import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const sweep=(k,joint,finish,points,steps=12)=>k.sculpt.sweep(joint,finish,points,{steps,sides:7,ridge:.16});
const plate=(k,joint,finish,points,depth)=>k.sculpt.plate(joint,finish,points,depth,.016);

export function forgeSalamanderHead(k,head,jaw,mobile){
  head.name='鑄火螈將 · 爐渣頭骨';
  jaw.name='鑄火螈將 · 炭火下顎';
  k.geometry(head,'deep',sculptVolume([[0,-.085,.35,.208,.089],[0,-.041,.204,.307,.172],
    [0,.09,.047,.352,.233],[0,.176,-.151,.295,.215],[0,.139,-.381,.183,.126]],
    {sides:mobile?15:23,rings:mobile?20:27,section:2.51,ridge:.26}));
  k.geometry(jaw,'deep',sculptVolume([[0,-.018,.22,.212,.076],[0,-.075,.136,.293,.128],
    [0,-.062,-.044,.288,.116],[0,.024,-.176,.169,.096]],
    {sides:14,rings:17,section:2.06,ridge:.16}));
  const fins=[];
  for(const side of sides){
    const mirror=path=>path.map(([x,...rest])=>[side*x,...rest]);
    plate(k,head,'edge',mirror([[.018,.118,.359],[.172,.189,.288],[.316,.224,.073],
      [.388,.145,-.036],[.319,.108,.141],[.221,.059,.243],[.092,.05,.370]]),.050);
    plate(k,head,'body',mirror([[.036,-.016,.381],[.199,.006,.326],[.344,.073,.163],
      [.367,-.083,.086],[.272,-.112,.22],[.14,-.115,.356]]),.066);
    sweep(k,head,'glow',mirror([[.031,.060,.383,.010],[.145,.069,.339,.013],[.196,.082,.305,.016],
      [.239,.093,.257,.010],[.305,.121,.216,.004]]));
    k.mesh(head,'gem','glow',side*.211,.095,.308,.032,.025,.016,0,side*.49,side*.11);
    sweep(k,head,'trim',mirror([[.290,.166,.096,.082],[.383,.275,-.113,.107],[.441,.408,-.277,.077],
      [.482,.515,-.464,.033],[.430,.536,-.573,.005]]),mobile?18:24);
    sweep(k,jaw,'edge',mirror([[.104,-.078,.239,.045],[.238,-.089,.148,.061],[.304,-.054,-.021,.062],
      [.299,.003,-.168,.017]]));
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?3:5),x=.145+t*.130,z=.255-t*.348;
      sweep(k,jaw,'trim',mirror([[x,-.029,z,.028],[x+.012,.058,z+.017,.019],[x+.022,.09+.014*Math.cos(i*1.4),z+.04,.003]]),7);
    }
    for(let i=0;i<3;i++){
      const fin=k.bone(head,side*(.276-i*.022),.108-i*.091,-.095-i*.044);
      fin.name='鑄火螈將 · 排火鰓';
      const path=mirror([[0,-.032,.097],[.138,.022,-.018],[.268,.111-i*.026,-.203],
        [.298,.064-i*.037,-.364],[.193,-.091,-.266],[.068,-.087,-.027]]);
      plate(k,fin,i===0?'edge':'body',path,.042);
      sweep(k,fin,'trim',path.slice(1,4).map(([x,y,z])=>[x,y+.024,z+.010,.016]));
      sweep(k,fin,'glow',mirror([[.032,-.011,.045,.009],[.141,.032-i*.014,-.077,.017],
        [.222,.065-i*.019,-.202,.010],[.267,.063-i*.03,-.310,.002]]),10);
      fins.push({joint:fin,axis:'y',amp:.14+i*.050,bias:side*.085,seed:side+i*.84});
    }
  }
  return fins;
}

export function forgeSalamanderTail(k,tail,mobile){
  const armature=[tail];
  tail.name='鑄火螈將 · 熔甲尾節 1';
  for(let i=1;i<5;i++){
    const bone=k.bone(armature[i-1],i*.012,.005+i*.014,-.235);
    bone.name='鑄火螈將 · 熔甲尾節 '+(i+1);
    armature.push(bone);
  }
  for(const [i,bone] of armature.entries()){
    const w=.205-i*.038,last=i===armature.length-1;
    k.geometry(bone,'deep',sculptVolume([[0,.017,.118,w*.86,w*.67],[0,.036,-.014,w,w*.89],
      [0,.035,-.141,w*.91,w*.74],[0,.067,last?-.359:-.26,last?.005:w*.72,last?.004:w*.60]],
      {sides:mobile?9:15,rings:mobile?10:17,section:2.45,ridge:.17}));
    for(const side of sides){
      const s=x=>side*x;
      const edge=[[s(w*.18),w*.83,.103],[s(w*.88),w*.66,.06],[s(w*1.1),w*.15,-.027],
        [s(w*.82),-w*.23,-.128],[s(w*.45),w*.51,-.192],[s(w*.09),w*1.12,-.062]];
      plate(k,bone,'edge',edge,.029);
      sweep(k,bone,'glow',[[s(w*.14),w*.95,.012,.008],[s(w*.62),w*.74,-.025,.012],
        [s(w*.84),w*.42,-.088,.007],[s(w*.48),w*.29,-.148,.002]],9);
    }
    sweep(k,bone,'trim',[[0,w*.84,.07,.033],[w*.15,w*1.36,-.051,.052],
      [w*.33,w*2.27,-.135,.025],[w*.43,w*2.42,-.201,.004]],11);
  }
  return armature.slice(1).map((joint,i)=>({joint,axis:'y',amp:.14+i*.05,bias:.017,seed:i*.92,stride:true}));
}

export function forgeSalamanderLimb(k,{upper,shin,foot,side,hip,front},mobile,flaps){
  const m=p=>p.map(([x,...rest])=>[side*x,...rest]);
  const skin=(j,material,p,rings,sides)=>k.geometry(j,material,sculptVolume(m(p),{
    rings:mobile?Math.max(8,rings-5):rings,sides:mobile?Math.max(7,sides-4):sides,
    section:front?2.51:2.20,ridge:.23,
  }));
  skin(upper,'deep',[[.012,.11,-.033,.169,.176],[.074,.018,-.003,.227,.211],
    [.08,-.114,.033,.231,.188],[.052,-.278,.067,.167,.138],[.041,-hip*.51,.099,.115,.116]],17,14);
  skin(shin,'body',[[0,.056,-.020,.144,.137],[.041,-.047,.051,.149,.140],
    [.049,-.168,.048,.121,.134],[.042,-.264,.036,.099,.113],[.020,-hip*.53,.026,.085,.101]],16,13);
  skin(foot,'deep',[[0,-.004,-.108,.117,.079],[.019,-.021,-.010,.162,.088],
    [.018,-.038,.075,.171,.092],[.019,-.055,.167,.128,.075],[.022,-.057,.213,.097,.058]],15,13);
  const track=front?[[.014,.06,.131],[.092,-.004,.148],[.166,.03,.095],[.188,-.069,-.004],
    [.123,-.227,.065],[.064,-.294,.142],[-.042,-.169,.191],[-.044,-.066,.17]]:
    [[.011,.079,-.129],[.086,.072,-.115],[.156,.003,-.078],[.170,-.128,.022],
      [.104,-.280,.077],[.045,-.297,-.044],[-.062,-.228,-.063],[-.085,-.077,-.11]];
  plate(k,shin,'edge',m(track),.052);
  sweep(k,shin,'trim',m(track.slice(0,5).map(([x,y,z],i)=>[x+.017,y,z+(front?.023:-.023),[.007,.016,.022,.018,.004][i]])),12);
  for(const facet of [-1,1]){
    const z=facet*(front?.105:.128);
    sweep(k,shin,'deep',m([[.019,.123,z,.037],[.116,.036,z+.018,.047],[.113,-.157,z-.004,.030],
      [.076,-.267,z+.008,.018]]),10);
    sweep(k,shin,'glow',m([[.102,.045,z+.028,.009],[.119,-.111,z+.02,.016],
      [.089,-.237,z+.027,.005]]),10);
  }
  for(let i=-1;i<=1;i++){
    const toe=k.bone(foot,i*.108,-.057,.13-i*i*.021);
    toe.name='鑄火螈將 · 蹄爪 '+i;
    skin(toe,'edge',[[0,.031,-.043,.071,.064],[i*.019,.014,.024,.082,.065],
      [i*.032,-.032,.097,.066,.05],[i*.044,-.056,.163,.012,.014]],11,10);
    sweep(k,toe,'trim',m([[0,.042,-.023,.018],[i*.024,.058,.051,.023],
      [i*.036,-.012,.127,.017],[i*.041,-.059,.167,.003]]),9);
    flaps.push({joint:toe,axis:'x',amp:.099+Math.abs(i)*.015,bias:.015,seed:(front?1.13:2.82)+i*.54+side*.69,
      stride:true});
  }
}

export function forgeSalamanderWard(k,body,legs,mobile){
  const flaps=[];
  for(const [i,upper] of legs.entries()){
    const side=Math.sign(upper.position.x);
    const front=upper.position.z>0;
    const piston=k.bone(upper,side*.135,.029,.018);
    piston.name='鑄火螈將 · 關節護甲';
    const s=x=>side*x;
    for(let row=0;row<3;row++){
      const y=.141-row*.102,z=front?.040:-.053;
      plate(k,piston,row===1?'trim':'edge',[[s(-.084),y+.014,z+.13],[s(.015),y+.093,z+.106],
        [s(.137),y+.052,z-.011],[s(.15),y-.027,z-.098],[s(.012),y-.071,z-.116],
        [s(-.065),y-.045,z+.019]],.036);
      sweep(k,piston,'deep',[[s(.039),y+.048,z+.087,.014],[s(.146),y+.027,z-.011,.018],
        [s(.166),y-.028,z-.068,.008]],8);
    }
    const rivet=k.bone(piston,s(.161),-.070,-.004);
    rivet.rotation.y=side*Math.PI/2;
    k.mesh(rivet,'ring','trim',0,0,0,.093,.093,.57);
    k.mesh(rivet,'gem','glow',0,0,.002,.04,.043,.019);
    const upperRing=k.bone(body,upper.position.x*.916,.297,upper.position.z*.94);
    for(let row=0;row<(mobile?3:5);row++){
      const z=.162-row*.093;
      sweep(k,upperRing,row===0?'trim':'edge',[[s(.009),.102,z+.026,.021],[s(.115),.063,z,
        .035],[s(.18),-.056,z-.051,.034],[s(.186),-.169,z-.073,.014]],10);
      sweep(k,upperRing,'glow',[[s(.121),.066,z,.006],[s(.169),-.023,z-.034,.011],
        [s(.183),-.109,z-.056,.004]],8);
    }
    flaps.push({joint:piston,axis:'x',amp:.091,bias:.06,seed:i*1.9,stride:true});
  }
  return flaps;
}
