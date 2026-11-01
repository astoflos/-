/**
 * POST /api/login  { account, password }
 * account 可以填游戏名，也可以填 QQ 号。
 */
import { store, storageError } from './_kv.js'
import { json, readBody, hashPassword, safeEqual, createSession, setSessionCookie, publicUser } from './_auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: '只支持 POST' })

  const body = await readBody(req)
  const account = String(body.account || '').trim()
  const password = String(body.password || '')

  if (!account || !password) return json(res, 400, { error: '请填写账号和密码' })

  const isQQ = /^\d{5,12}$/.test(account)
  const key = isQQ
    ? `eden:user:qq:${account}`
    : `eden:user:name:${account.toLowerCase()}`

  const userId = await store.get(key)
  if (!userId) return json(res, 401, { error: '账号或密码不对' })

  const raw = await store.get(`eden:user:${userId}`)
  if (!raw) return json(res, 401, { error: '账号或密码不对' })

  let user
  try {
    user = JSON.parse(raw)
  } catch (e) {
    return json(res, 500, { error: '账号数据损坏' })
  }

  const hash = hashPassword(password, user.salt)
  if (!safeEqual(hash, user.hash)) return json(res, 401, { error: '账号或密码不对' })

  const token = await createSession(user.id)
  setSessionCookie(res, token)

  return json(res, 200, { user: publicUser(user) })
}
