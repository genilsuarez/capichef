# Convenciones de Custom Hooks

- Nombre siempre con prefijo "use"
- Encapsulan un único concern (timer, haptics, achievements)
- Retornan tuple [value, action] o un objeto con propiedades nombradas
- Nunca acceden al gameState directamente — reciben lo necesario como parámetros
- Hacen cleanup en el return de useEffect (clearInterval, removeEventListener)
- No acceden a localStorage directamente — usan storageService
