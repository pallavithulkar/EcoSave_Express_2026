import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import ElectricityIntelligence from './components/ElectricityIntelligence';
import TravelSmarter from './components/TravelSmarter';
import LeakAssistant from './components/LeakAssistant';
import ImpactMirror from './components/ImpactMirror';
import RewardsCenter from './components/RewardsCenter';
import SettingsPage from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalSavingsRupees: 0,
    totalCO2SavedKg: 0,
    totalEcoCoins: 0,
    ecoScore: 45,
    currentStreak: 0,
    leaderboardRank: 6,
    topPercentStr: 'Top 100%',
    breakdown: { electricity: 0, travel: 0, water: 0 },
    reductions: { electricityKg: 0, travelKg: 0, waterKg: 0 },
    leaderboard: []
  });
  
  const [bills, setBills] = useState([]);
  const [travelLogs, setTravelLogs] = useState([]);
  const [streakLogs, setStreakLogs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [appLoading, setAppLoading] = useState(true);

  // Fetch all initial data from backend
  const refreshAllData = async () => {
    try {
      // Fetch Profile
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Fetch Stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Bills
      const billsRes = await fetch('/api/bills');
      if (billsRes.ok) {
        const billsData = await billsRes.json();
        setBills(billsData);
      }

      // Fetch Travel Logs
      const travelRes = await fetch('/api/travel');
      if (travelRes.ok) {
        const travelData = await travelRes.json();
        setTravelLogs(travelData);
      }

      // Fetch Streak Logs
      const streakRes = await fetch('/api/streak');
      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setStreakLogs(streakData);
      }

      // Fetch Chat History
      const chatRes = await fetch('/api/chat');
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatHistory(chatData);
      }
    } catch (error) {
      console.error('Error fetching data from Express backend:', error);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Update profile handler
  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    refreshStatsOnly();
  };

  // Add bill handler
  const handleAddBill = (newBill) => {
    setBills(prev => [...prev, newBill]);
    refreshStatsOnly();
  };

  // Add travel log handler
  const handleAddTravelLog = (newLog) => {
    setTravelLogs(prev => [...prev, newLog]);
    refreshStatsOnly();
  };

  // Check-in handler
  const handleCheckIn = (checkInData) => {
    setStreakLogs(prev => {
      // Replace if check-in for this date already exists
      const filtered = prev.filter(log => log.date !== checkInData.date);
      const updated = [...filtered, checkInData];
      updated.sort((a, b) => a.date.localeCompare(b.date));
      return updated;
    });
    refreshStatsOnly();
  };

  // Chat sender
  const handleSendChatMessage = async (userMessage) => {
    // Optimistically add user message to local chat state
    const tempUserMsg = { id: 'temp_' + Date.now(), role: 'user', text: userMessage };
    setChatHistory(prev => [...prev, tempUserMsg]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    if (!res.ok) {
      throw new Error('Failed to send chat message');
    }

    const data = await res.json();
    
    // Add bot response to local chat state
    const tempModelMsg = { id: 'temp_model_' + Date.now(), role: 'model', text: JSON.stringify(data) };
    
    // Re-sync with actual database state to get correct ids and cleanup temps
    const chatRes = await fetch('/api/chat');
    if (chatRes.ok) {
      const chatData = await chatRes.json();
      setChatHistory(chatData);
    }
    
    // Refresh stats (in case water check-in values are triggered)
    refreshStatsOnly();
  };

  // Reset chat handler
  const handleResetChat = async () => {
    setChatHistory([]);
  };

  // Clear all data
  const handleResetAllData = () => {
    setBills([]);
    setTravelLogs([]);
    setStreakLogs([]);
    setChatHistory([]);
    setStats({
      totalSavingsRupees: 0,
      totalCO2SavedKg: 0,
      totalEcoCoins: 0,
      ecoScore: 45,
      currentStreak: 0,
      leaderboardRank: 6,
      topPercentStr: 'Top 100%',
      breakdown: { electricity: 0, travel: 0, water: 0 },
      reductions: { electricityKg: 0, travelKg: 0, waterKg: 0 },
      leaderboard: []
    });
    refreshAllData();
  };

  // Refetch only stats and rankings (faster)
  const refreshStatsOnly = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const statsData = await res.json();
        setStats(statsData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-brand-dark-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-emerald border-t-transparent animate-spin"></div>
        <span className="text-sm font-bold text-gray-400 font-display uppercase tracking-widest animate-pulse">
          EcoSave Express is booting up...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark-bg flex text-gray-200">
      
      {/* PERSISTENT SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        profile={profile}
        stats={stats}
      />

      {/* MAIN CONTAINER PAGE ROUTER */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
        
        {/* Dynamic page content selector */}
        {activeTab === 'dashboard' && (
          <DashboardHome 
            stats={stats} 
            profile={profile} 
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'electricity' && (
          <ElectricityIntelligence 
            bills={bills} 
            onAddBill={handleAddBill} 
            profile={profile}
          />
        )}

        {activeTab === 'travel' && (
          <TravelSmarter 
            travelLogs={travelLogs} 
            onAddTravelLog={handleAddTravelLog}
          />
        )}

        {activeTab === 'water' && (
          <LeakAssistant 
            chatHistory={chatHistory} 
            onSendChatMessage={handleSendChatMessage}
            onResetChat={handleResetChat}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactMirror 
            stats={stats}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsCenter 
            stats={stats} 
            profile={profile} 
            bills={bills}
            travelLogs={travelLogs}
            streakLogs={streakLogs}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage 
            profile={profile} 
            onUpdateProfile={handleUpdateProfile}
            onResetAllData={handleResetAllData}
          />
        )}

      </main>

    </div>
  );
}
