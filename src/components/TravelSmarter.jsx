import React, { useState } from 'react';
import { 
  Car, 
  MapPin, 
  Navigation, 
  TrendingUp, 
  Leaf, 
  ArrowRight, 
  Sparkles, 
  History,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function TravelSmarter({ travelLogs, onAddTravelLog }) {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('Petrol Car');
  const [spendOrDist, setSpendOrDist] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);

  const travelModes = [
    'Petrol Car',
    'Diesel Car',
    'CNG Car',
    'Two-wheeler (Petrol)',
    'Auto Rickshaw',
    'Metro',
    'Local Bus',
    'Walking'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!start || !destination || !spendOrDist) {
      setError('Please fill in all inputs');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setActiveRoute(null);

    try {
      const res = await fetch('/api/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start,
          destination,
          mode,
          spendOrDist
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit travel log');
      }

      const data = await res.json();
      onAddTravelLog(data);
      
      // Trigger route line drawing animation on map
      setActiveRoute(data);

      // Reset form
      setStart('');
      setDestination('');
      setSpendOrDist('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
          <Car className="w-6 h-6 text-brand-blue" />
          Travel Smarter Optimizer
        </h2>
        <p className="text-gray-400 text-sm">
          Map transit carbon footprints, calculate fuel cost trade-offs, and receive Gemini suggestions for public transit routing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: ROUTE FINDER FORM (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 border-b border-brand-border/40 pb-3 mb-4">
              <Navigation className="w-4 h-4 text-brand-blue" />
              Plan Journey Footprint
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" /> Start Point
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Andheri West" 
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-blue focus:outline-none text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-emerald" /> Destination
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bandra Kurla Complex" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-blue focus:outline-none text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Current Travel Mode
                </label>
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-blue focus:outline-none text-white font-medium"
                >
                  {travelModes.map((m) => (
                    <option key={m} value={m} className="bg-[#132220] text-white">{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {mode.includes('Car') || mode.includes('wheeler') 
                    ? 'Distance (km) OR Fuel Spend (₹)' 
                    : 'Distance Covered (km)'}
                </label>
                <input 
                  type="number" 
                  placeholder={mode.includes('Car') || mode.includes('wheeler') ? "e.g. 15 km or ₹300 spend" : "e.g. 12"} 
                  value={spendOrDist}
                  onChange={(e) => setSpendOrDist(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-blue focus:outline-none text-white font-medium"
                  required
                />
                <span className="text-[10px] text-gray-500 block mt-1 leading-normal">
                  If you enter values &gt; 100, we treat it as ₹ fuel expenditure to compute distance.
                </span>
              </div>

              {error && (
                <div className="flex gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-display flex items-center justify-center gap-2 transition-all ${
                  isLoading
                    ? 'bg-brand-border text-gray-500 cursor-not-allowed'
                    : 'bg-brand-blue text-white hover:bg-blue-600 hover:scale-[1.01]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Finding green routes via Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Optimize Travel carbon
                  </>
                )}
              </button>
            </form>
          </div>

          {/* LATEST TRIP RESULTS */}
          {activeRoute && (
            <div className="glow-card rounded-2xl p-5 border border-brand-blue/30 bg-brand-card/75 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] text-brand-blue font-extrabold uppercase bg-brand-blue/10 border border-brand-blue/20 px-2 py-0.5 rounded">
                <Sparkles className="w-2.5 h-2.5" /> Gemini Alternative
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">Optimized Travel Plan</h4>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white mt-1">
                    <span>{activeRoute.start}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{activeRoute.destination}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Total Distance: ~{activeRoute.distanceKm} km</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-brand-dark-bg/60 border border-brand-border">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Trip Savings</span>
                    {/* LARGEST BOLDEST NUMBER */}
                    <span className="text-xl font-black text-brand-emerald font-display">₹{activeRoute.savingsRupees}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">per travel shift</span>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-dark-bg/60 border border-brand-border">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">CO2 Reduced</span>
                    {/* Secondary supporting hierarchy, smaller font size */}
                    <span className="text-sm font-semibold text-brand-blue font-display">{activeRoute.co2SavedKg} kg CO₂</span>
                    <span className="text-[10px] text-gray-400 block mt-1">({Math.round((activeRoute.co2SavedKg / (activeRoute.currentCO2Kg || 1)) * 100)}% offset)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-brand-dark-bg/40 border border-brand-border/60 text-xs">
                  <span className="font-bold text-brand-blue block">💡 Transit Alternative: {activeRoute.alternativeMode}</span>
                  <span className="text-gray-300 block mt-1 leading-relaxed text-[11px]">{activeRoute.reasoning}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HIGH-TECH ROUTE ANIMATOR (col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glow-card rounded-2xl p-5 relative overflow-hidden">
            <h3 className="text-base font-bold text-white font-display mb-1">Live Route carbon Visualizer</h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter a trip to animate the travel path. Green represent eco-friendly Metro/Walk layers, red represent grid-locked road emissions.
            </p>

            {/* Premium Animated Map SVG */}
            <div className="w-full aspect-[4/3] bg-brand-dark-bg/90 rounded-2xl border border-brand-border relative flex items-center justify-center p-2">
              <svg 
                viewBox="0 0 400 300" 
                className="w-full h-full max-h-[300px]"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* City Grid Background lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E3733" strokeWidth="0.5" />
                  </pattern>
                  {/* Glowing line filter */}
                  <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Grid */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Water Body (Illustrated River) */}
                <path 
                  d="M -20,250 C 100,220 200,280 420,240 L 420,320 L -20,320 Z" 
                  fill="#0B1418" 
                  stroke="#1E3733" 
                  strokeWidth="1" 
                  opacity="0.6"
                />

                {/* City Roads (Abstract Background) */}
                <path d="M 50,0 L 50,300 M 150,0 L 150,300 M 250,0 L 250,300 M 350,0 L 350,300" stroke="#132220" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 0,60 L 400,60 M 0,160 L 400,160 M 0,230 L 400,230" stroke="#132220" strokeWidth="1" strokeDasharray="3 3" />

                {/* Local Railway / Metro Track (Dotted) */}
                <path 
                  d="M 120,-10 C 160,80 180,180 130,310" 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 4" 
                  opacity="0.3"
                />

                {/* Green Metro route line */}
                <path 
                  id="metro-green-line"
                  d="M 280,-10 C 270,100 310,210 240,310" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2" 
                  strokeDasharray="5 3" 
                  opacity="0.25"
                />

                {/* ANIMATING ACTIVE TRIP ROUTE */}
                {activeRoute ? (
                  <>
                    {/* Primary Road Line (Inefficient Mode - Red/Orange) */}
                    <path
                      d={activeRoute.currentRoutePath}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      opacity="0.5"
                      strokeDasharray="4 4"
                    />

                    {/* Gemini Recommended Route (Efficient Alternative - Glowing Emerald/Blue) */}
                    <path
                      key={`path-${activeRoute.alternativeRoutePath}`}
                      id="anim-route-line"
                      d={activeRoute.alternativeRoutePath}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      filter="url(#glow-emerald)"
                      className="route-draw"
                      style={{
                        strokeDasharray: 500,
                        strokeDashoffset: 500,
                        animation: 'drawRoute 2.5s ease-out forwards'
                      }}
                    />
 
                    {/* Animated Vehicle Node (SVG Car Icon) */}
                    <g key={`car-${activeRoute.alternativeRoutePath}`} filter="url(#glow-emerald)">
                      <animateMotion 
                        dur="4.5s" 
                        repeatCount="indefinite" 
                        path={activeRoute.alternativeRoutePath} 
                        rotate="auto"
                      />
                      {/* Detailed car shape: body, cabin, wheels */}
                      <path 
                        d="M -10,-3 L -10,1.5 C -10,2.3 -9.3,3 -8.5,3 L -7,3 C -7,1.8 -5.8,0.8 -4.5,0.8 C -3.2,0.8 -2,1.8 -2,3 L 3,3 C 3,1.8 4.2,0.8 5.5,0.8 C 6.8,0.8 8,1.8 8,3 L 9.5,3 C 10.3,3 11,2.3 11,1.5 L 11,-1.5 C 11,-2.5 10.2,-3.3 9.2,-3.5 L 5.5,-4 L 2.5,-6.5 L -5,-6.5 L -7.5,-4 L -10,-3 Z" 
                        fill="#10B981" 
                      />
                      {/* Windows */}
                      <path d="M -4.5,-5.5 L 1.5,-5.5 L 3.8,-3.8 L -5.8,-3.8 Z" fill="#0B1418" />
                      {/* Wheels */}
                      <circle cx="-4.5" cy="3" r="2" fill="#E2E8F0" />
                      <circle cx="5.5" cy="3" r="2" fill="#E2E8F0" />
                      <circle cx="-4.5" cy="3" r="0.8" fill="#0B1418" />
                      <circle cx="5.5" cy="3" r="0.8" fill="#0B1418" />
                    </g>

                    {/* Start Node */}
                    <circle cx={activeRoute.startCoords?.x || 80} cy={activeRoute.startCoords?.y || 80} r="5" fill="#3B82F6" />
                    <text 
                      x={(activeRoute.startCoords?.x || 80) - 5} 
                      y={(activeRoute.startCoords?.y || 80) - 12} 
                      fill="#E2E8F0" 
                      fontSize="9" 
                      fontWeight="bold" 
                      fontFamily="sans-serif"
                    >
                      A: {activeRoute?.start?.split(' ')[0] || 'Start'}
                    </text>

                    {/* Destination Node */}
                    <circle cx={activeRoute.destCoords?.x || 320} cy={activeRoute.destCoords?.y || 180} r="5" fill="#EF4444" />
                    <text 
                      x={(activeRoute.destCoords?.x || 320) - 5} 
                      y={(activeRoute.destCoords?.y || 180) + 18} 
                      fill="#E2E8F0" 
                      fontSize="9" 
                      fontWeight="bold" 
                      fontFamily="sans-serif"
                    >
                      B: {activeRoute?.destination?.split(' ')[0] || 'Dest'}
                    </text>

                    {/* Info Card on Map displaying both CO2 and Petrol Money savings */}
                    <g transform="translate(100, 225)">
                      <rect width="200" height="55" rx="10" fill="#132220" stroke="#10B981" strokeWidth="1.5" opacity="0.95" />
                      <text x="12" y="18" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="sans-serif">🚀 Gemini Recommendation</text>
                      <text x="12" y="32" fill="#E2E8F0" fontSize="8" fontFamily="sans-serif">Shift to: {activeRoute.alternativeMode}</text>
                      <text x="12" y="45" fill="#3B82F6" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Saved: ₹{activeRoute.savingsRupees} & {activeRoute.co2SavedKg}kg CO₂</text>
                    </g>
                  </>
                ) : (
                  <>
                    {/* Default Standby map pointers */}
                    <circle cx="100" cy="120" r="4" fill="#6B7280" />
                    <text x="90" y="110" fill="#6B7280" fontSize="8">Office Hub</text>

                    <circle cx="280" cy="160" r="4" fill="#6B7280" />
                    <text x="270" y="150" fill="#6B7280" fontSize="8">Residential Complex</text>

                    <g transform="translate(100, 135)">
                      <rect width="200" height="30" rx="6" fill="#132220" stroke="#1E3733" strokeWidth="1" opacity="0.8" />
                      <text x="10" y="18" fill="#E2E8F0" fontSize="8" textAnchor="middle" cx="100" className="w-full text-center">
                        Waiting for travel logs to map routes...
                      </text>
                    </g>
                  </>
                )}
              </svg>
            </div>
            
            {/* Inject dynamic CSS animation for route drawing */}
            <style>{`
              @keyframes drawRoute {
                to {
                  strokeDashoffset: 0;
                }
              }
            `}</style>
          </div>

          {/* HISTORICAL TRAVEL LOGS */}
          <div className="glow-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white font-display mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-blue" />
              Recent Journey Analytics
            </h3>
            
            {travelLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                No journeys logged yet. Input your commute details above to start tracking.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {[...travelLogs].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-brand-dark-bg/60 border border-brand-border">
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-white">
                        <span>{log.start}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span>{log.destination}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Original: {log.distanceKm}km via {log.currentCostRupees ? `₹${log.currentCostRupees}` : ''} | Shift to: <strong className="text-brand-blue">{log.alternativeMode}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      {/* LARGE SAVINGS VALUE */}
                      <span className="text-sm font-black text-brand-emerald block">₹{log.savingsRupees} saved</span>
                      <span className="text-[9px] text-brand-blue font-bold block">-{log.co2SavedKg} kg CO₂</span>
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
