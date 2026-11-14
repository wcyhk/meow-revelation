import * as T from '../three.min.mjs';

function moonGateDepth(){
  const canvas=document.createElement('canvas');
  canvas.width=256;
  canvas.height=170;
  const ctx=canvas.getContext('2d');
  const depth=ctx.createLinearGradient(0,61,0,170);
  depth.addColorStop(0,'#151515');
  depth.addColorStop(.43,'#323232');
  depth.addColorStop(.75,'#9d9d9d');
  depth.addColorStop(1,'#e5e5e5');
  ctx.fillStyle=depth;
  ctx.fillRect(0,0,256,170);
  const shape=(shade,points)=>{
    ctx.fillStyle=shade;
    ctx.beginPath();
    for(const [i,[x,y]] of points.entries()){
      if(i===0)ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fill();
  };
  ctx.filter='blur(2px)';
  shape('#515151',[[96,119],[117,24],[145,0],[211,0],[209,19],[228,75],[222,121]]);
  shape('#202020',[[158,120],[156,68],[174,43],[193,55],[203,122]]);
  shape('#bcbcbc',[[181,139],[179,117],[192,107],[197,78],[198,68],[205,70],[211,62],[216,70],
    [219,84],[246,82],[250,92],[225,98],[247,107],[235,121],[227,121],[216,140],[208,146],[190,144]]);
  shape('#eeeeee',[[0,134],[21,123],[31,145],[54,135],[59,124],[65,141],[94,131],[118,111],[121,123],
    [142,153],[173,167],[178,170],[0,170]]);
  const map=new T.CanvasTexture(canvas);
  map.generateMipmaps=false;
  map.minFilter=T.LinearFilter;
  return map;
}

export class StoryDepth {
  constructor(canvas){
    this.scene=new T.Scene();
    this.camera=new T.Camera();
    this.shift=new T.Vector2();
    this.pointer=new T.Vector2();
    this.focus=new T.Vector2();
    this.pointerFresh=0;
    this.time=0;
    this.ready=false;
    this.uniforms={
      picture:{value:null},
      depth:{value:moonGateDepth()},
      crop:{value:new T.Vector2(1,1)},
      bias:{value:new T.Vector2(.09,.01)},
      shift:{value:this.shift},
    };
    const material=new T.ShaderMaterial({
      uniforms:this.uniforms,depthTest:false,depthWrite:false,toneMapped:false,
      vertexShader:`varying vec2 screen;void main(){screen=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader:`
        varying vec2 screen;
        uniform sampler2D picture,depth;
        uniform vec2 crop,bias,shift;
        void main(){
          vec2 photo=(screen-.5)*crop*.94+.5+bias;
          float d=texture2D(depth,photo).r;
          vec2 warped=photo+shift*(.22+d*.72);
          d=mix(d,texture2D(depth,warped).r,.50);
          vec3 paint=texture2D(picture,photo+shift*(.22+d*.72)).rgb;
          gl_FragColor=vec4(paint*vec3(.84,.84,.92),1.);
          #include <colorspace_fragment>
        }`,
    });
    const mesh=new T.Mesh(new T.PlaneGeometry(2,2),material);
    mesh.frustumCulled=false;
    this.scene.add(mesh);
    this.canvas=canvas;
    new T.TextureLoader().load('./art/moon-gate.webp',map=>{
      map.colorSpace=T.SRGBColorSpace;
      this.uniforms.picture.value=map;
      this.ready=true;
    },undefined,()=>{});
    document.addEventListener('pointermove',event=>{
      if(!this.active||event.pointerType!=='mouse')return;
      this.pointer.set(event.clientX/Math.max(1,canvas.clientWidth)-.5,
        .5-event.clientY/Math.max(1,canvas.clientHeight));
      this.pointerFresh=2.2;
    },{passive:true});
  }

  setActive(active){
    this.active=active;
    if(active)this.time=0;
    document.getElementById('game').classList.toggle('story-depth-active',active&&this.ready);
  }

  render(renderer,dt,subdued){
    if(!this.active||!this.ready)return false;
    document.getElementById('game').classList.add('story-depth-active');
    this.time+=dt;
    this.pointerFresh=Math.max(0,this.pointerFresh-dt);
    const image=this.uniforms.picture.value.image;
    const viewport=this.canvas.clientWidth/Math.max(1,this.canvas.clientHeight);
    const aspect=viewport/(image.width/image.height);
    const {crop,bias}=this.uniforms;
    crop.value.set(Math.min(1,aspect),Math.min(1,1/aspect));
    bias.value.set(Math.min(.145,(1-crop.value.x)*.28),0);
    this.focus.set(0,0);
    if(!subdued){
      this.focus.set(Math.sin(this.time*.62)*.009,Math.cos(this.time*.45)*.007);
      if(this.pointerFresh>0)this.focus.addScaledVector(this.pointer,.034*Math.min(1,this.pointerFresh));
    }
    this.shift.lerp(this.focus,1-Math.exp(-dt*3.8));
    renderer.render(this.scene,this.camera);
    return true;
  }
}
