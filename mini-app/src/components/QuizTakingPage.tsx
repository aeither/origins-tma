import React, { useState, useEffect } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { Link } from "@tanstack/react-router";
import { getQuizById } from "../data/quizzes";
import type { Quiz, QuizResult, UserQuizProgress } from "../types/quiz";

interface QuizTakingPageProps {
  quizId: string;
}

export const QuizTakingPage: React.FC<QuizTakingPageProps> = ({ quizId }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const foundQuiz = getQuizById(quizId);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      setSelectedAnswers(new Array(foundQuiz.questions.length).fill(-1));
      setTimeLeft(foundQuiz.estimatedTime * 60); // Convert minutes to seconds
    }
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleQuizSubmit();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setSelectedAnswers(newAnswers);
    setSelectedAnswer(null);
    setShowExplanation(false);

    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizSubmit(newAnswers);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(selectedAnswers[currentQuestionIndex - 1]);
      setShowExplanation(false);
    }
  };

  const handleQuizSubmit = (finalAnswers?: number[]) => {
    if (!quiz) return;

    const answers = finalAnswers || selectedAnswers;
    let correctCount = 0;
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setQuizCompleted(true);

    // Save quiz result
    const result: QuizResult = {
      quizId: quiz.id,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      completedAt: new Date(),
      earnedReward: correctCount === quiz.questions.length ? quiz.rewardAmount : 0,
      answers
    };

    // Update user progress
    const existingProgress = localStorage.getItem('quiz-progress');
    const progress: Record<string, UserQuizProgress> = existingProgress ? JSON.parse(existingProgress) : {};
    
    const userProgress: UserQuizProgress = progress[quiz.id] || {
      quizId: quiz.id,
      completed: false,
      bestScore: 0,
      attempts: 0,
      rewardClaimed: false
    };

    userProgress.attempts += 1;
    userProgress.bestScore = Math.max(userProgress.bestScore, correctCount);
    userProgress.completed = correctCount === quiz.questions.length;
    userProgress.lastAttempt = new Date();

    progress[quiz.id] = userProgress;
    localStorage.setItem('quiz-progress', JSON.stringify(progress));

    // Save quiz result
    const existingResults = localStorage.getItem('quiz-results');
    const results: QuizResult[] = existingResults ? JSON.parse(existingResults) : [];
    results.push(result);
    localStorage.setItem('quiz-results', JSON.stringify(results));
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz!.questions.length).fill(-1));
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(quiz!.estimatedTime * 60);
    setQuizStarted(false);
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#282c34] text-white p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isPerfectScore = score === quiz.questions.length;

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#58cc02] to-[#37a500] text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link to="/" className="text-white/80 hover:text-white text-sm flex items-center gap-2">
              ← Back to Home
            </Link>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-white/50">
            <div className="text-6xl mb-4">{quiz.icon}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
            <p className="text-gray-600 mb-6">{quiz.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
                <div className="text-sm text-blue-500">Questions</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{quiz.estimatedTime}</div>
                <div className="text-sm text-green-500">Minutes</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-center gap-2 text-purple-600 text-lg font-semibold">
                  <span>💎</span>
                  <span>Reward: {quiz.rewardAmount} TON</span>
                </div>
                <p className="text-sm text-purple-500 mt-2">
                  Complete all questions correctly to earn the full reward!
                </p>
              </div>
            </div>

            <div className="mb-6">
              <TonConnectButton />
            </div>

            <button
              onClick={startQuiz}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚀 Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#58cc02] to-[#37a500] text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-white/50">
            <div className="text-6xl mb-4">
              {isPerfectScore ? "🏆" : score >= quiz.questions.length * 0.7 ? "🎉" : "📚"}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {isPerfectScore ? "Perfect Score!" : "Quiz Completed!"}
            </h1>
            
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {score}/{quiz.questions.length}
              </div>
              <div className="text-blue-500">Correct Answers</div>
              <div className="text-lg text-blue-600 mt-2 font-semibold">
                {Math.round((score / quiz.questions.length) * 100)}% Score
              </div>
            </div>

            {isPerfectScore && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                <div className="text-purple-600 font-bold text-lg mb-2">🎊 Congratulations!</div>
                <div className="text-purple-700 mb-4">
                  You earned {quiz.rewardAmount} TON for perfect completion!
                </div>
                <Link
                  to="/quiz/$quizId/claim"
                  params={{ quizId: quiz.id }}
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  💰 Claim Reward
                </Link>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={restartQuiz}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                🔄 Try Again
              </button>
              <Link
                to="/"
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                🏠 Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#58cc02] to-[#37a500] text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with progress */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
            <div className="text-lg font-mono text-gray-700">
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-xl border border-white/50">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{currentQuestion.question}</h2>
          
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                  selectedAnswer === index
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                    selectedAnswer === index
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`${
                    selectedAnswer === index 
                      ? 'text-green-800 font-semibold' 
                      : 'text-gray-700'
                  }`}>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {showExplanation && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
              <div className="text-blue-400 font-semibold mb-2">Explanation:</div>
              <div className="text-gray-300">{currentQuestion.explanation}</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            ← Previous
          </button>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            disabled={selectedAnswer === null}
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            {showExplanation ? "🙈 Hide" : "💡 Show"} Explanation
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? "🏁 Finish Quiz" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};