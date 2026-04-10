/**
 * LevelComplete — Overlay de nivel completado, diseñado para niños 4-10 años.
 * Enfocado en celebración emocional: capibara, estrellas, frases festivas.
 */
import { useEffect } from 'react';
import ConfettiEffect from './ConfettiEffect';
import Capibara from './Capibara';

/** Frases aleatorias de celebración según el resultado */
const FRASES_PERFECTO = [
  '¡Eres un chef increíble! 🏆',
  '¡Sin errores! ¡Eres genial! 🌟',
  '¡El capibara está muy orgulloso! 🦫❤️',
];
const FRASES_BIEN = [
  '¡Muy bien cocinado! 👨‍🍳',
  '¡El plato quedó delicioso! 😋',
  '¡Sigue así, chef! 🍳',
];
const FRASES_RAPIDO = [
  '¡Qué rápido cocinaste! ⚡',
  '¡Velocidad de chef profesional! 🚀',
];
const FRASES_COMBO = [
  '¡Combo increíble! 🔥',
  '¡No paraste ni un segundo! 🔥',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Calcula cuántas estrellas mostrar (1-3) según bonuses obtenidos */
function calcStars(isPerfect, speedBonus, comboMultiplier) {
  if (isPerfect && speedBonus > 0) return 3;
  if (isPerfect || speedBonus > 0 || comboMultiplier > 1) return 2;
  return 1;
}

const Star = ({ filled, size = 'text-4xl', delay = 0 }) => (
  <span
    className={`${size} animate-pop-in`}
    style={{ animationDelay: `${delay}ms` }}
    aria-hidden="true"
  >
    {filled ? '⭐' : '☆'}
  </span>
);

const LevelComplete = ({ coinsBreakdown, level, isPerfect, gameMode = 'classic', onNext }) => {
  const {
    base = 0,
    speedBonus = 0,
    perfectBonus = 0,
    comboMultiplier = 1,
    modeMultiplier = 1,
    total = 0,
  } = coinsBreakdown || {};

  const stars = calcStars(isPerfect, speedBonus, comboMultiplier);
  const frasePrincipal = isPerfect ? pickRandom(FRASES_PERFECTO) : pickRandom(FRASES_BIEN);

  // Enter o Space para continuar
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNext(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      role="dialog"
      aria-label="Nivel completado"
    >
      <ConfettiEffect isActive={isPerfect} duration={2500} />

      <div className="bg-white rounded-3xl shadow-2xl p-6 mx-4 max-w-sm w-full text-center animate-slide-up">

        {/* Capibara celebrando */}
        <div className="mb-2">
          <Capibara state="done" hideStateText />
        </div>

        {/* Título */}
        <h2 className="text-3xl font-black text-amber-900 mb-1 animate-pop-in">
          ✨ ¡Plato listo!
        </h2>
        <p className="text-amber-500 font-bold mb-3">Nivel {level} completado</p>

        {/* Estrellas */}
        <div className="flex justify-center gap-2 mb-3" aria-label={`${stars} de 3 estrellas`}>
          <Star filled={stars >= 1} delay={100} />
          <Star filled={stars >= 2} size="text-5xl" delay={250} />
          <Star filled={stars >= 3} delay={400} />
        </div>

        {/* Frase principal */}
        <p className="text-base font-black text-amber-700 mb-3 animate-pop-in">
          {frasePrincipal}
        </p>

        {/* Logros obtenidos — solo los que aplican */}
        <div className="flex flex-col gap-1.5 mb-4">
          {speedBonus > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-2 text-sm font-bold text-yellow-700 animate-pop-in">
              ⚡ {pickRandom(FRASES_RAPIDO)}
            </div>
          )}
          {comboMultiplier > 1 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 text-sm font-bold text-orange-600 animate-pop-in">
              {pickRandom(FRASES_COMBO)}
            </div>
          )}
          {isPerfect && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-sm font-bold text-green-700 animate-pop-in">
              ✅ ¡Sin ningún error!
            </div>
          )}
        </div>

        {/* Monedas ganadas — grande y festivo */}
        <div className="bg-amber-50 rounded-2xl py-3 px-4 mb-4 flex items-center justify-center gap-2">
          <span className="text-3xl animate-bounce-custom">🪙</span>
          <span className="text-3xl font-black text-amber-600">+{total}</span>
          <span className="text-sm font-bold text-amber-400">monedas</span>
        </div>

        {gameMode === 'practice' && (
          <p className="text-xs text-amber-400 font-semibold mb-3">
            📚 Modo Práctica — las monedas no se guardan
          </p>
        )}

        {/* Botón siguiente */}
        <button
          className="btn-candy w-full py-4 text-white rounded-2xl font-black text-lg"
          style={{ background: '#60A5FA', '--btn-shadow-color': '#2563eb', touchAction: 'manipulation' }}
          onClick={onNext}
        >
          ¡Siguiente nivel! 🚀
        </button>
      </div>
    </div>
  );
};

export default LevelComplete;
