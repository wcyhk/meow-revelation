export function titleFlare(panel){
  const sparks=Array.from({length:26},(_,i)=>{
    const spark=document.createElement('span');
    const angle=i*2.39996;
    const distance=14+(i*37)%57;
    spark.style.setProperty('--x',Math.cos(angle)*distance+'vmax');
    spark.style.setProperty('--y',Math.sin(angle)*distance*.71+'vmax');
    spark.style.setProperty('--spin',angle+'rad');
    spark.style.setProperty('--delay',(i%7)*11+'ms');
    spark.style.setProperty('--size',(5+(i*17)%25)+'px');
    return spark;
  });
  panel.append(...sparks);
  const core=panel.firstElementChild;
  core.addEventListener('animationend',()=>panel.removeAttribute('data-flash'));
  return subdued=>{
    panel.removeAttribute('data-flash');
    // Restart even if the player immediately toggles back.
    void panel.offsetWidth;
    panel.dataset.flash=subdued?'soft':'full';
  };
}
