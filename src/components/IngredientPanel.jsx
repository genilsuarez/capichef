/**
 * IngredientPanel — Grid de ingredientes (estilo Lingokids: botones claros, colores suaves, sin ruido).
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { INGREDIENT_POOL } from '../state/recipes.js';

const EMOJI_TO_NAME = new Map(INGREDIENT_POOL.map((item) => [item.emoji, item.name]));
function getIngredientName(emoji) { return EMOJI_TO_NAME.get(emoji) || emoji; }

const IngredientPanel = ({
  availableIngredients, onIngredientClick, lastClickResult,
  lastClickedIngredient, hintIngredient, newIngredients = [], hideNames = false,
}) => {
  const [disappearing, setDisappearing] = useState(new Set());
  const debounceRef = useRef(new Map());
  const [shakingIngredient, setShakingIngredient] = useState(null);

  // Limpiar disappearing cuando cambia el panel de ingredientes (nuevo nivel)
  useEffect(() => {
    setDisappearing(new Set());
  }, [availableIngredients]);

  useEffect(() => {
    if (lastClickResult === 'correct' && lastClickedIngredient) {
      setDisappearing((prev) => new Set([...prev, lastClickedIngredient]));
      const timer = setTimeout(() => {
        setDisappearing((prev) => { const next = new Set(prev); next.delete(lastClickedIngredient); return next; });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [lastClickResult, lastClickedIngredient]);

  useEffect(() => {
    if (lastClickResult === 'incorrect' && lastClickedIngredient) {
      setShakingIngredient(lastClickedIngredient);
      const timer = setTimeout(() => setShakingIngredient(null), 300);
      return () => clearTimeout(timer);
    }
  }, [lastClickResult, lastClickedIngredient]);

  const handleClick = useCallback((ingredient) => {
    const now = Date.now();
    const lastClick = debounceRef.current.get(ingredient) || 0;
    if (now - lastClick < 200) return;
    debounceRef.current.set(ingredient, now);
    onIngredientClick(ingredient);
  }, [onIngredientClick]);

  const visibleIngredients = availableIngredients.filter(
    (ing) => !disappearing.has(ing)
  );

  return (
    <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-1.5 sm:gap-2 px-1 sm:px-4 w-full"
         role="group" aria-label="Panel de ingredientes">
      {visibleIngredients.map((ingredient) => {
        const name = getIngredientName(ingredient);
        const isShaking = shakingIngredient === ingredient;
        const isHint = hintIngredient === ingredient;
        const isNew = newIngredients.includes(ingredient);

        return (
          <button
            key={ingredient}
            type="button"
            onClick={() => handleClick(ingredient)}
            aria-label={`Ingrediente: ${name}`}
            className={`
              relative flex flex-col items-center justify-center gap-0.5
              min-h-[56px] sm:min-h-[64px] w-full py-1.5 sm:py-2
              text-xl sm:text-4xl
              rounded-xl sm:rounded-2xl bg-white border-2 border-amber-100
              cursor-pointer select-none shadow-sm
              transition-all duration-150 ease-out
              hover:scale-105 hover:shadow-md hover:border-amber-300
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
              active:scale-95
              ${isShaking ? 'animate-shake !bg-red-50 !border-red-300' : ''}
              ${isHint ? 'animate-glow border-amber-400 shadow-md' : ''}
            `}
            style={{ touchAction: 'manipulation' }}
          >
            <span aria-hidden="true">{ingredient}</span>
            {!hideNames && (
              <span className="text-[9px] sm:text-xs font-bold text-amber-700 leading-tight" aria-hidden="true">{name}</span>
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
