/**
 * POST /api/login  { account, password }
 * account 可以填游戏名，也可以填 QQ 号。
 *
 * 「万一忘了密码」的几条通道，只对 RECOVERY_ACCOUNTS 里的两个账号生效：
 *   1. 正常密码                         —— 平时走这条
 *   2. KV 里存的恢复码                  —— 在页面上「页面设置 → 账号安全」自己设的，不需要环境变量
 *   3. 环境变量 EDEN_RECOVERY_CODE      —— 有就顺便支持，没有也不影响
 *   4. KV_REST_API_TOKEN                —— 兜底：连恢复码都忘了，用 Vercel 里 KV 的 token 也能进
 * 三条恢复通道都不用改代码、也不用重新部署。
 */
import crypto from 'node:crypto'
import { store, storageError } from './_kv.js'
import { json, readBody, hashPassword, safeEqual, createSession, setSessionCookie, publicUser } from './_auth.js'

const RECOVERY_ACCOUNTS = ['guoguo', 'ruo_xi']

const ENV_CODE = String(process.env.EDEN_RECOVERY_CODE || '').trim()
// KV 的 token 在接上 KV 之后自动就有，不用额外配
const KV_TOKEN = String(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()

/** 固定时间比较，避免用响应时间猜码 */
function sameSecret(a, b) {
  const da = crypto.createHash('sha256').update(String(a)).digest()
  const db = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(da, db)
}

function sameRecoveryCode(code, raw) {
  try {
    const { salt, hash } = JSON.parse(raw)
    return sameSecret(crypto.scryptSync(String(code), salt, 32).toString('hex'), hash)
  } catch (e) {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: '只支持 POST' })

  const storageMsg = storageError()
  if (storageMsg) return json(res, 503, { error: storageMsg })

  const body = await readBody(req)
  const account = String(body.account || '').trim()
  const password = String(body.password || '')

  if (!account || !password) return json(res, 400, { error: '请填写账号和密码' })

  const isQQ = /^\d{5,12}$/.test(account)
  const key = isQQ
    ? `eden:user:qq:${account}`
    : `eden:user:name:${account.toLowerCase()}`

  // 账号没注册过时，先看这次提交的是不是某条恢复通道，好给一句人话
  const userId = await store.get(key)
  if (!userId) {
    const nameForRecovery = isQQ ? '' : account.toLowerCase()
    const looksLikeRecovery =
      RECOVERY_ACCOUNTS.includes(nameForRecovery) &&
      ((ENV_CODE && sameSecret(password, ENV_CODE)) || (KV_TOKEN && sameSecret(password, KV_TOKEN)))
    if (looksLikeRecovery) {
      return json(res, 404, { error: '恢复码有效，但这个账号还没注册过，先用注册流程建一个' })
    }
    return json(res, 401, { error: '账号或密码不对' })
  }

  const raw = await store.get(`eden:user:${userId}`)
  if (!raw) return json(res, 401, { error: '账号或密码不对' })

  let user
  try {
    user = JSON.parse(raw)
  } catch (e) {
    return json(res, 500, { error: '账号数据损坏' })
  }

  const name = String(user.gameName || '').toLowerCase()
  const canRecover = RECOVERY_ACCOUNTS.includes(name)

  let ok = safeEqual(hashPassword(password, user.salt), user.hash)
  let via = ''

  if (!ok && canRecover) {
    const saved = await store.get(`eden:recovery:${name}`)
    if (saved && sameRecoveryCode(password, saved)) {
      ok = true
      via = 'recovery'
    }
  }

  if (!ok && canRecover && ENV_CODE && sameSecret(password, ENV_CODE)) {
    ok = true
    via = 'env'
  }

  if (!ok && canRecover && KV_TOKEN && sameSecret(password, KV_TOKEN)) {
    ok = true
    via = 'kv-token'
  }

  if (!ok) return json(res, 401, { error: '账号或密码不对' })
  if (via) console.warn(`[eden] 恢复通道登录（${via}）：` + user.gameName)

  const token = await createSession(user.id)
  setSessionCookie(res, token)

  return json(res, 200, { user: publicUser(user), recovered: via || '' })
}
