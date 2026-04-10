# Convenciones de Servicios

- Son módulos puros (no React), exportan funciones named
- storageService: todas las funciones tienen try/catch y retornan null/undefined en caso de error
- Nunca lanzar excepciones — retornar null o un objeto de error tipado
- No importar desde src/state — los servicios no conocen los tipos del juego
- clipboardService: siempre verificar si navigator.clipboard está disponible antes de usarlo
- analyticsService: es un stub, no debe bloquear ni lanzar errores
