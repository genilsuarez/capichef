# Documento de Requisitos — CapiChef 🦫👨‍🍳

Referencia de diseño: #[[file:.kiro/specs/capichef/spec.md]]

## Introducción

CapiChef es un juego educativo tipo cooking simulator donde un capibara chef prepara platos completando recetas en orden. Cada nivel aumenta la dificultad con más ingredientes y menos tiempo. El jugador gana monedas por cada plato completado, con bonificaciones por velocidad, precisión y combo. Además, el juego integra un componente educativo de matemáticas: entre niveles se presentan desafíos de sumas, restas y multiplicaciones que el jugador debe resolver para obtener recompensas adicionales. La dificultad matemática escala con el nivel del juego. El juego es una React SPA con Tailwind CSS y Vite, sin backend y sin sonido. Utiliza localStorage para persistir configuración, perfil del jugador, logros e historial de partidas, y la Vibration API para feedback háptico en dispositivos compatibles.

## Glosario

- **Sistema_Juego**: La aplicación CapiChef en su totalidad, incluyendo todas las pantallas y lógica de estado
- **Pantalla_Inicio**: La pantalla inicial que muestra el logo, el capibara en idle y el botón para comenzar
- **Pantalla_Gameplay**: La pantalla principal donde el jugador interactúa con ingredientes, timer y recetas
- **Overlay_NivelCompleto**: El modal semi-transparente que se muestra al completar un nivel
- **Overlay_GameOver**: El modal oscuro que se muestra cuando el jugador pierde todas las vidas
- **HUD**: Heads-Up Display superior que muestra vidas, monedas y nivel actual
- **Panel_Receta**: Componente que muestra la receta actual, progreso de ingredientes, timer y errores
- **Panel_Ingredientes**: Componente con los 10 botones de ingredientes clickeables
- **Timer**: Temporizador de cuenta regresiva por nivel con barra de progreso visual
- **Capibara**: Personaje visual central con 6 estados animados (idle, cooking, done, error, thinking, gameover)
- **Reducer**: El useReducer de React que gestiona todo el estado global del juego
- **Receta**: Objeto que define nombre, ingredientes en orden y tiempo para un nivel
- **Combo**: Racha de niveles completados consecutivamente sin perder vida
- **Distractores**: Ingredientes falsos mezclados en el panel que no forman parte de la receta actual
- **Pool_Ingredientes**: Conjunto de 16 ingredientes disponibles representados con emojis
- **Desafío_Matemático**: Problema de suma, resta o multiplicación que aparece entre niveles como mini-juego educativo
- **Panel_Matemático**: Componente modal que presenta el desafío matemático con la pregunta, opciones de respuesta y feedback visual
- **Dificultad_Matemática**: Escala progresiva de complejidad de las operaciones matemáticas según el nivel del juego
- **Panel_Configuración**: Modal accesible desde la Pantalla_Inicio que permite ajustar dificultad, foco matemático, accesibilidad y velocidad de animaciones
- **Panel_Perfil**: Modal que muestra el nombre del jugador, estadísticas históricas, logros desbloqueados y skins disponibles
- **Modo_Juego**: Variante de gameplay seleccionable: clásico ('classic'), práctica ('practice') o contra reloj ('speedrun')
- **Logro**: Meta desbloqueada automáticamente al cumplir una condición específica durante el juego, persistida en localStorage
- **Skin**: Variante visual del capibara seleccionable por el jugador, algunas requieren desbloqueo
- **Panel_Pausa**: Overlay que aparece al pausar el juego, con opciones de continuar, configurar o salir al menú
- **OnboardingScreen**: Pantalla de bienvenida que aparece solo en el primer inicio para pedir el nombre del jugador
- **AppReducer**: Segundo useReducer que gestiona el estado persistente (perfil, configuración, historial, logros), separado del gameReducer

## Requisitos

### Requisito 1: Navegación entre Pantallas

**User Story:** Como jugador, quiero navegar entre las pantallas del juego de forma fluida, para tener una experiencia de juego coherente.

#### Criterios de Aceptación

1. WHEN el jugador abre la aplicación, THE Sistema_Juego SHALL mostrar la Pantalla_Inicio con el logo "🦫👨‍🍳 CapiChef" centrado, una animación de entrada (fade-in + scale), el Capibara en estado idle y el botón "¡A cocinar!"
2. WHEN el jugador clickea el botón "¡A cocinar!" en la Pantalla_Inicio, THE Sistema_Juego SHALL transicionar a la Pantalla_Gameplay e iniciar el nivel 1
3. WHEN el jugador completa todos los ingredientes de una receta, THE Sistema_Juego SHALL mostrar el Overlay_NivelCompleto sobre la Pantalla_Gameplay con una animación fadeIn de 300ms
4. WHEN el jugador clickea "Siguiente nivel →" en el Overlay_NivelCompleto, THE Sistema_Juego SHALL mostrar el Panel_Matemático con un desafío matemático (SHOW_MATH). Tras responder o agotar el tiempo del desafío, THE Sistema_Juego SHALL avanzar al siguiente nivel (NEXT_LEVEL) y mostrar la Pantalla_Gameplay con la nueva receta
5. WHEN las vidas del jugador llegan a 0, THE Sistema_Juego SHALL mostrar el Overlay_GameOver con una animación fadeIn de 500ms
6. WHEN el jugador clickea "Reintentar" en el Overlay_GameOver, THE Sistema_Juego SHALL transicionar a la Pantalla_Inicio y resetear todo el estado del juego
7. THE Pantalla_Inicio SHALL mostrar el high score de la sesión actual (0 si es la primera partida)
8. THE Pantalla_Inicio SHALL mostrar la instrucción "Clickea los ingredientes en orden para completar la receta"

### Requisito 2: Selección de Ingredientes

**User Story:** Como jugador, quiero clickear ingredientes en el orden correcto de la receta, para completar los platos y avanzar de nivel.

#### Criterios de Aceptación

1. WHEN el jugador clickea el ingrediente correcto (el siguiente en la secuencia de la receta), THE Panel_Ingredientes SHALL marcar el ingrediente como completado (✅) en el progreso de la receta, hacer desaparecer el ingrediente del panel con animación (flash verde + scale down en 200ms) y avanzar al siguiente ingrediente esperado
2. WHEN el jugador clickea el ingrediente correcto, THE Capibara SHALL cambiar al estado "cocinando" con animación bounce de 0.4s
3. WHEN el jugador clickea un ingrediente incorrecto (cualquier ingrediente que no sea el siguiente esperado), THE Panel_Ingredientes SHALL aplicar animación shake horizontal (translateX ±5px, 3 ciclos, 300ms) y flash rojo al ingrediente clickeado sin removerlo del panel
4. WHEN el jugador clickea un ingrediente incorrecto, THE Panel_Receta SHALL incrementar el contador de errores del plato actual en 1
5. WHEN el jugador clickea un ingrediente incorrecto, THE Capibara SHALL cambiar al estado "error" con animación shake de 0.3s
6. WHEN el jugador clickea un ingrediente correcto pero fuera de orden en la secuencia, THE Sistema_Juego SHALL tratar la selección como un ingrediente incorrecto con la misma penalización
7. WHEN el jugador completa todos los ingredientes de la receta en orden, THE Capibara SHALL cambiar al estado "plato listo" con animación jump de 0.5s y sparkles
8. THE Panel_Ingredientes SHALL aplicar un debounce visual de 200ms en cada botón de ingrediente para evitar doble-click accidental

### Requisito 3: Sistema de Timer

**User Story:** Como jugador, quiero ver un temporizador visual que me indique cuánto tiempo me queda, para gestionar la presión del tiempo en cada nivel.

#### Criterios de Aceptación

1. WHEN se muestra una nueva receta, THE Timer SHALL iniciar la cuenta regresiva inmediatamente con el tiempo asignado al nivel
2. THE Timer SHALL actualizarse cada 100ms usando setInterval para suavidad visual, almacenando el tiempo en décimas de segundo
3. THE Timer SHALL mostrarse como una barra de progreso junto con los segundos restantes en texto
4. WHILE el tiempo restante es mayor al 50% del tiempo total, THE Timer SHALL mostrar la barra en color verde (#22c55e)
5. WHILE el tiempo restante está entre el 25% y el 50% del tiempo total, THE Timer SHALL mostrar la barra en color amarillo (#eab308)
6. WHILE el tiempo restante es menor al 25% del tiempo total, THE Timer SHALL mostrar la barra en color rojo (#ef4444) con animación de parpadeo CSS (blink)
7. WHEN el timer llega a 0, THE Sistema_Juego SHALL restar 1 vida al jugador y reiniciar el mismo nivel con la misma receta, timer completo y errores a 0
8. WHILE el Overlay_NivelCompleto está visible, THE Timer SHALL estar pausado

### Requisito 4: Sistema de Recetas

**User Story:** Como jugador, quiero enfrentar recetas progresivamente más difíciles, para sentir un aumento de desafío a medida que avanzo.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL definir 5 recetas fijas para los niveles 1 a 5: Ensalada Simple (3 ingredientes, 15s), Arroz con Pollo (4 ingredientes, 14s), Pasta Capibara (5 ingredientes, 13s), Sushi Roll (5 ingredientes, 12s) y CapiBurger Deluxe (6 ingredientes, 11s)
2. THE Sistema_Juego SHALL mantener un pool de 16 ingredientes representados con emojis: 🍅 Tomate, 🧅 Cebolla, 🥩 Carne, 🧀 Queso, 🍳 Huevo, 🥬 Lechuga, 🌶️ Chile, 🍚 Arroz, 🐟 Pescado, 🥖 Pan, 🍝 Pasta, 🥑 Aguacate, 🍋 Limón, 🧄 Ajo, 🥕 Zanahoria, 🍗 Pollo
3. WHEN el nivel es 6 o superior, THE Sistema_Juego SHALL generar una receta aleatoria con entre 5 y 7 ingredientes seleccionados del pool sin repetir, con 10 segundos de tiempo y nombre "Especial del Chef #[nivel]"
4. WHEN se genera una receta aleatoria para nivel 6+, THE Sistema_Juego SHALL garantizar que la receta generada no tenga los mismos ingredientes que la receta del nivel anterior
5. THE Panel_Ingredientes SHALL mostrar exactamente 10 ingredientes en cada nivel, combinando los ingredientes de la receta con distractores aleatorios del pool (excluyendo los de la receta actual)
6. WHEN se inicia o reinicia un nivel, THE Panel_Ingredientes SHALL mezclar aleatoriamente (shuffle) el orden de los 10 ingredientes en el panel

### Requisito 5: Economía de Monedas

**User Story:** Como jugador, quiero ganar monedas con bonificaciones por velocidad, precisión y combo, para sentirme recompensado por jugar bien.

#### Criterios de Aceptación

1. WHEN el jugador completa un nivel, THE Sistema_Juego SHALL calcular las monedas base como 10 multiplicado por el nivel actual
2. WHEN el jugador completa un nivel habiendo usado menos del 50% del tiempo total, THE Sistema_Juego SHALL otorgar un bonus de velocidad igual al 50% de las monedas base
3. WHEN el jugador completa un nivel con 0 errores en el plato, THE Sistema_Juego SHALL otorgar un bonus perfecto igual al 20% de las monedas base
4. THE Sistema_Juego SHALL aplicar el multiplicador de combo al total de (monedas base + bonus velocidad + bonus perfecto) y redondear hacia abajo con floor
5. THE Sistema_Juego SHALL definir los multiplicadores de combo como: racha 0-1 = ×1.0, racha 2-3 = ×1.5, racha 4-5 = ×2.0, racha 6+ = ×3.0
6. WHEN el Overlay_NivelCompleto se muestra, THE Overlay_NivelCompleto SHALL presentar el desglose de monedas: base, bonus velocidad, bonus perfecto, multiplicador combo y total
7. THE HUD SHALL mostrar las monedas acumuladas durante toda la partida en todo momento con el formato "💰 [cantidad]"

### Requisito 6: Sistema de Combo

**User Story:** Como jugador, quiero que mi racha de niveles sin fallos se recompense con multiplicadores crecientes, para incentivar el juego preciso.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL incrementar el combo en 1 por cada nivel completado consecutivamente sin perder vida
2. WHEN el jugador pierde una vida (por timer a 0 o por 3 errores), THE Sistema_Juego SHALL resetear el combo a 0
3. WHILE el multiplicador de combo es mayor a ×1.0, THE Pantalla_Gameplay SHALL mostrar el indicador de combo con animación glow continua
4. THE Sistema_Juego SHALL registrar el mejor combo alcanzado durante la partida (bestCombo) para mostrarlo en el Overlay_GameOver

### Requisito 7: Sistema de Vidas

**User Story:** Como jugador, quiero tener un sistema de vidas que me permita cometer errores limitados antes de perder, para mantener la tensión del juego.

#### Criterios de Aceptación

1. WHEN se inicia una nueva partida, THE Sistema_Juego SHALL asignar 3 vidas al jugador
2. THE HUD SHALL mostrar las vidas como ❤️ por cada vida restante y 🖤 por cada vida perdida, siempre mostrando 3 slots
3. WHEN el jugador acumula 3 errores de ingrediente en un mismo plato, THE Sistema_Juego SHALL restar 1 vida y reiniciar el mismo nivel con la misma receta, timer completo y errores a 0
4. WHEN el jugador pierde una vida, THE HUD SHALL animar el corazón perdido con scale(1→1.3→0) en 400ms
5. WHEN el jugador completa un nivel múltiplo de 5 (nivel 5, 10, 15...) y tiene menos de 3 vidas, THE Sistema_Juego SHALL recuperar 1 vida
6. WHEN el jugador pierde una vida en un nivel múltiplo de 5, THE Sistema_Juego SHALL no recuperar vida en ese intento; la recuperación solo ocurre al completar el nivel
7. WHEN las vidas llegan a 0, THE Sistema_Juego SHALL activar el Game Over inmediatamente
8. THE Sistema_Juego SHALL limitar el máximo de vidas a 3 en todo momento

### Requisito 8: Estados Visuales del Capibara

**User Story:** Como jugador, quiero ver al capibara reaccionar visualmente a mis acciones, para tener feedback emocional durante el juego.

#### Criterios de Aceptación

1. WHILE el jugador no ha clickeado ningún ingrediente o está esperando input, THE Capibara SHALL mostrar el estado idle (🦫👨‍🍳 "Listo para cocinar") con animación breathing (scale 1.0↔1.05, 2s loop)
2. WHEN el jugador clickea un ingrediente correcto, THE Capibara SHALL mostrar el estado cocinando (🦫🔪 "¡Cocinando!") con animación bounce de 0.4s
3. WHEN el jugador completa una receta, THE Capibara SHALL mostrar el estado plato listo (🦫✨ "¡Delicioso!") con animación jump de 0.5s y sparkles
4. WHEN el jugador clickea un ingrediente incorrecto, THE Capibara SHALL mostrar el estado error (🦫😰 "¡Eso no va!") con animación shake de 0.3s
5. WHEN las vidas llegan a 0, THE Capibara SHALL mostrar el estado game over (😢🦫 "Se quemó la cocina...") con animación fadeDown de 0.5s

### Requisito 9: Animaciones y Efectos Visuales

**User Story:** Como jugador, quiero animaciones fluidas y feedback visual claro, para que la experiencia de juego sea atractiva y responsiva.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL implementar los siguientes keyframes CSS: breathing (scale 1↔1.05, 2s loop), bounce (translateY 0→-10px→0, 0.4s), jump (translateY 0→-20px→0, 0.5s), shake (translateX 0→-5px→5px→-5px→0, 0.3s), fadeDown (opacity 1→0 + translateY 0→10px, 0.5s), blink (opacity 1↔0.3, 0.5s loop), glow (box-shadow pulse dorado, 1s loop), fadeIn (opacity 0→1, 0.3s), slideUp (translateY 20px→0 + opacity 0→1, 0.3s), popIn (scale 0→1.1→1, 0.3s)
2. WHEN se transiciona entre niveles, THE Sistema_Juego SHALL aplicar fade out del panel actual (300ms) seguido de fade in del nuevo panel (300ms)
3. WHEN un ingrediente correcto es clickeado, THE Panel_Ingredientes SHALL aplicar flash verde (bg-green-400) seguido de popOut (scale 1→0) en 200ms
4. WHEN un ingrediente incorrecto es clickeado, THE Panel_Ingredientes SHALL aplicar shake + flash rojo (bg-red-400) en 300ms y luego volver al estado normal
5. WHEN el combo counter aparece, THE Pantalla_Gameplay SHALL mostrarlo con animación popIn seguida de glow continuo
6. WHEN el jugador pierde una vida, THE HUD SHALL animar el corazón con scale(1→1.3→0) en 400ms

### Requisito 10: HUD y Layout de Interfaz

**User Story:** Como jugador, quiero una interfaz clara y organizada que me muestre toda la información relevante, para tomar decisiones rápidas durante el juego.

#### Criterios de Aceptación

1. THE HUD SHALL posicionarse como sticky en la parte superior de la Pantalla_Gameplay y mostrar vidas, monedas y nivel distribuidos con justify-between
2. THE HUD SHALL mostrar las vidas como "❤️❤️❤️" / "🖤", las monedas como "💰 [cantidad]" y el nivel como "📊 Nivel [N]"
3. THE Panel_Receta SHALL mostrar el nombre de la receta, la secuencia de ingredientes con flechas (→), el progreso (✅ completados, ➡️ actual pulsando, ⬜ pendientes), la barra de timer y el contador de errores "⚠️ N/3"
4. THE Panel_Ingredientes SHALL renderizar 10 botones con emojis con tamaño mínimo de 48×48px
5. WHEN el jugador pasa el cursor sobre un botón de ingrediente, THE Panel_Ingredientes SHALL aplicar scale(1.15) con transición de 150ms

### Requisito 11: Overlay de Nivel Completo

**User Story:** Como jugador, quiero ver un resumen de mis ganancias al completar un nivel, para entender cómo se calculan mis monedas.

#### Criterios de Aceptación

1. WHEN el jugador completa un nivel, THE Overlay_NivelCompleto SHALL mostrarse como overlay semi-transparente sobre la Pantalla_Gameplay
2. THE Overlay_NivelCompleto SHALL mostrar el título "✨ ¡Plato listo!" con animación de celebración
3. THE Overlay_NivelCompleto SHALL mostrar el desglose de monedas: base, bonus velocidad, bonus perfecto, multiplicador combo y total ganado en el nivel
4. THE Overlay_NivelCompleto SHALL incluir un botón "Siguiente nivel →" para avanzar

### Requisito 12: Overlay de Game Over

**User Story:** Como jugador, quiero ver mis estadísticas finales al perder, para evaluar mi desempeño en la partida.

#### Criterios de Aceptación

1. WHEN las vidas llegan a 0, THE Overlay_GameOver SHALL mostrarse como overlay oscuro sobre la Pantalla_Gameplay con el Capibara triste (😢🦫)
2. THE Overlay_GameOver SHALL mostrar las estadísticas finales: nivel alcanzado, monedas totales acumuladas, mejor racha (combo máximo) y platos completados
3. THE Overlay_GameOver SHALL incluir un botón "Reintentar" que transicione a la Pantalla_Inicio y resetee todo el estado
4. WHEN la partida termina en Game Over y las monedas totales superan el high score de la sesión, THE Sistema_Juego SHALL actualizar el high score

### Requisito 13: Gestión de Estado con Reducer

**User Story:** Como desarrollador, quiero que el estado del juego se gestione con useReducer de forma predecible, para facilitar el mantenimiento y la depuración.

#### Criterios de Aceptación

1. THE Reducer SHALL gestionar el estado global del juego incluyendo: screen, level, lives, coins, combo, bestCombo, highScore, dishesCompleted, currentRecipe, ingredientProgress, errorsInCurrentDish, timeRemaining, availableIngredients, capibaraState, lastClickResult, mathChallengesCorrect, mathChallengesTotal y currentMathChallenge
2. THE Reducer SHALL procesar las acciones: START_GAME (resetea todo, screen='playing', level=1), CLICK_INGREDIENT (evalúa ingrediente clickeado), TIMER_TICK (decrementa timeRemaining), TIME_UP (pierde vida o game over), NEXT_LEVEL (avanza nivel, genera nueva receta), SHOW_MATH (genera desafío matemático, screen='mathChallenge'), ANSWER_MATH (evalúa respuesta y otorga bonus), MATH_TIMEOUT (tiempo agotado en desafío) y RESTART (vuelve a start screen)
3. WHEN se despacha START_GAME, THE Reducer SHALL resetear todo el estado a valores iniciales con screen='playing' y level=1
4. WHEN se despacha CLICK_INGREDIENT con un ingrediente correcto, THE Reducer SHALL incrementar ingredientProgress y actualizar capibaraState a 'cooking'
5. WHEN se despacha CLICK_INGREDIENT con un ingrediente incorrecto, THE Reducer SHALL incrementar errorsInCurrentDish y actualizar capibaraState a 'error'
6. WHEN se despacha TIMER_TICK, THE Reducer SHALL decrementar timeRemaining en 1 décima de segundo

### Requisito 14: Accesibilidad

**User Story:** Como jugador con necesidades de accesibilidad, quiero que el juego sea usable con tecnologías asistivas, para poder disfrutar de CapiChef.

#### Criterios de Aceptación

1. THE Panel_Ingredientes SHALL asignar un aria-label descriptivo a cada botón de ingrediente (ejemplo: "Ingrediente: Tomate")
2. THE Panel_Ingredientes SHALL renderizar botones con tamaño mínimo de 48×48px para accesibilidad táctil
3. THE Sistema_Juego SHALL mantener contraste de colores suficiente en textos sobre fondos
4. THE Sistema_Juego SHALL mostrar focus visible en todos los elementos interactivos
5. THE Timer SHALL tener role="status" para screen readers
6. THE HUD SHALL asignar role="status" al contador de vidas para screen readers
7. THE Pantalla_Gameplay SHALL asignar aria-live="polite" al área de feedback de combo y errores

### Requisito 15: Stack Técnico y Estructura del Proyecto

**User Story:** Como desarrollador, quiero que el proyecto siga una estructura clara con React, Tailwind y Vite, para facilitar el desarrollo y la colaboración.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL implementarse como una React SPA usando React 18+ con hooks, Tailwind CSS y Vite como bundler
2. THE Sistema_Juego SHALL organizar el código en la estructura: src/main.jsx (entry point), src/App.jsx (router de pantallas), src/index.css (Tailwind + keyframes), src/state/ (gameReducer.js, appReducer.js, recipes.js, mathChallenges.js, achievements.js, skins.js), src/hooks/ (useTimer.js, useHaptics.js, useAchievements.js, useLocalStorage.js, useTheme.js), src/services/ (storageService.js, clipboardService.js, analyticsService.js), src/utils/ (timerUtils.js, mathUtils.js, difficultyUtils.js), src/constants/ (gameConstants.js, achievementDefinitions.js, skinDefinitions.js, mathConstants.js), y componentes en src/components/ (StartScreen, OnboardingScreen, GamePlay, HUD, Capibara, RecipePanel, IngredientPanel, ComboDisplay, MathChallenge, LevelComplete, GameOver, PauseOverlay, ConfigPanel, ProfilePanel, AchievementToast, TutorialTooltip, ConfettiEffect, SpeechBubble, ModeSelector, ThemeBackground, ExitConfirmDialog, TutorialModal, ErrorBoundary)
3. THE Sistema_Juego SHALL funcionar sin backend y sin sonido. La persistencia se implementa exclusivamente con localStorage del navegador (configuración, perfil, logros, historial). La Vibration API se usa para feedback háptico con graceful degradation

### Requisito 16: Componente Educativo — Desafíos Matemáticos

**User Story:** Como jugador joven, quiero resolver desafíos de sumas, restas y multiplicaciones integrados en el juego, para aprender matemáticas mientras me divierto cocinando.

#### Criterios de Aceptación

1. WHEN el jugador clickea "Siguiente nivel →" en el Overlay_NivelCompleto, THE Sistema_Juego SHALL mostrar el Panel_Matemático con un Desafío_Matemático antes de iniciar el siguiente nivel
2. THE Panel_Matemático SHALL presentar una operación matemática (suma, resta o multiplicación) con 4 opciones de respuesta, de las cuales solo 1 es correcta
3. THE Sistema_Juego SHALL escalar la Dificultad_Matemática según el nivel actual: niveles 1-2 sumas simples (operandos 1-10), niveles 3-4 restas simples (operandos 1-20, resultado siempre ≥ 0), niveles 5-6 multiplicaciones simples (operandos 1-10), niveles 7+ mezcla aleatoria de las tres operaciones con operandos de mayor rango (1-50 para sumas/restas, 1-12 para multiplicaciones)
4. WHEN el jugador selecciona la respuesta correcta en el Panel_Matemático, THE Sistema_Juego SHALL otorgar un bonus de 5 monedas multiplicado por el nivel actual, mostrar feedback visual positivo (flash verde + "🧠 ¡Correcto!") con animación popIn, y avanzar al siguiente nivel tras 1 segundo
5. WHEN el jugador selecciona una respuesta incorrecta en el Panel_Matemático, THE Sistema_Juego SHALL resaltar la opción incorrecta en rojo (flash rojo + shake), mostrar la respuesta correcta resaltada en verde, mostrar "❌ La respuesta era [respuesta correcta]" y avanzar al siguiente nivel tras 2 segundos sin otorgar bonus
6. THE Panel_Matemático SHALL mostrar un timer visual de 10 segundos para responder el desafío; si el tiempo se agota, THE Sistema_Juego SHALL tratar la situación como respuesta incorrecta y avanzar al siguiente nivel sin bonus
7. THE Panel_Matemático SHALL generar las 3 opciones incorrectas como valores cercanos a la respuesta correcta (±1 a ±5 del resultado correcto) sin duplicados y sin valores negativos, y mezclar aleatoriamente las 4 opciones
8. THE Panel_Matemático SHALL mostrar el Capibara en estado "pensando" (🦫🤔 "¡Piensa rápido!") con animación breathing mientras el desafío está activo
9. THE Overlay_GameOver SHALL incluir en las estadísticas finales la cantidad de desafíos matemáticos respondidos correctamente del total presentado (ejemplo: "🧠 Matemáticas: 5/8")
10. THE Panel_Matemático SHALL presentar la operación con emojis temáticos de cocina en el enunciado (ejemplo: "🍅 × 3 = ?" o "🧀 5 + 🥩 3 = ?") para mantener la coherencia visual con el tema del juego
11. THE Panel_Matemático SHALL asignar aria-labels descriptivos a cada botón de respuesta y role="status" al feedback de resultado para accesibilidad

### Requisito 17: Diseño Responsive y Mobile-First

**User Story:** Como jugador en dispositivo móvil, quiero que el juego se adapte correctamente a mi pantalla y responda bien al toque, para poder jugar cómodamente desde cualquier dispositivo.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL implementar un layout responsive con breakpoints: móvil (<640px), tablet (640-1024px) y desktop (>1024px) usando Tailwind responsive prefixes (sm:, md:, lg:)
2. THE Panel_Ingredientes SHALL usar un grid adaptativo: 2 columnas en móvil (<640px), 4 columnas en tablet, 5 columnas en desktop — garantizando que los 10 ingredientes sean fácilmente tapeables en cualquier dispositivo
3. THE Sistema_Juego SHALL incluir en el index.html el meta viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` para evitar zoom accidental durante el juego
4. THE Sistema_Juego SHALL prevenir la selección de texto (user-select: none) en todos los botones de ingredientes y elementos interactivos para evitar comportamiento no deseado en mobile durante clicks rápidos
5. THE HUD SHALL adaptarse en móvil usando texto más compacto (emojis sin texto), y el Panel_Receta SHALL reducir el tamaño de fuente en pantallas pequeñas manteniendo legibilidad
6. THE Overlay_NivelCompleto y THE Overlay_GameOver SHALL ser scrollables cuando su contenido exceda la altura de la pantalla en móvil
7. THE Panel_Matemático SHALL mostrar los 4 botones de respuesta en grid 2×2 en móvil para maximizar el área de toque, con tamaño mínimo de 64×64px en móvil
8. THE Sistema_Juego SHALL usar `touch-action: manipulation` en todos los botones para eliminar el delay de 300ms en mobile browsers
9. WHEN el jugador está en móvil, THE Sistema_Juego SHALL evitar que el scroll de página interfiera con el gameplay usando `overflow: hidden` en el body durante la Pantalla_Gameplay
10. THE Capibara y los elementos visuales principales SHALL escalar proporcionalmente usando unidades relativas (vw, vh, rem) en lugar de píxeles fijos

### Requisito 18: Sistema de Celebración y Feedback Emocional Amplificado

**User Story:** Como jugador, quiero sentir emoción y recompensa visual cuando juego bien, para mantenerme motivado y enganchado al juego.

#### Criterios de Aceptación

1. WHEN el jugador completa una receta perfectamente (0 errores), THE Sistema_Juego SHALL mostrar una lluvia de confeti CSS (partículas animadas de colores) sobre el Overlay_NivelCompleto durante 2 segundos — este efecto es EXCLUSIVO para platos perfectos y refuerza la precisión
2. WHEN el combo alcanza 3, 6, y 10 niveles consecutivos, THE Sistema_Juego SHALL mostrar un mensaje especial animado con popIn: "🔥 ¡Combo x3!", "⚡ ¡Imparable!", "👑 ¡Leyenda!" para crear momentos de euforia
3. THE Capibara SHALL tener frases aleatorias contextuales mostradas como speech bubbles: al inicio del nivel ("¡Esta receta es mi favorita!", "¡Manos a la obra!"), al cometer errores ("¡Oops, casi!", "¡Tú puedes!"), al responder matemáticas correctamente ("¡Eres un genio!", "¡Matemáticas al poder!")
4. WHEN el jugador responde correctamente en el Panel_Matemático, THE Sistema_Juego SHALL mostrar una animación de "coins flying" donde las monedas bonus vuelen visualmente hacia el contador del HUD

### Requisito 19: Integración Temática de las Matemáticas con la Cocina

**User Story:** Como jugador joven, quiero que los desafíos matemáticos se sientan como parte de la cocina y no como ejercicios escolares, para que aprender sea natural y divertido.

#### Criterios de Aceptación

1. THE Panel_Matemático SHALL presentar los desafíos como "misiones de cocina" con narrativa: "¡El capibara necesita saber cuántos ingredientes usar!" en lugar de presentarlos como ejercicios aislados
2. THE Panel_Matemático SHALL usar siempre ingredientes de la receta actual (o del pool) como emojis en el enunciado, creando continuidad narrativa: "Tienes 🍅7 tomates y añades 🍅5 más. ¿Cuántos tomates hay?"
3. WHEN el jugador falla el Panel_Matemático, THE Capibara SHALL mostrar un globo de diálogo con la respuesta correcta explicada de forma simple: "¡7 + 5 = 12! Contemos juntos: 7, 8, 9, 10, 11, 12 🦫"
4. THE Sistema_Juego SHALL nombrar cada operación matemática según el contexto de cocina: sumas = "¡Añadir ingredientes!", restas = "¡Usar ingredientes!", multiplicaciones = "¡Hacer porciones!"

### Requisito 20: Progresión Visual y Temas por Nivel

**User Story:** Como jugador, quiero ver cambios visuales a medida que avanzo, para sentir que estoy progresando y descubriendo cosas nuevas.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL cambiar el color de fondo/tema visual cada 5 niveles: niveles 1-5 cocina de día (fondo amarillo cálido), niveles 6-10 cocina de noche (fondo azul oscuro con estrellas), niveles 11-15 cocina bajo el agua (fondo azul claro con burbujas), niveles 16+ cocina espacial (fondo negro con estrellas parpadeantes) — implementado con clases CSS que cambian sin librerías externas
2. WHEN el jugador alcanza un nivel múltiplo de 5 (5, 10, 15...), THE Sistema_Juego SHALL mostrar un mensaje especial antes del gameplay: "🌟 ¡Nivel 5 desbloqueado! Entrando a la cocina nocturna..." para marcar el progreso
3. THE Panel_Ingredientes SHALL mostrar un pequeño tooltip/badge "🌟 Nuevo" en los ingredientes que aparecen por primera vez en la sesión, para que el jugador siempre descubra algo

### Requisito 21: Onboarding y Ayuda Contextual

**User Story:** Como jugador nuevo, quiero entender rápidamente cómo jugar sin leer instrucciones largas, para empezar a divertirme de inmediato.

#### Criterios de Aceptación

1. WHEN es la primera vez que se muestra la Pantalla_Gameplay (nivel 1), THE Sistema_Juego SHALL mostrar un tooltip animado que apunte al primer ingrediente de la receta con el texto "¡Toca este primero! 👆" que desaparece al primer click correcto
2. WHEN el jugador tiene 2 errores consecutivos en el mismo nivel (sin aciertos intermedios), THE Capibara SHALL mostrar una pista visual: el ingrediente correcto siguiente parpadeará sutilmente (animación glow 1s) para guiar sin quitar el desafío completamente
3. THE Pantalla_Inicio SHALL incluir un botón "¿Cómo jugar? 📖" que muestre un mini-tutorial de 3 pasos con animaciones simples (no debe bloquear el inicio del juego)

### Requisito 22: Ritmo de Juego Balanceado

**User Story:** Como jugador, quiero que el juego se adapte a mi ritmo para no frustrarme ni aburrirme, manteniendo el desafío justo.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL implementar dificultad adaptativa de tiempo: si el jugador pierde una vida por timer en 2 niveles consecutivos, el tiempo del nivel siguiente se incrementa en 2 segundos (máximo una vez por nivel, máximo +4 segundos total), para evitar frustración excesiva en jugadores más lentos
2. THE Panel_Matemático SHALL permitir que el jugador "salte" el desafío matemático (sin penalización ni bonus) con un botón "Continuar →" visible solo DESPUÉS de 5 segundos, para que quieran intentarlo primero pero no se frustren si no pueden
3. THE Sistema_Juego SHALL registrar y mostrar en la Pantalla_Inicio el "mejor nivel alcanzado" de la sesión con una estrella: "⭐ Récord: Nivel 7" para motivar a superar el propio récord

### Requisito 23: Panel de Configuración

**User Story:** Como jugador (o padre/maestro), quiero poder configurar el juego antes de empezar, para adaptar la experiencia a mi nivel y preferencias.

#### Criterios de Aceptación

1. THE Pantalla_Inicio SHALL incluir un botón "⚙️ Configurar" que abra el Panel_Configuración como modal sobre la pantalla de inicio
2. THE Panel_Configuración SHALL permitir seleccionar la DIFICULTAD general del juego con 3 opciones: Fácil (timer +5s extra por nivel, máximo 4 errores antes de perder vida, desafíos matemáticos opcionales sin esperar 5s), Normal (comportamiento actual del juego), Difícil (timer -2s por nivel, máximo 2 errores antes de perder vida, operaciones matemáticas de mayor rango)
3. THE Panel_Configuración SHALL permitir seleccionar el FOCO MATEMÁTICO — qué tipo de operaciones aparecen en los desafíos: Todas (por defecto, escala según nivel), Solo sumas, Solo restas, Solo multiplicaciones, Mixto libre (aleatorio sin importar el nivel) — esta opción es clave para padres/maestros que quieran practicar una operación específica
4. THE Panel_Configuración SHALL permitir activar/desactivar el MODO ACCESIBILIDAD con 2 opciones: Texto grande (aumenta tamaño de fuente base en 125%) y Alto contraste (cambia paleta a fondos oscuros con texto blanco de alto contraste)
5. THE Panel_Configuración SHALL mostrar un toggle para VELOCIDAD DE ANIMACIONES: Normal / Reducida (reduce todas las animaciones CSS a 50% de duración para jugadores sensibles al movimiento o dispositivos lentos)
6. THE Panel_Configuración SHALL tener un botón "Guardar" que cierre el modal y persista la configuración en localStorage bajo la clave "capichef_config", y un botón "Restablecer" que vuelva a los valores por defecto
7. WHEN la configuración está guardada en localStorage, THE Sistema_Juego SHALL cargarla automáticamente al iniciar para que el jugador no tenga que configurar cada vez
8. THE Panel_Configuración SHALL mostrar un preview en tiempo real: cuando el jugador cambia la dificultad, un texto descriptivo explica qué cambia ("Con dificultad Fácil tendrás más tiempo y más margen de error")

### Requisito 24: Perfil del Jugador y Personalización

**User Story:** Como jugador, quiero crear un perfil con mi nombre y personalizar mi capibara, para sentir que el juego es mío y ver mi progreso.

#### Criterios de Aceptación

1. WHEN el jugador abre la aplicación por primera vez (sin datos en localStorage), THE Sistema_Juego SHALL mostrar una pantalla de bienvenida de configuración inicial: "¿Cómo te llamas?" con un campo de texto y "¡Empezar!" — el nombre se guarda en localStorage bajo "capichef_player"
2. THE Pantalla_Inicio SHALL mostrar el nombre del jugador en la parte superior: "¡Hola, [Nombre]! 🦫" con animación fadeIn
3. THE Sistema_Juego SHALL ofrecer 6 skins visuales para el capibara, seleccionables desde el Panel_Configuración: 🦫 Chef Clásico (por defecto), 🦫🎩 Chef Elegante, 🦫🌮 Chef Mexicano, 🦫🍣 Chef Japonés, 🦫🚀 Chef Espacial (se desbloquea al llegar al nivel 10), 🦫👑 Chef Legendario (se desbloquea al obtener combo x10) — cada skin cambia el emoji/label del capibara en todos sus estados
4. THE Sistema_Juego SHALL persistir el perfil completo del jugador en localStorage bajo "capichef_profile": nombre, skin seleccionada, skins desbloqueadas, logros obtenidos, estadísticas históricas
5. THE Pantalla_Inicio SHALL incluir un botón "📊 Mi Perfil" que abra el Panel_Perfil mostrando: nombre del jugador con avatar del capibara actual, estadísticas históricas acumuladas (mejor nivel alcanzado, monedas totales ganadas en todas las partidas, total de platos completados, precisión matemática histórica en %, mejor combo de todos los tiempos), logros desbloqueados (ver Requisito 25), skins disponibles y bloqueadas con condición para desbloquear

### Requisito 25: Sistema de Logros (Achievements)

**User Story:** Como jugador, quiero desbloquear logros mientras juego, para tener metas adicionales más allá de llegar al nivel más alto.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL implementar 12 logros desbloqueables persistidos en localStorage: 🍽️ "Primer Plato" (completar tu primer nivel), ⭐ "Perfeccionista" (completar un nivel sin errores), 🔥 "En Racha" (alcanzar combo x3), ⚡ "Imparable" (alcanzar combo x6), 👑 "Leyenda" (alcanzar combo x10), 🧠 "Matemático" (responder 5 desafíos correctamente en una partida), 🎓 "Genio" (responder 10 desafíos correctamente en una partida), 🌙 "Cocinero Nocturno" (llegar al nivel 6), 🌊 "Chef del Mar" (llegar al nivel 11), 🚀 "Chef Espacial" (llegar al nivel 16), 💰 "Millonario" (acumular 1000 monedas en total histórico), 🏆 "Maestro Chef" (completar 50 platos en total histórico)
2. WHEN un logro se desbloquea por primera vez, THE Sistema_Juego SHALL mostrar una notificación toast en la esquina superior derecha con animación slideIn: "🏆 ¡Logro desbloqueado! [nombre del logro]" que desaparece tras 3 segundos
3. THE Panel_Perfil SHALL mostrar los logros en un grid de 3 columnas: los desbloqueados en color con su emoji, los bloqueados en gris con candado 🔒 y la condición para desbloquear
4. THE Sistema_Juego SHALL evaluar los logros después de cada acción relevante (fin de nivel, respuesta matemática, game over) y desbloquear automáticamente los que correspondan

### Requisito 26: Modos de Juego Alternativos

**User Story:** Como jugador, quiero tener opciones de cómo jugar según mi estado de ánimo — a veces quiero aprender sin presión, otras veces quiero el desafío máximo.

#### Criterios de Aceptación

1. THE Pantalla_Inicio SHALL mostrar 3 botones de modo de juego: "🎮 Jugar" (modo clásico, comportamiento actual), "📚 Modo Práctica" (sin timer, sin vidas, para explorar sin presión), "⚡ Modo Contra Reloj" (valor interno en código: 'speedrun') (timer reducido -3s, sin vidas perdidas por errores, pero el score se multiplica x2)
2. EN Modo_Práctica: no hay timer activo (barra de timer se muestra estática en verde), no se pierden vidas por errores ni por tiempo, el capibara muestra pista del siguiente ingrediente con animación glow después de cada error (sin esperar 2 errores consecutivos), los desafíos matemáticos SÍ aparecen entre niveles, el score se muestra pero no se guarda como high score, se muestra un badge "📚 Modo Práctica" en el HUD
3. EN Modo_Contra_Reloj: timer reducido (tiempo base menos 3 segundos, mínimo 5 segundos), NO se pierden vidas — cada error o timeout suma 3 segundos al "tiempo de penalización" mostrado en rojo, al final se muestra el tiempo total de penalización como estadística, las monedas ganadas se multiplican por 2, los desafíos matemáticos tienen timer reducido a 7 segundos, se muestra un badge "⚡ Contra Reloj" en el HUD
4. THE Sistema_Juego SHALL pasar el modo activo como parte del estado del reducer y usarlo para aplicar las reglas correspondientes
5. THE Pantalla_GameOver y THE Pantalla_LevelComplete SHALL adaptar su contenido al modo activo (en Modo Práctica no mostrar "Vidas perdidas", en Modo Contra Reloj mostrar "Tiempo de penalización")

### Requisito 27: Vibración Háptica y Pausa

**User Story:** Como jugador mobile, quiero feedback táctil al interactuar y poder pausar el juego en cualquier momento, para una experiencia completa en mi dispositivo.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL usar la Vibration API (navigator.vibrate) en dispositivos que la soporten para feedback háptico: click correcto en ingrediente (vibración corta 50ms), click incorrecto (patrón de error [100, 50, 100]), pérdida de vida (vibración larga 300ms), logro desbloqueado (vibración de celebración [50, 50, 50, 50, 200]) — si la API no está disponible, silenciosamente no hace nada (graceful degradation)
2. THE Sistema_Juego SHALL implementar una función de PAUSA accesible en todo momento durante el gameplay: un botón "⏸️" visible en el HUD, al pausar se muestra un overlay semi-transparente con "⏸️ Pausa" y opciones "Continuar ▶️", "Configuración ⚙️", "Salir al menú 🏠", el timer se detiene durante la pausa, en mobile pausar también cuando el documento pierde el foco (visibilitychange event)
3. WHEN el jugador selecciona "Salir al menú" desde la pausa, THE Sistema_Juego SHALL mostrar una confirmación: "¿Seguro? Perderás el progreso de esta partida" con botones "Sí, salir" y "Cancelar"

### Requisito 28: Historial de Partidas y Compartir

**User Story:** Como jugador, quiero ver mis partidas anteriores y poder compartir mi puntuación, para comparar mi progreso y presumir mis logros.

#### Criterios de Aceptación

1. THE Sistema_Juego SHALL guardar en localStorage bajo "capichef_history" las últimas 5 partidas con: fecha, modo de juego, nivel alcanzado, monedas obtenidas, precisión matemática (%), mejor combo, platos completados
2. THE Panel_Perfil SHALL mostrar una sección "📅 Últimas partidas" con las 5 partidas guardadas en formato de tarjetas compactas
3. WHEN termina una partida (Game Over o salida desde pausa), THE Sistema_Juego SHALL mostrar en el Overlay_GameOver un botón "📤 Compartir resultado" que genera un texto de score para copiar al portapapeles: "¡Jugué CapiChef! 🦫👨‍🍳 Llegué al nivel [N], gané [X] monedas y respondí [Y]% de las matemáticas. ¿Puedes superarme?" — usa la Clipboard API con fallback graceful si no está disponible
4. THE Overlay_GameOver SHALL mostrar una comparación con la partida anterior: "⬆️ +3 niveles vs tu última partida" o "⬇️ -2 niveles vs tu última partida" para contexto inmediato
