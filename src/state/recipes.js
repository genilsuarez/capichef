/**
 * Sistema de recetas de CapiChef
 *
 * Pool de ingredientes, recetas fijas (niveles 1-5),
 * generación aleatoria (niveles 6+), distractores y shuffle.
 *
 * Todas las funciones son puras y exportadas con named exports.
 */

/**
 * Pool de 24 ingredientes disponibles en el juego.
 * Cada ingrediente tiene un emoji y un nombre descriptivo.
 * @type {{ emoji: string, name: string }[]}
 */
export const INGREDIENT_POOL = [
  { emoji: '🍅', name: 'Tomate' },
  { emoji: '🧅', name: 'Cebolla' },
  { emoji: '🥩', name: 'Carne' },
  { emoji: '🧀', name: 'Queso' },
  { emoji: '🍳', name: 'Huevo' },
  { emoji: '🥬', name: 'Lechuga' },
  { emoji: '🌶️', name: 'Chile' },
  { emoji: '🍚', name: 'Arroz' },
  { emoji: '🐟', name: 'Pescado' },
  { emoji: '🥖', name: 'Pan' },
  { emoji: '🍝', name: 'Pasta' },
  { emoji: '🥑', name: 'Aguacate' },
  { emoji: '🍋', name: 'Limón' },
  { emoji: '🧄', name: 'Ajo' },
  { emoji: '🥕', name: 'Zanahoria' },
  { emoji: '🍗', name: 'Pollo' },
  { emoji: '🥦', name: 'Brócoli' },
  { emoji: '🍄', name: 'Champiñón' },
  { emoji: '🫑', name: 'Pimiento' },
  { emoji: '🥚', name: 'Huevo cocido' },
  { emoji: '🧆', name: 'Falafel' },
  { emoji: '🫘', name: 'Frijoles' },
  { emoji: '🌽', name: 'Maíz' },
  { emoji: '🍤', name: 'Camarón' },
];

/**
 * Recetas fijas para los niveles 1-5.
 * Cada receta tiene nombre, ingredientes en orden estricto y tiempo en segundos.
 * @type {{ name: string, ingredients: string[], time: number }[]}
 */
export const FIXED_RECIPES = [
  {
    name: 'Ensalada Simple',
    ingredients: ['🥬', '🍅', '🥑'],
    time: 15,
  },
  {
    name: 'Arroz con Pollo',
    ingredients: ['🍚', '🍗', '🧅', '🧄'],
    time: 14,
  },
  {
    name: 'Pasta Capibara',
    ingredients: ['🍝', '🍅', '🧀', '🧄', '🌶️'],
    time: 13,
  },
  {
    name: 'Sushi Roll',
    ingredients: ['🍚', '🐟', '🥑', '🧅', '🍋'],
    time: 12,
  },
  {
    name: 'CapiBurger Deluxe',
    ingredients: ['🥖', '🥩', '🧀', '🥬', '🍅', '🧅'],
    time: 11,
  },
];

/**
 * Fisher-Yates shuffle. Retorna un nuevo array mezclado sin mutar el original.
 * @template T
 * @param {T[]} array - Array a mezclar
 * @returns {T[]} Nuevo array con los elementos en orden aleatorio
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Nombres creativos para recetas aleatorias (niveles 6+).
 * Se combinan con el número de nivel para variedad.
 */
const RANDOM_RECIPE_NAMES = [
  'Sorpresa del Chef',
  'Creación Especial',
  'Plato Misterioso',
  'Receta Secreta',
  'Fusión Capibara',
  'Delicias del Día',
  'Invento del Chef',
  'Plato Estrella',
  'Mezcla Mágica',
  'Obra Maestra',
  'Festín Capibara',
  'Combinación Épica',
];

/**
 * Calcula la cantidad de ingredientes para un nivel aleatorio (6+).
 * Progresión gradual:
 *   Nivel  6-8  → 3 ingredientes
 *   Nivel  9-12 → 4 ingredientes
 *   Nivel 13-17 → 5 ingredientes
 *   Nivel 18-23 → 6 ingredientes
 *   Nivel 24+   → 7 ingredientes
 * @param {number} level
 * @returns {number}
 */
function ingredientCountForLevel(level) {
  if (level <= 8)  return 3;
  if (level <= 12) return 4;
  if (level <= 17) return 5;
  if (level <= 23) return 6;
  return 7;
}

/**
 * Genera una receta aleatoria para niveles 6+.
 * La cantidad de ingredientes escala gradualmente con el nivel.
 * Garantiza que los ingredientes no sean idénticos a los de la receta anterior.
 *
 * @param {number} level - Nivel actual (debe ser >= 6)
 * @param {{ name: string, ingredients: string[], time: number } | null} previousRecipe - Receta del nivel anterior
 * @returns {{ name: string, ingredients: string[], time: number }}
 */
export function generateRandomRecipe(level, previousRecipe) {
  const allEmojis = INGREDIENT_POOL.map((i) => i.emoji);
  const previousSet = previousRecipe
    ? new Set(previousRecipe.ingredients)
    : null;

  let ingredients;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const count = ingredientCountForLevel(level);
    const shuffled = shuffleArray(allEmojis);
    ingredients = shuffled.slice(0, count);
    attempts++;
  } while (
    previousSet &&
    attempts < maxAttempts &&
    areSameIngredients(ingredients, previousSet)
  );

  const nameIndex = (level - 1) % RANDOM_RECIPE_NAMES.length;
  const recipeName = `${RANDOM_RECIPE_NAMES[nameIndex]} #${level}`;

  return {
    name: recipeName,
    ingredients,
    time: 10,
  };
}

/**
 * Comprueba si un conjunto de ingredientes es idéntico al set anterior.
 * @param {string[]} ingredients
 * @param {Set<string>} previousSet
 * @returns {boolean}
 */
function areSameIngredients(ingredients, previousSet) {
  if (ingredients.length !== previousSet.size) return false;
  return ingredients.every((ing) => previousSet.has(ing));
}

/**
 * Genera ingredientes distractores para completar el panel hasta 10.
 * Selecciona ingredientes aleatorios del pool excluyendo los de la receta actual.
 *
 * @param {string[]} recipeIngredients - Ingredientes de la receta actual (emojis)
 * @param {number} count - Cantidad de distractores a generar
 * @returns {string[]} Array de emojis distractores
 */
export function generateDistractors(recipeIngredients, count) {
  const recipeSet = new Set(recipeIngredients);
  const available = INGREDIENT_POOL
    .map((i) => i.emoji)
    .filter((emoji) => !recipeSet.has(emoji));

  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count);
}
