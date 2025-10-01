import React, { useState, useEffect } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { Link } from "@tanstack/react-router";
import { quizzes } from "../data/quizzes";
import type { Quiz, UserQuizProgress } from "../types/quiz";

export const QuizzesPage: React.FC = () => {
  const wallet = useTonWallet();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [userProgress, setUserProgress] = useState<Record<string, UserQuizProgress>>({});

  // Get unique categories and difficulties
  const categories = ["all", ...Array.from(new Set(quizzes.map(quiz => quiz.category)))];
  const difficulties = ["all", "easy", "medium", "hard"];

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('quiz-progress');
    if (savedProgress) {
      try {
        setUserProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to load quiz progress:', error);
      }
    }
  }, []);

  // Filter quizzes based on selected filters
  const filteredQuizzes = quizzes.filter(quiz => {
    const categoryMatch = selectedCategory === "all" || quiz.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getProgressInfo = (quizId: string) => {
    const progress = userProgress[quizId];
    if (!progress) return null;
    
    return {
      completed: progress.completed,
      bestScore: progress.bestScore,
      attempts: progress.attempts,
      rewardClaimed: progress.rewardClaimed
    };
  };

  const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const progress = getProgressInfo(quiz.id);
    const isCompleted = progress?.completed || false;
    const canClaimReward = isCompleted && !progress?.rewardClaimed;

    return (
      <div className="bg-[#3a3f47] rounded-lg p-6 hover:bg-[#414852] transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{quiz.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
              <p className="text-gray-400 text-sm">{quiz.category}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty.toUpperCase()}
            </span>
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-600/20 text-green-400 font-medium">
                ✓ COMPLETED
              </span>
            )}
            {canClaimReward && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-400 font-medium animate-pulse">
                💰 CLAIM REWARD
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{quiz.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>⏱️ {quiz.estimatedTime} min</span>
          <span>❓ {quiz.questions.length} questions</span>
          <span>💎 {quiz.rewardAmount} TON</span>
        </div>

        {progress && (
          <div className="mb-4 p-3 bg-[#2a2d34] rounded text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Best Score:</span>
              <span className="text-white font-medium">{progress.bestScore}/{quiz.questions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Attempts:</span>
              <span className="text-white">{progress.attempts}</span>
            </div>
            {progress.rewardClaimed && (
              <div className="flex justify-between items-center text-green-400">
                <span>Reward:</span>
                <span>✓ Claimed</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Link
            to="/quiz/$quizId"
            params={{ quizId: quiz.id }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
          >
            {isCompleted ? "Retake Quiz" : "Start Quiz"}
          </Link>
          
          {canClaimReward && (
            <Link
              to="/quiz/$quizId/claim"
              params={{ quizId: quiz.id }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Claim 💰
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#282c34] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📚 Quiz Challenges</h1>
              <p className="text-gray-300">Complete quizzes to earn TON rewards!</p>
            </div>
            <TonConnectButton />
          </div>
        </div>

        {/* Connection Status */}
        {!wallet && (
          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-300">
              💡 Connect your wallet to track progress and claim rewards!
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#2a2d34] border border-gray-600 rounded px-3 py-2 text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Difficulty:</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-[#2a2d34] border border-gray-600 rounded px-3 py-2 text-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Difficulties" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No quizzes found with the selected filters.</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-[#3a3f47] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-[#2a2d34] rounded p-4">
              <div className="text-2xl font-bold text-blue-400">
                {Object.values(userProgress).filter(p => p.completed).length}
              </div>
              <div className="text-sm text-gray-400">Completed Quizzes</div>
            </div>
            <div className="bg-[#2a2d34] rounded p-4">
              <div className="text-2xl font-bold text-green-400">
                {Object.values(userProgress).reduce((total, p) => total + p.attempts, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Attempts</div>
            </div>
            <div className="bg-[#2a2d34] rounded p-4">
              <div className="text-2xl font-bold text-purple-400">
                {Object.values(userProgress)
                  .filter(p => p.rewardClaimed)
                  .reduce((total, p) => {
                    const quiz = quizzes.find(q => q.id === Object.keys(userProgress).find(key => userProgress[key] === p));
                    return total + (quiz?.rewardAmount || 0);
                  }, 0)
                  .toFixed(3)} TON
              </div>
              <div className="text-sm text-gray-400">Total Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};