import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Define a base como vazia ou './' para que os caminhos sejam relativos ao index.html
  base: './', 
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    // Garante que o diretório de saída seja o esperado pelo Easypanel
    outDir: 'dist',
    // Garante que os assets fiquem em uma pasta organizada
    assetsDir: 'assets',
    // Limpa a pasta antes de cada build
    emptyOutDir: true,
  }
})