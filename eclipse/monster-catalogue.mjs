// 52 巨商 desktop monster index, regional BOSS / level-10 rows, 巨型 BOSS and 國家討伐戰.
// Source page slugs keep the localized roster traceable. Models and combat use original assets.
const rows=`
m001|紫紋蛇神|daguanling|serpent|violet|coils|
m002|邪惡的蟒蛇(雷)|daguanling|serpent|venom|cobra|lance
m003|獨角鬼|gaoshoudong|ogre|teal|oni|summon,sweep
m004|騎馬槍手之魂|wuningwang|rider|frost|lancer|lance
m005|白熊|yueqifeng|beast|ember|bear|
m006|赤賊頭目(風)|qiannianhu|duelist|jade|bandit|
m007|燃燒的火龍(火)|youmingjie|dragon|ember|ring|cinders
m008|美室之魂|kerim|priest|jade|veil|summon
m009|句芒的邪念|kerim|priest|moss|antler|summon
m010|五運・蕭 (風)|star|priest|jade|halo|prison
m011|五運・炎 (火)|star|duelist|ember|axe|cinders,prison
m012|五運・傳 (水)|star|priest|frost|orb|pounce,prison
m013|五運・太 (雷)|star|priest|amber|halo|gravity,prison
m014|狂魔黑麟|kaimazhuangyuan|beast|ember|kirin|spiral
m015|狂魔紅雀|huajiushan|bird|ember|phoenix|cinders
m016|杜魯珈|mimichangsuo|duelist|bone|scythe|lance
m017|魔奧|mimichangsuo|priest|frost|ring|
m018|不死的秦始皇(火)|qinshihuang|emperor|ember|banner|summon,prison
m019|劉邦之魂|binggong|serpent|frost|coils|summon,cinders
m020|項羽之魂|binggong|rider|frost|blade|summon,burst
m021|小玲的邪念|xiaoling|priest|amber|lotus|icicles
m022|狂魔邪武|beihaibingku|turtle|frost|spire|gravity
m023|屠翼(10級 )|guiyidong|ogre|moss|cleaver|
m024|毒龍|zhaoze|dragon|moss|wyrm|
m025|破奧|pao|dragon|teal|broken|
m026|真・破奧|pao|dragon|frost|crown|
m027|破滅者|pao|ogre|blood|axe|sweep
m028|狐仙・美郎(雷)|huxian|bird|jade|fox|
m029|惡仙・鐵拐李(風)|eren|rider|ember|tiger|
m030|九影(火)|yanmo|bird|ember|bat|barrage,cinders
m031|高公公(火)|yanmo|emperor|ember|topknot|summon,cinders
m032|藍菜花(水)|heilong|priest|frost|lotus|
m033|妖刀姬(火)|guimen|duelist|ember|mask|cinders
m034|白面九尾狐 (雷)|guimen|beast|frost|fox|summon,cross
m035|怨恨神(火)|yuanhen|emperor|ember|orbs|cross
m036|怨恨神(水)|yuanhen|emperor|frost|orbs|cross
m037|怨恨神(風)|yuanhen|emperor|jade|orbs|cross
m038|怨恨神(雷)|yuanhen|emperor|amber|orbs|cross
m039|樓陀羅之魂(水) ( , )|yuetian|priest|blood|halo|icicles
m040|乾達婆之魂(水)|yuetian|duelist|teal|ring|sweep,prison
m041|夜叉之魂(風)|yuetian|duelist|moss|sword|
m042|伐由之魂(風)|yuetian|rider|amber|spear|pounce
m043|怨望神(雷)|wenmang|ogre|violet|spikes|pounce
m044|怨望神(水)|wenmang|ogre|frost|spikes|pounce
m045|怨望神(風)|wenmang|ogre|moss|spikes|pounce
m046|怨望神(火)|wenmang|ogre|ember|spikes|pounce
m047|絕望神(雷)|wenmang|ogre|amber|titan|
m048|絕望神(水)|wenmang|ogre|frost|titan|
m049|絕望神(風)|wenmang|ogre|moss|titan|
m050|絕望神(火)|wenmang|ogre|ember|titan|
m051|復仇者於台 (火)|kuanglu2|duelist|blood|twins|
m052|實驗體 冰精靈 (雷)|kuanglu2|beast|frost|wolf|
m053|鎮墓獸 (火)|kuanglu3|beast|ember|hound|summon
m054|鎮墓獸 (雷)|kuanglu3|beast|amber|hound|summon
m055|知識的古龍 (水)|kuanglu4|serpent|teal|dragon|
m056|復仇者小玲 (風)|kuanglu4|priest|moss|tendril|
m057|鎮墓獸 (水)|kuanglu5|beast|frost|hound|summon
m058|鎮墓獸 (風)|kuanglu5|beast|venom|hound|summon
m059|玄真・長老(火)|kuanglu10|priest|bone|crown|
m060|祭司長・真武(水)|kuanglu10|priest|frost|staff|
m061|祭司長・虛毒(風)|kuanglu10|priest|venom|staff|
m062|工作員・多玲(雷)|kuanglu10|duelist|amber|spy|
m063|幻炎的鴣子靈 (火)|kuanglu11|priest|ember|wing|
m064|污水的鴣子靈(水)|kuanglu11|priest|frost|wing|
m065|毒風的鴣子靈(風)|kuanglu11|priest|venom|wing|
m066|暗電的鴣子靈(雷)|kuanglu11|priest|amber|wing|
m067|皇帝軒轅|hundun|emperor|amber|banner|
m068|皇帝軒轅 (強)|hundun|emperor|gold|twin|
m069|五運・蕭 (風・強)|hundun|priest|gold|halo|
m070|五運・炎 (火・強)|hundun|duelist|blood|axe|
m071|五運・傳 (水・強)|hundun|priest|frost|crown|
m072|五運・太 (雷・強)|hundun|priest|amber|orb|
m073|道士・聖 (火)|kuanglu6|priest|ember|flame|
m074|道士・抵 (雷)|kuanglu6|rider|amber|tiger|lance,prison
m075|惡靈 焰獄 (火)|kuanglu7|duelist|blood|demon|
m076|惡靈 電異 (雷)|kuanglu7|duelist|gold|demon|
m077|道士・如 (水)|kuanglu8|priest|frost|mist|
m078|道士・必 (風)|kuanglu8|priest|moss|crescent|sweep
m079|惡靈 風魔 (風)|kuanglu9|priest|teal|wind|
m080|惡靈 水靈 (水)|kuanglu9|priest|frost|tide|
m081|羅刹宫 (火)|kuanglu12|duelist|ember|blazing|spiral
m082|惡仙宫 (水)|kuanglu12|priest|frost|ghost|spiral
m083|劍鬼宫 (風)|kuanglu12|duelist|venom|ghost|
m084|射手宫 (雷)|kuanglu12|duelist|gold|ghost|
m085|納巴塔卡巴查 (火)|kuanglu13|emperor|ember|orbs|
m086|納巴塔卡巴查 (水)|kuanglu13|emperor|frost|orbs|
m087|納巴塔卡巴查 (雷)|kuanglu13|emperor|gold|orbs|
m088|納巴塔卡巴查 (風)|kuanglu13|emperor|venom|orbs|
m089|京門神将 (火)|kuanglu14|ogre|ember|staff|
m090|上門神将 (水)|kuanglu14|ogre|frost|staff|
m091|開門神将 (風)|kuanglu14|ogre|venom|staff|
m092|四門神将 (雷)|kuanglu14|ogre|gold|guardian|
m093|四門神将 (明)|kuanglu15|ogre|bone|guardian|
m094|四門神将 (暗)|kuanglu15|ogre|void|guardian|
m095|海星|ribenhaidi|star|violet|reef|
m096|黃金海星(水)|ribenhaidi|star|gold|sun|cinders
m097|冰之骷髏君主|bingcheng|ogre|frost|bones|
m098|重生的破奧|bingcheng|dragon|void|broken|
m099|重生的冰雪神|bingcheng|ogre|frost|giant|
m100|天草樽|bingcheng|duelist|frost|grave|
m101|本願寺之魂|orochi|priest|ember|crown|
m102|大蛇的手下|orochi|ogre|blood|serpent|
m103|八岐大蛇|orochi|hydra|ember|coils|
m104|閃電巨人(雷) ,|guiqucheng|ogre|frost|titan|
m105|狂鐳的天草(雷)|guiqucheng|priest|ember|storm|lance,cinders
m106|狂魔惡龍|qinglongtan|dragon|frost|wyrm|cross
m107|海賊船長傑克(水)|haizeidong|captain|blood|cannon|lance,barrage,prison
m108|狂虎|baihulin|beast|frost|tiger|spiral,gravity
m109|蓐收的邪念|yasurim|priest|amber|crescent|
m110|猛虎之魂|yasurim|beast|amber|tiger|
m111|黃牛怪|nepal|beast|blood|bull|
m112|庫貝拉|shiku|duelist|bone|axe|
m113|喇巴娜|shiku|duelist|ember|ring|
m114|撒迦汗與王妃|taji|emperor|gold|pair|
m115|雅瑪與亞彌|taji|emperor|blood|pair|summon
m116|阿南達|taiyang|hydra|void|cobra|
m117|阿修羅的師弟|taiyang|ogre|amber|horn|lance
m118|哈努曼的師弟|taiyang|duelist|teal|spear|spiral
m119|濕婆的師弟|taiyang|duelist|gold|trident|lance
m120|迦尼薩的師弟|taiyang|ogre|frost|elephant|
m121|沙漠女王蜘蛛|wudou|spider|bone|widow|cross
m122|伐楼拿|deva|priest|amber|lotus|summon
m123|因陀羅|deva|emperor|gold|elephant|summon,cross
m124|提亞馬特|deva|dragon|amber|crown|summon,spiral
m125|弗栗多|deva|emperor|gold|trident|summon
m126|阿迦修羅|haian|serpent|blood|horn|
m127|西嵐那亞薩|haian|dragon|ember|broken|spiral
m128|惡龍・卡利亞|haian|dragon|ember|bat|cinders
m129|沙漠麒麟(風)|wang|beast|bone|kirin|spiral
m130|大罕之魂(風)|wang|priest|teal|crown|pounce
m131|水龍(水)|wang|dragon|frost|crown|
m132|墮落的饕餮(火)|wang|beast|ember|devour|cinders
m133|佳真|wang|emperor|ember|halo|
m134|神獸玄武|soomi|turtle|frost|spire|icicles,gravity
m135|多聞天王|soomi|priest|frost|tendril|spiral,icicles
m136|神獸朱雀|soomi|bird|ember|phoenix|cinders
m137|持國天王|soomi|emperor|ember|blade|cinders
m138|神獸青龍|soomi|serpent|teal|crown|cross
m139|增長天王|soomi|emperor|gold|spear|cross
m140|神獸白虎|soomi|beast|bone|tiger|spiral
m141|廣目天王|soomi|emperor|blood|banner|
m142|無間鬼 (火)|emeng|priest|moss|flame|
m143|噩夢鬼 (雷)|emeng|ogre|amber|bones|
m144|太初的饕餮 (火)|emeng2|beast|amber|devour|
m145|太初的混沌 (雷)|emeng2|beast|bone|spike|
m146|凶夢鬼 (水)|emeng3|priest|frost|ghost|summon,lance
m147|噩夢守卫 (風)|emeng3|ogre|gold|guardian|summon
m148|太初的窮奇 (水)|emeng4|bird|frost|bat|
m149|太初的檮杌 (風)|emeng4|beast|frost|devour|spiral,pounce
m150|皇帝烏龜|big|turtle|moss|amber|sweep
m151|大王馬蜂|big|wasp|gold|hornet|
m152|貪|big|serpent|teal|greed|cross
m153|黑影|big|shade|void|reaper|spiral
m154|牛鬼|big|ogre|blood|ox|spiral
m155|雞蛋怪|big|eggs|amber|clutch|sweep,burst
m156|稻草怪|big|straw|ember|effigy|gravity
m157|山魈|big|ogre|ember|mandrill|burst
m158|古代雪人|big|ogre|bone|ape|
trial-jing-light|京門神將 (明)|kuanglu15|emperor|gold|spear|lance,ring,marked
trial-jing-dark|京門神將 (暗)|kuanglu15|duelist|void|spear|lance,blink,gravefan
trial-shang-light|上門神將 (明)|kuanglu15|priest|frost|orb|icicles,ring,lance
trial-shang-dark|上門神將 (暗)|kuanglu15|priest|violet|ghost|gravity,icicles,prison
trial-kai-light|開門神將 (明)|kuanglu15|ogre|jade|guardian|spiral,pounce,sweep
trial-kai-dark|開門神將 (暗)|kuanglu15|ogre|void|staff|cleave,blink,cross
raid-flame|燃燒的火焰怪|tobel|ogre|ember|magma|cinders,burst,cleave
raid-wyvern|沙漠飛龍|tobel|dragon|amber|dunes|spiral,pounce,burst`;
export const monsterCatalogue=rows.trim().split('\n').map(row=>{
  const [id,name,source,family,tone,crest,attacks]=row.split('|');
  return {id,name,source,family,tone,crest,attacks:attacks?attacks.split(','):[]};
});
