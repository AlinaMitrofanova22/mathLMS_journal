import mockJSON from "mock-json";

const scheme = {
  header: {
    user: {
      id: 123,
      role: "Студент",
      photo: "/blankprofpic.png",
    },
    route: {
      subject: "Математический анализ",
      teacher: "Плеханова М.В.",
      type: "Практика",
    },
    userMenu: [
      {
        label: {
          user: {
            full_name: "Иван Иванов",
          },
        },
        link: "/profile",
      },
      {
        label: "Личные файлы / Оценки",
        link: "/profile",
      },
      {
        label: "Сообщения",
        link: "/profile",
      },
      {
        label: "Настройки",
        link: "/profile",
      },
      {
        label: "Выход",
        link: "/logout",
      },
    ],
  },
  sidebar: {
    logo: "/emb_csu.png",
    title: "ЧелГУ",
    menuItems: [
      {
        icon: "/un_icon2.png",
        text: "Мои Курсы",
      },
      {
        icon: "/un_icon2.png",
        text: "Мои Курсы",
      },
      {
        icon: "/un_icon2.png",
        text: "Мои Курсы",
      },
      {
        icon: "/un_icon2.png",
        text: "Мои Курсы",
      },
    ],
  },
  courseBlock: {
    course: {
      id: 2,
      title: "Математический анализ",
      topic: "ОБЩЕЕ",
      groupename: "Лекции для направления МП-2",
      teacher: "Плеханова Марина Васильевна",
      position: "Доктор физико-математических наук профессор",
      department: "Математический анализ",
      email: "asdsadsa@asd.com",
    },
  },
  literatureBlock: {
    id: 1,
    topic: "ЛИТЕРАТУРА",
    dateOpen: "понедельник, 1 сентября 2025, 00:00",
    literature:
      "Демидович, Б. П. Сборник задач и упражнений по математическому анализу...",
    files: [
      {
        fileId: 1,
        fileName: "asd",
        fileType: "application/pdf",
        url: "/files/asd.pdf",
      },
      {
        fileId: 2,
        fileName: "jiklj",
        fileType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        url: "/files/jiklj.xlsx",
      },
    ],
  },
  examBlock: {
    id: 1,
    topic: "ЭКЗАМЕН. ЗАЧЕТ",
    description: "Балльно-рейтинговая система",
    files: [
      {
        fileId: 1,
        fileName: "kjlk",
        fileType:
          " application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "/files/kjlk.docx",
      },
      {
        fileId: 2,
        fileName: "qwerty.xlsx",
        fileType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        url: "/files/qwerty.xlsx",
      },
    ],
  },
  newBlock: [
    {
      id: 1,
      title: "Лекция 1: Введение в матанализ",
      fields: [
        {
          id: 1,
          type: "input",
          value: "Основные понятия",
        },
        {
          id: 2,
          type: "textarea",
          value: "Здесь идёт  описание",
        },
      ],
      files: [
        {
          fileId: 1,
          fileName: "Lecture1.pdf",
          fileType: "application/pdf",
          url: "/files/Lecture1.pdf",
        },
      ],
      isEditing: false,
      isNew: false,
    },
    {
      id: 1,
      title: "Лекция 2: Ряды и их сходимость",
      fields: [
        {
          id: 1,
          type: "input",
          value: "Теория рядов",
        },
      ],
      files: [],
      isEditing: false,
      isNew: false,
    },
  ],
};
