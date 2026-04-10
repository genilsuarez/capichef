# Convenciones de Componentes

- Todos los componentes son functional components con arrow functions
- Usar Tailwind para todos los estilos, no CSS inline excepto para valores dinámicos calculados
- Props siempre con JSDoc comentado con el tipo y descripción
- Componentes de pantalla completa en PascalCase con sufijo Screen/Overlay/Panel
- Animaciones CSS via clases de Tailwind o className dinámico, nunca style={{ animation }}
- Los componentes no acceden a localStorage directamente — reciben todo por props
- Todos los botones interactivos deben tener touch-action: manipulation y user-select: none
- Tamaño mínimo de botones: 48×48px (64×64px en móvil para botones de respuesta matemática)
- Usar aria-label, role="status", aria-live="polite" según corresponda
