import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base:"/Typing-shooter/",
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..', 'C:/Users/iamra/.gemini/antigravity']
    }
    
  }
})

