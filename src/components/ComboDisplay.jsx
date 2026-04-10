/**
 * ComboDisplay — Indicador visual de combo (estilo limpio).
 */
import { getComboMultiplier } from '../state/gameReducer';

const ComboDisplay = ({ combo, milestone }) => {
  const multiplier = getComboMultiplier(combo);
  if (combo < 2) return null;

  const milestoneMessage =
    milestone === 3 ? '🔥 ¡Combo x3!' :
    milestone === 6 ? '⚡ ¡Imparable!' :
    milestone === 10 ? '👑 ¡Leyenda!' : null;

  return (
    <div aria-live="polite" className="flex flex-col items-center gap-1 select-none">
      <span className="animate-pop-in inline-block rounded-full bg-amber-100 border-2 border-amber-300 px-4 py-1 text-base sm:text-lg font-black text-amber-800 shadow-sm"
            key={combo}>
        🔥 ×{multiplier} COMBO!
      </span>
      {milestoneMessage && (
        <span className="animate-pop-in text-sm font-black text-amber-600" key={`milestone-${milestone}`}>
          {milestoneMessage}
        </span>
      )}
    </div>
  );
};

export default ComboDisplay;
