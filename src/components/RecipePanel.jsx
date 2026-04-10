/**
 * RecipePanel — Panel de receta (estilo Lingokids: limpio, progreso claro, sin ruido).
 */
const RecipePanel = ({
  recipe, ingredientProgress, timeRemaining, totalTime, errorsInCurrentDish, maxErrors,
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
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 px-3 sm:px-4 py-2.5 sm:py-3 mx-2 sm:mx-4 space-y-2">
      {/* Recipe name */}
      <div className="font-black text-sm sm:text-base text-amber-900 text-center">
        📋 {recipe.name}
      </div>

      {/* Ingredient sequence */}
      <div className="flex flex-wrap items-center gap-1.5 justify-center">
        {recipe.ingredients.map((ingredient, idx) => {
          const isDone = idx < ingredientProgress;
          const isCurrent = idx === ingredientProgress;
          return (
            <span key={idx} className="flex items-center">
              <span className={`
                inline-flex flex-col items-center justify-center rounded-xl px-1.5 py-0.5
                text-lg sm:text-2xl transition-all duration-200
                ${isDone ? 'bg-green-50 border-2 border-green-300 opacity-50 scale-90' : ''}
                ${isCurrent ? 'bg-amber-50 border-2 border-amber-400 shadow-md scale-105' : ''}
                ${!isDone && !isCurrent ? 'bg-gray-50 border-2 border-gray-200 opacity-40' : ''}
              `}>
                <span className="text-[9px] font-black text-amber-600 leading-none">{idx + 1}</span>
                <span>{isDone ? '✅' : ingredient}</span>
              </span>
              {idx < recipe.ingredients.length - 1 && (
                <span className="text-amber-300 mx-0.5 text-sm font-black">→</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Timer bar */}
      <div role="status" aria-label={`${secondsLeft} segundos restantes`}>
        <div className="flex items-center gap-2">
          <span className="text-xs">⏱️</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100${barBlink ? ' animate-blink' : ''}`}
              style={{ width: `${Math.max(percentage * 100, 0)}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="text-xs font-black min-w-[2rem] text-right" style={{ color: barColor }}>
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Error counter — hearts */}
      <div className="flex items-center justify-center gap-0.5">
        {Array.from({ length: maxErrors }, (_, i) => (
          <span key={i} className={`text-sm ${i < errorsInCurrentDish ? '' : 'opacity-20'}`}>
            {i < errorsInCurrentDish ? '💔' : '🤍'}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecipePanel;
