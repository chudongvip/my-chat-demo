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
            <span class="font-bold">群组消息列表</span>
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
// 参考： https://docs.anyrtc.io/cn/RealTimeMessage/api-ref/rtm_web/overview
import ArRTM from "ar-rtm-sdk"

import { reactive, defineComponent, computed, onMounted, onUpdated, onUnmounted, nextTick } from 'vue'
import Config from '../config'

import ChatLogo from '../components/ChatLogo.vue'
import NameCard from '../components/NameCard.vue'
import MessageGroupItem from '../components/MessageGroupItem.vue'
import MessageItem from '../components/MessageItem.vue'

import { nicknameLib } from '../utils/constants'
import { scrollToBottom } from '../utils/ui'
import { randomStringNumber } from '../utils/calculator'

const rtmClient = ArRTM.createInstance(Config.RTM_APP_ID, {
  logFilter: ArRTM.LOG_FILTER_OFF
});

/**
 * 消息滚动到底部
 */
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
  // 定义一些内置的聊天群组
  msgGroups: [
    {
      groupId: "123",
      groupName: "前端最佳实践",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "456",
      groupName: "Philip Tucker",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "789",
      groupName: "React 进阶",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "123456",
      groupName: "Christine Reid",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "456789",
      groupName: "公司内部交流群组",
      groupUnreadCount: 0,
      joined: false,
      rtmChannel: null,
      msgList: []
    },
    {
      groupId: "888888",
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