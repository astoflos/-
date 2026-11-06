import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { edenApiPlugin } from './scripts/api-dev.js'
import { renderMinimalHtml } from './scripts/minimal-page.js'

// 开发时直接把 /minimal/ 渲染出来，省得每次都要先 build
function edenMinimalDevPage() {
  return {
    name: 'eden-minimal-dev-page',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0]
        if (path !== '/minimal' && path !== '/minimal/') return next()
        try {
          const mod = await server.ssrLoadModule('/src/config.js')
          const html = renderMinimalHtml(mod.default)
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (err) {
          next(err)
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), edenApiPlugin(), edenMinimalDevPage()],
  server: {
    watch: {
      // 编辑器原子保存时产生的临时目录不要监听，否则 Windows 上会 EBUSY 崩掉 dev
      ignored: ['**/.*.tmpdir/**', '**/.dev-data.json', '**/dist/**']
    }
  }
})
