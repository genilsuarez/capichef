import { useState } from 'react';
import { SKIN_DEFINITIONS } from '../constants/skinDefinitions';
import { ACHIEVEMENT_DEFINITIONS } from '../constants/achievementDefinitions';
import Capibara from './Capibara';

/**
 * ProfilePanel — Modal de perfil con 4 pestañas:
 * 🎨 Skins | 🏆 Logros | 📊 Stats | 📅 Historial
 */
const TABS = [
  { id: 'skins',       label: '🎨 Skins' },
  { id: 'achievements', label: '🏆 Logros' },
  { id: 'stats',       label: '📊 Stats' },
  { id: 'history',     label: '📅 Historial' },
];

const ProfilePanel = ({ profile, history, onClose, onSkinChange, isOpen }) => {
  const [previewSkin, setPreviewSkin] = useState(null);
  const [activeTab, setActiveTab] = useState('skins');

  if (!isOpen) return null;

  const { name, selectedSkin, unlockedSkins, stats } = profile;

  const activeSkin = previewSkin || selectedSkin;
  const activeSkinDef = SKIN_DEFINITIONS.find((s) => s.id === activeSkin) || SKIN_DEFINITIONS[0];

  const mathAccuracy =
    stats.totalMathTotal > 0
      ? Math.round((stats.totalMathCorrect / stats.totalMathTotal) * 100)
      : 0;

  const handleSkinSelect = (skinId) => {
    setPreviewSkin(skinId);
    onSkinChange(skinId);
  };

  const handleClose = () => {
    setPreviewSkin(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panel de perfil"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col animate-pop-in"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente festivo */}
        <div
          className="relative flex-shrink-0 rounded-t-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 50%, #f97316 100%)' }}
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/30 text-white text-lg font-bold hover:bg-white/50 transition-colors z-10"
            onClick={handleClose}
            aria-label="Cerrar perfil"
            style={{ touchAction: 'manipulation' }}
          >
            ✕
          </button>

          {/* Estrellas decorativas */}
          <div className="absolute top-2 left-4 text-white/40 text-2xl select-none">⭐</div>
          <div className="absolute top-6 left-12 text-white/25 text-sm select-none">✨</div>
          <div className="absolute bottom-4 right-12 text-white/30 text-xl select-none">🌟</div>
          <div className="absolute top-3 right-14 text-white/20 text-xs select-none">⭐</div>

          {/* Capybara + nombre */}
          <div className="flex flex-col items-center gap-1 pt-6 pb-4 px-4">
            <div className="bg-white/20 rounded-full p-3 shadow-lg">
              <Capibara state="idle" skin={activeSkin} hideStateText />
            </div>
            <p className="text-lg font-black text-white mt-2 drop-shadow">{name || 'Chef Anónimo'}</p>
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
              {activeSkinDef.name}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-2 text-sm font-semibold transition-colors
                ${activeTab === tab.id
                  ? 'text-amber-600 border-b-2 border-amber-500'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              onClick={() => setActiveTab(tab.id)}
              style={{ touchAction: 'manipulation' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content — scrollable */}
        <div className="overflow-y-auto flex-1 p-4">

          {/* ── SKINS ── */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-3 gap-2">
              {SKIN_DEFINITIONS.map((skin) => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isActive = activeSkin === skin.id;

                return (
                  <button
                    key={skin.id}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all
                      ${isActive
                        ? 'bg-amber-100 ring-2 ring-amber-500 scale-105'
                        : isUnlocked
                          ? 'bg-gray-50 hover:bg-amber-50 active:scale-95'
                          : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    onClick={() => isUnlocked && handleSkinSelect(skin.id)}
                    disabled={!isUnlocked}
                    aria-label={
                      isUnlocked
                        ? `Seleccionar skin ${skin.name}`
                        : `Bloqueada: ${skin.unlockCondition}`
                    }
                    style={{ touchAction: 'manipulation', userSelect: 'none' }}
                  >
                    <div className="relative inline-flex items-center justify-center">
                      <span className={`text-2xl ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>
                        {skin.emoji}
                      </span>
                      {!isUnlocked && (
                        <span className="absolute -top-1 -right-1 text-sm leading-none">🔒</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium leading-tight ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                      {skin.name}
                    </span>
                    <span className={`text-[10px] leading-tight ${isUnlocked ? 'text-amber-500' : 'text-gray-400'}`}>
                      {skin.unlockCondition}
                    </span>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── LOGROS ── */}
          {activeTab === 'achievements' && (() => {
            const unlockedAchievements = profile.unlockedAchievements || [];
            const unlocked = unlockedAchievements.length;
            const total = ACHIEVEMENT_DEFINITIONS.length;
            return (
              <div>
                {/* Barra de progreso */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold">{unlocked} de {total} desbloqueados</span>
                    <span className="font-bold text-amber-500">{Math.round((unlocked/total)*100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${(unlocked / total) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center
                          ${isUnlocked ? 'bg-amber-50' : 'bg-gray-100'}`}
                        aria-label={isUnlocked ? `Logro: ${achievement.name}` : `Bloqueado: ${achievement.unlockCondition}`}
                      >
                        <span className={`text-3xl leading-none ${!isUnlocked ? 'grayscale opacity-40' : 'animate-wobble'}`}>
                          {achievement.emoji}
                        </span>
                        <span className={`text-xs font-black leading-tight ${isUnlocked ? 'text-amber-900' : 'text-gray-400'}`}>
                          {achievement.name}
                        </span>
                        <span className={`text-[10px] leading-tight ${isUnlocked ? 'text-amber-600' : 'text-gray-400'}`}>
                          {isUnlocked ? achievement.description : achievement.unlockCondition}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-2">
              <StatCard emoji="⭐" label="Mejor nivel" value={stats.bestLevel} />
              <StatCard emoji="🪙" label="Monedas totales" value={stats.totalCoins} />
              <StatCard emoji="🍽️" label="Platos completados" value={stats.totalDishes} />
              <StatCard emoji="🧠" label="Precisión matemática" value={`${mathAccuracy}%`} />
              <StatCard emoji="🔥" label="Mejor combo" value={stats.bestComboEver} />
              <StatCard emoji="🎮" label="Partidas jugadas" value={stats.gamesPlayed} />
            </div>
          )}

          {/* ── HISTORIAL ── */}
          {activeTab === 'history' && (
            history && history.length > 0 ? (
              <div className="space-y-2">
                {history.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-xs text-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Nivel {entry.levelReached}</span>
                      <span className="text-gray-400">{entry.date}</span>
                    </div>
                    <div className="flex gap-3 text-right">
                      <span>🪙 {entry.coinsEarned}</span>
                      <span>🧠 {entry.mathAccuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-4xl mb-2">🍽️</span>
                <p className="text-sm">Aún no hay partidas guardadas</p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ emoji, label, value }) => (
  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
    <span className="text-lg">{emoji}</span>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  </div>
);

export default ProfilePanel;
