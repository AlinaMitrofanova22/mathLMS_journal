<script setup>
import { ref } from "vue";

const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <div
    class="flex flex-col border border-gray-100 rounded-[2vw] m-auto w-2/3 mt-20 mb-10 bg-white shadow-xl hover:-translate-y-2 hover:-translate-x-2 hover:shadow-xl transition relative"
  >
    <div class="flex flex-col w-full">
      <div class="flex items-center cursor-pointer" @click="toggleCollapse">
        <img src="/Icon2.png" alt="toggle" class="ml-8 mt-6 mb-3" />
        <p class="ml-2 mt-6 mb-3 text-3xl font-bold">Тема 1</p>
      </div>
      <div v-if="!isCollapsed" class="flex flex-col gap-4">
        <div
          class="flex flex-col rounded-[1.5vw] mx-5 shadow-xl hover:-translate-y-1 hover:-translate-x-1 transition"
        >
          <div class="flex items-center">
            <img src="/Icon.png" alt="icon" class="my-0.1 ml-11 mr-5 mb-6" />
            <p class="my-0.1 mr-11 mb-6 text-2xl">
              Таблица разложений некоторых функций в степенные ряды
            </p>
          </div>
          <div>
            <p class="my-4 ml-11 mr-11 text-2xl">Домашнее задание №1</p>
            <p class="my-0.1 ml-11 mr-11 text-2xl">
              Открыто:
              <span class="italic">понедельник, 1 сентября 2025, 00:00</span>
            </p>
            <p class="my-0.1 ml-11 mr-11 mb-6 text-2xl">
              Закроется в:
              <span class="italic">суббота, 7 сентября 2025, 00:00</span>
            </p>
          </div>
        </div>
        <div
          class="flex flex-col rounded-[1.5vw] mx-5 shadow-xl hover:-translate-y-1 hover:-translate-x-1 transition"
        >
          <div class="flex items-center">
            <img src="/Icon.png" alt="icon" class="my-0.1 ml-11 mr-5 mb-6" />
            <p class="my-0.1 mr-11 mb-6 text-2xl">
              Таблица разложений некоторых функций в степенные ряды
            </p>
          </div>
          <p class="my-4 ml-11 mr-11 text-2xl">Домашнее задание №1</p>
          <p class="my-0.1 ml-11 mr-11 text-2xl">
            Открыто:
            <span class="italic">понедельник, 1 сентября 2025, 00:00</span>
          </p>
          <p class="my-0.1 ml-11 mr-11 mb-6 text-2xl">
            Закроется в:
            <span class="italic">суббота, 7 сентября 2025, 00:00</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
