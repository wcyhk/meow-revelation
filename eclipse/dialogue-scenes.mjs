import {local} from './journey-copy.mjs';

const line=(speaker,text,mood)=>({speaker,text,mood});
const narration=(text,illustration)=>({...line('narrator',text),illustration});
const hero=(text,mood)=>line('hero',text,mood);
const little=(text,mood)=>line('little',text,mood);
const keeper=(text,mood)=>line('keeper',text,mood);
const warden=(text,mood)=>line('warden',text,mood);
const choice=(id,label,reply,note)=>({id,label,reply,note});

const scenes={
  '缺頁的口糧簿':{
    cast:['hero'],illustration:'ration-book',moods:{hero:'shock'},
    intro:[
      narration('幾日前，妹妹小燈失蹤。阿婆唔記得屋企住過另一隻小貓，你手上嗰盞守燈卻仲照得出佢畫嘅歪提柄。'),
      hero('你答應過留燈等我。今次換我接你返屋企。','grief'),
      narration('入林前，帳房修鐘人司刻交咗一張退路收據畀你。佢借出神器、替你保管紀錄，自己卻被封印困喺入口。'),
      narration('七年前大饑荒，四大商會發糧時收取指印。你喺糧倉外門搵到當年嘅收據，最後一行就係小燈嗰個細指印。'),
      narration('領糧數目清清楚楚，姓名一欄俾咒印遮住。守燈一照，簿底浮出「以真名抵糧」同四枚商印。原來領糧收據被偷改成契約。'),
      narration('真名牽住一個人同世界嘅記憶。被徵走，親友就會漸漸認唔出佢；照抄字跡亦解唔開契約。'),
      hero('守燈仲留住小燈嘅痕跡。我會順住呢點光，搵返佢。','dawn'),
    ],
    options:[
      choice('drawing','描低嗰盞歪燈',[
        hero('個名被遮住，呢道歪弧仲喺度。守燈保住嘅記憶，我會一頁頁記低。','dawn'),
      ],'歪柄燈畫由守燈保住，係辨認小燈嘅記憶錨。'),
      choice('receipt','揭起簿底嘅收據',[
        narration('司刻喺入口交過同樣嘅收據。背面留住一句話：沿封印運糧嘅路向內行，搵返被徵走嘅人。'),
        hero('佢知道入口點運作。我先沿呢條路追。'),
      ],'司刻嘅收據指向林內運糧路，佢本人仍留喺入口。'),
    ],
  },
  '水底的留聲燈':{
    cast:['hero','little'],names:{little:'小燈 · 留聲'},illustration:'flooded-light',moods:{hero:'grief',little:'grief'},
    intro:flags=>[
      narration(flags['缺頁的口糧簿']==='drawing'?'燈柄同你描低嘅歪弧一樣。燈芯入面有一道留聲封印。':'水道托起一盞歪柄燈。燈芯入面有一道留聲封印。'),
      little('哥哥，阿婆今日問我係邊個。商會啲人話，欠據到期，要帶我去王座。你搵我嗰陣，就睇我畫嗰盞燈。'),
      narration('點收回條把小燈列作「存活封存」。呢段係被帶走前嘅錄音，沿途留下嘅影子同回音，會重播最後嘅記憶。'),
      hero('你仲活住。真係要見到你，我要去王座開庫。','dawn'),
    ],
    options:[
      choice('answer','「小燈，我認得你。」',[
        hero('你聽唔到呢句，但我會帶住佢行到你面前。'),
        narration('錄音播完，燈芯靜落嚟。你將佢收好。'),
      ],'你對錄音承諾會救小燈；錄音並無即時回應。'),
      choice('listen','再聽一次錄音',[
        little('我留低門口盞燈嗰個圖案。路好黑，你記得照住級樓梯。'),
        narration('同一句話再次響起。呢盞燈保存嘅係留言，真人仍然困喺囚名庫。'),
      ],'留言重播證實小燈係被運往囚名庫，並未同你重逢。'),
    ],
  },
  '守關人的回條':{
    cast:['hero','keeper'],names:{keeper:'司刻 · 帳簿投影'},illustration:'three-doors',moods:{hero:'shock',keeper:'dawn'},
    intro:flags=>[
      narration('你將回條壓喺守燈下面。入口帳簿嘅封印亮起，司刻嘅投影出現；佢仍坐喺林門外，手指離唔開嗰本簿。'),
      ...(flags['缺頁的口糧簿']==='drawing'?[keeper(local(
        '嗰道歪燈柄係小燈自己畫嘅。沿水道搵同一個記號，守燈一照，你就認得出佢留下嘅路。',
        '那道歪灯柄是小灯亲手画的。沿水道找同一个记号，用守灯照一照，你就能认出她留下的路。',
        'Glimmer drew that crooked handle. Look for the same mark along the waterway. Your lantern will reveal her trail.',
        '曲がった持ち手はルゥが描いた目印だ。水路に同じ印がある。灯をかざせば、あの子の足取りを追える。'))]
        :flags['缺頁的口糧簿']==='receipt'?[keeper(local(
          '你手上係糧倉運貨嘅副據。記低右下角嘅號碼，王座下嘅名庫會用同一個編號。',
          '你手里的是粮仓运货的副单。记住右下角的编号，王座下的名库也会用它。',
          'That is a copy of a grain shipment receipt. Keep the number in the corner. The name vault uses the same one.',
          'それは穀物を運んだときの控えだ。右下の番号を覚えておけ。玉座の下の名庫でも同じ番号が使われている。'))]:[]),
      keeper('我當年幫商會修過鐘，個名亦押喺主契度。封印令我行唔過入口，只能靠收據同你講話。'),
      keeper('呢座林有百道封鎖。巡燈、血月、無月係同一夜嘅三種封印路徑，都通去王座；路線重疊，守衛同出口就會改位。'),
    ],
    options:[
      choice('routes','問更深嘅路點解有更多金幣',[
        keeper('你打破封印，困住嘅時間會散出嚟。我將佢鑄成金幣，存在入口，用嚟修器械同練戰技。封印越深，釋放出嚟嘅越多。'),
      ],'金幣由被解除嘅封印時間鑄成，入口保存訓練同紀錄。'),
      choice('seal','問點解守衛同神器都聽商會命令',[
        keeper('商會把異地武者同妖物嘅契印接入王冠。有啲自願守庫，有啲連自己受控制都唔知。入口借出嘅神器亦帶住舊印，會引來追討。'),
        hero('我會記住，擋路嘅人各有來歷。'),
      ],'守衛受商會契印驅使。神器舊印會引來專屬守護者追討。'),
    ],
    outro:[
      keeper('祝福係封印鬆開後留下嘅守護，只陪你今輪行。訓練所嘅科技可以修好再用；神祕借力要另簽契印，主契解除之後由借用者償還。'),
    ],
  },
  '商會的印模':{
    cast:['hero'],illustration:'iron-faces',moods:{hero:'shock'},
    intro:[
      narration('爐旁嘅圖紙分成兩步：把真名嘅印記拓落金屬，再將原名封入王座。王冠用呢啲金屬契印，控制守衛同糧路。'),
      hero('打爛控制印，仲有機會叫醒佢哋。原名仍然收喺王座。'),
      narration('工匠留下一道暗槽，將拆落嘅空印送去入口。訓練所用呢啲金屬修機械人、造雷達同急救裝置。'),
    ],
    options:[
      choice('imprint','拓低其中一張臉',[
        narration('你把面孔同運送編號一齊拓低。歸名後，呢張紙可以幫家屬認領名冊。'),
      ],'你保存面孔同運送編號，作為還名後追查嘅證據。'),
      choice('broken','察看拆過嘅印模',[
        narration('控制用嘅刻紋已被磨平，空殼上換成工匠嘅鉚釘。入口修器械用嘅，係拆除咒印後嘅金屬。'),
      ],'科技裝備取材自解除控制嘅舊印模；原名仍保存在囚名庫。'),
    ],
  },
  '一塊寫不完的碑':{
    cast:['hero'],illustration:'empty-place',moods:{hero:'grief'},
    intro:[
      narration('碑上寫住：佢仲活着，我只係想唔起佢個名。旁邊另有一列真正嘅墳，刻字同樣空白。'),
      hero('有人等緊活人返嚟，亦有人連送別都做唔到。'),
      narration('守墓人留低規矩：歸名鐘可以還回姓名同記憶；活着嘅人可以相認，已經死去嘅人，會重新有碑可認。'),
    ],
    options:[
      choice('bowls','將兩隻碗並排放好',[
        narration('碗底寫住「等佢活着出庫」。你將有缺口嗰隻放返近門一邊，畀等候嘅人睇見。'),
      ],'雙碗係等待仍然活着嘅失名者；還名亦會讓死者重新被紀念。'),
      choice('stone','細讀墓碑上嘅刻痕',[
        hero('我會帶返佢個名。至於你等嗰個人，我亦會查清楚佢仲喺唔喺度。'),
      ],'你分清還名、救出活人同追認死者，唔再把所有空碑當成可救回嘅人。'),
    ],
  },
  '一袋無人領走的糧':{
    cast:['hero'],illustration:'sealed-grain',moods:{hero:'dawn'},
    intro:[
      narration('收成早喺五年前恢復。四商會嘅密帳仍逐月添上新嘅徵名名額，換來嘅糧轉售各地，利錢分別蓋住四枚商印。'),
      hero('救災已經完咗。佢哋用假欠據帶走新嘅人，繼續做生意。'),
      narration('金庫鎖住嘅係已經換成實物嘅糧。斷開契約之後，呢批存糧仍能接濟村民，等正常收成送到。'),
    ],
    options:[
      choice('grain','割開一袋封存嘅穀',[
        narration('穀粒完好。袋底仲夾住一張被撤回嘅賑災令，日期係饑荒結束嗰一年。'),
      ],'有足夠現存糧食可解封賑濟，斷契後能接回正常耕作。'),
      choice('ledger','抄低四商會嘅帳目',[
        narration('徵名、換糧、銷售同分帳都有編號。你抄低四道印章，將證據收進守燈嘅夾層。'),
      ],'四商會係契約嘅經營者。你保存徵名同售糧帳目，準備交畀受害者追究。'),
    ],
  },
  '倒行的星盤':{
    cast:['hero','keeper'],names:{keeper:'司刻 · 帳簿投影'},illustration:'reverse-clock',moods:{hero:'shock',keeper:'grief'},
    intro:[
      narration('你把星盤上嘅「司刻」兩字對住收據。投影再次亮起，入口帳簿同林內鐘齒嘅接線一清二楚。'),
      keeper('七年前嗰份主契，係我幫佢哋接上星盤。我以為收成恢復就會解除；發現佢哋續約嗰陣，我已經被鎖喺入口。'),
      keeper('回退範圍只包住森林。你嘅燈一滅，呢輪林路會碎返去入場之前。我只夠時間攞返守燈同你，外面嘅日子會繼續行。'),
    ],
    options:[
      choice('reset','「點解紀錄同訓練留得低？」',[
        keeper('帳房喺回退範圍外。金幣、修好嘅裝備同訓練留喺呢邊；你喺林內借嘅祝福會散，守衛嘅契印就重新結起。'),
        keeper('過關後再開嘅挑戰，會由帳簿重演另一條路。我會清楚記低你真正完成嗰一夜。'),
      ],'森林內嘅本輪會回退；入口紀錄、金幣、修理同訓練保留。通關後重玩係帳簿重演。'),
      choice('clock','「你點解唔自己去敲鐘？」',[
        keeper('我嘅名被釘喺入口主印，離開就會連條退路都斷。可以行到王座嘅，係仍然有自己真名、又帶住守燈嘅你。'),
        hero('你保住退路。我把解除你契約嗰頁帶返嚟。'),
      ],'司刻受入口契約限制，只能保管退路同發送投影，不能代你破冠。'),
    ],
  },
  '根下的童謠':{
    cast:['hero','little'],names:{little:'小燈 · 留聲'},illustration:'root-song',moods:{hero:'dawn',little:'shock'},
    intro:flags=>[
      narration('運送車轍伸進王座方向。菌絲保存住小燈喺車上唱嘅童謠，樹根就隨住嗰段固定旋律發光。'),
      little('歪歪嘅柄，照住門邊。有人記得，我就認得返屋企嗰邊。'),
      ...(flags['水底的留聲燈']==='answer'?[hero('今次都係你留低嘅聲。我會親自帶你行完最後嗰段。')]:[]),
      narration('運送木牌標住同一個囚名庫編號。呢段係途中留下嘅回音，證明你一直沿住同一條運送線。'),
    ],
    options:[
      choice('humming','跟住哼埋最後一句',[
        hero('我會帶住嗰盞燈，行到你面前。','grief'),
        narration('菌絲重播原有嘅旋律。你按亮起嘅車轍，找出下一段路。'),
      ],'你利用保存嘅童謠確認運送路線，小燈本人仍在王座。'),
      choice('steps','察看兩道巡邏爪痕',[
        narration('兩道大爪痕橫過車轍，旁邊貼住無月加派雙衛嘅命令。護送隊曾喺此等另一隻守衛會合。'),
      ],'無月雙頭目係加派嘅守衛；車轍繼續指向囚名庫。'),
    ],
  },
  '戴冠人的證詞':{
    cast:['hero','warden'],names:{warden:'守夜者 · 七年前的留聲'},illustration:'crowned-witness',moods:{hero:'dawn',warden:'grief'},
    intro:[
      narration('教堂留聲晶石記錄住七年前嘅宣誓。影像停喺守夜者戴冠嗰一刻，牠聽唔到你講話。'),
      warden('我願意暫代保管名庫，先畀孩子食飯。等下次收成到，你哋就解除抵押，放所有人返去。'),
      narration('四商會蓋印後，聲音被剪斷。後來補上嘅續約頁，從未取得守夜者同領糧人同意。'),
    ],
    options:[
      choice('name','查看被刮走嘅簽名',[
        narration('晶石外殼有一個鐘形壓痕，對應王座契約嘅封蠟位置。真人仍然被鎖喺王座，名字要去主契搵返。'),
        hero('我會搵返嗰頁，親口叫醒你。'),
      ],'證詞係七年前嘅留聲。守夜者真人一直在王座，真名藏於主契封蠟之下。'),
      choice('children','聽埋宣誓前嘅片段',[
        warden('第一批糧，我親眼睇住送入醫棚。餘下嗰啲，都要逐戶送到。'),
        hero('你當年想救人。戴冠之後，佢哋連你都控制埋。'),
      ],'守夜者原先為救災自願看庫，之後遭商會以續約同王冠控制。'),
    ],
  },
  '王座下的契約':{
    cast:['hero','keeper'],names:{keeper:'司刻 · 帳簿投影'},illustration:'throne-contract',moods:{hero:'dawn',keeper:'dawn'},
    intro:flags=>[
      narration(flags['戴冠人的證詞']==='name'?'你沿鐘形壓痕拆開封蠟，搵到守夜者被遮住嘅真名：晏燈。':'主契封蠟下留住守夜者嘅真名：晏燈。'),
      narration('小燈嘅運送編號，對應王座後面最矮嗰盞名燈。燈內有一個仍然呼吸嘅身影。'),
      keeper('我由入口睇到主印喇。晏燈受王冠控制，冠下嘅噬名者先至收得到真名。打碎王冠，叫醒晏燈，佢就可以幫你開名庫。'),
      keeper('最後敲響歸名鐘，先會解除四商會主契。神祕技能嗰幾份借力契印寫住你自己個名，要喺解約之後結清。'),
    ],
    options:[
      choice('promise','「晏燈，我會叫返你個名。」',[
        hero('我會先斬斷控制你嘅冠，再同你敲鐘。'),
      ],'你得知守夜者真名晏燈，並準備解除王冠控制。'),
      choice('home','「小燈，我會帶你活着返屋企。」',[
        hero('今次我知道你真正喺邊。等我開呢道門。','grief'),
      ],'你已找到小燈被囚嘅名燈，下一步係破冠同開庫。'),
    ],
  },
  '歸名鐘':{
    cast:['hero','warden'],names:{warden:'晏燈 · 王冠守夜者'},illustration:'returning-bell',moods:{hero:'dawn',warden:'dawn'},
    intro:flags=>[
      narration('王冠碎落台階，冠下嘅黑影退入封印。你照住主契叫出「晏燈」，守夜者終於認得自己。'),
      warden('七年喇……主印鬆咗，我可以撐開名庫。最後一聲鐘未響，大家嘅名字仍然綁住。'),
      narration('小燈嘅名燈亮起，門後嗰個身影抬起頭。你第一次見到真人，仍隔住最後一重封印。'),
    ],
    options:[
      choice('call','隔住名燈叫「小燈」',[
        hero('我嚟接你。最後一聲鐘，我哋一齊等。'),
        narration('你握緊鐘繩。門內嘅身影伸出手，等你完成最後一步。'),
      ]),
      choice('together','同晏燈握住鐘繩',[
        warden('鐘會叫返每個活人嘅名，也會替死去嘅人留下碑冊。你準備好，我就同你拉。'),
      ]),
    ],
  },
};

export function storyDialogue(clue,flags={}){
  const scene=scenes[clue.title];
  if(!scene)return {cast:['hero'],intro:clue.text.map(text=>narration(text))};
  return {...scene,intro:typeof scene.intro==='function'?scene.intro(flags):scene.intro};
}

export function chapterInterlude(flags={}){
  const chosen=flags['缺頁的口糧簿'];
  const discovery=chosen==='drawing'
    ? local('織碑夫人鬆開絲線。你喺金庫門檻認出小燈畫嘅歪燈柄，佢確實經過呢度。',
      '织碑夫人松开丝线。你在金库门槛认出小灯画的歪灯柄，她确实经过这里。',
      'As the Weaver lets go of her threads, you spot Glimmer’s crooked lantern on the vault threshold. She came through here.',
      '織り手が糸を放す。金庫の敷居にルゥが描いた曲がった灯の印がある。あの子はここを通った。')
    : local('織碑夫人鬆開絲線。金庫門底露出同你保存嘅副據一樣嘅運送編號。',
      '织碑夫人松开丝线。金库门下露出与副单相同的运送编号。',
      'As the Weaver lets go of her threads, a shipping number emerges beneath the vault door. It matches your receipt.',
      '織り手が糸を放すと、金庫の扉の下に運送番号が現れる。持ってきた控えと同じ番号だ。');
  return {cast:['hero','keeper'],illustration:'sealed-grain',moods:{hero:'dawn',keeper:'dawn'},intro:[
    narration(discovery),
    keeper(local('我會喺入口帳簿留低你行到嘅位置。金庫後面仲有五十層，囚名庫喺王座底，去接小燈返嚟。',
      '我会在入口账簿记下你走到的位置。金库后还有五十层，囚名库就在王座下，去接小灯回来。',
      'I’ll mark your place in the ledger at the gate. Fifty floors remain. The name vault lies beneath the throne. Bring Glimmer home.',
      '入口の帳簿に、ここまでの記録を残しておく。この先は残り五十階。名庫は玉座の下だ。ルゥを連れ帰ろう。')),
  ],options:[
    choice('continue',local('繼續第 51 層','继续第 51 层','Continue to floor 51','51階へ進む'),[]),
    choice('return',local('先返回入口','先返回入口','Return to the entrance','いったん入口へ戻る'),[]),
  ]};
}

export function openingPayoff(flags={}){
  const chosen=flags['缺頁的口糧簿'];
  if(chosen==='drawing')return narration(local(
    '燈底嗰道歪弧仍然清清楚楚。小燈攬住盞燈，記得自己當日點樣畫低呢個記號。',
    '灯底那道歪弧依然清清楚楚。小灯抱着灯，记得自己那天怎样画下这个记号。',
    'The crooked line is still clear on the lantern. Glimmer hugs it, remembering the day she drew that mark.',
    '灯の底に、曲がった線がまだ残っている。ルゥは灯を抱きしめ、その印を描いた日のことを思い出す。'));
  if(chosen==='receipt')return narration(local(
    '司刻將你保存嘅副據同名冊夾埋一齊。封存編號終於對返一個個真名，家屬有路去追查。',
    '司刻把你保存的副单和名册夹在一起。封存编号终于对上真名，家属有了追查的线索。',
    'The timekeeper files your receipt with the register. Families can finally trace the shipment numbers back to real names.',
    '時守は、君が持ち帰った控えを名簿に挟んだ。運送番号と本当の名がつながり、家族が行方をたどれるようになった。'));
  return null;
}
