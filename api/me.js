/** GET /api/me —— 当前登录状态（没登录返回 user: null） */
import { json, currentUser, publicUser } from './_auth.js'
import { storageError } from './_kv.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: '只支持 GET' })

  const storageMsg = storageError()
  if (storageMsg) return json(res, 503, { error: storageMsg })

  const user = await currentUser(req)
  return json(res, 200, { user: publicUser(user) })
}
