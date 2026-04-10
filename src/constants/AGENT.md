# Convenciones de Constantes

- Todos los valores exportados deben ser inmutables (const, Object.freeze si aplica)
- Usar UPPER_SNAKE_CASE para constantes primitivas y arrays/objetos de configuración
- No importar desde src/state ni src/components — las constantes son la capa más baja
- Cada archivo agrupa constantes por dominio (game, achievements, skins, math)
- Documentar con JSDoc el propósito de cada constante o grupo de constantes
