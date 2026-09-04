// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
  {
    ignores: ['dist/**', '.angular/**', 'out-tsc/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
      '@angular-eslint/component-max-inline-declarations': 'error',
      '@angular-eslint/computed-must-return': 'error',
      '@angular-eslint/consistent-component-styles': 'error',
      '@angular-eslint/contextual-decorator': 'error',
      '@angular-eslint/inject-at-top': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-attribute-decorator': 'error',
      '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
      '@angular-eslint/no-forward-ref': 'error',
      '@angular-eslint/no-implicit-take-until-destroyed': 'error',
      '@angular-eslint/no-input-prefix': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/no-pipe-impure': 'error',
      '@angular-eslint/no-queries-metadata-property': 'error',
      '@angular-eslint/prefer-host-metadata-property': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-service-decorator': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/require-lifecycle-on-prototype': 'error',
      '@angular-eslint/sort-keys-in-type-decorator': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/use-component-view-encapsulation': 'error',
      '@angular-eslint/use-injectable-provided-in': 'error',
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/pipe-prefix': ['error', { prefixes: ['app'] }],
    },
  },
  {
    files: ['projects/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'ep', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'ep', style: 'camelCase' },
      ],
      '@angular-eslint/pipe-prefix': ['error', { prefixes: ['ep'] }],
    },
  },
  {
    files: ['src/**/*.ts', 'projects/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.testing.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@angular-eslint/no-developer-preview': 'error',
      '@angular-eslint/no-experimental': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/conditional-complexity': 'error',
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/no-nested-tags': 'error',
      '@angular-eslint/template/no-non-null-assertion': 'error',
      '@angular-eslint/template/no-outerhtml': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/prefer-at-else': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-built-in-pipes': 'error',
      '@angular-eslint/template/prefer-class-binding': 'error',
      '@angular-eslint/template/prefer-contextual-for-variables': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
      '@angular-eslint/template/prefer-template-literal': 'error',
      '@angular-eslint/template/require-switch-default': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
    },
  },
  // Disables ESLint rules that conflict with Prettier.
  // Must stay the last entry so it overrides every config above.
  eslintConfigPrettier,
]);
