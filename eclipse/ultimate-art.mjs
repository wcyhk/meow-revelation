import * as T from '../three.min.mjs';

const floor=new T.PlaneGeometry(2,2).rotateX(-Math.PI/2);
const helix=new T.LatheGeometry([[.38,0],[.49,.22],[.64,.59],[.94,1.13],[1.09,1.52],[1.16,1.83]]
  .map(([r,h])=>new T.Vector2(r,h)),28);
const crown=new T.LatheGeometry([[1,0],[1.03,.19],[.91,.46],[.67,.78],[.30,1.02],[.02,1.12]]
  .map(([r,h])=>new T.Vector2(r,h)),24);

const vertex=`
varying vec2 paper;
void main(){
  paper=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const fragment=`
varying vec2 paper;
uniform vec3 ink, flare;
uniform float life,opacity,style,volume;
float band(float d,float w){return 1.0-smoothstep(0.0,w,abs(d));}
void main(){
  float pi=3.14159265;
  float a,glow,core;
  float charge=0.0;
  if(volume>0.5){
    float y=paper.y;
    float u=paper.x*6.2831853;
    float plume=sin(u*3.0-y*(9.0+style*.23)+life*28.0);
    float coil=sin(u*5.0-y*17.0+life*38.0+sin(y*14.0-life*8.0)*.62);
    float ribs=pow(max(0.0,plume),6.0);
    float needles=pow(max(0.0,coil),11.0);
    float veil=smoothstep(0.0,.12,y)*(1.0-smoothstep(.77,1.0,y));
    glow=(.21+ribs*.71+needles*.28)*veil;
    core=pow(max(0.0,plume),15.0)*.75+needles*.54;
    if(style<.5){
      charge=needles*(.26+.74*pow(abs(sin(u*2.0+y*9.0-life*35.0)),4.0));
      glow+=charge*veil*.73;
    }
  }else{
    vec2 p=paper*2.0-1.0;
    float r=length(p);
    a=atan(p.y,p.x);
    float teeth=style<1.5?8.0:style<2.5?3.0:style<4.5?6.0:style<6.5?5.0:style<8.5?9.0:12.0;
    float clock=a*teeth+life*5.0;
    float lace=pow(abs(sin(clock)),9.0);
    float bloom=.25+min(.48,life*.78);
    float outer=band(r-.87,.028)+band(r-.78,.012)*.60;
    float lines=lace*(smoothstep(.51,.57,r)-smoothstep(.74,.78,r));
    float arc=band(r-bloom,.085)*(.24+.76*abs(sin(a*3.0+life*8.0)));
    float radial=band(r-(.43+sin(a*teeth-life*5.0)*.12),.018);
    glow=(outer*.94+lines*.59+arc*.7+radial*.73)*(1.0-smoothstep(.93,1.0,r));
    core=min(1.0,arc*.76+outer*.78+radial*.66);
  }
  float intro=smoothstep(0.0,.055,life);
  float tail=1.0-smoothstep(.73,1.0,life);
  vec3 lit=mix(ink,flare,clamp(core,0.0,1.0))*(1.0+core*.41);
  lit=mix(lit,vec3(.28,.65,1.0)*(1.0+charge*.65),clamp(charge*.94,0.0,1.0));
  gl_FragColor=vec4(lit,clamp(glow*opacity*intro*tail,0.0,.98));
}`;

function art(view,rite,point,radius,time,geometry,volume) {
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
    forceSinglePass:true,blending:T.AdditiveBlending,vertexShader:vertex,fragmentShader:fragment,
    uniforms:{ink:{value:new T.Color(rite.tint)},flare:{value:new T.Color(rite.accent)},
      life:{value:0},opacity:{value:1},style:{value:rite.skin},volume:{value:volume}}});
  const fx=view.addEffect(geometry,{x:point.x,y:volume?.09:.052,z:point.z},rite.tint,time,
    {scale:radius,opacity:volume?.82:.83,order:volume?76:37,material});
  fx.combatClock=true;
  fx.spin=volume?0:(rite.skin%2?-1.1:.82);
  return fx;
}

export function ultimateSeal(view,rite,point,radius,time=.57) {
  return art(view,rite,point,radius,time,floor,0);
}

export function ultimateBody(view,rite,point,radius,time,tapered=false) {
  return art(view,rite,point,radius,time,tapered?helix:crown,1);
}

export function trackUltimate(field,...effects) {
  for (const fx of effects) {
    fx.active=()=>field.alive;
    field.art.push(fx);
  }
}
