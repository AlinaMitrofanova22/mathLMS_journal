<template>
  <header class="flex justify-between w-2/3 m-auto mt-10">
    <p class="flex items-center pt-15 text-gray-500 hover:text-black">
      Предмет / Преподаватель / Практика
    </p>
    <div class="flex items-center gap-10 pb-10">
      <select class="border rounded-xl p-2 bg-white">
        <option>О пользователе</option>
        <option>Личные файлы / Оценки</option>
        <option>Сообщения</option>
        <option>Настройки</option>
        <option>Выход</option>
      </select>
      <img
        class="w-15 rounded-full border border-grey-300"
        src="/blankprofpic.png"
        alt="userphoto"
      />
    </div>
  </header>
</template>

<script setup></script>

<style scoped></style>
