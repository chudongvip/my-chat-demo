<template>
  <button
    class="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
    @click="$emit('change', groupId)"
  >
    <div
      class="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full"
    >
      {{ groupName.substr(0, 1) }}
    </div>
    <div class="ml-2 text-sm font-semibold">{{ groupName }}</div>
    <div
      v-if="unreadCount > 0"
      class="flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none"
    >
      {{ unreadCount }}
    </div>
  </button>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "MessageGroupItem",
  props: {
    unreadCount: {
      type: Number,
    },
    groupId: {
      type: String,
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped lang='scss'>

</style>
