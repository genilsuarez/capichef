/**
 * SpeechBubble — Globo de diálogo (estilo limpio).
 */
const VARIANT_STYLES = {
  info: 'bg-white text-amber-800 after:border-t-white',
  cheer: 'bg-amber-50 text-amber-800 after:border-t-amber-50',
  error: 'bg-red-50 text-red-700 after:border-t-red-50',
  math: 'bg-blue-50 text-blue-800 after:border-t-blue-50',
};

const SpeechBubble = ({ message, variant = 'info' }) => {
  if (!message) return null;
  const classes = VARIANT_STYLES[variant] || VARIANT_STYLES.info;

  return (
    <div className={`${classes} text-xs sm:text-sm px-3 py-1.5 rounded-2xl shadow-sm font-bold
                     whitespace-nowrap animate-pop-in z-10 border border-amber-100
                     after:content-[''] after:absolute after:top-full after:left-1/2
                     after:-translate-x-1/2 after:border-[6px] after:border-transparent
                     relative inline-block`}
         role="status">
      {message}
    </div>
  );
};

export default SpeechBubble;
