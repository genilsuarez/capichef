/**
 * AchievementsPanel — Panel de logros para niños.
 *
 * Diseño visual grande y celebratorio: cada logro es una tarjeta
 * con emoji grande, nombre y estado (desbloqueado/bloqueado).
 * Los desbloqueados brillan con animación, los bloqueados están en gris.
 */
import { ACHIEVEMENT_DEFINITIONS } from '../constants/achievementDefinitions';

const AchievementsPanel = ({ unlockedAchievements = [], onClose, isOpen }) => {
  if (!isOpen) return null;

  const unlocked = unlockedAchievements.length;
  const total = ACHIEVEMENT_DEFINITIONS.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panel de logros"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-md mx-0 sm:mx-4 max-h-[92vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-amber-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-amber-900">🏆 Mis Logros</h2>
            <p className="text-xs font-bold text-amber-500 mt-0.5">
              {unlocked} de {total} desbloqueados
            </p>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-lg font-bold transition-all active:scale-90"
            onClick={onClose}
            aria-label="Cerrar logros"
            style={{ touchAction: 'manipulation' }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 shrink-0">
          <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(unlocked / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Grid de logros */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all
                    ${isUnlocked
                      ? 'bg-amber-50 shadow-sm'
                      : 'bg-gray-100 opacity-50'
                    }`}
                  aria-label={isUnlocked ? `Logro desbloqueado: ${achievement.name}` : `Logro bloqueado: ${achievement.unlockCondition}`}
                >
                  <span
                    className={`text-4xl leading-none ${isUnlocked ? 'animate-wobble' : 'grayscale'}`}
                    aria-hidden="true"
                  >
                    {isUnlocked ? achievement.emoji : '🔒'}
                  </span>
                  <span className={`text-xs font-black leading-tight ${isUnlocked ? 'text-amber-900' : 'text-gray-500'}`}>
                    {achievement.name}
                  </span>
                  {isUnlocked && (
                    <span className="text-[10px] text-amber-600 leading-tight">
                      {achievement.description}
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="text-[10px] text-gray-400 leading-tight">
                      {achievement.unlockCondition}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;
