<template>
  <div class="flex h-screen antialiased text-gray-800">
    <div class="flex flex-row h-full w-full overflow-x-hidden">
      <!--  -->
      <div class="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
        <!-- Logo -->
        <chat-logo></chat-logo>
        <!-- 个人名片 -->
        <name-card :nickname="nickname" :motto="motto"></name-card>
        <!-- 聊天列表区域 -->
        <div class="flex-auto flex flex-col mt-8">
          <!-- 消息列表标题 -->
          <div class="flex flex-row items-center justify-between text-xs">
            <span class="font-bold">消息列表</span>
            <span
              class="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full"
              >{{ totalUnreadMsgCount }}</span
            >
          </div>
          <!-- 消息列表区域 -->
          <div class="flex-auto flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
            <!-- 消息列表 -->
            <message-group-item :class="{'bg-gray-100': group.groupId === activeGroupId}" v-for="group in msgGroups" :key="group.groupId" :groupId="group.groupId" :groupName="group.groupName" :unreadCount="group.groupUnreadCount" @change="switchGroup"></message-group-item>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="flex flex-col flex-auto h-full p-6">
        <div
          class="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
        >
          <!-- 聊天消息预览区域 -->
          <div id="msgBox" class="flex flex-col h-full overflow-x-auto mb-4">
            <div class="flex flex-col h-full">
              <div id="msgList" class="grid grid-cols-12 gap-y-2">
                <message-item v-for="msg in activeGroup.msgList" :key="msg.time" :send="msg.send" :nickname="msg.nickname" :msgContent="msg.msgContent"></message-item>
              </div>
            </div>
          </div>
          <!-- 消息输入区域 -->
          <div
            v-if="activeGroupId"
            class="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4"
          >
            <!-- <div>
              <button
                class="flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  ></path>
                </svg>
              </button>
            </div> -->
            <!--  ml-4 -->
            <div class="flex-grow">
              <div class="relative w-full">
                <!-- 输入框 -->
                <input
                  v-model="msgInput"
                  type="text"
                  @keydown.enter="sendMsg"
                  class="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                />
                <!-- 表情 -->
                <!-- <button
                  class="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button> -->
              </div>
            </div>
            <div class="ml-4">
              <button
                @click="sendMsg"
                class="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
              >
                <span>发送</span>
                <span class="ml-2">
                  <svg
                    class="w-4 h-4 transform rotate-45 -mt-px"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import ArRTM from "ar-rtm-sdk"

import { reactive, defineComponent, computed, onMounted, onUpdated, onUnmounted, nextTick } from 'vue'
import ChatLogo from '../components/ChatLogo.vue'
import NameCard from '../components/NameCard.vue'
import MessageGroupItem from '../components/MessageGroupItem.vue'
import MessageItem from '../components/MessageItem.vue'

import { nicknameLib } from '../utils/constants'
import { scrollToBottom } from '../utils/ui'
import { randomStringNumber } from '../utils/calculator'

// const nicknameLib = "纳喇念念,高彭勃,拜蕴和,太叔和蔼,完盼盼,傅木,释曼青,仲彤,郸慕晴,曹雅致,光俊茂,佟幻儿,南门依云,检依波,曾光熙,前和歌,竭初柔,贰盼旋,箕兴平,粘书萱,东飞扬,老采莲,杞锐立,秦夜梦,邝晓瑶,么秀娟,计兴德,汪冬莲,戏红叶,应敏博,桐静枫,胥良策,郜炫,系晗蕾,孝以,仇曲,弓泽,何霓,连曾,声和美,礼语,郁瑞,空安白,尚涵,叔哲妍,麻孤阳,鱼微熹,端木安双,沙辰骏,施傲柏,禚嘉淑,皮飞燕,真宾白,少欣嘉,赫访天,岳夏岚,洪心香,字凝蝶,步高杰,盈斌蔚,占天曼,湛音韵,尉鸿羽,芮梦桐,纪芫华,仝丽,保小春,矫雪珍,逢之玉,畅典丽,宦正业,银盼夏,徐彭祖,宰父白,倪雁蓉,南秀媚,闾经国,始舒,锁柳,公冶炳,刀恺乐,栋秀媛,泷清绮,却彭丹,慕容幼,淦晤,顾盼兰,捷雅隽,章佳春柔,厚雁菱,慕昊伟,费莫风,衡骊婧,盖英发,浑芬芬,郯心语,卯醉易,禾梦桃,祈合瑞,党新之,夹谷书文,弘千,壬芮欢,潭馥,丘凌青,寒鸿光,种巧凡,念元勋,宾清漪,渠俏丽,壤驷慕山,尉迟越泽,刑宏放,栾紫蕙,昂秀隽,励觅晴,析晨旭,解建安,张简禾,查恨蕊,遇楠,笪阳舒,锐悠奕,靳嫣,旗宜人,鲍未央,智嘉茂,蒲宛,缑坚,勾斯年,伏孤阳,骆秋荷,柔恩,六丹翠,蹉仙仪,穰寄,乙淳静,萧冰真,斛飞掣,潜炎彬,盛文星,亓官心诺,沈从云,机安邦,栗幻竹,苟澹,介彭彭,呼兰梦,漆雕和通,鲁含桃,许书雁,隆语晨,霍冠玉,骑飞松,勤希彤,瑞问萍,章莎莉,兰雪儿,游茗雪,泥高义,武涵衍,仍子欣,脱鸿煊,裔志,幸雁风,辛水风,剑谷蕊,邹峻,钭文瑶,黄果,廉嘉实,苗格,扬春柏,辜元容,嘉骞泽,诸葛明辉,繁从蓉,忻凡白,琦采枫,代晨轩,彤雅蕊,项业,典冰双,仵绮南,荀洛妃,麴采南,郗怀桃,熊城,祢奇正,红安筠,夔雅丽,皇甫以彤,胡玄素,年忆雪,后凌文,阙震,尹雯,万俟寻雪,苏小瑜,相思彤,覃广君,朱琅,亥白凡,鲜于长娟,化沛凝,佛密如,军易蓉,磨畅,汲米琪,波森莉,税莺,经如柏,季咏志,撒子真,修阳朔,西门俏美,暨乐邦,张廖寒凝,威双,充滨海,摩晏静,辟欣合,牵荷珠,那拉令锋,谭思柔,衅俊名,冒绍钧,卞自怡,偶馨,段干元灵,庾雪卉,随松雪,乔勇毅,出鸿云,陈燕子,翟书萱,库浩邈,濮璇子,线书慧,淳于运恒,喜修筠,牢北,邵鸿福,康达,凤清淑,丙华荣,浮子琳,薛小宸,宿梦寒,束燕岚,禽竹萱,耿凌柏,墨丝微,暴飞烟,饶温茂,汉忆曼,夕昕,五幼白,家纶,谬一嘉,子车映雪,廖长文,贵冰之,兆冰真,秘旻,黎梅青,茅沛文,祝星海,滑映寒,勇岚风,绍颉,申屠嘉音,巴蕴美,范沛容,丁冷松,謇恨荷,初南露,赛碧白,考曼彤,余巧云,肥戈,轩辕睿好,留丹彤,赤香波,虞灵溪,府寄柔,招郎,乌雅宸,僧新雪,佼凌晴,德萍雅,绪绮露,劳香梅,顿丰,拓跋沛春,宝若华,泉嘉石,进桐华,宫月朗,森英卫,诗晓霜,塔可嘉,杜星华,闽熙星,似迎海,姬宵晨,濮阳颐真,谢文敏,首丽姝,富雪松,愈笑天,贸凌青,腾俊良,孔曼寒,郎暄莹,海竹雨,盍志国,允新苗,务瑶岑,蓬文昂,双之双,愚梓暄,申春雪,嵇曼珍,於宜楠,安梦旋,督朝雨,柳盼波,狂思卉,冠饮香,晏孤云,席溪蓝,方炎,俟梅梅,所凝冬,资天恩,乾方雅,次正德,檀诗翠,羿杰,改映真,门清懿,麦康震,臧妙晴,魏芦雪,紫晗,侨旻,范姜中震,叶从蓉,和婉仪,乘俊彦,将和玉,昝鸿晖,薄半双,杭贞,飞幼枫,庞芳,费美华,铁曼容,集子珍,委泽语,操代梅,满德海,瓮月桂,东门香薇,彭康适,芒承天,革半蕾,包莎,庆云韶,信复,毕成天,司寇笑晴,称绿,御惜天,窦冷之,宛冰冰,翠巧曼,野莱,旷阳曜,载水凡,国亦凝,堵雪兰,素曼凝,玄慧艳,蒋云,蛮雪艳,澹台寻芹,赫连兴昌,禄语山,濯司,龚书君,韶巧云,僪希,李香菱,段未,学雪萍,旅琪华,云忆枫,东方芳懿,漆吉星,凭昕珏,示夜香,程晴曦,咸沛柔,零海宁,吴思宸,坚清绮,师虹英,贲采,公西孟君,楼向雁,后秀艾,善兴国,越谷兰,酆翰音,枚风华,纵暖姝,犹向真,穆倩语,吉一,怀恨瑶,权安青,厍雅云,洛莞,华雅柔,犁璇珠,位海之,依曼梅,吕巧绿,钮代珊,欧夏烟,融鸿禧,世俊郎,烟晶燕,山海,储好,谷梁展,己晓灵,母尔阳,以秋白,接向雪,钱悦欣,赖美,台琳芳,风访儿,福允晨,在诗蕊,尾婉丽,南宫骞尧,雷蔚,哈香巧,井绍,凌震博,亢人,敖冷亦,卫蕙芸,买雪晴,梁丘佩杉,豆睿哲,郑弘扬,舒暄婷,戢志强,仪润丽,羊芳懿,苍高寒,练德明,丰溪澈,桑涵容,居乐悦,綦斯,奕鸿轩,板采萱,邴曜灿,受孤兰,马佳平和,詹言文,泣英楠,卢安彤,徭语蝶,褒荣轩,亓景山,求平露,睦奇颖,花运,侯雅琴,牧鹏海,逯翠梅,镜芷珊,帖谷,锺芮丽,伯友易,象昆谊,陆建华,弥承载,仰俊雅,罕莺语,问绮烟,郦一瑾,逄逸馨,匡天蓝,赧兰蕙,虢新月,卿代双,索德业,溥雪巧,令狐梦菲,鹿雨筠,是夏瑶,钞冷萱,业罗,刘雅柔,寇思娜,霜兰泽,泰文景,夏升,生蔚然,慎芳林,蒯子怡,微生南霜,斋芳春,运赫,长孙恩霈,蹇沈雅,能山梅,抗鸿振,驹如云,侍迎波,全斌斌,环冠宇,翁新之,表钰,闪霞姝,合旎,扶嗣,笃悦远,户雅逸,蒙静娴,赏欣荣,终恨竹,针承嗣,俎俊驰,屠宛秋,鄢绮梦,萨韦,印霜,松梦容,隽寄南,仁思菱,鲜建业,蒉白秋,敏妍丽,洋慧月,燕熙华,潮姗姗,谏尔竹,聂琇莹,圭冰安,北忆安,那代柔,千泓,温逸仙,莫诗兰,卑慧秀,曲烟,多幼仪,单季,贺朝旭,但盼香,孛同光,谌婉然,守韵,官嘉誉,班桂芝,柴傲之,袭琼华,郝悠婉,崇景彰,源听云,龙宏伟,力晗晗,禹文栋,翦彩妍,焦以柳,巫鹏海,休佑运,阳寻巧,佟佳陶然,聊阳阳,况晶霞,稽溥心,茆又,甲欣德,戈闳,通一南,函若骞,拱陶宜,路茉莉,梅雅静,道高丽,铎天晴,宏怜晴,殳文滨,金初阳,商长霞,毓立果,于骞,晁翠岚,唐兴安,缪水,褚才,楚晴岚,东郭凯旋,清靖易,阚勃,都夏,沃翱,弭半芹,昌夏之,庄弘济,祖澎湃,塞丽思,袁思萱,蔡胜,鄞忆秋,严秀媛,义梓柔,巧尔容,宇文天干,蒿乐双,利英博,童清佳,尤书艺,符乐儿,盘明洁,其半青,羽今雨,靖材,令修美,菅沛儿,碧鲁立诚,寿琼诗,迟书意,帅春竹,阿韵流,从阳成,益怡然,敛源源,尧飞驰,宓诗兰,荣天蓉,爱凝绿,员范,展念巧,公羊弘雅,速和光,敬晴霞,剧听然,及冰凡,朋绿蝶,柯吟怀,行永元,营修平,汝紫萱,卜问凝,干修为,帛冰之,危丝娜,闾丘运骏,长令燕,城寄松,恭雅歌,贡元甲,伊鸿志,战湛娟,宣君昊,佘尔槐,乌孙音,刁荏,简令美,屈昭懿,法懋,戎含之,庚心怡,戊竹,钦经赋,回浩思,隋温书,告从冬,市红旭,巫马平萱,候曦晨,惠雅宁,贾宏逸,邛湃,树瀚钰,实靖柏,冉然,颜言心,艾高远,贝杉月,貊尔竹,衣思萱,同流婉,诺从霜,来晔,独夜梅,登宏义,孟阳伯,时鸿博,定紫杉,司庸,成秋,冷睿才,仉依秋,承秋春,由艾,别山晴,甫青香,宗政尔烟,冼丽容,桓兰若,郭韵诗,欧阳代芙,公良锐智,崔和雅,杨雅霜,巢彰,蔚温纶,蚁玲琅,仆水蓉,伟豫,钟代天,肖亦绿,喻冬卉,浦密思,类清婉,雀寄南,睢悦喜,九桂华,谯长平,秋代蓝,良晨璐,奈语诗,裴凯歌,寸锐泽,宁夏柳,巨筠,裘弘盛,慈小枫,律易文,汗觅云,齐文康,哀云霞,虎哲,圣蕴,闫海桃,乜元英,强茜,林盼柳,司马雅洁,图门萝,上官浩,漫秀美,历琲,富察子童,岑醉巧,竹向晨,粟宛筠,陀伟志,甘同济,度旭鹏,让恬雅,闭浩涆,止思雁,太史曼语,柏怀梦,邗沉,之曼文,支宏才,阎靖之,果巧蕊,娄驰,伍宏,宇其雨,闳诗珊,宰溪,错绮山,兴葳,仲孙俊喆,藩水风,元乐音,丛萦心,朴晏如,平芷荷,斐宛凝,酒锐逸,宗立,容水冬,潘毅君,邓向明,甄宜春,过诗文,巩平春,乌丹彤,谈傲玉,姚西华,用雪曼,苦邈,莱娇然,雍虹,万从筠,姒静和,池乐荷,昔盼秋,毛平婉,恽成化,公兰泽,茂雅可,希觅,农秀颖,古衍,常定,衷旻骞,端希慕,百里安萱,习贞怡,势雁凡,局信,妫忆文,邰慕凝,扈端懿,说忆然,晋英秀,汤书兰,斯绚,孙寒烟,开梓舒,冀婉秀,掌云蔚,丹柔惠,辉凡儿,赵海逸,房白云,逮千易,韩影,宋冬莲,夫冰心,司徒从阳,戴俊才,无盼晴,望悦人,第五玄清,鞠晨欣,庹慕梅,卷昱,邸英范,言樱花,碧秀竹,玉艳,闵坤,续念霜,堂纵,仙安琪,京白薇,左丘奇致,青海雪,焉白玉,性玑,布梦菲,揭慕卉,抄暮芸,陶恨蕊,颛孙辉,丑语林,硕乐章,诸清嘉,姓涵涵,植丹亦,嬴清逸,王彭薄,谷敬,夙成荫,司空春冬,田又琴,明尔真,琴湛,蔺蔓菁,封傲雪".split(",");

// 907691a08360f87d7dbe1eb2cc24ae1e
// 177e21c0d1641291c34e46e1198bd49a
const rtmClient = ArRTM.createInstance("177e21c0d1641291c34e46e1198bd49a", {
  logFilter: ArRTM.LOG_FILTER_OFF,
  confPriCloudAddr: {
    ServerAdd: "pro.rtmgw.agrtc.cn",
    Port: 443,
    Wss: true,
  }
});

const _ScrollToMsgViewBottom = () => {
  const msgBox  = document.getElementById("msgBox") as HTMLElement;
  const msgList = document.getElementById("msgList") as HTMLElement;

  nextTick(() => {
    scrollToBottom(msgBox, msgList);
  });
};

const ChatRoomState: any = reactive({
  // 用户ID
  uid: "",
  nickname: nicknameLib[Math.ceil(Math.random() * nicknameLib.length)],
  motto: "knowledeg is power",

  msgInput: "",

  totalUnreadMsgCount: computed(() => {
    return ChatRoomState.msgGroups.reduce((accumulator: any, currentValue: any) => {
      return accumulator + currentValue.groupUnreadCount;
    }, 0);
  }),

  // 当前打开的群组
  activeGroupId: "",
  activeGroup: computed(() => {
    if (ChatRoomState.activeGroupId) {
      const currentGroup = ChatRoomState.msgGroups.find((group: any) => group.groupId === ChatRoomState.activeGroupId);
      return currentGroup || {};
    }
    return {};
  }),
  // 内置的聊天组
  msgGroups: [
    {
      groupId: "1234567890",
      groupName: "前端最佳实践",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "234567",
      groupName: "Philip Tucker",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "345678",
      groupName: "React 进阶",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "456789",
      groupName: "Christine Reid",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "567890",
      groupName: "Marta Curtis",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "678912",
      groupName: "WebRTC 学习路线",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
  ],

  switchGroup(groupId: string) {
    ChatRoomState.activeGroupId = groupId;
    ChatRoomState.activeGroup.groupUnreadCount = 0;
    nextTick(() => {
      _ScrollToMsgViewBottom();
    })
  },

  async sendMsg() {
    if (ChatRoomState.activeGroup && ChatRoomState.msgInput !== "") {
      const rtmChannel = ChatRoomState.activeGroup.rtmChannel;
      await rtmChannel.sendMessage(
        {
          text: JSON.stringify({
            text: ChatRoomState.msgInput,
            nickname: ChatRoomState.nickname
          })
        },
        {
          //是否保存为历史消息
          enableHistoricalMessaging: true,
        }
      );
      ChatRoomState.activeGroup.msgList.push({
        send: true,
        nickname: ChatRoomState.nickname,
        msgContent: ChatRoomState.msgInput,
        time: Date.now()
      });
      ChatRoomState.msgInput = "";
      _ScrollToMsgViewBottom();
    } else {
      // 请先加入一个聊天组
    }
  }
});

export default defineComponent({
  name: 'ChatRoom',

  components: {
    ChatLogo,
    NameCard,
    MessageGroupItem,
    MessageItem,
  },

  async setup() {
    
    const randomUserId = randomStringNumber();

    const uid = await rtmClient.login({
      uid: randomUserId
    });

    ChatRoomState.uid = uid;

    // 循环加入频道
    ChatRoomState.msgGroups.map(async (group: any) => {
      const rtmChannel = rtmClient.createChannel(group.groupId);
      group.rtmChannel = rtmChannel;

      await rtmChannel.join();
      group.joined = !0;

      //监听频道消息
      rtmChannel.on("ChannelMessage", (message: any, peerId: string, messagePros: any) => {
        if (message.text) {
          const msgObj = JSON.parse(message.text);
          group.msgList.push({
            send: false,
            nickname: msgObj.nickname,
            msgContent:  msgObj.text,
            time: messagePros.serverReceivedTs
          });
          _ScrollToMsgViewBottom();
        }
        if (ChatRoomState.activeGroupId !== rtmChannel.channelId) {
          group.groupUnreadCount++;
        }
      });

      // //频道成员人数更新回调。
      // rtmChannel.on("MemberCountUpdated", (memberCount) => {
      //   console.log("info", `MemberCountUpdated : ${memberCount}`);
      // });

      // //频道成员人数更新回调。
      // rtmChannel.on("MemberJoined", (memberId) => {
      //   console.log("info", `MemberJoined : ${memberId}`);
      // });

      // //收到用户离开频道的通知。
      // rtmChannel.on("MemberLeft", (memberId) => {
      //   console.log("info", `MemberLeft : ${memberId}`);
      // });
    });

    return ChatRoomState;
  },
})
</script>

<style>

</style>