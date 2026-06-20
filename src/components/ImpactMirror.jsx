import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Leaf, 
  Wind, 
  Smartphone, 
  Sparkles, 
  Users, 
  RefreshCw,
  Info
} from 'lucide-react';

export default function ImpactMirror({ stats }) {
  const [analogy, setAnalogy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const co2Saved = stats.totalCO2SavedKg || 0;

  // Dynamic values calculated live from the cumulative CO2 saved
  // Neem Tree absorbs ~20kg CO2 per year
  const neemTrees = Math.max(0, Math.round(co2Saved / 20));
  // 60W Ceiling Fan on India grid (0.82 emission factor) = 0.049kg CO2/hour. Approx 20 hours = 1kg CO2
  const fanHours = Math.round(co2Saved / 0.05);
  // 1 LPG Cylinder (14.2kg gas) emits ~42.5kg CO2 when combusted. Or 1kg gas = ~3kg CO2. Let's say ~1.5kg CO2 per day of use
  const lpgDays = (co2Saved / 1.5).toFixed(1);
  // Charging 1 smartphone = ~0.008 kg CO2 (8g CO2). 1kg CO2 = ~120 charges
  const phoneCharges = Math.round(co2Saved * 120);

  const fetchAnalogy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/impact');
      if (!res.ok) {
        throw new Error('Failed to retrieve analogies');
      }
      const data = await res.json();
      setAnalogy(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to Gemini API. Showing local baseline calculation instead.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalogy();
  }, [co2Saved]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Flame className="w-6 h-6 text-brand-gold" />
            Impact Mirror Analogies
          </h2>
          <p className="text-gray-400 text-sm">
            Translate abstract carbon offsets into tangible everyday indicators, featuring live societal multipliers.
          </p>
        </div>
        
        <button 
          onClick={fetchAnalogy}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border text-xs text-gray-400 hover:text-white hover:border-brand-border-glow transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> 
          Regenerate Analogy
        </button>
      </div>

      {/* FOUR-TILE COMPARISON ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Tile 1: Neem Trees */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Neem Trees Offset</span>
            <div className="w-7 h-7 rounded-lg bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-brand-emerald" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-black text-white font-display leading-tight">{neemTrees} Saplings</div>
            <span className="text-[9px] text-gray-400 block mt-1">neem saplings growing for 1 year</span>
          </div>
        </div>

        {/* Tile 2: Ceiling Fan Run time */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ceiling Fan Runtime</span>
            <div className="w-7 h-7 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
              <Wind className="w-3.5 h-3.5 text-brand-blue" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-black text-white font-display leading-tight">{fanHours} Hours</div>
            <span className="text-[9px] text-gray-400 block mt-1">running a standard 60W fan</span>
          </div>
        </div>

        {/* Tile 3: LPG Cylinders avoided */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">LPG Equivalent</span>
            <div className="w-7 h-7 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-brand-gold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-black text-white font-display leading-tight">{lpgDays} Days</div>
            <span className="text-[9px] text-gray-400 block mt-1">of typical cylinder combustion</span>
          </div>
        </div>

        {/* Tile 4: Smartphone charges */}
        <div className="glow-card rounded-2xl p-4 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mobile Charges</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-black text-white font-display leading-tight">{phoneCharges} Charges</div>
            <span className="text-[9px] text-gray-400 block mt-1">charging a smartphone 0-100%</span>
          </div>
        </div>

      </div>

      {/* GENERATIVE AI IMPACT CARD */}
      <div className="glow-card rounded-2xl p-6 relative border border-brand-gold/30 bg-brand-card/75">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] text-brand-gold font-extrabold uppercase bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3 h-3 animate-spin" /> Generative Gemini Comparisons
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <RefreshCw className="w-6 h-6 text-brand-gold animate-spin" />
            <span className="text-xs text-gray-400">Gemini is translating carbon saves into analogies...</span>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="flex gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {/* Fallback Display */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-brand-dark-bg/60 border border-brand-border text-xs">
                <span className="font-bold text-brand-emerald block">Personal Impact:</span>
                <p className="text-gray-300 mt-1 leading-relaxed">
                  Aapki carbon bachat is equivalent to planting {neemTrees} Neem trees and letting them grow for a year, or running a standard ceiling fan continuously for {fanHours} hours!
                </p>
              </div>
              <div className="p-4 rounded-xl bg-brand-dark-bg/60 border border-brand-border text-xs">
                <span className="font-bold text-brand-gold block flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Neighborhood Impact:</span>
                <p className="text-gray-300 mt-1 leading-relaxed">
                  Agar aapki housing society ke 500 parivaar ye karein, toh hum milkar {Math.round(co2Saved * 500)} kg CO₂ emissions save karenge — which is equivalent to avoiding {Math.max(1, Math.round(co2Saved * 500 / 150))} flights from Delhi to Mumbai!
                </p>
              </div>
            </div>
          </div>
        ) : analogy ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Dynamic Analogy Analysis</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Based on your cumulative {co2Saved} kg carbon reduced</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* User analogy */}
              <div className="p-4 rounded-xl bg-brand-dark-bg/60 border border-brand-border text-xs">
                <span className="font-bold text-brand-emerald block">🌿 Personal Equivalency</span>
                <p className="text-gray-300 mt-2 leading-relaxed text-[11px] font-medium">
                  {analogy.userComparison}
                </p>
              </div>

              {/* Community analogy */}
              <div className="p-4 rounded-xl bg-brand-dark-bg/60 border border-brand-border text-xs">
                <span className="font-bold text-brand-gold block flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-gold" /> 
                  Societal Multiplier (500 Homes)
                </span>
                <p className="text-gray-300 mt-2 leading-relaxed text-[11px] font-medium">
                  {analogy.communityComparison}
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-500">
            No carbon savings recorded yet. Auditing your utilities will unlock this module.
          </div>
        )}
      </div>

    </div>
  );
}
