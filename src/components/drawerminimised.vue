<script setup>
import Drawer_minimised_item_list from "./drawer_minimised_item_list.vue";
</script>

<template>
  <div class="fixed top-0 left-0 h-full w-auto"></div>
  <div class="bg-white w-auto h-full fixed left-0 top-0 rounded-r-xl z-2">
    <div class="flex justify-self items-center pt-5">
      <img src="/emb_csu.png" alt="CSU" />
    </div>
    <Drawer_minimised_item_list />
  </div>
</template>
