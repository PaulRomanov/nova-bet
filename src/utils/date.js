/**
 * Formats a timestamp into a localized time string.
 *
 * @param {number} ts - Unix timestamp in milliseconds
 * @param {string} currentLang - 'ru' | 'en'
 * @returns {string} Formatted time, e.g. "15:42:07"
 */
export function formatTs(ts, currentLang) {
  const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US'
  return new Date(ts).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
