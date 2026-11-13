const line=(speaker,text)=>({speaker,text});
const narration=text=>line('narrator',text);
const hero=text=>line('hero',text);
const little=text=>line('little',text);
const keeper=text=>line('keeper',text);
const warden=text=>line('warden',text);

const finale=(id,title,route,intro)=>({id,title,route,art:`./ending-art/${id}.webp?v=last-bell-1`,cast:[],intro});
const ordinary='普通結局';
const tech='科技・智慧策略';
const mystic='神祕・犧牲狂熱';

export const endings=[
  finale('home','星火歸家',ordinary,[
    narration('鐘聲越過林門。家門口嗰級樓梯仲係鬆嘅。小燈提住盞歪柄燈，照住嗰一級，等你行近。'),
    little('哥哥，阿婆今日叫得出我個名。佢煮咗兩碗粥。'),
    hero('咁就趁熱食。今次我哋一齊行入去。'),
    narration('司刻合上帳簿。入口座鐘第一次行過午夜。你留低嗰盞守燈，天光先返嚟攞。'),
  ]),
  finale('t-robots','架橋的人',tech,[
    narration('鐘聲一響，回村嘅石橋跟住崩塌。紅機拆下炮架承重，藍機穿過斷口綁索，綠機揹住第一袋糧試行。'),
    little('佢哋仲拎住槍，村口啲人唔敢過橋。'),
    hero('放低槍先。等佢哋睇清楚，邊一邊係可以行返屋企嘅路。'),
    narration('村民天光前過晒橋。三台機械人日後留喺橋頭，輪班送糧同巡橋。第一個行返轉頭多謝佢哋嘅人，係昔日守橋嘅商會兵。'),
  ]),
  finale('t-radar','秤底的名字',tech,[
    narration('歸名鐘響過，雷達仲掃到一排紅點。司刻掀起鐘房地磚，下面有人通宵焚毀欠據。'),
    keeper('佢哋燒緊嘅係證人嘅名字。出手之前，先抄低每個紅點嘅位置。'),
    hero('留一條路俾佢哋走。我要佢哋行到村民面前，親口交代邊個落令。'),
    narration('翌日，商會金庫同名冊一齊公開。小燈讀出帳上第一個名字，台下有人舉手認領。抄本天黑前已送去鄰村。'),
  ]),
  finale('t-medic','多救一個',tech,[
    narration('王座塌落嗰陣，兩台急救機同時亮燈。你叫佢哋轉向，先抬走石樑下嘅守夜者。'),
    warden('我替商會守咗七年。你仲想我活住做乜？'),
    hero('你記得每一個名字。活住，逐個講返俾佢哋聽。'),
    narration('守夜者喺村口醫棚醒返。屋外有人等佢認名，屋內小燈幫急救機換電。門口有張凳，留俾等消息嘅家屬。'),
  ]),
  finale('t-evac','撤離線',tech,[
    narration('鐘聲震塌咗水道。雷達畫出暗渠仍然可以通過嘅一段。你將撤離路線畫喺石牆，逐個鐘聲傳到隊尾。'),
    little('前面好黑。要唔要叫大家一齊跑？'),
    hero('三人一組，最慢嗰個行中間。每過一盞燈，數齊人先行。'),
    narration('末班出洞嘅貓帶住兩本濕透嘅名冊。到天光點名嗰陣，連曾經看守水道嘅人都企喺隊尾，等緊自己嗰個名。'),
  ]),
  finale('t-forge','修鐘公約',tech,[
    narration('王座拆咗，入林嗰座鐘仍然行得唔準。你叫機械人搬出齒輪同木樑，急救小隊照看試鐘時受傷嘅工匠。'),
    keeper('你想接我嗰本帳簿？定係將鐘房鎖匙交俾邊個？'),
    hero('一把喺工房，一把喺醫棚。改鐘要兩邊一齊在場。修過乜，貼出嚟俾村民睇。'),
    narration('鐘房變成工房同診所。小燈將三台機械人嘅輪更畫喺門上，旁邊有一格留俾識得修好下一盞燈嘅人。'),
  ]),
  finale('t-charter','天明憲章',tech,[
    narration('雷達對照活人位置，機械人搬出契約原本，急救小隊守住交接嘅人群。你將破冠放喺鐘房長桌上，邀請每戶揀一個見證人。'),
    keeper('天光之後，仲會有人想用呢座鐘替自己續命。'),
    hero('每筆糧、每個名、每次撥鐘，都由唔同嘅人簽。當中有一個人反對，鐘就停喺原位，先聽佢講。'),
    little('咁如果我唔識寫自己個名呢？'),
    narration('你將筆遞俾小燈。佢第一筆畫咗個歪柄。台下有人笑，有人同佢一齊畫。鐘第一次由台下嘅人決定幾時響。'),
  ]),
  finale('m-hand','借來的手',mystic,[
    narration('鐘繩斷開，黑、紅、紫三條觸手捲住鐘樑。每拉一下，你背脊就多一道收唔返嘅影。'),
    little('哥哥，放手啦。你隻手開始變凍。'),
    hero('我仲數到你個名。聽完最後一聲，你就落山。'),
    narration('小燈帶走咗鐘聲。你攞住斷繩留喺塔頂。以後有人喺夜路叫救命，塔上就伸落一隻手。村民慢慢學識，伸手之前要先報自己個名。'),
  ]),
  finale('m-eye','閉上一隻眼',mystic,[
    narration('黑山羊之眼照見每個遺失嘅名字。佢要你交出一隻眼，先肯放其中一個返去。'),
    hero('我用呢隻眼記低剩低嗰啲。等我講完，你先熄燈。'),
    little('你望住我嗰陣，仲睇唔睇到我？'),
    narration('你用布遮住左眼。右眼仲睇到小燈，左眼睇到所有未返屋企嘅人。每逢天黑，你就出門替佢哋逐戶敲門。'),
  ]),
  finale('m-mouth','空席上的名字',mystic,[
    narration('撒托古亞之口喺鐘底張開。敵人嘅屍身已經食晒。佢聞到你身上仲有一個未典當嘅名字。'),
    hero('食我嗰個。小燈嗰個，放返出嚟。'),
    little('我帶多咗一雙筷子……我頭先係想等邊個？'),
    narration('你喺門外聽住佢問，冇入屋。此後每年頭一日，佢都擺兩雙筷子。村民問佢等緊邊個，佢總話自己好快就會記起。'),
  ]),
  finale('m-order','睜眼的教團',mystic,[
    narration('眼印照出地底仲未散盡嘅名字。鐘聲起唔到作用，村民開始跪低，同你一齊念。'),
    little('哥哥，佢哋每日都要返嚟念？有冇一日可以休息？'),
    hero('我會留喺最前面。佢哋漏咗邊一句，我補返。'),
    narration('第一年，村民為咗記住死者返嚟。第二年，已經有人記低邊戶冇出席。小燈將自己盞燈熄咗，從人群入面行出去。'),
  ]),
  finale('m-bond','以身封鐘',mystic,[
    narration('每一次鐘擺動，石縫都傳出咀嚼聲。你用背脊伸出嘅觸手將自己綁喺鐘腳，餵巨口食走你走過嘅每一輪。'),
    keeper('你喺帳簿度攢落嘅日子，佢已經食到最後一頁。'),
    hero('剩嗰頁寫小燈。佢讀得明返屋企條路。'),
    narration('小燈走出鐘房，門縫只剩一點燈光。你仍然聽到佢落樓梯。每當佢踏上一級，鐘內就有一條繩勒得更實。'),
  ]),
  finale('m-night','萬名長夜',mystic,[
    narration('三條觸手托住倒懸嘅鐘，羊眼照出所有被典當嘅名字，巨口沿住王座張開。你將三樣嘢一齊留喺鐘底，連自己個名都交埋出去。'),
    keeper('山下會天光。鐘底每叫返一個名，你就要替佢守一夜。你知有幾多個名？'),
    hero('逐個叫。叫到最後一個先數。'),
    little('唔知點解，我覺得有人仲喺度等我。'),
    narration('小燈行入晨光。山下每戶都有人認得返自己嘅家人。塔底一萬盞燈逐盞亮起，你守住第一盞，等下一個名字開口。'),
  ]),
];

const byId=new Map(endings.map(ending=>[ending.id,ending]));
const routes={
  tech:['home','t-robots','t-radar','t-evac','t-medic','t-forge','t-evac','t-charter'],
  mystic:['home','m-hand','m-eye','m-order','m-mouth','m-bond','m-order','m-night'],
};

const pairedScenes={
  't-evac':{
    3:narration('你派三台機械人沿掃描線逐段架起扶手。最後一台熄咗火，就用機身頂住正在下沉嘅石板。'),
    6:narration('急救小隊沿掃描線逐個接走傷者。電量告急，你哋輪流用手托住最後一副擔架。'),
  },
  'm-order':{
    3:narration('觸手每晚替教團敲鐘，羊眼逐一記低邊個到場。你發覺自己已經開始數漏咗邊戶。'),
    6:narration('羊眼點算獲釋嘅名字，巨口要每戶交一段回憶。你替第一戶答應咗，往後每戶都要照辦。'),
  },
};

export function endingFor(branch,skills) {
  const mask=branch?.skills.reduce((bits,skill,index)=>skills.has(skill.id)?bits|(1<<index):bits,0)??0;
  const scene=byId.get(routes[branch?.id]?.[mask])??endings[0];
  const detail=pairedScenes[scene.id]?.[mask];
  return detail?{...scene,intro:[...scene.intro.slice(0,3),detail,...scene.intro.slice(3)]}:scene;
}
