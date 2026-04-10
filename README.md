# 🦫 CapiChef

> Juego educativo donde un capybara chef te guía a cocinar recetas tocando ingredientes en orden, con desafíos matemáticos entre niveles.

**Público:** Niños 4–10 años &nbsp;·&nbsp; **Idioma:** Español &nbsp;·&nbsp; **Plataforma:** Web (móvil y escritorio)

🔗 **[Jugar ahora →](https://gsphome.github.io/capichef/)**

---

## ¿Cómo se juega?

1. Elige un modo de juego
2. El capybara chef te dice qué receta preparar
3. Toca los ingredientes **en el orden correcto** antes de que se acabe el tiempo
4. Entre niveles, responde un **desafío matemático** para ganar monedas extra
5. Desbloquea nuevas skins para tu capybara con cada logro

---

## Modos de juego

| Modo | Descripción |
|------|-------------|
| 🟢 Clásico | Ritmo normal con vidas y timer |
| 🔵 Práctica | Sin presión de tiempo, ideal para aprender |
| 🟠 Contra Reloj | Alta presión, máxima velocidad |

---

## Características

- 🍳 Recetas con ingredientes reales (emojis)
- 🧮 Desafíos de suma, resta y multiplicación adaptados por nivel
- 🏆 12 logros desbloqueables
- 🎨 12 skins de capybara con condiciones de desbloqueo progresivas
- 💾 Progreso guardado automáticamente (localStorage)
- 📱 Responsive — funciona en móvil, tablet y escritorio
- 🌙 4 temas visuales según el nivel (día, noche, bajo el agua, espacio)

---

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** — sin librerías de UI externas
- **Vitest** + **@testing-library/react** — 261 tests
- Deploy automático a **GitHub Pages** vía GitHub Actions

---

## Desarrollo local

```bash
npm install
npm run dev
```

### Comandos disponibles

```bash
npm run build        # Build de producción
npm run build:full   # Build + commit + push + deploy automático
npm test             # Ejecutar tests
npm run preview      # Preview del build local
```

---

## Licencia

MIT © [gsphome](https://github.com/gsphome)
