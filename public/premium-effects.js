/* MenuMargin AI — cinematic interaction layer.
 * All effects are progressive enhancements: the dashboard remains usable if
 * motion is reduced, unavailable, or disabled by the device capability check.
 */
(function () {
  'use strict';

  var motion = window.MenuMarginMotion || {};
  var reducedMotion = Boolean(motion.reducedMotion);
  var touch = Boolean(motion.touch);

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function runPreloader() {
    var loader = document.getElementById('premiumPreloader');
    var counter = document.getElementById('preloaderCounter');
    var bar = document.getElementById('preloaderProgressBar');
    if (!loader || !counter || !bar) return;
    var value = 0;
    var step = reducedMotion ? 100 : 4;
    var interval = window.setInterval(function () {
      value = Math.min(100, value + step);
      counter.textContent = value;
      bar.style.transform = 'scaleX(' + (value / 100) + ')';
      if (value < 100) return;
      window.clearInterval(interval);
      loader.classList.add('is-complete');
      window.setTimeout(function () {
        loader.classList.add('is-hidden');
        loader.setAttribute('aria-hidden', 'true');
      }, reducedMotion ? 40 : 620);
    }, reducedMotion ? 20 : 24);
  }

  function addRevealObserver() {
    var targets = document.querySelectorAll('.card, .section-intro, .alert-banner, .kpi-card, .dashboard-split-grid > *');
    if (!targets.length) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (target) { target.classList.add('motion-visible'); });
      return;
    }
    targets.forEach(function (target, index) {
      target.classList.add('motion-reveal');
      target.style.setProperty('--motion-delay', Math.min(index * 35, 280) + 'ms');
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (target) { observer.observe(target); });
  }

  function addScrollProgress() {
    var progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    var ticking = false;
    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var value = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, value)) + ')';
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function addCursor() {
    if (touch || reducedMotion) return;
    var cursor = document.createElement('div');
    var follower = document.createElement('div');
    cursor.className = 'premium-cursor';
    follower.className = 'premium-cursor-follower';
    cursor.setAttribute('aria-hidden', 'true');
    follower.setAttribute('aria-hidden', 'true');
    document.body.append(cursor, follower);
    var x = -100;
    var y = -100;
    var fx = x;
    var fy = y;
    var hovering = false;
    document.addEventListener('pointermove', function (event) {
      x = event.clientX;
      y = event.clientY;
      cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }, { passive: true });
    function follow() {
      fx += (x - fx) * 0.18;
      fy += (y - fy) * 0.18;
      follower.style.transform = 'translate3d(' + fx + 'px,' + fy + 'px,0)' + (hovering ? ' scale(1.7)' : '');
      window.requestAnimationFrame(follow);
    }
    follow();
    document.addEventListener('pointerover', function (event) {
      var target = event.target.closest('a, button, select, input, textarea, .card, .recipe-select-card, .spike-item');
      if (target) {
        hovering = true;
        follower.classList.add('is-hovering');
      }
    });
    document.addEventListener('pointerout', function (event) {
      if (event.target.closest('a, button, select, input, textarea, .card, .recipe-select-card, .spike-item')) {
        hovering = false;
        follower.classList.remove('is-hovering');
      }
    });
  }

  function addMagneticButtons() {
    if (touch || reducedMotion) return;
    document.querySelectorAll('.btn-primary, .btn-ai-sparkle, .btn-scan, #btnScanInvoiceHeader').forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        var rect = button.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) * 0.08;
        var dy = (event.clientY - (rect.top + rect.height / 2)) * 0.08;
        button.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      });
      button.addEventListener('pointerleave', function () {
        button.style.transform = '';
      });
    });
  }

  function addDynamicTilt() {
    if (touch || reducedMotion) return;
    document.addEventListener('pointermove', function (event) {
      var target = event.target.closest('.kpi-card, .dish-row-card, .spike-item, .recipe-select-card');
      if (!target || target.dataset.motionTilt === 'off') return;
      var rect = target.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.setProperty('--spot-x', ((x + 0.5) * 100).toFixed(1) + '%');
      target.style.setProperty('--spot-y', ((y + 0.5) * 100).toFixed(1) + '%');
      target.style.setProperty('--tilt-x', (y * -2.2).toFixed(2) + 'deg');
      target.style.setProperty('--tilt-y', (x * 2.2).toFixed(2) + 'deg');
      target.classList.add('is-tilting');
    }, { passive: true });
    document.addEventListener('pointerout', function (event) {
      var target = event.target.closest('.kpi-card, .dish-row-card, .spike-item, .recipe-select-card');
      if (!target || target.contains(event.relatedTarget)) return;
      target.classList.remove('is-tilting');
      target.style.removeProperty('--tilt-x');
      target.style.removeProperty('--tilt-y');
      target.style.removeProperty('--spot-x');
      target.style.removeProperty('--spot-y');
    });
  }

  function addHeroParallax() {
    if (touch || reducedMotion) return;
    var header = document.querySelector('.app-header');
    if (!header) return;
    var raf = 0;
    document.addEventListener('pointermove', function (event) {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        var x = (event.clientX / window.innerWidth - 0.5) * 2;
        var y = (event.clientY / window.innerHeight - 0.5) * 2;
        header.style.setProperty('--pointer-x', (x * 12) + 'px');
        header.style.setProperty('--pointer-y', (y * 5) + 'px');
      });
    }, { passive: true });
  }

  function addTabTransitions() {
    document.querySelectorAll('.nav-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var pane = document.getElementById('pane' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1));
        if (!pane || reducedMotion) return;
        pane.classList.remove('premium-tab-enter');
        window.requestAnimationFrame(function () { pane.classList.add('premium-tab-enter'); });
      });
    });
  }

  function addActiveTabIndicator() {
    var container = document.querySelector('.nav-container');
    if (!container) return;
    var indicator = document.createElement('span');
    indicator.className = 'nav-active-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    container.appendChild(indicator);
    function update() {
      var active = container.querySelector('.nav-tab.active');
      if (!active) return;
      var containerRect = container.getBoundingClientRect();
      var tabRect = active.getBoundingClientRect();
      indicator.style.width = tabRect.width + 'px';
      indicator.style.transform = 'translate3d(' + (tabRect.left - containerRect.left + container.scrollLeft) + 'px,0,0)';
    }
    update();
    window.addEventListener('resize', update, { passive: true });
    container.addEventListener('scroll', update, { passive: true });
    container.querySelectorAll('.nav-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { window.requestAnimationFrame(update); });
    });
  }

  function addPressFeedback() {
    if (reducedMotion) return;
    document.addEventListener('pointerdown', function (event) {
      var target = event.target.closest('button, .recipe-select-card, .spike-item');
      if (!target || target.disabled) return;
      target.classList.add('motion-pressed');
    });
    document.addEventListener('pointerup', function () {
      document.querySelectorAll('.motion-pressed').forEach(function (target) {
        target.classList.remove('motion-pressed');
      });
    });
  }

  ready(function () {
    runPreloader();
    document.documentElement.classList.add('premium-motion-ready');
    addRevealObserver();
    addScrollProgress();
    addCursor();
    addMagneticButtons();
    addDynamicTilt();
    addHeroParallax();
    addTabTransitions();
    addActiveTabIndicator();
    addPressFeedback();
    window.setTimeout(function () { document.documentElement.classList.add('app-ready'); }, reducedMotion ? 0 : 80);
  });
})();
