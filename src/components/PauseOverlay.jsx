/**
 * PauseOverlay — Overlay de pausa (estilo limpio).
 */
import { useState } from 'react';
import ConfigPanel from './ConfigPanel';

const PauseOverlay = ({ onResume, onExitToMenu, config, onSaveConfig }) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-pop-in text-center"
           role="dialog" aria-modal="true" aria-label="Pausa">
        <h2 className="text-3xl font-black text-amber-900 mb-5">⏸️ Pausa</h2>

        <div className="flex flex-col gap-2.5">
          <button className="btn-candy w-full py-3 text-white rounded-xl font-bold text-base"
                  style={{ background: '#4ADE80', '--btn-shadow-color': '#16a34a', touchAction: 'manipulation' }}
                  onClick={onResume}>▶️ Continuar</button>
          <button className="btn-candy w-full py-3 text-white rounded-xl font-bold text-base"
                  style={{ background: '#FBBF24', '--btn-shadow-color': '#d97706', touchAction: 'manipulation' }}
                  onClick={() => setShowConfig(true)}>⚙️ Configuración</button>
          <button className="btn-candy w-full py-3 text-white rounded-xl font-bold text-base"
                  style={{ background: '#F87171', '--btn-shadow-color': '#dc2626', touchAction: 'manipulation' }}
                  onClick={() => setShowExitConfirm(true)}>🏠 Salir al menú</button>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-5 animate-pop-in text-center" role="alertdialog" aria-modal="true">
            <p className="text-base font-bold text-amber-900 mb-4">¿Seguro? Perderás el progreso 🤔</p>
            <div className="flex gap-3">
              <button className="btn-candy flex-1 py-2.5 rounded-xl font-bold text-sm text-amber-800"
                      style={{ background: '#f3f4f6', '--btn-shadow-color': '#d1d5db', touchAction: 'manipulation' }}
                      onClick={() => setShowExitConfirm(false)}>Cancelar</button>
              <button className="btn-candy flex-1 py-2.5 text-white rounded-xl font-bold text-sm"
                      style={{ background: '#ef4444', '--btn-shadow-color': '#b91c1c', touchAction: 'manipulation' }}
                      onClick={() => { setShowExitConfirm(false); onExitToMenu(); }}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}

      <ConfigPanel config={config} onSave={(c) => { onSaveConfig(c); setShowConfig(false); }} onClose={() => setShowConfig(false)} isOpen={showConfig} />
    </div>
  );
};

export default PauseOverlay;
