<template>
  <div :class="[{ send: send }, 'message-item']">
    <div class="message-box">
      <div class="message-hd">{{ nickname.substr(0, 1) }}</div>
      <div class="message-bd">
        <div>{{ msgContent }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "MessageItem",
  props: {
    send: {
      type: Boolean,
      default: false,
    },
    nickname: {
      type: String,
      required: true,
    },
    msgContent: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped lang='scss'>
.message-item {
  @apply col-start-1 col-end-8 p-3 rounded-lg;

  .message-box {
    @apply flex flex-row items-center;
  }

  .message-hd {
    @apply flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0;
  }

  .message-bd {
    @apply relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl;
  }

  &.send {
    @apply col-start-6 col-end-13;

    .message-box {
      @apply justify-start flex-row-reverse;
    }

    .message-bd {
      @apply ml-0 mr-3 bg-indigo-100;
    }
  }
}
</style>
