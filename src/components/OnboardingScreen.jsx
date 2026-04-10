/**
 * OnboardingScreen — Pantalla de bienvenida (estilo Lingokids: limpio, centrado, sin ruido).
 */
import { useState } from 'react';

const OnboardingScreen = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    onComplete(trimmed || 'Jugador');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6" style={{ background: '#FFF8EE' }}>
      <div className="flex flex-col items-center gap-5 w-full max-w-xs">
        <div className="text-7xl animate-float" aria-hidden="true">🦫</div>

        <h1 className="text-3xl font-black text-amber-900 text-center">
          ¡Bienvenido a CapiChef!
        </h1>

        <p className="text-base font-bold text-amber-600 text-center">
          ¿Cómo te llamas, chef?
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre..."
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 text-lg text-center rounded-2xl border-2 border-amber-200
                       bg-white text-amber-900 placeholder-amber-300 font-bold
                       focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100
                       transition-all shadow-sm"
            aria-label="Nombre del jugador"
          />
          <button
            type="submit"
            className="btn-candy w-full py-4 text-white text-xl rounded-2xl"
            style={{ background: '#4ADE80', '--btn-shadow-color': '#16a34a', touchAction: 'manipulation' }}
          >
            🚀 ¡Empezar!
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingScreen;
