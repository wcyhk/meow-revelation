const TAU=Math.PI*2;

// Locate both edges of a forged blank at a specific height. The raised fuller follows
// that weapon's actual contour, including crooked blades and split spearheads.
function bladeSections(outline,y) {
  const hits=[];
  for(let i=0;i<outline.length;i+=2){
    const next=(i+2)%outline.length;
    const x0=outline[i],y0=outline[i+1],x1=outline[next],y1=outline[next+1];
    if((y0<=y&&y1>y)||(y1<=y&&y0>y))hits.push(x0+(x1-x0)*(y-y0)/(y1-y0));
  }
  hits.sort((a,b)=>a-b);
  return Array.from({length:hits.length/2},(_,i)=>[hits[i*2],hits[i*2+1]]);
}

function chisel(h,outline,base,tip,depth,seed) {
  const sections=[];
  const {line,plate,gem}=h;
  for(let i=0;i<=13;i++){
    const y=base+(tip-base)*i/13;
    const spans=bladeSections(outline,y).filter(([left,right])=>right-left>.23);
    if(!spans.length)continue;
    const center=sections.at(-1)?.x??0;
    const [left,right]=spans.reduce((a,b)=>Math.abs((a[0]+a[1])/2-center)<
      Math.abs((b[0]+b[1])/2-center)?a:b);
    sections.push({y,x:(left+right)*.5,width:(right-left)*.5});
  }
  if(sections.length<2)return;
  for(const side of [-1,1]){
    for(const lane of [-1,1]){
      const track=sections.map(({x,y,width},i)=>[x+lane*width*.32,y,side*(depth+.10+Math.sin(i*.20)*.10)]);
      line(track,.055+seed%3*.012,lane===side?'trim':'dark',false);
    }
    for(let i=1;i<sections.length-1;i+=2+seed%2){
      const {x,y,width}=sections[i];
      const w=Math.min(.33,width*.26),z=side*(depth+.112);
      if(w<.07)continue;
      const serration=(seed>>(i%9))&1;
      plate(serration?[0,-.25,-w,0,0,.30,w,0]:[-w,-.27,w*.56,-.13,w,.20,-w*.45,.08],
        i%4===1?'trim':'edge',.075,[x,y,z],.035);
      if(i%4===1)gem([x,y,side*(depth+.18)],w*.41,'core',[.82,1.19,.35]);
    }
  }
}

export function detailForgedBlade(h,outline,depth,seed) {
  const ys=outline.filter((_,i)=>i%2);
  const low=Math.min(...ys),high=Math.max(...ys);
  chisel(h,outline,low+(high-low)*.12,high-(high-low)*.18,depth,seed);
}

function rimWork(h,radius,z,seed) {
  for(const side of [-1,1])for(let i=0;i<5+seed%3;i++){
    const a=TAU*i/(5+seed%3)+(seed%17)*.071;
    const p=(angle,r,lift)=>[Math.sin(angle)*r,Math.cos(angle)*r,side*(z+lift)];
    h.line([p(a-.18,radius+.07,0),p(a-.085,radius-.24,.12),p(a,radius-.37,.19),
      p(a+.085,radius-.24,.12),p(a+.18,radius+.07,0)],.075,'trim',false);
    h.gem(p(a,radius-.19,.18),.19,i%3?'edge':'core',[.70,1.05,.55]);
  }
}

function socket(h,x,y,radius,seed) {
  const count=3+seed%3;
  for(let i=0;i<count;i++){
    const yy=y+(i-(count-1)*.5)*.32;
    const band=h.loop([x,yy],radius+(i===0||i===count-1?.065:0),.080,i%2?'edge':'trim','xz',12);
    band.rotation.z=(seed%2?1:-1)*.10;
  }
}

export function detailWeapon(h,weapon,kind,recipe) {
  let seed=0;
  for(const char of weapon.id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
  const {gem,line,plate}=h;
  switch(kind){
    case 'blade':
      detailForgedBlade(h,recipe[2],.56,seed);
      socket(h,0,recipe[0]==='bone'?-7.52:-7.32,.61,seed);
      break;
    case 'pole':case 'axe':
      detailForgedBlade(h,recipe[1],kind==='axe'?.62:.52,seed);
      socket(h,0,kind==='axe'?-7.07:-7.56,.66,seed);
      break;
    case 'wheel':rimWork(h,recipe[0],.53,seed);break;
    case 'orb':
      if(recipe[1]==='fortune')rimWork(h,recipe[0]-.44,.72,seed);
      else for(let i=0;i<5;i++){
        const angle=(seed%13)*.22+i*TAU/5;
        for(const side of [-1,1]){
          const r=recipe[0],p=(a,depth)=>[Math.cos(a)*r*.69,Math.sin(a)*r*.69,side*r*depth];
          line([p(angle-.24,.47),p(angle-.06,.56),p(angle+.07,.57),p(angle+.21,.49)],.085,'trim');
          gem(p(angle,.584),r*.064,i%2?'edge':'core',[.65,1.24,.48]);
        }
      }
      break;
    case 'bow':{
      const bow=h.root.userData.bow;
      for(const [i,[x,y]] of recipe[0].slice(1,-1).entries()){
        const band=h.loop([x,y],.52,.075,i%2?'edge':'trim','xz',11);
        band.rotation.z=(x+1.9)*-.16;
        bow.attachments.push({mesh:band,rest:band.position.clone()});
      }
      break;
    }
    case 'rifle':case 'cannon':{
      const cannon=kind==='cannon';
      for(const y of cannon?[2.06,3.05,4.17]:[3.06,5.14,7.32])for(const side of [-1,1]){
        const z=side*(cannon?1.55:.49);
        line([[-.24,y-.22,z],[.03,y,z*1.04],[.30,y+.29,z]],cannon?.071:.044,'edge',false);
        gem([.031,y,z*1.08],cannon?.135:.084,'trim',[.86,.82,.45]);
      }
      break;
    }
    case 'crossbow':
      for(const side of [-1,1])line([[side*.37,-3.64,.54],[side*.41,-1.32,.64],[side*.42,1.09,.51]],.094,'trim');
      break;
    case 'beads':{
      const earth=recipe[0]==='earth',count=earth?12:10;
      for(let i=0;i<count;i++){
        const a=i*TAU/count;
        const bead=h.loop([Math.sin(a)*(earth?3.88:3.44),Math.cos(a)*(earth?4.62:3.72)+.9,Math.sin(a*2)*.72],
          earth?.54+i%3*.05:.76+i%3*.10,.062,i%3?'trim':'edge','xz',12);
        bead.rotation.z=Math.sin(a+seed%4)*.82;
      }
      break;
    }
    case 'seal':rimWork(h,4.76,.61,seed);break;
    case 'bell':
      for(let i=0;i<8;i++){
        const a=TAU*i/8,p=(r,y,t=0)=>[Math.sin(a+t)*r,y,Math.cos(a+t)*r];
        line([p(2.67,5.48,-.12),p(2.49,5.99,.01),p(2.36,6.46,.09),p(2.31,6.89,.04)],.083,i%3?'edge':'body');
        gem(p(2.42,6.43,.10),.17,'core',[.72,1.37,.71]);
      }
      break;
    case 'lute':
      plate([0,-7.42,-1.45,-6.92,-2.46,-5.55,-2.04,-4.17,-.84,-3.16,0,-2.36,.78,-3.15,
        2.05,-4.16,2.44,-5.53,1.45,-6.93],'body',.35,[0,0,-1.11],.11);
      for(const side of [-1,1])line([[0,-7.16,-1.34],[side*1.61,-6.58,-1.36],[side*2.04,-5.40,-1.35],
        [side*1.40,-4.45,-1.38],[0,-3.14,-1.33]],.091,'trim');
      break;
    case 'box':
      for(const side of [-1,1])for(const x of [-1,1])line([[0,-4.2,side*1.17],[x*1.02,-2.4,side*1.23],
        [x*2.09,-1.62,side*1.13],[x*2.24,1.24,side*1.10],[x*1.31,3.76,side*1.18]],.085,'core');
      break;
    case 'branch':socket(h,0,-7.37,.67,seed);break;
    case 'staff':socket(h,0,-7.97,.56,seed);socket(h,0,1.57,.59,seed>>>4);break;
    case 'twins':break; // The two blade groups receive the contour tooling individually.
    default:{
      const anchors={
        beak:[-1.38,1.36,.78],shell:[0,-.58,.89],tusk:[0,-1.18,.73],claw:[.56,-.69,.89],
        feather:[0,-1.45,.72],snake:[0,-3.88,3.62],doll:[0,.47,1.33],fish:[0,-.62,.95],
      };
      const [x,y,z]=anchors[kind];
      for(const side of [-1,1]){
        const fit=plate([-.72,0,-.35,.48,-.02,.59,.37,.42,.69,0,.29,-.16,-.25,-.25],
          kind==='doll'?'dark':'trim',.21,[x,y,side*z],.075);
        fit.rotation.z=side*(seed%9-4)*.13;
        gem([x,y+.12,side*(z+.22)],.23,'core',[.77,1.28,.53]);
      }
    }
  }
}
