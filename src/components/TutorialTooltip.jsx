/**
 * TutorialTooltip — Tooltip animado para el primer nivel de CapiChef.
 *
 * Muestra "¡Busca [ingrediente] y tócalo! 👆" indicando claramente cuál
 * es el ingrediente correcto. Solo visible cuando isVisible es true.
 * Desaparece al primer click correcto.
 *
 * @param {{
 *   isVisible: boolean,
 *   ingredientName: string,
 *   ingredientEmoji: string,
 * }} props
 */
const TutorialTooltip = ({ isVisible, ingredientName = '', ingredientEmoji = '' }) => {
  if (!isVisible) return null;

  const label = ingredientName
    ? `Busca ${ingredientEmoji} ${ingredientName} y tócalo`
    : 'Toca el primer ingrediente';

  return (
    <div
      className="flex items-center justify-center animate-bounce"
      role="tooltip"
      aria-label={label}
    >
      <div className="bg-amber-400 text-amber-900 font-bold text-sm sm:text-base px-4 py-2 rounded-xl shadow-lg">
        {ingredientName
          ? `¡Busca ${ingredientEmoji} ${ingredientName} y tócalo! 👆`
          : '¡Toca el primer ingrediente! 👆'}
      </div>
    </div>
  );
};

export default TutorialTooltip;
