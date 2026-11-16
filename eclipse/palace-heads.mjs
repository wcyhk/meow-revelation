import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,track)=>track.map(([x,...rest])=>[side*x,...rest]);
const cut=(k,j,finish,loop,depth=.027)=>k.sculpt.plate(j,finish,loop,depth,depth*.28);
const wire=(k,j,finish,track,mobile)=>k.sculpt.sweep(j,finish,track,{sides:mobile?5:7,steps:mobile?9:13,ridge:.19});
const form=(k,j,finish,track,mobile,section=2.54)=>
  k.geometry(j,finish,sculptVolume(track,{rings:mobile?9:15,sides:mobile?9:13,ridge:.16,section}));

function iceCrown(k,head,mobile){
  const crest=k.bone(head,0,.05,-.02);
  crest.name='Glacier crown and nape lamellae';
  const ridges=[];
  for(const side of sides){
    const fan=p=>reflect(side,p);
    const frontal=fan([[.006,.204,.198],[.105,.263,.164],[.215,.242,.085],[.247,.143,-.015],
      [.214,.082,.089],[.116,.142,.176],[.027,.111,.219]]);
    cut(k,crest,'bMetal',frontal,.052);
    wire(k,crest,'bInlay',frontal.slice(0,4).map(([x,y,z],i)=>[x,y+.014,z+.027,.012-i*.0015]),mobile);
    const cheek=fan([[.149,.066,.181],[.210,.097,.111],[.260,.045,.036],[.236,-.091,.067],
      [.175,-.187,.159],[.117,-.226,.196],[.139,-.080,.215]]);
    cut(k,head,'bOxide',cheek,.046);
    cut(k,head,'bMetal',cheek.map(([x,y,z])=>[x*.994,y*.69+.025,z+.029]),.025);
    wire(k,head,'bBone',cheek.slice(2,7).map(([x,y,z],i)=>[x,y-.008,z+.039,[.015,.014,.010,.004,.010][i]]),mobile);
    const horn=k.bone(crest,side*.13,.172,.043);
    const hornTrack=fan([[0,0,0,.047,.054],[.106,.088,-.048,.064,.053],[.156,.207,-.13,.059,.036],
      [.157,.300,-.192,.034,.022],[.117,.389,-.278,.003,.004]]);
    form(k,horn,'bMetal',hornTrack,mobile,3.02);
    wire(k,horn,'bTrim',hornTrack.map(([x,y,z,a])=>[x,y+.025,z+.034,a*.31]),mobile);
    for(let i=0;i<3;i++){
      const x=.094+i*.042,y=.176+i*.050;
      const flange=fan([[x,y,.078],[x+.067,y+.046,-.058],[x+.058,y+.101,-.142],
        [x+.019,y+.027,-.049],[x-.025,y-.013,.067]]);
      cut(k,crest,i===1?'bBone':'bInlay',flange,.034-i*.006);
    }
    for(let i=0;i<(mobile?3:4);i++){
      const y=.091-i*.089,z=-.175-i*.011;
      const back=fan([[.016,y+.073,z-.105],[.138,y+.078,z-.088],[.225,y+.062,z-.050],[.239,y-.011,z+.056],
        [.162,y-.060,z+.011],[.066,y-.090,z-.122],[.011,y-.046,z-.125]]);
      cut(k,crest,i%2?'bOxide':'bMetal',back,.034);
      wire(k,crest,'bTrim',back.slice(3).map(([x,y,z])=>[x,y,z-.024,.010]),mobile);
    }
    for(let braid=0;braid<(mobile?2:3);braid++){
      const hinge=k.bone(head,side*(.084+braid*.073),-.033-braid*.024,-.185-braid*.024);
      const travel=braid*.47+side, tip=.49+braid*.035;
      hinge.name='Frostbound nape braid';
      const track=fan([[.009,.075,-.013,.043,.037],[.034,-tip*.39,-.105,.047,.033],
        [.060,-tip*.68,-.203,.041,.026],[.047,-tip,-.219,.006,.007]]);
      form(k,hinge,braid%2?'bCloth':'bHair',track,mobile,2.38);
      for(let wrap=0;wrap<4;wrap++){
        const y=-tip*(.22+wrap*.18),z=-.096-wrap*.033;
        wire(k,hinge,wrap===2?'bInlay':'bBone',fan([[.003,y+.012,z,.012],[.031,y-.014,z-.032,.014],
          [.060,y-.009,z-.020,.011],[.081,y+.009,z+.008,.004]]),mobile);
      }
      ridges.push({hinge,travel,side});
    }
  }
  cut(k,crest,'bInlay',[[0,.357,.149],[-.057,.255,.205],[-.028,.139,.232],[0,.105,.246],
    [.031,.143,.221],[.053,.272,.190]],.025);
  return ({beat,wind,strike})=>{
    crest.rotation.x=wind*.026-strike*.039;
    for(const {hinge,travel,side} of ridges){
      hinge.rotation.x=Math.sin(beat*.66+travel)*.099-wind*.18+strike*.22;
      hinge.rotation.z=side*Math.sin(beat*.53+travel)*.091;
    }
  };
}

function priestHat(k,head,mobile){
  const cap=k.bone(head,0,.151,-.033);
  cap.name='Amakusa folded silk cap';
  form(k,cap,'amakusaCap',[[0,.004,-.014,.146,.151],[0,.074,-.035,.164,.157],[0,.137,-.067,.151,.146],
    [.014,.201,-.107,.128,.127],[.027,.254,-.148,.087,.104],[.031,.278,-.212,.051,.065],
    [.021,.246,-.255,.024,.037]],mobile,2.71);
  const knots=[];
  const neck=k.bone(head,0,-.163,-.058);
  neck.name='Amakusa black hair at the nape';
  form(k,neck,'bShadow',[[0,-.206,-.058,.074,.065],[0,-.139,-.065,.096,.09],[0,-.005,-.061,.134,.098],
    [0,.107,-.071,.144,.111],[0,.163,-.062,.127,.103]],mobile);
  for(const side of sides){
    const fan=p=>reflect(side,p);
    const brim=fan([[0,.028,.176],[.109,.042,.168],[.158,.07,.107],[.179,.072,.02],
      [.159,.064,-.119],[.127,.042,-.214],[.033,.034,-.251],[.008,-.009,-.246],[.09,-.014,-.209],
      [.154,.011,-.108],[.167,.014,.041],[.121,-.004,.148],[0,-.006,.177]]);
    cut(k,cap,'amakusaBraid',brim,.027);
    wire(k,cap,'amakusaThread',brim.slice(0,7).map(([x,y,z],i)=>[x,y+.007,z+.016,[.004,.011,.012,.010,.009,.006,.003][i]]),mobile);
    const crown=fan([[.024,.089,.154,.004],[.094,.144,.105,.016],[.126,.191,-.023,.019],
      [.103,.243,-.142,.021],[.034,.259,-.239,.006]]);
    wire(k,cap,'amakusaCap',crown,mobile);
    wire(k,cap,'amakusaThread',crown.map(([x,y,z,r])=>[x+side*.009,y+.012,z-.006,r*.51]),mobile);
    for(let row=0;row<4;row++){
      const y=.134-row*.036,w=.095-row*.013;
      const layer=fan([[.004,y+.05,-.24],[w*.43,y+.074,-.261],[w*.93,y+.066,-.242],[w*1.31,y-.002,-.19],
        [w,y-.034,-.221],[.017,y-.027,-.263]]);
      cut(k,cap,row%2?'amakusaBraid':'amakusaCap',layer,.02);
      wire(k,cap,'amakusaThread',layer.slice(1,5).map(([x,h,z],i)=>[x,h+.01,z-.014,[.003,.009,.010,.003][i]]),mobile);
    }
    const hinge=k.bone(cap,side*.092,.037,-.208);
    hinge.name='Amakusa trailing cap tie '+side;
    const silk=fan([[0,.024,.011,.026,.02],[.025,-.071,-.041,.033,.018],[.082,-.212,-.114,.036,.020],
      [.124,-.366,-.154,.022,.015],[.176,-.429,-.215,.004,.004]]);
    form(k,hinge,'amakusaBraid',silk,mobile);
    wire(k,hinge,'amakusaThread',silk.map(([x,y,z,s])=>[x,y,z-.019,s*.29]),mobile);
    for(let i=0;i<(mobile?5:8);i++){
      const t=i/(mobile?4:7);
      const [a,b,c]=fan([[.061+t*.081,.27-t*.051,.123-t*.082],[.133+t*.021,.208-t*.117,.104-t*.104],
        [.15+t*.036,.136-t*.255,.065-t*.22]]);
      k.geometry(head,i%3?'bHair':'amakusaCap',featherVane(a,b,c,.037+t*.017,21+i,mobile?8:12));
    }
    for(let i=0;i<4;i++){
      const t=i*.034;
      wire(k,neck,i%2?'bHair':'amakusaCap',fan([[.035+t,.087,-.155,.006],[.045+t,.021,-.173,.014],
        [.058+t,-.079,-.146,.013],[.066+t,-.147,-.106,.004]]),mobile);
    }
    const collar=fan([[.017,-.12,-.066],[.074,-.1,-.115],[.129,-.096,-.078],[.171,-.101,.008],
      [.147,-.171,.069],[.094,-.212,.035],[.027,-.193,-.02]]);
    cut(k,neck,'amakusaCollar',collar,.040);
    wire(k,neck,'amakusaThread',collar.slice(1,6).map(([x,y,z],i)=>[x,y-.008,z+.024,[.004,.012,.017,.011,.004][i]]),mobile);
    const clasp=fan([[.027,-.243,.175],[.059,-.241,.166],[.103,-.198,.144],[.129,-.148,.094],
      [.147,-.116,.042],[.176,-.136,.014],[.157,-.184,.094],[.111,-.249,.145],[.054,-.277,.173]]);
    cut(k,head,'amakusaCollar',clasp,.026);
    wire(k,head,'amakusaThread',clasp.slice(1,6).map(([x,y,z],i)=>[x,y+.002,z+.015,[.004,.011,.013,.009,.003][i]]),mobile);
    knots.push({hinge,side});
  }
  return ({beat,wind,strike,travel})=>{
    cap.rotation.y=Math.sin(beat*.45)*.017+wind*.044-strike*.049;
    for(const {hinge,side} of knots){
      hinge.rotation.x=Math.sin(beat*.70+side)*.093-travel*.19-wind*.11+strike*.22;
      hinge.rotation.z=side*(Math.cos(beat*.61)*.061+(wind-strike)*.10);
    }
  };
}

export function palaceHead(k,head,id,mobile){
  if(id==='m099')return iceCrown(k,head,mobile);
  if(id==='m105')return priestHat(k,head,mobile);
  return null;
}
