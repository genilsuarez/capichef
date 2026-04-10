/**
 * IngredientPanel — Grid de ingredientes.
 * Los ingredientes usados se muestran en gris en su posición original (sin desaparecer).
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { INGREDIENT_POOL } from '../state/recipes.js';

const EMOJI_TO_NAME = new Map(INGREDIENT_POOL.map((item) => [item.emoji, item.name]));
function getIngredientName(emoji) { return EMOJI_TO_NAME.get(emoji) || emoji; }

const IngredientPanel = ({
  availableIngredients, usedIngredients = [], onIngredientClick, lastClickResult,
  lastClickedIngredient, hintIngredient, newIngredients = [], hideNames = false,
}) => {
  const debounceRef = useRef(new Map());
  const [shakingIngredient, setShakingIngredient] = useState(null);

  useEffect(() => {
    if (lastClickResult === 'incorrect' && lastClickedIngredient) {
      setShakingIngredient(lastClickedIngredient);
      const timer = setTimeout(() => setShakingIngredient(null), 300);
      return () => clearTimeout(timer);
    }
  }, [lastClickResult, lastClickedIngredient]);

  const handleClick = useCallback((ingredient, isUsed) => {
    if (isUsed) return; // ignorar clicks en ingredientes ya usados
    const now = Date.now();
    const lastClick = debounceRef.current.get(ingredient) || 0;
    if (now - lastClick < 200) return;
    debounceRef.current.set(ingredient, now);
    onIngredientClick(ingredient);
  }, [onIngredientClick]);

  // Construir un Set de usados para lookup O(1)
  // Soporta múltiples usos del mismo emoji (ej: receta con 2 tomates)
  const usedCounts = {};
  for (const ing of usedIngredients) {
    usedCounts[ing] = (usedCounts[ing] || 0) + 1;
  }
  const seenCounts = {};

  return (
    <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-1.5 sm:gap-2 px-1 sm:px-4 w-full"
         role="group" aria-label="Panel de ingredientes">
      {availableIngredients.map((ingredient, idx) => {
        const name = getIngredientName(ingredient);

        // Determinar si esta instancia del emoji está usada
        seenCounts[ingredient] = (seenCounts[ingredient] || 0) + 1;
        const isUsed = (usedCounts[ingredient] || 0) >= seenCounts[ingredient];

        const isShaking = !isUsed && shakingIngredient === ingredient;
        const isHint = !isUsed && hintIngredient === ingredient;
        const isNew = !isUsed && newIngredients.includes(ingredient);

        return (
          <button
            key={`${ingredient}-${idx}`}
            type="button"
            onClick={() => handleClick(ingredient, isUsed)}
            aria-label={isUsed ? `${name} (usado)` : `Ingrediente: ${name}`}
            aria-disabled={isUsed}
            className={`
              relative flex flex-col items-center justify-center gap-0.5
              min-h-[56px] sm:min-h-[64px] w-full py-1.5 sm:py-2
              text-xl sm:text-4xl
              rounded-xl sm:rounded-2xl border-2
              select-none transition-colors duration-150
              ${isUsed
                ? 'bg-gray-50 border-gray-100 opacity-35 cursor-default'
                : `bg-white border-amber-100 cursor-pointer shadow-sm
                   hover:scale-105 hover:shadow-md hover:border-amber-300
                   focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
                   active:scale-95
                   ${isShaking ? 'animate-shake !bg-red-50 !border-red-300' : ''}
                   ${isHint ? 'animate-glow border-amber-400 shadow-md' : ''}`
              }
            `}
            style={{ touchAction: 'manipulation' }}
          >
            <span aria-hidden="true">{ingredient}</span>
            {!hideNames && (
              <span className={`text-[9px] sm:text-xs font-bold leading-tight ${isUsed ? 'text-gray-300' : 'text-amber-700'}`} aria-hidden="true">
                {name}
              </span>
            )}
            {isNew && (
              <span className="absolute -top-1.5 -right-1.5 text-xs bg-amber-100 rounded-full px-1 font-black shadow-sm animate-pop-in" aria-hidden="true">
                🌟
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default IngredientPanel;
