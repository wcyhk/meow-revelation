import * as T from '../three.min.mjs';

const ring=(sides,red=.045)=>new T.TorusGeometry(1,red,4,sides).rotateX(-Math.PI/2);
const art={
  mirror:new T.OctahedronGeometry(1,0).scale(.36,1,.12),
  relay:new T.IcosahedronGeometry(.62,0),
  wire:new T.BoxGeometry(.075,.06,2),
  stone:new T.DodecahedronGeometry(.65,0),
  ice:new T.ConeGeometry(.20,1.4,5),
  crown:new T.CylinderGeometry(.61,.82,.17,7,1,true),
  trap:ring(4,.06), prism:ring(3), frost:ring(6,.065),
  rift:ring(22,.072), vortex:ring(12,.06),
  blade:new T.TetrahedronGeometry(.66).scale(.65,.40,1.8),
  wheel:new T.TorusGeometry(.70,.10,6,14),
  fang:new T.ConeGeometry(.32,1.28,5),
  toxin:new T.SphereGeometry(.59,8,6).scale(.75,1.05,.75),
  needle:new T.ConeGeometry(.10,2.3,4).rotateZ(Math.PI),
  thread:new T.CylinderGeometry(.026,.04,1,5).rotateX(Math.PI/2).translate(0,0,.5),
  glass:new T.BoxGeometry(.62,1.38,.12).rotateY(.19),
  hourglass:new T.CylinderGeometry(0,.65,1.13,4).translate(0,.56,0),
  sun:new T.IcosahedronGeometry(.74,1),
  notch:new T.TorusGeometry(.82,.10,5,12,Math.PI*1.4).rotateX(-Math.PI/2),
  feather:new T.ConeGeometry(.18,1.1,5).rotateX(Math.PI/2),
  book:new T.BoxGeometry(.92,.16,.66).rotateX(.33),
  door:new T.TorusGeometry(.83,.10,5,16).scale(.75,1.25,1),
  pillar:new T.CylinderGeometry(.24,.43,1.65,6),
};

export function awakeningFx(view,shape,p,tint,{size=1,life=.5,y=.14,angle=0,dx=0,dz=0,lift=0,spin=0,stretchZ}={}){
  const fx=view.addEffect(art[shape],{x:p.x,y,z:p.z},tint,life,
    {scale:size,growth:0,opacity:.88,fade:true,angle,order:76});
  fx.combatClock=true;
  if(dx||dz)fx.travel={x:dx/life,z:dz/life};
  if(lift)fx.vertical={from:y,to:y+lift,duration:life};
  if(spin)fx.spin=spin;
  if(stretchZ)fx.stretchZ=stretchZ;
  return fx;
}
