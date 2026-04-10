import { useEffect } from 'react';

/**
 * AchievementToast — Toast notification for newly unlocked achievements.
 *
 * Shows in the top-right corner with a slideIn animation (slides from right).
 * Auto-dismisses after 3 seconds by calling onDismiss.
 *
 * @param {{
 *   achievement: { id: string, name: string, emoji: string, description: string } | null,
 *   onDismiss: () => void
 * }} props
 */
const AchievementToast = ({ achievement, onDismiss }) => {
  useEffect(() => {
    if (!achievement) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] animate-slide-in max-w-[calc(50vw-8px)] sm:max-w-xs"
      style={{ right: 'max(1rem, calc(50vw - 240px + 8px))' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-xl shadow-lg px-4 py-3 min-w-[240px] max-w-xs">
        <span className="text-3xl" aria-hidden="true">🏆</span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-yellow-700">¡Logro desbloqueado!</span>
          <span className="text-sm font-bold text-amber-900">
            {achievement.emoji} {achievement.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
