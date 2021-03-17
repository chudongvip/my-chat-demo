<template>
  <div
    class="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg"
  >
    <div class="h-20 w-20 rounded-full border overflow-hidden">
      <img
        src="http://api.btstu.cn/sjtx/api.php?lx=c1&format=images"
        alt="Avatar"
        class="h-full w-full"
      />
    </div>
    <div class="text-sm font-semibold mt-2">{{ nickname }}</div>
    <div class="text-xs text-gray-500">{{ motto }}</div>
    <!-- <div class="flex flex-row items-center mt-3">
      <div
        class="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full"
      >
        <div class="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
      </div>
      <div class="leading-none ml-1 text-xs">Active</div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NameCard",
  props: {
    nickname: {
      type: String,
      required: true,
    },
    motto: {
      type: String,
    },
  },
});
</script>