/**
 * GameOver — Overlay de fin de juego.
 * Mismo lenguaje visual que LevelComplete: capibara, frases, stats compactas.
 */
import { useState, useEffect } from 'react';
import Capibara from './Capibara';

const FRASES_GAMEOVER = [
  '¡La próxima vez lo logras! 💪',
  '¡El capibara quiere revancha! 🦫🔥',
  '¡Sigue intentando, chef! 👨‍🍳',
  '¡Casi lo tienes! ¡Otra vez! ⚡',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GameOver = ({
  level, coins, bestCombo, dishesCompleted, mathCorrect, mathTotal,
  gameMode = 'classic', timePenalty = 0, previousGame = null,
  selectedSkin = 'classic', onRestart, onShare,
}) => {
  const [shareLabel, setShareLabel] = useState('📤 Compartir');
  const frase = pickRandom(FRASES_GAMEOVER);
  const mathAccuracy = mathTotal > 0 ? Math.round((mathCorrect / mathTotal) * 100) : 0;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRestart(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  const handleShare = async () => {
    if (onShare) {
      const success = await onShare();
      if (success !== false) {
        setShareLabel('✅ ¡Copiado!');
        setTimeout(() => setShareLabel('📤 Compartir'), 2000);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      role="dialog"
      aria-label="Game Over"
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 max-w-sm w-full text-center animate-slide-up">

        {/* Header con gradiente — mismo estilo que ProfilePanel */}
        <div className="px-6 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
          <div className="mb-1">
            <Capibara state="gameover" skin={selectedSkin} hideStateText />
          </div>
          <h2 className="text-2xl font-black text-white animate-pop-in drop-shadow">
            😢 ¡Se acabó!
          </h2>
          <p className="text-white/80 font-bold text-sm mt-0.5">Llegaste al nivel {level}</p>
        </div>

        <div className="p-5">
          {/* Frase motivadora */}
          <p className="text-base font-black text-amber-700 mb-4 animate-pop-in">
            {frase}
          </p>

        {/* Stats — compactas en grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatBadge emoji="🪙" label="Monedas" value={coins} color="bg-amber-50 text-amber-700" />
          <StatBadge emoji="🔥" label="Mejor combo" value={`×${bestCombo}`} color="bg-orange-50 text-orange-700" />
          <StatBadge emoji="🍽️" label="Platos" value={dishesCompleted} color="bg-green-50 text-green-700" />
          <StatBadge emoji="🧠" label="Mates" value={`${mathAccuracy}%`} color="bg-blue-50 text-blue-700" />
        </div>

        {/* Comparación con partida anterior */}
        {previousGame && (
          <div className={`rounded-2xl px-4 py-2 mb-4 text-sm font-bold animate-pop-in
            ${level >= previousGame.levelReached
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {level >= previousGame.levelReached
              ? `⬆️ +${level - previousGame.levelReached} niveles vs anterior`
              : `⬇️ ${level - previousGame.levelReached} niveles vs anterior`}
          </div>
        )}

        {/* Modo badge */}
        {gameMode !== 'classic' && (
          <p className="text-xs font-bold text-amber-500 mb-3">
            {gameMode === 'practice' ? '📚 Modo Práctica' : '⚡ Contra Reloj'}
            {gameMode === 'speedrun' && timePenalty > 0 && ` · +${timePenalty}s penalización`}
          </p>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-2">
          {onShare && (
            <button
              className="btn-candy w-full py-3 text-white rounded-2xl font-bold text-sm"
              style={{ background: '#818CF8', '--btn-shadow-color': '#6366f1', touchAction: 'manipulation' }}
              onClick={handleShare}
            >{shareLabel}</button>
          )}
          <button
            className="btn-candy w-full py-4 text-white rounded-2xl font-black text-lg"
            style={{ background: '#4ADE80', '--btn-shadow-color': '#16a34a', touchAction: 'manipulation' }}
            onClick={onRestart}
          >🔄 ¡Otra vez!</button>
        </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ emoji, label, value, color }) => (
  <div className={`${color} rounded-2xl px-3 py-2 flex flex-col items-center gap-0.5`}>
    <span className="text-xl">{emoji}</span>
    <span className="text-xs font-semibold opacity-70">{label}</span>
    <span className="text-lg font-black">{value}</span>
  </div>
);

export default GameOver;
