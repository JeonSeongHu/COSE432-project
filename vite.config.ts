import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'core-js/actual/structured-clone';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // 전역 테스트 함수 활성화
    environment: 'jsdom', // React 테스트를 위한 jsdom 환경 설정
    setupFiles: './vitest.setup.ts', // 테스트 초기화 파일
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  }
});