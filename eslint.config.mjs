import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    ignores: ["node_modules/", "coverage/", ".dist/"],
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: { 
        ...globals.browser,
        ...globals.node
      } 
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  },
  { 
    files: ["**/*.test.js", "**/*.spec.js", "**/__tests__/**/*.js"],
    languageOptions: { 
      globals: {
        ...globals.jest,
        ...globals.node
      }
    }
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
]);