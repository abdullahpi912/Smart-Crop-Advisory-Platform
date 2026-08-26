/**
 * Utility formatters for Cropling Frontend.
 */

/**
 * Formats a timestamp (ISO 8601 UTC or legacy date string) into the browser's local timezone.
 *
 * Examples:
 *   "2026-08-23T01:24:26+00:00" -> "23/08/2026, 06:54" (in UTC+5:30)
 *   "2026-08-23T01:24:26Z"       -> "23/08/2026, 06:54"
 *   "2026-07-24 14:30"           -> "24/07/2026, 14:30"
 *
 * @param {string|Date|null|undefined} rawTimestamp - Timestamp from API or client.
 * @param {Intl.DateTimeFormatOptions} [options] - Optional custom DateTimeFormat options.
 * @returns {string} Formatted localized string or fallback text.
 */
export function formatTimestamp(rawTimestamp, options) {
  if (!rawTimestamp) return 'Just now';
  if (rawTimestamp === 'REAL-TIME') return 'REAL-TIME';

  let dateObj = new Date(rawTimestamp);

  // If Date parsing failed on legacy string format with space separator (e.g. "2026-07-24 14:30")
  if (isNaN(dateObj.getTime()) && typeof rawTimestamp === 'string') {
    dateObj = new Date(rawTimestamp.replace(' ', 'T'));
  }

  // If still invalid, return the raw string verbatim rather than crashing
  if (isNaN(dateObj.getTime())) {
    return String(rawTimestamp);
  }

  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };

  return dateObj.toLocaleString(undefined, options || defaultOptions);
}
