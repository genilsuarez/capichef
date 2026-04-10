/**
 * StartScreen — Pantalla de inicio de CapiChef.
 *
 * Rediseño v4: Consistencia con componentes reutilizables.
 * - Usa componente Capibara (con accesorio contextual) en vez de emoji directo
 * - Usa componente SpeechBubble en vez de div hardcodeado
 * - Score arriba a la derecha (principio #3: convención de juegos)
 * - Tab bar inferior con 4 iconos: Perfil, Inicio, Ajustes, Ayuda
 * - Contenedor centrado para web (app-shell en App.jsx)
 * - Sin menú hamburguesa — todo accesible desde el tab bar
 *
 * Inspirado en Lingokids, Khan Academy Kids (iconos grandes).
 * Ref: https://agentestudio.com/blog/best-practices-mobile-navigation-design
 */
import { useState, useEffect } from 'react';
import Capibara from './Capibara';

const StartScreen = ({ highScore, bestLevel = 0, totalCoins = 0, playerName, selectedSkin = 'classic', onStart, onOpenConfig, onOpenProfile, onOpenTutorial, onOpenAchievements }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  useEffect(() => { setMounted(true); }, []);

  // Tab handler — home is default, others trigger their panels
  const handleTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'profile' && onOpenProfile) onOpenProfile();
    if (tab === 'settings' && onOpenConfig) onOpenConfig();
    if (tab === 'help' && onOpenTutorial) onOpenTutorial();
    if (tab === 'achievements' && onOpenAchievements) onOpenAchievements();
    setTimeout(() => setActiveTab(''), 300);
  };

  return (
    <div className="start-screen-root flex flex-col overflow-hidden">

      {/* ── TARJETA CENTRAL — ocupa casi toda la pantalla ── */}
      <div className="start-screen-card">

        {/* Score — esquina superior derecha dentro de la tarjeta */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {bestLevel > 0 && (
            <div className="flex items-center gap-1 bg-purple-100 rounded-2xl px-2.5 py-1">
              <span className="text-base" aria-hidden="true">⭐</span>
              <span className="text-base font-black text-purple-700">Nv.{bestLevel}</span>
            </div>
          )}
        </div>

        {/* Character */}
        <Capibara state="idle" skin={selectedSkin} hideStateText />

        {/* Logo + saludo */}
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight" style={{ color: '#7C3AED' }}>
            CapiChef
          </h1>
          {playerName && (
            <p className="text-xl font-extrabold mt-1" style={{ color: '#C026D3' }}>
              ¡Hola, {playerName}! 👋
            </p>
          )}
        </div>

        {/* Monedas — destacado, grande, festivo */}
        <div
          className={`flex items-center justify-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-3xl px-6 py-3 w-full max-w-xs transition-all duration-500 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          aria-label={`${totalCoins} monedas acumuladas`}
        >
          <span className="text-4xl animate-float" aria-hidden="true">🪙</span>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-3xl font-black text-amber-600">{totalCoins.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">monedas</span>
          </div>
        </div>

        {/* Mode buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-1">
          <button
            className="btn-candy w-full py-5 text-white text-2xl rounded-2xl flex items-center justify-center gap-3"
            style={{ background: '#16C60C', '--btn-shadow-color': '#0a7a06' }}
            onClick={() => onStart('classic')}
          >
            <span className="text-3xl">🍳</span>
            <span>¡A Jugar!</span>
          </button>

          <div className="flex gap-3">
            <button
              className="btn-candy flex-1 py-4 text-white rounded-2xl flex flex-col items-center gap-1.5"
              style={{ background: '#0EA5E9', '--btn-shadow-color': '#0369a1' }}
              onClick={() => onStart('practice')}
            >
              <span className="text-2xl">🍳</span>
              <span className="text-base font-black">Práctica</span>
              <span className="text-[10px] opacity-80">Recetas</span>
            </button>
            <button
              className="btn-candy flex-1 py-4 text-white rounded-2xl flex flex-col items-center gap-1.5"
              style={{ background: '#8B5CF6', '--btn-shadow-color': '#6d28d9' }}
              onClick={() => onStart('practice_math')}
            >
              <span className="text-2xl">🧮</span>
              <span className="text-base font-black">Práctica</span>
              <span className="text-[10px] opacity-80">Matemáticas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TAB BAR ── */}
      <nav className="tab-bar shrink-0" aria-label="Navegación">
        <div className="flex items-center justify-around w-full">
          <button
            className={`tab-bar-btn flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'tab-active' : ''}`}
            style={{ touchAction: 'manipulation' }}
            onClick={() => handleTab('profile')}
            aria-label="Mi Perfil"
          >
            <span className="tab-bar-icon">📊</span>
            <span className="tab-bar-label font-bold">Perfil</span>
          </button>

          {onOpenConfig && (
            <button
              className={`tab-bar-btn flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'tab-active' : ''}`}
              style={{ touchAction: 'manipulation' }}
              onClick={() => handleTab('settings')}
              aria-label="Ajustes"
            >
              <span className="tab-bar-icon">⚙️</span>
              <span className="tab-bar-label font-bold">Ajustes</span>
            </button>
          )}

          {onOpenTutorial && (
            <button
              className={`tab-bar-btn flex flex-col items-center gap-1 ${activeTab === 'help' ? 'tab-active' : ''}`}
              style={{ touchAction: 'manipulation' }}
              onClick={() => handleTab('help')}
              aria-label="Cómo jugar"
            >
              <span className="tab-bar-icon">📖</span>
              <span className="tab-bar-label font-bold">Ayuda</span>
            </button>
          )}

          {onOpenAchievements && null}
        </div>
      </nav>
    </div>
  );
};

export default StartScreen;
