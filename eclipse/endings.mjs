const line=(speaker,text)=>({speaker,text});
const narration=text=>line('narrator',text);
const hero=text=>line('hero',text);
const little=text=>line('little',text);
const keeper=text=>line('keeper',text);
const warden=text=>line('warden',text);

const endingsMoods={
  home:{hero:'dawn',little:'dawn'},
  't-robots':{hero:'dawn',little:'shock'},
  't-radar':{hero:'dawn',keeper:'shock'},
  't-medic':{hero:'dawn',warden:'shock'},
  't-evac':{hero:'dawn',little:'grief'},
  't-forge':{hero:'dawn',keeper:'dawn'},
  't-charter':{hero:'dawn',little:'dawn',keeper:'shock'},
  'm-hand':{hero:'dawn',little:'grief'},
  'm-eye':{hero:'grief',little:'grief'},
  'm-mouth':{hero:'grief',little:'shock'},
  'm-order':{hero:'dawn',little:'grief'},
  'm-bond':{hero:'grief',keeper:'grief'},
  'm-night':{hero:'dawn',keeper:'grief',little:'shock'},
};
const release=[
  narration('你同晏燈敲下最後一聲鐘。四商會嘅主契解除，仍然活着嘅失名者重獲姓名，囚名庫嘅鎖全部打開。'),
  narration('小燈走出名燈，捉住你嘅外衣。已經死去嘅人，名字重新出現喺碑冊；山下嘅家屬終於可以送別。'),
  narration('入口拘束亦隨主契解除。司刻帶住帳簿走出帳房，準備同受害者核對四商會嘅原本契據。'),
];
const finale=(id,title,route,lines)=>({
  id,title,route,art:`./ending-art/${id}.webp?v=last-bell-1`,cast:[],
  names:{warden:'晏燈'},moods:endingsMoods[id],
  intro:[...release,...lines].map(beat=>beat.speaker==='narrator'?beat:{...beat,cast:[beat.speaker]}),
});
const ordinary='普通結局';
const tech='科技・智慧策略';
const mystic='神祕・犧牲狂熱';

export const endings=[
  finale('home','星火歸家',ordinary,[
    narration('你牽住小燈，同獲救嘅人沿守燈返村。門口嗰級樓梯仍然鬆，今次係你行先，照住佢落腳。'),
    little('哥哥，阿婆叫得出我個名喇。佢留咗兩碗粥，話等我哋一齊食。'),
    hero('返去啦。我哋都返到嚟。'),
    narration('四商會嘅帳目被送到村會，封存糧倉重新開門。眾人分糧、認名、安葬死者，等下一季真正嘅收成。'),
  ]),
  finale('t-robots','架橋的人',tech,[
    narration('回村石橋被潰退嘅守衛拆斷。紅機拆炮架承重，藍機穿過斷口綁索，綠機卸下機槍，先背老人過橋。'),
    little('大家仲驚佢哋啲槍。'),
    hero('將槍收好。等村民睇到，今次有乜嘢可以靠得住。'),
    narration('機械人日後守住橋頭送糧。連以前替商會收糧嘅橋卒，都要按村會公布嘅名冊領取口糧。'),
  ]),
  finale('t-radar','秤底的名字',tech,[
    narration('歸名後，雷達掃到金庫底下仍有人活動。四商會嘅帳房正忙住焚毀徵名令，企圖把罪名推畀晏燈。'),
    keeper('主契原本已經喺我度。你把人同現場留住，我請家屬嚟認證據。'),
    hero('標出出口，叫佢哋放低火把。每一道商印，都要有人交代。'),
    narration('真名、運送編號同售糧帳逐筆對上。四商會嘅代表被交到公開聽證前，受害者第一次可以叫住自己個名作證。'),
  ]),
  finale('t-medic','多救一個',tech,[
    narration('鐘樓一條石樑塌落，晏燈倒喺下面。你叫急救小隊先穩住佢嘅呼吸，再同村民移走重石。'),
    warden('我守咗七年庫，仲幫王冠傷過你。你點解仲救我？'),
    hero('你要活住作證，亦有權用返自己個名。之後每一件事，我哋逐件講清楚。'),
    narration('晏燈喺醫棚醒返，配合家屬核對囚名庫。急救小隊喺日出前救返最後一個仍有呼吸嘅傷者。'),
  ]),
  finale('t-evac','撤離線',tech,[
    narration('封印失效，運糧暗渠開始崩落。雷達搵出仍可通行嘅路，你喺岔口留燈，將人群分成幾隊。'),
    little('前面好黑。要唔要一齊跑？'),
    hero('三人一組，最慢嗰個行中間。每到一盞燈，都先點齊人。'),
    narration('最後一隊帶出濕透嘅名冊。你同小燈喺出口逐個叫名，所有離開名庫嘅人都有人接應。'),
  ]),
  finale('t-forge','修鐘公約',tech,[
    narration('你派機械人拆走回退齒輪，急救小隊照看受傷工匠。原本鎖人嘅鐘房，改成工房同診所。'),
    keeper('鐘已經交返出嚟。邊個可以決定以後點用？'),
    hero('修理同醫護各保管一把匙。改裝要共同記錄，鐘聲只用嚟報時同求救。'),
    narration('小燈把維修輪更畫喺門上。夜裏有人拉鐘求助，工匠同醫護一齊出門，逐漸取代商會嘅私兵。'),
  ]),
  finale('t-charter','天明憲章',tech,[
    narration('雷達點算生還者，機械人運出存糧同原本契據，急救小隊照顧交接人群。三套工具各有紀錄，可以互相核對。'),
    keeper('以後再有人話，肯抵押一個人嘅名，就可以畀全村食飽呢？'),
    hero('糧食公開入帳，證詞分開保存，器械由村民輪流監督。領糧唔會再簽人身抵押。'),
    little('我唔識寫自己個名，可唔可以畫盞燈？'),
    narration('你教小燈先畫歪柄，再慢慢寫字。新糧約要讓每一位領糧人真正明白；村民共同接管糧庫，四商會接受追究。'),
  ]),
  finale('m-hand','借來的手',mystic,[
    narration('克蘇恩之手嘅借力印浮出背脊。三條觸手索取一條真正嘅手臂，作為今輪力量嘅代價。'),
    little('哥哥，借佢嘅力量，要畀到咁多？'),
    hero('契印係我簽嘅。我帶你返嚟，就由我結清。'),
    narration('你留下左臂，截斷最後一條借力線，帶住小燈離塔。此後你用右手提燈，背脊偶爾仍有三道影子向林門伸去。'),
  ]),
  finale('m-eye','閉上一隻眼',mystic,[
    narration('名庫已開，黑山羊之眼仍留喺你額上。佢按借力契印取走你左眼，將死去失名者嘅記憶全部留畀你。'),
    hero('我會逐個記入碑冊。至少佢哋屋企人可以知道最後發生過乜。'),
    little('你仲睇唔睇到我？'),
    narration('右眼望住小燈，左眼只剩死者嘅回憶。你用半生替家屬補完空碑，每寫完一個名，夜裏就少一把呼喚。'),
  ]),
  finale('m-mouth','空席上的名字',mystic,[
    narration('小燈已走出名燈，撒托古亞之口仍循住借力印張開。今輪吞食帶嚟嘅力量，最後要用你自己嘅真名結算。'),
    hero('只收我簽落嗰個名。其他人嘅主契已經解除。'),
    little('我明明係同人一齊返嚟……我頭先拉住邊個？'),
    narration('守燈隨你嘅真名熄咗。你喺門外睇住小燈擺低兩雙筷子，佢想唔起你。你留低一盞普通歪柄燈，轉身走入夜路。'),
  ]),
  finale('m-order','睜眼的教團',mystic,[
    narration('主契已解，你身上兩份借力印卻同時索債。你接受信眾分擔代價，答應用借來嘅力量永遠替佢哋守門。'),
    little('咁佢哋可唔可以有一日唔再借？可唔可以唔嚟？'),
    hero('等我搵到完全收起契印嘅方法，我先會放低呢盞燈。'),
    narration('頭一年，大家自願守夜；第二年，缺席已被視為背叛。小燈帶走自己盞燈。四商會嘅主契斷咗，你卻建立起另一套索取。'),
  ]),
  finale('m-bond','以身封鐘',mystic,[
    narration('觸手同巨口一齊索取代價。你把自己留喺鐘底，用身體封住兩份借力印，讓獲救嘅人離開。'),
    keeper('主契已經解除，森林冇回退可用。我帶得走帳簿，帶唔走你親手簽落嘅新封印。'),
    hero('將小燈嗰頁帶出去。每年同我講一次，佢過得點就得。'),
    narration('小燈每年都到塔外點一盞燈。你聽得見佢長大，身體卻再行唔出鐘底。你保住咗家人，亦承擔住自己借過嘅力量。'),
  ]),
  finale('m-night','萬名長夜',mystic,[
    narration('三份借力印同時追收。你用觸手鎖住巨口，讓羊眼照清所有契線，再將自己嘅真名同餘生封入鐘底。'),
    keeper('呢三份契印會一齊留喺封室。山下可以迎天光，記得你嘅人卻留唔住你個名。'),
    hero('封室由我守。將所有名冊帶出去，唔好再有人用別人嘅名換力量。'),
    little('我想多點一盞燈……好似有人仲等緊我。'),
    narration('小燈走入晨光。你同守燈留喺封室，鐘底嘅夜停喺你身上，山下嘅時間繼續向前。帳簿上提燈走過百關嗰一欄，永遠空白。'),
  ]),
];

const byId=new Map(endings.map(ending=>[ending.id,ending]));
const routes={
  tech:['home','t-robots','t-radar','t-evac','t-medic','t-forge','t-evac','t-charter'],
  mystic:['home','m-hand','m-eye','m-order','m-mouth','m-bond','m-order','m-night'],
};
const pairedScenes={
  't-evac':{
    3:narration('機械人沿雷達掃描線逐段架起扶手。最後一台用機身頂住下沉嘅石板，等所有人行過先收索。'),
    6:narration('急救小隊沿雷達掃描線先接走傷者，你同小燈留喺每個岔口，等最後一副擔架通過。'),
  },
  'm-order':{
    3:narration('觸手每晚替教團敲集合鐘，羊眼記低邊戶到場。你開始用「保護大家」解釋每一次強制點名。'),
    6:narration('羊眼點算信眾，巨口按戶收取一段回憶。你替第一戶答應之後，其他人已難以退出。'),
  },
};

export function endingFor(branch,skills){
  const mask=branch?.skills.reduce((bits,skill,index)=>skills.has(skill.id)?bits|(1<<index):bits,0)??0;
  const scene=byId.get(routes[branch?.id]?.[mask])??endings[0];
  const detail=pairedScenes[scene.id]?.[mask];
  return detail?{...scene,intro:[...scene.intro.slice(0,-1),detail,...scene.intro.slice(-1)]}:scene;
}
