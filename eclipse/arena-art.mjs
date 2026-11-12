import * as T from '../three.min.mjs';

const PI=Math.PI;
const glowOptions={transparent:true,depthWrite:false,blending:T.AdditiveBlending};

function mesh(parent,geometry,material,x=0,y=0,z=0) {
  const piece=new T.Mesh(geometry,material);
  piece.position.set(x,y,z);
  parent.add(piece);
  return piece;
}

function floorRing(inner,outer,count=48) {
  return new T.RingGeometry(inner,outer,count).rotateX(-PI/2);
}

function fissure(parent,zone,ink,stone) {
  const group=new T.Group();
  group.position.set(zone.x,.032,zone.z);
  group.rotation.y=-zone.angle;
  parent.add(group);
  const bands=[];
  const length=zone.radius;
  for (let i=0;i<=24;i++) {
    const t=i/24;
    const width=zone.width*(.47+.42*Math.sin(t*PI)**.35);
    const bend=width*(Math.sin(i*2.33)*.41+Math.sin(i*.61)*.35);
    bands.push([(t-.5)*length,bend-width*(.85+Math.sin(i*1.43)*.28),bend+width*(.88+Math.cos(i*2.13)*.26)]);
  }
  const cut=[],light=[],border=[];
  const strip=(buffer,left,right)=>buffer.push(...left[0],...left[1],...right[0],...left[1],...right[1],...right[0]);
  for (let i=1;i<bands.length;i++) {
    const [[a,b,c],[d,e,f]]=[bands[i-1],bands[i]];
    strip(cut,[[a,0,b],[a,0,c]],[[d,0,e],[d,0,f]]);
    strip(border,[[a,.025,b-.14],[a,.004,b]],[[d,.025,e-.14],[d,.004,e]]);
    strip(border,[[a,.004,c],[a,.025,c+.14]],[[d,.004,f],[d,.025,f+.14]]);
    const center=(b+c)/2, end=(e+f)/2;
    strip(light,[[a,.012,center-.075],[a,.012,center+.075]],[[d,.012,end-.05],[d,.012,end+.05]]);
    if (i%4===1) {
      const side=i%3===0?-1:1;
      const tip=side<0?e:f;
      const arm=zone.width*(1.1+(i%3)*.34)*side;
      cut.push(d-.16,0,tip,d+.12,0,tip,d+.40,0,tip+arm);
      light.push(d,.012,tip,d+.06,.012,tip,d+.37,.012,tip+arm*.92);
    }
  }
  const layer=(points,material,order)=>{
    const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(points,3));
    const part=mesh(group,geometry,material);
    part.renderOrder=order;
    return part;
  };
  const solid={side:T.DoubleSide,depthWrite:false};
  layer(border,new T.MeshBasicMaterial({...solid,color:stone}),-5);
  layer(cut,new T.MeshBasicMaterial({...solid,color:new T.Color(stone).multiplyScalar(.21)}),-4);
  const ember=layer(light,new T.MeshBasicMaterial({...solid,...glowOptions,color:ink,opacity:.83}),-3);
  return {group,ember};
}

function pool(parent,zone,ink,stone) {
  const group=new T.Group();
  group.position.set(zone.x,.036,zone.z);
  parent.add(group);
  const bottom=mesh(group,new T.CircleGeometry(zone.radius,30).rotateX(-PI/2),
    new T.MeshBasicMaterial({color:stone,transparent:true,opacity:.78,depthWrite:false}));
  bottom.renderOrder=-4;
  const wave=new T.MeshBasicMaterial({color:ink,opacity:.52,...glowOptions});
  const ember=mesh(group,floorRing(zone.radius*.94,zone.radius,36),wave,0,.013);
  ember.renderOrder=-3;
  for (const scale of [.51,.72]) {
    const ripple=mesh(group,floorRing(zone.radius*.92*scale,zone.radius*scale,36),wave,0,.014);
    ripple.renderOrder=-3;
  }
  return {group,ember};
}

function pillar(parent,point,stone,ink,map) {
  const group=new T.Group();
  group.position.set(point.x,0,point.z);
  parent.add(group);
  const r=point.radius;
  const rock=new T.MeshStandardMaterial({color:stone,map,roughness:.88,bumpMap:map,bumpScale:.10});
  const metal=new T.MeshStandardMaterial({color:0x67523f,roughness:.53,metalness:.49});
  const rune=new T.MeshBasicMaterial({color:ink,opacity:.84,...glowOptions});
  mesh(group,new T.CylinderGeometry(r*.86,r,.23,8),metal,0,.12);
  mesh(group,new T.CylinderGeometry(r*.64,r*.91,1.45,6),rock,0,.94);
  mesh(group,new T.CylinderGeometry(r*.70,r*.64,.19,6),metal,0,1.67);
  mesh(group,new T.OctahedronGeometry(r*.35),rune,0,1.96);
  return group;
}

function fixture(view,root,point,mode,ink,stone) {
  if (mode==='light') {
    const lamp=view.makeClue(root);
    lamp.position.set(point.x,0,point.z);
    lamp.scale.setScalar(1.6);
    lamp.visible=true;
    return {root:lamp,point,lamp:true};
  }
  const base=new T.Group();
  base.position.set(point.x,0,point.z);
  root.add(base);
  const raised=mode==='break'||mode==='bait';
  const plate=new T.MeshStandardMaterial({color:stone,roughness:.73,metalness:.21,map:view.battleTextures.stone});
  const light=new T.MeshBasicMaterial({color:ink,opacity:.88,...glowOptions});
  const baseWidth=mode==='hold'?1.24:.80;
  mesh(base,new T.CylinderGeometry(baseWidth,baseWidth*1.06,.16,8),plate,0,.08);
  mesh(base,floorRing(baseWidth*.81,baseWidth*.96,8),light,0,.175);
  const gem=raised
    ?mesh(base,new T.OctahedronGeometry(mode==='bait'?.65:.53),light,0,.92)
    :mesh(base,floorRing(.36,.48,4),light,0,.188);
  if (raised) {
    gem.scale.set(1,1.36,mode==='bait'?.32:1);
    mesh(base,new T.CylinderGeometry(.20,.44,.45,6),plate,0,.34);
  }
  let charge;
  if (mode==='hold') {
    charge=mesh(base,new T.CircleGeometry(1.03,28).rotateX(-PI/2),
      new T.MeshBasicMaterial({color:ink,opacity:.26,...glowOptions}),0,.19);
  }
  return {root:base,point,gem,light,charge};
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
      if (piece.geometry) piece.geometry.dispose();
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
    this.fragments=arena.hazards.map(zone=>(zone.kind==='line'?fissure:pool)(this.phaseRoot,zone,ink,stone));
    this.columns=arena.pillars.map(point=>pillar(this.phaseRoot,point,stone,ink,this.view.battleTextures.stone));
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
      const {flame,halo}=lamp.userData;
      lamp.visible=!becomesMechanism;
      const lit=!becomesMechanism&&1-dark>index*.16+.23;
      flame.visible=halo.visible=lit;
      flame.rotation.y=time*.78+index;
      halo.material.opacity=(1-dark)*(.68+.13*Math.sin(time*7+index));
    }
    for (const [index,{group,ember}] of this.fragments.entries()) {
      group.scale.setScalar(.08+.92*fade);
      ember.material.opacity=fade*(.51+.21*Math.sin(time*4+index*1.8));
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
        root.userData.flame.visible=root.userData.halo.visible=point.done;
        root.userData.flame.rotation.y=time*.85;
        root.userData.marker.material.opacity=point.done?.24:.67+.16*Math.sin(time*5+index);
        continue;
      }
      root.scale.y=.1+.9*fade;
      gem.rotation.y=time*.56+index*1.4;
      gem.visible=!point.done;
      light.opacity=point.done?.21:.69+.16*Math.sin(time*4.4+index);
      if (charge) charge.scale.setScalar(point.done?1:point.charge/arena.plan.hold);
    }
  }
}
