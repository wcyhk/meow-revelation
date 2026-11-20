import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const mirror=(s,path)=>path.map(([x,...rest])=>[s*x,...rest]);
const curve=(k,j,m,p,steps=12)=>k.sculpt.sweep(j,m,p,{steps,sides:7,ridge:.19});
const panel=(k,j,m,p,depth=.048)=>k.sculpt.plate(j,m,p,depth,.015);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?11:17,rings:mobile?14:22,section:2.22,ridge:.22,seed,
}));

const shapes={
  'cursed-cane':{form:'chain',name:'夜紗追契者',size:[.31,.99,.76],tone:0xd9a5ed,shape:'ribbons',drop:1.12,
    tint:[0x322638,0x624766,0x9a7785,0x4f3256]},
  'ice-talisman':{form:'seal',name:'霜函追契者',size:[.34,1.18,.95],tone:0xafedff,shape:'sigils',drop:1.31,
    tint:[0x314151,0x557588,0xd2d5be,0x456880]},
  'emperor-rod':{form:'palace',name:'夜紗追契者',size:[.44,1.22,1.04],tone:0xddadfd,shape:'mist',drop:1.23,
    tint:[0x28252d,0x4f3c49,0xb39367,0x5d3149]},
};

function surfaces(k,tint){
  for(const [i,name] of ['arcaneCore','arcaneMetal','arcaneRim','arcaneCloth'].entries()){
    const metal=i===1||i===2;
    k.materials[name]=paintedFinish(new T.MeshStandardMaterial({color:tint[i],vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:metal?.76:.23,metalness:metal?.63:.10,
      roughness:metal?.44:.77}),['hide','iron','bronze','cloth'][i],true,true);
  }
}

function rituals(k,head,form,mobile){
  if(form==='chain'){
    cast(k,head,'arcaneCloth',[[0,-.23,.12,.12,.105],[0,-.072,.069,.179,.161],[0,.118,-.056,.229,.209],
      [0,.252,-.162,.175,.159],[.041,.369,-.278,.105,.106],[.089,.41,-.389,.043,.065]],mobile,5.29);
  }else{
    const wide=form==='seal'?.184:.238;
    cast(k,head,'arcaneCore',[[0,-.228,.079,wide*.58,.121],[0,-.074,.049,wide,.165],[0,.13,-.053,wide*1.03,.205],
      [0,.283,-.077,wide*.84,.166],[0,.42,-.117,wide*.58,.105]],mobile);
  }
  for(const side of sides){
    const z=form==='chain'?.245:form==='seal'?.302:.329;
    const face=mirror(side,[[.035,.192,z],[.137,.167,z-.071],[.202,.062,z-.173],[.203,-.309,z-.198],
      [.121,-.265,z-.005],[.083,-.143,z+.072],[.027,-.119,z+.052]]);
    panel(k,head,'arcaneMetal',face,.050);
    curve(k,head,'arcaneRim',face.slice(1,6).map(([x,y,z],i)=>[x,y+.023,z+.028,[.016,.027,.021,.015,.004][i]]));
    curve(k,head,'glow',mirror(side,[[.041,.062,z+.081,.009],[.09,.090,z+.055,.019],[.146,.111,z-.024,.004]]));
    if(form==='palace'){
      const wing=mirror(side,[[.044,.233,.081],[.219,.287,-.079],[.351,.427,-.225],[.277,.57,-.301],
        [.106,.651,-.246],[.037,.497,-.057]]);
      panel(k,head,'arcaneMetal',wing,.06);
      curve(k,head,'arcaneRim',wing.map(([x,y,z])=>[x,y+.024,z+.027,.015]));
    }else if(form==='seal'){
      curve(k,head,'arcaneRim',mirror(side,[[.081,.19,.073,.026],[.174,.313,-.028,.053],
        [.285,.439,-.207,.041],[.269,.591,-.369,.005]]),15);
      for(let n=0;n<3;n++){
        const t=n*.045;
        curve(k,head,n%2?'arcaneCloth':'arcaneRim',mirror(side,[[.143,.145-t,-.118,.041],
          [.232,.074-t,-.249,.049],[.259,-.147-t,-.382,.028],[.237,-.258-t,-.433,.004]]),16);
      }
    }
  }
}

function pairRelic(k,hand,form,flaps){
  const tool=k.bone(hand,.028,.08,.132);
  if(form==='seal'){
    markEnemyWeapon(tool,[0,.71,.11],{from:[0,-.23,.046],width:.23,aim:false,kind:'focus'});
    const outer=[[-.142,-.189,.053],[.130,-.19,.057],[.183,.40,.073],[.129,.714,.09],
      [-.141,.682,.079],[-.181,.465,.055]];
    panel(k,tool,'arcaneRim',outer,.055);
    panel(k,tool,'arcaneMetal',outer.map(([x,y,z])=>[x*.84,y*.94,z+.036]),.024);
    for(let i=0;i<4;i++){
      const y=-.07+i*.173;
      curve(k,tool,'glow',[[-.084,y,.13,.012],[-.028,y+.047,.14,.014],[.079,y+.022,.141,.010],
        [.074,y-.030,.149,.003]]);
    }
  }else{
    const short=form==='chain',top=short?1.12:1.45;
    markEnemyWeapon(tool,[.095,top+.175,.13],{from:[0,-.45,.035],width:short?.14:.17});
    curve(k,tool,'arcaneCore',[[0,-.68,-.06,.043],[-.011,-.34,.005,.049],
      [.016,.14,.053,.051],[.027,.625,.102,.050],[.063,top,.137,.063]],18);
    for(const side of sides){
      const arch=mirror(side,[[.039,top-.208,.05,.036],[.123,top-.12,.133,.067],
        [.214,top+.063,.166,.044],[.172,top+.25,.191,.019],[.079,top+.31,.178,.005]]);
      curve(k,tool,'arcaneRim',arch,14);
      curve(k,tool,'glow',arch.map(([x,y,z,r])=>[x,y+.012,z+.029,r*.34]));
    }
    k.mesh(tool,'gem','arcaneMetal',0,top+.037,.124,.100,.167,.084);
    if(short)for(let n=0;n<4;n++){
      k.mesh(tool,'chain','arcaneRim',.169+n*.021,top-n*.1,.081-n*.038,.059,.099,.72,0,n*.93,-.25);
    }
  }
  flaps.push({joint:tool,axis:'z',amp:.16,bias:.09,seed:7.8});
}

function hexDress(k,body,back,data,mobile,flaps){
  const {form,name}=data;
  for(const side of sides){
    const anchor=k.bone(back,side*.148,.36,-.164);
    anchor.name=name+' · '+(form==='chain'?'後繫鎖':form==='seal'?'結界冰牌':'黑檀御屛');
    if(form==='chain'){
      for(let n=0;n<(mobile?6:9);n++){
        const rise=n/(mobile?5:8),x=(.12+Math.sin(rise*Math.PI)*.36)*side,y=.36-rise*.81,z=-.10-rise*.29;
        k.mesh(anchor,'chain',n%2?'arcaneRim':'arcaneMetal',x,y,z,.078,.116,.67,0,n*.91,side*.19);
      }
    }else{
      const w=form==='seal'?.139:.255,length=form==='seal'?.61:.86;
      for(let row=0;row<3;row++){
        const rise=row*.115;
        const fin=k.bone(anchor,side*(.052+row*.105),rise,-row*.091);
        const design=mirror(side,[[.019,.106,.057],[w*.92,.181,-.071],[w*1.18,-.013,-.151],
          [w*1.06,-length*.61,-.235],[w*.70,-length,-.281],[.021,-length*.60,-.132]]);
        panel(k,fin,row%2?'arcaneMetal':'arcaneRim',design,.051);
        curve(k,fin,'arcaneMetal',design.slice(1,5).map(([x,y,z])=>[x,y-.016,z-.029,.024]));
        for(let i=0;i<4;i++){
          const y=-.041-i*.115,d=-.199-i*.025;
          curve(k,fin,i%2?'arcaneRim':'glow',mirror(side,[[.041,y,d,.008],[w*.53,y+.033,d-.021,.015],
            [w*.86,y-.025,d-.046,.009]]),9);
        }
        flaps.push({joint:fin,axis:'y',amp:.14+row*.04,bias:side*.10,seed:row*.84+side});
      }
    }
    flaps.push({joint:anchor,axis:'z',amp:.19,bias:side*.13,seed:side*2.13});
  }
}

export function arcaneRelicHunter(k,weapon,mobile,fighter){
  const design=shapes[weapon.id];
  if(!design)return null;
  surfaces(k,design.tint);
  const {form,size:[broad,ground,neck],drop,tone,shape,tint:[dark,,rim,cloth]}=design;
  const model=fighter(k,{broad,ground,neck,armLength:.70,style:'shade',legs:form==='palace',
    finish:'arcaneCloth',mobile,portrait(k,head){rituals(k,head,form,mobile);},
    weapon(k,body,back,head,hands,flaps){
      hexDress(k,body,back,design,mobile,flaps);
      pairRelic(k,hands[1],form,flaps);
    }});
  model.polishEnergy={tint:tone,shape,anchor:model.body,offset:[0,.48,-.13],span:[broad+.53,.95,.86]};
  model.relicDress=tools=>{
    for(const side of sides)for(let i=0;i<3;i++){
      const x=.088+i*.10,w=.096+i*.016,y=.247,z=.144-i*.142,length=drop*(1+i*.093);
      tools.silk(model.body,design.name+' · 術帛 '+side+' '+(i+1),mirror(side,[
        [x,y,z,w*.61],[x+.030,.042,z-.039,w],[x+.134,-length*.34,z-.131,w*.98],
        [x+.206,-length*.64,z-.246,w*.70],[x+.284,-length,z-.411,w*.19],
      ]),{style:'woven',tint:cloth,trim:rim,lining:dark,phase:side*.72+i*.91,flex:1.13+i*.19});
    }
    return true;
  };
  return model;
}
