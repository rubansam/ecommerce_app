# Function Documentation

## 1. averageOfPositives(arr)
**Purpose:** Calculates the average of all positive numbers in the array. Ignores null/undefined and non-numeric strings.

- **Parameters:**
  - `arr` (Array): The input array containing numbers or numeric strings.
- **Returns:**
  - (number): The average of all positive numbers, or 0 if none found.
- **Example:**
```js
averageOfPositives([1, 2, '3', -1, null, 'foo']); // 2
```

---

## 2. averageOfPositivesSecure(arr)
**Purpose:** Securely calculates the average of all positive numbers in the array. Throws error for invalid input.

- **Parameters:**
  - `arr` (Array): The input array containing numbers or numeric strings.
- **Returns:**
  - (number): The average of all positive numbers, or 0 if none found.
- **Example:**
```js
averageOfPositivesSecure([1, '2', 3, 'foo', null]); // 2
```

---

## 3. parsePositiveNumber(item)
**Purpose:** Parses and returns a positive number from a value if valid, otherwise returns null.

- **Parameters:**
  - `item` (any): The value to parse.
- **Returns:**
  - (number|null): The parsed positive number, or null if invalid.
- **Example:**
```js
parsePositiveNumber('5'); // 5
parsePositiveNumber('foo'); // null
``` 