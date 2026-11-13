const site='https://www.52jushang.com/';
const weaponPages={
  'shenshou': 'tiger dragon phoenix turtle qilin airavata',
  'wang': 'flameblade stormbow windhalberd frostlute',
  'chakram': 'chakra wave-wheel kali-wheel',
  'mao': 'reaper sky-halberd red-corporal blue-corporal shiva-trident xuanming vritra-spear',
  'muyu': 'bell dragon-fish lotus-fish',
  'zhua': 'fangs kunoichi-claw',
  'pao': 'cannon',
  'dao': 'sam-in true-seven glacier-sword thunder-sword goumang blood-sword seven-blade',
  'wawa': 'fox-doll snow-doll',
  'gusl': 'thunder-pearl ice-orb fire-orb spark-orb',
  'feibiao': 'han-spear',
  'futou': 'snow-axe blood-axe zhurong-axe',
  'bang': 'sky-dragon-staff treasure-staff emperor-rod',
  'gongjian': 'oni-bow red-bow',
  'kukri': 'moon-kukri dragon-kukri skanda-kukri',
  '3jiang': 'turtle-bow',
  'jipangyi': 'venom-cane yama-cane bat-cane cursed-cane rushou-cane',
  'fozhu': 'earth-beads lotus-beads',
  'qita': 'golden-orb',
  'hufu': 'ice-talisman',
  'she': 'snake',
  'huoqiang': 'western-rifle',
  'shigong': 'sniper-crossbow lion-crossbow',
  'xiong': 'hundun qiongqi taotie taowu',
  'ming': 'nether-box nether-bow nether-sword nether-halberd',
};
const armReference=new Map(Object.entries(weaponPages).flatMap(([page,ids])=>
  ids.split(' ').map(id=>[id,page])));

export function jushangReference(weapon,entry){
  const page=weapon?armReference.get(weapon.id):entry?.source;
  if(!page||page==='story')return null;
  return new URL((weapon?'item/':'monster/')+page+'.asp',site).href;
}

export function koreanTrialReference(entry){
  return entry?.source==='kuanglu15'?'https://www.gersangjjang.com/monster/kuanglu15.asp':null;
}

const weaponImages={
  "tiger": "img/shenshou/baihu.jpg",
  "dragon": "img/shenshou/qinlong.jpg",
  "phoenix": "img/shenshou/zhuque.jpg",
  "turtle": "img/shenshou/xuanwu.jpg",
  "qilin": "img/shenshou/qilin.jpg",
  "flameblade": "img/wang/chiguo.gif",
  "stormbow": "img/wang/zengzhang3.gif",
  "windhalberd": "img/wang/guangmuk.gif",
  "frostlute": "img/wang/duowen.gif",
  "chakra": "img/chakram/Item001.png",
  "reaper": "img/mao/yari76.jpg",
  "bell": "img/muyu/fish25.jpg",
  "fangs": "img/zhua/tsume61.jpg",
  "cannon": "img/pao/heilian.gif",
  "sam-in": "img/dao/samin.gif",
  "true-seven": "img/dao/z_qilji.gif",
  "fox-doll": "img/wawa/huxian.gif",
  "thunder-pearl": "img/gusl/7.gif",
  "snow-doll": "img/wawa/doll155.jpg",
  "han-spear": "img/feibiao/fly130.jpg",
  "kunoichi-claw": "img/zhua/koonoyichi.gif",
  "sky-halberd": "img/mao/fangtianhuoji.gif",
  "glacier-sword": "img/dao/hanbingjian.gif",
  "snow-axe": "img/fu/qiawoo.gif",
  "sky-dragon-staff": "img/bang/stick118.jpg",
  "treasure-staff": "img/bang/stick155.jpg",
  "red-corporal": "img/mao/red200.gif",
  "blue-corporal": "img/mao/blue200.gif",
  "blood-axe": "img/fu/xuefu.png",
  "wave-wheel": "img/feibiao/paryn.gif",
  "thunder-sword": "img/dao/leijian.png",
  "oni-bow": "img/gongjian/170.gif",
  "moon-kukri": "img/kukri/4.gif",
  "dragon-kukri": "img/kukri/5.gif",
  "kali-wheel": "img/chakram/5.gif",
  "turtle-bow": "img2/3jiang/lee3.gif",
  "venom-cane": "img/img_new/shadu.gif",
  "yama-cane": "img/jipangyi/6.gif",
  "bat-cane": "img/jipangyi/5.gif",
  "skanda-kukri": "img/kukri/skanda.png",
  "ice-orb": "img/gusl/5.gif",
  "fire-orb": "img/gusl/6.gif",
  "spark-orb": "img/gusl/7.gif",
  "earth-beads": "img_new/nianzhu1.gif",
  "lotus-beads": "img/fozhu/bailian.gif",
  "shiva-trident": "img/mao/xiba.png",
  "dragon-fish": "img_new/muyu1.gif",
  "lotus-fish": "img/muyu/baiyan.gif",
  "goumang": "img_new/002.png",
  "xuanming": "img_new/001.png",
  "red-bow": "img/gongjian/chigong.png",
  "blood-sword": "img/dao/sword170.jpg",
  "cursed-cane": "img/jipangyi/yoksu.gif",
  "golden-orb": "img/qita/luckyball2.jpg",
  "ice-talisman": "img/hufu/ruyi.gif",
  "rushou-cane": "img_new/yoksu.gif",
  "zhurong-axe": "img/fu/chukyong.gif",
  "vritra-spear": "img/mao/britra.gif",
  "snake": "img/she/3.gif",
  "emperor-rod": "img/bang/tianhuang.gif",
  "western-rifle": "img/qiang/xiqiang.gif",
  "seven-blade": "img/dao/qilji.gif",
  "sniper-crossbow": "img/shigong/155.gif",
  "lion-crossbow": "img/shigong/180.gif",
  "airavata": "img/xiong/airavara.gif",
  "hundun": "img/xiong/hundun.gif",
  "qiongqi": "img/xiong/qiongqi.gif",
  "taotie": "img/xiong/taotie.gif",
  "taowu": "img/xiong/taowu.gif",
  "nether-box": "img/ming/jia.gif",
  "nether-bow": "img/ming/gong.gif",
  "nether-sword": "img/ming/jian.gif",
  "nether-halberd": "img/ming/ji.gif"
};

const monsterImages=[
  "img/daguanling/xieshe1.gif", "img/daguanling/xiemang.gif", "img/gaoshoudong/dujiaogui.gif", "img/wuningwang/s_qianghun.gif",
  "img/qinglongtan/shouren.gif", "img/qiannianhu/feng3.gif", "img/shichuishan/s_huolong.gif", "img/kerim/misil.gif",
  "img/kerim/gumang.gif", "img/star/sao.gif", "img/star/yan.gif", "img/star/zhen.gif",
  "img/star/tai.gif", "img/kaimazhuangyuan/hunma.gif", "img/huajiushan/hongque.gif", "img/mimichangsuo/duruga.gif",
  "img/mimichangsuo/mao.gif", "img/qinshihuang/qin2.gif", "img/bnggong/yubang.gif", "img/bnggong/xiangyu.gif",
  "img/xiaoling/c7_15_0.jpg", "img/beihaibingku/baigui.gif", "img/guiyidong/dooyi.gif", "img/zhaoze/dulong.gif",
  "img/pao/pao.gif", "img/pao/pao0.gif", "img/pao/pamyul.gif", "img/shenxian/mirang.gif",
  "img/shenxian/cul.gif", "img/yanmo/7.gif", "img/yanmo/9.gif", "img/heilong/7.gif",
  "img/guimen/yodo.gif", "img/guimen/jiuwei.gif", "img/yuanhen/huo.gif", "img/yuanhen/shui.gif",
  "img/yuanhen/feng.gif", "img/yuanhen/lei.gif", "img/yuetian/rudra.gif", "img/yuetian/gendalba.gif",
  "img/yuetian/yacha.gif", "img/yuetian/bayoo.gif", "img/wenmang/1.gif", "img/wenmang/2.gif",
  "img/wenmang/3.gif", "img/wenmang/4.gif", "img/wenmang/5.gif", "img/wenmang/6.gif",
  "img/wenmang/7.gif", "img/wenmang/8.gif", "img/kuanglu2/wootai.gif", "img/kuanglu2/ballo.gif",
  "img/kuanglu3/1.jpg", "img/kuanglu3/2.jpg", "img/kuanglu4/gulong.gif", "img/kuanglu4/xiao.gif",
  "img/kuanglu5/shui.gif", "img/kuanglu5/feng.gif", "img/kuanglu10/zhanglao.gif", "img/kuanglu10/jinmu.gif",
  "img/kuanglu10/xudu.gif", "img/kuanglu10/daling.gif", "img/kuanglu11/1.gif", "img/kuanglu11/2.gif",
  "img/kuanglu11/3.gif", "img/kuanglu11/4.gif", "img/hundun/xuanyuan.gif", "img/hundun/xuanyuan.gif",
  "img/star/sao.gif", "img/star/yan.gif", "img/star/zhen.gif", "img/star/tai.gif",
  "img/kuanglu6/sheng.gif", "img/kuanglu6/ze.gif", "img/kuanglu7/1.gif", "img/kuanglu7/2.gif",
  "img/kuanglu8/ye.gif", "img/kuanglu8/pil.gif", "img/kuanglu9/fengmo.gif", "img/kuanglu9/shuiling.gif",
  "img/kuanglu12/1.gif", "img/kuanglu12/4.gif", "img/kuanglu12/7.gif", "img/kuanglu12/10.gif",
  "img/kuanglu13/huo.gif", "img/kuanglu13/shui.gif", "img/kuanglu13/lei.gif", "img/kuanglu13/feng.gif",
  "img/kuanglu14/1.gif", "img/kuanglu14/4.gif", "img/kuanglu14/7.gif", "img/kuanglu14/10.gif",
  "img/kuanglu15/4_1.gif", "img/kuanglu15/4_2.gif", "img/ribenhaidi/haixing1.gif", "img/ribenhaidi/huangxing.gif",
  "img/bingcheng/junzhu.gif", "img/bingcheng/pao.gif", "img/bingcheng/qiawo.gif", "img/bingcheng/taru.gif",
  "img/orochi/8.gif", "img/orochi/9.gif", "img/orochi/10.gif", "img/guiqucheng/lei3.gif",
  "img/guiqucheng/tiancao_n.gif", "img/qinglongtan/molong.gif", "img/haizeidong/jack.gif", "img/yueqifeng/k3_05_0.jpg",
  "img/yasurim/yushi.gif", "img/yasurim/menghu.gif", "img/nepal/huangniu1.gif", "img/shiku/kubera1.gif",
  "img/shiku/ravana.gif", "img/taiji/sajahan.gif", "img/taiji/sajahan11.gif", "img/taiyang/ananta1.gif",
  "img/taiyang/asura1.gif", "img/taiyang/hanuman1.gif", "img/taiyang/siba1.gif", "img/taiyang/ganesa1.gif",
  "img/wudou/nvwang.gif", "img/deva/baruna.gif", "img/deva/indra.gif", "img/deva2/tiamet.gif",
  "img/deva2/britra.gif", "img/haian/agasura.gif", "img/haian/hirana.gif", "img/haian/karia.gif",
  "img/wang/7.jpg", "img/wang/11.jpg", "img/wang/shuilong.gif", "img/wang/ducul.gif",
  "img/wang/gajin.gif", "img/soomi/6.gif", "img/soomi/boss1.gif", "img/soomi/10.gif",
  "img/soomi/boss2.gif", "img/soomi/15.gif", "img/soomi/boss3.gif", "img/soomi/19.jpg",
  "img/soomi/boss4.jpg", "img/emeng/mugan.gif", "img/emeng/emeng.gif", "img/emeng2/1.gif",
  "img/emeng2/2.gif", "img/emeng3/xiongmeng.gif", "img/emeng3/emeng.gif", "img/emeng4/gongki.gif",
  "img/emeng4/doal.gif", "img/big/1.gif", "img/big/2.gif", "img/big/3.gif",
  "img/big/4.gif", "img/big/5.gif", "img/big/7.gif", "img/big/8.gif",
  "img/big/9.gif", "img/big/6.gif",
];

const koreanImages={
  'trial-jing-light':'1_1', 'trial-jing-dark':'1_2',
  'trial-shang-light':'2_1', 'trial-shang-dark':'2_2',
  'trial-kai-light':'3_1', 'trial-kai-dark':'3_2',
  m093:'4_1',m094:'4_2',
};

const clientWeapons={
  flameblade:3,windhalberd:6,frostlute:8,'seven-blade':10,'sniper-crossbow':17,'lion-crossbow':18,
  'earth-beads':25,'fox-doll':27,'true-seven':29,airavata:30,cannon:58,'nether-box':66,
  'nether-bow':67,'sam-in':71,'nether-sword':73,'nether-halberd':74,stormbow:94,
};
const clientRelics={
  'sky-dragon-staff':3,'treasure-staff':4,'blood-sword':23,'han-spear':41,
  'kunoichi-claw':59,'sky-halberd':60,'oni-bow':61,'glacier-sword':62,'snow-axe':63,
  'red-corporal':64,'blue-corporal':65,'wave-wheel':66,'blood-axe':67,'thunder-sword':68,
  'red-bow':69,'zhurong-axe':82,'ice-talisman':89,snake:92,'emperor-rod':95,'western-rifle':98,
};
const clientUnique={'snow-doll':8};
const clientBosses={
  'trial-jing-light':'gyeongmun_f_l','trial-jing-dark':'gyeongmun_f_d',
  'trial-shang-light':'sangmun_w_l','trial-shang-dark':'sangmun_w_d',
  'trial-kai-light':'gaemun_a_l','trial-kai-dark':'gaemun_a_d',
  m081:'nachal_f',m085:'nabata_f',m086:'nabata_w',m087:'nabata_t',m088:'nabata_a',
  m090:'sangmun_w',m091:'gaemun_a',m092:'samun_t',m093:'samun_t_l',m094:'samun_t_d',
  m001:'mon_snake',m002:'bsnake',m004:'horsespear',m005:'whitebear',m008:'misil_g',
  m014:'honma',m015:'redjujak',m016:'statuea',m017:'statueb',m019:'youbang_g',
  m021:'sanyeo_transform',m022:'whitehyunmu',m024:'poisondragon',m025:'pao',m026:'pao2',m027:'destroyer',
  m101:'honganji_g',m106:'madragon',m107:'captin_jack',m109:'yoksu',m114:'shahjahan_mu',m115:'yamayami',
  m117:'asura_pawn',m119:'shiva_pawn',m121:'despiderqueen',m122:'varuna',
  m124:'tiamat',m125:'britra',m133:'gajin',m148:'ancient_goongi',m149:'ancient_dowol',
  m150:'emperorturtle',m151:'kinghornet',m154:'bullmonster',m155:'eggghost',
};

export function clientSpriteGuide(weapon,entry){
  if(weapon?.id==='vritra-spear')return {filename:'britra.AGF',note:'弗栗多手持三叉槍'};
  const unique=clientUnique[weapon?.id];
  if(unique)return {filename:'lunique01.AGF',frame:unique};
  const relic=clientRelics[weapon?.id];
  if(relic)return {filename:'rweapon01_i.AGF',frame:relic};
  const frame=clientWeapons[weapon?.id];
  if(frame)return {filename:'weapon01_i.AGF',frame};
  const prefix=clientBosses[entry?.id];
  if(!prefix)return null;
  if(prefix.startsWith('nabata_')||prefix.startsWith('ancient_')||['m081','m090'].includes(entry.id))return {
    filename:prefix+'_n.AGF',prefix,note:'_n 待機 · _a／_a2 攻擊 · _d 倒地',
  };
  if(['m091','m092','m133','m150','m151','m154'].includes(entry.id))return {
    filename:prefix+'_n.AGF',prefix,note:'_n 待機 · _a1 攻擊 · _d 倒地',
  };
  if(entry.source==='kuanglu15'||entry.id==='m155')return {filename:prefix+'_n.AGF',prefix,note:'_n 待機 · _m 移動 · _a／_a2 攻擊 · _d 倒地'};
  return {filename:prefix+'.AGF',note:'檔案含多個動作與方向'};
}

export function jushangImage(weapon,entry){
  const korean=koreanImages[entry?.id];
  if(korean)return {
    url:'https://www.gersangjjang.com/monster/img/kuanglu15/'+korean+'.gif',
    caption:'韓版攻略 · 遊戲圖像',
  };
  const match=/^m(\d{3})$/.exec(entry?.id??'');
  const path=weapon?weaponImages[weapon.id]:match&&monsterImages[Number(match[1])-1];
  if(!path)return null;
  return {url:new URL((weapon?'item/':'monster/')+path,site).href,
    caption:weapon?'52 巨商 · 物品小圖':'52 巨商 · 遊戲圖像'};
}
