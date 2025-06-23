# Code Style & Linting Setup

## 1. Install ESLint and Prettier
```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
```

## 2. Initialize ESLint
```bash
npx eslint --init
```
Follow the prompts to set up your preferred style (e.g., Airbnb, Standard, etc).

## 3. Sample ESLint Configuration (.eslintrc.json)
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "eqeqeq": "error"
  }
}
```

## 4. Add Lint Scripts to package.json
```json
"scripts": {
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

## 5. Usage
- Run `npm run lint` to check for style issues.
- Run `npm run format` to auto-format code. 