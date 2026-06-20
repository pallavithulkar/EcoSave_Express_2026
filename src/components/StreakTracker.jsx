import React, { useState } from 'react';
import { 
  Flame, 
  Check, 
  Calendar, 
  Zap, 
  Droplets, 
  Car,
  AlertCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export default function StreakTracker({ streakLogs, stats, onCheckIn }) {
  const [elecCheck, setElecCheck] = useState(false);
  const [waterCheck, setWaterCheck] = useState(false);
  const [travelCheck, setTravelCheck] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const streakDays = stats.currentStreak || 0;

  // SVG math for streak circular ring (circumference for radius=32, stroke=6, circumference ~ 201)
  const radius = 32;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Let's cap the visual progress ring at a 7-day week
  const visualGoalDays = 7;
  const progressPercent = Math.min(100, (streakDays / visualGoalDays) * 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Build the past 7 days check-in history strip
  const getPastSevenDays = () => {
    const days = [];
    const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const logsMap = new Map(streakLogs.map(log => [log.date, log]));

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dateNames[d.getDay()];
      const dayOfMonth = d.getDate();
      
      const log = logsMap.get(dateStr);
      days.push({
        dateStr,
        dayName,
        dayOfMonth,
        hasCheckedIn: !!log,
        logDetails: log
      });
    }
    return days;
  };

  const pastSevenDays = getPastSevenDays();

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch('/api/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          electricityCheck: elecCheck,
          waterCheck: waterCheck,
          travelCheck: travelCheck
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Check-in failed');
      }

      const data = await res.json();
      onCheckIn(data); // update state in App.jsx
      
      setSuccess(true);
      // Reset form checks
      setElecCheck(false);
      setWaterCheck(false);
      setTravelCheck(false);
      
      // Clear success banner after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
          <Flame className="w-6 h-6 text-brand-emerald animate-pulse" />
          Daily Eco Streak Tracker
        </h2>
        <p className="text-gray-400 text-sm">
          Log daily conservation habits. Streaks are calculated live based on consecutively logged days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: DAILY HABITS LOGGING FORM (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display border-b border-brand-border/40 pb-3 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-emerald" />
              Today's Carbon Check-in
            </h3>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Select habits completed today:</span>

              {/* Electricity choice checkbox */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                elecCheck 
                  ? 'bg-brand-emerald/10 border-brand-emerald text-white' 
                  : 'bg-brand-dark-bg/60 border-brand-border text-gray-400 hover:border-brand-border-glow'
              }`}>
                <input 
                  type="checkbox"
                  checked={elecCheck}
                  onChange={(e) => setElecCheck(e.target.checked)}
                  className="mt-0.5 rounded border-gray-600 bg-brand-dark-bg text-brand-emerald focus:ring-brand-emerald"
                />
                <div>
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-brand-emerald" /> Electricity Conservation
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 leading-normal">
                    Turned off standby appliances at wall plug, set AC to 24°C+, or avoided high-load appliances during peak hours.
                  </span>
                </div>
              </label>

              {/* Water choice checkbox */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                waterCheck 
                  ? 'bg-brand-gold/15 border-brand-gold text-white' 
                  : 'bg-brand-dark-bg/60 border-brand-border text-gray-400 hover:border-brand-border-glow'
              }`}>
                <input 
                  type="checkbox"
                  checked={waterCheck}
                  onChange={(e) => setWaterCheck(e.target.checked)}
                  className="mt-0.5 rounded border-gray-600 bg-brand-dark-bg text-brand-gold focus:ring-brand-gold"
                />
                <div>
                  <span className="text-xs font-bold flex items-center gap-1 text-brand-gold">
                    <Droplets className="w-3.5 h-3.5" /> Water Efficiency (Saves ₹30)
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 leading-normal">
                    Took a short shower (&lt; 5 mins), reused RO waste water for plants, or verified no faucets were leaking.
                  </span>
                </div>
              </label>

              {/* Travel choice checkbox */}
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                travelCheck 
                  ? 'bg-brand-blue/15 border-brand-blue text-white' 
                  : 'bg-brand-dark-bg/60 border-brand-border text-gray-400 hover:border-brand-border-glow'
              }`}>
                <input 
                  type="checkbox"
                  checked={travelCheck}
                  onChange={(e) => setTravelCheck(e.target.checked)}
                  className="mt-0.5 rounded border-gray-600 bg-brand-dark-bg text-brand-blue focus:ring-brand-blue"
                />
                <div>
                  <span className="text-xs font-bold flex items-center gap-1 text-brand-blue">
                    <Car className="w-3.5 h-3.5" /> Sustainable Transit Shift
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 leading-normal">
                    Took local public transport (Metro/Bus), carpooled, walked/cycled for short trips, or did not use fuel.
                  </span>
                </div>
              </label>

              {error && (
                <div className="flex gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex gap-2 p-3 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-semibold">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Check-in saved! Your streak and EcoScore have been updated.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!elecCheck && !waterCheck && !travelCheck)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-display flex items-center justify-center gap-2 transition-all ${
                  isLoading || (!elecCheck && !waterCheck && !travelCheck)
                    ? 'bg-brand-border text-gray-500 cursor-not-allowed'
                    : 'bg-brand-emerald text-brand-dark-bg hover:bg-brand-emerald-hover hover:scale-[1.01]'
                }`}
              >
                {isLoading ? 'Saving check-in...' : 'Submit Today\'s Habits'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: CIRCULAR STREAK AND WEEK STRIP (col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* STREAK CIRCULAR RING CARD */}
          <div className="glow-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Visual Circular Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  className="text-brand-border"
                  strokeWidth={stroke}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={56}
                  cy={56}
                />
                <circle
                  className="text-brand-emerald transition-all duration-700 ease-out"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={56}
                  cy={56}
                />
              </svg>
              <div className="absolute text-center">
                <Flame className="w-6 h-6 text-brand-emerald mx-auto animate-pulse" />
                <span className="text-xl font-black text-white font-display block leading-none mt-1">
                  {streakDays}
                </span>
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                  Day Streak
                </span>
              </div>
            </div>

            {/* Streak metrics description */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h3 className="text-sm font-bold text-white font-display">Streak Milestones</h3>
              <p className="text-xs text-gray-400 leading-normal">
                Check in daily to build your streak. Active streaks multiply your daily EcoCoins. 
                Our current goal is a <strong className="text-brand-emerald">7-day run</strong>.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-brand-dark-bg/60 border border-brand-border text-center">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Multiplier</span>
                  <span className="text-sm font-bold text-brand-emerald">
                    {streakDays >= 7 ? '2.0x Coins' : streakDays >= 3 ? '1.5x Coins' : '1.0x Base'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-dark-bg/60 border border-brand-border text-center">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Bonus Points</span>
                  <span className="text-sm font-bold text-brand-blue">
                    +{streakDays * 15} EcoCoins
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* WEEK STRIP TRACKER (No guilt-based red states!) */}
          <div className="glow-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white font-display">Weekly Log Overview</h3>
              <span className="text-[10px] text-gray-400">Showing last 7 days</span>
            </div>

            {/* 7-Day Horizontal Strip */}
            <div className="grid grid-cols-7 gap-2">
              {pastSevenDays.map((day, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-colors ${
                    day.hasCheckedIn 
                      ? 'bg-brand-emerald/10 border-brand-emerald text-brand-emerald' 
                      : 'bg-brand-dark-bg/30 border-brand-border text-gray-500' // NEUTRAL/MUTED styling for missed days (NO RED)
                  }`}
                >
                  <span className="text-[10px] font-medium tracking-wide">{day.dayName}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-display text-xs my-2.5 border transition-all ${
                    day.hasCheckedIn 
                      ? 'bg-brand-emerald text-brand-dark-bg border-brand-emerald shadow-glow-emerald scale-[1.05]' 
                      : 'bg-transparent border-brand-border/60 text-gray-500' // Missed days show neutral/muted outlines
                  }`}>
                    {day.dayOfMonth}
                  </div>
                  <span className="text-[8px] font-bold uppercase">
                    {day.hasCheckedIn ? 'Logged' : 'Muted'}
                  </span>
                </div>
              ))}
            </div>

            {/* Icons indicators guide */}
            <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 mt-4 border-t border-brand-border/40 pt-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-emerald"></span>
                <span>Checked In</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-border"></span>
                <span>Missed (Muted/Slate)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
