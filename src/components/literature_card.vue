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
            v-model="topicTitle"
            ref="titleInput"
            @input="adjustInputWidth"
          />
        </template>
        <template v-else>
          {{ topicTitle }}
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
        <select class="border rounded-xl p-2 bg-white">
          <option>Семестр</option>
          <option>1-семестр 24-25</option>
          <option>2-семестр 24-25</option>
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

      <div class="group-settings">
        <div class="column-choice">
          <div>Оценка</div>
          <select class="border rounded-xl p-2 bg-white">
            <option>Экзамен</option>
            <option>Зачет</option>
            <option>Аттестация</option>
          </select>

          <div class="marks">
            <div class="mark-row">
              <div>Отлично</div>
              <input
                type="text"
                placeholder="МИНИМУМ"
                class="formula-input"
                v-model.number="grades[0].minScore"
                :disabled="!isEditing"
              />
              <input
                type="text"
                placeholder="МАКСИМУМ"
                class="formula-input"
                v-model.number="grades[0].maxScore"
                :disabled="!isEditing"
              />
            </div>
            <div class="mark-row">
              <div>Хорошо</div>
              <input
                type="text"
                placeholder="МИНИМУМ"
                class="formula-input"
                v-model.number="grades[1].minScore"
                :disabled="!isEditing"
              />
              <input
                type="text"
                placeholder="МАКСИМУМ"
                class="formula-input"
                v-model.number="grades[1].maxScore"
                :disabled="!isEditing"
              />
            </div>
            <div class="mark-row">
              <div>Удовл.</div>
              <input
                type="text"
                placeholder="МИНИМУМ"
                class="formula-input"
                v-model.number="grades[2].minScore"
                :disabled="!isEditing"
              />
              <input
                type="text"
                placeholder="МАКСИМУМ"
                class="formula-input"
                v-model.number="grades[2].maxScore"
                :disabled="!isEditing"
              />
            </div>
            <div class="mark-row">
              <div>Неуд.</div>
              <input
                type="text"
                placeholder="МИНИМУМ"
                class="formula-input"
                v-model.number="grades[3].minScore"
                :disabled="!isEditing"
              />
              <input
                type="text"
                placeholder="МАКСИМУМ"
                class="formula-input"
                v-model.number="grades[3].maxScore"
                :disabled="!isEditing"
              />
            </div>
              <button
              v-if="isEditing"
              @click="setGradesAndAddExamColumn"
              class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition cursor-pointer"
            >
              Поставить оценки
            </button>
          </div>
        </div>

<div class="sum-columns">
  <div>Выбор колонок</div>

  <template v-if="isEditing">
    <div class="columns-checkbox-list">
      <div
        v-for="column in availableColumns"
        :key="column"
        class="checkbox-item"
      >
        <input
          type="checkbox"
          :id="'column-' + column"
          :value="column"
          v-model="localSelectedColumns"
          class="checkbox-input"
        />
        <label :for="'column-' + column" class="checkbox-label">
          {{ column }}
        </label>
      </div>
    </div>
    <button
      @click="selectAllColumns"
      class="mt-2 px-4 py-1 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition cursor-pointer"
    >
      Выбрать все
    </button>
  </template>

  <template v-else>
    <div class="columns-list">
      <div
        v-for="column in availableColumns"
        :key="column"
        class="column-item"
      >
        <span class="column-label">{{ column }}</span>
        <span v-if="localSelectedColumns.includes(column)" class="selected-indicator">✓</span>
      </div>
    </div>
  </template>
</div>

        <div class="calculation-method">
          <div>Выбор способа подсчета</div>
          <select class="border rounded-xl p-2 bg-white">
            <option>Суммирование</option>
            <option>Процент</option>
          </select>
          <div class="max-points mt-2">
            <div>Общее количество баллов</div>
            <input
              type="text"
              :value="totalMaxScore"
              readonly
              class="formula-input text"
            />
            <div>Баллы из выбранных колонок</div>
            <input
              type="text"
              :value="selectedColumnsTotal"
              readonly
              class="formula-input text"
            />
          </div>
        </div>
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

      <p v-if="errorMessage" class="text-red-500 ml-13 mt-2">
        {{ errorMessage }}
      </p>

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

<script setup>
// Переменные границ
import { ref, defineProps, defineEmits, computed, watch, inject, onMounted } from "vue";
import { useStorage } from '@vueuse/core';


const props = defineProps({
    topic: {
        type: String,
        default: "ЖУРНАЛ",
    },
    totalMaxScore: {
        type: Number,
        required: true,
    },
    columns: {
        type: Array,
        default: () => [],
    },
    selectedColumns: {
        type: Array,
        default: () => [],
    },
    grades: {
        type: Array,
        default: () => [
            { name: 'Отлично', minScore: null, maxScore: null },
            { name: 'Хорошо', minScore: null, maxScore: null },
            { name: 'Удовл.', minScore: null, maxScore: null },
            { name: 'Неуд.', minScore: null, maxScore: null }
        ]
    },
    maxScores: {
        type: Object,
        default: () => ({})
    },
    addExamColumn: {
        type: Function,
        required: true,
    },
    students: {
        type: Array,
        default: () => [] // Массив объектов с данными учеников
    }
});

const emit = defineEmits(['update:selectedColumns', 'update:grades', 'update:student-scores']);

// Локальное состояние
const isCollapsed = ref(false);
const isEditing = ref(false);
const errorMessage = ref("");
const uploadedFiles = ref([]);
const isEditingGlobal = inject("isEditingGlobal");
const localSelectedColumns = ref([...props.selectedColumns]);
const topicTitle = ref(props.topic);
const topicText = ref(props.topic);

//  Функция для сохранения оценок в localStorage
const saveGradesToLocalStorage = (grades) => {
    localStorage.setItem('literature_grades', JSON.stringify(grades));
    console.log('Сохраняем оценки в localStorage:', grades);
};

//  Функция для загрузки оценок из localStorage
const loadGradesFromLocalStorage = () => {
    const storedGrades = localStorage.getItem('literature_grades');
    if (storedGrades) {
        console.log('Загружаем оценки из localStorage:', JSON.parse(storedGrades));
        return JSON.parse(storedGrades);
    }
    return props.grades; // Вернуть props.grades, а не null
};

const initialGrades = loadGradesFromLocalStorage();
const grades = ref(JSON.parse(JSON.stringify(initialGrades)));

// Данные для выпадающего списка
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

const selectedLevel1 = ref(""); // Устанавливаем значение по умолчанию для "Направление"
const selectedLevel2 = ref(""); // Устанавливаем значение по умолчанию для "Поднаправлен

// Вычисляемое свойство для второго уровня выпадающего списка
const getLevel2Options = computed(() => {
    if (selectedLevel1.value) {
        const selectedOption = options.value.find(
            (option) => option.value === selectedLevel1.value
        );
        console.log(
            "getLevel2Options: selectedLevel1.value",
            selectedLevel1.value
        );
        console.log("getLevel2Options: options.value", options.value); // Покажите весь объект options
        console.log("getLevel2Options: selectedOption", selectedOption);
        const result = selectedOption ? selectedOption.children : [];
        console.log("getLevel2Options: result", result);
        return result;
    }
    return [];
});

// Доступные колонки (из пропсов)
const availableColumns = computed(() => props.columns);

// Вычисляем сумму максимальных баллов выбранных колонок
const selectedColumnsTotal = computed(() => {
    if (!props.maxScores || Object.keys(props.maxScores).length === 0) return 0;

    return localSelectedColumns.value.reduce((sum, column) => {
        const score = parseFloat(props.maxScores[column]) || 0;
        return sum + score;
    }, 0);
});

// Синхронизация выбранных колонок с родительским компонентом
watch(localSelectedColumns, (newVal) => {
    emit('update:selectedColumns', newVal);
}, { deep: true });

// Синхронизация оценок с родительским компонентом
watch(grades, (newVal) => {
    emit('update:grades', newVal);
}, { deep: true });

// Реакция на изменения из родителя
watch(() => props.selectedColumns, (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(localSelectedColumns.value)) {
        localSelectedColumns.value = [...newVal];
    }
});

// метод для выбора всех колонок
const selectAllColumns = () => {
    localSelectedColumns.value = [...availableColumns.value];
};

// Вычисляем сумму баллов по выбранным колонкам для каждого ученика
const studentScores = computed(() => {
    return props.students.map(student => {
        let total = 0;
        localSelectedColumns.value.forEach(column => {
            // Предполагаем, что у каждого ученика есть свойства, соответствующие именам колонок
            if (student[column] !== undefined) {
                total += parseFloat(student[column]) || 0;
            }
        });
        return {
            ...student,
            totalScore: total
        };
    });
});

const setGradesAndAddExamColumn = () => {
    // Используем максимальную сумму из studentScores или selectedColumnsTotal
    const maxTotal = Math.max(
        ...studentScores.value.map(s => s.totalScore),
        selectedColumnsTotal.value
    );

    // Устанавливаем диапазоны оценок на основе максимальной суммы
    grades.value = [
        { name: 'Отлично', minScore: Math.round(maxTotal * 0.85), maxScore: maxTotal },
        { name: 'Хорошо', minScore: Math.round(maxTotal * 0.7), maxScore: Math.round(maxTotal * 0.84) },
        { name: 'Удовл.', minScore: Math.round(maxTotal * 0.55), maxScore: Math.round(maxTotal * 0.69) },
        { name: 'Неуд.', minScore: 0, maxScore: Math.round(maxTotal * 0.54) }
    ];

    // Вызываем prop addExamColumn, передавая текущие grades
    props.addExamColumn(grades.value);

    // Синхронизируем оценки с родителем
    emit('update:grades', grades.value);
};


// Методы компонента
const toggleCollapse = () => {
    if (!isEditing.value) {
        isCollapsed.value = !isCollapsed.value;
    }
};

const startEditing = () => {
    isEditing.value = true;
    errorMessage.value = "";
};

const cancelEditing = () => {
    topicTitle.value = props.topic;
    topicText.value = props.topic; // Восстанавливаем topicText
    isEditing.value = false;
    errorMessage.value = "";
    grades.value = JSON.parse(JSON.stringify(loadGradesFromLocalStorage()));
    localSelectedColumns.value = [...props.selectedColumns];
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

// Функция для установки значений по умолчанию при инициализации
const setDefaultGradeValues = () => {
    if (grades.value.length > 0) {
        // Неуд - минимум = 0
        grades.value[3].minScore = 0;

        // Отлично - максимум = totalMaxScore
        grades.value[0].maxScore = props.totalMaxScore;
    }
};

// onMounted хук для выполнения кода после монтирования компонента
onMounted(() => {
    setDefaultGradeValues();
});
watch(studentScores, (newScores) => {
  emit('update:student-scores', newScores);
}, { deep: true });

// Watch для автоматической установки значений при изменении totalMaxScore
watch(
    () => props.totalMaxScore,
    (newTotalMaxScore) => {
        grades.value[0].maxScore = newTotalMaxScore;
    }
);
const filterByFIO = () => {};
const exportToExcel = () => {};

// Переменные границ
const a1 = useStorage('a1', null);
const a2 = useStorage('a2', null);
const b1 = useStorage('b1', null);
const b2 = useStorage('b2', null);
const c1 = useStorage('c1', null);
const c2 = useStorage('c2', null);
const d1 = useStorage('d1', null);
const d2 = useStorage('d2', null);

const saveGradeBounds = () => {
    // Валидация и обработка ошибок для каждой границы (пример)
    if (grades.value[0].minScore !== null && isNaN(Number(grades.value[0].minScore))) {
        errorMessage.value = "Минимум для Отлично должен быть числом!";
        return;
    }
    if (grades.value[0].maxScore !== null && isNaN(Number(grades.value[0].maxScore))) {
        errorMessage.value = "Максимум для Отлично должен быть числом!";
        return;
    }
    if (grades.value[1].minScore !== null && isNaN(Number(grades.value[1].minScore))) {
        errorMessage.value = "Минимум для Хорошо должен быть числом!";
        return;
    }
    if (grades.value[1].maxScore !== null && isNaN(Number(grades.value[1].maxScore))) {
        errorMessage.value = "Максимум для Хорошо должен быть числом!";
        return;
    }
    if (grades.value[2].minScore !== null && isNaN(Number(grades.value[2].minScore))) {
        errorMessage.value = "Минимум для Удовл. должен быть числом!";
        return;
    }
    if (grades.value[2].maxScore !== null && isNaN(Number(grades.value[2].maxScore))) {
        errorMessage.value = "Максимум для Удовл. должен быть числом!";
        return;
    }
    if (grades.value[3].minScore !== null && isNaN(Number(grades.value[3].minScore))) {
        errorMessage.value = "Минимум для Неуд. должен быть числом!";
        return;
    }
    if (grades.value[3].maxScore !== null && isNaN(Number(grades.value[3].maxScore))) {
        errorMessage.value = "Максимум для Неуд. должен быть числом!";
        return;
    }
    if (grades.value[0].minScore !== null && grades.value[0].maxScore !== null && Number(grades.value[0].minScore) > Number(grades.value[0].maxScore)) {
        errorMessage.value = "Минимум для Отлично не может быть больше максимума!";
        return;
    }
     if (grades.value[1].minScore !== null && grades.value[1].maxScore !== null && Number(grades.value[1].minScore) > Number(grades.value[1].maxScore)) {
        errorMessage.value = "Минимум для Хорошо не может быть больше максимума!";
        return;
    }
    if (grades.value[2].minScore !== null && grades.value[2].maxScore !== null && Number(grades.value[2].minScore) > Number(grades.value[2].maxScore)) {
        errorMessage.value = "Минимум для Удовл. не может быть больше максимума!";
        return;
    }
    if (grades.value[3].minScore !== null && grades.value[3].maxScore !== null && Number(grades.value[3].minScore) > Number(grades.value[3].maxScore)) {
        errorMessage.value = "Минимум для Неуд. не может быть больше максимума!";
        return;
    }

  errorMessage.value = ""; // Сброс сообщения об ошибке, если валидация прошла успешно
};

// Функция валидации границ и сохранения
const saveChanges = () => {
    if (!topicTitle.value.trim() || !topicText.value.trim()) {  // Валидация для topicText
        errorMessage.value = "Все поля должны быть заполнены!";
        return;
    }

    //  вызов saveGradeBounds уже выполняет валидацию
    saveGradeBounds()

    // Если есть ошибки, прекращаем сохранение
    if (errorMessage.value) {
      return;
    }

    // Обновление оценки на основе текущих границ
    grades.value = [
        { name: 'Отлично', minScore: grades.value[0].minScore, maxScore: grades.value[0].maxScore },
        { name: 'Хорошо', minScore: grades.value[1].minScore, maxScore: grades.value[1].maxScore },
        { name: 'Удовл.', minScore: grades.value[2].minScore, maxScore: grades.value[2].maxScore },
        { name: 'Неуд.', minScore: grades.value[3].minScore, maxScore: grades.value[3].maxScore }
    ];

    isEditing.value = false;
    errorMessage.value = "";

    saveGradesToLocalStorage(grades.value);
    emit('update:grades', grades.value);
};
</script>
/* Стили для чекбоксов */
.columns-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
}

/* Стили для списка колонок в режиме просмотра */
.columns-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.column-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f8fafc;
}

.column-label {
  font-size: 14px;
}

.selected-indicator {
  color: #3b82f6;
  font-weight: bold;
}

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
  width: 40%;
}

.sum-columns {
  width: 25%;
}

.calculation-method {
  width: 35%;
}

.marks {
  margin-top: 10px;
  width: 100%;
}

.mark-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  justify-content: space-between;
  width: 100%;
}

.mark-row > div {
  margin-right: 10px;
}

.formula-input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100px;
}

.sum-columns select {
  min-height: 120px;
}

.max-points input {
  width: 100%;
  text-align: center;
}

.formula-input:disabled {
  cursor: not-allowed;
}

/* Стиль для кнопки "Со

<style scoped>
/* Стили для чекбоксов */
.columns-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
}

/* Стили для списка колонок в режиме просмотра */
.columns-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.column-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f8fafc;
}

.column-label {
  font-size: 14px;
}

.selected-indicator {
  color: #3b82f6;
  font-weight: bold;
}

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
  width: 40%;
}

.sum-columns {
  width: 25%;
}

.calculation-method {
  width: 35%;
}

.marks {
  margin-top: 10px;
  width: 100%;
}

.mark-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  justify-content: space-between;
  width: 100%;
}

.mark-row > div {
  margin-right: 10px;
}

.formula-input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100px;
}

.sum-columns select {
  min-height: 120px;
}

.max-points input {
  width: 100%;
  text-align: center;
}

.formula-input:disabled {
  cursor: not-allowed;
}

/* Стиль для кнопки "Сохранить выбор" */
.sum-columns button {
  width: 100%;
  margin-top: 8px;
}
</style>