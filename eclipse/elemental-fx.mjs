export const weaponElements={
  tiger:'wind',dragon:'lightning',phoenix:'fire',turtle:'ice',qilin:'gold',flameblade:'fire',
  stormbow:'lightning',windhalberd:'wind',frostlute:'ice',chakra:'lightning',
  reaper:'void',bell:'light',fangs:'blood',cannon:'fire',
};

const palette={
  fire:{shape:5,speed:2.8,lift:2.35,gravity:.48,size:11,life:.59},
  ice:{shape:6,speed:2.35,lift:1.05,gravity:3.5,size:12,life:.57},
  wind:{shape:7,speed:3.9,lift:.55,gravity:-.2,size:16,life:.43},
  lightning:{shape:8,speed:3.6,lift:1.55,gravity:2.4,size:14,life:.31},
  light:{shape:9,speed:1.65,lift:1.45,gravity:-.45,size:13,life:.64},
  void:{shape:10,speed:1.32,lift:.82,gravity:-.44,size:21,life:.76},
  blood:{shape:11,speed:1.86,lift:.53,gravity:.61,size:22,life:.69},
};

const families={feather:'wind',root:'void',water:'ice',web:'void',stone:'gold',gold:'light'};

export function elementStyle(element) {
  return palette[element]??palette[families[element]]??palette.void;
}

export const particleContours=`
  if(motif>4.5){
    if(motif<5.5){
      contour=length(vec2(p.x*(1.35+max(0.,-p.y)*1.6),p.y*.96));
      contour+=max(0.,abs(p.x+sin(p.y*12.)*.10)-.12)*.4;
    }else if(motif<6.5){
      contour=abs(p.x+p.y*.34)*1.65+abs(p.y)*.67;
    }else if(motif<7.5){
      contour=length(vec2(p.x*.90,(p.y+p.x*p.x*.8)*3.1));
    }else if(motif<8.5){
      float seam=p.x-(abs(p.y+.13)-abs(p.y-.18))*.76;
      contour=max(abs(seam)*4.,abs(p.y));
    }else if(motif<9.5){
      contour=min(abs(p.x)*2.8+abs(p.y)*.73,abs(p.y)*2.8+abs(p.x)*.73);
    }else if(motif<10.5){
      contour=abs(length(p)-.29)*2.35;
    }else{
      contour=length(p*vec2(.97,1.21))+(sin(p.x*18.)*sin(p.y*16.))*.065;
    }
  }
`;
