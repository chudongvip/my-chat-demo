<template>
  <suspense>
    <router-view></router-view>
  </suspense>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  name: 'App',
  components: {
    // HelloWorld
  }
})
</script>

<style>
html, body, #app {
  @apply w-full h-full overflow-hidden;
}
</style>