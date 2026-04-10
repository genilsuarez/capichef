# Convenciones de Estado

- El reducer debe ser una función pura sin efectos secundarios
- Cada acción debe ser manejada explícitamente (no catch-all)
- El estado debe ser inmutable — usar spread operators, nunca mutar directamente
- gameReducer maneja SOLO estado de partida, appReducer maneja SOLO estado persistente
- Las funciones de generación (recipes, mathChallenges) son puras y deterministas dado el mismo seed
- Importar constantes desde src/constants/, no hardcodear valores mágicos
