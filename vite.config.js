import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { edenApiPlugin } from './scripts/api-dev.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), edenApiPlugin()],
  server: {
    watch: {
      // 编辑器原子保存时产生的临时目录不要监听，否则 Windows 上会 EBUSY 崩掉 dev
      ignored: ['**/.*.tmpdir/**', '**/.dev-data.json', '**/dist/**']
    }
  }
})
