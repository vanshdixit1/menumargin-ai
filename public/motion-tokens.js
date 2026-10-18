/**
 * Shared motion values for the vanilla client.
 * CSS variables remain the source of truth for stylesheet transitions.
 */
(function exposeMotionTokens(global) {
  global.MenuMarginMotion = Object.freeze({
    duration: Object.freeze({
      instant: 90,
      fast: 160,
      base: 240,
      slow: 420,
      hero: 700
    }),
    easing: Object.freeze({
      standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)'
    }),
    spring: Object.freeze({
      stiffness: 420,
      damping: 30,
      mass: 1
    })
  });
}(window));
