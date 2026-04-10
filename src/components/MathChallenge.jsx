/**
 * MathChallenge — Panel de desafío matemático.
 * Al acertar muestra un modal de celebración con monedas en grande.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Capibara from './Capibara';
import SpeechBubble from './SpeechBubble';
import { generateMathExplanation } from '../state/mathChallenges.js';
import { MATH_NARRATIVES } from '../constants/mathConstants.js';

/* ── Modal de celebración al acertar ── */
const CoinRewardModal = ({ coins, onDone, skin = 'classic' }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Enter' || e.key === ' ') onDone(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDone]);

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl px-8 py-8 mx-6 max-w-xs w-full text-center animate-bounce-in flex flex-col items-center gap-4">

      {/* Capibara saltando */}
      <Capibara state="done" skin={skin} hideStateText />

      {/* Título */}
      <p className="text-2xl font-black text-green-600 animate-pop-in">🧠 ¡Correcto!</p>

      {/* Monedas — el elemento principal */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-7xl animate-jump" aria-hidden="true">🪙</span>
        <span className="text-5xl font-black text-amber-500 animate-pop-in" style={{ animationDelay: '150ms' }}>
          +{coins}
        </span>
        <span className="text-base font-bold text-amber-400 uppercase tracking-widest">monedas</span>
      </div>

      {/* Frase motivadora */}
      <p className="text-base font-black text-amber-700">
        ¡Eres un chef matemático! 🦫⭐
      </p>

      {/* Botón continuar */}
      <button
        className="btn-candy w-full py-3 text-white rounded-2xl font-black text-lg mt-1"
        style={{ background: '#4ADE80', '--btn-shadow-color': '#16a34a', touchAction: 'manipulation' }}
        onClick={onDone}
      >
        ¡Seguir cocinando! 🍳
      </button>
    </div>
  </div>
  );
};

const MathChallenge = ({ challenge, level, gameMode, mathTimerSeconds = 10, showSkipAfterSeconds = 5, mathBonus = 0, selectedSkin = 'classic', onAnswer, onTimeout, onSkip, onExitToMenu }) => {
  const [timeLeft, setTimeLeft] = useState(mathTimerSeconds * 10);
  const totalTime = mathTimerSeconds * 10;
  const [feedback, setFeedback] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [showSkip, setShowSkip] = useState(showSkipAfterSeconds === 0);
  const answeredRef = useRef(false);
  const timeoutFiredRef = useRef(false);
  const advanceTimerRef = useRef(null);
  // Guardamos callbacks en refs para estabilizar referencias
  const onTimeoutRef = useRef(onTimeout);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);

  // Limpieza del timer de avance al desmontar
  useEffect(() => {
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, []);

  useEffect(() => {
    if (feedback) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 100);
    return () => clearInterval(interval);
  }, [feedback]);

  useEffect(() => {
    if (showSkipAfterSeconds === 0 || feedback) return;
    const timer = setTimeout(() => setShowSkip(true), showSkipAfterSeconds * 1000);
    return () => clearTimeout(timer);
  }, [showSkipAfterSeconds, feedback]);

  useEffect(() => {
    if (timeLeft <= 0 && !timeoutFiredRef.current) {
      timeoutFiredRef.current = true;
      setFeedback({ selected: null, isCorrect: false, isTimeout: true });
    }
  }, [timeLeft]);

  const handleAnswer = useCallback((answer) => {
    if (answeredRef.current || feedback) return;
    answeredRef.current = true;
    const isCorrect = answer === challenge.correctAnswer;
    setFeedback({ selected: answer, isCorrect, isTimeout: false });
    if (isCorrect) {
      setShowReward(true);
    }
    // incorrecto: siempre espera toque manual
  }, [challenge.correctAnswer, feedback]);

  const handleSkip = useCallback(() => {
    if (answeredRef.current || feedback) return;
    answeredRef.current = true;
    if (onSkip) onSkip();
  }, [feedback, onSkip]);

  const progressPercent = (timeLeft / totalTime) * 100;
  const timerSeconds = Math.ceil(timeLeft / 10);
  const timerColor = progressPercent > 50 ? '#4ADE80' : progressPercent > 25 ? '#FBBF24' : '#F87171';

  const getButtonClass = (option) => {
    const base = 'min-w-[64px] min-h-[64px] px-4 py-3 rounded-2xl font-black text-lg sm:text-xl transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-amber-400';
    if (!feedback) return `${base} bg-white border-2 border-amber-200 text-amber-900 hover:scale-105 hover:border-amber-400 active:scale-95 cursor-pointer shadow-sm`;
    if (option === challenge.correctAnswer) return `${base} bg-green-100 border-2 border-green-400 text-green-800 scale-105`;
    if (option === feedback.selected && !feedback.isCorrect) return `${base} bg-red-100 border-2 border-red-400 text-red-700 animate-shake`;
    return `${base} bg-gray-50 border-2 border-gray-200 text-gray-300`;
  };

  const narrativeText = useMemo(() => {
    const templates = MATH_NARRATIVES[challenge.operation] || MATH_NARRATIVES['+'];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{e1}', challenge.emoji1).replace('{e2}', challenge.emoji2)
      .replace('{a}', String(challenge.operand1)).replace('{b}', String(challenge.operand2));
  }, [challenge]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-6 animate-fade-in"
         style={{ background: '#FFF8EE' }}>

      {/* Modal de celebración — aparece al acertar */}
      {showReward && (
        <CoinRewardModal
          coins={mathBonus}
          skin={selectedSkin}
          onDone={() => { setShowReward(false); onAnswerRef.current(challenge.correctAnswer); }}
        />
      )}

      {/* Botón home — esquina superior izquierda */}
      {onExitToMenu && (
        <button
          className="absolute top-4 left-4 bg-white rounded-full p-2.5 shadow-sm border border-amber-100
                     hover:bg-amber-50 active:scale-90 transition-all z-10"
          style={{ touchAction: 'manipulation' }}
          onClick={onExitToMenu}
          aria-label="Volver al inicio"
        >
          <span className="text-lg">🏠</span>
        </button>
      )}

      <Capibara state="thinking" skin={selectedSkin} />

      <p className="text-base sm:text-lg font-black text-amber-800 animate-pop-in">
        🍳 {challenge.operationName}
      </p>

      <p className="text-sm text-amber-600 font-semibold text-center max-w-sm">{narrativeText}</p>

      {/* Math operation */}
      <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-amber-100 text-2xl sm:text-3xl font-black text-amber-900 flex items-center gap-2 flex-wrap justify-center">
        <span>{challenge.emoji1}</span><span>{challenge.operand1}</span>
        <span className="text-amber-400">{challenge.operation}</span>
        <span>{challenge.emoji2}</span><span>{challenge.operand2}</span>
        <span className="text-amber-400">=</span>
        <span className="text-amber-300 animate-blink">?</span>
      </div>

      {/* Premio — monedas que se ganan si aciertan */}
      {mathBonus > 0 && !feedback && (
        <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 rounded-2xl px-5 py-2.5 animate-pop-in">
          <span className="text-2xl animate-float">🪙</span>
          <span className="text-lg font-black text-amber-700">¡Gana <span className="text-amber-500">+{mathBonus}</span> monedas!</span>
        </div>
      )}

      {/* Answer buttons */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-md">
        {challenge.options.map((option) => (
          <button key={option} className={getButtonClass(option)}
                  onClick={() => handleAnswer(option)} disabled={!!feedback}
                  aria-label={`Respuesta: ${option}`} style={{ touchAction: 'manipulation' }}>
            {option}
          </button>
        ))}
      </div>

      {/* Feedback — solo error/timeout, el correcto va en el modal */}
      <div role="status" className="min-h-[2rem] text-base font-black">
        {feedback && !feedback.isCorrect && !feedback.isTimeout && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-red-500 animate-pop-in">❌ Era {challenge.correctAnswer}</p>
            <SpeechBubble message={generateMathExplanation(challenge)} variant="math" />
            <button
              className="mt-2 btn-candy px-6 py-2.5 text-white rounded-2xl font-black text-base"
              style={{ background: '#60A5FA', '--btn-shadow-color': '#2563eb', touchAction: 'manipulation' }}
              onClick={() => onAnswerRef.current(feedback.selected)}
            >
              Siguiente →
            </button>
          </div>
        )}
        {feedback && feedback.isTimeout && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-red-500 animate-pop-in">⏰ ¡Tiempo! Era {challenge.correctAnswer}</p>
            <SpeechBubble message={generateMathExplanation(challenge)} variant="math" />
            <button
              className="mt-2 btn-candy px-6 py-2.5 text-white rounded-2xl font-black text-base"
              style={{ background: '#60A5FA', '--btn-shadow-color': '#2563eb', touchAction: 'manipulation' }}
              onClick={() => onTimeoutRef.current()}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-xs">⏱️</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-100 ${progressPercent <= 25 ? 'animate-blink' : ''}`}
                 style={{ width: `${progressPercent}%`, backgroundColor: timerColor }} />
          </div>
          <span className="text-xs font-black min-w-[2rem] text-right" style={{ color: timerColor }}>{timerSeconds}s</span>
        </div>
      </div>

      {showSkip && !feedback && onSkip && (
        <button className="mt-1 bg-white border-2 border-amber-200 px-5 py-2 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-50 active:scale-95 transition-all animate-fade-in"
                style={{ touchAction: 'manipulation' }} onClick={handleSkip}>
          Continuar →
        </button>
      )}
    </div>
  );
};

export default MathChallenge;
