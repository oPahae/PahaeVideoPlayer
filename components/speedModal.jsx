import { useState } from 'react';
import { X, Gauge } from 'lucide-react';

const presets = [0.25, 0.5, 1, 1.5, 2];

export default function SpeedModal({ open, onClose, currentRate, onSelect }) {
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handlePreset = (rate) => {
    onSelect(rate);
    onClose();
  };

  const handleCustomSubmit = () => {
    const normalized = customValue.trim().replace(',', '.');
    if (normalized === '') {
      setError('Valeur invalide');
      return;
    }
    const value = parseFloat(normalized);
    if (isNaN(value) || value <= 0) {
      setError('Valeur invalide');
      return;
    }
    onSelect(value);
    setCustomValue('');
    setError('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-white/70" />
            <h2 className="text-white text-base font-semibold">Vitesse de lecture</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {presets.map((rate) => (
              <button
                key={rate}
                onClick={() => handlePreset(rate)}
                className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  currentRate === rate
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs">Vitesse personnalisée</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 1.75"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/30"
              />
              <button
                onClick={handleCustomSubmit}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-colors"
              >
                Valider
              </button>
            </div>
            {error && <span className="text-red-400 text-xs">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
