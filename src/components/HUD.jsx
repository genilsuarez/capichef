/**
 * HUD — Heads-Up Display (estilo Lingokids: limpio, iconos claros, no abrumador).
 */
import { useState } from 'react';

const HUD = ({ lives, coins, level, gameMode, isPaused, onPause, onExit, timePenalty }) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hearts = Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={`text-lg sm:text-xl ${i >= lives ? 'grayscale opacity-30' : ''}`}>
      {i < lives ? '❤️' : '🖤'}
    </span>
  ));

  const modeBadge = gameMode === 'practice' ? '📚' : gameMode === 'speedrun' ? '⚡' : null;

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-3 py-1.5 sm:py-2 border-b border-amber-100 select-none shadow-sm">
        {/* Lives */}
        <div role="status" aria-label={`${lives} vidas restantes`} className="flex items-center gap-0.5">
          {hearts}
        </div>

        {/* Center: coins + level */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-800">
          <span className="bg-amber-50 rounded-full px-2 py-0.5" aria-label={`${coins} monedas`}>
            🪙 {coins}
          </span>
          <span className="bg-amber-50 rounded-full px-2 py-0.5" aria-label={`Nivel ${level}`}>
            ⭐ {level}
          </span>
          {modeBadge && (
            <span className="bg-amber-50 rounded-full px-1.5 py-0.5 text-xs">{modeBadge}</span>
          )}
          {gameMode === 'speedrun' && timePenalty > 0 && (
            <span className="text-xs text-red-500 font-black animate-shake">+{timePenalty}s</span>
          )}
        </div>

        {/* Pause + Exit */}
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-amber-50 hover:bg-amber-100 active:scale-90 transition-all text-base sm:text-lg"
            style={{ touchAction: 'manipulation' }}
            onClick={onPause}
            aria-label={isPaused ? 'Reanudar juego' : 'Pausar juego'}
          >
            ⏸️
          </button>
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-amber-50 hover:bg-red-100 active:scale-90 transition-all text-base sm:text-lg"
            style={{ touchAction: 'manipulation' }}
            onClick={() => setShowExitConfirm(true)}
            aria-label="Salir al menú"
          >
            🏠
          </button>
        </div>
      </div>

      {/* Exit confirmation — fuera del sticky HUD para evitar stacking context */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 text-center animate-pop-in mx-4 w-full max-w-xs"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-black text-amber-900 mb-5">
              ¿Seguro? Perderás el progreso 🤔
            </p>
            <div className="flex gap-3">
              <button
                className="btn-candy flex-1 py-3 rounded-xl font-bold text-amber-800 text-base"
                style={{ background: '#f3f4f6', '--btn-shadow-color': '#d1d5db', touchAction: 'manipulation' }}
                onClick={() => setShowExitConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-candy flex-1 py-3 text-white rounded-xl font-bold text-base"
                style={{ background: '#ef4444', '--btn-shadow-color': '#b91c1c', touchAction: 'manipulation' }}
                onClick={() => { setShowExitConfirm(false); onExit(); }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HUD;
