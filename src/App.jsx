/**
 * App — Root component for CapiChef.
 *
 * Uses useReducer(gameReducer, initialState) for global game state.
 * Uses useReducer(appReducer, initialAppState) for persistent app state.
 * Routes screens based on state.screen value.
 * Runs a 100ms timer interval when screen='playing'.
 * Applies accessibility CSS classes based on config.
 *
 * @module App
 */
import { useReducer, useEffect, useState, useRef, useCallback } from 'react';
import { gameReducer, initialState } from './state/gameReducer';
import { appReducer, initialAppState } from './state/appReducer';
import { loadConfig, saveConfig } from './state/config';
import { loadProfile, saveProfile } from './state/profile';
import { loadHistory, addHistoryEntry as persistHistoryEntry, loadSession, saveSession } from './services/storageService';
import { generateShareText, copyToClipboard } from './services/clipboardService';
import { useAchievements } from './hooks/useAchievements';
import { useHaptics } from './hooks/useHaptics';
import { ACHIEVEMENT_DEFINITIONS } from './constants/achievementDefinitions';
import StartScreen from './components/StartScreen';
import GamePlay from './components/GamePlay';
import LevelComplete from './components/LevelComplete';
import GameOver from './components/GameOver';
import MathChallengeComponent from './components/MathChallenge';
import ConfigPanel from './components/ConfigPanel';
import ProfilePanel from './components/ProfilePanel';
import OnboardingScreen from './components/OnboardingScreen';
import AchievementsPanel from './components/AchievementsPanel';
import AchievementToast from './components/AchievementToast';
import PauseOverlay from './components/PauseOverlay';

import TutorialModal from './components/TutorialModal';

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [appState, appDispatch] = useReducer(appReducer, initialAppState);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [achievementsPanelOpen, setAchievementsPanelOpen] = useState(false);

  // Evaluate achievements after game state changes
  useAchievements(state, appState, appDispatch);

  // Haptic feedback (vibration) — watches gameState for clicks, lives, achievements
  useHaptics(state);

  // Bridge: when appState unlocks a new achievement, add it to gameState.pendingAchievements for the toast queue
  const prevUnlockedRef = useRef(appState.profile.unlockedAchievements);

  // Track whether we've already saved a history entry for the current game session
  const historySavedRef = useRef(false);

  // Reset historySaved flag when a new game starts
  useEffect(() => {
    if (state.screen === 'playing' && state.level === 1) {
      historySavedRef.current = false;
    }
  }, [state.screen, state.level]);

  /**
   * Create a GameHistoryEntry from the current game state and save it.
   */
  const saveGameToHistory = useCallback(() => {
    if (historySavedRef.current) return;
    historySavedRef.current = true;

    const mathAccuracy = state.mathChallengesTotal > 0
      ? Math.round((state.mathChallengesCorrect / state.mathChallengesTotal) * 100)
      : 0;

    const entry = {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      mode: state.gameMode || 'classic',
      levelReached: state.level,
      coinsEarned: state.coins,
      mathAccuracy,
      bestCombo: state.bestCombo,
      dishesCompleted: state.dishesCompleted,
      durationSeconds: state.gameStartTime ? Math.round((Date.now() - state.gameStartTime) / 1000) : 0,
    };

    appDispatch({ type: 'ADD_HISTORY_ENTRY', payload: entry });
    persistHistoryEntry(entry);
  }, [state.gameMode, state.level, state.coins, state.mathChallengesCorrect, state.mathChallengesTotal, state.bestCombo, state.dishesCompleted, state.gameStartTime, appDispatch]);
  useEffect(() => {
    const prev = prevUnlockedRef.current;
    const current = appState.profile.unlockedAchievements;
    if (current.length > prev.length) {
      const newIds = current.filter((id) => !prev.includes(id));
      for (const id of newIds) {
        dispatch({ type: 'ADD_PENDING_ACHIEVEMENT', payload: id });
      }
      // Persist profile immediately on unlock
      saveProfile(appState.profile);
    }
    prevUnlockedRef.current = current;
  }, [appState.profile.unlockedAchievements]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dismiss handler for achievement toast
  const handleDismissAchievement = useCallback(() => {
    dispatch({ type: 'DISMISS_ACHIEVEMENT' });
  }, []);

  // Load persisted config and profile on mount
  useEffect(() => {
    const persistedConfig = loadConfig();
    appDispatch({ type: 'UPDATE_CONFIG', payload: persistedConfig });

    const persistedProfile = loadProfile();
    const persistedHistory = loadHistory();
    const persistedSession = loadSession();

    // Restaurar highScore y bestLevel en el gameReducer
    dispatch({ type: 'INIT_SESSION', payload: persistedSession });

    if (persistedProfile) {
      appDispatch({
        type: 'LOAD_PERSISTED_STATE',
        payload: {
          ...initialAppState,
          config: persistedConfig || initialAppState.config,
          profile: persistedProfile,
          history: persistedHistory,
          isFirstLaunch: false,
        },
      });
    } else if (persistedHistory.length > 0) {
      // History exists but no profile — still load history
      appDispatch({
        type: 'LOAD_PERSISTED_STATE',
        payload: {
          ...initialAppState,
          config: persistedConfig || initialAppState.config,
          history: persistedHistory,
        },
      });
    }
  }, []);

  // Persistir highScore y bestLevel en localStorage cada vez que cambian
  useEffect(() => {
    if (state.highScore > 0 || state.bestLevel > 0) {
      saveSession({ highScore: state.highScore, bestLevel: state.bestLevel });
    }
  }, [state.highScore, state.bestLevel]);

  // Timer: tick every 100ms when playing
  useEffect(() => {
    if (state.screen !== 'playing') return;
    if (state.timeRemaining <= 0) return;

    const intervalId = setInterval(() => {
      dispatch({ type: 'TIMER_TICK' });
    }, 100);

    return () => clearInterval(intervalId);
  }, [state.screen, state.timeRemaining]);

  // Dispatch TIME_UP when timer reaches 0 while playing
  useEffect(() => {
    if (state.screen === 'playing' && state.timeRemaining <= 0) {
      dispatch({ type: 'TIME_UP' });
    }
  }, [state.screen, state.timeRemaining]);

  // Auto-pause on visibilitychange (mobile tab switch / screen lock)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.screen === 'playing') {
        dispatch({ type: 'PAUSE_GAME' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.screen]);

  // Auto-clear speech bubble after 2.5 seconds (Req 18.3)
  useEffect(() => {
    if (!state.speechBubbleMessage) return;
    const timerId = setTimeout(() => {
      dispatch({ type: 'SPEECH_BUBBLE_CLEAR' });
    }, 2500);
    return () => clearTimeout(timerId);
  }, [state.speechBubbleMessage]);

  // Update historical stats and check skin unlocks on game over o al salir al menú
  useEffect(() => {
    const isEnding = state.screen === 'gameOver' || state.screen === 'start';
    if (!isEnding) return;

    // Save game to history (solo en game over, no en cada vuelta al menú)
    if (state.screen === 'gameOver') {
      saveGameToHistory();
    }

    // Solo actualizar stats si hubo partida real (al menos 1 nivel jugado)
    if (!state.gameStartTime) return;

    const currentStats = appState.profile.stats;
    const updatedStats = {
      bestLevel: Math.max(currentStats.bestLevel, state.level),
      totalCoins: currentStats.totalCoins + state.coins,
      totalDishes: currentStats.totalDishes + state.dishesCompleted,
      totalMathCorrect: currentStats.totalMathCorrect + state.mathChallengesCorrect,
      totalMathTotal: currentStats.totalMathTotal + state.mathChallengesTotal,
      bestComboEver: Math.max(currentStats.bestComboEver, state.bestCombo),
      gamesPlayed: currentStats.gamesPlayed + (state.screen === 'gameOver' ? 1 : 0),
    };

    appDispatch({ type: 'UPDATE_STATS', payload: updatedStats });

    // Check skin unlocks
    const newSkins = [];
    const unlocked = appState.profile.unlockedSkins;
    const stats = updatedStats;

    // Chef Mexicano — completar 1 plato
    if (stats.totalDishes >= 1 && !unlocked.includes('mexican')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'mexican' });
      newSkins.push('mexican');
    }
    // Chef Japonés — jugar 2 partidas
    if (stats.gamesPlayed >= 2 && !unlocked.includes('japanese')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'japanese' });
      newSkins.push('japanese');
    }
    // Chef Pirata — completar 5 platos
    if (stats.totalDishes >= 5 && !unlocked.includes('pirate')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'pirate' });
      newSkins.push('pirate');
    }
    // Chef Vaquero — jugar 5 partidas
    if (stats.gamesPlayed >= 5 && !unlocked.includes('cowboy')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'cowboy' });
      newSkins.push('cowboy');
    }
    // Chef Mago — acertar 10 matemáticas
    if (stats.totalMathCorrect >= 10 && !unlocked.includes('wizard')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'wizard' });
      newSkins.push('wizard');
    }
    // Chef Espacial — llegar al nivel 10
    if (state.level >= 10 && !unlocked.includes('space')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'space' });
      newSkins.push('space');
    }
    // Chef Ninja — combo x15
    if (state.bestCombo >= 15 && !unlocked.includes('ninja')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'ninja' });
      newSkins.push('ninja');
    }
    // Chef Vikingo — llegar al nivel 20
    if (state.level >= 20 && !unlocked.includes('viking')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'viking' });
      newSkins.push('viking');
    }
    // Chef Científico — 80% precisión en matemáticas con mínimo 20 intentos
    if (
      stats.totalMathTotal >= 20 &&
      stats.totalMathCorrect / stats.totalMathTotal >= 0.8 &&
      !unlocked.includes('scientist')
    ) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'scientist' });
      newSkins.push('scientist');
    }
    // Chef Legendario — 500 monedas totales
    if (stats.totalCoins >= 500 && !unlocked.includes('legendary')) {
      appDispatch({ type: 'UNLOCK_SKIN', payload: 'legendary' });
      newSkins.push('legendary');
    }

    // Guardar profile actualizado
    const updatedProfile = {
      ...appState.profile,
      stats: updatedStats,
      unlockedSkins: [...new Set([...appState.profile.unlockedSkins, ...newSkins])],
    };
    saveProfile(updatedProfile);
  }, [state.screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveConfig = (newConfig) => {
    appDispatch({ type: 'UPDATE_CONFIG', payload: newConfig });
    saveConfig(newConfig);
    // No cerramos el panel — el autosave llama esto en cada cambio
  };

  const handleSkinChange = (skinId) => {
    appDispatch({ type: 'CHANGE_SKIN', payload: skinId });
    saveProfile({ ...appState.profile, selectedSkin: skinId });
  };

  // Build dynamic CSS classes for accessibility
  const config = appState.config;
  const rootClasses = [
    config.textLarge ? 'text-large' : '',
    config.highContrast ? 'high-contrast' : '',
  ].filter(Boolean).join(' ');

  const rootStyle = {
    '--animation-speed-multiplier': config.reducedAnimations ? 2 : 1,
  };

  // Toggle overflow:hidden on body during gameplay to prevent scroll on mobile (Req 17.9)
  useEffect(() => {
    const isGameplay = state.screen === 'playing' || state.screen === 'paused';
    if (isGameplay) {
      document.body.classList.add('gameplay-active');
    } else {
      document.body.classList.remove('gameplay-active');
    }
    return () => document.body.classList.remove('gameplay-active');
  }, [state.screen]);

  // Screen router
  const renderScreen = () => {
    switch (state.screen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            onComplete={(name) => {
              appDispatch({ type: 'COMPLETE_ONBOARDING', payload: name });
              saveProfile({
                name,
                selectedSkin: 'classic',
                unlockedSkins: ['classic'],
                unlockedAchievements: [],
                stats: {
                  bestLevel: 0,
                  totalCoins: 0,
                  totalDishes: 0,
                  totalMathCorrect: 0,
                  totalMathTotal: 0,
                  bestComboEver: 0,
                  gamesPlayed: 0,
                },
              });
              dispatch({ type: 'RESTART' });
            }}
          />
        );
      case 'start':
        return appState.isFirstLaunch ? (
          <OnboardingScreen
            onComplete={(name) => {
              appDispatch({ type: 'COMPLETE_ONBOARDING', payload: name });
              saveProfile({
                name,
                selectedSkin: 'classic',
                unlockedSkins: ['classic'],
                unlockedAchievements: [],
                stats: {
                  bestLevel: 0,
                  totalCoins: 0,
                  totalDishes: 0,
                  totalMathCorrect: 0,
                  totalMathTotal: 0,
                  bestComboEver: 0,
                  gamesPlayed: 0,
                },
              });
            }}
          />
        ) : (
          <>
            <StartScreen
              highScore={state.highScore}
              bestLevel={state.bestLevel}
              totalCoins={appState.profile.stats.totalCoins}
              playerName={appState.profile.name}
              selectedSkin={appState.profile.selectedSkin}
              onStart={(mode) => dispatch({ type: 'START_GAME', payload: { mode, config: appState.config } })}
              onOpenConfig={() => setConfigPanelOpen(true)}
              onOpenProfile={() => setProfilePanelOpen(true)}
              onOpenTutorial={() => setTutorialModalOpen(true)}
              onOpenAchievements={null}
            />
            <ConfigPanel
              config={appState.config}
              onSave={handleSaveConfig}
              onClose={() => setConfigPanelOpen(false)}
              isOpen={configPanelOpen}
            />
            <ProfilePanel
              profile={appState.profile}
              history={appState.history}
              onClose={() => setProfilePanelOpen(false)}
              onSkinChange={handleSkinChange}
              isOpen={profilePanelOpen}
            />
            <TutorialModal
              isOpen={tutorialModalOpen}
              onClose={() => setTutorialModalOpen(false)}
            />
          </>
        );
      case 'playing':
        return (
          <GamePlay
            gameState={state}
            gameDispatch={dispatch}
            selectedSkin={appState.profile.selectedSkin}
            onExitToMenu={() => {
              saveGameToHistory();
              dispatch({ type: 'EXIT_TO_MENU' });
            }}
          />
        );
      case 'paused':
        return (
          <PauseOverlay
            onResume={() => dispatch({ type: 'RESUME_GAME' })}
            onExitToMenu={() => {
              saveGameToHistory();
              dispatch({ type: 'EXIT_TO_MENU' });
            }}
            config={appState.config}
            onSaveConfig={handleSaveConfig}
          />
        );
      case 'levelComplete':
        return (
          <LevelComplete
            coinsBreakdown={state.coinsEarnedThisLevel || { base: 0, speedBonus: 0, perfectBonus: 0, comboMultiplier: 1, modeMultiplier: 1, total: 0 }}
            level={state.level}
            isPerfect={state.errorsInCurrentDish === 0}
            gameMode={state.gameMode || 'classic'}
            onNext={() => dispatch({ type: 'SHOW_MATH' })}
          />
        );
      case 'mathChallenge':
        return state.currentMathChallenge ? (
          <MathChallengeComponent
            challenge={state.currentMathChallenge}
            level={state.level}
            gameMode={state.gameMode || 'classic'}
            mathTimerSeconds={state.gameMode === 'speedrun'
              ? Math.max(10, (appState.config.mathTimerSeconds ?? 20) - 5)
              : (appState.config.mathTimerSeconds ?? 20)}
            showSkipAfterSeconds={appState.config.difficulty === 'easy' ? 0 : 5}
            mathBonus={5 * state.level}
            selectedSkin={appState.profile.selectedSkin}
            onAnswer={(answer) => dispatch({ type: 'ANSWER_MATH', payload: answer })}
            onTimeout={() => dispatch({ type: 'MATH_TIMEOUT' })}
            onSkip={() => dispatch({ type: 'MATH_SKIP' })}
            onExitToMenu={() => {
              saveGameToHistory();
              dispatch({ type: 'EXIT_TO_MENU' });
            }}
          />
        ) : null;
      case 'gameOver': {
        // Get the previous game for comparison (index 1 because index 0 is the current game just saved)
        const previousGame = appState.history.length > 1 ? appState.history[1] : null;
        const mathAcc = state.mathChallengesTotal > 0
          ? Math.round((state.mathChallengesCorrect / state.mathChallengesTotal) * 100)
          : 0;
        return (
          <GameOver
            level={state.level}
            coins={state.coins}
            bestCombo={state.bestCombo}
            dishesCompleted={state.dishesCompleted}
            mathCorrect={state.mathChallengesCorrect}
            mathTotal={state.mathChallengesTotal}
            gameMode={state.gameMode || 'classic'}
            timePenalty={state.timePenaltySeconds || 0}
            previousGame={previousGame}
            selectedSkin={appState.profile.selectedSkin}
            onRestart={() => dispatch({ type: 'RESTART' })}
            onShare={async () => {
              const text = generateShareText(state.level, state.coins, mathAcc);
              return await copyToClipboard(text);
            }}
          />
        );
      }
      default:
        return <StartScreen state={state} dispatch={dispatch} />;
    }
  };

  // Resolve the first pending achievement to its full definition for the toast
  const pendingAchievementDef = state.pendingAchievements.length > 0
    ? ACHIEVEMENT_DEFINITIONS.find((a) => a.id === state.pendingAchievements[0]) || null
    : null;

  return (
    <div className="app-shell-bg">
      <div className={`app-shell ${rootClasses || ''}`} style={rootStyle}>
        {renderScreen()}
        <AchievementToast
          achievement={pendingAchievementDef}
          onDismiss={handleDismissAchievement}
        />
      </div>
    </div>
  );
};

export default App;
