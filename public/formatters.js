/**
 * Shared financial formatting for MenuMargin AI.
 * Keeps signs, precision, locale, and tabular numerals consistent across views.
 */
(function exposeFormatters(global) {
  const numberFormatterCache = new Map();

  function getNumberFormatter(minimumFractionDigits, maximumFractionDigits) {
    const key = `${minimumFractionDigits}:${maximumFractionDigits}`;
    if (!numberFormatterCache.has(key)) {
      numberFormatterCache.set(key, new Intl.NumberFormat('en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
        signDisplay: 'auto'
      }));
    }
    return numberFormatterCache.get(key);
  }

  function toFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value, options = {}) {
    const minimumFractionDigits = options.minimumFractionDigits ?? 0;
    const maximumFractionDigits = options.maximumFractionDigits ?? minimumFractionDigits;
    return getNumberFormatter(minimumFractionDigits, maximumFractionDigits)
      .format(toFiniteNumber(value));
  }

  function formatCurrency(value, options = {}) {
    const decimals = options.decimals ?? 2;
    const number = toFiniteNumber(value);
    const sign = number < 0 ? '-' : (options.signed && number > 0 ? '+' : '');
    return `${sign}$${formatNumber(Math.abs(number), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  function formatPercent(value, options = {}) {
    const decimals = options.decimals ?? 1;
    const number = toFiniteNumber(value);
    const sign = options.signed && number > 0 ? '+' : '';
    return `${sign}${formatNumber(number, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}%`;
  }

  function formatDelta(value, suffix = '%') {
    const number = toFiniteNumber(value);
    const decimals = suffix === '%' ? 1 : 2;
    const sign = number > 0 ? '+' : '';
    return `${sign}${formatNumber(number, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}${suffix}`;
  }

  global.MenuMarginFormatters = Object.freeze({
    formatNumber,
    formatCurrency,
    formatPercent,
    formatDelta
  });
}(window));
