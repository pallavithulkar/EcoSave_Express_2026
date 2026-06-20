import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Share2, 
  HelpCircle, 
  Check, 
  Info,
  Medal,
  Coins,
  ChevronRight,
  Sparkles,
  Copy
} from 'lucide-react';

export default function RewardsCenter({ stats, profile, bills, travelLogs, streakLogs }) {
  const [shareStatus, setShareStatus] = useState('');

  const rupeeSavings = stats.totalSavingsRupees || 0;
  const co2Saved = stats.totalCO2SavedKg || 0;
  const ecoScore = stats.ecoScore || 45;
  const ecoCoins = stats.totalEcoCoins || 0;
  const streakDays = stats.currentStreak || 0;
  const leaderboard = stats.leaderboard || [];

  // Achievements Definition with Dynamic Lock/Unlock Conditions
  const achievements = [
    {
      id: 'first_checkin',
      title: 'Eco Seedling',
      description: 'Logged your first daily utility check-in.',
      icon: '🌱',
      color: 'from-green-600/30 to-emerald-600/30 border-brand-emerald text-brand-emerald',
      isUnlocked: streakLogs.length > 0
    },
    {
      id: 'first_bill',
      title: 'Utility Auditor',
      description: 'Scanned your first electricity bill for waste.',
      icon: '⚡',
      color: 'from-yellow-600/30 to-amber-600/30 border-brand-gold text-brand-gold',
      isUnlocked: bills.length > 0
    },
    {
      id: 'first_travel',
      title: 'Transit Pioneer',
      description: 'Logged a low-carbon journey option.',
      icon: '🚇',
      color: 'from-blue-600/30 to-indigo-600/30 border-brand-blue text-brand-blue',
      isUnlocked: travelLogs.length > 0
    },
    {
      id: 'water_guard',
      title: 'Water Guardian',
      description: 'Completed a water conservation check-in.',
      icon: '💧',
      color: 'from-cyan-600/30 to-teal-600/30 border-cyan-400 text-cyan-400',
      isUnlocked: streakLogs.some(log => log.waterCheck)
    },
    {
      id: 'streak_3',
      title: 'Streak Master',
      description: 'Maintained a 3-day consecutive log streak.',
      icon: '🔥',
      color: 'from-orange-600/30 to-red-600/30 border-orange-400 text-orange-400',
      isUnlocked: streakDays >= 3
    },
    {
      id: 'saving_1000',
      title: 'Eco Champion',
      description: 'Accumulated over ₹1,000 in monthly savings.',
      icon: '👑',
      color: 'from-purple-600/30 to-fuchsia-600/30 border-purple-400 text-purple-400',
      isUnlocked: rupeeSavings >= 1000
    }
  ];

  // Dynamic share text creation
  const shareText = `Aapka parivaar carbon bachat me aage hai! Main EcoSave Express use kar raha hoon or is mahine ₹${rupeeSavings} aur ${co2Saved}kg CO2 save kiya hai! Mera EcoScore ${ecoScore} hai. Aap bhi check karein or monthly bills bachaen!`;

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EcoSave Express Impact Card',
          text: shareText,
          url: window.location.origin
        });
        setShareStatus('Shared successfully!');
        setTimeout(() => setShareStatus(''), 3000);
      } catch (err) {
        console.error('Web Share failed:', err);
      }
    } else {
      // Fallback copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Text copied to clipboard!');
        setTimeout(() => setShareStatus(''), 3000);
      } catch (err) {
        setShareStatus('Failed to copy.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
          <Trophy className="w-6 h-6 text-brand-gold" />
          Rewards Center & Leaderboard
        </h2>
        <p className="text-gray-400 text-sm">
          Redeem EcoCoins, complete milestones to unlock digital badges, and compare your household efficiency percentile live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: CHAMPION CARD & LEADERBOARD (col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PREMIUM VIOLET/PURPLE REWARDS CARD */}
          <div className="glow-card rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-[#2D124D] via-[#1A0E36] to-[#0D0722] border border-[#6B21A8]/40 text-white shadow-xl shadow-[#2D124D]/10">
            {/* Subtle background radial light pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Split layout: Badge on Left, Stats on Right */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              
              {/* Left Column: Big Glowing Crest Badge */}
              <div className="flex flex-col items-center flex-shrink-0 text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#6D28D9]/50 border-2 border-[#A78BFA] flex flex-col items-center justify-center shadow-lg shadow-[#8B5CF6]/20 relative animate-pulse">
                  <div className="text-3xl drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">🏆</div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest mt-1 font-display">Eco Champion</span>
                  <span className="text-[8px] text-purple-300 font-extrabold tracking-wider mt-0.5">TOP 12% OF USERS</span>
                </div>
              </div>

              {/* Right Column: Detailed metrics grid */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                    ⭐ Your Rewards Snapshot
                  </span>
                  <p className="text-[11px] text-gray-300 mt-2 font-medium">
                    Leaderboard Position: <strong>#{stats.leaderboardRank || 'N/A'}</strong> out of {leaderboard.length || 6} users in Mumbai.
                  </p>
                </div>

                {/* Grid of 4 quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/35 border border-purple-500/10">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Total Savings</span>
                    <span className="text-base font-black text-brand-emerald font-display">₹{rupeeSavings}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/35 border border-purple-500/10">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">EcoCoins</span>
                    <span className="text-base font-black text-brand-gold font-display">🪙 {ecoCoins}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/35 border border-purple-500/10">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">EcoScore</span>
                    <span className="text-base font-black text-[#A78BFA] font-display">✨ {ecoScore}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/35 border border-purple-500/10">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Eco Streak</span>
                    <span className="text-base font-black text-orange-400 font-display">🔥 {streakDays} Days</span>
                  </div>
                </div>

                {/* Share/Web API interaction block */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-purple-500/10">
                  <button
                    type="button"
                    onClick={handleShareClick}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-md shadow-[#8B5CF6]/20"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Achievements
                  </button>
                  {shareStatus && (
                    <span className="text-xs text-brand-emerald font-semibold animate-pulse">{shareStatus}</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* REAL LIVE LEADERBOARD */}
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display mb-3 flex items-center gap-2">
              <Medal className="w-4 h-4 text-brand-gold" />
              Community Leaderboard
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border/40 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 pl-2">Rank</th>
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">City</th>
                    <th className="py-2.5 text-center">EcoScore</th>
                    <th className="py-2.5 text-center">Total Savings</th>
                    <th className="py-2.5 text-right pr-2">EcoCoins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20 text-gray-300">
                  {leaderboard.map((user, idx) => {
                    const isCurrentUser = user.name === profile?.name;
                    return (
                      <tr 
                        key={idx} 
                        className={`transition-colors ${
                          isCurrentUser 
                            ? 'bg-brand-emerald/10 text-brand-emerald font-bold border-l-4 border-brand-emerald' 
                            : 'hover:bg-brand-card/30'
                        }`}
                      >
                        <td className="py-3 pl-2.5 font-bold">
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                        </td>
                        <td className={`py-3 font-semibold ${isCurrentUser ? 'text-brand-emerald' : 'text-white'}`}>
                          {user.name} {isCurrentUser && '(You)'}
                        </td>
                        <td className="py-3 text-gray-400">{user.city}</td>
                        <td className="py-3 text-center text-white font-display font-bold">{user.ecoScore}</td>
                        <td className="py-3 text-center text-brand-emerald font-bold">₹{user.savings}</td>
                        <td className="py-3 text-right pr-2.5 font-bold text-brand-gold">🪙 {user.ecoCoins}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REWARD COIN FORMULA & MILESTONES GRID (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* COMMENTED FORMULA TRANSPARENT DETAILS */}
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display mb-1 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-brand-gold" />
              EcoCoin Distribution Formula
            </h3>
            <span className="text-[10px] text-gray-400">Our rewards are calculated transparently with a clear algorithm:</span>

            {/* Commented formula box */}
            <div className="bg-brand-dark-bg/60 border border-brand-border rounded-xl p-3.5 mt-3 space-y-2 font-mono text-[10px]">
              <span className="text-gray-500 block">/* EcoCoins calculation logic */</span>
              <div className="text-gray-300">
                <span className="text-brand-gold font-bold">EcoCoins</span> = 
                Math.floor(<span className="text-brand-emerald">rupeeSavings</span> / 10) + 
                (<span className="text-brand-emerald">streakDays</span> * 15) + 
                (<span className="text-brand-emerald">totalCheckIns</span> * 5)
              </div>
              <div className="text-gray-400 border-t border-brand-border/40 pt-2 text-[9px] leading-relaxed">
                📍 <strong>Example:</strong> Saving ₹800 on utilities with a 5-day check-in streak yields 80 + 75 + 25 = 180 EcoCoins!
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS GRID */}
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-emerald" />
              Digital Milestones
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ach.isUnlocked 
                      ? `bg-gradient-to-r ${ach.color}` 
                      : 'bg-brand-dark-bg/40 border-brand-border text-gray-500 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-brand-card/80 border ${
                    ach.isUnlocked ? 'border-brand-emerald/40' : 'border-brand-border'
                  }`}>
                    {ach.isUnlocked ? ach.icon : '🔒'}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${ach.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {ach.title}
                    </span>
                    <span className="text-[9px] text-gray-400 leading-normal block mt-0.5">
                      {ach.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
