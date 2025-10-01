export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardAmount: number; // Amount in TON
  questions: QuizQuestion[];
  icon: string; // Emoji or icon
  estimatedTime: number; // In minutes
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  earnedReward: number;
  answers: number[]; // User's selected answers
}

export interface UserQuizProgress {
  quizId: string;
  completed: boolean;
  bestScore: number;
  attempts: number;
  lastAttempt?: Date;
  rewardClaimed: boolean;
}