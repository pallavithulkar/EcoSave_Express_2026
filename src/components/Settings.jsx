import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  MapPin, 
  Users, 
  Zap, 
  Leaf, 
  Check, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';

export default function SettingsPage({ profile, onUpdateProfile, onResetAllData }) {
  const [name, setName] = useState(profile?.name || '');
  const [city, setCity] = useState(profile?.city || '');
  const [familySize, setFamilySize] = useState(profile?.familySize || 4);
  const [electricityRate, setElectricityRate] = useState(profile?.electricityRate || 7.5);
  const [emissionFactor, setEmissionFactor] = useState(profile?.emissionFactor || 0.82);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Synced with incoming profile props
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setCity(profile.city);
      setFamilySize(profile.familySize);
      setElectricityRate(profile.electricityRate);
      setEmissionFactor(profile.emissionFactor);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          city,
          familySize: Number(familySize),
          electricityRate: Number(electricityRate),
          emissionFactor: Number(emissionFactor)
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await res.json();
      onUpdateProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to delete all bill uploads, travel history, check-ins, and reset stats? This cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      
      onResetAllData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      setError('Failed to clear database logs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-emerald" />
          Household Configuration Settings
        </h2>
        <p className="text-gray-400 text-sm">
          Customize baseline household parameters to configure local utility formulas, carbon calculators, and Gemini audit suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: DESCRIPTION INFO (col-span-1) */}
        <div className="md:col-span-1 space-y-4">
          <div className="glow-card rounded-2xl p-5 bg-brand-card/50">
            <h3 className="text-sm font-bold text-white font-display mb-2 flex items-center gap-1">
              <Info className="w-4 h-4 text-brand-emerald" /> Information
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed space-y-3">
              <span>
                These details alter formulas across modules. For example:
              </span>
              <span className="block mt-2">
                • <strong>Electricity Rates</strong> directly determine potential rupee savings calculations.
              </span>
              <span className="block mt-1">
                • <strong>Emission Factors</strong> adjust electricity carbon volumes. The standard factor in India is <strong>0.82 kg CO₂/kWh</strong>.
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SETTINGS FORM (col-span-2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="glow-card rounded-2xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Profile Details */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-emerald" /> Primary User Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-emerald focus:outline-none text-white font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" /> Household City
                  </label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-blue focus:outline-none text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-gold" /> Family Size
                  </label>
                  <input 
                    type="number" 
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-gold focus:outline-none text-white font-semibold"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Constants Formulas */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-brand-emerald" /> Electricity rate (₹/kWh)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-emerald focus:outline-none text-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-brand-blue" /> Grid CO₂ emission factor
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={emissionFactor}
                    onChange={(e) => setEmissionFactor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-blue focus:outline-none text-white font-semibold"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex gap-2 p-3 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-semibold">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Profile baseline saved successfully! Calculator ratios updated.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-brand-emerald text-brand-dark-bg text-xs font-bold hover:bg-brand-emerald-hover transition-colors font-display"
              >
                {isLoading ? 'Saving updates...' : 'Save Configuration'}
              </button>
            </form>
          </div>

          {/* DANGER DELETION ZONE */}
          <div className="glow-card rounded-2xl p-5 border border-red-900/30 bg-red-950/5">
            <h3 className="text-sm font-bold text-white font-display mb-1">Danger Zone</h3>
            <span className="text-[10px] text-gray-400 block mb-4">Resetting will purge all logged dashboard metrics.</span>

            {resetSuccess && (
              <div className="flex gap-2 p-3 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-semibold mb-3">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>All household data logs cleared! Database reset.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetData}
              disabled={isLoading}
              className="px-4 py-2 border border-red-800 text-red-400 rounded-xl hover:bg-red-900/20 text-xs font-bold transition-colors"
            >
              Reset All Application Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
