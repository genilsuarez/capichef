import { useState, useEffect, useRef } from 'react';
import { DEFAULT_CONFIG } from '../state/appReducer.js';

const DIFFICULTY_DESCRIPTIONS = {
  easy: '+5s de tiempo, 4 fallos permitidos.',
  normal: 'Estándar: 3 errores antes de perder vida.',
  hard: '-2s de tiempo, solo 2 errores permitidos.',
};

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '😊 Fácil' },
  { value: 'normal', label: '🎮 Normal' },
  { value: 'hard', label: '🔥 Difícil' },
];

const MATH_OPS_OPTIONS = [
  { value: 'addition',       label: '+ Sumas' },
  { value: 'subtraction',    label: '− Restas' },
  { value: 'multiplication', label: '× Multiplicar' },
];

const MATH_TIMER_OPTIONS = [
  { value: 10, label: '10s', desc: 'Rápido' },
  { value: 20, label: '20s', desc: 'Normal' },
  { value: 30, label: '30s', desc: 'Con calma' },
];

/**
 * ConfigPanel — Guarda automáticamente cada cambio en localStorage.
 * No requiere botón "Guardar" — cada opción se persiste al instante.
 */
const ConfigPanel = ({ config, onSave, onClose, isOpen }) => {
  const [localConfig, setLocalConfig] = useState({ ...DEFAULT_CONFIG, ...config });
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Re-sincronizar cada vez que el panel se abre (isOpen cambia a true)
  useEffect(() => {
    if (isOpen) {
      isFirstRender.current = true;
      setLocalConfig({ ...DEFAULT_CONFIG, ...config });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guardar automáticamente en cada cambio (excepto el render inicial)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSave(localConfig);
    // Mostrar flash "Guardado ✓"
    setSavedFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setSavedFlash(false), 1500);
  }, [localConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, []);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setLocalConfig({ ...DEFAULT_CONFIG });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panel de configuración"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-bold text-amber-900">⚙️ Configuración</h2>
          <div className="flex items-center gap-2">
            {savedFlash && (
              <span className="text-xs font-bold text-green-600 animate-fade-in">✓ Guardado</span>
            )}
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              onClick={onClose}
              aria-label="Cerrar configuración"
              style={{ touchAction: 'manipulation' }}
            >✕</button>
          </div>
        </div>

        <div className="px-4 py-3 space-y-4">

          {/* Dificultad */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Dificultad</h3>
            <div className="flex gap-1.5">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-sm font-medium transition-colors
                    ${localConfig.difficulty === opt.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => updateField('difficulty', opt.value)}
                  aria-pressed={localConfig.difficulty === opt.value}
                  style={{ touchAction: 'manipulation', userSelect: 'none' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
              {DIFFICULTY_DESCRIPTIONS[localConfig.difficulty]}
            </p>
          </section>

          {/* Nivel avanzado */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">🎯 Nivel avanzado</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer py-0.5">
                <div>
                  <span className="text-sm text-gray-700 font-medium">Ocultar nombres de ingredientes</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Solo se ven los emojis, sin texto</p>
                </div>
                <button
                  role="switch"
                  aria-checked={localConfig.hideIngredientNames ?? false}
                  onClick={() => updateField('hideIngredientNames', !(localConfig.hideIngredientNames ?? false))}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${localConfig.hideIngredientNames ? 'bg-purple-500' : 'bg-gray-300'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${localConfig.hideIngredientNames ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer py-0.5">
                <div>
                  <span className="text-sm text-gray-700 font-medium">Ocultar guía de receta</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Memoriza el orden sin ayuda visual</p>
                </div>
                <button
                  role="switch"
                  aria-checked={localConfig.hideRecipeGuide ?? false}
                  onClick={() => updateField('hideRecipeGuide', !(localConfig.hideRecipeGuide ?? false))}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${localConfig.hideRecipeGuide ? 'bg-purple-500' : 'bg-gray-300'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${localConfig.hideRecipeGuide ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
            </div>
          </section>

          {/* Operaciones matemáticas */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Operaciones matemáticas</h3>

            {/* Nivel matemático */}
            <div className="flex gap-1.5 mb-2">
              {[
                { value: 'kids',  label: '🧒 Niños',       desc: 'Hasta 20' },
                { value: 'teen',  label: '🧑 Adolescente',  desc: '+100' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all flex flex-col items-center
                    ${(localConfig.mathLevel ?? 'kids') === opt.value
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  onClick={() => updateField('mathLevel', opt.value)}
                  aria-pressed={(localConfig.mathLevel ?? 'kids') === opt.value}
                  style={{ touchAction: 'manipulation', userSelect: 'none' }}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] opacity-75">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Descripción del nivel teen */}
            {(localConfig.mathLevel ?? 'kids') === 'teen' && (
              <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-2 py-1 mb-2">
                Multiplicaciones &gt;100 y sumas de 3 cifras. Los límites de abajo se ignoran.
              </p>
            )}

            <div className="flex gap-1.5 mb-2">
              {MATH_OPS_OPTIONS.map((opt) => {
                const active = (localConfig.mathOps ?? []).includes(opt.value);
                const isLast = (localConfig.mathOps ?? []).length === 1 && active;
                return (
                  <button
                    key={opt.value}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1
                      ${active
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                    onClick={() => {
                      const current = localConfig.mathOps ?? [];
                      const next = active
                        ? current.filter((v) => v !== opt.value)
                        : [...current, opt.value];
                      if (next.length > 0) updateField('mathOps', next);
                    }}
                    aria-pressed={active}
                    title={isLast ? 'Al menos una operación debe estar activa' : ''}
                    style={{ touchAction: 'manipulation', userSelect: 'none' }}
                  >
                    {active && <span className="text-xs">✓</span>}
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Controles de límite — solo en modo kids */}
            {(localConfig.mathLevel ?? 'kids') === 'kids' &&
             ((localConfig.mathOps ?? []).some(op => op === 'addition' || op === 'subtraction') ||
              (localConfig.mathOps ?? []).includes('multiplication')) && (
              <div className="flex gap-1.5">
                {(localConfig.mathOps ?? []).some(op => op === 'addition' || op === 'subtraction') && (
                  <LimitControl
                    label="Núm. máximo"
                    sub="sumas/restas"
                    value={localConfig.mathMaxValue ?? 20}
                    onDec={() => updateField('mathMaxValue', Math.max(5, (localConfig.mathMaxValue ?? 20) - 5))}
                    onInc={() => updateField('mathMaxValue', Math.min(100, (localConfig.mathMaxValue ?? 20) + 5))}
                    decLabel="Reducir máximo"
                    incLabel="Aumentar máximo"
                  />
                )}
                {(localConfig.mathOps ?? []).includes('multiplication') && (
                  <LimitControl
                    label="Tabla máxima"
                    sub="multiplicar"
                    value={localConfig.mathMaxTable ?? 10}
                    onDec={() => updateField('mathMaxTable', Math.max(2, (localConfig.mathMaxTable ?? 10) - 1))}
                    onInc={() => updateField('mathMaxTable', Math.min(12, (localConfig.mathMaxTable ?? 10) + 1))}
                    decLabel="Reducir tabla"
                    incLabel="Aumentar tabla"
                  />
                )}
              </div>
            )}
          </section>

          {/* Timer matemático */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">⏱️ Tiempo para responder</h3>
            <div className="flex gap-1.5">
              {MATH_TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors flex flex-col items-center
                    ${(localConfig.mathTimerSeconds ?? 20) === opt.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => updateField('mathTimerSeconds', opt.value)}
                  aria-pressed={(localConfig.mathTimerSeconds ?? 20) === opt.value}
                  style={{ touchAction: 'manipulation', userSelect: 'none' }}
                >
                  <span className="font-black">{opt.label}</span>
                  <span className="text-[10px] opacity-75">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Accesibilidad */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Accesibilidad</h3>
            <div className="space-y-1.5">
              {[
                { field: 'textLarge', label: 'Texto grande (125%)' },
                { field: 'highContrast', label: 'Alto contraste' },
                { field: 'reducedAnimations', label: 'Animaciones reducidas' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center justify-between cursor-pointer py-0.5">
                  <span className="text-sm text-gray-700">{label}</span>
                  <button
                    role="switch"
                    aria-checked={localConfig[field]}
                    onClick={() => updateField(field, !localConfig[field])}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${localConfig[field] ? 'bg-green-500' : 'bg-gray-300'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${localConfig[field] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3">
          <button
            className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            onClick={handleReset}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
          >
            Restablecer valores por defecto
          </button>
        </div>
      </div>
    </div>
  );
};

const LimitControl = ({ label, sub, value, onDec, onInc, decLabel, incLabel }) => (
  <div className="flex-1 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5">
    <div>
      <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
    </div>
    <div className="flex items-center gap-1">
      <button className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm"
        onClick={onDec} style={{ touchAction: 'manipulation' }} aria-label={decLabel}>−</button>
      <span className="w-7 text-center font-black text-amber-600 text-sm">{value}</span>
      <button className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm"
        onClick={onInc} style={{ touchAction: 'manipulation' }} aria-label={incLabel}>+</button>
    </div>
  </div>
);

export default ConfigPanel;
