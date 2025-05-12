<template>
  <div>
    <div @mouseenter="isDrawerOpen = true" @mouseleave="isDrawerOpen = false">
      <Drawer v-if="isDrawerOpen" />
      <Drawerminimised v-if="!isDrawerOpen" />
    </div>

    <div class="border-b border-gray-500">
      <Header />
    </div>

    <div>
      <div class="flex justify-between w-2/3 m-auto mt-5">
        <button
          @click="toggleGlobalEditing"
          class="px-4 py-2 hover:-translate-y-0.5 hover:-translate-x-0.5 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition cursor-pointer"
        >
          {{ isEditingGlobal ? "Завершить редактирование" : "Редактировать" }}
        </button>
        <div class="relative">
          <img class="absolute top-3 left-3" src="/search.png" alt="" />
          <input
            type="text"
            placeholder="Поиск..."
            class="bg-white p-2 pl-10 pr-4 rounded-xl focus:border-gray-400"
            v-model="searchQuery"
            @input="handleSearch"
          />
        </div>
      </div>

      <Course_card
  ref="courseCard"
  :isEditingGlobal="isEditingGlobal"
  :grade-ranges="gradeRanges"
  :student-scores="studentScores"
  @update:grade-ranges="updateGradeRanges"
/>

      <Literature
  :totalMaxScore="computedTotalMaxScore"
  :columns="filteredColumns"
  :selectedColumns.sync="selectedColumns"
  :maxScores="courseCard?.maxScores"
  :grade-ranges="gradeRanges"
  @update:grade-ranges="updateGradeRanges"
  @update:student-scores="updateStudentScores"
  :addExamColumn="addExamColumn"
/>
      <Practice_card />
      <Subject_card />
      <Exam_card :totalMaxScore="computedTotalMaxScore" />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted } from "vue";
import Header from "./components/Header.vue";
import Course_card from "./components/course_card.vue";
import Literature from "./components/literature_card.vue";
import Exam_card from "./components/new_card.vue";
import Practice_card from "./components/practice_card.vue";
import Subject_card from "./components/subject_card.vue";
import Drawer from "./components/drawer.vue";
import Drawerminimised from "./components/drawerminimised.vue";

// Состояние компонента
const isDrawerOpen = ref(false);
const isEditingGlobal = ref(false);
const courseCard = ref(null);
const totalMaxScoreFromCourseCard = ref(0);
const selectedColumns = ref([]);
const searchQuery = ref("");
const studentScores = ref([]);

// Состояние для границ оценок
const gradeRanges = ref([
  { name: 'Отлично', minScore: 85, maxScore: 100 },
  { name: 'Хорошо', minScore: 70, maxScore: 84 },
  { name: 'Удовл.', minScore: 55, maxScore: 69 },
  { name: 'Неуд.', minScore: 0, maxScore: 54 }
]);
const updateStudentScores = (newScores) => {
  studentScores.value = newScores;
};


// Загрузка сохраненных границ из localStorage при монтировании
onMounted(() => {
  const savedGrades = localStorage.getItem('gradeRanges');
  if (savedGrades) {
    gradeRanges.value = JSON.parse(savedGrades);
  }
});

// Обработчик обновления границ оценок
const updateGradeRanges = (newRanges) => {
  gradeRanges.value = newRanges;
  localStorage.setItem('gradeRanges', JSON.stringify(newRanges));

  // Обновляем оценки в Course_card
  if (courseCard.value) {
    courseCard.value.addExamColumn(newRanges);
  }
};

// Обработчик поиска
const handleSearch = () => {
  if (courseCard.value) {
    courseCard.value.filterResults(searchQuery.value);
  }
};

// Отслеживаем изменения totalMaxScore из Course_card
watch(
  () => courseCard.value?.totalMaxScore,
  (newValue) => {
    if (newValue !== undefined) {
      totalMaxScoreFromCourseCard.value = newValue;
    }
  },
  { immediate: true }
);

// Получаем список колонок из courseCard с фильтрацией служебных
const filteredColumns = computed(() => {
  if (!courseCard.value?.columnOrder) return [];

  return courseCard.value.columnOrder.filter(column =>
    column !== 'ФИО' &&
    column !== 'Группа' &&
    column !== 'Сумма Баллов' &&
    column !== 'ЭКЗ'
  );
});

// Вычисляемое свойство для передачи общего количества баллов
const computedTotalMaxScore = computed(() => {
  return totalMaxScoreFromCourseCard.value;
});

// Переключение режима редактирования
const toggleGlobalEditing = () => {
  isEditingGlobal.value = !isEditingGlobal.value;
};

// Передаем состояние редактирования дочерним компонентам
provide("isEditingGlobal", isEditingGlobal);

// Отладочный вывод при изменении выбранных колонок
watch(selectedColumns, (newVal) => {
  console.log("Выбранные колонки:", newVal);
}, { deep: true });

// Метод для обновления выбранных колонок
const updateSelectedColumns = (newColumns) => {
  selectedColumns.value = [...newColumns];
};

// Метод для добавления столбца "ЭКЗ" и проставления оценок
const addExamColumn = (gradeRanges) => {
  if (courseCard.value) {
    courseCard.value.addExamColumn(gradeRanges);
  }
};

// Экспортируем методы для доступа из дочерних компонентов
defineExpose({
  updateSelectedColumns
});
</script>

<style scoped>
/* Основные стили контейнера */
div {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Стили для кнопок */
button {
  transition: all 0.3s ease;
  font-weight: 500;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Стили для поля поиска */
input[type="text"] {
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  font-size: 14px;
}

input[type="text"]:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

/* Анимации */
.transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Отзывчивые стили */
@media (max-width: 768px) {
  .flex.justify-between {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .w-2\/3 {
    width: 95%;
  }

  input[type="text"] {
    width: 100%;
  }
}

/* Стили для тени при наведении */
.hover\:shadow-xl:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>