import { httpApi } from '@app/api/http.api';
import { httpApiMock } from '@app/api/mocks/http.api.mock';
import { Course, CreateCoursePayload, UpdateCoursePayload } from '@app/types/course.types';

// Mock data for development
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Введение в React',
    description: 'Базовый курс по React для начинающих',
    content:
      '<h1>Введение в React</h1><p>React - это JavaScript библиотека для создания пользовательских интерфейсов.</p>',
    creator: 'Алмас Симанбаев',
    spaceId: '1',
    spaceName: 'Программирование',
    tags: ['React', 'JavaScript', 'Frontend'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    status: 'published',
  },
];

const mockSpaces = [
  { id: '1', name: 'Программирование', description: 'Курсы по программированию' },
  { id: '2', name: 'Дизайн', description: 'Курсы по дизайну' },
  { id: '3', name: 'Маркетинг', description: 'Курсы по маркетингу' },
];

// Mock API responses
httpApiMock.onGet('courses').reply(200, mockCourses);
httpApiMock.onGet(/courses\/\d+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const course = mockCourses.find((c) => c.id === id);
  return course ? [200, course] : [404, { message: 'Course not found' }];
});
httpApiMock.onPost('courses').reply((config) => {
  const payload = JSON.parse(config.data);
  const newCourse: Course = {
    id: Date.now().toString(),
    ...payload,
    spaceName: mockSpaces.find((s) => s.id === payload.spaceId)?.name || 'Unknown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
  mockCourses.push(newCourse);
  return [201, newCourse];
});
httpApiMock.onPut(/courses\/\d+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const payload = JSON.parse(config.data);
  const courseIndex = mockCourses.findIndex((c) => c.id === id);
  if (courseIndex === -1) return [404, { message: 'Course not found' }];

  mockCourses[courseIndex] = {
    ...mockCourses[courseIndex],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return [200, mockCourses[courseIndex]];
});

httpApiMock.onGet('kb/spaces/').reply(200, mockSpaces);
httpApiMock.onPost('kb/spaces/').reply((config) => {
  const payload = JSON.parse(config.data);
  const newSpace = {
    id: Date.now().toString(),
    name: payload.name,
    description: payload.description || '',
  };
  mockSpaces.push(newSpace);
  return [201, newSpace];
});

export class CourseApi {
  static async getCourses(): Promise<Course[]> {
    try {
      const response = await httpApi.get('courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return mockCourses; // Fallback to mock data
    }
  }

  static async getCourseById(id: string): Promise<Course> {
    try {
      const response = await httpApi.get(`courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      const course = mockCourses.find((c) => c.id === id);
      if (!course) throw new Error('Course not found');
      return course;
    }
  }

  static async createCourse(payload: CreateCoursePayload): Promise<Course> {
    try {
      const response = await httpApi.post('courses', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      // Create mock course as fallback
      const newCourse: Course = {
        id: Date.now().toString(),
        ...payload,
        spaceName: mockSpaces.find((s) => s.id === payload.spaceId)?.name || 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
      };
      mockCourses.push(newCourse);
      return newCourse;
    }
  }

  static async updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
    try {
      const response = await httpApi.put(`courses/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      const courseIndex = mockCourses.findIndex((c) => c.id === id);
      if (courseIndex === -1) throw new Error('Course not found');

      mockCourses[courseIndex] = {
        ...mockCourses[courseIndex],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return mockCourses[courseIndex];
    }
  }

  static async deleteCourse(id: string): Promise<void> {
    try {
      await httpApi.delete(`courses/${id}`);
    } catch (error) {
      console.error('Error deleting course:', error);
      const courseIndex = mockCourses.findIndex((c) => c.id === id);
      if (courseIndex !== -1) {
        mockCourses.splice(courseIndex, 1);
      }
    }
  }

  static async getSpaces() {
    try {
      const response = await httpApi.get('kb/spaces/');
      return response.data;
    } catch (error) {
      console.error('Error fetching spaces:', error);
      return mockSpaces;
    }
  }

  static async createSpace(payload: { name: string; description?: string }) {
    try {
      // API ожидает только поле name согласно curl запросу
      const apiPayload = { name: payload.name };
      const response = await httpApi.post('kb/spaces/', apiPayload);
      return response.data;
    } catch (error) {
      console.error('Error creating space:', error);
      const newSpace = {
        id: Date.now().toString(),
        name: payload.name,
        description: payload.description || '',
      };
      mockSpaces.push(newSpace);
      return newSpace;
    }
  }
}
