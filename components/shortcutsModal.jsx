import { X } from 'lucide-react';

const shortcuts = [
  { key: '←', action: 'Reculer 5 secondes' },
  { key: '→', action: 'Avancer 5 secondes' },
  { key: 'Ctrl + ←', action: 'Reculer 10 secondes' },
  { key: 'Ctrl + →', action: 'Avancer 10 secondes' },
  { key: 'K', action: 'Reculer 200 ms' },
  { key: 'L', action: 'Avancer 200 ms' },
  { key: 'Esc', action: 'Quitter' },
  { key: 'F11', action: 'Plein écran' },
  { key: 'M', action: 'Muet / son' },
  { key: 'S', action: 'Vitesse de lecture' },
  { key: '0', action: 'Recommencer' },
  { key: 'Espace', action: 'Lecture / pause' },
  { key: '↑', action: 'Augmenter le volume' },
  { key: '↓', action: 'Diminuer le volume' }
];

export default function ShortcutsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white text-base font-semibold">Raccourcis clavier</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/70" />
          </button>
        </div>
        <div className="px-6 py-4 flex flex-col gap-2">
          {shortcuts.map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0"
            >
              <span className="text-white/70 text-sm">{item.action}</span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-white text-xs font-mono tracking-wide">
                {item.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}