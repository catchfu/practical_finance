import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/practical_finance/',
  plugins: [react()],
  // @ts-ignore
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
  }
})
