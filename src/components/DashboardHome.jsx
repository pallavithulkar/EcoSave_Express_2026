import React from 'react';
import { 
  TrendingUp, 
  Award, 
  Flame, 
  Leaf, 
  Activity, 
  Zap, 
  Car, 
  Droplets, 
  ChevronRight,
  Info,
  Bell,
  Gift,
  Search,
  Sparkles,
  Sun
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardHome({ stats, profile, setActiveTab }) {
  // Recharts Chart Data (Trend)
  const monthlySavingsTrend = [
    { name: 'Jan', savings: Math.round((stats.totalSavingsRupees || 0) * 0.15 + 20) },
    { name: 'Feb', savings: Math.round((stats.totalSavingsRupees || 0) * 0.3 + 40) },
    { name: 'Mar', savings: Math.round((stats.totalSavingsRupees || 0) * 0.5 + 60) },
    { name: 'Apr', savings: Math.round((stats.totalSavingsRupees || 0) * 0.65 + 80) },
    { name: 'May', savings: Math.round((stats.totalSavingsRupees || 0) * 0.8 + 100) },
    { name: 'Jun', savings: Math.round(stats.totalSavingsRupees || 0) },
  ];

  // Recharts Chart Data (Donut)
  const breakdownData = [
    { name: 'Electricity', value: stats.breakdown?.electricity || 0, color: '#10B981' },
    { name: 'Travel', value: stats.breakdown?.travel || 0, color: '#3B82F6' },
    { name: 'Water Checks', value: stats.breakdown?.water || 0, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const donutData = breakdownData.length > 0 ? breakdownData : [
    { name: 'Electricity (Demo)', value: 1200, color: '#10B981' },
    { name: 'Travel (Demo)', value: 850, color: '#3B82F6' },
    { name: 'Water (Demo)', value: 450, color: '#F59E0B' },
  ];

  // Carbon Reduction Trend Data
  const carbonTrendData = [
    { name: '1 Wk', reduction: Math.round((stats.totalCO2SavedKg || 0) * 0.2 + 2) },
    { name: '2 Wk', reduction: Math.round((stats.totalCO2SavedKg || 0) * 0.45 + 5) },
    { name: '3 Wk', reduction: Math.round((stats.totalCO2SavedKg || 0) * 0.75 + 10) },
    { name: '4 Wk', reduction: Math.round(stats.totalCO2SavedKg || 0) },
  ];

  // EcoScore progress ring math
  const ecoScore = stats.ecoScore || 45;
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (ecoScore / 100) * circumference;

  // Comparison math
  const maxSavings = Math.max(
    stats.breakdown?.electricity || 1,
    stats.breakdown?.travel || 1,
    stats.breakdown?.water || 1
  );

  const electPct = Math.max(10, Math.round(((stats.breakdown?.electricity || 0) / maxSavings) * 100));
  const travelPct = Math.max(10, Math.round(((stats.breakdown?.travel || 0) / maxSavings) * 100));
  const waterPct = Math.max(10, Math.round(((stats.breakdown?.water || 0) / maxSavings) * 100));

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER SECTION: Greeting, Search, Notification */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
            Welcome back, {profile?.name || 'Pallavi'}! 👋
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Track your savings, reduce waste & improve your EcoScore.
          </p>
        </div>
 
        {/* Action icons bar */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="pl-9 pr-4 py-1.5 rounded-xl bg-brand-card/85 border border-brand-border text-xs focus:outline-none focus:border-brand-emerald text-gray-200 placeholder-gray-500"
            />
          </div>
          <button type="button" className="p-2 rounded-xl bg-brand-card border border-brand-border hover:border-brand-border-glow text-gray-400 hover:text-white transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-emerald"></span>
          </button>
          <button type="button" className="p-2 rounded-xl bg-brand-card border border-brand-border hover:border-brand-border-glow text-gray-400 hover:text-white transition-all">
            <Gift className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* METRICS STRIP: Horizontal row of 5 premium cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Savings */}
        <div className="glow-card rounded-2xl p-4 bg-gradient-to-br from-[#122A26] to-[#0A1614] border border-[#1C3B35] text-white flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Savings</span>
            <span className="text-lg">📊</span>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-white">₹{stats.totalSavingsRupees || 0}</div>
            <div className="text-[9px] text-brand-emerald font-bold mt-0.5 flex items-center gap-1">
              <span>▲ 10%</span> <span className="text-gray-400 font-medium">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: EcoScore */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">EcoScore</span>
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 transform -rotate-90">
                <circle
                  className="text-brand-border"
                  strokeWidth={stroke}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={14}
                  cy={14}
                />
                <circle
                  className="text-brand-emerald"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={14}
                  cy={14}
                />
              </svg>
              <span className="absolute text-[8px] font-bold text-white font-display">
                {ecoScore}
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-white">{ecoScore}/100</div>
            <div className="text-[9px] text-brand-emerald font-bold mt-0.5">Great Progress!</div>
          </div>
        </div>

        {/* Card 3: EcoCoins */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">EcoCoins</span>
            <span className="text-lg">🪙</span>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-brand-gold">{stats.totalEcoCoins || 0}</div>
            <div className="text-[9px] text-gray-400 font-medium mt-0.5">
              <span className="text-brand-gold font-bold">+28</span> this month
            </div>
          </div>
        </div>

        {/* Card 4: CO2 Reduced */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CO2 Reduced</span>
            <span className="text-lg">🌳</span>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-brand-blue">{stats.totalCO2SavedKg || 0} kg</div>
            <div className="text-[9px] text-gray-400 font-medium mt-0.5">Month target: 25kg</div>
          </div>
        </div>

        {/* Card 5: Eco Streak */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Eco Streak</span>
            <span className="text-lg">🔥</span>
          </div>
          <div>
            <div className="text-2xl font-black font-display text-brand-emerald">{stats.currentStreak || 0} Days</div>
            <div className="text-[9px] text-gray-400 font-medium mt-0.5">Keep it up!</div>
          </div>
        </div>

      </div>

      {/* THREE CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Savings Trend */}
        <div className="glow-card rounded-2xl p-5 flex flex-col justify-between min-h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-white font-display mb-1 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-brand-emerald" />
              Monthly Savings Trend
            </h3>
            <span className="text-[9px] text-gray-400 block mb-3">Cumulative Rupee Savings (₹)</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySavingsTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#5F7E79" fontSize={9} tickLine={false} />
                <YAxis stroke="#5F7E79" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#132220', borderColor: '#1E3733', borderRadius: '12px' }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ color: '#10B981', fontSize: 10 }}
                />
                <Area type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Utility Breakdown (Donut) */}
        <div className="glow-card rounded-2xl p-5 flex flex-col justify-between min-h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-white font-display mb-1 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-brand-blue" />
              Utility Breakdown
            </h3>
            <span className="text-[9px] text-gray-400 block mb-3">Share of rupee savings per utility source</span>
          </div>
          
          <div className="h-36 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={58}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#132220', borderColor: '#1E3733', borderRadius: '12px' }}
                  itemStyle={{ color: '#E2E8F0', fontSize: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-[9px] text-gray-400 font-semibold border-t border-brand-border/30 pt-3">
            {donutData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name.replace(' (Demo)', '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Carbon Reduction Trend (Bar) */}
        <div className="glow-card rounded-2xl p-5 flex flex-col justify-between min-h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-white font-display mb-1 flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-brand-blue" />
              Carbon Reduction Trend
            </h3>
            <span className="text-[9px] text-gray-400 block mb-3">Weekly greenhouse gas reduction (kg CO₂)</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#5F7E79" fontSize={9} tickLine={false} />
                <YAxis stroke="#5F7E79" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#132220', borderColor: '#1E3733', borderRadius: '12px' }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ color: '#3B82F6', fontSize: 10 }}
                />
                <Bar dataKey="reduction" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* BOTTOM LAYOUT: SAVINGS COMPARISON & IMPACT SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Savings Comparison (col-span-3) */}
        <div className="lg:col-span-3 glow-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white font-display mb-1">Savings Comparison</h3>
            <span className="text-[9px] text-gray-400 block mb-4">Direct savings ratio comparison of energy, water, and transit metrics.</span>
          </div>

          <div className="space-y-4 my-auto">
            {/* Electricity Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-300 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-brand-emerald" /> Electricity</span>
                <span className="text-brand-emerald">₹{stats.breakdown?.electricity || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-dark-bg border border-brand-border">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-emerald shadow-glow-emerald" 
                  style={{ width: `${electPct}%` }}
                />
              </div>
            </div>

            {/* Travel Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-300 flex items-center gap-1"><Car className="w-3.5 h-3.5 text-brand-blue" /> Travel</span>
                <span className="text-brand-blue">₹{stats.breakdown?.travel || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-dark-bg border border-brand-border">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-brand-blue shadow-glow-blue" 
                  style={{ width: `${travelPct}%` }}
                />
              </div>
            </div>

            {/* Water Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-gray-300 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-brand-gold" /> Water</span>
                <span className="text-brand-gold">₹{stats.breakdown?.water || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-dark-bg border border-brand-border">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand-gold shadow-glow-gold" 
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-brand-border/30 pt-3 mt-4 text-[9.5px] text-gray-400 font-semibold flex items-center justify-between">
            <span>Overall Utility Balance</span>
            <span className="text-brand-emerald">Optimized</span>
          </div>
        </div>

        {/* Right Column: Impact Snapshot (col-span-2) */}
        <div className="lg:col-span-2 glow-card rounded-2xl p-5 flex flex-col justify-between min-h-[220px] bg-gradient-to-b from-[#132220] to-[#0D1817]">
          <div>
            <h3 className="text-xs font-bold text-white font-display mb-1">Impact Snapshot</h3>
            <span className="text-[9px] text-gray-400 block">Visual representation of your household carbon offsets.</span>
          </div>

          {/* Styled illustration of a Tree and Sun */}
          <div className="flex items-center gap-5 my-3">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center shadow-glow-emerald relative overflow-hidden flex-shrink-0">
              {/* SVG Tree illustration */}
              <svg viewBox="0 0 100 100" className="w-10 h-10" role="img" aria-label="Tree and Sun illustration">
                <circle cx="50" cy="40" r="22" fill="#047857" opacity="0.8" />
                <circle cx="38" cy="48" r="18" fill="#10B981" />
                <circle cx="62" cy="48" r="18" fill="#059669" />
                <rect x="47" y="55" width="6" height="25" fill="#78350F" rx="2" />
                {/* Sun */}
                <circle cx="80" cy="20" r="10" fill="#F59E0B" filter="drop-shadow(0 0 4px rgba(245,158,11,0.5))" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-snug">
                You've saved enough CO₂ to plant <strong className="text-brand-emerald font-black">{Math.max(1, Math.round((stats.totalCO2SavedKg || 0) / 20))} Tree(s)</strong> this month!
              </div>
              <p className="text-[9px] text-gray-400 mt-1 max-w-[190px]">
                Your carbon offset absorbs tailpipe greenhouse emissions directly from the Indian grid load.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('impact')}
            aria-label="View detailed carbon impact analogies"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-emerald text-brand-dark-bg text-xs font-extrabold uppercase hover:bg-brand-emerald-hover hover:scale-[1.01] transition-all cursor-pointer shadow-md shadow-brand-emerald/10"
          >
            <span>See Impact Mirror</span> <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

      </div>

    </div>
  );
}
