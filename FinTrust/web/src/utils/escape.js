/**
 * Escape string for safe text display (prevents XSS from API or user input).
 * Use for any untrusted data rendered in the DOM.
 */
export function escapeForDisplay(value) {
  if (value == null) return '';
  const s = String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
