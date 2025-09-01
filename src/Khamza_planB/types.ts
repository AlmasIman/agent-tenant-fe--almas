export interface H5PQuizQuestion {
  id: string;
  type:
    | 'multiple-choice'
    | 'true-false'
    | 'fill-in-the-blank'
    | 'drag-and-drop'
    | 'mark-the-words'
    | 'image-hotspot'
    | 'drag-the-words'
    | 'test'
    | 'image-drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  // Дополнительные поля для новых типов вопросов
  text?: string; // для mark-the-words - текст с выделяемыми словами
  correctWords?: string[]; // для mark-the-words - правильные слова для выделения
  imageUrl?: string; // для image-hotspot - URL изображения
  hotspots?: Array<{
    id: string;
    x: number; // процент от ширины изображения
    y: number; // процент от высоты изображения
    radius: number; // радиус в пикселях
    label?: string; // подпись к зоне
  }>; // для image-hotspot - кликабельные зоны
  // для drag-the-words - перетаскивание слов
  dragText?: string; // текст с плейсхолдерами для перетаскивания
  dragWords?: string[]; // слова для перетаскивания
  dragTargets?: Array<{
    id: string;
    placeholder: string; // плейсхолдер в тексте (например, "___")
    correctWord: string; // правильное слово для этого места
  }>;
  // для test - новый тип вопроса с множественным выбором и обратной связью
  answers?: Array<{
    text: string;
    correct: boolean;
    feedback: string;
  }>;
  multiple?: boolean; // разрешить множественный выбор
  feedback?: {
    correct: string;
    incorrect: string;
  };
  // для image-drag-drop - перетаскивание элементов на изображение
  imageDragDrop?: {
    imageUrl: string; // URL изображения
    dropZones: Array<{
      id: string;
      x: number; // процент от ширины изображения
      y: number; // процент от высоты изображения
      width: number; // ширина зоны в пикселях
      height: number; // высота зоны в пикселях
      label?: string; // подпись к зоне
      correctItems: string[]; // правильные элементы для этой зоны
    }>;
    draggableItems: Array<{
      id: string;
      text: string;
      correctZoneId: string; // ID правильной зоны
    }>;
  };
}

export interface H5PQuiz {
  id: string;
  title: string;
  description: string;
  questions: H5PQuizQuestion[];
  timeLimit?: number; // в минутах
  passingScore: number; // процент для прохождения
  shuffleQuestions: boolean;
  showResults: boolean;
  allowRetry: boolean;
  maxAttempts?: number;
}

export interface H5PQuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  attempts: number;
  completedAt: Date;
}

export interface H5PQuizState {
  currentQuestionIndex: number;
  answers: Record<string, string | string[] | Record<string, string>>;
  timeSpent: number;
  isCompleted: boolean;
  score: number;
  attempts: number;
}
