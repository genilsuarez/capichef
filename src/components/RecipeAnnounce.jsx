/**
 * RecipeAnnounce — Anuncio de receta al inicio de cada nivel.
 *
 * Desktop: modal centrado bloqueante.
 * Móvil: banner compacto en la parte superior, auto-dismiss en 2.5s o tap para cerrar.
 */
import { useEffect, useRef, useState } from 'react';
import { INGREDIENT_POOL } from '../state/recipes.js';

const RecipeAnnounce = ({ recipe, level, gameMode, onStart }) => {
  const btnRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [visible, setVisible] = useState(true);

  // Teclado — solo desktop
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onStart]);

  // Móvil: auto-dismiss después de 2.5s
  useEffect(() => {
    if (!isMobile) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onStart, 250); // esperar fade-out
    }, 2500);
    return () => clearTimeout(t);
  }, [isMobile, onStart]);

  if (!recipe) return null;

  const modeColor = gameMode === 'practice' ? '#0EA5E9' : gameMode === 'speedrun' ? '#F43F5E' : '#16C60C';
  const modeShadow = gameMode === 'practice' ? '#0369a1' : gameMode === 'speedrun' ? '#be123c' : '#0a7a06';

  // ── MÓVIL: banner compacto no bloqueante ──
  if (isMobile) {
    return (
      <div
        className={`fixed top-12 left-0 right-0 z-50 flex justify-center px-3 transition-all duration-250 ${visible ? 'animate-fade-in' : 'opacity-0'}`}
        onClick={() => { setVisible(false); onStart(); }}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 px-4 py-2.5 w-full max-w-sm flex items-center gap-3">
          {/* Ingredientes en fila */}
          <div className="flex items-center gap-1 flex-1 overflow-hidden">
            {recipe.ingredients.map((emoji, idx) => (
              <span key={idx} className="text-xl flex-shrink-0">{emoji}</span>
            ))}
          </div>
          {/* Nombre + toque */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-xs font-black text-amber-900 leading-tight">{recipe.name}</span>
            <span className="text-[10px] text-amber-400 font-bold">Toca para empezar</span>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP: modal completo ──
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in"
      onClick={onStart}
      role="dialog"
      aria-modal="true"
      aria-label={`Nueva receta: ${recipe.name}`}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl mx-4 w-full max-w-sm text-center animate-bounce-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          <p className="text-white/80 text-sm font-bold mb-1">Nivel {level} — ¡A cocinar!</p>
          <h2 className="text-3xl font-black text-white leading-tight">{recipe.name}</h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
            Ingredientes en orden
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {recipe.ingredients.map((emoji, idx) => {
              const item = INGREDIENT_POOL.find((i) => i.emoji === emoji);
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl shadow-sm border-2 border-purple-100">
                    {emoji}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 leading-tight text-center max-w-[56px]">
                    {item?.name || ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            ref={btnRef}
            className="btn-candy w-full py-4 text-white text-xl font-black rounded-2xl"
            style={{ background: modeColor, '--btn-shadow-color': modeShadow, touchAction: 'manipulation' }}
            onClick={onStart}
          >
            ¡Empezar! 🍳
          </button>
          <p className="text-xs text-gray-400 mt-2">o presiona Enter</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeAnnounce;
