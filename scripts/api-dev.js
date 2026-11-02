/**
 * 本地开发用的 /api 服务：把 api/*.js 直接挂进 Vite 的中间件，
 * 这样 `npm run dev` 就能测注册/登录/领地，不需要装 vercel CLI。
 * 生产环境（Vercel）不会用到这个文件，走真正的 api/ 函数。
 */
import register from '../api/register.js'
import login from '../api/login.js'
import logout from '../api/logout.js'
import me from '../api/me.js'
import territories from '../api/territories.js'
import members from '../api/members.js'
import recovery from '../api/recovery.js'
import projects from '../api/projects.js'
import departments from '../api/departments.js'

const routes = {
  'POST /register': register,
  'POST /login': login,
  'POST /logout': logout,
  'GET /me': me,
  'GET /territories': territories,
  'POST /territories': territories,
  'DELETE /territories': territories,
  'GET /members': members,
  'POST /members': members,
  'DELETE /members': members,
  'GET /recovery': recovery,
  'POST /recovery': recovery,
  'DELETE /recovery': recovery,
  'GET /projects': projects,
  'POST /projects': projects,
  'PATCH /projects': projects,
  'DELETE /projects': projects,
  'GET /departments': departments,
  'PATCH /departments': departments
}

function readRaw(req) {
  return new Promise(resolve => {
    let raw = ''
    req.on('data', c => { raw += c })
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

export function edenApiPlugin() {
  return {
    name: 'eden-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const pathname = (req.url || '/').split('?')[0].replace(/\/+$/, '') || '/'
        const handler = routes[`${req.method} ${pathname}`]
        if (!handler) return next()

        try {
          if (req.method !== 'GET') {
            req.body = await readRaw(req)
          }
          await handler(req, res)
        } catch (e) {
          console.error('[dev-api]', pathname, e)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: '服务器错误：' + e.message }))
          }
        }
      })
    }
  }
}
