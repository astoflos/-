/**
 * POST /api/register  { gameName, qq, password, guildCode? }
 * 规则：
 *  - 每个游戏名只能注册一次，每个 QQ 也只能注册一次
 *  - 游戏名命中公会名册 → 角色是「公会成员」，否则是「会员」
 */
import crypto from 'node:crypto'
import { store, storageError } from './_kv.js'
import { json, readBody, hashPassword, createSession, setSessionCookie, publicUser } from './_auth.js'
import { matchMember, guildCode, checkGameName, checkQQ, checkPassword } from './_guild.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: '只支持 POST' })

  const storageMsg = storageError()
  if (storageMsg) return json(res, 503, { error: storageMsg })

  const body = await readBody(req)
  const gameName = String(body.gameName || '').trim()
  const qq = String(body.qq || '').trim()
  const password = String(body.password || '')

  const bad = checkGameName(gameName) || checkQQ(qq) || checkPassword(password)
  if (bad) return json(res, 400, { error: bad })

  const nameKey = `eden:user:name:${gameName.toLowerCase()}`
  const qqKey = `eden:user:qq:${qq}`

  const [byName, byQQ] = await Promise.all([store.get(nameKey), store.get(qqKey)])
  if (byName) return json(res, 409, { error: '这个游戏名已经被注册了，直接登录吧' })
  if (byQQ) return json(res, 409, { error: '这个 QQ 已经注册过账号了，换个 QQ 或直接登录' })

  const member = await matchMember(gameName)
  const role = member ? 'guild' : 'member'

  // 可选口令：只有注册名册里的名字才需要，未配置则跳过
  if (member && guildCode()) {
    if (String(body.guildCode || '') !== guildCode()) {
      return json(res, 403, { error: '这个名字属于公会名册，需要填写公会口令' })
    }
  }

  const id = 'u_' + crypto.randomBytes(8).toString('hex')
  const salt = crypto.randomBytes(16).toString('hex')

  // 先用 SETNX 抢占唯一键，避免并发下重复注册
  const okName = await store.setnx(nameKey, id)
  if (!okName) return json(res, 409, { error: '这个游戏名已经被注册了，直接登录吧' })

  const okQQ = await store.setnx(qqKey, id)
  if (!okQQ) {
    await store.del(nameKey)
    return json(res, 409, { error: '这个 QQ 已经注册过账号了，换个 QQ 或直接登录' })
  }

  const user = {
    id,
    gameName,
    qq,
    role,
    memberId: member ? String(member.id || '') : '',
    salt,
    hash: hashPassword(password, salt),
    createdAt: Date.now()
  }

  await store.set(`eden:user:${id}`, JSON.stringify(user))

  const token = await createSession(id)
  setSessionCookie(res, token)

  return json(res, 200, { user: publicUser(user), isNew: true })
}
