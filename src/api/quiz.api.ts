import { httpApi } from '@app/api/http.api';
import { httpApiMock } from '@app/api/mocks/http.api.mock';
import { Quiz, CreateQuizPayload, QuizItem } from '@app/types/course.types';

// Mock data for development
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    courseId: '1',
    items: [
      {
        id: '1',
        type: 'multiple_choice',
        question: 'Что такое React?',
        options: ['JavaScript библиотека', 'CSS фреймворк', 'База данных', 'Операционная система'],
        answerKey: 'JavaScript библиотека',
        explanation: 'React - это JavaScript библиотека для создания пользовательских интерфейсов',
      },
      {
        id: '2',
        type: 'true_false',
        question: 'React создан Facebook?',
        answerKey: 'true',
        explanation: 'Да, React был создан командой Facebook в 2013 году',
      },
    ],
    settings: {
      timeLimit: 30,
      passingScore: 70,
      allowRetake: true,
      showResults: true,
    },
  },
];

// Mock API responses
httpApiMock.onGet('quizzes').reply(200, mockQuizzes);
httpApiMock.onGet(/quizzes\/\d+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const quiz = mockQuizzes.find((q) => q.id === id);
  return quiz ? [200, quiz] : [404, { message: 'Quiz not found' }];
});
httpApiMock.onPost('quizzes').reply((config) => {
  const payload = JSON.parse(config.data);
  const newQuiz: Quiz = {
    id: Date.now().toString(),
    ...payload,
    items: payload.items.map((item: Omit<QuizItem, 'id'>, index: number) => ({
      ...item,
      id: `${Date.now()}_${index}`,
    })),
  };
  mockQuizzes.push(newQuiz);
  return [201, newQuiz];
});
httpApiMock.onPut(/quizzes\/\d+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const payload = JSON.parse(config.data);
  const quizIndex = mockQuizzes.findIndex((q) => q.id === id);
  if (quizIndex === -1) return [404, { message: 'Quiz not found' }];

  mockQuizzes[quizIndex] = {
    ...mockQuizzes[quizIndex],
    ...payload,
  };
  return [200, mockQuizzes[quizIndex]];
});

export class QuizApi {
  static async getQuizzes(): Promise<Quiz[]> {
    try {
      const response = await httpApi.get('quizzes');
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return mockQuizzes; // Fallback to mock data
    }
  }

  static async getQuizById(id: string): Promise<Quiz> {
    try {
      const response = await httpApi.get(`quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      const quiz = mockQuizzes.find((q) => q.id === id);
      if (!quiz) throw new Error('Quiz not found');
      return quiz;
    }
  }

  static async getQuizByCourseId(courseId: string): Promise<Quiz | null> {
    try {
      const response = await httpApi.get(`quizzes?courseId=${courseId}`);
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching quiz by course:', error);
      const quiz = mockQuizzes.find((q) => q.courseId === courseId);
      return quiz || null;
    }
  }

  static async createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
    try {
      const response = await httpApi.post('quizzes', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      // Create mock quiz as fallback
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        ...payload,
        items: payload.items.map((item, index) => ({
          ...item,
          id: `${Date.now()}_${index}`,
        })),
      };
      mockQuizzes.push(newQuiz);
      return newQuiz;
    }
  }

  static async updateQuiz(id: string, payload: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await httpApi.put(`quizzes/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      const quizIndex = mockQuizzes.findIndex((q) => q.id === id);
      if (quizIndex === -1) throw new Error('Quiz not found');

      mockQuizzes[quizIndex] = {
        ...mockQuizzes[quizIndex],
        ...payload,
      };
      return mockQuizzes[quizIndex];
    }
  }

  static async deleteQuiz(id: string): Promise<void> {
    try {
      await httpApi.delete(`quizzes/${id}`);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      const quizIndex = mockQuizzes.findIndex((q) => q.id === id);
      if (quizIndex !== -1) {
        mockQuizzes.splice(quizIndex, 1);
      }
    }
  }

  static async attachQuizToCourse(courseId: string, quizId: string): Promise<void> {
    try {
      await httpApi.post(`courses/${courseId}/quiz`, { quizId });
    } catch (error) {
      console.error('Error attaching quiz to course:', error);
      // Mock attachment
      const quiz = mockQuizzes.find((q) => q.id === quizId);
      if (quiz) {
        quiz.courseId = courseId;
      }
    }
  }
} 