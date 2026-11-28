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
};

export function awakeningFx(view,shape,p,tint,{size=1,life=.5,y=.14,angle=0,dx=0,dz=0,lift=0,spin=0}={}){
  const fx=view.addEffect(art[shape],{x:p.x,y,z:p.z},tint,life,
    {scale:size,growth:0,opacity:.88,fade:true,angle,order:76});
  fx.combatClock=true;
  if(dx||dz)fx.travel={x:dx/life,z:dz/life};
  if(lift)fx.vertical={from:y,to:y+lift,duration:life};
  if(spin)fx.spin=spin;
  return fx;
}
