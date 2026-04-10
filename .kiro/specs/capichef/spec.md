# 🦫👨‍🍳 CapiChef — Especificación de Diseño Completa

## 1. Concepto

Juego tipo cooking simulator donde un capibara chef debe preparar platos completando recetas en orden. Cada nivel aumenta la dificultad (más ingredientes, menos tiempo). El jugador gana monedas por cada plato completado, con bonificaciones por velocidad y precisión. Además, entre niveles se presentan desafíos matemáticos (sumas, restas y multiplicaciones) que el jugador debe resolver para obtener monedas extra, integrando un componente educativo progresivo.

Plataforma: React SPA (single page application) con Tailwind CSS. Sin backend, sin persistencia, sin sonido.

---

## 2. Pantallas y Flujo de Navegación

```
[Start Screen] → [Gameplay] → [Level Complete] → [Desafío Matemático] → [Gameplay (siguiente nivel)]
                      ↓                                                        ↓
                 [Game Over] ←────────────────────────────────────────────────┘
                      ↓
               [Start Screen]
```

### 2.1 Start Screen
- Logo "🦫👨‍🍳 CapiChef" centrado con animación de entrada (fade-in + scale)
- Capibara animado en idle (breathing CSS animation)
- Botón principal: "¡A cocinar!" → inicia nivel 1
- Muestra high score de la sesión actual (0 si es primera partida)
- Breve instrucción: "Clickea los ingredientes en orden para completar la receta"

### 2.2 Gameplay
- Layout descrito en sección 7 (UI Layout)
- Es la pantalla principal donde ocurre toda la acción

### 2.3 Level Complete (overlay modal)
- Se muestra como overlay semi-transparente sobre el gameplay
- Duración visible: hasta que el jugador clickee "Siguiente"
- Contenido:
  - "✨ ¡Plato listo!" con animación de celebración
  - Desglose de monedas: base + bonus velocidad + bonus perfecto + combo
  - Total de monedas ganadas en este nivel
  - Botón "Siguiente nivel →"

### 2.4 Game Over (overlay modal)
- Overlay oscuro sobre el gameplay
- Capibara triste: 😢🦫
- Estadísticas finales:
  - Nivel alcanzado
  - Monedas totales acumuladas
  - Mejor racha (combo máximo alcanzado)
  - Platos completados
- Botón "Reintentar" → vuelve a Start Screen (resetea todo el estado)

---

## 3. Mecánicas Core

### 3.1 Gameplay Loop (por nivel)

1. Se muestra la receta del nivel actual con sus ingredientes en orden
2. El timer comienza la cuenta regresiva inmediatamente
3. El panel inferior muestra ingredientes mezclados (correctos + distractores)
4. El jugador clickea ingredientes uno por uno, en el orden de la receta
5. Al completar todos los ingredientes correctamente → nivel completado
6. Se muestra Level Complete, jugador avanza al siguiente nivel
7. Si el timer llega a 0 o acumula 3 errores en el mismo plato → pierde 1 vida
8. Si vidas = 0 → Game Over

### 3.2 Selección de Ingredientes

- Click en ingrediente correcto (el siguiente en la secuencia):
  - El ingrediente se marca como ✅ en el progreso de la receta
  - El ingrediente desaparece del panel inferior con animación (flash verde + scale down)
  - El capibara hace animación de "cocinando" (bounce)
  - Se avanza al siguiente ingrediente esperado

- Click en ingrediente incorrecto (cualquier otro):
  - El ingrediente hace shake + flash rojo en el panel (NO desaparece)
  - Se incrementa el contador de errores del plato actual (+1)
  - El capibara hace animación de "error" (shake horizontal)
  - Si errores del plato = 3 → se pierde 1 vida, se reinicia el MISMO nivel (misma receta, timer reseteado, errores a 0)

- Click en ingrediente correcto pero fuera de orden:
  - Se trata como ingrediente incorrecto (misma penalización)
  - El orden es estricto y secuencial

### 3.3 Timer

- Cada nivel tiene un tiempo asignado (ver tabla de recetas)
- El timer comienza al mostrarse la receta
- Visualización: barra de progreso + segundos restantes en texto
- Colores de la barra:
  - > 50% tiempo restante: verde (#22c55e)
  - 25%-50% tiempo restante: amarillo (#eab308)
  - < 25% tiempo restante: rojo (#ef4444) + parpadeo (CSS blink)
- Timer llega a 0 → se pierde 1 vida, se reinicia el MISMO nivel

---

## 4. Sistema de Recetas

### 4.1 Pool de Ingredientes Disponibles

| Emoji | Nombre |
|-------|--------|
| 🍅 | Tomate |
| 🧅 | Cebolla |
| 🥩 | Carne |
| 🧀 | Queso |
| 🍳 | Huevo |
| 🥬 | Lechuga |
| 🌶️ | Chile |
| 🍚 | Arroz |
| 🐟 | Pescado |
| 🥖 | Pan |
| 🍝 | Pasta |
| 🥑 | Aguacate |
| 🍋 | Limón |
| 🧄 | Ajo |
| 🥕 | Zanahoria |
| 🍗 | Pollo |

Total: 16 ingredientes en el pool.

### 4.2 Recetas por Nivel (niveles 1-5 fijos)

| Nivel | Receta | Ingredientes (en orden) | Cant. | Tiempo | Distractores en panel |
|-------|--------|------------------------|-------|--------|-----------------------|
| 1 | Ensalada Simple | 🥬🍅🥑 | 3 | 15s | 7 (total 10 en panel) |
| 2 | Arroz con Pollo | 🍚🍗🧅🧄 | 4 | 14s | 6 (total 10 en panel) |
| 3 | Pasta Capibara | 🍝🍅🧀🧄🌶️ | 5 | 13s | 5 (total 10 en panel) |
| 4 | Sushi Roll | 🍚🐟🥑🧅🍋 | 5 | 12s | 5 (total 10 en panel) |
| 5 | CapiBurger Deluxe | 🥖🥩🧀🥬🍅🧅 | 6 | 11s | 4 (total 10 en panel) |

### 4.3 Niveles 6+ (generación aleatoria)

- Cantidad de ingredientes: aleatorio entre 5 y 7
- Tiempo: 10 segundos fijos
- Receta generada: se seleccionan N ingredientes aleatorios del pool (sin repetir)
- Nombre de receta: "Especial del Chef #[nivel]"
- Distractores: se completa hasta tener 10 ingredientes en el panel
- El panel siempre muestra exactamente 10 ingredientes, mezclados aleatoriamente

### 4.4 Disposición del Panel de Ingredientes

- Siempre 10 ingredientes visibles, dispuestos en una fila (o 2 filas de 5 en mobile)
- El orden de los ingredientes en el panel es aleatorio en cada nivel (shuffle)
- Los ingredientes correctos están mezclados entre los distractores

---

## 5. Economía de Monedas

### 5.1 Cálculo por Plato Completado

```
monedas_base = 10 × nivel_actual

bonus_velocidad = monedas_base × 0.5   (si tiempo_usado < 50% del tiempo_total)
bonus_perfecto  = monedas_base × 0.2   (si errores_en_este_plato == 0)

multiplicador_combo = según racha actual (ver 5.2)

monedas_nivel = floor((monedas_base + bonus_velocidad + bonus_perfecto) × multiplicador_combo)
```

### 5.2 Sistema de Combo

- Combo = cantidad de niveles completados consecutivamente sin perder vida
- El combo se resetea a 0 cuando el jugador pierde una vida (por timer o por 3 errores)

| Racha | Multiplicador |
|-------|--------------|
| 0-1 | ×1.0 |
| 2-3 | ×1.5 |
| 4-5 | ×2.0 |
| 6+ | ×3.0 |

- El multiplicador actual se muestra en pantalla cuando es > ×1.0 con animación de glow

### 5.3 Acumulación

- Las monedas se acumulan durante toda la partida
- Se muestran en el HUD superior en todo momento
- Al Game Over se muestra el total final

---

## 6. Sistema de Vidas

- Vidas iniciales: 3 (representadas como ❤️ en el HUD)
- Máximo de vidas: 3 (no puede exceder este valor)
- Se pierde 1 vida cuando:
  - El timer llega a 0
  - Se acumulan 3 errores de ingrediente en un mismo plato
- Al perder vida:
  - Animación de corazón rompiéndose (scale down + fade del último ❤️)
  - Se reinicia el MISMO nivel (misma receta, timer completo, errores a 0)
  - El combo streak se resetea a 0
- Recuperación: cada 5 niveles completados (nivel 5, 10, 15...) se recupera 1 vida (si < 3)
- Vidas = 0 → Game Over inmediato

---

## 7. UI Layout

### 7.1 Estructura General

```
┌─────────────────────────────────────────────┐
│  ❤️❤️❤️     💰 150     📊 Nivel 3            │  ← HUD superior (sticky)
├─────────────────────────────────────────────┤
│                                             │
│           ┌─────────────────┐               │
│           │   🦫👨‍🍳           │               │  ← Capibara (centro)
│           │  Estado actual   │               │
│           └─────────────────┘               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📋 Receta: Pasta Capibara           │    │  ← Panel de receta
│  │ Orden: 🍝 → 🍅 → 🧀 → 🧄 → 🌶️      │    │
│  │ Progreso: ✅🍝 ✅🍅 ⬜🧀 ⬜🧄 ⬜🌶️  │    │
│  │ ⏱️ [██████░░░░] 8s                  │    │
│  │ Errores: ⚠️ 1/3                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🍅  🧅  🥩  🧀  🍳  🥬  🌶️  🍚  🐟  🍝 │    │  ← Panel ingredientes
│  └─────────────────────────────────────┘    │
│                                             │
│           🔥 ×2 COMBO!                      │  ← Feedback (condicional)
└─────────────────────────────────────────────┘
```

### 7.2 Componentes del HUD

- Vidas: ❤️ por cada vida restante, 🖤 por cada vida perdida (siempre 3 slots)
- Monedas: 💰 + número acumulado
- Nivel: 📊 + "Nivel N"
- Posición: fila superior, distribuidos con justify-between

### 7.3 Panel de Receta

- Nombre de la receta en texto
- Secuencia de ingredientes con flechas (→) entre ellos
- Progreso: ✅ para completados, ➡️ para el actual (pulsando), ⬜ para pendientes
- Barra de timer con color dinámico
- Contador de errores: "⚠️ N/3"

### 7.4 Panel de Ingredientes

- 10 botones con emojis, tamaño mínimo 48×48px para accesibilidad táctil
- Hover: scale(1.15) con transition 150ms
- Click correcto: flash verde (bg-green-400) → scale(0) → desaparece (200ms)
- Click incorrecto: shake horizontal (translateX ±5px, 3 ciclos, 300ms) + flash rojo (bg-red-400)
- Ingredientes ya usados no se renderizan (desaparecen del panel)

---

## 8. Estados del Capibara

El capibara es el elemento visual central. Se representa con emojis y texto, animado con CSS.

| Estado | Visual | Animación CSS | Cuándo |
|--------|--------|--------------|--------|
| Idle | 🦫👨‍🍳 "Listo para cocinar" | `animation: breathing 2s ease-in-out infinite` (scale 1.0↔1.05) | Esperando input del jugador |
| Cocinando | 🦫🔪 "¡Cocinando!" | `animation: bounce 0.4s ease` | Al clickear ingrediente correcto |
| Plato listo | 🦫✨ "¡Delicioso!" | `animation: jump 0.5s ease` + sparkles | Al completar receta |
| Error | 🦫😰 "¡Eso no va!" | `animation: shake 0.3s ease` | Al clickear ingrediente incorrecto |
| Pensando | 🦫🤔 "¡Piensa rápido!" | `animation: breathing 2s ease-in-out infinite` | Durante desafío matemático |
| Game Over | 😢🦫 "Se quemó la cocina..." | `animation: fadeDown 0.5s ease` | Vidas = 0 |

---

## 9. Animaciones y Efectos Visuales

### 9.1 Keyframes Requeridos

```
@keyframes breathing   → scale(1) ↔ scale(1.05), 2s loop
@keyframes bounce      → translateY(0 → -10px → 0), 0.4s
@keyframes jump        → translateY(0 → -20px → 0), 0.5s
@keyframes shake       → translateX(0 → -5px → 5px → -5px → 0), 0.3s
@keyframes fadeDown    → opacity(1→0) + translateY(0→10px), 0.5s
@keyframes blink       → opacity(1 ↔ 0.3), 0.5s loop
@keyframes glow        → box-shadow pulse dorado, 1s loop
@keyframes fadeIn      → opacity(0→1), 0.3s
@keyframes slideUp     → translateY(20px→0) + opacity(0→1), 0.3s
@keyframes popIn       → scale(0→1.1→1), 0.3s
```

### 9.2 Transiciones

- Entre niveles: fade out del panel actual (300ms) → fade in del nuevo (300ms)
- Ingrediente correcto: flash verde → popOut (scale 1→0, 200ms)
- Ingrediente incorrecto: shake + flash rojo (300ms), luego vuelve a normal
- Combo counter: aparece con popIn + glow continuo
- Pérdida de vida: corazón hace scale(1→1.3→0) en 400ms
- Level Complete overlay: fadeIn 300ms
- Game Over overlay: fadeIn 500ms (más lento, dramático)

---

## 10. Gestión de Estado

### 10.1 Estado Global (useReducer)

```typescript
interface GameState {
  screen: 'start' | 'playing' | 'levelComplete' | 'mathChallenge' | 'gameOver';
  level: number;                    // 1-based
  lives: number;                    // 0-3
  coins: number;                    // acumulado total
  combo: number;                    // racha actual sin perder vida
  bestCombo: number;                // mejor racha de la partida
  highScore: number;                // mejor puntaje de la sesión
  dishesCompleted: number;          // platos totales completados
  // Estado del nivel actual
  currentRecipe: Recipe | null;
  ingredientProgress: number;       // índice del siguiente ingrediente esperado (0-based)
  errorsInCurrentDish: number;      // 0-2, al llegar a 3 se pierde vida
  timeRemaining: number;            // en décimas de segundo para precisión
  availableIngredients: string[];   // ingredientes visibles en el panel (shuffled)
  // Estado visual
  capibaraState: 'idle' | 'cooking' | 'done' | 'error' | 'thinking' | 'gameover';
  lastClickResult: 'correct' | 'incorrect' | null;  // para animaciones
  coinsEarnedThisLevel: CoinBreakdown | null;
  // Estado de desafíos matemáticos
  mathChallengesCorrect: number;    // desafíos respondidos correctamente
  mathChallengesTotal: number;      // desafíos presentados en total
  currentMathChallenge: MathChallenge | null;
}
```

### 10.2 Acciones del Reducer

```
START_GAME         → resetea todo, screen='playing', level=1
CLICK_INGREDIENT   → payload: ingrediente clickeado
TIMER_TICK         → decrementa timeRemaining
TIME_UP            → pierde vida o game over
NEXT_LEVEL         → avanza nivel, genera nueva receta
SHOW_MATH          → genera desafío matemático, screen='mathChallenge'
ANSWER_MATH        → payload: respuesta seleccionada, evalúa y otorga bonus
MATH_TIMEOUT       → tiempo agotado en desafío matemático
RESTART            → vuelve a start screen
```

### 10.3 Tipos Auxiliares

```typescript
interface Recipe {
  name: string;
  ingredients: string[];  // en orden
  time: number;           // segundos
}

interface CoinBreakdown {
  base: number;
  speedBonus: number;
  perfectBonus: number;
  comboMultiplier: number;
  total: number;
}

interface MathChallenge {
  operand1: number;
  operand2: number;
  operation: '+' | '-' | '×';
  correctAnswer: number;
  options: number[];          // 4 opciones shuffled (incluye la correcta)
  emoji1: string;             // emoji temático para operando 1
  emoji2: string;             // emoji temático para operando 2
}
```

---

## 11. Stack Técnico y Estructura

### 11.1 Dependencias

- React 18+ (con hooks)
- Tailwind CSS (via CDN o config)
- Vite como bundler

### 11.2 Estructura de Archivos

```
capichef/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx            # Entry point, render App
│   ├── App.jsx             # Router de pantallas según gameState.screen
│   ├── index.css           # Tailwind imports + keyframes CSS
│   ├── state/
│   │   ├── gameReducer.js  # Reducer + acciones + estado inicial
│   │   └── recipes.js      # Definición de recetas y lógica de generación
│   └── components/
│       ├── StartScreen.jsx
│       ├── GamePlay.jsx        # Pantalla principal de juego
│       ├── HUD.jsx             # Vidas, monedas, nivel
│       ├── Capibara.jsx        # Capibara animado según estado
│       ├── RecipePanel.jsx     # Receta actual, progreso, timer
│       ├── IngredientPanel.jsx # Grid de ingredientes clickeables
│       ├── ComboDisplay.jsx    # Indicador de combo (condicional)
│       ├── MathChallenge.jsx   # Panel de desafío matemático entre niveles
│       ├── LevelComplete.jsx   # Overlay de nivel completado
│       └── GameOver.jsx        # Overlay de game over
```

---

## 12. Reglas de Negocio — Casos Borde

1. Si el jugador pierde vida en nivel 5 (o múltiplo de 5), NO recupera vida en ese intento del nivel. Solo recupera al COMPLETAR el nivel 5.
2. Los ingredientes distractores se eligen aleatoriamente del pool excluyendo los de la receta actual.
3. En niveles aleatorios (6+), no se puede generar una receta con los mismos ingredientes que la anterior.
4. El timer usa `setInterval` con tick cada 100ms para suavidad visual. El estado almacena décimas de segundo.
5. Al reiniciar un nivel (por perder vida), los ingredientes del panel se re-shufflean.
6. El high score se actualiza al final de cada partida (Game Over) si el score actual es mayor.
7. El botón de ingrediente debe tener un debounce visual de 200ms para evitar doble-click accidental.
8. Durante la transición de Level Complete, el timer está pausado.

---

## 13. Componente Educativo — Desafíos Matemáticos

### 13.1 Concepto

Entre cada nivel, después del overlay de Level Complete, se presenta un desafío matemático que el jugador debe resolver. Esto integra aprendizaje de sumas, restas y multiplicaciones de forma orgánica en el flujo del juego.

### 13.2 Flujo Actualizado

```
[Level Complete] → [Desafío Matemático] → [Gameplay (siguiente nivel)]
```

### 13.3 Escalado de Dificultad

| Niveles | Operación | Rango de Operandos | Ejemplo |
|---------|-----------|--------------------|---------| 
| 1-2 | Suma | 1-10 | 🍅 3 + 🧀 4 = ? |
| 3-4 | Resta | 1-20 (resultado ≥ 0) | 🥩 12 - 🧅 5 = ? |
| 5-6 | Multiplicación | 1-10 | 🍗 × 3 = ? |
| 7+ | Mezcla aleatoria | Sumas/restas 1-50, multiplicaciones 1-12 | Cualquiera |

### 13.4 Mecánica

- Se muestra la operación con emojis temáticos de cocina
- 4 opciones de respuesta (1 correcta, 3 incorrectas cercanas al resultado ±1 a ±5)
- Timer de 10 segundos para responder
- Respuesta correcta: bonus de 5 × nivel_actual monedas + feedback verde + "🧠 ¡Correcto!"
- Respuesta incorrecta: flash rojo + se muestra la respuesta correcta + "❌ La respuesta era [X]"
- Timer agotado: se trata como respuesta incorrecta
- El capibara muestra estado "pensando": 🦫🤔 "¡Piensa rápido!"

### 13.5 Estadísticas

- Se trackea: desafíos presentados y desafíos correctos
- Se muestra en Game Over: "🧠 Matemáticas: N/M"

### 13.6 UI del Panel Matemático

```
┌─────────────────────────────────────┐
│                                     │
│         🦫🤔 "¡Piensa rápido!"      │
│                                     │
│      🍅 7  +  🧀 5  =  ?           │
│                                     │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│   │  10  │ │  12  │ │  13  │ │  11  │
│   └──────┘ └──────┘ └──────┘ └──────┘
│                                     │
│      ⏱️ [████████░░] 7s             │
│                                     │
└─────────────────────────────────────┘
```

---

## 14. Accesibilidad

- Todos los botones de ingredientes tienen `aria-label` descriptivo (ej: "Ingrediente: Tomate")
- Botones con tamaño mínimo 48×48px
- Contraste de colores suficiente en textos sobre fondos
- Focus visible en todos los elementos interactivos
- `role="status"` en el timer y el contador de vidas para screen readers
- `aria-live="polite"` en el área de feedback (combo, errores)
