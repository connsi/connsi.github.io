import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 상대 경로로 빌드해서 GitHub Pages 하위 경로(/memo-app/)에서도 동작하게 합니다.
  base: './',
})
