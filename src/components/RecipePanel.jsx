/**
 * RecipePanel — Panel de receta (estilo Lingokids: limpio, progreso claro, sin ruido).
 */
const RecipePanel = ({
  recipe, ingredientProgress, timeRemaining, totalTime, errorsInCurrentDish, maxErrors, hideGuide = false,
}) => {
  const totalDeciseconds = totalTime * 10;
  const percentage = totalDeciseconds > 0 ? timeRemaining / totalDeciseconds : 0;
  const secondsLeft = Math.ceil(timeRemaining / 10);

  let barColor;
  let barBlink = false;
  if (percentage > 0.5) barColor = '#4ADE80';
  else if (percentage >= 0.25) barColor = '#FBBF24';
  else { barColor = '#F87171'; barBlink = true; }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 px-3 py-1.5 mx-1 sm:mx-4 w-full" style={{ gap: 0 }}>
      {/* Recipe name + timer en la misma fila */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="font-black text-xs text-amber-900 leading-tight truncate">
          📋 {recipe.name}
        </div>
        {/* Timer inline */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100${barBlink ? ' animate-blink' : ''}`}
              style={{ width: `${Math.max(percentage * 100, 0)}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="text-xs font-black min-w-[1.5rem] text-right" style={{ color: barColor }}>
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Ingredient sequence — oculta en modo memoria */}
      {!hideGuide && (
        <div className="flex flex-wrap items-center gap-0.5 justify-center mb-1">
          {recipe.ingredients.map((ingredient, idx) => {
            const isDone = idx < ingredientProgress;
            const isCurrent = idx === ingredientProgress;
            return (
              <span key={idx} className="flex items-center">
                <span className={`
                  inline-flex flex-col items-center justify-center rounded-lg px-1 py-0
                  text-sm sm:text-xl transition-all duration-200
                  ${isDone ? 'bg-green-50 border-2 border-green-300 opacity-50 scale-90' : ''}
                  ${isCurrent ? 'bg-amber-50 border-2 border-amber-400 shadow-sm scale-105' : ''}
                  ${!isDone && !isCurrent ? 'bg-gray-50 border-2 border-gray-200 opacity-40' : ''}
                `}>
                  <span className="text-[7px] font-black text-amber-600 leading-none">{idx + 1}</span>
                  <span>{isDone ? '✅' : ingredient}</span>
                </span>
                {idx < recipe.ingredients.length - 1 && (
                  <span className="text-amber-200 mx-px text-[10px] font-black">›</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Modo memoria */}
      {hideGuide && (
        <div className="flex items-center justify-center mb-1">
          <span className="text-xs font-black text-amber-400">
            {ingredientProgress}/{recipe.ingredients.length} 🧠
          </span>
        </div>
      )}

      {/* Error counter — hearts, sin separador de fila */}
      <div className="flex items-center justify-center gap-0.5" role="status" aria-label={`${secondsLeft} segundos restantes`}>
        {Array.from({ length: maxErrors }, (_, i) => (
          <span key={i} className={`text-xs ${i < errorsInCurrentDish ? '' : 'opacity-20'}`}>
            {i < errorsInCurrentDish ? '💔' : '🤍'}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecipePanel;
