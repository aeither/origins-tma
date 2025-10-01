import React, { useState, useEffect } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { Link } from "@tanstack/react-router";
import { quizzes } from "../data/quizzes";
import type { UserQuizProgress } from "../types/quiz";

export const DuolingoHomePage: React.FC = () => {
  const wallet = useTonWallet();
  const [userProgress, setUserProgress] = useState<Record<string, UserQuizProgress>>({});
  const [totalEarned, setTotalEarned] = useState(0);

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('quiz-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setUserProgress(progress);
        
        // Calculate total earned
        let earned = 0;
        Object.values(progress).forEach((p) => {
          const userProgress = p as UserQuizProgress;
          if (userProgress.rewardClaimed) {
            const quiz = quizzes.find(q => q.id === userProgress.quizId);
            if (quiz) earned += quiz.rewardAmount;
          }
        });
        setTotalEarned(earned);
      } catch (error) {
        console.error('Failed to load quiz progress:', error);
      }
    }
  }, []);

  const getProgressInfo = (quizId: string) => {
    const progress = userProgress[quizId];
    if (!progress) return { completed: false, canClaim: false, claimed: false };
    
    return {
      completed: progress.completed,
      canClaim: progress.completed && progress.bestScore === quizzes.find(q => q.id === quizId)?.questions.length && !progress.rewardClaimed,
      claimed: progress.rewardClaimed,
      score: progress.bestScore || 0
    };
  };

  const completedQuizzes = Object.values(userProgress).filter(p => p.completed).length;
  const totalQuizzes = quizzes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#58cc02] to-[#37a500] text-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">TonTip</h1>
              <p className="text-white/80 text-sm">Learn & Earn TON</p>
            </div>
          </div>
          <TonConnectButton />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            🎓 Learn, Quiz, Earn!
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Complete knowledge quizzes and earn TON cryptocurrency rewards
          </p>
          
          {!wallet && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-white/80 mb-4">Connect your TON wallet to start earning rewards</p>
              <TonConnectButton />
            </div>
          )}
        </div>

        {/* Stats */}
        {wallet && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
              <div className="text-3xl font-bold text-yellow-300">{completedQuizzes}</div>
              <div className="text-white/80">Quizzes Completed</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
              <div className="text-3xl font-bold text-blue-300">{totalEarned.toFixed(3)}</div>
              <div className="text-white/80">TON Earned</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
              <div className="text-3xl font-bold text-purple-300">{Math.round((completedQuizzes / totalQuizzes) * 100)}%</div>
              <div className="text-white/80">Progress</div>
            </div>
          </div>
        )}

        {/* Quiz Path */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-center mb-8">Choose Your Learning Path</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {quizzes.map((quiz, index) => {
              const progress = getProgressInfo(quiz.id);
              const isLocked = index > 0 && !getProgressInfo(quizzes[index - 1].id).completed;
              
              return (
                <div 
                  key={quiz.id} 
                  className={`
                    bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50
                    transition-all duration-300 hover:scale-105 relative
                    ${isLocked ? 'opacity-60' : ''}
                  `}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-gray-900/20 rounded-2xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <div className="text-gray-700 font-semibold text-sm">Complete Previous Quiz</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Reward Badge */}
                  {progress.canClaim && (
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center animate-bounce z-20">
                      <span className="text-white text-sm">💰</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    {/* Quiz Icon */}
                    <div className={`
                      w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl
                      ${progress.completed 
                        ? 'bg-yellow-400 text-yellow-900' 
                        : 'bg-green-100 text-green-600'
                      }
                    `}>
                      {progress.completed ? '👑' : quiz.icon}
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                    
                    {/* Quiz Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-blue-600 font-semibold">⏱️ {quiz.estimatedTime}m</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2">
                        <div className="text-orange-600 font-semibold">❓ {quiz.questions.length}q</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="text-green-600 font-semibold">💎 {quiz.rewardAmount}</div>
                      </div>
                    </div>
                    
                    {/* Difficulty Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty.toUpperCase()}
                    </div>
                    
                    {/* Progress Status */}
                    {progress.completed && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-green-800 font-semibold text-sm">✅ Completed!</div>
                        <div className="text-green-600 text-xs">Score: {progress.score}/{quiz.questions.length}</div>
                        {progress.claimed && (
                          <div className="text-green-600 text-xs">🎉 Reward Claimed</div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!isLocked && (
                        <Link
                          to="/quiz/$quizId"
                          params={{ quizId: quiz.id }}
                          className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          {progress.completed ? '🔄 Practice Again' : '🚀 Start Quiz'}
                        </Link>
                      )}
                      
                      {progress.canClaim && (
                        <Link
                          to="/quiz/$quizId/claim"
                          params={{ quizId: quiz.id }}
                          className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          💰 Claim {quiz.rewardAmount} TON
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation Section */}
        <div className="text-center mt-16 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
            <h3 className="text-2xl font-bold mb-4">🚀 Why Choose TonTip?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">🧠</div>
                <h4 className="font-bold mb-2">Learn & Grow</h4>
                <p className="text-white/80 text-sm">Expand your knowledge across multiple subjects</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💰</div>
                <h4 className="font-bold mb-2">Earn Crypto</h4>
                <p className="text-white/80 text-sm">Get rewarded in TON cryptocurrency for learning</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <h4 className="font-bold mb-2">Track Progress</h4>
                <p className="text-white/80 text-sm">Monitor your learning journey and achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-8 border-t border-white/20">
        <div className="text-white/60 text-sm">
          Made with ❤️ for TON ecosystem
        </div>
        <Link 
          to="/playground" 
          className="text-white/40 hover:text-white/60 text-xs underline mt-2 inline-block transition-colors"
        >
          playground
        </Link>
      </footer>
    </div>
  );
};