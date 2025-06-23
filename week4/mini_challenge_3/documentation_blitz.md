# Documentation Blitz: Professional JSDoc Example

## Function: parsePositiveNumber

### JSDoc
```js
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
```

### Usage Example
```js
parsePositiveNumber(5);        // 5
parsePositiveNumber('12.5');   // 12.5
parsePositiveNumber('-3');     // null
parsePositiveNumber('foo');    // null
parsePositiveNumber(null);     // null
```

---

**Success:** 1 function properly documented with professional JSDoc and example. 