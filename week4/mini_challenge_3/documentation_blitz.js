/**
 * Parses a value and returns it as a positive number if valid, otherwise returns null.
 *
 * Accepts finite numbers and numeric strings (e.g., '42', '3.14').
 * Returns null for non-numeric, negative, or invalid values.
 *
 * @param {any} item - The value to parse.
 * @returns {number|null} The parsed positive number, or null if invalid.
 *
 * @example
 * parsePositiveNumber(5);        // 5
 * parsePositiveNumber('12.5');   // 12.5
 * parsePositiveNumber('-3');     // null
 * parsePositiveNumber('foo');    // null
 * parsePositiveNumber(null);     // null
 */
function parsePositiveNumber(item) {
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (typeof item === 'string' && /^[0-9.]+$/.test(item)) return Number(item);
    return null;
} 