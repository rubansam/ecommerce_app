/**
 * =============================
 * Module 2: Security & Performance Deep Dive
 * =============================
 *
 * 1. Identified Security Issues:
 *    - No Input Validation
 *    - Unsafe String Parsing
 *    - No Type Checking
 *    - No Error Handling
 *    - No Output Sanitization
 *
 * 2. Performance Bottlenecks:
 *    - Manual Loops Instead of Array Methods
 *    - Multiple Passes Over Data
 *
 * 3. AI Refactoring: Extract Method, Fix Vulnerabilities
 */

/**
 * Calculates the average of all positive numbers in the array.
 * Ignores null/undefined and non-numeric strings.
 * @param {Array} arr
 * @returns {number}
 */
function averageOfPositives(arr) {
    if (!Array.isArray(arr)) return 0;

    const numbers = arr
        .map(item => {
            if (typeof item === 'number') return item;
            if (typeof item === 'string' && !isNaN(Number(item))) return Number(item);
            return null;
        })
        .filter(item => item !== null && item > 0);

    if (numbers.length === 0) return 0;

    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

// --- Secure & Optimized Implementation ---

/**
 * Securely calculates the average of all positive numbers in the array.
 * Ignores null/undefined and non-numeric strings.
 * Throws error for invalid input.
 * @param {Array} arr
 * @returns {number}
 */
function averageOfPositivesSecure(arr) {
    if (!Array.isArray(arr)) throw new TypeError('Input must be an array');

    const numbers = arr
        .map(item => {
            if (typeof item === 'number' && Number.isFinite(item)) return item;
            if (typeof item === 'string' && /^[0-9.]+$/.test(item)) return Number(item);
            return null;
        })
        .filter(item => item !== null && item > 0);

    if (numbers.length === 0) return 0;

    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

// --- Performance Optimized (Single Pass) ---
function averageOfPositivesOptimized(arr) {
    if (!Array.isArray(arr)) throw new TypeError('Input must be an array');

    let sum = 0, count = 0;
    for (const item of arr) {
        let num = null;
        if (typeof item === 'number' && Number.isFinite(item)) num = item;
        else if (typeof item === 'string' && /^[0-9.]+$/.test(item)) num = Number(item);

        if (num !== null && num > 0) {
            sum += num;
            count++;
        }
    }
    return count === 0 ? 0 : sum / count;
}

// --- AI Refactoring: Extract Method ---
function parsePositiveNumber(item) {
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (typeof item === 'string' && /^[0-9.]+$/.test(item)) return Number(item);
    return null;
}

function averageOfPositivesRefactored(arr) {
    if (!Array.isArray(arr)) throw new TypeError('Input must be an array');

    let sum = 0, count = 0;
    for (const item of arr) {
        const num = parsePositiveNumber(item);
        if (num !== null && num > 0) {
            sum += num;
            count++;
        }
    }
    return count === 0 ? 0 : sum / count;
}



