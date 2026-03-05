export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'student';
  progress: Record<string, CourseProgress>;
  createdAt: Date;
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
  lessonCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  type: 'video' | 'quiz';
  title: string;
  description?: string;
  videoUrl?: string;
  order: number;
  createdAt: Date;
}

export interface Submission {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  videoUrl: string;
  feedback?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: Date;
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
