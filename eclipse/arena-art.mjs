import * as T from '../three.min.mjs';
import {floorRing, lightLantern, monument, piece as mesh, ritualFixture} from './map-art.mjs?v=forge-1';

const PI=Math.PI;
const glowOptions={transparent:true,depthWrite:false,blending:T.AdditiveBlending};

function fissure(parent,zone,ink,stone) {
  const group=new T.Group();
  group.position.set(zone.x,.032,zone.z);
  group.rotation.y=-zone.angle;
  parent.add(group);
  const bands=[];
  const length=zone.radius;
  const seed=zone.x*1.45+zone.z*3.19;
  for (let i=0;i<=35;i++) {
    const t=i/35;
    const width=zone.width*(.19+.77*Math.sin(t*PI)**.23);
    const bend=width*(Math.sin(i*2.33+seed)*.28+Math.sin(i*.61)*.35);
    bands.push([(t-.5)*length,bend-width*(.85+Math.sin(i*1.43)*.28),bend+width*(.88+Math.cos(i*2.13)*.26)]);
  }
  const cut=[],light=[],border=[],scorch=[],innerGlow=[],chips=[],chipColors=[];
  const strip=(buffer,left,right)=>buffer.push(...left[0],...left[1],...right[0],...left[1],...right[1],...right[0]);
  for (let i=1;i<bands.length;i++) {
    const [[a,b,c],[d,e,f]]=[bands[i-1],bands[i]];
    const jag=.06+Math.abs(Math.sin(i*7.3+seed))*.17;
    strip(scorch,[[a,-.004,b-.24],[a,-.004,c+.24]],[[d,-.004,e-.24],[d,-.004,f+.24]]);
    strip(cut,[[a,0,b],[a,0,c]],[[d,0,e],[d,0,f]]);
    strip(border,[[a,.046,b-.13],[a,.004,b]],[[d,.043+jag*.19,e-jag],[d,.004,e]]);
    strip(border,[[a,.004,c],[a,.046,c+.13]],[[d,.004,f],[d,.045+jag*.13,f+jag]]);
    const center=(b+c)/2, end=(e+f)/2;
    strip(innerGlow,[[a,.012,center-(c-b)*.28],[a,.012,center+(c-b)*.28]],
      [[d,.012,end-(f-e)*.28],[d,.012,end+(f-e)*.28]]);
    const spread=.018+jag*.20;
    strip(light,[[a,.014,center-spread],[a,.014,center+spread]],[[d,.014,end-spread*.71],[d,.014,end+spread*.71]]);
    if (i%3===1) {
      const side=i%3===0?-1:1;
      const bank=i%2===0?-side:side;
      const tip=bank<0?e:f;
      const arm=zone.width*(.48+jag*2.1)*bank;
      cut.push(d-.16,0,tip,d+.12,0,tip,d+.40,0,tip+arm);
      light.push(d,.012,tip,d+.06,.012,tip,d+.35,.012,tip+arm*.82);
      chips.push(d-.14,.048,tip+arm*.81,d+.07,.11+jag*.28,tip+arm*.55,d+.24,.044,tip+arm*1.18);
      const chip=new T.Color(stone).lerp(new T.Color(0xcab6a1),.32+jag);
      chipColors.push(chip.r,chip.g,chip.b,chip.r*.63,chip.g*.63,chip.b*.63,chip.r*.84,chip.g*.84,chip.b*.84);
    }
  }
  const layer=(points,material,order,colors)=>{
    const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(points,3));
    if (colors) geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    const part=mesh(group,geometry,material);
    part.renderOrder=order;
    return part;
  };
  const solid={side:T.DoubleSide,depthWrite:false};
  layer(scorch,new T.MeshBasicMaterial({...solid,color:0x140d12,transparent:true,opacity:.52}),-8);
  layer(border,new T.MeshBasicMaterial({...solid,color:new T.Color(stone).lerp(new T.Color(0x98776b),.38)}),-7);
  layer(cut,new T.MeshBasicMaterial({...solid,color:new T.Color(stone).multiplyScalar(.14)}),-6);
  layer(chips,new T.MeshBasicMaterial({...solid,vertexColors:true}),-5);
  layer(innerGlow,new T.MeshBasicMaterial({...solid,...glowOptions,color:ink,opacity:.27}),-4);
  const ember=layer(light,new T.MeshBasicMaterial({...solid,...glowOptions,color:ink,opacity:.79}),-3);
  return {group,ember};
}

function pool(parent,zone,ink,stone,style) {
  const group=new T.Group();
  group.position.set(zone.x,.036,zone.z);
  parent.add(group);
  const kind=style==='fire'?1:style==='web'||style==='void'?2:style==='ice'?3:0;
  const surface=new T.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{ink:{value:new T.Color(ink)},stone:{value:new T.Color(stone)},time:{value:0},
      strength:{value:0},seed:{value:zone.x*1.21+zone.z},kind:{value:kind}},
    vertexShader:`varying vec2 tex; void main(){tex=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`
      varying vec2 tex; uniform vec3 ink,stone; uniform float time,strength,seed,kind;
      void main(){
        vec2 p=tex*2.-1.; float angle=atan(p.y,p.x); float r=length(p);
        float rim=1.+.036*sin(angle*7.+seed)+.025*sin(angle*16.-seed);
        float mask=1.-smoothstep(rim-.105,rim+.005,r);
        float edge=exp(-53.*abs(r-rim+.07));
        float fold=sin(p.x*12.+p.y*9.+sin(p.y*10.-time)*1.8-time*.74+seed);
        float gleam=pow(.5+.5*fold,14.);
        float lattice=pow(.5+.5*sin(r*26.-time*2.1+sin(angle*5.)*.6),22.);
        if(kind>0.5&&kind<1.5){
          gleam=pow(1.-abs(sin(p.x*13.+cos(p.y*10.+time)*1.3)*sin(p.y*12.-p.x*3.)),16.);
          lattice*=.32;
        }
        if(kind>1.5&&kind<2.5){gleam=pow(.5+.5*sin(angle*11.+r*4.),26.); lattice*=.58;}
        if(kind>2.5){gleam=pow(.5+.5*sin(fold*1.8+p.y*19.),18.);}
        float detail=gleam*.36+lattice*.15+edge*.39;
        vec3 shade=mix(stone*.47,stone*1.35,clamp(.55+fold*.16-r*.24,0.,1.));
        gl_FragColor=vec4(shade+ink*detail,mask*strength*(.72+detail*.20));
        #include <colorspace_fragment>
      }
    `});
  const water=mesh(group,new T.PlaneGeometry(zone.radius*2.08,zone.radius*2.08).rotateX(-PI/2),surface);
  water.renderOrder=-5;
  return {group,surface};
}

function fixture(view,root,point,mode,ink,stone) {
  if (mode==='light') {
    const lamp=view.makeClue(root);
    lamp.position.set(point.x,0,point.z);
    lamp.scale.setScalar(1.6);
    lamp.visible=true;
    return {root:lamp,point,lamp:true};
  }
  return ritualFixture(view,root,point,mode,ink,stone);
}

export class ArenaArt {
  constructor(view) {
    this.view=view;
    this.root=new T.Group();
    this.phaseRoot=new T.Group();
    view.scene.add(this.root,this.phaseRoot);
  }

  clear(root) {
    const materials=new Set();
    root.traverse(piece=>{
      if (piece.isMesh&&!piece.userData.sharedGeometry) piece.geometry.dispose();
      if (piece.material) materials.add(piece.material);
    });
    materials.forEach(material=>material.dispose());
    root.clear();
  }

  set(arena) {
    this.clear(this.root);
    this.clear(this.phaseRoot);
    this.arena=arena;
    this.fragments=[];
    this.columns=[];
    this.sites=[];
    this.counterMarks=[];
    this.transient=[];
    this.lamps=arena?arena.encounter.lamps.map(({x,z})=>{
      const lamp=this.view.makeClue(this.root);
      lamp.position.set(x,0,z);
      lamp.scale.setScalar(1.14);
      lamp.visible=true;
      lamp.userData.marker.visible=false;
      return lamp;
    }):[];
  }

  transform(arena) {
    this.clear(this.phaseRoot);
    this.transient=[];
    const {ink,stone}=arena.terrain;
    this.fragments=arena.hazards.map(zone=>(zone.kind==='line'?fissure:pool)(this.phaseRoot,zone,ink,stone,arena.plan.style));
    this.columns=arena.pillars.map(point=>monument(this.view,point,ink,{tall:true,stone}));
    for (const column of this.columns) this.phaseRoot.add(column);
    this.sites=arena.points.map(point=>fixture(this.view,this.phaseRoot,point,arena.plan.mode,ink,stone));
    const {weakness,rocks}=arena.counters;
    const reactsToRock=weakness.type==='projectile'||weakness.target==='pillar';
    this.counterMarks=reactsToRock?rocks.map(rock=>{
      const radius=rock.radius+.25;
      const ring=mesh(this.phaseRoot,floorRing(radius-.055,radius,32),
        new T.MeshBasicMaterial({color:0xa7f3df,opacity:.42,...glowOptions}),rock.x,.06,rock.z);
      ring.renderOrder=4;
      return ring;
    }):[];
    for (const zone of arena.hazards) {
      const count=this.view.mobile?3:5;
      for (let i=0;i<count;i++) {
        const position=(i/(count-1)-.5)*(zone.kind==='line'?zone.radius*.86:zone.radius*1.28);
        this.view.spark(zone.x+Math.cos(zone.angle??.7)*position,.30,
          zone.z+Math.sin(zone.angle??.7)*position,ink,6,.96,arena.boss.spec.effect);
      }
    }
    this.view.shake=Math.max(this.view.shake,.46);
  }

  openFissure(hazard) {
    const rock=this.arena.terrain.stone;
    this.transient.push({...fissure(this.phaseRoot,hazard,0xff7957,rock),hazard});
  }

  render(time) {
    const arena=this.arena;
    if (!arena) return;
    const fade=1-Math.exp(-(arena.shift??0)*5.4);
    const dark=arena.darkness;
    const becomesMechanism=arena.phase>0&&arena.encounter.first.mode==='light';
    for (const [index,lamp] of this.lamps.entries()) {
      lamp.visible=!becomesMechanism;
      const lit=!becomesMechanism&&1-dark>index*.16+.23;
      lightLantern(lamp,lit,time,1-dark,index);
    }
    for (const [index,{group,ember,surface}] of this.fragments.entries()) {
      group.scale.setScalar(.08+.92*fade);
      if (ember) ember.material.opacity=fade*(.55+.17*Math.sin(time*4+index*1.8));
      if (surface) {
        surface.uniforms.time.value=time;
        surface.uniforms.strength.value=fade;
      }
    }
    for (const column of this.columns) column.position.y=-1.8*(1-fade);
    for (const [index,mark] of this.counterMarks.entries()) {
      mark.material.opacity=fade*(.31+.11*Math.sin(time*3.2+index));
    }
    this.transient=this.transient.filter(({group,ember,hazard})=>{
      if (hazard.delay<=0||arena.boss.hp<=0) {
        this.phaseRoot.remove(group);
        this.clear(group);
        return false;
      }
      ember.material.opacity=Math.min(1,hazard.delay*2)*(.76+.19*Math.sin(time*7));
      return true;
    });
    for (const [index,site] of this.sites.entries()) {
      const {root,point,lamp,gem,light,charge}=site;
      if (lamp) {
        lightLantern(root,point.done,time,.95,index);
        root.userData.marker.material.opacity=point.done?.24:.67+.16*Math.sin(time*5+index);
        continue;
      }
      root.scale.y=.1+.9*fade;
      gem.rotation.y=time*.56+index*1.4;
      gem.visible=!point.done;
      light.opacity=point.done?.21:.69+.16*Math.sin(time*4.4+index);
      if (charge) {
        const amount=point.done?1:point.charge/arena.plan.hold;
        charge.scale.set(charge.userData.size*amount,charge.userData.size*amount,1);
      }
    }
  }
}
