import { useState, useEffect } from 'react';

/**
 * ConfettiEffect — Pure CSS confetti rain with colored particles.
 * Renders 25 small colored divs that fall from the top with rotation.
 * Auto-hides after `duration` ms. No external libraries.
 *
 * @param {object} props
 * @param {boolean} props.isActive - Whether the confetti should be visible
 * @param {number} [props.duration=2000] - Duration in ms before auto-hiding
 */
const COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#eab308',
];

const PARTICLE_COUNT = 25;

/** Pre-generate particle styles so they stay stable across renders */
const generateParticles = () =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${1.2 + Math.random() * 1}s`,
    color: COLORS[i % COLORS.length],
    size: `${6 + Math.random() * 6}px`,
    rotation: `${Math.random() * 360}deg`,
  }));

const ConfettiEffect = ({ isActive, duration = 2000 }) => {
  const [visible, setVisible] = useState(false);
  const [particles] = useState(generateParticles);

  useEffect(() => {
    if (!isActive) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [isActive, duration]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-12px',
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
