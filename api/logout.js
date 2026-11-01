/** POST /api/logout —— 退出登录 */
import { json, destroySession, clearSessionCookie } from './_auth.js'
import { storageError } from './_kv.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: '只支持 POST' })

  const storageMsg = storageError()
  if (storageMsg) {
    clearSessionCookie(res)
    return json(res, 200, { ok: true })
  }

  await destroySession(req)
  clearSessionCookie(res)
  return json(res, 200, { ok: true })
}
