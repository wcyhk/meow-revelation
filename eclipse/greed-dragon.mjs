import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...tail])=>[x*side,...tail]);
const bonePath=(k,joint,finish,points,mobile,seed=0)=>{
  k.geometry(joint,finish,sculptVolume(points,
    {sides:mobile?9:12,rings:mobile?11:16,section:2.7,ridge:.22,seed}));
};
const cord=(k,joint,finish,points)=>k.sculpt.sweep(joint,finish,points,{steps:9,sides:5,ridge:.19});

function finish(k,name,color,metalness,roughness,kind){
  k.materials[name]=paintedFinish(new T.MeshStandardMaterial({
    color,vertexColors:true,metalness,roughness,envMap:forgeEnvironment(),envMapIntensity:.57,
  }),kind,true,true);
}

export function sculptGreedTorso(k,neck,mobile){
  finish(k,'greedStone',0x225068,.47,.43,'iron');
  finish(k,'greedBelly',0x4a6d69,.14,.74,'hide');
  finish(k,'greedLip',0x843c33,.09,.61,'hide');
  finish(k,'greedIvory',0xbcc2b7,.11,.58,'bone');
  finish(k,'greedBlue',0x104165,.38,.44,'iron');
  finish(k,'greedRidge',0x49828b,.30,.49,'bone');
  finish(k,'greedHorn',0x725041,.15,.65,'bone');
  finish(k,'greedGold',0xc09955,.49,.43,'bone');
  finish(k,'greedScarlet',0x9d4633,.12,.72,'hide');
  bonePath(k,neck,'greedBelly',[[0,.323,-.79,.293,.238],[-.035,.386,-.46,.459,.342],
    [0,.468,-.08,.457,.405],[.037,.551,.25,.380,.361],[.105,.663,.49,.298,.251],
    [.141,.794,.655,.225,.212],[.172,1.005,.653,.206,.197],[.154,1.208,.627,.189,.174]],mobile);
  for(const side of sides)for(let i=0;i<6;i++){
    const t=i/5,y=.654+t*.561,z=.498+t*.15,x=.045+t*.09,w=.30-.102*t;
    const plate=mirror(side,[[x+.020,y+.091,z+.048,.040,.028],
      [x+w*.52,y+.111,z+.043,.072,.046],[x+w*.85,y+.053,z-.079,.063,.041],
      [x+w*.73,y-.048,z-.176,.047,.029],[x+w*.59,y-.101,z-.207,.004,.006]]);
    bonePath(k,neck,i%3?'greedStone':'greedBlue',plate,mobile,17+i);
    cord(k,neck,i%2?'greedRidge':'greedIvory',plate.slice(0,4).map(([x,y,z,r])=>[x,y+.016,z+.029,r*.22]));
    if(i<5){
      const v=mirror(side,[[.026,y-.049,z+.206,.045,.025],[.103,y-.075,z+.22,.052,.031],
        [.183,y-.044,z+.185,.047,.025],[.214,y+.014,z+.142,.006,.005]]);
      bonePath(k,neck,i%3?'greedRidge':'greedBelly',v,mobile,28+i);
    }
  }
  const rows=mobile?7:10;
  for(let row=0;row<rows;row++){
    const t=row/(rows-1),x=.10*t*t,y=.622+(.34*t*t)+Math.sin(t*3.5)*.163,z=-.86+t*1.51;
    const width=.347+Math.sin(Math.PI*t)*.205,spread=.120+Math.sin(Math.PI*t)*.046;
    for(const side of sides){
      const root=side*x;
      const track=mirror(side,[[.035,y+.047,z+.117,.051,.039],[width*.40,y+.063,z+.072,spread,.058],
        [width*.74,y-.041,z-.067,spread*.83,.044],[width*.92,y-.198,z-.161,spread*.56,.031],
        [width,y-.293,z-.245,.009,.009]]).map(([x,...rest])=>[x+root,...rest]);
      bonePath(k,neck,row%4===2?'rind':row%3?'greedBlue':'greedStone',track,mobile,row*1.3+side);
      const accent=track.map(([x,y,z,r],i)=>[x,y+.035,z+.019,Math.max(.003,r*.21*(1+i*.04))]);
      cord(k,neck,row%4===1?'glow':'greedIvory',accent);
    }
    const tip=.081+Math.sin(t*2.72)*.109;
    bonePath(k,neck,'greedStone',[[x,y-.018,z+.090,.059,.063],
      [x-.017,y+tip*.46,z-.003,.067,.051],[x-.019,y+tip*.86,z-.099,.040,.033],
      [x+.005,y+tip*1.45,z-.264,.005,.005]],mobile,row);
  }
  // Real volumes wrap underneath the body and across the last side arch.
  for(let rib=0;rib<5;rib++){
    const z=.47-rib*.235,y=.324-rib*.028,width=.26+rib*.027;
    for(const side of sides){
      const ligament=mirror(side,[[0,y-.101,z+.025,.053,.031],[width*.32,y-.089,z+.027,.080,.048],
        [width*.84,y-.031,z-.032,.066,.046],[width*1.42,y+.114,z-.093,.033,.026],[width*1.48,y+.201,z-.168,.006,.006]]);
      bonePath(k,neck,rib%2?'greedIvory':'greedBelly',ligament,mobile,side-rib);
    }
  }
  for(const side of sides)for(let row=0;row<2;row++){
    for(let i=0;i<5;i++){
      const z=.40-i*.205-row*.076,y=.43+row*.136-i*.016,width=.355+.067*Math.sin(i*.97)-row*.023;
      const shield=mirror(side,[[width-.076,y+.102,z+.099],[width+.010,y+.072,z+.096],
        [width+.042,y+.016,z+.009],[width+.038,y-.045,z-.091],
        [width-.049,y-.085,z-.077],[width-.087,y-.036,z+.011]]);
      k.sculpt.plate(neck,i%2?'greedStone':'greedBelly',shield,.028,.012);
      cord(k,neck,i%3?'greedRidge':'greedBlue',mirror(side,[[width-.031,y+.084,z+.091,.005],
        [width+.027,y+.051,z+.063,.010],[width+.055,y-.013,z-.026,.009],
        [width+.028,y-.044,z-.067,.003]]));
    }
  }
}

export function sculptGreedLimbs(k,hip,ankle,side,fore,mobile){
  const v=points=>mirror(side,points);
  for(let row=0;row<3;row++){
    const y=.094-row*.071,z=fore?.022:-.030,d=row*.029;
    const shield=v([[.039+d,y+.004,z+.099],[.121+d,y+.054,z+.107],
      [.207+d,y+.028,z+.067],[.235+d,y-.068,z-.028],
      [.202+d,y-.111,z-.092],[.131+d,y-.069,z-.082]]);
    k.sculpt.plate(hip,row%2?'greedStone':'greedBlue',shield,.036,.012);
    cord(k,hip,'greedRidge',shield.slice(1,5).map(([x,y,z])=>[x+side*.012,y+.01,z,.009-row*.0015]));
  }
  bonePath(k,ankle,'greedStone',v([[.001,.060,-.060,.095,.065],[.018,.019,-.019,.106,.071],
    [.037,-.043,.067,.111,.060],[.047,-.064,.114,.087,.046]]),mobile,139);
  bonePath(k,ankle,'greedScarlet',v([[.008,-.036,.043,.091,.055],
    [.030,-.063,.097,.111,.059],[.047,-.083,.149,.105,.045],
    [.060,-.099,.184,.084,.031],[.039,-.120,.205,.052,.021]]),mobile,144);
  for(let digit=0;digit<4;digit++){
    const x=-.085+digit*.071,z=.147+Math.sin(digit*1.1)*.041;
    const toe=v([[x,-.073,z,.044,.036],[x+.005,-.081,z+.041,.035,.039],
      [x+.015,-.104,z+.090,.030,.023],[x+.022,-.117,z+.132,.015,.012]]);
    bonePath(k,ankle,digit%3?'greedScarlet':'greedLip',toe,mobile,156+digit);
    cord(k,ankle,'greedHorn',v([[x+.019,-.110,z+.113,.020],
      [x+.027,-.114,z+.150,.020],[x+.031,-.139,z+.197,.002]]));
    cord(k,ankle,'greedLip',v([[x-.012,-.039,z+.031,.006],
      [x+.006,-.045,z+.049,.010],[x+.020,-.061,z+.062,.005]]));
  }
}

export function sculptGreedTail(k,tail,mobile){
  for(const [i,bone] of tail.entries()){
    const w=.296*(1-i*.175),h=.17*(1-i*.16),d=-.109-i*.014;
    for(const side of sides)for(let row=0;row<2;row++){
      const z=.007+row*d;
      bonePath(k,bone,(i+row)%2?'greedBlue':'greedStone',mirror(side,[[.024,h*.86,z+.040,.031,.032],
        [w*.54,h*.73,z-.026,w*.23,h*.21],[w*.87,h*.27,z-.066,w*.22,h*.31],
        [w*.97,-h*.10,z-.13,w*.16,h*.24],[w*.93,-h*.41,z-.16,.004,.005]]),mobile,i*13+row);
      cord(k,bone,'greedRidge',mirror(side,[[w*.45,h*.88,z+.017,.010],
        [w*.77,h*.50,z-.043,.012],[w*.93,h*.042,z-.115,.009],[w*.91,-h*.30,z-.143,.002]]));
    }
    cord(k,bone,'greedIvory',[[0,h*.93,d+.041,.013],[.021,h*1.24,d-.029,.027],
      [.018,h*1.63,d-.104,.018],[.014,h*1.22,d-.158,.002]]);
  }
}

export function sculptGreedFace(k,head,mobile){
  bonePath(k,head,'greedStone',[[0,.071,-.32,.269,.205],[0,.078,-.125,.322,.236],[0,.045,.104,.299,.171],
    [0,.020,.338,.234,.131],[0,-.01,.529,.173,.093],[0,-.013,.621,.135,.065]],mobile);
  bonePath(k,head,'greedGold',[[0,-.015,.532,.079,.053],[0,.031,.574,.107,.063],
    [0,.019,.634,.080,.049],[0,-.020,.676,.032,.029]],mobile,8);
  const jaw=k.bone(head,0,-.159,.027);
  bonePath(k,jaw,'greedLip',[[0,-.008,-.182,.264,.052],[0,-.077,.064,.284,.088],
    [0,-.089,.324,.247,.071],[0,-.056,.565,.154,.044]],mobile);
  bonePath(k,jaw,'greedBelly',[[0,-.043,-.186,.251,.076],[0,-.115,.096,.287,.087],
    [0,-.118,.376,.219,.059],[0,-.072,.577,.137,.035]],mobile);
  bonePath(k,jaw,'greedLip',[[0,-.038,.021,.190,.038],[0,-.077,.201,.189,.038],
    [0,-.057,.403,.137,.039],[0,-.025,.497,.055,.016]],mobile,12);
  for(const side of sides){
    const s=x=>side*x;
    bonePath(k,head,'greedIvory',mirror(side,[[.100,.118,.398,.022,.020],[.185,.173,.306,.057,.028],
      [.239,.206,.175,.069,.042],[.286,.251,-.035,.056,.038],[.342,.205,-.179,.034,.024],
      [.359,.149,-.268,.004,.006]]),mobile,side);
    bonePath(k,head,'greedLip',mirror(side,[[.167,.056,.414,.032,.026],[.215,.060,.337,.056,.038],
      [.264,.095,.221,.046,.031],[.294,.107,.149,.008,.007]]),mobile);
    k.mesh(head,'gem','greedGold',s(.218),.112,.371,.050,.024,.027,0,s(.31),s(.14));
    k.mesh(head,'gem','deep',s(.211),.109,.399,.008,.020,.007,0,s(.28),s(.14));
    cord(k,head,'greedLip',mirror(side,[[.128,-.069,.509,.010],[.177,-.047,.410,.016],
      [.226,-.022,.260,.021],[.272,-.012,.145,.013]]));
    const cheek=mirror(side,[[.105,-.122,.480,.033,.039],[.216,-.083,.32,.075,.050],
      [.313,-.052,.133,.098,.059],[.372,.017,-.051,.088,.061],[.396,.087,-.224,.064,.038],
      [.455,.209,-.401,.006,.006]]);
    bonePath(k,head,'greedStone',cheek,mobile,side+1.49);
    for(let row=0;row<4;row++){
      const x=.199+row*.040,y=-.062+row*.039,z=.331-row*.147;
      const gill=mirror(side,[[x-.046,y+.085,z+.042],[x+.022,y+.068,z+.083],
        [x+.073,y+.028,z+.028],[x+.092,y-.042,z-.076],
        [x+.036,y-.070,z-.139],[x-.019,y-.036,z-.081]]);
      k.sculpt.plate(head,row%2?'greedBlue':'greedRidge',gill,.034,.010);
      cord(k,head,row===3?'greedIvory':'greedBlue',gill.slice(1,5).map(([x,y,z])=>[x+side*.014,y+.010,z,.010]));
    }
    cord(k,head,'greedIvory',cheek.slice(0,4).map(([x,y,z,r])=>[x,y-.019,z+.044,r*.23]));
    cord(k,jaw,'greedRidge',mirror(side,[[.080,-.087,.477,.015],[.167,-.105,.401,.031],
      [.231,-.105,.235,.036],[.280,-.065,.025,.032],[.246,-.039,-.105,.007]]));
    cord(k,jaw,'greedHorn',mirror(side,[[.204,-.095,.317,.011],[.254,-.106,.208,.017],
      [.281,-.074,.071,.013],[.252,-.037,-.073,.003]]));
    bonePath(k,head,'greedHorn',mirror(side,[[.235,.161,-.189,.106,.088],[.371,.216,-.301,.118,.093],
      [.499,.228,-.430,.077,.061],[.643,.254,-.562,.043,.037],[.822,.237,-.603,.004,.004]]),mobile,113);
    cord(k,head,'greedGold',mirror(side,[[.331,.221,-.235,.018],[.460,.277,-.356,.024],
      [.630,.274,-.521,.015],[.752,.251,-.587,.003]]));
    cord(k,head,'greedRidge',mirror(side,[[.091,.014,.600,.020],[.226,.043,.645,.019],
      [.422,.114,.418,.014],[.508,.167,.175,.009],[.495,.260,-.089,.003]]));
    for(let fang=0;fang<(mobile?6:8);fang++){
      const t=fang/(mobile?5:7),Z=.541-t*.467,x=.137+t*.143,r=.023+Math.sin(t*Math.PI)*.011;
      const length=.085+.040*(1-t);
      bonePath(k,head,'greedIvory',mirror(side,[[x,-.105,Z,r,r],[x+.005,-.139,Z+.024,r*.98,r*.91],
        [x*.96,-.139-length,Z-.017,.003,.003]]),true,fang);
      if(fang%2===0)bonePath(k,jaw,'greedIvory',mirror(side,[[x+.009,-.056,Z-.026,.026,.024],
        [x+.032,-.008,Z-.008,.019,.017],[x+.011,.032,Z-.028,.003,.003]]),true,fang);
    }
    bonePath(k,head,'greedLip',mirror(side,[[.076,-.026,.553,.032,.021],[.113,-.014,.575,.050,.027],[.149,-.029,.549,.011,.009]]),mobile);
  }
  for(const side of sides) for(let row=0;row<4;row++){
    const x=.03+row*.032,z=.57-row*.09,y=-.026+row*.031;
    cord(k,head,row%3===0?'greedIvory':'rind',mirror(side,[[x*.7,y+.018,z,.006],
      [x*1.19,y+.041,z-.024,.015],[x*1.59,y+.022,z-.052,.006]]));
  }
  return jaw;
}
