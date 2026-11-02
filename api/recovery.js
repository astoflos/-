/**
 * /api/recovery —— 恢复码（不依赖环境变量）
 *
 *   GET    当前账号能不能设置 / 设置过没有
 *   POST   { code } 设置或重设（至少 8 位）
 *   DELETE 清除
 *
 * 只有 RECOVERY_ACCOUNTS 里的账号能用（和后门名单保持一致），
 * 而且必须先用正常密码登录进来 —— 等于「趁还记得密码时先把钥匙配一把」。
 * 码本身按 scrypt 加盐存进 KV，不存明文。
 */
import crypto from 'node:crypto'
import { store } from './_kv.js'
import { json, readBody, currentUser } from './_auth.js'

export const RECOVERY_ACCOUNTS = ['guoguo', 'ruo_xi']

const keyOf = name => `eden:recovery:${name}`

function hashCode(code, salt) {
  return crypto.scryptSync(String(code), salt, 32).toString('hex')
}

export default async function handler(req, res) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '请先登录' })

  const name = String(user.gameName || '').toLowerCase()
  const applicable = RECOVERY_ACCOUNTS.includes(name)

  if (req.method === 'GET') {
    const raw = applicable ? await store.get(keyOf(name)) : null
    return json(res, 200, { applicable, enabled: Boolean(raw) })
  }

  if (!applicable) return json(res, 403, { error: '这个账号不支持设置恢复码' })

  if (req.method === 'POST') {
    const body = await readBody(req)
    const code = String(body.code || '').trim()

    if (code.length < 8) return json(res, 400, { error: '恢复码至少 8 位' })
    if (code.length > 72) return json(res, 400, { error: '恢复码最多 72 位' })

    const salt = crypto.randomBytes(16).toString('hex')
    await store.set(keyOf(name), JSON.stringify({ salt, hash: hashCode(code, salt), at: Date.now() }))

    return json(res, 200, { ok: true, enabled: true })
  }

  if (req.method === 'DELETE') {
    await store.del(keyOf(name))
    return json(res, 200, { ok: true, enabled: false })
  }

  return json(res, 405, { error: '不支持的方法' })
}
