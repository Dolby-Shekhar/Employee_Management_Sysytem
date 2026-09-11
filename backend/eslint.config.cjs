// eslint.config.cjs - ESLint configuration for the backend project

const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const ts = require("@typescript-eslint/eslint-plugin");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  // Base JavaScript recommended rules
  js.configs.recommended,
  // TypeScript specific configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly"
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
      // Turn off unused vars warning
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
