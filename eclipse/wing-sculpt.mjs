import {featherVane,sculptVolume,wingWeb} from './sculpt-volume.mjs?v=sculpted-1';

const mirror=(side,points)=>points.map(([x,y,z,...rest])=>[side*x,y,z,...rest]);

export function articulatedWing(k,body,side,{winged,membranous,insect,poison,dark,seed}){
  const root=k.bone(body,side*.31,.40,0);
  const elbow=k.bone(root,side*(insect?.49:.68),winged?.33:.51,-.115);
  const hand=k.bone(elbow,side*(insect?.36:.64),winged?.14:.26,-.071);
  const sweep=(part,finish,points,axis='x')=>k.geometry(part,finish,sculptVolume(mirror(side,points),{
    axis,section:2.2,sides:9,rings:13,ridge:.14,seed:seed*.31,
  }));
  const vane=(part,finish,points,width,i)=>k.geometry(part,finish,featherVane(...mirror(side,points),width,i+seed,9));
  sweep(root,'body',[[0,.00,0,.172,.112],[.202,.148,-.042,.151,.097],[.51,.367,-.088,.110,.070],
    [insect?.56:.70,insect?.52:.51,-.115,.087,.067]]);
  sweep(elbow,'deep',[[0,0,0,.117,.085],[.21,.119,-.015,.113,.069],[.45,.173,-.034,.098,.048],
    [insect?.38:.68,insect?.16:.235,-.069,.063,.054]]);
  if(membranous){
    const extent=poison?1.27:insect?.73:1;
    const lower=[
      [[0,.015,.003],[.36,.204,-.076],[.68,.50,-.115]],
      [[0,.015,.003],[.36,-.038,-.125],[.49,-.46,-.26]],
      [[0,.015,.003],[.20,-.18,-.090],[.26,-.57,-.21]],
    ].map(path=>path.map(([x,y,z])=>[x*(insect?.76:1),y*(insect?.67:1),z]));
    const upper=[
      [[.00,.00,0],[.36,.25,-.034],[1.22,.21,-.211]],
      [[.00,.00,0],[.61,.068,-.10],[1.29,-.427,-.295]],
      [[.00,.00,0],[.45,-.21,-.12],[.99,-.668,-.28]],
      [[.00,.00,0],[.27,-.29,-.103],[.62,-.65,-.235]],
      [[.00,.00,0],[.073,-.285,-.114],[.29,-.53,-.185]],
    ].map(path=>path.map(([x,y,z])=>[x*extent,y*(insect?.58:1),z]));
    k.geometry(root,'wingSkin',wingWeb(lower,side,seed));
    k.geometry(elbow,'wingSkin',wingWeb(upper,side,seed+7));
    for(const [index,digit] of upper.entries()){
      const line=digit.map(([x,y,z],i)=>[x,y,z,i===0?.066:i===1?.043:.006,i===0?.069:i===1?.035:.005]);
      sweep(elbow,index%2?'edge':'body',line);
      sweep(elbow,'trim',line.map(([x,y,z,w,h])=>[x,y+.026,z+.036,w*.35,h*.33]));
    }
    for(const [index,digit] of lower.entries()){
      sweep(root,index?'body':'edge',digit.map(([x,y,z],i)=>[x,y,z,i===0?.084:i===1?.044:.012,i===0?.073:i===1?.035:.006]));
    }
    sweep(hand,'edge',[[0,.006,0,.081,.052],[.166,.114,-.031,.063,.042],
      [.279,.041,-.097,.026,.028],[.309,-.089,-.12,.003,.006]]);
    sweep(hand,'trim',[[.027,.028,.035,.027,.019],[.173,.091,.01,.039,.02],[.233,.048,-.032,.01,.013]]);
  }else{
    for(let i=0;i<9;i++){
      const x=.12+i*.060,y=.24-i*.012;
      vane(root,i%2?'body':'edge',[[x,y,.012],[x+.20,y-.204,-.13],[x+.35,y-.46,-.34]],.091,i);
      if(i%2===0)vane(root,'deep',[[x-.052,y-.02,-.022],[x+.11,y-.181,-.24],[x+.32,y-.41,-.39]],.069,i+15);
    }
    for(let i=0;i<9;i++){
      const u=i/8,x=u*.43,y=u*.13;
      vane(elbow,i%3===0?'trim':dark?'deep':'body',
        [[x,y,.023],[x+.28,y-.251,-.143],[x+.46+u*.17,y-.60+u*.18,-.36-u*.04]],.121,i+11);
    }
    for(let i=0;i<11;i++){
      const u=i/10,x=u*.28,y=u*.14;
      vane(hand,i%3===0?'edge':dark?'deep':'body',
        [[x,y,.016],[x+.231+u*.16,y-.27+u*.13,-.18],[x+.394+u*.46,y-.60+u*.63,-.43+u*.102]],.132,i+29);
    }
  }
  return {root,elbow,hand,side,membranous};
}
