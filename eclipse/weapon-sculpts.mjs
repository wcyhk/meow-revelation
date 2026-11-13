import * as T from '../three.min.mjs';
import {featherVane} from './sculpt-volume.mjs?v=sculpted-1';

const turn=Math.PI*2;

function cutGem(h,axis,finish='body'){
  return h.solid(axis,finish,{sides:10,rings:axis.length*3,section:1.8,ridge:.08});
}

function strap(h,start,end,shape,finish='dark'){
  h.segment(start,end,shape+.12,'trim',shape*.72);
  const middle=start.map((value,i)=>(value+end[i])*.5);
  h.segment(start,middle,shape,finish,shape*.74);
  h.segment(middle,end,shape*.76,finish,shape*.63);
}

function petals(h,center,radius,size,count,finish='edge',rise=.5){
  for(let i=0;i<count;i++){
    const angle=i*turn/count;
    const [x,y,z]=center;
    const c=Math.cos(angle),s=Math.sin(angle);
    const path=[
      [x+c*radius,y+s*radius,z,.12,.09],
      [x+c*(radius+size*.48),y+s*(radius+size*.48),z+rise*.2,size*.29,size*.23],
      [x+c*(radius+size*.86),y+s*(radius+size*.86),z+rise*.6,size*.16,size*.13],
      [x+c*(radius+size),y+s*(radius+size),z+rise,.025,.028],
    ];
    cutGem(h,path,finish);
  }
}

function disk(h,radius,point,depth,finish){
  return h.add(new T.CylinderGeometry(radius*.1,radius*.1,depth*.1,30).rotateX(Math.PI/2),finish,point);
}

function tiger(h){
  const hoop=h.loop([0,0,0],3.77,1.03,'body','xy',48);
  hoop.scale.x=1.19;
  hoop.scale.y=.86;
  for(const side of [-1,1]){
    const lip=h.loop([0,0,side*.79],3.82,.25,'edge','xy',44);
    lip.scale.set(1.18,.86,1);
    const bevel=h.loop([0,0,side*.87],4.23,.18,'trim','xy',42);
    bevel.scale.set(1.18,.85,1);
    for(const sign of [-1,1]){
      cutGem(h,[
        [3.27*sign,-1.13,side*.4,.37,.24],
        [4.28*sign,-1.68,side*.58,.54,.42],
        [5.21*sign,-2.62,side*.67,.34,.26],
        [5.86*sign,-2.92,side*.47,.045,.045],
      ],'edge');
      h.line([[3.04*sign,1,side*.85],[4.12*sign,.72,side*.89],[4.80*sign,-.15,side*.71]],.13,'dark');
    }
  }
  strap(h,[2.24,-3.96,0],[2.24,-2.22,0],.61);
}

function dragon(h){
  h.gem([0,.3,0],4.18,'body',[1,1.05,.88],4);
  h.gem([.72,.87,3.08],2.62,'trim',[1.03,.89,.37],3);
  h.gem([.96,.93,3.87],1.69,'core',[.91,.96,.38],3);
  h.gem([.75,1.01,4.39],1.02,'dark',[.42,1.16,.30],3);
  h.gem([.98,1.58,4.55],.26,'edge',[.92,.74,.27],2);
  for(const side of [-1,1]){
    h.line([[-3.61,1.48,side*1.1],[-2.25,3.09,side*1.38],[.23,3.76,side*.65],[2.49,2.97,side*1.48],[3.64,1.18,side*1.1]],.21,'trim');
    h.line([[-3.02,-2.23,side*1.1],[-1.68,-3.42,side*1.49],[.86,-3.66,side*1.74],[2.68,-2.65,side*1.26]],.31,'dark');
  }
  h.inlay([[-2.75,-1.97],[-1.83,-2.86],[-.52,-2.99],[-.85,-2.23],[-1.82,-1.76]],3,.105,'edge');
}

function phoenix(h){
  cutGem(h,[[-3.9,-2.64,0,.05,.05],[-3.4,-1.43,0,.81,.33],[-2.2,-.74,0,1.51,.72],[-.05,-.62,0,1.91,1.21],[1.48,.1,0,2.27,1.22],[1.37,1.73,0,1.77,.89],[.53,3.08,0,1.26,.76],[-1.0,4.14,0,.42,.31],[-2.34,4.72,0,.038,.038]],'trim');
  cutGem(h,[[.48,1.10,.36,1.32,.64],[2.86,2.38,.28,.81,.40],[4.56,2.72,.15,.18,.12],[5.65,2.35,0,.028,.03]],'edge');
  for(const side of [-1,1]){
    cutGem(h,[[.92,.05,side*.76,.6,.27],[2.8,.62,side*1.42,1.14,.39],[4.54,.26,side*1.9,.56,.34],[5.62,-.83,side*1.82,.035,.03]],'body');
    for(let i=0;i<4;i++){
      cutGem(h,[[.25+i*.4,2.39-i*.42,side*.57,.48,.24],[1.86+i*.38,3.03-i*.51,side*(.72+i*.15),.27,.18],[3.88+i*.43,3.3-i*.65,side*(.57+i*.53),.025,.025]],i===0?'edge':'trim');
    }
    h.gem([-.89,1.93,side*.74],.23,'core',[1,.85,.42],2);
    h.line([[-3.57,-1.4,side*.27],[-2.07,-.71,side*.71],[-.18,-.71,side*1.51],[1.32,-.36,side*.81]],.09,'dark');
  }
  cutGem(h,[[0,-4.51,0,.43,.42],[0,-3.68,0,.52,.46],[-.11,-2.58,0,.56,.46],
    [-.31,-1.93,0,.68,.57],[-.54,-1.25,0,.52,.40]],'trim');
  h.loop([0,-3.54,0],.51,.109,'dark','xz',14);
}

function turtle(h){
  const outline=[-5.8,.41,-3.39,1.93,-2.19,2.01,-.04,4.7,1.76,2.61,3.61,2.32,5.85,.87,3.66,-.18,2.43,-1.82,.05,-3.22,-2.22,-1.62,-3.99,-1.2];
  h.plate(outline,'edge',1.52,[0,0,0],.14);
  h.plate(outline.map((point,i)=>point*(i%2?.80:.83)),'body',2.11,[0,0,0],.18);
  for(const side of [-1,1]){
    h.gem([0,.41,side*1.03],1.64,'trim',[1,1,.43],1);
    for(const sign of [-1,1]){
      cutGem(h,[[sign*.48,.61,side*1.24,.94,.50],[sign*1.73,2.42,side*1.4,.71,.43],[sign*1.93,4.07,side*1.51,.27,.19],[sign*1.68,5.54,side*1.72,.029,.029]],'edge');
      cutGem(h,[[sign*2.03,-.44,side*.5,.63,.32],[sign*3.78,-1.08,side*.62,.49,.28],[sign*4.94,-2.39,side*1.02,.031,.03]],'body');
    }
  }
  strap(h,[0,-3.70,0],[0,-1.98,0],.44);
}

function qilin(h){
  cutGem(h,[[0,-4.31,0,1.36,1.10],[.02,-3.80,0,1.57,1.29],[0,-2.31,0,1.30,1.17],[-.42,-.27,0,1.11,.95],[-1.01,1.63,0,.82,.72],[-1.89,3.61,0,.62,.52],[-2.92,5.15,.16,.34,.26],[-4.80,6.48,.36,.033,.033]],'body');
  const bands=[[0,-3.76,1.44,0],[-.19,-1.67,1.23,-.13],[-.64,.41,1.01,-.28],[-1.35,2.47,.76,-.41],[-2.48,4.48,.49,-.66]];
  for(const [x,y,radius,tilt] of bands){
    const rim=h.loop([x,y,0],radius,.20,'trim','xz',24);
    rim.rotation.z=tilt;
    for(let i=0;i<7;i++){
      const a=i*turn/7;
      h.gem([x+radius*Math.cos(a),y+Math.cos(a)*tilt*.9,radius*Math.sin(a)],.14,'edge',[1,.68,.93],1);
    }
  }
  h.gem([0,-4.22,0],1.21,'dark',[1,.22,1],2);
}

function bell(h){
  const center=[.95,2.82,0];
  disk(h,3.45,center,.58,'body');
  h.loop(center,3.46,.30,'trim','xy',42);
  for(const side of [-1,1]){
    h.loop([.95,2.82,side*.40],2.94,.092,'edge','xy',34);
    h.loop([.95,2.82,side*.51],.63,.145,'trim','xy',24);
    h.gem([.95,2.82,side*.57],.64,'trim',[1,1,.30],2);
    petals(h,[.95,2.82,side*.52],.89,1.84,7,'trim',side*.065);
    for(let i=0;i<7;i++){
      const a=(i+.45)*turn/7;
      h.gem([.95+2.77*Math.cos(a),2.82+2.77*Math.sin(a),side*.50],.22,'edge',[1,1,.43],2);
    }
  }
  h.line([[2.5,-.28,0],[3.69,-1.99,0],[3.33,-3.21,0],[1.62,-3.51,0],[.34,-2.39,0],[.82,-.52,0]],.30,'trim');
  strap(h,[0,-4.95,0],[0,-1.13,0],.35,'body');
  cutGem(h,[[-4.11,-2.65,-.40,.24,.24],[-3.88,-.70,-.37,.34,.31],[-3.56,1.46,-.33,.42,.39],[-3.13,2.59,-.26,.50,.43],[-2.94,2.87,-.23,.13,.12]],'trim');
}

function energyGlobe(h,id){
  const fire=id==='fire-orb';
  const ice=id==='ice-orb';
  const spark=id==='spark-orb';
  if(fire){
    cutGem(h,[[0,-4.04,0,.11,.12],[0,-3.27,0,2.45,1.38],[.23,-1.62,0,3.18,2.20],[.46,.15,0,2.71,1.94],[.09,1.66,0,1.94,1.42],[-.52,3.30,0,1.24,.93],[-.44,4.75,0,.64,.46],[.78,6.25,0,.034,.03]],'body');
    for(let i=0;i<8;i++){
      const a=i*turn/8,cos=Math.cos(a),sin=Math.sin(a);
      cutGem(h,[[cos*2.04,-3.06,sin*1.38,.29,.24],[cos*2.74,-1.16,sin*1.87,.49,.33],[cos*2.39+.30,.58,sin*1.47,.57,.37],[cos*1.59-.55,2.42,sin*1.17,.45,.29],[cos*.82+.20,4.55+i%3*.21,sin*.67,.033,.035]],i%3===0?'edge':'core');
    }
    return;
  }
  h.gem([0,.0,0],ice?3.61:3.23,'body',ice?[.98,1.10,.80]:[1,1.05,.92],3);
  if(ice){
    for(const side of [-1,1]){
      h.loop([0,0,side*2.33],2.57,.12,'trim','xy',36);
      for(let i=0;i<6;i++){
        const a=i*turn/6;
        const c=Math.cos(a),s=Math.sin(a);
        const at=(away,opposite,z)=>[away*c-opposite*s,away*s+opposite*c,z*side];
        h.line([at(.34,0,3.35),at(1.64,0,3.03),at(2.94,0,2.41),at(3.81,0,1.77)],.13,'edge',false);
        for(const sign of [-1,1]){
          h.line([at(1.32,0,3.13),at(2.07,.48*sign,2.93),at(2.46,.51*sign,2.78)],.095,'core',false);
          h.line([at(2.20,0,2.83),at(2.70,.56*sign,2.48),at(2.98,.59*sign,2.39)],.092,'edge',false);
        }
      }
    }
    return;
  }
  const count=spark?11:15;
  for(let i=0;i<count;i++){
    const a=i*turn/count;
    const at=(phase,y,radius)=>[Math.cos(a+phase)*radius,y,Math.sin(a+phase)*radius];
    const path=[at(-.36,-2.71,2.46),at(.01,-1.52,3.42),at(.17,-.32,3.64),at(-.22,.66,3.73),at(.15,1.99,3.09),at(.50,2.96,2.03)];
    h.line(path,spark?.127:(i%3===0?.17:.094),i%3===0?'edge':'core',!spark);
    if(i%2===0)h.line([path[2],at(.61,.48,3.49),at(.82,1.43,3.05)],.075,'edge',false);
  }
  if(spark){
    for(let i=0;i<6;i++){
      const a=i*turn/6;
      const [x,z]=[Math.cos(a),Math.sin(a)];
      cutGem(h,[[x*2.51,-.51,z*2.51,.51,.29],[x*3.69,.35,z*3.69,.40,.24],[x*4.36,1.31,z*4.36,.025,.03]],'trim');
    }
  }
}

function goldenCoin(h){
  disk(h,4.65,[0,0,0],.97,'trim');
  for(const side of [-1,1]){
    h.loop([0,0,.54*side],4.18,.20,'edge','xy',44);
    h.loop([0,0,.55*side],3.60,.095,'trim','xy',44);
    const stroke=(points,width=.19)=>h.line(points.map(([x,y])=>[x*side,y,side*.64]),width,'body',false);
    stroke([[-2.55,2.47],[-2.17,1.97]]);
    stroke([[-2.76,1.68],[-1.16,1.68],[-1.91,.36],[-2.92,-.39]]);
    stroke([[-2.01,.46],[-2.01,-2.58]]);
    stroke([[-1.97,.16],[-1.05,-.50]]);
    stroke([[-.72,2.26],[2.74,2.26]]);
    stroke([[-.45,1.53],[2.42,1.53],[2.42,.51],[-.45,.51],[-.45,1.53]]);
    stroke([[-.78,-.25],[2.64,-.25],[2.64,-2.58],[-.78,-2.58],[-.78,-.25]]);
    stroke([[.88,-.26],[.88,-2.55]]);
    stroke([[-.72,-1.38],[2.62,-1.38]]);
    for(let i=0;i<28;i++){
      const a=i*turn/28;
      h.gem([3.9*Math.cos(a),3.9*Math.sin(a),side*.62],.106,'body',[1,1,.55]);
    }
  }
}

function hollowEye(h){
  h.gem([0,2.2,0],3.09,'dark',[.89,1.30,.57],3);
  for(const side of [-1,1]){
    const ring=h.loop([0,2.2,side*1.38],2.62,.433,'trim','xy',42);
    ring.scale.y=1.39;
    h.gem([0,2.28,side*1.46],2.04,'body',[.88,1.36,.40],3);
    h.gem([-.08,2.4,side*2.22],.95,'core',[.70,1.36,.33],2);
    h.gem([-.09,2.43,side*2.43],.58,'dark',[.52,1.34,.40],2);
    for(let i=0;i<12;i++){
      const a=i*turn/12,c=Math.cos(a),s=Math.sin(a);
      cutGem(h,[[2.37*c,2.1+3.30*s,side*.84,.38,.27],[3.01*c,2.1+4.05*s,side*.83,.36,.25],[3.45*c,2.1+4.55*s,side*.76,.034,.034]],'edge');
    }
  }
  for(const sign of [-1,1]){
    cutGem(h,[[sign*2.24,1.0,0,.48,.25],[sign*2.63,-2.16,0,.32,.26],[sign*1.89,-4.47,.25,.35,.22],[sign*.88,-6.05,.23,.035,.028]],'trim');
  }
  strap(h,[0,-3.89,0],[0,-1.44,0],.46);
}

function lotusFish(h){
  h.gem([-.75,2.54,0],3.04,'dark',[1.06,.95,.72],3);
  for(const side of [-1,1]){
    petals(h,[-.75,2.54,side*1.31],.51,2.79,7,'body',side*.31);
    petals(h,[-.75,2.54,side*1.54],.42,2.07,7,'edge',side*.26);
    h.gem([-.75,2.54,side*1.8],.69,'trim',[1,.96,.52],2);
  }
  h.line([[-2.91,1.65,0],[-3.65,-.30,0],[-2.89,-2.74,0],[-1.19,-3.04,0],[.77,-2.49,0],[1.61,.32,0]],.32,'trim');
  strap(h,[0,-4.06,0],[0,-2.17,0],.40,'body');
  cutGem(h,[[3.47,-3.92,.43,.22,.21],[3.70,-2.98,.37,.29,.27],[4.51,-.43,.34,.37,.34],[4.62,.81,.32,.55,.43],[4.49,1.78,.32,.29,.21]],'edge');
  for(const side of [-1,1])h.line([[3.69,-2.93,side*.55],[4.08,-1.71,side*.59],[4.49,-.48,side*.67]],.10,'core');
}

function dragonFish(h){
  h.gem([-1.06,2.22,0],2.86,'body',[1.07,1.02,.80],3);
  for(const side of [-1,1]){
    for(const [index,radius] of [1.16,1.94,2.53].entries()){
      const winding=[];
      for(let i=0;i<=14;i++){
        const a=i*.43+index*.83,r=radius*(.52+i*.030);
        winding.push([-1.06+Math.cos(a)*r,2.22+Math.sin(a)*r,
          side*(2.31-Math.hypot(Math.cos(a)*r,Math.sin(a)*r)*.29)]);
      }
      h.line(winding,.17,index%2?'dark':'edge');
    }
    h.gem([-2.02,2.55,side*2.18],.35,'trim',[.9,1,.45],2);
    h.line([[-3.09,.74,side*.76],[-2.12,-.22,side*.87],[-.87,-.38,side*.93],[.31,.27,side*.94]],.21,'trim');
  }
  h.line([[-3.3,1.05,0],[-4.07,-.7,0],[-3.42,-2.41,.1],[-1.74,-3.20,.23],[-.43,-2.76,.25],[1.61,-.46,.23],[2.16,1.03,.14]],.43,'trim');
  cutGem(h,[[1.18,-4.12,0,.23,.23],[1.58,-3.28,0,.36,.34],[2.70,-1.94,0,.42,.38],[3.78,-.69,0,.46,.42],[4.18,-.12,0,.28,.27]],'trim');
  strap(h,[-1.11,-3.78,0],[-1.11,-2.44,0],.39);
}

function sevenBlade(h,id){
  const ancient=id==='true-seven';
  h.handle(-8.35,-2.4,.60);
  h.grip(-5.55,.62,9);
  const spine=ancient
    ?[-.72,-2.68,-1.02,1.5,-.92,5.4,-.54,9.68,.52,11.51,.92,8.64,.82,4.7,.78,1.5,.88,-2.66]
    :[-.52,-2.65,-.69,1.8,-.55,6.3,-1.46,10.10,-.86,11.26,.26,9.77,.60,6.1,.47,2.44,.75,-2.65];
  h.plate(spine,ancient?'trim':'edge',.54,[0,0,0],.072);
  h.plate(spine.map((point,i)=>i%2?point*.96:point*.58),'dark',.46,[0,0,0],.081);
  for(const [index,[side,y,width,rise]] of [[-1,.07,3.61,2.09],[1,1.33,3.41,1.82],[-1,3.2,3.18,1.83],[1,4.53,3.22,2.03],[-1,6.10,2.92,1.62],[1,7.20,2.56,1.89]].entries()){
    const edge=[.25,y-.39,width*.57,y+.01,width*.77,y+rise*.51,width,y+rise,
      width*.64,y+rise*.95,width*.34,y+rise*.29,.32,y+.69];
    h.plate(edge.map((point,i)=>i%2?point:point*side),index%2&&ancient?'trim':'body',.56,[0,0,0],.083);
    for(const face of [-1,1]){
      h.line([[side*.28,y+.11,face*.36],[side*width*.43,y+.35,face*.38],[side*width*.63,y+rise*.79,face*.25]],.103,ancient?'edge':'core');
    }
  }
  const guard=[-2.56,-2.91,-1.65,-1.79,-.59,-2.5,.69,-2.5,1.64,-1.64,2.51,-2.68,1.24,-3.26,-1.30,-3.21];
  h.plate(guard,'trim',.91,[0,0,0],.103);
  h.inlay([[0,-2.54],[-.11,-.38],[.08,2.0],[-.13,4.34],[.09,6.79],[-.27,9.16]],.37,.11,'core');
  h.gem([0,-8.18,0],.61,'trim',[1,.68,.93],2);
}

function foxDoll(h){
  h.solid([[0,-3.94,0,.31,.30],[0,-3.1,0,1.0,.65],[0,-1.72,0,1.16,.80],[0,-.48,0,.88,.72],[0,.35,0,1.17,.69]],'body',{sides:14,rings:13,section:2.55,ridge:.12});
  h.gem([0,2.04,0],2.39,'dark',[1.17,.96,.62],3);
  h.gem([0,1.93,1.07],2.05,'edge',[1.17,.83,.55],4);
  h.gem([0,1.22,2.01],.91,'edge',[1.46,.57,.45],3);
  h.gem([0,1.34,2.48],.28,'dark',[1,.59,.54],2);
  for(const side of [-1,1]){
    cutGem(h,[[side*1.46,2.43,.10,.80,.40],[side*2.06,3.46,.10,.81,.51],[side*2.47,4.42,.07,.41,.34],[side*2.30,5.26,.02,.028,.027]],'trim');
    cutGem(h,[[side*1.88,3.19,.45,.65,.23],[side*2.19,3.92,.55,.51,.18],[side*2.23,4.80,.34,.025,.026]],'body');
    h.line([[side*.77,2.06,2.27],[side*1.23,2.24,2.23],[side*1.70,2.56,1.93]],.19,'dark');
    h.gem([side*1.21,2.17,2.39],.23,'core',[1.32,.63,.54],2);
    for(let stripe=0;stripe<3;stripe++){
      h.line([[side*(1.18+stripe*.19),1.13+stripe*.24,2.19],[side*(1.56+stripe*.16),1.06+stripe*.21,2.07],[side*(1.85+stripe*.10),1.18+stripe*.18,1.87]],.098,'trim');
    }
    h.gem([side*1.62,-.86,.13],.78,'body',[1.14,.67,.68],3);
    h.gem([side*1.95,-1.31,.27],.42,'edge',[.91,.78,.69],2);
    h.gem([side*.61,-3.43,.03],.47,'dark',[.86,1.32,.75],2);
    for(let i=0;i<3;i++){
      h.line([[side*(.81+i*.31),.54,-.38],[side*(1.29+i*.38),-.40,-.66],[side*(1.32+i*.47),-2.41,-.87]],.15,'trim');
    }
  }
  h.gem([0,-.57,.83],.39,'core',[1,1,.40],2);
  h.line([[-1.66,-1.48,-.7],[-1.95,-2.12,-1.52],[-1.02,-2.41,-2.40],[.07,-1.97,-2.73],[.58,-.91,-2.34]],.39,'trim');
}

function snowDoll(h){
  h.gem([0,.18,0],1.31,'body',[.81,1.2,.69],3);
  h.gem([0,2.19,0],1.96,'dark',[.94,1.12,.70],3);
  h.gem([0,2.06,1.08],1.37,'body',[1.08,1.14,.55],3);
  h.gem([0,.32,.9],.51,'core',[.89,1.32,.35],2);
  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      cutGem(h,[[side*1.0,2.36-i*.2,0,.59,.39],[side*(2.4+i*.49),3.01-i*.37,.12,.56,.32],[side*(4.02-i*.43),3.68-i*.48,.18,.04,.035]],
        i===0?'edge':i===1?'trim':'core');
    }
    h.line([[side*.21,2.02,1.75],[side*.68,2.15,1.69],[side*1.02,2.49,1.41]],.14,'core');
    h.gem([side*1.46,.20,0],.58,'body',[1.0,1.16,.82],2);
    cutGem(h,[[side*1.51,.18,0,.44,.39],[side*1.77,-1.11,.12,.32,.29],[side*1.54,-1.67,.25,.26,.24]],'edge');
    cutGem(h,[[side*.62,-.64,-.03,.41,.45],[side*.81,-1.90,-.02,.33,.42],[side*.99,-3.19,.14,.42,.38]],'body');
    h.gem([side*1,-3.33,.33],.49,'trim',[.83,.53,1.25],2);
    h.line([[side*.19,2.99,-1.25],[side*.65,2.19,-1.45],[side*.74,1.51,-1.46],[side*.36,1.09,-1.36]],.091,'edge');
  }
}

function beastClaw(h,id){
  const chaos=id==='hundun';
  const width=chaos?2.27:2.03;
  const claw=[[0,-4.72,0,1.22,.71],[0,-3.58,0,width,1.00],[.16,-2.32,0,width+.16,1.28],
    [-.27,-.74,0,width-.18,1.26],[-1.09,.89,0,1.53,.98],[-2.08,2.58,0,.99,.73],
    [-3.43,3.35,.13,.64,.52],[-4.59,3.39,.21,.44,.33],[-5.53,2.92,.25,.21,.17],
    [-6.40,1.96,.30,.028,.031]];
  h.solid(claw,'dark',{sides:18,rings:30,section:2.52,ridge:.16,seed:chaos?4:12});
  for(const [i,[x,y,radius,tilt]] of [[0,-3.54,width,-.08],[-.07,-2.23,width+.03,-.17],
    [-.69,-.67,1.85,-.33],[-1.11,.62,1.53,-.44],[-1.92,1.86,1.15,-.58],
    [-2.81,2.92,.76,-.90],[-3.92,3.40,.52,-1.4],[-4.92,3.22,.32,-2.05]].entries()){
    const ring=h.loop([x,y,0],radius,.148,i%3===0?'edge':'trim','xz',18);
    ring.rotation.z=tilt;
    ring.scale.y=.81;
    for(const side of [-1,1]){
      const end=side*(chaos?1.33:1.63);
      cutGem(h,[[x+.30,y,side*radius*.54,.25,.22],[x+radius*.72,y+.39,side*radius*.56,.31,.19],
        [x+radius*.96,y+.72,end,.17,.135],[x+radius*(chaos?.64:1.18),y+1.14,end*1.31,.027,.029]],
      i%3===2&&!chaos?'body':'trim');
    }
  }
  for(const side of [-1,1]){
    const z=side*1.06;
    h.line([[1.64,-4.06,z],[1.24,-3.01,z],[.97,-1.54,z*.94],[.39,-.12,z*.91],[-.49,1.05,z*.79]],.081,chaos?'body':'core');
    h.gem([.70,-2.89,z],.41,chaos?'body':'core',[1,1.37,.43],1);
  }
  if(!chaos){
    h.plate([-1.66,-3.27,-1.1,-4.19,1.02,-4.26,1.93,-3.29,1.59,-2.64,-1.37,-2.56],'body',2.09);
    for(const side of [-1,1])h.gem([1.26,-3.13,side*1.15],.23,'edge',[.57,1.17,.53],1);
  }
  strap(h,[0,-4.87,0],[0,-3.09,0],.57);
}

function bladeFeather(h){
  h.handle(-6.64,-1.65,.56);
  h.grip(-4.19,.62,7);
  for(const [side,height,tilt] of [[-1,10.35,-.23],[1,9.63,.35]]){
    const p=(x,y,z)=>[x*.1,y*.1,z*.1];
    h.add(featherVane(p(.52*side,-.76,side*.42),p(side*1.94,4.38,.27*side),p(side*3.18,height,side*.24),.161,side*1.22,12),'edge').rotation.z=tilt;
    h.add(featherVane(p(.31*side,-.62,.50*side),p(side*1.37,3.97,.34*side),p(side*2.99,height-.27,.30*side),.142,side*.91,12),'core').rotation.z=tilt;
    cutGem(h,[[.14*side,-1.55,side*.45,.38,.25],[side*.50,.44,side*.54,.35,.24],
      [side*.94,3.60,side*.45,.26,.16],[side*1.52,5.85,side*.39,.12,.08],[side*1.85,7.69,side*.38,.022,.024]],'trim');
    cutGem(h,[[side*.33,-1.48,0,.53,.44],[side*1.07,-.19,side*.32,.38,.28],[side*2.04,1.15,side*.43,.27,.15],[side*2.64,2.13,side*.48,.028,.035]],'body');
  }
  h.gem([0,-1.94,0],.71,'body',[1.3,1,1.08],2);
}

const sculptures={
  tiger,dragon,phoenix,turtle,qilin,bell,
  'golden-orb':goldenCoin,'nether-box':hollowEye,'lotus-fish':lotusFish,'dragon-fish':dragonFish,
  'ice-orb':energyGlobe,'fire-orb':energyGlobe,'spark-orb':energyGlobe,'thunder-pearl':energyGlobe,
  'fox-doll':foxDoll,'snow-doll':snowDoll,'true-seven':sevenBlade,'seven-blade':sevenBlade,
  hundun:beastClaw,taotie:beastClaw,qiongqi:bladeFeather,
};

export function sculptOffhand(h,id){
  if(!sculptures[id])return false;
  sculptures[id](h,id);
  return true;
}
