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
  water:{shape:12,speed:2.43,lift:1.66,gravity:3.1,size:13,life:.57},
  gold:{shape:13,speed:2.15,lift:1.88,gravity:2.15,size:11,life:.71},
  stone:{shape:14,speed:2.0,lift:1.48,gravity:4.1,size:14,life:.58},
  root:{shape:15,speed:1.71,lift:1.14,gravity:1.23,size:19,life:.76},
  web:{shape:16,speed:1.51,lift:.74,gravity:.18,size:17,life:.83},
  poison:{shape:17,speed:1.25,lift:1.09,gravity:-.36,size:22,life:.94},
  feather:{shape:18,speed:2.55,lift:.88,gravity:.85,size:15,life:.57},
};

export function elementStyle(element) {
  return palette[element==='earth'?'stone':element]??palette.void;
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
    }else if(motif<11.5){
      contour=length(p*vec2(.97,1.21))+(sin(p.x*18.)*sin(p.y*16.))*.065;
    }else if(motif<12.5){
      contour=length(vec2(p.x*(1.45+max(0.,p.y)),p.y*.94))*.94;
    }else if(motif<13.5){
      contour=max(abs(p.x+p.y*.30)*1.20,abs(p.y+p.x*.29)*1.65);
    }else if(motif<14.5){
      contour=max(abs(p.x+p.y*.21)*1.12,max(abs(p.y)*1.32,abs(p.x*.60-p.y*.83)*1.32))+.052*sin(p.y*14.);
    }else if(motif<15.5){
      contour=min(abs(p.x-sin(p.y*4.)*.16)*3.6+abs(p.y)*.80,
        abs(p.x+p.y*.67+.21)*3.6+abs(p.y+.27)*1.22);
    }else if(motif<16.5){
      contour=min(min(abs(p.x+p.y)*2.8,abs(p.x-p.y)*2.8),abs(length(p)-.32)*2.)+length(p)*.64;
    }else if(motif<17.5){
      contour=length(p)*(.98+.18*sin(atan(p.y,p.x)*5.))+.07*sin(p.x*10.-p.y*12.);
    }else{
      contour=length(vec2((p.x-p.y*p.y*.32)*2.5,p.y*.88))+.063*sin(p.y*34.+abs(p.x)*13.);
    }
  }
`;
