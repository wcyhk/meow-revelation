import * as T from '../three.min.mjs';

const PI=Math.PI,TAU=PI*2;
const block=new T.BoxGeometry(1,1,1);
const strut=new T.CylinderGeometry(.85,1,1,7);
const pinnacle=new T.ConeGeometry(1,1,7);
const flank=new T.DodecahedronGeometry(1);
const wire=new T.TorusGeometry(1,.032,5,34).rotateX(-PI/2);
const crown=new T.CylinderGeometry(.61,1,1,10);
const pointedShape=new T.Shape().moveTo(-1,0).lineTo(-1,1.5)
  .quadraticCurveTo(-.93,2.36,0,3.12).quadraticCurveTo(.93,2.36,1,1.5).lineTo(1,0).lineTo(.72,0).lineTo(.72,1.43)
  .quadraticCurveTo(.65,2.12,0,2.72).quadraticCurveTo(-.65,2.12,-.72,1.43).lineTo(-.72,0).closePath();
const pointed=new T.ExtrudeGeometry(pointedShape,{curveSegments:7,depth:1,bevelEnabled:true,bevelThickness:.06,bevelSize:.045,bevelSegments:1});
export const depthGeometry=[block,strut,pinnacle,flank,wire,crown,pointed];

const profile={
  grove:['roots',1.3,12],canal:['sluice',1.55,11],lotus:['lily',1.23,13],
  frost:['ice',1.68,12],forge:['chimney',1.53,13],grave:['tombs',1.31,12],
  vault:['vault',1.46,11],dunes:['dunes',2.30,13],fungus:['spores',1.32,12],
  cathedral:['nave',1.43,12],desecrated:['ruin',1.43,12],throne:['altar',1.61,14],crimson:['blood',1.67,13],
};

function backCliff(ctx,x,z,high,style){
  const {put,m,draw}=ctx;
  for(let row=0;row<4;row++){
    const size=1.42+draw()*.64;
    const y=(row+.44)*high*.38;
    put(flank,row===2?m.ridge:m.basal,x+(draw()-.5)*1.33,y,z-row*.46,size,high*.43,size*1.47,draw()*TAU,.087,row*.07);
  }
  if(style==='ice'){
    for(let j=0;j<3;j++){
      const y=high*.57+j*.63;
      put(pinnacle,j%2?m.ridge:m.crystal,x+(j-1)*.95,y,z+.42+j*.12,.32+j*.13,1.5+j*.40,.51,.37*j,.17,-.35);
    }
  }else if(style==='spores'){
    put(crown,m.leaf,x,high*1.59,z,1.24,.65,1.42,.15,.09,.23);
    put(crown,m.crystal,x,high*1.36,z,1.10,.11,1.19);
  }
}

function roots(ctx,x,z,yaw,high){
  const {rod,put,m,draw}=ctx;
  const joints=[[x,0,z],[x+.20,high*.46,z-.24],[x-.28,high*.83,z+.19],[x+.08,high*1.23,z-.33]];
  for(let i=1;i<joints.length;i++)rod(strut,i===1?m.basal:m.bone,.43-i*.091,joints[i-1],joints[i],1.27);
  for(let i=0;i<4;i++){
    const a=yaw+i*TAU/4;
    const r=1.3+draw();
    const b=[x+Math.cos(a)*r,high*(.72+draw()*.45),z+Math.sin(a)*r];
    rod(strut,m.bone,.13,joints[1+i%2],b,.91);
    rod(strut,m.basal,.066,b,[b[0]+Math.cos(a+.36)*.68,b[1]+high*.29,b[2]+Math.sin(a+.36)*.79]);
    put(flank,m.leaf,b[0],b[1]+.1,b[2],1.1,.63,1.14,a,.05,.43);
  }
}

function backWall(ctx,x,z,y,style,span){
  const {put,rod,m}=ctx;
  put(block,m.basal,x,y*.28,z-.48,span,.56*y,1.27);
  put(block,m.ridge,x,y*.59,z-.32,span+.2,.17,.62);
  if(style==='chimney'||style==='sluice'){
    for(const s of [-1,1]){
      const px=x+span*s*.32;
      put(crown,m.basal,px,y*.62,z,.59,y*1.27,.58);
      put(crown,m.ridge,px,y*1.3,z,.66,.20,.74);
      put(crown,m.emission,px,y*1.415,z,.31,.18,.34);
      if(style==='chimney')rod(strut,m.bone,.19,[px,y*.74,z-.17],[x,y*.92,z-.68],1.11);
    }
    return;
  }
  if(style==='tombs'){
    put(pointed,m.ridge,x,.09,z,span*.36,y*.43,.24);
    put(pinnacle,m.bone,x,y*1.67,z-.23,.107,.73,.13,.78);
    put(strut,m.gilt,x,y*.99,z+.15,.071,.49,.081);
    return;
  }
  const fracture=style==='ruin'||style==='blood';
  const trim=style==='vault'||style==='altar'?m.gilt:m.ridge;
  put(pointed,m.basal,x,.24,z-.43,span*.46,y*.46,.51);
  if(!fracture)put(pointed,trim,x,.21,z-.19,span*.43,y*.452,.22);
  if(style!=='vault'){
    put(pointed,m.crystal,x,.48,z-.59,span*.30,y*.40,.075);
    put(block,m.basal,x,y*.41,z-.40,span*.34,y*.29,.21);
  }
  for(const s of [-1,1]){
    const xp=x+s*span*.40;
    put(strut,m.ridge,xp,y*.56,z+.21,.24,y*1.16,.32);
    put(crown,trim,xp,y*1.13,z+.13,.31,.20,.38);
    put(pinnacle,trim,xp,y*1.35,z+.11,.24,y*.31,.27);
  }
}

function nearScenery(ctx,style,stage){
  const {put,rod,m,solid,draw}=ctx;
  const organic=['roots','ice','dunes','lily','spores'].includes(style);
  const z=-6.5+(stage.room%4)*.63;
  for(const side of [-1,1]){
    const x=side*(10.5+(stage.room%2)*.7);
    const high=2.6+draw()*.84;
    if(organic){
      if(style==='roots')roots(ctx,x,z,side*.87,high);
      else{
        backCliff(ctx,x,z,high*.78,style);
        if(style==='lily'||style==='spores'){
          put(crown,m.crystal,x-side*.45,high*.72,z+.49,.87,.071,.85);
          for(let i=0;i<4;i++){
            const a=i*TAU/4;
            put(flank,m.leaf,x+Math.cos(a)*.68,.46+i*.14,z+Math.sin(a)*.67,.56,.20,.31,a,side*.13,.26);
          }
        }
      }
      put(wire,m.shadow,x,.021,z,2.19,1,1.67);
      solid.push({x,z,radius:style==='roots'?.57:.85});
    }else{
      const foreground=z+6.6+side*.61;
      const nearX=x+side*.74;
      const lintel=style==='nave'||style==='ruin'||style==='altar'||style==='blood';
      const ink=style==='blood'?m.ridge:m.gilt;
      put(block,m.basal,nearX,.23,foreground,1.98,.46,1.98,PI*.25);
      put(crown,m.ridge,nearX,.53,foreground,.89,.26,.89);
      put(crown,m.basal,nearX,1.59,foreground,.52,2.1,.54);
      put(crown,ink,nearX,2.54,foreground,.71,.091,.74);
      put(crown,m.ridge,nearX,2.70,foreground,.64,.25,.62);
      put(pinnacle,m.crystal,nearX,3.21,foreground,.245,.77,.27,PI*.25);
      if(lintel){
        const rearX=nearX+side*2.5;
        put(pointed,m.ridge,rearX,.19,foreground-1.21,1.02,high*.62,.38,.47*side);
        for(let j=0;j<3;j++){
          const pz=foreground-.79+j*.44;
          rod(strut,ink,.035,[nearX+side*.45,1.60,pz],[rearX-side*.26,high*1.08,pz-.25]);
        }
      }else if(style==='tombs'){
        put(pointed,m.basal,nearX,.26,foreground+.50,.53,.58,.32,PI*.25*side);
        put(wire,m.ridge,nearX,.46,foreground,.67,1,.59);
      }
      solid.push({x:nearX,z:foreground,radius:.76});
    }
  }
}

export function sculptRoomDepth(ctx,stage,type){
  const {put,m,draw}=ctx;
  const [style,scale,span]=profile[type];
  const organic=['ice','spores','dunes','roots','lily'].includes(style);
  const count=ctx.mobile?5:7;
  for(let i=0;i<count;i++){
    const u=i-(count-1)/2;
    const x=u*(32/count)+(draw()-.5)*1.06;
    const z=-22.3-(i%3)*.84;
    const height=scale*(2.3+draw()*1.25);
    if(style==='roots')roots(ctx,x,z,draw()*TAU,height);
    else if(organic){
      backCliff(ctx,x,z,height,style);
      if(style==='lily')put(wire,m.gilt,x,.29,z+1.76,1.88,1,1.37,.5);
    }else backWall(ctx,x,z,height,style,(33/count)*.88);
  }
  for(const side of [-1,1]){
    const x=side*(span+2.71);
    for(let row=0;row<3;row++){
      const z=-18.1+row*1.35;
      put(block,row%2?m.ridge:m.basal,x,.20-row*.044,z,5.59,.24-row*.032,1.42);
      put(block,m.gilt,x-side*.28,.34-row*.059,z+.68,4.86,.035,.057);
    }
    if(style==='vault'||style==='altar'||style==='blood'){
      const z=-10.35+side*.76+(stage.room%3)*.47;
      put(crown,m.basal,side*10.5,.14,z,1.26,.23,1.27);
      put(crown,m.ridge,side*10.5,.33,z,1.02,.21,1.02);
      put(wire,m.gilt,side*10.5,.46,z,.94,.71,.95);
      put(pinnacle,m.crystal,side*10.5,1.33,z,.42,1.52,.42,.37,.10,.16);
      ctx.solid.push({x:side*10.5,z,radius:.94});
    }
  }
  nearScenery(ctx,style,stage);
}
