// Frequencies, start offsets and short envelopes are authored in seconds.
const voices=[
  {
    charge:{tones:[[492,665,0,.32,.17,'sine'],[985,1130,.055,.25,.085,'triangle'],[1476,1540,.102,.21,.055,'sine']]},
    ready:{tones:[[1132,1080,0,.059,.18,'triangle'],[1540,1432,.058,.067,.13,'sine']]},
    release:{tones:[[928,327,0,.19,.18,'triangle'],[1682,585,.013,.16,.095,'sine']],
      air:[0,.13,.15,2240]},
    impact:{tones:[[562,470,0,.24,.16,'sine'],[1173,978,.009,.20,.091,'triangle'],[174,123,0,.15,.17,'triangle']],
      air:[0,.14,.15,2290]},
  },
  {
    charge:{tones:[[89,154,0,.34,.25,'triangle'],[209,332,.052,.23,.12,'sawtooth']],
      air:[.015,.26,.20,1060]},
    ready:{tones:[[365,258,0,.063,.20,'triangle'],[511,314,.056,.068,.17,'triangle']],
      air:[.054,.050,.18,1790]},
    release:{tones:[[237,86,0,.19,.25,'sawtooth'],[119,48,.011,.24,.16,'triangle']],
      air:[0,.20,.24,1330]},
    impact:{tones:[[160,52,0,.27,.30,'triangle'],[425,128,.016,.12,.14,'sawtooth']],
      air:[0,.21,.28,820]},
  },
  {
    charge:{tones:[[152,105,0,.34,.24,'triangle'],[267,185,0,.30,.15,'sine'],[672,342,.064,.23,.10,'triangle']],
      air:[.036,.21,.15,640]},
    ready:{tones:[[788,491,0,.057,.19,'triangle'],[577,289,.056,.075,.18,'triangle']]},
    release:{tones:[[339,94,0,.23,.23,'triangle'],[511,123,.015,.26,.13,'sine']],
      air:[0,.19,.24,766]},
    impact:{tones:[[136,42,0,.33,.30,'triangle'],[468,192,0,.21,.16,'sine'],[811,275,.048,.22,.11,'triangle']],
      air:[.009,.20,.23,590]},
  },
];

export function playWardenVoice(audio,phase,cue,now){
  const voice=voices[phase]?.[cue];
  if(!voice)return;
  for(const [from,to,offset,duration,volume,shape] of voice.tones){
    audio.note(from,to,now+offset,duration,volume,shape,cue==='charge'?.024:.004);
  }
  if(voice.air){
    const [offset,duration,volume,cutoff]=voice.air;
    audio.rasp(now+offset,duration,volume,cutoff);
  }
}
