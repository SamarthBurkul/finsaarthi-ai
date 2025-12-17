import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Star, CheckCircle, Play, Award, Lock, Brain, Target, TrendingUp, Medal, Crown } from 'lucide-react';
import { lessons, badges, levels } from '../data/educationData';
import { generateLessonContent, generateQuizQuestions } from '../utils/educationGroq';

const FinancialEducation: React.FC = () => {
  const [activeView, setActiveView] = useState<'lessons' | 'lesson' | 'quiz' | 'test' | 'result' | 'leaderboard' | 'banking-basics'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState({
    completedLessons: [] as number[],
    totalPoints: 0,
    earnedBadges: [] as (string | number)[],
    lessonScores: {} as Record<number, number>
  });

  const getCurrentLevel = () => {
    const userPoints = userProgress.totalPoints;
    return levels.find(level => userPoints >= level.points && userPoints < level.maxPoints) || levels[0];
  };

  const isLessonUnlocked = (lessonId: number) => {
    return true;
  };

  const loadLessonContent = async (lesson: any) => {
    setIsLoading(true);
    setSelectedLesson(lesson);
    setActiveView('lesson');
    
    const content = await generateLessonContent(lesson.title, lesson.keyPoints);
    setLessonContent(content);
    setIsLoading(false);
  };

  const startQuiz = async (isUnitTest: boolean = false) => {
    setIsLoading(true);
    setActiveView(isUnitTest ? 'test' : 'quiz');
    
    const questions = await generateQuizQuestions(selectedLesson.title, selectedLesson.keyPoints, isUnitTest);
    setQuizQuestions(questions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsLoading(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === quizQuestions[currentQuestion].correct) {
      setScore(score + (activeView === 'test' ? 10 : 20));
    }
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const finalScore = selectedAnswer === quizQuestions[currentQuestion].correct ? score + (activeView === 'test' ? 10 : 20) : score;
      const percentage = (finalScore / (quizQuestions.length * (activeView === 'test' ? 10 : 20))) * 100;
      
      setQuizResult({
        score: finalScore,
        percentage: Math.round(percentage),
        totalQuestions: quizQuestions.length,
        correctAnswers: Math.round((finalScore / (activeView === 'test' ? 10 : 20))),
        isTest: activeView === 'test',
        passed: percentage >= 60
      });
      
      if (percentage >= 60) {
        setUserProgress(prev => ({
          ...prev,
          completedLessons: [...prev.completedLessons, selectedLesson.id],
          totalPoints: prev.totalPoints + finalScore,
          lessonScores: { ...prev.lessonScores, [selectedLesson.id]: percentage }
        }));
      }
      
      setActiveView('result');
    }
  };

  const topUsers = [
    { rank: 1, name: 'Priya Sharma', score: 2450, badges: ['Finance Expert', 'Quiz Master', 'Savings Champion'], avatar: '👩💼' },
    { rank: 2, name: 'Rahul Kumar', score: 2380, badges: ['Banking Pro', 'Investment Guru', 'Loan Expert'], avatar: '👨💻' },
    { rank: 3, name: 'Anita Patel', score: 2290, badges: ['Fraud Fighter', 'Smart Saver', 'Insurance Pro'], avatar: '👩🎓' },
    { rank: 4, name: 'Vikash Singh', score: 2150, badges: ['EMI Calculator', 'Budget Master'], avatar: '👨🔧' },
    { rank: 5, name: 'Meera Reddy', score: 2080, badges: ['SIP Specialist', 'Tax Saver'], avatar: '👩⚕️' }
  ];

  const availableBadges = [
    { name: 'Finance Expert', icon: '🏆', description: 'Completed all modules with 90%+ score', rarity: 'Legendary' },
    { name: 'Quiz Master', icon: '🧠', description: 'Scored perfect in 5 consecutive quizzes', rarity: 'Epic' },
    { name: 'Savings Champion', icon: '💰', description: 'Mastered all savings calculations', rarity: 'Rare' },
    { name: 'Banking Pro', icon: '🏦', description: 'Expert in banking fundamentals', rarity: 'Epic' },
    { name: 'Investment Guru', icon: '📈', description: 'Advanced investment knowledge', rarity: 'Legendary' },
    { name: 'Fraud Fighter', icon: '🛡️', description: 'Completed fraud awareness training', rarity: 'Rare' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-purple-500 to-pink-500';
      case 'Epic': return 'from-blue-500 to-purple-500';
      case 'Rare': return 'from-green-500 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-white">#{rank}</span>;
    }
  };

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {topUsers.slice(0, 3).map((user) => (
          <div key={user.rank} className={`bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 text-center ${
            user.rank === 1 ? 'ring-2 ring-emerald-400' : ''
          }`}>
            <div className="relative mb-4">
              <div className="text-4xl mb-2">{user.avatar}</div>
              <div className="absolute -top-2 -right-2">
                {getRankIcon(user.rank)}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-soft-white">{user.name}</h3>
            <div className="text-2xl font-bold text-emerald-400 mb-3">{user.score.toLocaleString()}</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {user.badges.slice(0, 2).map((badge, index) => (
                <span key={index} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-soft-white">
            <Trophy className="w-5 h-5 mr-2 text-emerald-400" />
            Top Learners
          </h3>
          <div className="space-y-3">
            {topUsers.map((user) => (
              <div key={user.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-jet-black transition-colors">
                <div className="flex items-center space-x-3">
                  {getRankIcon(user.rank)}
                  <div className="text-xl">{user.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-soft-white">{user.name}</h4>
                    <div className="text-sm text-white">{user.badges.length} badges</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-emerald-400">{user.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-soft-white">
            <Award className="w-5 h-5 mr-2 text-emerald-400" />
            Available Badges
          </h3>
          <div className="space-y-3">
            {availableBadges.map((badge, index) => (
              <div key={index} className="p-3 border border-slate-gray/30 rounded-lg hover:border-emerald-400 transition-colors bg-jet-black">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm text-soft-white">{badge.name}</h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLessons = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
          Financial <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">Learning Hub</span>
        </h2>
        <p className="text-white font-inter">Master financial concepts through interactive lessons and quizzes</p>
        
        <div className="flex justify-center space-x-4 mt-6">
          <button 
            onClick={() => setActiveView('lessons')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeView === 'lessons' 
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white' 
                : 'border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black'
            }`}
          >
            📚 Lessons
          </button>
          <button 
            onClick={() => setActiveView('banking-basics')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeView === 'banking-basics' 
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white' 
                : 'border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black'
            }`}
          >
            🏦 Banking 101
          </button>
          <button 
            onClick={() => setActiveView('leaderboard')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeView === 'leaderboard' 
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white' 
                : 'border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black'
            }`}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-soft-white font-inter">Your Progress</h3>
            <p className="text-white font-inter">Level: {getCurrentLevel().name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">{userProgress.totalPoints}</div>
            <div className="text-sm text-white">Total Points</div>
          </div>
        </div>
        <div className="w-full bg-jet-black rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((userProgress.totalPoints / getCurrentLevel().maxPoints) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => {
          const isUnlocked = isLessonUnlocked(lesson.id);
          const isCompleted = userProgress.completedLessons.includes(lesson.id);
          
          const getCardColor = (id: number) => {
            const colors = [
              'from-purple-600 to-purple-800', 'from-blue-600 to-blue-800', 'from-green-600 to-green-800',
              'from-orange-600 to-orange-800', 'from-teal-600 to-teal-800', 'from-pink-600 to-pink-800',
              'from-yellow-600 to-yellow-800', 'from-red-600 to-red-800', 'from-indigo-600 to-indigo-800',
              'from-emerald-600 to-emerald-800', 'from-violet-600 to-violet-800', 'from-cyan-600 to-cyan-800',
              'from-rose-600 to-rose-800', 'from-amber-600 to-amber-800', 'from-lime-600 to-lime-800',
              'from-sky-600 to-sky-800', 'from-fuchsia-600 to-fuchsia-800', 'from-slate-600 to-slate-800',
              'from-gray-600 to-gray-800', 'from-zinc-600 to-zinc-800', 'from-neutral-600 to-neutral-800',
              'from-stone-600 to-stone-800', 'from-red-500 to-pink-600', 'from-blue-500 to-purple-600',
              'from-green-500 to-teal-600', 'from-yellow-500 to-orange-600', 'from-purple-500 to-indigo-600',
              'from-pink-500 to-rose-600', 'from-teal-500 to-cyan-600', 'from-orange-500 to-red-600'
            ];
            return colors[(id - 1) % colors.length];
          };
          
          return (
            <div 
              key={lesson.id}
              className={`bg-gradient-to-br ${getCardColor(lesson.id)} rounded-2xl p-6 border border-white/20 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg`}
              onClick={() => isUnlocked && loadLessonContent(lesson)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-400' : isUnlocked ? 'bg-blue-400' : 'bg-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : 
                     isUnlocked ? <BookOpen className="w-4 h-4 text-white" /> : 
                     <Lock className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-white">Lesson {lesson.id}</span>
                </div>
                {isCompleted && (
                  <div className="text-emerald-400 text-sm font-semibold">
                    {userProgress.lessonScores[lesson.id]}%
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-soft-white mb-2 font-inter">{lesson.title}</h3>
              <p className="text-sm text-white font-inter">{lesson.description}</p>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {lesson.keyPoints.slice(0, 3).map((point, index) => (
                  <span key={index} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                    {point}
                  </span>
                ))}
                {lesson.keyPoints.length > 3 && (
                  <span className="text-xs bg-gray-600/20 text-white px-2 py-1 rounded-full">
                    +{lesson.keyPoints.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
          <h3 className="text-xl font-semibold text-soft-white mb-4 flex items-center font-inter">
            <Award className="w-5 h-5 mr-2 text-teal-400" />
            Your Badges
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => {
              const isEarned = userProgress.earnedBadges.includes(badge.id);
              return (
                <div key={badge.id} className={`p-3 rounded-lg border text-center ${
                  isEarned ? 'border-teal-400/30 bg-teal-500/10' : 'border-gray-600/30 opacity-50'
                }`}>
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className={`text-sm font-medium ${isEarned ? 'text-teal-400' : 'text-white'}`}>
                    {badge.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
          <h3 className="text-xl font-semibold text-soft-white mb-4 flex items-center font-inter">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white">Lessons Completed</span>
              <span className="text-soft-white font-semibold">{userProgress.completedLessons.length}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Badges Earned</span>
              <span className="text-soft-white font-semibold">{userProgress.earnedBadges.length}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Current Level</span>
              <span className="text-soft-white font-semibold">{getCurrentLevel().name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLesson = () => (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => setActiveView('lessons')}
        className="mb-6 flex items-center space-x-2 text-emerald-400 hover:text-teal-400 transition-colors"
      >
        <span>← Back to Lessons</span>
      </button>

      <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
        <h2 className="text-3xl font-playfair font-bold text-soft-white mb-4">{selectedLesson?.title}</h2>
        
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
          <h3 className="font-semibold text-emerald-400 mb-2 font-inter">Key Learning Points:</h3>
          <ul className="space-y-1">
            {selectedLesson?.keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex items-center space-x-2 text-soft-white font-inter">
                <Target className="w-4 h-4 text-teal-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-white">AI is generating lesson content...</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none mb-6">
            <div className="bg-jet-black/50 p-6 rounded-lg border border-emerald-500/20">
              <p className="text-soft-white font-inter leading-relaxed whitespace-pre-wrap">{lessonContent}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button 
            onClick={() => startQuiz(false)}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            disabled={isLoading}
          >
            <Brain className="w-4 h-4" />
            <span>Take Mini Quiz (5 Questions)</span>
          </button>
          <button 
            onClick={() => startQuiz(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            disabled={isLoading}
          >
            <Trophy className="w-4 h-4" />
            <span>Take Unit Test (10 Questions)</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-emerald-400 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-white">AI is generating quiz questions...</p>
        </div>
      );
    }

    const question = quizQuestions[currentQuestion];
    if (!question) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-playfair font-bold text-soft-white">
              {activeView === 'test' ? 'Unit Test' : 'Mini Quiz'}
            </h2>
            <div className="text-right">
              <div className="text-sm text-white">Question {currentQuestion + 1} of {quizQuestions.length}</div>
              <div className="text-lg font-semibold text-emerald-400">Score: {score}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-soft-white mb-4 font-inter">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 font-inter ${
                    selectedAnswer === index
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-600 text-soft-white hover:border-emerald-400/50 hover:bg-emerald-500/5'
                  }`}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={nextQuestion}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!quizResult) return null;

    const getResultColor = () => {
      if (quizResult.percentage >= 80) return 'success-green';
      if (quizResult.percentage >= 60) return 'warning-yellow';
      return 'error-red';
    };

    const getResultMessage = () => {
      if (quizResult.percentage >= 80) return 'Excellent! Outstanding performance!';
      if (quizResult.percentage >= 60) return 'Good job! You passed the quiz!';
      return 'Keep learning! Try again to improve.';
    };

    const getResultIcon = () => {
      if (quizResult.percentage >= 80) return '🏆';
      if (quizResult.percentage >= 60) return '✅';
      return '📚';
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">{getResultIcon()}</div>
            <h2 className="text-3xl font-playfair font-bold text-soft-white mb-2">
              {quizResult.isTest ? 'Unit Test' : 'Mini Quiz'} Complete!
            </h2>
            <p className={`text-lg font-inter text-${getResultColor()}`}>
              {getResultMessage()}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg p-4 border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">{quizResult.score}</div>
              <div className="text-sm text-white">Points Earned</div>
            </div>
            <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 rounded-lg p-4 border border-teal-500/20">
              <div className="text-2xl font-bold text-teal-400">{quizResult.percentage}%</div>
              <div className="text-sm text-white">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{quizResult.correctAnswers}/{quizResult.totalQuestions}</div>
              <div className="text-sm text-white">Correct Answers</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-jet-black rounded-full h-4 mb-2">
              <div 
                className="h-4 rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400"
                style={{ width: `${quizResult.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-white">
              {quizResult.passed ? 'Congratulations! You passed!' : 'Score 60% or higher to pass'}
            </p>
          </div>

          {quizResult.passed && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-center space-x-2 text-emerald-400">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Lesson Completed! Points added to your profile.</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4 justify-center">
            <button 
              onClick={() => setActiveView('lessons')}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
            >
              Back to Lessons
            </button>
            {!quizResult.passed && (
              <button 
                onClick={() => startQuiz(quizResult.isTest)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Try Again
              </button>
            )}
            <button 
              onClick={() => setActiveView('lesson')}
              className="border-2 border-emerald-400 text-emerald-400 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-400 hover:text-jet-black transition-all"
            >
              Review Lesson
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {activeView === 'lessons' && renderLessons()}
        {activeView === 'leaderboard' && renderLeaderboard()}
        {activeView === 'banking-basics' && (
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={() => setActiveView('lessons')}
              className="mb-6 flex items-center space-x-2 text-emerald-400 hover:text-teal-400 transition-colors"
            >
              <span>← Back to Learn Hub</span>
            </button>
            
            <div className="space-y-8">
              <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
                <h2 className="text-3xl font-playfair font-bold text-soft-white mb-6 text-center">Banking 101 - Complete Guide</h2>
                
                {/* What is Banking */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-emerald-400 mb-4">🏦 What is Banking?</h3>
                  <div className="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20">
                    <p className="text-white leading-relaxed mb-4">
                      A bank is a financial institution that accepts deposits, provides loans, and offers various financial services. Banks act as intermediaries between people who have money (depositors) and people who need money (borrowers).
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-emerald-500/5 rounded-lg">
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className="font-semibold text-emerald-400">Accept Deposits</h4>
                        <p className="text-sm text-white">Keep your money safe</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-500/5 rounded-lg">
                        <div className="text-2xl mb-2">🏠</div>
                        <h4 className="font-semibold text-emerald-400">Provide Loans</h4>
                        <p className="text-sm text-white">Help buy homes, cars</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-500/5 rounded-lg">
                        <div className="text-2xl mb-2">💳</div>
                        <h4 className="font-semibold text-emerald-400">Financial Services</h4>
                        <p className="text-sm text-white">Cards, transfers, more</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Types of Bank Accounts */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-teal-400 mb-4">💼 Types of Bank Accounts</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-teal-500/10 p-6 rounded-xl border border-teal-500/20">
                      <h4 className="text-xl font-semibold text-teal-400 mb-3">💵 Savings Account</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• For saving money and earning interest</li>
                        <li>• Usually 3-4% annual interest</li>
                        <li>• Limited free transactions per month</li>
                        <li>• Minimum balance required (₹1,000-₹10,000)</li>
                        <li>• Best for: Regular people, students</li>
                      </ul>
                    </div>
                    <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                      <h4 className="text-xl font-semibold text-blue-400 mb-3">💼 Current Account</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• For business and frequent transactions</li>
                        <li>• No interest earned</li>
                        <li>• Unlimited transactions</li>
                        <li>• Higher minimum balance (₹25,000+)</li>
                        <li>• Best for: Business owners, companies</li>
                      </ul>
                    </div>
                    <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
                      <h4 className="text-xl font-semibold text-purple-400 mb-3">📈 Fixed Deposit (FD)</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• Lock money for fixed period</li>
                        <li>• Higher interest (5-7% annually)</li>
                        <li>• Cannot withdraw before maturity</li>
                        <li>• Penalty for early withdrawal</li>
                        <li>• Best for: Long-term savings</li>
                      </ul>
                    </div>
                    <div className="bg-orange-500/10 p-6 rounded-xl border border-orange-500/20">
                      <h4 className="text-xl font-semibold text-orange-400 mb-3">🔁 Recurring Deposit (RD)</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• Save fixed amount monthly</li>
                        <li>• Similar interest to FD</li>
                        <li>• Builds saving discipline</li>
                        <li>• Flexible monthly amounts</li>
                        <li>• Best for: Regular savers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Opening Bank Account */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-blue-400 mb-4">📋 How to Open Bank Account</h3>
                  <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">Required Documents</h4>
                        <ul className="space-y-2 text-white text-sm">
                          <li>• <strong>Identity Proof:</strong> Aadhaar, PAN, Passport, Voter ID</li>
                          <li>• <strong>Address Proof:</strong> Aadhaar, Utility bill, Rent agreement</li>
                          <li>• <strong>Income Proof:</strong> Salary slip, ITR (for some accounts)</li>
                          <li>• <strong>Photos:</strong> 2-3 passport size photos</li>
                          <li>• <strong>Initial Deposit:</strong> As per bank requirement</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">Simple Steps</h4>
                        <ol className="space-y-2 text-white text-sm">
                          <li><strong>1.</strong> Choose the right bank and account type</li>
                          <li><strong>2.</strong> Visit branch or apply online</li>
                          <li><strong>3.</strong> Fill account opening form</li>
                          <li><strong>4.</strong> Submit documents and photos</li>
                          <li><strong>5.</strong> Make initial deposit</li>
                          <li><strong>6.</strong> Get account number and debit card</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards and Digital Banking */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-purple-400 mb-4">💳 Cards & Digital Banking</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
                      <h4 className="text-lg font-semibold text-purple-400 mb-3">💳 Debit Card</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• Uses your own money</li>
                        <li>• Withdraw cash from ATM</li>
                        <li>• Shop online and offline</li>
                        <li>• No interest charges</li>
                        <li>• Daily withdrawal limits</li>
                      </ul>
                    </div>
                    <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                      <h4 className="text-lg font-semibold text-red-400 mb-3">💳 Credit Card</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• Uses bank's money (loan)</li>
                        <li>• Pay back within 45 days</li>
                        <li>• High interest if not paid</li>
                        <li>• Builds credit history</li>
                        <li>• Rewards and cashback</li>
                      </ul>
                    </div>
                    <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                      <h4 className="text-lg font-semibold text-green-400 mb-3">📱 UPI & Digital</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• Instant money transfer</li>
                        <li>• Pay using phone number</li>
                        <li>• QR code payments</li>
                        <li>• 24/7 availability</li>
                        <li>• Free or very low charges</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Interest and Loans */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-yellow-400 mb-4">💰 Interest & Loans Basics</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/20">
                      <h4 className="text-lg font-semibold text-yellow-400 mb-3">Understanding Interest</h4>
                      <div className="space-y-3 text-white text-sm">
                        <p><strong>Simple Interest:</strong> Calculated only on principal amount</p>
                        <p><strong>Compound Interest:</strong> Interest on interest (grows faster)</p>
                        <p><strong>Annual Percentage Rate (APR):</strong> Total yearly cost of loan</p>
                        <div className="bg-yellow-500/5 p-3 rounded-lg">
                          <p className="text-yellow-300"><strong>Example:</strong> ₹1,00,000 at 10% for 1 year = ₹10,000 interest</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                      <h4 className="text-lg font-semibold text-red-400 mb-3">Common Loan Types</h4>
                      <ul className="space-y-2 text-white text-sm">
                        <li>• <strong>Home Loan:</strong> 7-9% interest, 15-30 years</li>
                        <li>• <strong>Car Loan:</strong> 8-12% interest, 3-7 years</li>
                        <li>• <strong>Personal Loan:</strong> 11-18% interest, 1-5 years</li>
                        <li>• <strong>Education Loan:</strong> 8-12% interest, 5-15 years</li>
                        <li>• <strong>Business Loan:</strong> 10-15% interest, varies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-red-400 mb-4">🔒 Banking Safety Tips</h3>
                  <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-red-400 mb-3">ATM Safety</h4>
                        <ul className="space-y-2 text-white text-sm">
                          <li>• Cover PIN while entering</li>
                          <li>• Check for suspicious devices</li>
                          <li>• Don't accept help from strangers</li>
                          <li>• Take receipt and check balance</li>
                          <li>• Report lost cards immediately</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-red-400 mb-3">Online Banking Safety</h4>
                        <ul className="space-y-2 text-white text-sm">
                          <li>• Never share OTP with anyone</li>
                          <li>• Always logout after use</li>
                          <li>• Use strong passwords</li>
                          <li>• Check bank statements regularly</li>
                          <li>• Beware of phishing emails/SMS</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Terms */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-cyan-400 mb-4">📚 Important Banking Terms</h3>
                  <div className="bg-cyan-500/10 p-6 rounded-xl border border-cyan-500/20">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-cyan-400">IFSC Code</h5>
                          <p className="text-white text-sm">11-digit code to identify bank branch for transfers</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-cyan-400">NEFT/RTGS</h5>
                          <p className="text-white text-sm">Electronic money transfer methods between banks</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-cyan-400">EMI</h5>
                          <p className="text-white text-sm">Equal Monthly Installment for loan repayment</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-cyan-400">KYC</h5>
                          <p className="text-white text-sm">Know Your Customer - identity verification process</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-cyan-400">CIBIL Score</h5>
                          <p className="text-white text-sm">Credit score (300-900) showing loan repayment history</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-cyan-400">Overdraft</h5>
                          <p className="text-white text-sm">Withdraw more money than account balance (with charges)</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-cyan-400">Nominee</h5>
                          <p className="text-white text-sm">Person who gets your money if something happens to you</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-cyan-400">Cheque</h5>
                          <p className="text-white text-sm">Written instruction to bank to pay specific amount</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/20">
                  <h3 className="text-xl font-semibold text-emerald-400 mb-4">💡 Quick Banking Tips for Beginners</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-emerald-400">Choose Right Bank</h5>
                      <ul className="text-white text-sm space-y-1">
                        <li>• Check branch locations</li>
                        <li>• Compare charges and fees</li>
                        <li>• Look at digital services</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-emerald-400">Maintain Good Habits</h5>
                      <ul className="text-white text-sm space-y-1">
                        <li>• Keep minimum balance</li>
                        <li>• Pay EMIs on time</li>
                        <li>• Check statements monthly</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-emerald-400">Build Credit History</h5>
                      <ul className="text-white text-sm space-y-1">
                        <li>• Use credit card responsibly</li>
                        <li>• Pay bills on time</li>
                        <li>• Avoid multiple loan applications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeView === 'lesson' && renderLesson()}
        {(activeView === 'quiz' || activeView === 'test') && renderQuiz()}
        {activeView === 'result' && renderResult()}
      </div>
    </section>
  );
};

export default FinancialEducation;