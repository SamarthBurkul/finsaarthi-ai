import React from 'react';
import { Trophy, Medal, Star, Crown, Award, TrendingUp } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const topUsers = [
    { rank: 1, name: 'Priya Sharma', score: 2450, badges: ['Finance Expert', 'Quiz Master', 'Savings Champion'], avatar: '👩‍💼' },
    { rank: 2, name: 'Rahul Kumar', score: 2380, badges: ['Banking Pro', 'Investment Guru', 'Loan Expert'], avatar: '👨‍💻' },
    { rank: 3, name: 'Anita Patel', score: 2290, badges: ['Fraud Fighter', 'Smart Saver', 'Insurance Pro'], avatar: '👩‍🎓' },
    { rank: 4, name: 'Vikash Singh', score: 2150, badges: ['EMI Calculator', 'Budget Master'], avatar: '👨‍🔧' },
    { rank: 5, name: 'Meera Reddy', score: 2080, badges: ['SIP Specialist', 'Tax Saver'], avatar: '👩‍⚕️' },
    { rank: 6, name: 'Arjun Gupta', score: 1950, badges: ['Banking Basics', 'Loan Advisor'], avatar: '👨‍🎓' },
    { rank: 7, name: 'Sunita Joshi', score: 1890, badges: ['Insurance Expert', 'Risk Manager'], avatar: '👩‍🏫' },
    { rank: 8, name: 'Kiran Mehta', score: 1820, badges: ['Investment Beginner', 'Savings Pro'], avatar: '👨‍💼' },
    { rank: 9, name: 'Deepika Roy', score: 1750, badges: ['Quiz Champion', 'Finance Learner'], avatar: '👩‍🔬' },
    { rank: 10, name: 'Amit Verma', score: 1680, badges: ['Banking Student', 'Calculator Pro'], avatar: '👨‍🎨' }
  ];

  const badges = [
    { name: 'Finance Expert', icon: '🏆', description: 'Completed all modules with 90%+ score', rarity: 'Legendary' },
    { name: 'Quiz Master', icon: '🧠', description: 'Scored perfect in 5 consecutive quizzes', rarity: 'Epic' },
    { name: 'Savings Champion', icon: '💰', description: 'Mastered all savings calculations', rarity: 'Rare' },
    { name: 'Banking Pro', icon: '🏦', description: 'Expert in banking fundamentals', rarity: 'Epic' },
    { name: 'Investment Guru', icon: '📈', description: 'Advanced investment knowledge', rarity: 'Legendary' },
    { name: 'Fraud Fighter', icon: '🛡️', description: 'Completed fraud awareness training', rarity: 'Rare' },
    { name: 'EMI Calculator', icon: '🧮', description: 'Used EMI calculator 50+ times', rarity: 'Common' },
    { name: 'SIP Specialist', icon: '📊', description: 'SIP calculation expert', rarity: 'Rare' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-white">#{rank}</span>;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-purple-500 to-pink-500';
      case 'Epic': return 'from-blue-500 to-purple-500';
      case 'Rare': return 'from-green-500 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-ubuntu font-bold text-soft-white mb-4">
            Finance Champions <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">Leaderboard</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Compete with other learners, earn badges, and climb the leaderboard by mastering financial concepts!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {topUsers.slice(0, 3).map((user) => (
              <div key={user.rank} className={`bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 text-center ${
                user.rank === 1 ? 'ring-4 ring-emerald-400 transform scale-105' : ''
              }`}>
                <div className="relative mb-4">
                  <div className="text-6xl mb-2">{user.avatar}</div>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(user.rank)}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-soft-white">{user.name}</h3>
                <div className="text-3xl font-bold text-emerald-400 mb-4">{user.score.toLocaleString()}</div>
                
                <div className="flex flex-wrap gap-1 justify-center">
                  {user.badges.slice(0, 2).map((badge, index) => (
                    <span key={index} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                      {badge}
                    </span>
                  ))}
                  {user.badges.length > 2 && (
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      +{user.badges.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Full Leaderboard */}
            <div className="lg:col-span-2">
              <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
                <h3 className="text-2xl font-semibold mb-6 flex items-center text-soft-white">
                  <Trophy className="w-6 h-6 mr-2 text-emerald-400" />
                  Top Finance Learners
                </h3>
                
                <div className="space-y-3">
                  {topUsers.map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:bg-jet-black ${
                      user.rank <= 3 ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10' : ''
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(user.rank)}
                        </div>
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <h4 className="font-semibold text-soft-white">{user.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-white">
                            <Star className="w-4 h-4" />
                            <span>{user.badges.length} badges earned</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400">{user.score.toLocaleString()}</div>
                        <div className="text-sm text-white">points</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300">
                    View Full Leaderboard
                  </button>
                </div>
              </div>
            </div>

            {/* Badges Collection */}
            <div className="lg:col-span-1">
              <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
                <h3 className="text-xl font-semibold mb-6 flex items-center text-soft-white">
                  <Award className="w-5 h-5 mr-2 text-emerald-400" />
                  Available Badges
                </h3>
                
                <div className="space-y-3">
                  {badges.map((badge, index) => (
                    <div key={index} className="p-3 border border-slate-gray/30 rounded-lg hover:border-emerald-400 transition-colors duration-300 bg-jet-black">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{badge.icon}</span>
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

              {/* Your Progress */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl p-8 border border-emerald-500/20 mt-6 text-white">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                  Your Progress
                </h3>
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">👤</div>
                  <div className="text-2xl font-bold text-emerald-400">850</div>
                  <div className="text-sm text-white">Your Score</div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Current Rank</span>
                    <span className="text-emerald-400 font-semibold">#47</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Badges Earned</span>
                    <span className="text-emerald-400 font-semibold">3/8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Badge</span>
                    <span className="text-emerald-400 font-semibold">150 pts</span>
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full">
                  Take Quiz to Earn Points
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;