import { H5PQuiz } from './types';

// Пример викторины с новым типом вопроса 'test'
export const testQuizExample: H5PQuiz = {
  id: 'test-quiz-example',
  title: 'Пример теста с новым типом вопроса',
  description: 'Демонстрация нового типа вопроса "test" с множественным выбором и обратной связью',
  questions: [
    {
      id: 'question_1',
      type: 'test',
      question: 'Выберите правильные варианты:',
      points: 2,
      multiple: true,
      answers: [
        {
          text: 'Вариант 1',
          correct: true,
          feedback: 'Правильно! Это верный ответ.'
        },
        {
          text: 'Вариант 2',
          correct: false,
          feedback: 'Неправильно, попробуйте еще раз.'
        },
        {
          text: 'Вариант 3',
          correct: true,
          feedback: 'Да, это тоже правильный ответ.'
        },
        {
          text: 'Вариант 4',
          correct: false,
          feedback: 'Этот вариант неверный.'
        }
      ],
      feedback: {
        correct: 'Отлично! Вы ответили правильно.',
        incorrect: 'Есть ошибки, попробуйте еще раз.'
      }
    },
    {
      id: 'question_2',
      type: 'test',
      question: 'Выберите один правильный ответ:',
      points: 1,
      multiple: false,
      answers: [
        {
          text: 'Первый вариант',
          correct: false,
          feedback: 'Это неправильный ответ.'
        },
        {
          text: 'Второй вариант',
          correct: true,
          feedback: 'Отлично! Это правильный ответ.'
        },
        {
          text: 'Третий вариант',
          correct: false,
          feedback: 'Этот вариант неверный.'
        },
        {
          text: 'Четвертый вариант',
          correct: false,
          feedback: 'Попробуйте еще раз.'
        }
      ],
      feedback: {
        correct: 'Поздравляем! Вы выбрали правильный ответ.',
        incorrect: 'К сожалению, это неправильный ответ.'
      }
    }
  ],
  timeLimit: 10,
  passingScore: 70,
  shuffleQuestions: false,
  showResults: true,
  allowRetry: true,
  maxAttempts: 3
};
