/* MenuMargin AI — premium motion controls */
(function () {
  window.MenuMarginMotion = Object.freeze({
    duration: {
      instant: 90,
      fast: 160,
      base: 240,
      slow: 420,
      hero: 700
    },
    easing: {
      enter: 'cubic-bezier(0.22, 1, 0.36, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    colors: {
      accent: '#8b5cf6',
      accentBright: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.22)'
    },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    touch: window.matchMedia('(hover: none), (pointer: coarse)').matches
  });
})();
