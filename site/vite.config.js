import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 让构建产物支持 file:// 直接双击打开（无需本地服务器）：
// 将 ES module 改为经典 IIFE 脚本，并去掉 crossorigin / modulepreload。
function fileProtocolSupport() {
  return {
    name: 'file-protocol-support',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module"\s+crossorigin\s+src=/g, '<script defer src=')
        .replace(/<script type="module" crossorigin src=/g, '<script defer src=')
        .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=')
        .replace(/<link rel="modulepreload"[^>]*>/g, '')
    },
  }
}

export default defineConfig({
  plugins: [react(), fileProtocolSupport()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1200,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
