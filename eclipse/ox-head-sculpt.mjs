import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

export const oxHeadFinishes={
  oxHide:[0x622f29,.026,.87,'hide'],oxMuzzle:[0x3b2627,.015,.89,'hide'],oxRuff:[0x2b2228,.02,.91,'hide'],
  oxMane:[0x3a2629,.024,.9,'hide'],oxBruise:[0x522b28,.018,.89,'hide'],
  oxHorn:[0x6c5e5b,.12,.78,'bone'],oxHornRoot:[0x4e423e,.09,.86,'bone'],
  oxIvory:[0x9e876d,.07,.81,'bone'],oxIris:[0xdd8744,.065,.54,'gem'],
};

function shapedHorn(k,joint,material,sections,mobile,seed){
  const rings=mobile?23:34,sides=mobile?10:15;
  const geo=sculptVolume(sections,{rings,sides,section:2.38,ridge:.18,seed});
  const path=new T.CatmullRomCurve3(sections.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.43);
  const p=geo.attributes.position,c=geo.attributes.color;
  for(let row=0;row<=rings;row++){
    const t=row/rings,center=path.getPointAt(t),growth=Math.cos(t*82+Math.sin(t*22)*.36);
    const flute=(.046+.038*Math.sin(t*Math.PI))*growth;
    for(let i=0;i<=sides;i++){
      const j=row*(sides+1)+i;
      const multiple=1+flute+.018*Math.cos(i/sides*Math.PI*8+t*22);
      p.setXYZ(j,center.x+(p.getX(j)-center.x)*multiple,center.y+(p.getY(j)-center.y)*multiple,
        center.z+(p.getZ(j)-center.z)*multiple);
      const shade=c.getX(j)*(.87+growth*.10+t*.082);
      c.setXYZ(j,shade,shade*(.955+.035*t),shade*(.93+.046*t));
    }
  }
  geo.computeVertexNormals();
  k.geometry(joint,material,geo);
}

export function carveOxHead(k,body,head,mobile){
  const joint=(parent,name,x,y,z)=>{
    const j=k.bone(parent,x,y,z);
    j.name=name;
    return j;
  };
  const mass=(j,m,p,seed,section=2.48,fur=false)=>k.geometry(j,m,
    sculptVolume(p,{rings:mobile?12:20,sides:mobile?10:16,seed,ridge:.18,section,fur}));
  const cut=(j,m,p,d=.039)=>k.sculpt.plate(j,m,p,d,d*.32);
  const seam=(j,m,p)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:14,sides:mobile?5:7,ridge:.17});
  const face=joint(head,'Ox broad sculpted skull',0,0,0);
  const jaw=joint(face,'Ox articulated lower muzzle',0,-.127,.128);
  const nape=joint(body,'Ox attached shoulder ruff',0,.449,.404);
  const ears=[],ruff=[];
  mass(face,'oxHide',[[0,-.209,.029,.133,.153],[0,-.123,.032,.188,.189],[0,-.018,.041,.226,.224],
    [0,.095,.002,.275,.212],[0,.199,-.045,.272,.173],[0,.292,-.115,.185,.173],[0,.342,-.158,.085,.109]],21.68,2.66,true);
  mass(nape,'oxRuff',[[0,-.16,.107,.197,.117],[0,-.045,.054,.243,.152],[.011,.079,-.04,.303,.195],
    [.008,.176,-.151,.314,.168],[0,.259,-.295,.232,.122],[0,.282,-.437,.099,.073]],11.61,2.50,true);
  mass(jaw,'oxHide',[[0,-.12,-.033,.128,.108],[0,-.081,.068,.173,.13],[0,-.067,.18,.176,.11],
    [0,-.053,.255,.14,.081],[0,-.021,.291,.092,.043]],29.5,2.66);
  mass(face,'oxMuzzle',[[0,-.167,.147,.122,.102],[0,-.133,.209,.158,.101],[0,-.093,.285,.188,.106],
    [0,-.058,.361,.174,.082],[0,-.032,.414,.146,.055],[0,-.018,.437,.086,.018]],13.31,2.95);
  cut(face,'oxMuzzle',[[-.162,-.034,.386],[-.102,.011,.415],[.009,.023,.438],[.097,.012,.424],
    [.164,-.03,.385],[.136,-.123,.427],[.041,-.153,.449],[-.072,-.15,.440],[-.142,-.116,.421]],.033);
  seam(face,'oxBruise',[[-.127,-.079,.428,.007],[-.059,-.101,.451,.014],[0,-.113,.461,.014],
    [.068,-.101,.454,.013],[.129,-.074,.429,.006]]);
  const crown=joint(face,'Ox split crown whorl',0,.026,-.059);
  for(let i=0;i<(mobile?6:9);i++){
    const u=i/(mobile?5:8)-.5,x=u*.23,y=Math.abs(u)*.112;
    const path=[[x*.68,.267-y,-.01+Math.abs(u)*.11],[x*1.07+.016,.214-y,.098+Math.abs(u)*.026],
      [x*.84+.031,.146-y*.52,.183-Math.abs(u)*.013]];
    k.geometry(crown,i%3?'oxMane':'oxRuff',featherVane(...path,.033+i*.003,67.4+i,mobile?7:12));
  }
  for(const side of sides){
    const f=p=>mirror(side,p);
    const hornRoot=joint(face,'Ox rear-swept horn root '+side,side*.20,.184,-.132);
    shapedHorn(k,hornRoot,'oxHorn',f([[0,0,0,.101,.088],[.121,.048,-.025,.109,.102],[.25,.016,-.048,.092,.084],
      [.368,-.066,-.011,.083,.073],[.452,-.158,.067,.071,.058],[.447,-.226,.129,.051,.045],
      [.393,-.224,.181,.026,.026],[.356,-.171,.201,.008,.01]]),mobile,19.68+side);
    shapedHorn(k,hornRoot,'oxHornRoot',f([[0,-.006,.03,.123,.1],[.059,.018,.01,.126,.117],
      [.112,.029,-.012,.108,.099],[.139,.033,-.018,.093,.092]]),mobile,21.33);
    const spur=joint(face,'Ox swept crown spur '+side,side*.148,.253,-.209);
    shapedHorn(k,spur,'oxHornRoot',f([[0,0,.012,.073,.064],[.103,.088,-.018,.081,.068],
      [.224,.128,-.093,.059,.05],[.332,.11,-.172,.041,.033],[.403,.148,-.22,.008,.006]]),mobile,11.65);
    const ear=joint(face,'Ox cupped ear '+side,side*.231,.093,-.074);
    const profile=f([[.005,.058,.037],[.109,.118,.012],[.198,.098,-.09],[.23,.057,-.153],
      [.171,-.028,-.159],[.085,-.075,-.124],[.028,-.059,-.058]]);
    cut(ear,'oxRuff',profile,.038);
    cut(ear,'oxBruise',profile.map(([x,y,z])=>[x*.74+side*.016,y*.68-.005,z+.023]),.021);
    seam(ear,'oxHide',profile.slice(0,5).map(([x,y,z],i)=>[x,y+.005,z+.021,[.003,.012,.012,.007,.003][i]]));
    ears.push({ear,side});
    const brow=f([[.046,.083,.256,.04,.032],[.107,.132,.243,.055,.041],[.171,.151,.203,.055,.045],
      [.222,.127,.158,.043,.037],[.265,.072,.061,.028,.03],[.246,.032,-.039,.009,.01]]);
    mass(face,'oxHide',brow,24.68+side,2.48,true);
    seam(face,'oxBruise',brow.map(([x,y,z,r])=>[x,y+.025,z+.019,r*.4]));
    const socket=f([[.066,.061,.283],[.109,.081,.289],[.167,.097,.245],[.208,.087,.203],
      [.229,.067,.172],[.19,.034,.215],[.137,.018,.270],[.083,.025,.291]]);
    cut(face,'oxRuff',socket,.028);
    k.mesh(face,'round','oxIris',side*.14,.056,.281,.038,.023,.021,0,side*.38,-side*.27);
    k.mesh(face,'round','bShadow',side*.143,.056,.30,.007,.017,.008,0,side*.26,-side*.15);
    k.mesh(face,'round','glow',side*.124,.063,.303,.008,.004,.006);
    seam(face,'oxMuzzle',socket.slice(4).map(([x,y,z],i)=>[x,y-.001,z+.013,[.004,.011,.015,.007][i]]));
    const cheek=f([[.101,-.083,.254,.032,.034],[.161,-.053,.228,.061,.047],[.22,-.054,.162,.071,.051],
      [.246,-.09,.083,.065,.040],[.217,-.16,-.022,.058,.041],[.165,-.195,-.099,.016,.015]]);
    mass(face,'oxBruise',cheek,19.63+side,2.62);
    seam(face,'oxHide',cheek.map(([x,y,z,r])=>[x,y+.019,z+.027,r*.37]));
    seam(face,'oxRuff',f([[.086,-.041,.43,.005],[.115,-.054,.446,.017],[.137,-.085,.429,.021],
      [.153,-.096,.403,.006]]));
    seam(jaw,'oxMuzzle',f([[.023,-.026,.303,.006],[.104,-.032,.286,.013],[.142,-.030,.23,.014],
      [.153,-.015,.16,.004]]));
    for(let tooth=0;tooth<3;tooth++){
      const x=.065+tooth*.031,z=.254-tooth*.032;
      mass(jaw,'oxIvory',f([[x,-.022,z,.012,.012],[x+.002,.003,z+.017,.015,.012],[x-.006,.028-tooth*.004,z+.018,.003,.004]]),
        13.1+tooth);
    }
    for(let row=0;row<(mobile?4:6);row++){
      const i=row/(mobile?3:5),take=i*.088;
      const path=f([[.166+take,.178-i*.04,-.134-i*.116],[.299+take,.091-i*.09,-.244-i*.115],
        [.317+take,-.047-i*.13,-.412-i*.15]]);
      k.geometry(face,row%3?'oxRuff':'oxMane',featherVane(...path,.073,i*7.2+side,mobile?8:13));
    }
    const locks=joint(nape,'Ox layered nape fibers '+side,side*.068,.043,-.069);
    for(let i=0;i<(mobile?6:9);i++){
      const a=i/(mobile?5:8),path=f([[.036+a*.128,.161-a*.093,.111-a*.163],[.182+a*.091,.096-a*.109,-.181-a*.085],
        [.25+a*.095,-.069-a*.119,-.374-a*.109]]);
      k.geometry(locks,i%3?'oxRuff':'oxMane',featherVane(...path,.071,16.5+i,mobile?8:13));
    }
    ruff.push({locks,side});
  }
  return {jaw,pose({headtime,beat,wind,strike,travel}){
    for(const {ear,side} of ears)ear.rotation.set(-wind*.18+strike*.12,side*(.043+travel*.062),Math.sin(headtime*2.9+side)*.08);
    for(const {locks,side} of ruff)locks.rotation.set(Math.sin(beat*.53+side)*.039+travel*.074,
      side*(wind*.057-strike*.121),side*strike*.081);
    nape.rotation.x=wind*.133-strike*.187;
  }};
}
