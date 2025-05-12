<script setup>
import { ref, watch, inject } from "vue";

const isCollapsed = ref(false);
const isEditing = ref(false);
const errorMessage = ref("");
const uploadedFiles = ref([]);
const isEditingGlobal = inject("isEditingGlobal");

const props = defineProps({
  topic: {
    type: String,
    default: "ЭКЗАМЕН. ЗАЧЕТ",
  },
  description: {
    type: String,
    default: "Балльно-рейтинговая система",
  },
  container: Object,
  startEditing: Function,
  confirmDeleteContainer: Function,
});

const topicTitle = ref(props.topic);
const descriptionText = ref(props.description);

watch(props, () => {
  topicTitle.value = props.topic;
  descriptionText.value = props.description;
});

const toggleCollapse = () => {
  if (!isEditing.value) {
    isCollapsed.value = !isCollapsed.value;
  }
};

const startEditing = () => {
  isEditing.value = true;
  errorMessage.value = "";
};

const saveChanges = () => {
  if (!topicTitle.value.trim() || !descriptionText.value.trim()) {
    errorMessage.value = "Все поля должны быть заполнены!";
    return;
  }
  isEditing.value = false;
  errorMessage.value = "";
};

const cancelEditing = () => {
  topicTitle.value = props.topic;
  descriptionText.value = props.description;
  isEditing.value = false;
  errorMessage.value = "";
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    uploadedFiles.value.push({
      file,
      url: URL.createObjectURL(file),
    });
  });
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
};
</script>

<template>
  <div
    class="p-2 flex flex-col border border-gray-100 rounded-[2vw] m-auto w-2/3 mt-20 bg-white shadow-xl hover:-translate-y-1 hover:-translate-x-1 hover:shadow-xl transition"
  >
    <div class="relative flex flex-col w-full">
      <div class="space-x-2">
        <img
          src="/editing.png"
          v-if="!isEditing && isEditingGlobal"
          @click="startEditing"
          alt="edit_topic"
          class="absolute top-1 right-1 cursor-pointer w-5 h-5 opacity-60 hover:opacity-100 transition"
          title="Редактировать"
        />
        <img
          src="/hide.png"
          v-if="!isEditing && isEditingGlobal"
          @click="toggleCollapse"
          alt="hide_topic"
          class="absolute top-1 right-12 cursor-pointer w-5 h-5 opacity-60 hover:opacity-100 transition"
          title="Скрыть"
        />
      </div>

      <div class="flex items-center cursor-pointer" @click="toggleCollapse">
        <img src="/Icon2.png" alt="toggle" class="ml-8 mt-6 mb-3" />
        <template v-if="isEditing">
          <input
            v-model="topicTitle"
            placeholder="Введите название темы"
            class="ml-2 mt-6 mb-3 text-xl border border-gray-300 rounded-lg px-2 py-1 w-full"
            @click.stop
          />
        </template>
        <template v-else>
          <p class="ml-2 mt-6 mb-3 text-3xl font-bold">{{ topicTitle }}</p>
        </template>
      </div>

      <div v-if="!isCollapsed" class="flex flex-col">
        <template v-if="isEditing">
          <textarea
            v-model="descriptionText"
            placeholder="Введите описание"
            class="px-2 py-1 w-full border border-gray-300 rounded-lg h-20"
          ></textarea>

          <div v-if="uploadedFiles.length" class="mt-4 gap-2 w-full">
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="flex items-center mb-4 gap-2"
            >
              <a :href="file.url" :download="file.file.name" class="flex">
                <img
                  v-if="file.file.type.startsWith('image/')"
                  :src="file.url"
                  class="rounded-[1.5vw]"
                  alt="Превью"
                />
                <div v-else class="flex items-center">
                  <img src="/Icon.png" class="mr-2" alt="Файл" />
                  <span class="underline">{{ file.file.name }}</span>
                </div>
              </a>
              <img
                src="/close.png"
                alt="Удалить файл"
                @click="removeFile(index)"
                class="ml-2 w-10 h-8 opacity-50 hover:opacity-100 transition cursor-pointer"
              />
            </div>
          </div>
          <div class="mt-4">
            <label
              class="px-4 py-2 text-grey rounded-lg shadow-md opacity-70 hover:opacity-100 hover:border-gray-500 border-transparent border transition cursor-pointer"
            >
              Прикрепить файлы
              <input
                type="file"
                multiple
                class="hidden"
                @change="handleFileUpload"
              />
            </label>
          </div>
        </template>

        <template v-else>
          <p class="my-0.1 ml-13 mr-11 mb-6 text-2xl">
            {{ descriptionText }}
          </p>

          <div
            v-if="uploadedFiles.length"
            class="mt-4 ml-13 mr-11 flex flex-col gap-2"
          >
            <div v-for="(file, index) in uploadedFiles" :key="index">
              <a :href="file.url" :download="file.file.name">
                <img
                  v-if="file.file.type.startsWith('image/')"
                  :src="file.url"
                  class="cursor-pointer rounded-[1.5vw] mb-10 w-full"
                  alt="Превью"
                />
                <div
                  v-else
                  class="flex items-center mt-5 mb-10 underline cursor-pointer text-2xl rounded-[1.5vw] shadow-xl hover:-translate-y-1 hover:-translate-x-1"
                >
                  <img
                    src="/Icon.png"
                    alt="Файл"
                    class="my-0.1 py-5 px-5 ml-8"
                  />
                  {{ file.file.name }}
                </div>
              </a>
            </div>
          </div>
        </template>
      </div>

      <p v-if="errorMessage" class="text-red-500 ml-13 mt-2">
        {{ errorMessage }}
      </p>

      <!-- Кнопки сохранения и отмены -->
      <div class="flex justify-end mb-2 mt-4">
        <button
          v-if="isEditing"
          @click="saveChanges"
          class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition cursor-pointer"
        >
          Сохранить
        </button>
        <button
          v-if="isEditing"
          @click="cancelEditing"
          class="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition cursor-pointer"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>
