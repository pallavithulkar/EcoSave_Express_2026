import React, { useState } from 'react';
import { 
  Zap, 
  Upload, 
  Calendar, 
  TrendingUp, 
  Leaf, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  Plus,
  RefreshCw,
  Home,
  Info,
  Sun,
  Tv,
  Droplets
} from 'lucide-react';

export default function ElectricityIntelligence({ bills, onAddBill, profile, stats }) {
  const [file, setFile] = useState(null);
  const [units, setUnits] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeRoom, setActiveRoom] = useState('livingRoom');
  const [isManual, setIsManual] = useState(false);

  // 1. Dynamic Room Data for Interactive Auditor
  const rooms = {
    bedroom: {
      name: 'Bedroom',
      status: 'Efficient Consumption',
      icon: '🛏️',
      appliances: [
        { name: 'Split AC (1.0 Ton - Inverter)', power: '1000W', duration: '6 hrs/day', consumption: '4.5 kWh/day', cost: '₹33.8/day' },
        { name: 'BLDC Ceiling Fan', power: '28W', duration: '10 hrs/day', consumption: '0.28 kWh/day', cost: '₹2.1/day' },
        { name: 'Laptop Charger', power: '65W', duration: '8 hrs/day', consumption: '0.52 kWh/day', cost: '₹3.9/day' },
      ],
      tips: [
        { action: 'Clean AC Filters every 15 days', benefit: 'Increases airflow and efficiency, saving ₹90-120/month.' },
        { action: 'Use BLDC fans', benefit: 'Saves 60% electricity compared to normal induction fans (saves ₹50/month per fan).' }
      ]
    },
    solar: {
      name: 'Rooftop Solar',
      status: 'Power Generation Active',
      icon: '☀️',
      appliances: [
        { name: 'Monocrystalline Solar Array (5kW)', power: '5000W peak', duration: '5.5 hrs avg/day', consumption: '27.5 kWh generated/day', cost: '₹206.2 saved/day' }
      ],
      tips: [
        { action: 'Clean Solar Panels Weekly', benefit: 'Clearing dust/smog improves absorption efficiency by up to 15% (saves ₹250/mo).' },
        { action: 'Schedule high-load runs in mid-day', benefit: 'Utilizes direct solar output, avoiding peak-hour grid consumption.' }
      ]
    },
    bathroom: {
      name: 'Bathroom',
      status: 'Efficient Consumption',
      icon: '🚿',
      appliances: [
        { name: 'Water Geyser (Instant)', power: '3000W', duration: '0.5 hrs/day', consumption: '1.5 kWh/day', cost: '₹11.3/day' },
        { name: 'Bathroom Ventilation Fan', power: '40W', duration: '2 hrs/day', consumption: '0.08 kWh/day', cost: '₹0.6/day' },
      ],
      tips: [
        { action: 'Set Geyser to 50°C instead of 60°C', benefit: 'Saves about 5-8% standby heating losses (saves ₹40/month).' },
        { action: 'Repair leaking hot water taps', benefit: 'Saves water waste and standby heating energy.' }
      ]
    },
    kitchen: {
      name: 'Kitchen',
      status: 'High Consumption',
      icon: '🍳',
      appliances: [
        { name: 'Double-Door Refrigerator', power: '350W', duration: '24 hrs/day', consumption: '2.5 kWh/day', cost: '₹18.8/day' },
        { name: 'Induction Cooktop', power: '1800W', duration: '1 hr/day', consumption: '1.8 kWh/day', cost: '₹13.5/day' },
        { name: 'Microwave Oven', power: '1200W', duration: '0.5 hr/day', consumption: '0.6 kWh/day', cost: '₹4.5/day' },
      ],
      tips: [
        { action: 'Maintain Fridge Clearance (6 inches)', benefit: 'Improves compressor cooling efficiency (saves ₹60/month).' },
        { action: 'Defrost freezer regularly', benefit: 'Prevents ice buildup which causes the motor to run longer and consume more.' }
      ]
    },
    livingRoom: {
      name: 'Living Room',
      status: 'Moderate Consumption',
      icon: '🛋️',
      appliances: [
        { name: 'Air Conditioner (1.5 Ton)', power: '1500W', duration: '6 hrs/day', consumption: '9 kWh/day', cost: '₹67.5/day' },
        { name: 'Ceiling Fan (Induction)', power: '75W', duration: '12 hrs/day', consumption: '0.9 kWh/day', cost: '₹6.8/day' },
        { name: 'Smart LED TV + Set-top Box', power: '120W', duration: '4 hrs/day', consumption: '0.48 kWh/day', cost: '₹3.6/day' },
      ],
      tips: [
        { action: 'Set AC to 24°C-26°C', benefit: 'Saves up to ₹180/month (6% savings per 1°C increase).' },
        { action: 'Turn Off Wall Switch for TV/Console', benefit: 'Stops standby power leakage (saves ~₹45/month).' }
      ]
    },
    garden: {
      name: 'Garden & Outdoor',
      status: 'Efficient Consumption',
      icon: '🪴',
      appliances: [
        { name: 'Water Submersible Pump', power: '750W (1 HP)', duration: '0.5 hrs/day', consumption: '0.37 kWh/day', cost: '₹2.8/day' },
        { name: 'Outdoor Garden Post Lights', power: '36W (4x9W LEDs)', duration: '10 hrs/day', consumption: '0.36 kWh/day', cost: '₹2.7/day' }
      ],
      tips: [
        { action: 'Water Plants Early/Late', benefit: 'Minimizes water evaporation, reducing pumping run times (saves ₹30/mo).' },
        { action: 'Install Motion Sensors for Security Lights', benefit: 'Prevents lights running all night when not needed (saves ₹40/mo).' }
      ]
    }
  };

  // 2. Dynamic Room Score calculation based on Gemini analysis of the bill
  const getDynamicScores = () => {
    const latestBill = bills[bills.length - 1];
    
    // Default baseline scores
    let bedroom = 78;
    let solar = 85;
    let bathroom = 72;
    let kitchen = 88;
    let livingRoom = 80;
    let garden = 70;
    
    let bedroomLeak = false;
    let livingRoomLeak = false;
    let kitchenLeak = false;
    let bathroomLeak = false;

    if (latestBill) {
      const unitsVal = Number(latestBill.unitsConsumed) || 280;
      const baseFactor = Math.max(0.6, Math.min(1.8, unitsVal / 280));

      // Base scaling on bill load
      bedroom = Math.max(35, Math.min(99, Math.round(78 / baseFactor)));
      bathroom = Math.max(35, Math.min(99, Math.round(72 / baseFactor)));
      kitchen = Math.max(35, Math.min(99, Math.round(88 / baseFactor)));
      livingRoom = Math.max(35, Math.min(99, Math.round(80 / baseFactor)));
      garden = Math.max(35, Math.min(99, Math.round(70 / baseFactor)));

      // Analyze recommendations to identify which rooms have heavy energy usage
      const recsText = (latestBill.recommendations || [])
        .map(r => ((r?.title || '') + ' ' + (r?.description || '')).toLowerCase())
        .join(' ');

      // If Gemini flags AC units, drop scores for AC rooms (Bedroom and Living Room)
      if (recsText.includes('ac') || recsText.includes('air conditioner') || recsText.includes('cooling')) {
        bedroom = Math.max(35, bedroom - 15);
        livingRoom = Math.max(35, livingRoom - 15);
        bedroomLeak = true;
        livingRoomLeak = true;
      }
      
      // If Gemini flags Refrigerator or Kitchen, drop Kitchen score
      if (recsText.includes('fridge') || recsText.includes('refrigerator') || recsText.includes('kitchen') || recsText.includes('induction')) {
        kitchen = Math.max(35, kitchen - 15);
        kitchenLeak = true;
      }

      // If Gemini flags water heating/geysers, drop Bathroom score
      if (recsText.includes('geyser') || recsText.includes('water heater') || recsText.includes('bathroom') || recsText.includes('shower')) {
        bathroom = Math.max(35, bathroom - 15);
        bathroomLeak = true;
      }

      solar = Math.max(50, Math.min(99, Math.round(85 * (1 + (80 - bedroom)/300))));
    }

    const homeEcoScore = Math.max(40, Math.min(100, Math.round((bedroom + bathroom + kitchen + livingRoom) / 4 + 6)));

    return { 
      bedroom, 
      solar, 
      bathroom, 
      kitchen, 
      livingRoom, 
      garden, 
      homeEcoScore,
      leaks: { bedroomLeak, livingRoomLeak, kitchenLeak, bathroomLeak }
    };
  };

  const scores = getDynamicScores();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (!isManual && file) {
      formData.append('billFile', file);
    } else {
      if (!units || !amount) {
        setError('Please fill in both units consumed and bill amount');
        setIsLoading(false);
        return;
      }
      formData.append('units', units);
      formData.append('amount', amount);
      formData.append('period', period || 'Current Month');
    }

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error uploading bill');
      }

      const data = await res.json();
      onAddBill(data); // update global state

      // Reset form
      setFile(null);
      setUnits('');
      setAmount('');
      setPeriod('');
      
      const fileInput = document.getElementById('billFileInput');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try manual entry!');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to color borders based on scores
  const getBadgeStyles = (score, roomId) => {
    const isActive = activeRoom === roomId;
    const activePulse = isActive ? 'ring-2 ring-brand-emerald ring-offset-2 ring-offset-brand-dark-bg scale-[1.04]' : '';
    
    if (score >= 80) {
      return `border-brand-emerald text-brand-emerald bg-brand-emerald/10 ${activePulse}`;
    } else if (score >= 60) {
      return `border-brand-gold text-brand-gold bg-brand-gold/10 ${activePulse}`;
    } else {
      return `border-red-500 text-red-400 bg-red-500/10 ${activePulse}`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-emerald" />
            Electricity Intelligence
          </h2>
          <p className="text-gray-400 text-sm">
            Analyze your household consumption patterns, perform automated bill audits, and audit rooms.
          </p>
        </div>
      </div>

      {/* TWO PANEL GRID: BILL AUDITOR & ROOM AUDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: BILL ANALYSIS PANEL (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glow-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border/40 pb-3">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-emerald" />
                Upload Bill or Enter Details
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsManual(false)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                    !isManual 
                      ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald' 
                      : 'text-gray-400 border-brand-border hover:text-gray-200'
                  }`}
                >
                  OCR Scan
                </button>
                <button
                  type="button"
                  onClick={() => setIsManual(true)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                    isManual 
                      ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald' 
                      : 'text-gray-400 border-brand-border hover:text-gray-200'
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isManual ? (
                /* OCR UPLOAD CONTAINER */
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-300">
                    Upload Electricity Bill (Image or PDF)
                  </label>
                  <div className="border border-dashed border-brand-border hover:border-brand-emerald/50 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-brand-dark-bg/40">
                    <input 
                      type="file" 
                      id="billFileInput"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-brand-emerald mx-auto mb-2 animate-bounce" />
                    <span className="text-xs text-gray-300 block font-medium">
                      {file ? file.name : 'Click to select file or drag & drop'}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-1">
                      Max file size: 5MB (JPG, PNG, PDF)
                    </span>
                  </div>
                  {file && (
                    <div className="p-2.5 rounded-lg bg-brand-emerald/5 border border-brand-emerald/10 text-xs text-brand-emerald">
                      File Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              ) : (
                /* MANUAL INPUTS */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Billing Period / Month
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. May 2026" 
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-emerald focus:outline-none text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Units Consumed (kWh)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 350" 
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-emerald focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Bill Amount (₹)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 2600" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-emerald focus:outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (!isManual && !file)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-display flex items-center justify-center gap-2 transition-all ${
                  isLoading
                    ? 'bg-brand-border text-gray-500 cursor-not-allowed'
                    : 'bg-brand-emerald text-brand-dark-bg hover:bg-brand-emerald-hover hover:scale-[1.01]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Gemini AI analyzing bill...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {isManual ? 'Analyze & Save Manual Input' : 'Process Bill with Gemini'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* LATEST AUDIT RESULTS */}
          {bills.length > 0 && (
            <div className="glow-card rounded-2xl p-5 border border-brand-emerald/30 bg-brand-card/75 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] text-brand-emerald font-extrabold uppercase bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded">
                <Sparkles className="w-2.5 h-2.5" /> Live Gemini Output
              </div>

              {(() => {
                const latest = bills[bills.length - 1];
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">Latest Audit Result</h4>
                      <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{latest.billingPeriod}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-brand-dark-bg/60 border border-brand-border">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Savings Potential</span>
                        {/* LARGEST BOLDEST NUMBER */}
                        <span className="text-xl font-black text-brand-emerald font-display">₹{latest.savingsPotentialRupees}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">({latest.savedKWh} kWh/month)</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-dark-bg/60 border border-brand-border">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">CO2 Reduced</span>
                        <span className="text-sm font-semibold text-brand-blue font-display">{latest.co2SavedKg} kg CO₂</span>
                        <span className="text-[10px] text-gray-400 block mt-1.5">India factor: 0.82</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs text-white font-bold block">Gemini Personalised Tips:</span>
                      {latest.recommendations?.map((rec, i) => (
                        <div key={i} className="text-xs p-2.5 rounded-xl bg-brand-dark-bg/40 border border-brand-border/60">
                          <span className="font-bold text-brand-emerald block">💡 {rec.title}</span>
                          <span className="text-gray-300 block mt-0.5 text-[11px] leading-relaxed">{rec.description}</span>
                          <span className="text-[10px] text-gray-400 block mt-1.5">
                            Est. Savings: <strong className="text-brand-emerald">₹{rec.rupeeSavings}</strong> | CO2 saved: <strong className="text-brand-blue">{rec.co2Savings}kg</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE ISOMETRIC HOUSE (col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glow-card rounded-2xl p-5">
            
            {/* Header with Dynamic Eco Score banner */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display mb-1 flex items-center gap-2">
                  <Home className="w-4.5 h-4.5 text-brand-emerald" />
                  Interactive Isometric Room Auditor
                </h3>
                <p className="text-xs text-gray-400">
                  Select a room below to audit localized energy usage metrics dynamically adjusted by your bill units.
                </p>
              </div>
              
              {/* Top Score Banner */}
              <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-2 flex items-center gap-2 shadow-glow-emerald">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Home Eco Score</span>
                <span className="text-lg font-black text-brand-emerald font-display">{scores.homeEcoScore}</span>
                <span className="text-[10px] text-gray-500">/100</span>
              </div>
            </div>

            {/* ISOMETRIC HOUSE CONTAINER WITH DETAILED 3D RENDER BACKGROUND */}
            <div className="relative w-full aspect-[4/3] max-h-[360px] bg-brand-dark-bg/85 rounded-2xl border border-brand-border overflow-hidden flex items-center justify-center p-2 group">
              
              {/* Background House Illustration */}
              <img 
                src="/isometric-house.png" 
                alt="Dynamic Isometric Eco House" 
                className="w-full h-full object-contain pointer-events-none opacity-90 transition-transform duration-500 group-hover:scale-[1.02]" 
              />
              
              {/* Subtle pulsing background glow behind house */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_60%)] pointer-events-none" />
              
              {/* FLOATING INTERACTIVE TAG BUTTONS OVERLAY */}
              
              {/* 1. Bedroom (Top Left Room) */}
              <button
                type="button"
                onClick={() => setActiveRoom('bedroom')}
                className={`absolute transition-all duration-300 flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-card/95 cursor-pointer shadow-md select-none ${getBadgeStyles(scores.bedroom, 'bedroom')}`}
                style={{ top: '24%', left: '15%' }}
              >
                <div className="flex items-center gap-1.5">
                  <span>🛏️</span>
                  <span className="text-gray-300">Bedroom</span>
                  <span className="font-extrabold">{scores.bedroom}</span>
                </div>
                {scores.leaks.bedroomLeak && (
                  <span className="text-[7px] text-red-400 font-black uppercase tracking-wider animate-pulse mt-0.5">⚠️ AC Leakage Waste</span>
                )}
              </button>

              {/* 2. Rooftop Solar (Top roof panels) */}
              <button
                type="button"
                onClick={() => setActiveRoom('solar')}
                className={`absolute transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-card/95 cursor-pointer shadow-md select-none ${getBadgeStyles(scores.solar, 'solar')}`}
                style={{ top: '15%', left: '48%' }}
              >
                <span>☀️</span>
                <span className="text-gray-300">Rooftop Solar</span>
                <span className="font-extrabold">{scores.solar}</span>
              </button>

              {/* 3. Bathroom (Ground floor left) */}
              <button
                type="button"
                onClick={() => setActiveRoom('bathroom')}
                className={`absolute transition-all duration-300 flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-card/95 cursor-pointer shadow-md select-none ${getBadgeStyles(scores.bathroom, 'bathroom')}`}
                style={{ top: '54%', left: '12%' }}
              >
                <div className="flex items-center gap-1.5">
                  <span>🚿</span>
                  <span className="text-gray-300">Bathroom</span>
                  <span className="font-extrabold">{scores.bathroom}</span>
                </div>
                {scores.leaks.bathroomLeak && (
                  <span className="text-[7px] text-red-400 font-black uppercase tracking-wider animate-pulse mt-0.5">⚠️ Geyser Leakage</span>
                )}
              </button>

              {/* 4. Kitchen (Top Level Right Room) */}
              <button
                type="button"
                onClick={() => setActiveRoom('kitchen')}
                className={`absolute transition-all duration-300 flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-card/95 cursor-pointer shadow-md select-none ${getBadgeStyles(scores.kitchen, 'kitchen')}`}
                style={{ top: '48%', left: '70%' }}
              >
                <div className="flex items-center gap-1.5">
                  <span>🍳</span>
                  <span className="text-gray-300">Kitchen</span>
                  <span className="font-extrabold">{scores.kitchen}</span>
                </div>
                {scores.leaks.kitchenLeak && (
                  <span className="text-[7px] text-red-400 font-black uppercase tracking-wider animate-pulse mt-0.5">⚠️ Appliance Waste</span>
                )}
              </button>

              {/* 5. Living Room (Ground Floor Right Room) */}
              <button
                type="button"
                onClick={() => setActiveRoom('livingRoom')}
                className={`absolute transition-all duration-300 flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-card/95 cursor-pointer shadow-md select-none ${getBadgeStyles(scores.livingRoom, 'livingRoom')}`}
                style={{ top: '76%', left: '30%' }}
              >
                <div className="flex items-center gap-1.5">
                  <span>🛋️</span>
                  <span className="text-gray-300">Living Room</span>
                  <span className="font-extrabold">{scores.livingRoom}</span>
                </div>
                {scores.leaks.livingRoomLeak && (
                  <span className="text-[7px] text-red-400 font-black uppercase tracking-wider animate-pulse mt-0.5">⚠️ High AC Draw</span>
                )}
              </button>

              {/* 6. Garden (Ground slabs outer area) */}
              <button
                type="button"
                onClick={() => setActiveRoom('garden')}
                className={`absolute transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-card/95 cursor-pointer shadow-md select-none ${getBadgeStyles(scores.garden, 'garden')}`}
                style={{ top: '78%', left: '64%' }}
              >
                <span>🪴</span>
                <span className="text-gray-300">Garden</span>
                <span className="font-extrabold">{scores.garden}</span>
              </button>

            </div>

            {/* ACTIVE ROOM APPLIANCE BREAKDOWN TABLE AND TIPS */}
            {activeRoom && (
              <div className="mt-6 p-4 rounded-xl border border-brand-border/60 bg-brand-dark-bg/30 space-y-4">
                
                {/* Room Info Header */}
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="text-lg">{rooms[activeRoom].icon}</span>
                      {rooms[activeRoom].name} Details
                    </h4>
                    <span className="text-[10px] text-gray-400">Dynamic parameters linked to latest bill units ({bills[bills.length - 1]?.unitsConsumed || 280} kWh)</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    activeRoom === 'kitchen' 
                      ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' 
                      : activeRoom === 'livingRoom'
                      ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                      : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                  }`}>
                    {rooms[activeRoom].status}
                  </span>
                </div>

                {/* Appliances Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-brand-border/40 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-2">Appliance / Source</th>
                        <th className="py-2">Load</th>
                        <th className="py-2">Daily Use</th>
                        <th className="py-2">KWh / Day</th>
                        <th className="py-2 text-right">Daily Offset / Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/20 text-gray-300">
                      {rooms[activeRoom].appliances.map((app, i) => (
                        <tr key={i} className="hover:bg-brand-card/30">
                          <td className="py-2 font-medium text-white">{app.name}</td>
                          <td className="py-2 text-gray-400">{app.power}</td>
                          <td className="py-2 text-gray-400">{app.duration}</td>
                          <td className="py-2 text-brand-blue font-semibold">{app.consumption}</td>
                          <td className="py-2 text-right text-brand-emerald font-bold">{app.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Local Savings Recommendations */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-white block mb-2">🎯 Room Savings Action Items:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rooms[activeRoom].tips.map((tip, i) => (
                      <div key={i} className="p-3 rounded-xl bg-brand-card/80 border border-brand-border flex flex-col justify-between">
                        <span className="text-xs font-bold text-brand-emerald">✓ {tip.action}</span>
                        <span className="text-[10px] text-gray-400 leading-normal mt-1">{tip.benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* HISTORICAL BILLS LIST */}
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-blue" />
              Bill Auditing History
            </h3>
            {bills.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No bills audited yet. Upload a bill to populate your dashboard history.
              </div>
            ) : (
              <div className="space-y-2">
                {[...bills].reverse().map((bill, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-brand-dark-bg/60 border border-brand-border hover:border-brand-emerald/40 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-white block">{bill.billingPeriod || 'Electricity Bill'}</span>
                      <span className="text-[10px] text-gray-400">Consumed: {bill.unitsConsumed} units | Amount: ₹{bill.billAmount}</span>
                    </div>
                    <div className="text-right">
                      {/* LARGE SAVINGS VALUE */}
                      <span className="text-sm font-black text-brand-emerald block">₹{bill.savingsPotentialRupees} potential savings</span>
                      <span className="text-[9px] text-brand-blue font-medium uppercase tracking-wider block">-{bill.co2SavedKg} kg CO₂</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
