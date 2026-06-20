import React from 'react';
import { 
  Home, 
  Zap, 
  Car, 
  Droplets, 
  Flame, 
  Award, 
  BarChart2, 
  Settings, 
  User, 
  Sparkles,
  Leaf
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, profile, stats }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'electricity', name: 'Electricity', icon: Zap },
    { id: 'travel', name: 'Travel', icon: Car },
    { id: 'water', name: 'Water', icon: Droplets },
    { id: 'impact', name: 'Impact Mirror', icon: Flame },
    { id: 'rewards', name: 'Rewards', icon: Award },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const ecoScore = stats?.ecoScore || 45;
  
  // SVG Math for circular progress ring (radius=24, stroke=4, circumference = 2 * PI * r = 150.8)
  const radius = 22;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (ecoScore / 100) * circumference;

  return (
    <aside className="w-64 min-h-screen bg-[#0C1816] border-r border-[#162E29] flex flex-col justify-between p-4 sticky top-0 text-white">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-brand-emerald flex items-center justify-center shadow-glow-emerald">
            <Leaf className="w-5 h-5 text-[#0C1816] fill-[#0C1816]" />
          </div>
          <div>
            <h1 className="text-lg font-black font-display tracking-tight text-white m-0 leading-none">
              EcoSave
            </h1>
            <span className="text-[10px] text-brand-emerald font-extrabold uppercase tracking-widest block mt-0.5">
              Express
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
                  isActive
                    ? 'bg-brand-emerald text-[#0C1816] font-bold shadow-md shadow-brand-emerald/20'
                    : 'text-gray-400 hover:bg-[#142B27] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Today's Eco Score */}
      <div className="space-y-4 pt-4 border-t border-[#162E29]">
        {/* Today's Eco Score Circle Gauge */}
        <div className="bg-[#122421]/60 rounded-xl p-3 border border-[#1B3B34] flex items-center gap-4 text-white">
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                className="text-[#1A342E]"
                strokeWidth={stroke}
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={24}
                cy={24}
              />
              <circle
                className="text-brand-emerald transition-all duration-500 ease-out"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={24}
                cy={24}
              />
            </svg>
            <span className="absolute text-xs font-bold text-white font-display">
              {ecoScore}
            </span>
          </div>
          <div>
            <div className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider">
              Today's Eco Score
            </div>
            <div className="text-xs text-gray-200 font-semibold leading-tight mt-0.5">
              {ecoScore >= 80 ? 'Excellent Progress!' : ecoScore >= 60 ? 'Good Going' : 'Start Check-ins!'}
            </div>
          </div>
        </div>

        {/* User Mini-card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#122421] border border-[#1B3B34] text-white">
          <div className="w-10 h-10 rounded-full bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald font-bold">
            {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate font-display">
              {profile?.name || 'Loading User...'}
            </div>
            <div className="text-[9px] text-brand-emerald font-extrabold uppercase tracking-wider truncate">
              Eco Champion • Lvl 12
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
