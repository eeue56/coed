// @ts-check

import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(globalIgnores(["build/**/*"]), {
    files: ["src/**/*.ts"],
    ignores: ["build/**/*"],
    extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        tseslint.configs.strict,
        tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
        parserOptions: {
            projectService: true,
        },
    },
    rules: {
        "@typescript-eslint/restrict-template-expressions": [
            "error",
            { allowNumber: true },
        ],
        "@typescript-eslint/require-await": ["off"],
    },
});
