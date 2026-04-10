/**
 * GamePlay — Pantalla principal de juego (rediseño kid-friendly).
 */
import { useCallback, useState, useEffect, useRef } from 'react';
import HUD from './HUD';
import Capibara from './Capibara';
import RecipePanel from './RecipePanel';
import IngredientPanel from './IngredientPanel';
import ComboDisplay from './ComboDisplay';
import TutorialTooltip from './TutorialTooltip';
import RecipeAnnounce from './RecipeAnnounce';
import { INGREDIENT_POOL } from '../state/recipes.js';

const GamePlay = ({ gameState, gameDispatch, selectedSkin = 'classic', onExitToMenu }) => {
  const {
    lives, coins, level, gameMode, currentRecipe, ingredientProgress,
    timeRemaining, errorsInCurrentDish, maxErrors, availableIngredients,
    capibaraState, lastClickResult, lastClickedIngredient, combo,
    currentComboMilestone, speechBubbleMessage, newIngredientsForLevel,
    consecutiveErrorsWithoutHit, timePenaltySeconds, screenBeforePause,
  } = gameState;

  // Mostrar anuncio de receta al inicio de cada nivel nuevo
  const [showAnnounce, setShowAnnounce] = useState(true);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level !== prevLevelRef.current) {
      setShowAnnounce(true);
      prevLevelRef.current = level;
    }
  }, [level]);

  const handleAnnounceStart = useCallback(() => {
    // Resetear el timer al tiempo completo de la receta cuando el niño cierra el anuncio
    gameDispatch({ type: 'RESET_TIMER' });
    setShowAnnounce(false);
  }, [gameDispatch]);

  // Pausar el timer mientras el anuncio está visible
  // (el timer en App.jsx solo corre cuando screen='playing' y timeRemaining>0,
  //  así que bloqueamos los clicks de ingredientes hasta que el niño cierre el modal)

  const showTutorialTooltip =
    !showAnnounce && gameState.isFirstPlaythrough && level === 1 && ingredientProgress === 0;

  const handleIngredientClick = useCallback(
    (ingredient) => {
      if (showAnnounce) return; // ignorar clicks mientras el anuncio está visible
      gameDispatch({ type: 'CLICK_INGREDIENT', payload: ingredient });
      if (gameState.isFirstPlaythrough) {
        const expected = gameState.currentRecipe?.ingredients[gameState.ingredientProgress];
        if (ingredient === expected) {
          gameDispatch({ type: 'DISMISS_TUTORIAL' });
        }
      }
    },
    [gameDispatch, gameState.isFirstPlaythrough, gameState.currentRecipe, gameState.ingredientProgress, showAnnounce],
  );

  const handlePause = useCallback(() => {
    gameDispatch({ type: 'PAUSE_GAME' });
  }, [gameDispatch]);

  const hintThreshold = gameMode === 'practice' ? 1 : 2;
  const hintIngredient =
    consecutiveErrorsWithoutHit >= hintThreshold && currentRecipe
      ? currentRecipe.ingredients[ingredientProgress] ?? null
      : null;

  const themeClass = `theme-${gameState.currentTheme || 'day'}`;

  return (
    <div className={`min-h-screen flex flex-col animate-fade-in ${themeClass}`} style={!gameState.currentTheme || gameState.currentTheme === 'day' ? { background: '#FFF8EE' } : undefined}>
      <HUD
        lives={lives} coins={coins} level={level} gameMode={gameMode}
        isPaused={screenBeforePause != null} onPause={handlePause}
        onExit={onExitToMenu}
        timePenalty={gameMode === 'speedrun' ? timePenaltySeconds : undefined}
      />

      <div className="flex-1 flex flex-col items-center gap-3 py-3 px-2 sm:px-4 relative z-10">
        <Capibara state={capibaraState} skin={selectedSkin} speechBubble={speechBubbleMessage} />

        {currentRecipe && (
          <RecipePanel
            recipe={currentRecipe} ingredientProgress={ingredientProgress}
            timeRemaining={showAnnounce ? currentRecipe.time * 10 : timeRemaining}
            totalTime={currentRecipe.time}
            errorsInCurrentDish={errorsInCurrentDish} maxErrors={maxErrors}
          />
        )}

        {(() => {
          const firstEmoji = showTutorialTooltip && currentRecipe ? currentRecipe.ingredients[0] : null;
          const poolItem = firstEmoji ? INGREDIENT_POOL.find((i) => i.emoji === firstEmoji) : null;
          return (
            <TutorialTooltip
              isVisible={showTutorialTooltip}
              ingredientName={poolItem?.name || ''}
              ingredientEmoji={firstEmoji || ''}
            />
          );
        })()}

        <IngredientPanel
          availableIngredients={availableIngredients}
          onIngredientClick={handleIngredientClick}
          lastClickResult={lastClickResult}
          lastClickedIngredient={lastClickedIngredient}
          hintIngredient={hintIngredient}
          newIngredients={newIngredientsForLevel}
        />

        <ComboDisplay combo={combo} milestone={currentComboMilestone} />

        <div aria-live="polite" className="sr-only">
          {lastClickResult === 'correct' && 'Ingrediente correcto'}
          {lastClickResult === 'incorrect' && 'Ingrediente incorrecto'}
        </div>
      </div>

      {/* Anuncio de receta — bloquea interacción hasta que el niño lo cierra */}
      {showAnnounce && currentRecipe && (
        <RecipeAnnounce
          recipe={currentRecipe}
          level={level}
          gameMode={gameMode}
          onStart={handleAnnounceStart}
        />
      )}
    </div>
  );
};

export default GamePlay;
