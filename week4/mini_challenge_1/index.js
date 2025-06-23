// Messy, hard-to-read, and buggy function
function calc(arr) {
    var s = 0, c = 0, i = 0;
    while (i < arr.length) {
        if (arr[i] > 0) {
            s = s + arr[i];
            c++;
        } else if (arr[i] == null) {
            // skip
        } else if (typeof arr[i] === 'string') {
            s += parseInt(arr[i]);
            c++;
        }
        i++;
    }
    if (c == 0) return 0;
    return s / c;
}

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

// Improvements:
// Clear function and variable names
// Handles only valid numbers and positive values
// Ignores null, undefined, and non-numeric strings
// Uses array methods for clarity
// Includes documentation