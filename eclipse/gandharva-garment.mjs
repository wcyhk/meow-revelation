const sides=[-1,1];
const tau=Math.PI*2;
const jade=0x34756e,blue=0x364b71,ink=0x222a4b,gold=0xcbab75,blood=0x702f46;

function cloth(tools,joint,name,path,options={}){
  tools.silk(joint,name,path,{tint:jade,trim:gold,lining:ink,style:'woven',...options});
}

function shoulderSilk(k,tools,body,limbs){
  for(const {shoulder,elbow,side} of limbs){
    const f=x=>side*x;
    cloth(tools,body,'乾達婆 · 掛肩帛 '+side,[
      [f(.066),.719,.162,.055],[f(.155),.69,.199,.063],[f(.239),.62,.152,.071],
      [f(.272),.54,-.059,.076],[f(.3),.332,-.211,.086],[f(.346),.059,-.324,.065],
      [f(.396),-.211,-.42,.037],
    ],{across:[.95,0,side*.1],tint:side===1?0x467d76:blue,lining:blood,phase:side*.87,flex:.89});
    cloth(tools,body,'乾達婆 · 長肩綬 '+side,[
      [f(.159),.641,-.194,.042],[f(.240),.423,-.272,.076],[f(.358),.168,-.341,.093],
      [f(.413),-.154,-.471,.098],[f(.495),-.383,-.546,.074],[f(.513),-.620,-.686,.021],
    ],{across:[.91,0,side*.26],tint:side===1?blue:jade,lining:blood,phase:1.30+side*1.1,flex:1.33});

    for(const [i,depth] of side===1?[[0,-.102],[1,.088]]:[[0,-.102]]){
      cloth(tools,shoulder,'乾達婆 · 肩袖 '+side+' '+i,[
        [f(.049),.058,depth*.82,.051],[f(.101),-.002,depth,.069],[f(.163),-.132,depth-.027,.083],
        [f(.178),-.229,depth-.059,.093],[f(.187),-.307,depth-.073,.064],
      ],{across:[.80,-.02,-side*.55*(i?1:-1)],tint:i?jade:blue,phase:i+side*.69,flex:.59});
    }
    cloth(tools,elbow,'乾達婆 · 袖下襟 '+side,[
      [f(.082),-.038,-.136,.044],[f(.129),-.167,-.147,.074],[f(.161),-.291,-.180,.098],
      [f(.171),-.412,-.232,.115],[f(.123),-.502,-.298,.082],
    ],{across:[.56,0,-side*.829],tint:side===1?jade:blue,phase:1.79+side*.72,flex:1.02});
    const cuff=k.bone(elbow,f(.031),-.226,.025);
    cuff.name='乾達婆 · 袖口銅扣';
    k.mesh(cuff,'ring','brass',0,.004,0,.108,.118,.72,Math.PI/2);
    k.mesh(cuff,'gem','jade',f(.093),-.014,.076,.023,.041,.026,0,side*.18);
  }
}

function waistCloth(k,tools,body){
  const panels=10;
  for(let i=0;i<panels;i++){
    const angle=(i+.21)*tau/panels,s=Math.sin(angle),c=Math.cos(angle);
    const depthBias=c<0?.046:.010;
    const drop=.75+.071*Math.cos(i*2.62)+.059*(c<0);
    const path=[
      [.245,.015,.091],[.271,-.153,.105],[.296,-.293,.121],[.349,-.433,.144],[.39,-.617,.155],
      [.431,-drop,.132],[.449,-drop-.043,.107],
    ].map(([r,y,w],row)=>[
      s*r+Math.sin(i*1.7)*row*.006,y,c*(r*.876+depthBias)-Math.max(0,row-3)*.017,w,
    ]);
    cloth(tools,body,'乾達婆 · 百褶裙 '+(i+1),path,{across:[c,.012,-s],
      tint:[jade,0x265d62,blue,0x2b6568,0x32626a][i%5],lining:i%4?ink:blood,
      flex:1.12+Math.sin(i*.75)*.09,phase:i*.68});
  }
  for(const side of sides){
    const s=x=>side*x;
    cloth(tools,body,'乾達婆 · 繫腰帶 '+side,[
      [s(.08),.061,.257,.032],[s(.171),-.094,.303,.048],[s(.238),-.305,.335,.055],
      [s(.281),-.531,.405,.048],[s(.278),-.789,.483,.034],[s(.242),-.956,.512,.018],
    ],{across:[.92,0,-side*.28],lining:blood,tint:0x172d51,trim:0xd0ab6c,phase:2.1+side*1.38,flex:1.43});
  }
  const belt=k.bone(body,0,.038,-.009);
  k.mesh(belt,'ring','black',0,0,0,.282,.245,.97,Math.PI*.5);
  for(let i=0;i<10;i++){
    const a=i*tau/10,x=Math.sin(a),z=Math.cos(a);
    k.mesh(belt,'gem',i%2?'brass':'jade',x*.270,.006,z*.245,.036,.033,.024,0,a,0);
  }
  const clasp=k.bone(body,.054,.088,.235);
  clasp.name='乾達婆 · 青襟繫扣';
  k.sculpt.plate(clasp,'brass',[[-.068,.039,.027],[.012,.062,.032],[.062,.028,.029],[.074,-.039,.011],
    [.009,-.067,.009],[-.066,-.041,.019]],.040,.011);
  k.mesh(clasp,'gem','jade',.004,-.001,.060,.039,.038,.018);
}

export function gandharvaGarments(k,parts,tools){
  const {body,clothLimbs}=parts;
  shoulderSilk(k,tools,body,clothLimbs);
  waistCloth(k,tools,body);
}
