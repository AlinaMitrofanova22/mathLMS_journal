<template>
  <div
    class="p-2 flex justify-between border border-gray-100 rounded-[2vw] m-auto w-2/3 mt-20 bg-white shadow-xl hover:-translate-y-1 hover:-translate-x-1 hover:shadow-xl transition"
  >
    <div class="relative flex flex-col w-full">
      <div class="relative flex space-x-2">
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
          alt="hide_topic"
          class="absolute top-1 right-12 cursor-pointer w-5 h-5 opacity-60 hover:opacity-100 transition"
          title="Скрыть"
        />
      </div>

      <h2
        class="text-black-500 text-3xl absolute px-2 translate-x-6 -translate-y-6 border border-black rounded-xl bg-[url('/Rectangle.png')]"
      >
        <template v-if="isEditing">
          <input
            v-model="titleText"
            ref="titleInput"
            @input="adjustInputWidth"
          />
        </template>
        <template v-else>
          {{ titleText }}
        </template>
      </h2>

      <div class="flex items-center cursor-pointer" @click="toggleCollapse">
        <template v-if="isEditing">
          <input
            v-model="topicText"
            placeholder="Введите тему"
            class="ml-2 mt-6 mb-3 text-xl border border-gray-300 rounded-lg px-2 py-1 w-full"
          />
        </template>
        <template v-else>
          <p class="ml-2 mt-6 mb-3 text-3xl font-bold">
            {{ topicText }}
          </p>
        </template>
      </div>

      <!-- Элементы выбора и поиска -->
      <div class="flex flex-wrap gap-4 items-center mb-4 ml-12">
        <!-- Направление -->
        <select class="border rounded-xl p-2 bg-white" v-model="selectedLevel1">
          <option disabled value="">Выбрать направление</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Поднаправление -->
        <select v-if="selectedLevel1" class="border rounded-xl p-2 bg-white" v-model="selectedLevel2">
          <option disabled value="">Выбрать группу</option>
          <option v-for="option in getLevel2Options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Поиск -->
        <input
          type="text"
          placeholder="Поиск по ФИО"
          class="bg-white p-2 pl-10 pr-4 rounded-xl border border-gray-300"
          @input="filterByFIO($event.target.value)"
        />

        <!-- Семестр -->
        <select class="border rounded-xl p-2 bg-white" v-model="selectedSemester">
          <option value="">Семестр</option>
          <option value="1">1-семестр 24-25</option>
          <option value="2">2-семестр 24-25</option>
        </select>

        <!-- Кнопка экспорта -->
        <button
          @click="exportToExcel"
          class="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition cursor-pointer"
        >
          Экспорт в Excel
        </button>
      </div>

      <p v-if="errorMessage" class="text-red-500 ml-13 mt-2">
        {{ errorMessage }}
      </p>

      <!-- Table -->
      <div class="overflow-x-auto relative" v-if="!isCollapsed">
        <table class="min-w-full divide-y divide-gray-200 results-table">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="column in columnOrder"
                :key="column"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                :class="{
                  'sticky left-0 bg-gray-50 z-10': column === 'ФИО',
                  'sticky bg-gray-50 z-10':
                    column === 'Группа' || column === 'Сумма Баллов',
                }"
                :style="{
                  left:
                    column === 'Группа'
                      ? getGroupColumnLeft()
                      : column === 'Сумма Баллов'
                      ? getSumColumnLeft()
                      : undefined,
                }"
              >
                {{ column }}
                <button
                  v-if="isEditing && column !== 'ФИО' && column !== 'Группа' && column !== 'Сумма Баллов'"
                  @click="deleteColumn(column)"
                  class="absolute top-1 right-1 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </th>
            </tr>
            <!-- Добавляем строку с максимальными баллами -->
            <tr>
              <td
                v-for="column in columnOrder"
                :key="column"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                :class="{
                  'sticky left-0 bg-gray-50 z-10': column === 'ФИО',
                  'sticky bg-gray-50 z-10':
                    column === 'Группа' || column === 'Сумма Баллов',
                }"
                :style="{
                  left:
                    column === 'Группа'
                      ? getGroupColumnLeft()
                      : column === 'Сумма Баллов'
                      ? getSumColumnLeft()
                      : undefined,
                }"
              >
                <template v-if="isEditing && editingCell === 'maxScores' + column">
                  <input
                    v-model="maxScoresDraft[column]"
                    @blur="editingCell = null"
                    @keydown.tab.prevent="goToNextCellMaxScores(column)"
                    class="border border-gray-300 rounded-md px-2 py-1 w-full"
                    type="text"
                    :data-cell-id="'maxScores' + column"
                  />
                </template>
                <template v-else>
                  <div @click="isEditing ? editCellMaxScores(column) : null">
                    <template v-if="column === 'ФИО' || column === 'Группа'">&nbsp;</template>
                    <template v-else-if="column === 'Сумма Баллов'">{{ totalMaxScore }}</template>
                    <template v-else>{{ maxScores[column] }}</template>
                  </div>
                </template>
              </td>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="result in filteredResults" :key="result.id">
              <td
                v-for="column in columnOrder"
                :key="column"
                class="px-6 py-4 whitespace-nowrap relative"
                :class="{
                  'sticky left-0 bg-white z-10': column === 'ФИО',
                  'sticky bg-white z-10':
                    column === 'Группа' || column === 'Сумма Баллов',
                }"
                :style="{
                  left:
                    column === 'Группа'
                      ? getGroupColumnLeft()
                      : column === 'Сумма Баллов'
                      ? getSumColumnLeft()
                      : undefined,
                }"
              >
                <template v-if="isEditing && editingCell === result.id + column">
                  <input
                    v-model="resultDraft[result.id][column]"
                    @blur="editingCell = null"
                    @keydown.tab.prevent="goToNextCell(result, column)"
                    class="border border-gray-300 rounded-md px-2 py-1 w-7 h-8 text-sm"
                    type="text"
                    :data-cell-id="result.id + column"
                  />
                </template>
                <template v-else>
                  <div @click="isEditing ? editCell(result, column) : null">
                    <template v-if="column === 'Сумма Баллов'">{{ calculateTotalScore(result) }}</template>
                    <template v-else>{{ result[column] }}</template>
                  </div>
                </template>
                <!-- Кнопка удаления ученика (только для строки с ФИО) -->
                <button
                  v-if="isEditing && column === 'ФИО'"
                  @click="deleteStudent(result.id)"
                  class="absolute top-1 right-1 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col">
        <template v-if="isEditing">
          <div v-if="uploadedFiles.length" class="mt-4 gap-2 w-full mr-11">
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
                  <img src="" class="mr-2" alt="Файл" />
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
          <div
            v-if="uploadedFiles.length"
            class="mt-4 ml-13 mr-11 flex flex-col gap-2"
          >
            <template v-for="(file, index) in uploadedFiles" :key="index">
              <a :href="file.url" :download="file.file.name">
                <img
                  v-if="file.file.type.startsWith('image/')"
                  :src="file.url"
                  class="cursor-pointer rounded-[1.5vw] mb-10"
                  alt="Превью"
                />
                <div
                  v-else
                  class="flex items-center mt-5 mb-10 underline cursor-pointer text-2xl rounded-[1.5vw] shadow-xl hover:-translate-y-1 hover:-translate-x-1"
                >
                  <img
                    src="/Icon.png"
                    alt="file"
                    class="my-0.1 py-5 px-5 ml-2 mr-5"
                  />
                  {{ file.file.name }}
                </div>
              </a>
            </template>
          </div>
        </template>
      </div>

      <div class="flex justify-end mb-2 mt-4">
        <button v-if="isEditing" @click="openAddColumnModal"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition cursor-pointer">
          Добавить столбец
        </button>
        <button
          v-if="isEditing"
          @click="openAddStudentModal"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition cursor-pointer ml-2"
        >
          Добавить ученика
        </button>
        <button
          v-if="isEditing"
          @click="saveChanges"
          class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition cursor-pointer ml-2"
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

      <!-- Modal for adding a column -->
      <div
        v-if="isAddColumnModalOpen"
        class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded shadow-md w-1/3">
          <h2 class="text-lg font-semibold mb-4">Добавить новый столбец</h2>
          <label for="newColumnName" class="block text-gray-700 text-sm font-bold mb-2"
            >Название столбца:</label
          >
          <input
            type="text"
            id="newColumnName"
            v-model="newColumnNameInput"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div class="mt-6 flex justify-end">
            <button
              @click="closeAddColumnModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Отмена
            </button>
            <button
              @click="addColumn"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      <!-- Modal for adding a student -->
      <div
        v-if="isAddStudentModalOpen"
        class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded shadow-md w-1/3">
          <h2 class="text-lg font-semibold mb-4">Добавить нового ученика</h2>
          <label for="newStudentFIO" class="block text-gray-700 text-sm font-bold mb-2">ФИО ученика:</label>
          <input
            type="text"
            id="newStudentFIO"
            v-model="newStudentFIO"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          />
          <label for="newStudentGroup" class="block text-gray-700 text-sm font-bold mb-2">Группа ученика:</label>
          <input
            type="text"
            id="newStudentGroup"
            v-model="newStudentGroup"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          />

          <div class="mt-6 flex justify-end">
            <button
              @click="closeAddStudentModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Отмена
            </button>
            <button
              @click="addStudent"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      <div class="journal-container">
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject, onMounted, computed, nextTick } from "vue";
import { cloneDeep } from "lodash";
import * as XLSX from "xlsx";

const isCollapsed = ref(false);
const isEditing = ref(false);
const errorMessage = ref("");
const uploadedFiles = ref([]);
const isEditingGlobal = inject("isEditingGlobal");

const props = defineProps({
  title: {
    type: String,
    default: "Математический анализ",
  },
  topic: {
    type: String,
    default: "ЖУРНАЛ",
  },
  container: Object,
  startEditing: Function,
  confirmDeleteContainer: Function,
  grades: {
    type: Array,
    default: () => [
      { name: "Отлично", minScore: 85, maxScore: 100 },
      { name: "Хорошо", minScore: 70, maxScore: 84 },
      { name: "Удовлетворительно", minScore: 55, maxScore: 69 },
      { name: "Неудовлетворительно", minScore: 0, maxScore: 54 }
    ]
  },
  shouldAddExamColumn: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:grades']);

const titleText = ref(props.title);
const topicText = ref(props.topic);
const openText = ref(props.open);
const closeText = ref(props.close);

const columnOrder = ref([
  "ФИО",
  "Группа",
  "Сумма Баллов",
  "ЭКЗ", //Add ЭКЗ here
  "ДЗ1",
  "ДЗ2",
  "ДЗ3",
  "ДЗ4",
  "КР1",
  "Тест1",
  "ДЗ7",
  "ДЗ8",
  "ДЗ9",
  "ДЗ10",
  "КР3",
  "Тест3",
  "ДЗ11",
  "ДЗ12",
  "ДЗ13",
  "ДЗ14",
]);

// Данные для первого семестра
const resultsData1 = ref([
  {
    id: 1,
    ФИО: "Филимонов Максим Дмитриевич",
    Группа: "МП-402",
    ДЗ1: "5",
    ДЗ2: "4",
    ДЗ3: "5",
    ДЗ4: "4",
    КР1: "4",
    Тест1: "5",
    ДЗ7: "5",
    ДЗ8: "4",
    ДЗ9: "5",
    ДЗ10: "4",
    КР3: "3",
    Тест3: "4",
    ДЗ11: "5",
    ДЗ12: "5",
    ДЗ13: "3",
    ДЗ14: "5",
    ЭКЗ: "" // Initialize
  },
  {
    id: 2,
    ФИО: "Орлов Вадим Данилович",
    Группа: "МТ-302",
    ДЗ1: "5",
    ДЗ2: "4",
    ДЗ3: "4",
    ДЗ4: "4",
    КР1: "5",
    Тест1: "5",
    ДЗ7: "3",
    ДЗ8: "5",
    ДЗ9: "5",
    ДЗ10: "4",
    КР3: "3",
    Тест3: "4",
    ДЗ11: "5",
    ДЗ12: "5",
    ДЗ13: "4",
    ДЗ14: "4",
    ЭКЗ: "" // Initialize
  },
  {
    id: 3,
    ФИО: "Казак Ангелина Михайловна",
    Группа: "МТ-302",
    ДЗ1: "5",
    ДЗ2: "5",
    ДЗ3: "5",
    ДЗ4: "5",
    КР1: "5",
    Тест1: "5",
    ДЗ7: "5",
    ДЗ8: "2",
    ДЗ9: "2",
    ДЗ10: "2",
    КР3: "2",
    Тест3: "2",
    ДЗ11: "2",
    ДЗ12: "2",
    ДЗ13: "2",
    ДЗ14: "2",
    ЭКЗ: "" // Initialize
  },
  {
    id: 4,
    ФИО: "Федорова Алёна Максимовна",
    Группа: "МТ-302",
    ДЗ1: "5",
    ДЗ2: "5",
    ДЗ3: "5",
    ДЗ4: "4",
    КР1: "5",
    Тест1: "4",
    ДЗ7: "4",
    ДЗ8: "5",
    ДЗ9: "5",
    ДЗ10: "4",
    КР3: "4",
    Тест3: "4",
    ДЗ11: "5",
    ДЗ12: "4",
    ДЗ13: "4",
    ДЗ14: "4",
    ЭКЗ: "" // Initialize
  },
  {
    id: 5,
    ФИО: "Калугин Александр Фёдорович",
    Группа: "МП-402",
    ДЗ1: "5",
    ДЗ2: "5",
    ДЗ3: "5",
    ДЗ4: "4",
    КР1: "5",
    Тест1: "5",
    ДЗ7: "5",
    ДЗ8: "5",
    ДЗ9: "5",
    ДЗ10: "4",
    КР3: "3",
    Тест3: "4",
    ДЗ11: "5",
    ДЗ12: "5",
    ДЗ13: "5",
    ДЗ14: "5",
    ЭКЗ: "" // Initialize
  },
]);

// Данные для второго семестра
const resultsData2 = ref([
  {
    id: 1,
    ФИО: "Филимонов Максим Дмитриевич",
    Группа: "МП-402",
    ДЗ1: "4",
    ДЗ2: "5",
    ДЗ3: "4",
    ДЗ4: "5",
    КР1: "5",
    Тест1: "4",
    ДЗ7: "4",
    ДЗ8: "5",
    ДЗ9: "4",
    ДЗ10: "5",
    КР3: "4",
    Тест3: "5",
    ДЗ11: "4",
    ДЗ12: "4",
    ДЗ13: "5",
    ДЗ14: "4",
    ЭКЗ: "" // Initialize
  },
  {
    id: 2,
    ФИО: "Орлов Вадим Данилович",
    Группа: "МТ-302",
    ДЗ1: "4",
    ДЗ2: "4",
    ДЗ3: "5",
    ДЗ4: "5",
    КР1: "4",
    Тест1: "4",
    ДЗ7: "5",
    ДЗ8: "4",
    ДЗ9: "4",
    ДЗ10: "5",
    КР3: "4",
    Тест3: "4",
    ДЗ11: "5",
    ДЗ12: "4",
    ДЗ13: "4",
    ДЗ14: "5",
    ЭКЗ: "" // Initialize
  },
  {
    id: 3,
    ФИО: "Казак Ангелина Михайловна",
    Группа: "МТ-302",
    ДЗ1: "2",
    ДЗ2: "2",
    ДЗ3: "2",
    ДЗ4: "2",
    КР1: "2",
    Тест1: "2",
    ДЗ7: "2",
    ДЗ8: "5",
    ДЗ9: "5",
    ДЗ10: "5",
    КР3: "5",
    Тест3: "5",
    ДЗ11: "5",
    ДЗ12: "5",
    ДЗ13: "5",
    ДЗ14: "5",
    ЭКЗ: "" // Initialize
  },
  {
    id: 4,
    ФИО: "Федорова Алёна Максимовна",
    Группа: "МТ-302",
    ДЗ1: "4",
    ДЗ2: "4",
    ДЗ3: "4",
    ДЗ4: "5",
    КР1: "4",
    Тест1: "5",
    ДЗ7: "5",
    ДЗ8: "4",
    ДЗ9: "4",
    ДЗ10: "5",
    КР3: "5",
    Тест3: "5",
    ДЗ11: "4",
    ДЗ12: "5",
    ДЗ13: "5",
    ДЗ14: "5",
    ЭКЗ: "" // Initialize
  },
  {
    id: 5,
    ФИО: "Калугин Александр Фёдорович",
    Группа: "МП-402",
    ДЗ1: "5",
    ДЗ2: "4",
    ДЗ3: "5",
    ДЗ4: "4",
    КР1: "5",
    Тест1: "5",
    ДЗ7: "5",
    ДЗ8: "4",
    ДЗ9: "5",
    ДЗ10: "4",
    КР3: "5",
    Тест3: "5",
    ДЗ11: "5",
    ДЗ12: "4",
    ДЗ13: "5",
    ДЗ14: "4",
    ЭКЗ: "" // Initialize
  },
]);

const maxScores = ref({
  ФИО: "",
  Группа: "",
  "Сумма Баллов": "",
  ЭКЗ: "",
  ДЗ1: "5",
  ДЗ2: "5",
  ДЗ3: "5",
  ДЗ4: "5",
  КР1: "5",
  Тест1: "5",
  ДЗ7: "5",
  ДЗ8: "5",
  ДЗ9: "5",
  ДЗ10: "5",
  КР3: "5",
  Тест3: "5",
  ДЗ11: "5",
  ДЗ12: "5",
  ДЗ13: "5",
  ДЗ14: "5",
});

const maxScoresDraft = ref(cloneDeep(maxScores.value));
const resultDraft = ref({});
const editingCell = ref(null);
const searchQuery = ref("");
const selectedSemester = ref(""); // Добавляем ref для выбранного семестра

const currentResultsData = computed(() => {
  return selectedSemester.value === "2" ? resultsData2.value : resultsData1.value;
});

const filteredResults = computed(() => {
  let filtered = [...currentResultsData.value];

  if (selectedLevel1.value) {
    const level1Value = selectedLevel1.value;
    const selectedGroup = selectedLevel2.value;

    if (selectedGroup) {
      filtered = filtered.filter((result) =>
        result.Группа.startsWith(selectedGroup)
      );
    } else {
      filtered = filtered.filter((result) =>
        result.Группа.startsWith(level1Value)
      );
    }
  }

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((result) =>
      (result["ФИО"] || "").toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
});

// Modal for adding student
const isAddStudentModalOpen = ref(false);
const newStudentFIO = ref("");
const newStudentGroup = ref("");

const openAddStudentModal = () => {
  isAddStudentModalOpen.value = true;
};

const closeAddStudentModal = () => {
  isAddStudentModalOpen.value = false;
  newStudentFIO.value = "";
  newStudentGroup.value = "";
};

const addStudent = () => {
  if (!newStudentFIO.value.trim() || !newStudentGroup.value.trim()) {
    alert("Пожалуйста, введите ФИО и группу ученика.");
    return;
  }

  const newStudent = {
    id: currentResultsData.value.length > 0 ? Math.max(...currentResultsData.value.map(s => s.id)) + 1 : 1,
    ФИО: newStudentFIO.value,
    Группа: newStudentGroup.value,
  };

  // Заполняем нулями остальные ячейки
  columnOrder.value.forEach(column => {
    if (column !== "ФИО" && column !== "Группа" && column !== "Сумма Баллов") {
      newStudent[column] = "0";
    }
  });

  currentResultsData.value.push(newStudent);

  // Обновляем resultDraft
  resultDraft.value[newStudent.id] = cloneDeep(newStudent);

  closeAddStudentModal();
};

const deleteColumn = (columnToDelete) => {
  if (columnToDelete === "ФИО" || columnToDelete === "Группа") {
    alert("Нельзя удалить  столбец ФИО или Группу.");
    return;
  }

  columnOrder.value = columnOrder.value.filter((col) => col !== columnToDelete);

  // Update both datasets
  resultsData1.value = resultsData1.value.map((result) => {
    const { [columnToDelete]: deleted, ...rest } = result;
    return rest;
  });
  resultsData2.value = resultsData2.value.map((result) => {
    const { [columnToDelete]: deleted, ...rest } = result;
    return rest;
  });

  delete maxScores.value[columnToDelete];
  delete maxScoresDraft.value[columnToDelete];

  // Обновляем resultDraft для каждого студента
  for (const studentId in resultDraft.value) {
    delete resultDraft.value[studentId][columnToDelete];
  }
};

const deleteStudent = (studentId) => {
  // Delete from both datasets
  resultsData1.value = resultsData1.value.filter((student) => student.id !== studentId);
  resultsData2.value = resultsData2.value.filter((student) => student.id !== studentId);

  delete resultDraft.value[studentId];
};

const setDefaultGradeValues = () => {
  const savedGradesFlat = localStorage.getItem('grades_final_flat');
  if (savedGradesFlat) {
    const parsed = JSON.parse(savedGradesFlat);
    if (props.grades.length >= 4) {
      emit('update:grades', [
        { ...props.grades[0], minScore: parsed.a1, maxScore: parsed.a2 },
        { ...props.grades[1], minScore: parsed.b1, maxScore: parsed.b2 },
        { ...props.grades[2], minScore: parsed.c1, maxScore: parsed.c2 },
        { ...props.grades[3], minScore: parsed.d1, maxScore: parsed.d2 }
      ]);
    }
  }

  const savedGrades = localStorage.getItem('grades_final');
  if (savedGrades) {
    emit('update:grades', JSON.parse(savedGrades));
  }
};

const filterByFIO = (value) => {
  searchQuery.value = value.toLowerCase();
};

const editCell = (result, column) => {
  editingCell.value = result.id + column;
  nextTick(() => {
    const inputElement = document.querySelector(
      `input[data-cell-id="${result.id + column}"]`
    );
    if (inputElement) {
      inputElement.focus();
    }
  });
};

const editCellMaxScores = (column) => {
  editingCell.value = "maxScores" + column;
  nextTick(() => {
    const inputElement = document.querySelector(
      `input[data-cell-id="maxScores${column}"]`
    );
    if (inputElement) {
      inputElement.focus();
    }
  });
};

const fioColumnWidth = ref(300);
const groupColumnWidth = ref(100);

const getGroupColumnLeft = () => `${fioColumnWidth.value}px`;
const getSumColumnLeft = () => `${fioColumnWidth.value + groupColumnWidth.value}px`;

const inputElement = ref(null);
const titleInput = ref(null);

const adjustInputWidth = () => {
  if (titleInput.value) {
    titleInput.value.style.width = titleInput.value.scrollWidth + "px";
  }
};

onMounted(() => {
  setDefaultGradeValues();

  const fioColumn = document.querySelector(".results-table th:nth-child(1)");
  if (fioColumn) {
    fioColumnWidth.value = fioColumn.offsetWidth;
  }
  const groupColumn = document.querySelector(".results-table th:nth-child(2)");
  if (groupColumn) {
    groupColumnWidth.value = groupColumn.offsetWidth;
  }
  adjustInputWidth();

  // Вызываем addExamColumn при монтировании, чтобы сразу проставить оценки
    if (props.grades && props.grades.length >= 4) {
      addExamColumn(props.grades);
    }
});

watch(props, () => {
  titleText.value = props.title;
  topicText.value = props.topic;
});

watch(() => props.shouldAddExamColumn, (newVal) => {
  if (newVal) {
    addExamColumn(props.grades);
  }
});
watch(titleText, adjustInputWidth);

watch(
  resultDraft,
  (newVal) => {
    console.log("resultDraft changed", newVal);
  },
  { deep: true }
);

watch(
  maxScoresDraft,
  (newVal) => {
    console.log("maxScoresDraft changed", newVal);
  },
  { deep: true }
);

const toggleCollapse = () => {
  if (!isEditing.value) {
    isCollapsed.value = !isCollapsed.value;
  }
};

const startEditing = () => {
  isEditing.value = true;
  errorMessage.value = "";

  maxScoresDraft.value = cloneDeep(maxScores.value);
  resultDraft.value = {};
  currentResultsData.value.forEach((result) => {
    resultDraft.value[result.id] = cloneDeep(result);
  });
};

const saveChanges = () => {
  if (!titleText.value.trim() || !topicText.value.trim()) {
    errorMessage.value = "Все поля должны быть заполнены!";
    return;
  }
  isEditing.value = false;
  errorMessage.value = "";

  maxScores.value = cloneDeep(maxScoresDraft.value);
  // Update data according to selected semester
  if(selectedSemester.value === "1") {
    resultsData1.value = currentResultsData.value.map(result => {
        if (resultDraft.value[result.id]) {
            return { ...resultDraft.value[result.id], ЭКЗ: result.ЭКЗ };
        } else {
            return { ...result, ЭКЗ: result.ЭКЗ };
        }
    });
} else {
    resultsData2.value = currentResultsData.value.map(result => {
        if (resultDraft.value[result.id]) {
            return { ...resultDraft.value[result.id], ЭКЗ: result.ЭКЗ };
        } else {
            return { ...result, ЭКЗ: result.ЭКЗ };
        }
    });
}

  emit('update:grades', props.grades);
};

const cancelEditing = () => {
  titleText.value = props.title;
  topicText.value = props.topic;
  isEditing.value = false;
  errorMessage.value = "";

  maxScoresDraft.value = cloneDeep(maxScores.value);
  resultDraft.value = {};
  currentResultsData.value.forEach((result) => {
    resultDraft.value[result.id] = cloneDeep(result);
  });
};

const goToNextCell = (result, column) => {
  const currentRowIndex = currentResultsData.value.findIndex((r) => r.id === result.id);
  const currentColumnIndex = columnOrder.value.indexOf(column);

  let nextRowIndex = currentRowIndex;
  let nextColumnIndex = currentColumnIndex + 1;

  if (nextColumnIndex >= columnOrder.value.length) {
    nextRowIndex++;
    nextColumnIndex = 3;
  }

  // Add this check to handle when the next row has been deleted
  if (nextRowIndex >= currentResultsData.value.length) {
    editingCell.value = null;
    return;
  }
  if (nextRowIndex < 0) {
    return;
  }

  let nextColumn = columnOrder.value[nextColumnIndex];
  const nextResult = currentResultsData.value[nextRowIndex];

  if (nextResult) {
    editingCell.value = nextResult.id + nextColumn;
    nextTick(() => {
      const inputElement = document.querySelector(
        `input[data-cell-id="${nextResult.id + nextColumn}"]`
      );
      if (inputElement) {
        inputElement.focus();
      }
    });
  } else {
    editingCell.value = null;
  }
};

const goToNextCellMaxScores = (column) => {
  const currentColumnIndex = columnOrder.value.indexOf(column);
  let nextColumnIndex = currentColumnIndex + 1;

  if (nextColumnIndex >= columnOrder.value.length) {
    nextColumnIndex = 3;
  }

  const nextColumn = columnOrder.value[nextColumn];
  if (nextColumn) {
    editingCell.value = "maxScores" + nextColumn;
    nextTick(() => {
      const inputElement = document.querySelector(
        `input[data-cell-id="maxScores${nextColumn}"]`
      );
      if (inputElement) {
        inputElement.focus();
      }
    });
  } else {
    editingCell.value = null;
  }
};

const exportToExcel = () => {
  const data = filteredResults.value.map((result) => {
    const row = {};
    columnOrder.value.forEach((column) => {
      if (column === "Сумма Баллов") {
        row[column] = calculateTotalScore(result);
      } else {
        row[column] = result[column];
      }
    });
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data, { header: columnOrder.value });
  XLSX.utils.book_append_sheet(wb, ws, "Результаты");
  XLSX.writeFile(wb, "результаты.xlsx");
};

const options = ref([
  {
    label: "МТ",
    value: "MT",
    children: [
      { label: "МТ-1", value: "МТ-1" },
      { label: "МТ-101", value: "МТ-101" },
      { label: "МТ-102", value: "МТ-102" },
      { label: "МТ-103", value: "МТ-103" },
      { label: "МТ-2", value: "МТ-201" },
      { label: "МТ-202", value: "МТ-202" },
      { label: "МТ-203", value: "МТ-203" },
      { label: "МТ-3", value: "МТ-301" },
      { label: "МТ-302", value: "МТ-302" },
      { label: "МТ-303", value: "МТ-303" },
      { label: "МТ-4", value: "МТ-401" },
      { label: "МТ-402", value: "МТ-402" },
      { label: "МТ-403", value: "МТ-403" },
    ],
  },
  {
    label: "МП",
    value: "MP",
    children: [
      { label: "МП-1", value: "МП-1" },
      { label: "МП-101", value: "МП-101" },
      { label: "МП-102", value: "МП-102" },
      { label: "МП-103", value: "МП-103" },
      { label: "МП-2", value: "МП-201" },
      { label: "МП-202", value: "МП-202" },
      { label: "МП-203", value: "МП-203" },
      { label: "МП-3", value: "МП-301" },
      { label: "МП-302", value: "МП-302" },
      { label: "МП-303", value: "МП-303" },
      { label: "МП-4", value: "МП-401" },
      { label: "МП-402", value: "МП-402" },
      { label: "МП-403", value: "МП-403" },
    ],
  },
  {
    label: "МН",
    value: "MH",
    children: [
      { label: "МН-1", value: "МН-1" },
      { label: "МН-101", value: "МН-101" },
      { label: "МН-102", value: "МН-102" },
      { label: "МН-2", value: "МН-201" },
      { label: "МН-202", value: "МН-202" },
      { label: "МН-3", value: "МН-301" },
      { label: "МН-302", value: "МН-302" },
      { label: "МН-4", value: "МН-401" },
      { label: "МН-402", value: "МН-402" },
    ],
  },
  {
    label: "МК",
    value: "MK",
    children: [
      { label: "МК-1", value: "МК-1" },
      { label: "МК-101", value: "МК-101" },
      { label: "МК-102", value: "МК-102" },
      { label: "МК-103", value: "МК-103" },
      { label: "МК-2", value: "МК-201" },
      { label: "МК-202", value: "МК-202" },
      { label: "МК-203", value: "МК-203" },
      { label: "МК-3", value: "МК-301" },
      { label: "МК-302", value: "МК-302" },
      { label: "МК-4", value: "МК-401" },
    ],
  },
]);

const selectedLevel1 = ref("");
const selectedLevel2 = ref("");

const getLevel2Options = computed(() => {
  if (selectedLevel1.value) {
    const selectedOption = options.value.find(
      (option) => option.value === selectedLevel1.value
    );
    return selectedOption ? selectedOption.children : [];
  }
  return [];
});

const newColumnName = ref("");
const isAddColumnModalOpen = ref(false);
const newColumnNameInput = ref("");

const openAddColumnModal = () => {
  isAddColumnModalOpen.value = true;
};

const closeAddColumnModal = () => {
  isAddColumnModalOpen.value = false;
  newColumnNameInput.value = "";
};

const addColumn = () => {
  const name = newColumnNameInput.value.trim();

  if (!name) {
    alert("Пожалуйста, введите название столбца.");
    return;
  }

  newColumnName.value = name;
  columnOrder.value.push(newColumnName.value);

   // Add new column to both datasets with default value "0"
  resultsData1.value.forEach(result => {
    result[newColumnName.value] = "0";
  });
  resultsData2.value.forEach(result => {
    result[newColumnName.value] = "0";
  });

  maxScores.value[newColumnName.value] = "5";
  maxScoresDraft.value[newColumnName.value] = "5";

  currentResultsData.value.forEach((result) => {
    if (!resultDraft.value[result.id]) {
      resultDraft.value[result.id] = cloneDeep(result);
    }
    resultDraft.value[result.id][newColumnName.value] = "0";
  });
  closeAddColumnModal();
};

watch(selectedSemester, (newSemester) => {
    if (props.grades && props.grades.length >= 4) {
        addExamColumn(props.grades);
    }
});

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

const totalMaxScore = computed(() => {
  let sum = 0;
  for (const key in maxScores.value) {
    if (key !== "ФИО" && key !== "Группа" && key !== "Сумма Баллов" && key !== "ЭКЗ") {
      sum += parseInt(maxScores.value[key]) || 0;
    }
  }
  return sum;
});

const calculateTotalScore = (result) => {
  let sum = 0;
  for (const key in result) {
    if (
      maxScores.value.hasOwnProperty(key) &&
      key !== "ФИО" &&
      key !== "Группа" &&
      key !== "ЭКЗ" &&
      !isNaN(parseInt(result[key]))
    ) {
      sum += parseInt(result[key]);
    }
  }
  return sum;
};

const addExamColumn = (gradeRanges) => {
  // Добавляем колонку только если её ещё нет
  if (!columnOrder.value.includes('ЭКЗ')) {
    columnOrder.value.splice(columnOrder.value.indexOf('Сумма Баллов') + 1, 0, 'ЭКЗ');
    console.log("Exam column added to columnOrder");
  }

  // Остальная логика выставления оценок
  if (gradeRanges && gradeRanges.length >= 4) {

    const assignExamGrades = (data) => {
        return data.map(student => {
            const totalScore = calculateTotalScore(student);
            let examGrade = '';

            if (totalScore >= gradeRanges[0].minScore) {
                examGrade = '5 (Отлично)';
            } else if (totalScore >= gradeRanges[1].minScore) {
                examGrade = '4 (Хорошо)';
            } else if (totalScore >= gradeRanges[2].minScore) {
                examGrade = '3 (Удовл.)';
            } else {
                examGrade = '2 (Неуд.)';
            }
            return { ...student, 'ЭКЗ': examGrade };
        });
    };

    resultsData1.value = assignExamGrades(resultsData1.value);
    resultsData2.value = assignExamGrades(resultsData2.value);

      maxScores.value['ЭКЗ'] = '';
      maxScoresDraft.value['ЭКЗ'] = '';
    console.log("Exam grades assigned:", currentResultsData.value);
  }
};

defineExpose({
  addExamColumn,
  totalMaxScore,
  columnOrder,
  maxScores,
  filteredResults
});
</script>

<style scoped>
.group-settings {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.column-choice,
.sum-columns,
.calculation-method {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marks {
  margin-top: 10px;
}

.mark-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.mark-row > div {
  margin-right: 5px;
}

.formula-input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>