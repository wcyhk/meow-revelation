import * as T from '../three.min.mjs';

const quad=new T.PlaneGeometry(1,1);
const normal=new T.Vector3(0,0,1);

function ironwork() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  const edge=new Path2D('M34 246 L34 119 C34 73 79 44 128 10 C177 44 222 73 222 119 L222 246 Z');
  ctx.clip(edge);
  const shade=ctx.createLinearGradient(39,10,208,230);
  shade.addColorStop(0,'#17171b');shade.addColorStop(.38,'#5e5850');shade.addColorStop(.63,'#363139');shade.addColorStop(1,'#17191f');
  ctx.fillStyle=shade;ctx.fillRect(0,0,256,256);
  let seed=81721;
  for(let i=0;i<2600;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const x=seed&255,y=seed>>>16&255;
    ctx.fillStyle=i%3?'#2b232815':'#d1bea328';
    ctx.fillRect(x,y,1+(seed>>>29),1+(seed>>>24&3));
  }
  ctx.lineCap='round';
  ctx.strokeStyle='#938571';ctx.lineWidth=3;
  ctx.stroke(new Path2D('M43 240 V121 Q43 82 128 25 Q213 82 213 121 V240 M45 228 H211 M127 25 V244'));
  ctx.strokeStyle='#131318';ctx.lineWidth=8;
  ctx.stroke(new Path2D('M34 246 H224 M126 28 V246'));
  for(const x of [56,75,94,111,145,162,181,200]){
    const distance=Math.abs(128-x);
    const stem=new Path2D('M'+x+' 230 V'+(46+distance*.90));
    ctx.strokeStyle='#1c1b21';ctx.lineWidth=5;ctx.stroke(stem);
    ctx.strokeStyle='#a1937c';ctx.lineWidth=1.3;ctx.stroke(stem);
  }
  for(const sign of [-1,1]){
    ctx.save();ctx.translate(128,0);ctx.scale(sign,1);
    ctx.strokeStyle='#a19178';ctx.lineWidth=2.2;
    ctx.stroke(new Path2D('M8 214 Q87 159 48 132 Q18 117 20 153 Q32 170 46 154 M10 184 Q65 131 68 97 M8 84 Q45 99 39 131'));
    ctx.restore();
  }
  for(const [x,y] of [[38,125],[38,219],[218,125],[218,219],[97,187],[159,187]]){
    ctx.fillStyle='#c3ac8c';ctx.fillRect(x-1,y-1,3,3);
  }
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  return tex;
}

export class PaintedExit {
  constructor(view) {
    this.mesh=new T.Mesh(quad,new T.ShaderMaterial({
      transparent:true,depthWrite:false,
      uniforms:{plate:{value:ironwork()},tint:{value:new T.Color()},opened:{value:0},time:{value:0},kind:{value:0}},
      vertexShader:`varying vec2 tex;
        void main(){tex=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 tex;
        uniform sampler2D plate;
        uniform vec3 tint;
        uniform float opened,time,kind;
        void main(){
          vec2 p=tex-vec2(.5,.40);
          float d=length(p*vec2(1.,.83));
          float taper=pow(max(0.,1.-length(p*vec2(2.03,1.71))),2.);
          float flicker=.84+.13*sin(time*2.1+tex.y*12.)+.05*sin(time*4.3+tex.x*15.);
          float seam=exp(-abs(p.x+sin(tex.y*8.+time*.84)*.024)*22.);
          float veil=(1.-smoothstep(.01,.045,abs(d-.33+sin(atan(p.y,p.x)*7.+time*.71)*.012)));
          float visible=1.-smoothstep(.23,.90,opened);
          vec2 shutter=tex;
          shutter.x=.5+sign(p.x)*(abs(p.x)-opened*.35);
          vec4 iron=texture2D(plate,shutter);
          iron.a*=step(0.,shutter.x)*step(shutter.x,1.)*step(0.,sign(p.x)*(shutter.x-.5));
          float isIron=1.-step(.5,kind);
          float shimmer=(seam*.37+taper*.59)*opened*flicker;
          float sigil=(veil*.17+seam*.07)*visible*(1.-isIron);
          vec3 rim=tint*(shimmer*.72+sigil*.85);
          float metal=iron.a*visible*isIron*.91;
          vec3 patina=iron.rgb*mix(vec3(.54),tint*.60+vec3(.35),.63);
          gl_FragColor=vec4((patina*metal+rim)/max(.001,metal+shimmer+sigil),max(metal,max(shimmer,sigil)));
          #include <colorspace_fragment>
        }`,
    }));
    this.back=view.back;
    this.mesh.renderOrder=-48;
    this.mesh.visible=false;
    view.scene.add(this.mesh);
  }

  set(frame) {
    const [x,y,w,h]=frame.art;
    const {mesh,back}=this;
    mesh.quaternion.copy(back.quaternion);
    mesh.position.copy(back.position);
    mesh.position.add(normal.set((x-.5)*back.scale.x,(.5-y)*back.scale.y,.42).applyQuaternion(back.quaternion));
    mesh.scale.set(w*back.scale.x,h*back.scale.y,1);
    const {uniforms}=mesh.material;
    uniforms.kind.value=Number(!!frame.veil);
    uniforms.tint.value.setHex(frame.light);
    uniforms.opened.value=0;
    mesh.visible=true;
  }

  update(open,time,dt) {
    const {uniforms}=this.mesh.material;
    uniforms.opened.value+=(Number(open)-uniforms.opened.value)*(1-Math.exp(-dt*7.7));
    uniforms.time.value=time%360;
  }
}
