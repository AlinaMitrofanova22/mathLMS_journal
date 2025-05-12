<script setup>
import Draweritemlist from "./draweritemlist.vue";
</script>

<template>
  <div class="bg-white w-auto h-full fixed left-0 top-0 p-6 rounded-r-xl z-2">
    <div class="flex justify-self items-center gap-5">
      <img src="/emb_csu.png" alt="CSU" />
      <p class="text-3xl text-red-500 font-bold">ЧелГУ</p>
    </div>
    <Draweritemlist />
  </div>
</template>
