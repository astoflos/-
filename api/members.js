/**
 * /api/members
 *   GET    列出「录入」的成员（页面会把它和 config.js 里写死的名册合并显示）
 *   POST   录入新成员（只有 config.auth.memberAdmins 里的账号能加，默认 guoguo / ruo_xi）
 *   DELETE 删除某条录入（同上，只有这两个账号能删）
 *
 * 注意：这里只改「录入」的那部分，config.js 里写死的名册不受影响。
 */
import { json, readBody, currentUser } from './_auth.js'
import {
  MAX_MEMBERS,
  readExtraMembers,
  writeExtraMembers,
  isMemberAdmin,
  checkMember,
  pickAvatar,
  pickColor,
  makeUid
} from './_guild.js'
import config from '../src/config.js'

async function allIds() {
  const extra = await readExtraMembers()
  return [
    ...(config.members || []).map(m => String(m.id || '').toLowerCase()),
    ...extra.map(m => String(m.id || '').toLowerCase())
  ]
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await readExtraMembers()
    return json(res, 200, { items })
  }

  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '请先登录' })
  // 只有 guoguo / ruo_xi 两个账号能动名册，其他公会成员也不行
  if (!isMemberAdmin(user)) return json(res, 403, { error: '只有果果和会长可以录入成员' })

  if (req.method === 'POST') {
    const body = await readBody(req)
    const bad = checkMember(body)
    if (bad) return json(res, 400, { error: bad })

    const gameId = String(body.gameId).trim()
    const key = gameId.toLowerCase()

    const ids = await allIds()
    if (ids.includes(key)) return json(res, 409, { error: '名册里已经有这个游戏 ID 了' })

    const items = await readExtraMembers()
    if (items.length >= MAX_MEMBERS) return json(res, 400, { error: `最多录入 ${MAX_MEMBERS} 位` })

    const takenUids = [
      ...(config.members || []).map(m => m.uid),
      ...(config.guests || []).map(g => g.uid),
      ...items.map(m => m.uid)
    ]

    const item = {
      id: gameId,
      name: String(body.name).trim(),
      role: String(body.role || '成员'),
      avatar: pickAvatar(key),
      uid: makeUid(takenUids),
      joinDate: String(body.joinDate || '').trim() || new Date().toISOString().slice(0, 10),
      intro: String(body.intro || '').trim(),
      quote: String(body.quote || '').trim(),
      color: pickColor(key),
      by: user.gameName,
      createdAt: Date.now(),
      custom: true
    }

    items.unshift(item)
    await writeExtraMembers(items)

    return json(res, 200, { item, items })
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url || '/', 'http://localhost')
    const id = url.searchParams.get('id')
    if (!id) return json(res, 400, { error: '缺少 id' })

    const items = await readExtraMembers()
    const hit = items.find(m => m.id === id)
    if (!hit) return json(res, 404, { error: '名册里没有这位' })

    const next = items.filter(m => m.id !== id)
    await writeExtraMembers(next)
    return json(res, 200, { ok: true, items: next })
  }

  return json(res, 405, { error: '不支持的方法' })
}
