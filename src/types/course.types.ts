export interface Space {
  id: string;
  name: string;
  description: string;
}

export interface QuizItem {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'mark_the_words' | 'image_hotspots' | 'drag_words';
  question: string;
  options?: string[];
  answerKey: string | string[];
  explanation?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    alt?: string;
  };
}

export interface Quiz {
  id: string;
  courseId: string;
  items: QuizItem[];
  settings: {
    timeLimit?: number;
    passingScore?: number;
    allowRetake?: boolean;
    showResults?: boolean;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  content: string; // rich content
  creator: string;
  spaceId: string;
  spaceName: string;
  tags: string[];
  quizId?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  content: string;
  creator: string;
  spaceId: string;
  tags: string[];
}

export interface CreateSpacePayload {
  name: string;
  description: string;
}

export interface CreateQuizPayload {
  courseId: string;
  items: Omit<QuizItem, 'id'>[];
  settings: Quiz['settings'];
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {
  status?: 'draft' | 'published';
}
