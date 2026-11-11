
"use strict";

const shoreLights={
  village:{warm:0xf8bd75,cool:0x6bd4be,air:0x97b2be},
  entry:{warm:0xfe8f88,cool:0x65dfe0,air:0x879eeb},
  reef:{warm:0xf7ae86,cool:0x56d9cf,air:0x5faab7},
  fen:{warm:0xac92ed,cool:0x64ffe1,air:0x83d4e3},
  boss:{warm:0xfba076,cool:0xd29af8,air:0xb671a6},
  exchange:{warm:0xffb768,cool:0x8eb6bf,air:0xab896c},
  cistern:{warm:0x92bb85,cool:0x52dece,air:0x679899},
  archive:{warm:0xffa86a,cool:0xd290b8,air:0xb77872},
  vault:{warm:0xff9d5c,cool:0xe0b478,air:0xcc8363},
  flats:{warm:0xc3a4db,cool:0xa2c7f3,air:0xb7a9d4},
  wreck:{warm:0xd69d7c,cool:0x70c4e6,air:0x81aecb},
  salt:{warm:0xd1a7ff,cool:0xa0edfc,air:0xa4c4ee},
  abbey:{warm:0xb794eb,cool:0xa1ceff,air:0x9bafd9},
  cliff:{warm:0xff8264,cool:0xc4a4ce,air:0xca7489},
  garden:{warm:0xe28499,cool:0xa6ead0,air:0xa593b2},
  bridge:{warm:0xedac70,cool:0x75ecd7,air:0x77bbb8},
  temple:{warm:0xff806e,cool:0x72ffe0,air:0xc26b92},
};

function paintTexture(scene,key,width,height,paint){
  if(scene.textures.exists(key))return;
  const canvas=document.createElement("canvas");
  canvas.width=width;canvas.height=height;
  const c=canvas.getContext("2d");
  paint(c,width,height);
  scene.textures.addCanvas(key,canvas);
}

class ShoreCinema{
  constructor(scene){
    this.scene=scene;
    paintTexture(scene,"shore-glow",128,128,(c,w,h)=>{
      const light=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      light.addColorStop(0,"#ffffffdc");light.addColorStop(.22,"#ffffff69");
      light.addColorStop(.52,"#ffffff23");light.addColorStop(1,"#ffffff00");
      c.fillStyle=light;c.fillRect(0,0,w,h);
    });
    paintTexture(scene,"shore-fog",320,96,(c,w,h)=>{
      c.save();c.scale(1,.21);
      for(let i=0;i<9;i++){
        const x=(i+1)*w/10,y=225+Math.sin(i*2.2)*42,r=39+(i%3)*20;
        const haze=c.createRadialGradient(x,y,0,x,y,r);
        haze.addColorStop(0,"#ffffff45");haze.addColorStop(.48,"#ffffff13");haze.addColorStop(1,"#ffffff00");
        c.fillStyle=haze;c.fillRect(x-r,y-r,r*2,r*2);
      }
      c.restore();
    });
    this.lights=Array.from({length:4},()=>scene.add.image(0,0,"shore-glow").setDepth(-1.6).setBlendMode(Phaser.BlendModes.ADD));
    this.fog=Array.from({length:5},(_,i)=>scene.add.image(0,0,"shore-fog").setDepth(i===4?45:-1.4));
    this.villageArt=Array.from({length:5},()=>scene.add.sprite(0,0,"village-props",0).setOrigin(.5,.78));
    this.glyphs=scene.add.graphics().setDepth(-.8);
    this.echoes=[];this.numbers=[];
    this.flash=document.getElementById("screen-flash");
  }
  prepare(b,t){
    this.echoCount=0;this.numberCount=0;
    const {width:w,height:h,location}=b;
    const palette=shoreLights[location];
    const view=Math.max(0,Math.min(1,(w-330)/650));
    const p=b.player;
    const activeBoss=b.enemies.find(e=>isBoss(e)&&e.hp>0);
    const pulse=Math.sin(t*4.2)*.02;
    const positionOffset=reducedMotion.matches?0:clamp((p.x/w-.5)*12,-6,6);
    this.scene.background.setPosition(w/2-positionOffset,h/2);
    const flare=b.phase==="victory"?Math.max(0,(b.victory-.17)*.34):0;
    this.lights.forEach((light,i)=>{
      if(i===3){
        light.setPosition(p.x,p.y-16).setDisplaySize(168,154).setTint(palette.cool)
          .setAlpha((p.dash?.26:p.attack?.20:.096)+flare);
        return;
      }
      const x=i===0?w*(.16+view*.05):i===1?w*(.84-view*.05):w*.5;
      const y=i===2?h*(areas[location].guardian?.30:.27):h*.365;
      light.setPosition(x,y).setDisplaySize(i===2?Math.min(w*.95,395):268,i===2?354:215)
        .setTint(i===2?palette.cool:palette.warm).setAlpha((i===2?.29:.24)+pulse+flare);
    });
    this.fog.forEach((fog,i)=>{
      const x=w*(i*.263-.04)+Math.sin(t*.36+i*3)*(.11*w+10);
      const y=h*(.35+i*.142)+Math.sin(t*.65+i)*10;
      fog.setPosition(x,y).setDisplaySize(w*(i===4?1.65:1.15),i===4?142:119)
        .setTint(palette.air).setAlpha(i===4?.66:.44);
    });
    this.placeVillage(b);
    const g=this.glyphs;
    g.clear();
    if(activeBoss){
      const x=activeBoss.x,y=activeBoss.y;
      const radius=76+Math.sin(t*2.8)*7;
      const alpha=b.intro>0?.54:activeBoss.enraged?.42:.27;
      const color=activeBoss.enraged?0xf0979e:0xa9ffe3;
      g.lineStyle(1.5,color,alpha).strokeEllipse(x,y,radius*2.05,radius*1.06);
      g.lineStyle(1,color,alpha*.6).strokeEllipse(x,y,radius*1.68,radius*.83);
      for(let i=0;i<12;i++){
        const a=i*TAU/12+t*.14;
        const px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius*.51;
        g.fillStyle(color,alpha).fillCircle(px,py,i%3===0?2.8:1.4);
      }
    }
    const hurt=b.hurtFlash||0;
    const strength=reducedMotion.matches?.40:1;
    this.flash.style.opacity=String(Math.max(hurt*.64,flare*.72)*strength);
  }
  placeVillage(b){
    const v=b.village,w=b.width,h=b.height;
    const props=[
      {frame:2,x:.15,y:.444,width:96,show:true},
      {frame:4,x:.84,y:.45,width:83,show:true},
      {frame:0,x:.236,y:.672,width:118+v.garden*13,show:v.garden>0},
      {frame:1,x:.762,y:.671,width:112,show:v.shrine>0},
      {frame:3,x:.36,y:.63,width:97,show:v.rescued>=2},
    ];
    this.villageArt.forEach((sprite,i)=>{
      const prop=props[i];
      const visible=b.location==="village"&&prop.show;
      sprite.setVisible(Boolean(visible));
      if(visible)sprite.setFrame(prop.frame).setPosition(w*prop.x,h*prop.y).setDisplaySize(prop.width,prop.width).setDepth(9+h*prop.y*.02);
    });
  }
  bolt(g,b,t){
    const a=b.angle,x=b.x,y=b.y-17,dx=Math.cos(a),dy=Math.sin(a);
    if(!b.friendly){
      g.lineStyle(9,0x8b58d4,.34).lineBetween(x-dx*30,y-dy*30,x,y);
      g.fillStyle(0xb083e3,.8).fillCircle(x,y,10);
      g.fillStyle(0xffc2f4,.92).fillCircle(x,y,4);
      g.lineStyle(1,0xf1b0eb,.7).strokeCircle(x,y,12+Math.sin(t*10)*2);
      return;
    }
    const r=21+Math.sin(t*17)*1.7;
    g.lineStyle(17,0x68f2da,.19).lineBetween(x-dx*47,y-dy*47,x,y);
    g.lineStyle(5,0x84ffe2,.8).lineBetween(x-dx*41,y-dy*41,x,y);
    g.fillStyle(0xe7fff0,1).lineStyle(2,0x89fbe6,.9);
    g.beginPath();g.arc(x,y,r,a-1.18,a+1.18);
    g.arc(x,y,r*.57,a+1.18,a-1.18,true);g.closePath();g.fillPath();g.strokePath();
    for(let i=0;i<3;i++){
      const phase=Math.sin(t*21+i*2),tail=15+i*11;
      g.fillStyle(0x93ffdb,.62).fillCircle(x-dx*tail-dy*phase*9,y-dy*tail+dx*phase*9,2.7-i*.49);
    }
  }
  slash(g,e,heading,arc,r,alpha){
    const path=(outer,inner)=>{
      g.beginPath();g.arc(e.x,e.y,outer,heading,heading+arc);
      g.arc(e.x,e.y,inner,heading+arc,heading,true);g.closePath();
    };
    g.fillStyle(e.color,alpha*.15);path(r*1.11,r*.47);g.fillPath();
    g.fillStyle(e.color,alpha*.92).lineStyle(2.4,0x301d36,alpha*.83);
    path(r,r*.57);g.fillPath();g.strokePath();
    g.lineStyle(2.5,0xfffaeb,alpha).beginPath();
    g.arc(e.x,e.y,r-2,heading+.08,heading+arc-.08);g.strokePath();
    g.lineStyle(1.6,e.color,alpha*.62).beginPath();
    g.arc(e.x,e.y,r*1.10,heading+.25,heading+arc*.82);g.strokePath();
  }
  effect(g,e){
    const alpha=clamp(e.left/e.life,0,1),t=1-alpha;
    if(e.kind==="echo"){
      if(reducedMotion.matches)return true;
      const i=this.echoCount++;
      if(!this.echoes[i])this.echoes[i]=this.scene.add.sprite(0,0,"cast",11).setOrigin(.5,.88).setDepth(7);
      this.echoes[i].setVisible(true).setPosition(e.x,e.y).setDisplaySize(e.size,e.size)
        .setFlipX(Math.cos(e.angle)<-.14).setTint(e.color).setTintMode(Phaser.TintModes.FILL).setAlpha(alpha*.33);
      return true;
    }
    if(e.kind==="number"){
      const i=this.numberCount++;
      if(!this.numbers[i])this.numbers[i]=this.scene.add.text(0,0,"",{
        fontFamily:"Georgia,serif",fontSize:"25px",fontStyle:"bold",stroke:"#201128",strokeThickness:5,
      }).setOrigin(.5,.5).setDepth(57);
      const label=this.numbers[i];
      if(label.text!==e.text)label.setText(e.text);
      label.setColor("#"+e.color.toString(16).padStart(6,"0")).setVisible(true)
        .setPosition(e.x+Math.sin(e.y*.23)*t*15,e.y-t*43).setScale(.83+Math.min(.24,t*1.2))
        .setAlpha(Math.min(1,alpha*2.4));
      return true;
    }
    if(e.kind==="sigil"){
      const r=e.size*(.31+t*.71);
      g.fillStyle(e.color,.17*alpha).fillEllipse(e.x,e.y,r*2,r*1.35);
      g.lineStyle(2.2,e.color,.92*alpha).strokeEllipse(e.x,e.y,r*2,r*1.34);
      g.lineStyle(1.2,0xfff0ca,.82*alpha).strokeEllipse(e.x,e.y,r*1.60,r*1.05);
      for(let i=0;i<8;i++){
        const a=i*TAU/8+t*.64,x=e.x+Math.cos(a)*r*.84,y=e.y+Math.sin(a)*r*.57;
        const size=4+alpha*6;
        g.fillStyle(0xffedd0,alpha*.82).fillTriangle(x,y-size,x+size*.55,y+size*.4,x-size*.55,y+size*.4);
      }
      const pillar=alpha*85;
      g.fillStyle(e.color,alpha*.19).fillEllipse(e.x,e.y-pillar*.34,r*.95,pillar*1.16);
      return true;
    }
    return false;
  }
  finish(){
    for(let i=this.echoCount;i<this.echoes.length;i++)this.echoes[i].setVisible(false);
    for(let i=this.numberCount;i<this.numbers.length;i++)this.numbers[i].setVisible(false);
  }
}
