import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
];

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'plugin:prettier/recommended', // Prettier 설정 추가
  ],,
  parser: '@typescript-eslint/parser', // TypeScript 파서 사용
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'], // TypeScript 플러그인 추가
  rules: {
    // 기본 규칙 커스터마이징 가능
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }], // .tsx 파일 허용
    '@typescript-eslint/no-unused-vars': 'warn', // 사용되지 않는 변수 경고
  },
};
