/**
 * TutorialModal — Tutorial visual de CapiChef.
 * Cada paso incluye un mockup de pantalla simulado con emojis y CSS.
 */
import { useState, useEffect } from 'react';

/* ── Mockups de pantalla ── */

const MockRecipe = () => (
  <div className="bg-white rounded-2xl shadow-md p-3 w-full text-left border-2 border-amber-200">
    <p className="text-xs font-black text-amber-700 mb-1">📋 Receta: Tacos 🌮</p>
    <div className="flex gap-1.5 flex-wrap">
      {['🥬','🥩','🧅','🌮'].map((e, i) => (
        <div key={i} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold
          ${i === 0 ? 'bg-green-100 ring-2 ring-green-400 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className="text-xl">{e}</span>
          <span>{i === 0 ? '1°' : `${i+1}°`}</span>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-green-600 font-bold mt-1.5">👆 ¡Toca la Lechuga primero!</p>
  </div>
);

const MockIngredients = () => (
  <div className="bg-white rounded-2xl shadow-md p-3 w-full border-2 border-amber-200">
    <p className="text-xs font-black text-amber-700 mb-2">🧺 Ingredientes disponibles</p>
    <div className="grid grid-cols-4 gap-1.5">
      {['🍅','🥬','🧄','🥩','🧅','🌶️','🥕','🌮'].map((e, i) => (
        <button key={i} className={`flex items-center justify-center rounded-xl p-2 text-2xl
          ${e === '🥬' ? 'bg-green-200 ring-2 ring-green-500 scale-110 shadow' : 'bg-amber-50'}`}>
          {e}
        </button>
      ))}
    </div>
  </div>
);

const MockHUD = () => (
  <div className="bg-white rounded-2xl shadow-md p-3 w-full border-2 border-amber-200">
    <div className="flex justify-between items-center">
      <div className="flex gap-1">
        <span className="text-lg">❤️</span><span className="text-lg">❤️</span><span className="text-lg">❤️</span>
      </div>
      <div className="flex items-center gap-1 bg-amber-100 rounded-full px-2 py-0.5">
        <span className="text-sm">🔥</span>
        <span className="text-sm font-black text-amber-700">x4 combo</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm">🪙</span>
        <span className="text-sm font-black text-amber-700">120</span>
      </div>
    </div>
    <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '60%' }} />
    </div>
    <p className="text-[10px] text-gray-400 text-center mt-0.5">⏱️ tiempo restante</p>
  </div>
);

const MockMath = () => (
  <div className="bg-white rounded-2xl shadow-md p-3 w-full border-2 border-blue-200">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-2xl">🦫</span>
      <div className="bg-blue-50 rounded-xl px-2 py-1 text-xs text-blue-700 font-bold">
        ¡Resuelve para seguir cocinando!
      </div>
    </div>
    <p className="text-center text-sm text-gray-600 mb-2">
      Tienes 🍅<strong>4</strong> y añades 🧅<strong>3</strong> más. ¿Cuántos hay?
    </p>
    <p className="text-center text-2xl font-black text-blue-700 mb-2">4 + 3 = ?</p>
    <div className="grid grid-cols-3 gap-2">
      {[5, 7, 9].map((n) => (
        <button key={n} className={`py-2 rounded-xl font-black text-lg
          ${n === 7 ? 'bg-green-400 text-white ring-2 ring-green-600' : 'bg-gray-100 text-gray-700'}`}>
          {n}
        </button>
      ))}
    </div>
    {<p className="text-center text-xs text-green-600 font-bold mt-1.5">✅ ¡Correcto! +10 🪙</p>}
  </div>
);

const MockModes = () => (
  <div className="bg-white rounded-2xl shadow-md p-3 w-full border-2 border-amber-200">
    <p className="text-xs font-black text-amber-700 mb-2">Elige tu modo de juego</p>
    <div className="flex flex-col gap-1.5">
      {[
        { emoji: '🍳', name: 'Clásico', desc: 'A tu ritmo', color: 'bg-green-100 text-green-700' },
        { emoji: '📚', name: 'Práctica', desc: 'Sin presión', color: 'bg-blue-100 text-blue-700' },
        { emoji: '⚡', name: 'Contra Reloj', desc: '¡Rápido!', color: 'bg-orange-100 text-orange-700' },
      ].map((m) => (
        <div key={m.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${m.color}`}>
          <span className="text-xl">{m.emoji}</span>
          <span className="font-black text-sm">{m.name}</span>
          <span className="text-xs ml-auto opacity-70">{m.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Pasos del tutorial ── */
const STEPS = [
  {
    title: '¡Bienvenido a CapiChef! 🦫',
    subtitle: 'Elige cómo quieres jugar',
    description: 'Hay 3 modos: Clásico para jugar tranquilo, Práctica para aprender sin presión, y Contra Reloj si quieres un reto.',
    mockup: <MockModes />,
    color: 'from-amber-400 to-orange-400',
  },
  {
    title: 'Sigue la receta 📋',
    subtitle: 'El orden importa',
    description: 'Mira qué ingredientes necesitas y en qué orden. El primero de la lista siempre está resaltado en verde.',
    mockup: <MockRecipe />,
    color: 'from-green-400 to-emerald-500',
  },
  {
    title: 'Toca los ingredientes 👆',
    subtitle: 'Búscalos en el panel',
    description: 'Encuentra el ingrediente correcto entre todos los disponibles y tócalo. ¡El resaltado verde te ayuda!',
    mockup: <MockIngredients />,
    color: 'from-lime-400 to-green-500',
  },
  {
    title: 'Vidas, combo y monedas 🔥',
    subtitle: 'Tu marcador en tiempo real',
    description: 'Tienes 3 vidas. Cada ingrediente correcto seguido sube tu combo y ganas más monedas. ¡No dejes que el tiempo se acabe!',
    mockup: <MockHUD />,
    color: 'from-amber-400 to-yellow-500',
  },
  {
    title: 'Desafío matemático 🧠',
    subtitle: 'Entre niveles aparece una operación',
    description: 'Resuelve la suma, resta o multiplicación para ganar monedas extra. ¡Toca la respuesta correcta antes de que se acabe el tiempo!',
    mockup: <MockMath />,
    color: 'from-blue-400 to-indigo-500',
  },
];

const TutorialModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        setStep((s) => s < STEPS.length - 1 ? s + 1 : s);
      }
      if (e.key === 'ArrowLeft') setStep((s) => s > 0 ? s - 1 : 0);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Reset step when reopened
  useEffect(() => { if (isOpen) setStep(0); }, [isOpen]);

  if (!isOpen) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-pop-in"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente por paso */}
        <div className={`bg-gradient-to-r ${current.color} px-5 pt-5 pb-4 flex-shrink-0`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-black text-white leading-tight">{current.title}</h2>
              <p className="text-sm text-white/80 font-semibold mt-0.5">{current.subtitle}</p>
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/30 text-white font-bold hover:bg-white/50 transition-colors flex-shrink-0 ml-2"
              onClick={onClose}
              aria-label="Cerrar ayuda"
              style={{ touchAction: 'manipulation' }}
            >✕</button>
          </div>
          {/* Dots */}
          <div className="flex gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${i === step ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
                aria-label={`Paso ${i + 1}`}
                style={{ touchAction: 'manipulation' }}
              />
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="px-4 pt-4 flex-shrink-0" key={step}>
          {current.mockup}
        </div>

        {/* Descripción */}
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <p className="text-sm text-gray-600 leading-relaxed">{current.description}</p>
        </div>

        {/* Navegación */}
        <div className="flex gap-2 p-4 flex-shrink-0">
          {step > 0 && (
            <button
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm active:scale-95 transition-all"
              style={{ touchAction: 'manipulation' }}
              onClick={() => setStep(step - 1)}
            >← Anterior</button>
          )}
          {!isLast ? (
            <button
              className={`flex-1 py-2.5 bg-gradient-to-r ${current.color} text-white rounded-xl font-black text-sm active:scale-95 transition-all shadow`}
              style={{ touchAction: 'manipulation' }}
              onClick={() => setStep(step + 1)}
            >Siguiente →</button>
          ) : (
            <button
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-black text-sm active:scale-95 transition-all shadow"
              style={{ touchAction: 'manipulation' }}
              onClick={onClose}
            >¡A cocinar! 🍳</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
