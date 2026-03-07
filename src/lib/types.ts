export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'student';
  displayName?: string;
  progress: Record<string, CourseProgress>;
  createdAt: string;
}

export interface CourseProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  type: 'video' | 'quiz' | 'survey';
  title: string;
  description?: string;
  videoUrl?: string;
  surveyId?: string;
  order: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  videoUrl: string;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  courseId: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface SessionUser {
  id: string;
  email: string;
  role: 'admin' | 'student';
  displayName?: string;
}

// ── Survey ──────────────────────────────────────────────────────────────────

export interface SurveyQuestion {
  id: string;
  type: 'text' | 'single' | 'multiple' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  answers: Record<string, string | string[]>;
  createdAt: string;
}
