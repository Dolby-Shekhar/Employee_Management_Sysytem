// eslint.config.cjs - ESLint configuration for the frontend project

const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const ts = require("@typescript-eslint/eslint-plugin");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  // Base JavaScript recommended rules
  js.configs.recommended,
  // TypeScript specific configuration for React files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        confirm: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        console: "readonly",
        React: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      // Apply the recommended TypeScript ESLint rules
      ...ts.configs.recommended.rules,
      // Disable rules that conflict with Prettier formatting
      ...prettierConfig.rules,
      // Turn off unused variable warnings for now
      "@typescript-eslint/no-unused-vars": "off",
      // Disable react-refresh rule
      "react-refresh/only-export-components": "off",
    },
  },
];
