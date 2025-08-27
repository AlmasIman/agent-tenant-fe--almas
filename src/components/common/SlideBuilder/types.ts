export enum SlideType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  CODE = 'CODE',
  CHART = 'CHART',
  EMBED = 'EMBED',
  GAME = 'GAME',
  INTERACTIVE = 'INTERACTIVE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  PROGRESS = 'PROGRESS',
  FLASHCARDS = 'FLASHCARDS',
  FILL_WORDS = 'FILL_WORDS',
}

export interface SlideSettings {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  padding?: number;
  showTitle?: boolean;
  showNumber?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number;
  height?: number;
  borderRadius?: number;
  shadow?: boolean;
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: string;
  order: number;
  settings: SlideSettings;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    duration?: number; // для видео
    fileSize?: number; // для файлов
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface SlideContent {
  text?: string;
  images?: string[];
  videoUrl?: string;
  code?: {
    language: string;
    code: string;
  };
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    points?: number;
  };
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    data: any;
    options?: any;
  };
  embed?: {
    url: string;
    type: 'iframe' | 'embed';
  };
  game?: {
    type: 'memory' | 'puzzle' | 'dragdrop' | 'matching';
    config: any;
    rewards?: number;
  };
  interactive?: {
    type: 'hotspot' | 'timeline' | 'simulation';
    config: any;
    feedback?: string;
  };
  achievement?: {
    title: string;
    description: string;
    icon: string;
    points: number;
    unlocked: boolean;
  };
  progress?: {
    current: number;
    total: number;
    milestones: string[];
    rewards: any[];
  };
  flashcards?: {
    cards: Array<{
      id: string;
      front: string;
      back: string;
      category?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }>;
    shuffle?: boolean;
    showProgress?: boolean;
  };
  fillWords?: {
    text: string;
    blanks: Array<{
      id: string;
      word: string;
      hint?: string;
      position: number;
    }>;
    showHints?: boolean;
    caseSensitive?: boolean;
  };
}

export interface SlideTemplate {
  id: string;
  name: string;
  type: SlideType;
  preview: string;
  defaultSettings: SlideSettings;
  defaultContent: string;
}
