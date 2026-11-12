"use strict";

// These coordinates match the wrist in each frame of the existing cat atlas.
const heroWrist={
  0:{x:153,y:175,tilt:.42,cut:[[163,165],[173,128],[185,115],[224,122],[232,190],[192,187],[188,154],[174,178]]},
  1:{x:159,y:179,tilt:.57,cut:[[170,173],[172,140],[193,139],[232,151],[222,214],[186,208],[183,169]]},
  2:{x:161,y:174,tilt:.57,cut:[[171,171],[177,138],[204,139],[228,165],[222,211],[191,211],[184,171]]},
  3:{x:133,y:179,tilt:1.95,cut:[[151,173],[190,173],[205,158],[250,165],[251,231],[155,231],[147,187]]},
  11:{x:175,y:210,tilt:1.34,cut:[]},
};
const cssColor=hex=>"#"+hex.toString(16).padStart(6,"0");
function installWeaponArt(textures){
  const sheet=textures.get("cast").getSourceImage();
  for(const [frame,pose] of Object.entries(heroWrist)){
    const canvas=document.createElement("canvas");
    canvas.width=canvas.height=256;
    const ctx=canvas.getContext("2d");
    ctx.drawImage(sheet,(frame%4)*256,Math.floor(frame/4)*256,256,256,0,0,256,256);
    if(pose.cut.length){
      ctx.globalCompositeOperation="destination-out";
      ctx.beginPath();
      pose.cut.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.closePath();
      ctx.fill();
    }
    textures.addCanvas("hero-pose-"+frame,canvas);
  }
  for(const id of Object.keys(weaponArts)){
    textures.addCanvas("weapon-"+id,drawWeaponArt(id,false));
    if(tradeRoles[id])textures.addCanvas("weapon-"+id+"-forged",drawWeaponArt(id,true));
  }
}

function drawWeaponArt(id,forged){
  const canvas=document.createElement("canvas");
  canvas.width=canvas.height=160;
  const ctx=canvas.getContext("2d"),color=cssColor(weaponArts[id].color);
  ctx.translate(80,80);ctx.lineJoin="round";ctx.lineCap="round";
  const silver=ctx.createLinearGradient(-22,-52,23,9);
  silver.addColorStop(0,"#fff3db");silver.addColorStop(.45,color);silver.addColorStop(1,"#58435f");
  const shape=(path,fill,width=3)=>{
    const p=new Path2D(path);ctx.fillStyle=fill;ctx.strokeStyle="#201521";ctx.lineWidth=width;
    ctx.fill(p);ctx.stroke(p);
  };
  const grip=(start=-16,end=36)=>shape("M-5 "+start+" H5 V"+end+" H-5 Z","#7a5144");
  const jewel=(y,s)=>shape("M0 "+(y-s)+" L"+(s*.77)+" "+y+" L0 "+(y+s)+" L"+(-s*.77)+" "+y+" Z",silver);
  switch(id){
    case "scythe":
      grip(-51,37);
      shape("M-4 -55 Q33 -63 58 -29 Q41 -42 18 -37 Q5 -34 0 -23 Z",silver);
      break;
    case "fang":
      grip(-10,21);
      shape("M-12 -9 Q-1 -28 19 -46 Q23 -27 9 -12 L4 4 Z",silver);
      break;
    case "anchor":
      grip(-43,29);
      shape("M0 -62 L12 -48 L4 -38 L4 -25 Q22 -27 23 -44 L38 -27 L27 -25 Q20 -3 0 3 Q-20 -3 -27 -25 L-38 -27 L-23 -44 Q-22 -27 -4 -25 L-4 -38 L-12 -48 Z",silver);
      break;
    case "spear":
      grip(-38,49);
      shape("M0 -73 L15 -48 L5 -31 L0 -22 L-5 -31 L-15 -48 Z",silver);jewel(-52,7);
      break;
    case "lantern":
      grip(-46,27);
      shape("M-13 -47 L-9 -57 H9 L13 -47 L19 -32 L10 -20 H-10 L-19 -32 Z",silver);jewel(-37,10);
      break;
    case "martial":
      grip(-56,45);
      shape(forged?"M-12 -62 L0 -72 L12 -62 L9 -38 H-9 Z":"M-7 -60 H7 V-34 H-7 Z",silver);
      if(forged)jewel(38,11);
      break;
    case "oracle":
      grip(-26,27);
      if(forged)shape("M-24 -40 L-14 -29 L-15 -55 L0 -36 L15 -55 L14 -29 L24 -40 L15 -15 H-15 Z","#70539b");
      jewel(-42,forged?26:18);
      break;
    case "samurai":
      grip(-8,27);
      shape(forged?"M-8 -12 Q1 -36 -4 -60 L14 -74 Q24 -42 7 -10 Z":"M-5 -11 Q7 -35 6 -66 L15 -58 Q19 -29 6 -9 Z",silver);
      shape("M-13 -12 H13 L9 -5 H-9 Z",forged?color:"#b28c6e");
      break;
    case "maiden":
      grip(-22,24);
      shape("M-17 -32 Q-13 -51 0 -51 Q13 -51 17 -32 L23 -23 Q0 -11 -23 -23 Z",silver);
      jewel(-22,6);
      if(forged){jewel(-58,9);shape("M-20 -20 Q-12 9 -22 18 L-11 15 L-8 21 L-9 -20 Z",color);}
      break;
    case "hunter":
      shape(forged?"M-15 -60 L-6 -42 L12 -33 L4 -53 L17 -41 L15 -24 Q43 1 14 25 L14 42 L-2 54 L3 33 L-9 42 L-15 59 L-16 47 Q20 5 -16 -48 Z":
        "M-14 -57 Q48 0 -14 57 Q27 0 -14 -57 Z",silver);
      ctx.strokeStyle="#f1e5ce";ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-14,-52);ctx.lineTo(-21,0);ctx.lineTo(-14,52);ctx.stroke();
      break;
    case "merchant":
      grip(-37,36);
      shape("M-8 -37 Q-13 -54 0 -68 Q13 -54 8 -37 Z",forged?"#91f2cb":silver);
      shape("M-8 -38 H8 V-27 H-8 Z",silver);
      if(forged)shape("M0 22 Q-24 27 -17 55 L-9 44 L-3 48 Q-15 33 5 27 Z","#91f2cb");
      break;
  }
  return canvas;
}

function actorPose(actor,frame,size,clock,reduced,hero){
  const side=Math.cos(actor.angle??0)<-.14?-1:1;
  const walk=actor.walking&&!reduced?Math.sin(clock*23):0;
  const cast=actor.castPose>0?Math.sin(actor.castPose/.30*Math.PI):0;
  const attack=actor.attack?1-actor.attack.left/actor.attack.total:0;
  const hit=actor.hit>0;
  const tilt=actor.dash?(1-actor.dash.left/actor.dash.total)*Math.PI*2*side:
    (actor.warning?-.14*(1-actor.warning.left/actor.warning.total):hit?.13:hero?(.24*Math.sin(attack*Math.PI)-.1*cast)*side:walk*.055*side);
  const idle=reduced?0:Math.sin(clock*4.6+actor.x*.1)*.018;
  return {frame,side,tilt,width:size*(hit?1.08:1),height:size*(1+idle+walk*.043-cast*.035)*(hit?.95:1),
    lift:Math.abs(walk)*(hero?3:4)+cast*4,hit,alpha:hero&&actor.invulnerable>.30&&Math.floor(clock*22)%2===1?.58:1};
}

function heldWeapon(id,forged,pose,actor){
  if(!id)return null;
  const wrist=heroWrist[pose.frame];
  const localX=(wrist.x/256-.5)*pose.width*pose.side,localY=(wrist.y/256-.88)*pose.height;
  const sine=Math.sin(pose.tilt),cosine=Math.cos(pose.tilt);
  const swing=actor.attack?Math.sin(Math.PI*(1-actor.attack.left/actor.attack.total))*.58:0;
  return {key:"weapon-"+id+(forged?"-forged":""),size:pose.width*.77,
    x:localX*cosine-localY*sine,y:localX*sine+localY*cosine,
    angle:pose.tilt+(wrist.tilt+swing-(actor.castPose||0)*1.7)*pose.side};
}
