/**
 * Capibara — Personaje visual central (estilo Lingokids: un solo personaje, limpio).
 */
import { SKIN_DEFINITIONS } from '../constants/skinDefinitions';

const STATE_CONFIG = {
  idle: { text: '¡Listo para cocinar!', animationClass: 'animate-float' },
  cooking: { text: '¡Cocinando!', animationClass: 'animate-bounce-custom' },
  done: { text: '¡Delicioso!', animationClass: 'animate-jump' },
  error: { text: '¡Eso no va!', animationClass: 'animate-shake' },
  thinking: { text: '¡Piensa rápido!', animationClass: 'animate-breathing' },
  gameover: { text: 'Se quemó la cocina...', animationClass: 'animate-shake' },
};

// Accesorios encima del capybara — objetos, no personajes
const STATE_ACCESSORY = {
  idle: '🍳',
  cooking: '🔪',
  done: '⭐',
  error: '💥',
  thinking: '💭',
  gameover: '😢',
};

const Capibara = ({ state = 'idle', skin = 'classic', speechBubble = null, hideStateText = false }) => {
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const accessory = STATE_ACCESSORY[state] || '👨‍🍳';

  // Resolve skin emoji — fallback to 🦫 if skin not found
  const skinDef = SKIN_DEFINITIONS.find((s) => s.id === skin);
  const capiEmoji = skinDef ? skinDef.emoji : '🦫';

  return (
    <div className="flex flex-col items-center gap-0.5 relative" aria-label={`Capibara: ${config.text}`}>
      {/* Speech bubble */}
      {speechBubble && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white
                     text-xs px-3 py-1.5 rounded-2xl shadow-md font-bold text-amber-800
                     whitespace-nowrap animate-pop-in z-10
                     after:content-[''] after:absolute after:top-full after:left-1/2
                     after:-translate-x-1/2 after:border-[6px] after:border-transparent
                     after:border-t-white"
          role="status"
        >
          {speechBubble}
        </div>
      )}

      {/* Capibara + accessory */}
      <div className="relative inline-flex items-end justify-center">
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl sm:text-3xl z-10 animate-float"
          aria-hidden="true"
          style={{ animationDelay: '0.3s' }}
        >
          {accessory}
        </span>
        <div
          className={`capi-size ${config.animationClass}`}
          key={`${state}-${skin}`}
          aria-hidden="true"
        >
          {capiEmoji}
        </div>
      </div>

      {/* Sparkles for 'done' state */}
      {state === 'done' && (
        <span className="text-base animate-pop-in" aria-hidden="true">✨🎉✨</span>
      )}

      {/* State text — solo en pantallas no-gameplay (hideStateText=false por defecto fuera del juego) */}
      {!hideStateText && (
        <p className="text-xs font-bold text-amber-600">
          {config.text}
        </p>
      )}
    </div>
  );
};

export default Capibara;
