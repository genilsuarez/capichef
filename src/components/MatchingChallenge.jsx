/**
 * MatchingChallenge — Desafío de pares: une operaciones con sus resultados.
 * Columna izquierda (naranja): multiplicaciones.
 * Columna derecha (azul): resultados barajados.
 * El jugador toca una operación y luego su resultado para hacer pareja.
 */
import { useState, useEffect } from 'react';
import Capibara from './Capibara';

const MatchingChallenge = ({
  challenge,
  level,
  selectedSkin = 'classic',
  onComplete,
  onExitToMenu,
}) => {
  const [selectedLeft, setSelectedLeft] = useState(null);   // pair id
  const [selectedRight, setSelectedRight] = useState(null); // result value
  const [matched, setMatched] = useState(new Set());         // matched pair ids
  const [wrongPair, setWrongPair] = useState(null);          // { leftId, rightVal }
  const [done, setDone] = useState(false);

  // Evaluate match whenever both sides are selected
  useEffect(() => {
    if (selectedLeft === null || selectedRight === null) return;

    const pair = challenge.pairs.find(p => p.id === selectedLeft);
    const isCorrect = pair && pair.result === selectedRight;

    if (isCorrect) {
      const next = new Set(matched);
      next.add(pair.id);
      setMatched(next);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (next.size === challenge.pairs.length) {
        setDone(true);
      }
    } else {
      setWrongPair({ leftId: selectedLeft, rightVal: selectedRight });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 500);
    }
  }, [selectedLeft, selectedRight]); // eslint-disable-line react-hooks/exhaustive-deps

  const isRightMatched = (result) =>
    challenge.pairs.some(p => matched.has(p.id) && p.result === result);

  const leftClass = (pair) => {
    const base =
      'w-full py-3 px-3 rounded-2xl font-black text-base border-2 text-center transition-all duration-150 select-none focus:outline-none';
    if (matched.has(pair.id))
      return `${base} bg-green-100 border-green-400 text-green-800`;
    if (wrongPair?.leftId === pair.id)
      return `${base} bg-red-100 border-red-400 text-red-700 animate-shake`;
    if (selectedLeft === pair.id)
      return `${base} bg-amber-100 border-amber-500 text-amber-900 scale-105 shadow-md`;
    return `${base} bg-white border-orange-300 text-orange-900 hover:scale-105 active:scale-95 cursor-pointer shadow-sm`;
  };

  const rightClass = (result) => {
    const base =
      'w-full py-3 px-3 rounded-2xl font-black text-base border-2 text-center transition-all duration-150 select-none focus:outline-none';
    if (isRightMatched(result))
      return `${base} bg-green-100 border-green-400 text-green-800`;
    if (wrongPair?.rightVal === result)
      return `${base} bg-red-100 border-red-400 text-red-700 animate-shake`;
    if (selectedRight === result)
      return `${base} bg-blue-100 border-blue-500 text-blue-900 scale-105 shadow-md`;
    return `${base} bg-white border-blue-300 text-blue-900 hover:scale-105 active:scale-95 cursor-pointer shadow-sm`;
  };

  const handleLeft = (pair) => {
    if (matched.has(pair.id) || wrongPair) return;
    setSelectedLeft(prev => prev === pair.id ? null : pair.id);
  };

  const handleRight = (result) => {
    if (isRightMatched(result) || wrongPair) return;
    setSelectedRight(prev => prev === result ? null : result);
  };

  const completedCount = matched.size;
  const totalCount = challenge.pairs.length;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-6 animate-fade-in"
      style={{ background: '#FFF8EE' }}
    >
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

      <Capibara
        state={done ? 'done' : selectedLeft !== null ? 'cooking' : 'thinking'}
        skin={selectedSkin}
        hideStateText
      />

      <div className="text-center">
        <p className="text-lg font-black text-amber-800">🔗 ¡Une cada operación con su resultado!</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-amber-600">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Two-column matching grid */}
      <div className="w-full max-w-sm flex gap-3">
        {/* Left column — operations */}
        <div className="flex-1 flex flex-col gap-2.5">
          {challenge.pairs.map((pair) => (
            <button
              key={pair.id}
              className={leftClass(pair)}
              onClick={() => handleLeft(pair)}
              disabled={matched.has(pair.id)}
              style={{ touchAction: 'manipulation' }}
            >
              {pair.operation}
            </button>
          ))}
        </div>

        {/* Right column — shuffled answers */}
        <div className="flex-1 flex flex-col gap-2.5">
          {challenge.shuffledAnswers.map((result, i) => (
            <button
              key={i}
              className={rightClass(result)}
              onClick={() => handleRight(result)}
              disabled={isRightMatched(result)}
              style={{ touchAction: 'manipulation' }}
            >
              {result}
            </button>
          ))}
        </div>
      </div>

      {/* Instruction / Continue */}
      {done ? (
        <div className="flex flex-col items-center gap-3 mt-2 animate-pop-in">
          <p className="text-xl font-black text-green-600">🎉 ¡Todos los pares encontrados!</p>
          <button
            className="btn-candy w-full max-w-xs py-3 text-white rounded-2xl font-black text-lg"
            style={{ background: '#4ADE80', '--btn-shadow-color': '#16a34a', touchAction: 'manipulation' }}
            onClick={onComplete}
          >
            ¡Seguir cocinando! 🍳
          </button>
        </div>
      ) : (
        <p className="text-xs text-amber-500 text-center">
          {selectedLeft !== null
            ? 'Ahora elige el resultado →'
            : 'Toca una operación para empezar'}
        </p>
      )}
    </div>
  );
};

export default MatchingChallenge;
