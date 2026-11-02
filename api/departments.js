/**
 * /api/departments —— 公会部门（只存「谁是部长」，部门本身写在 config.js）
 *
 *   GET            列出各部的部长设置
 *   PATCH ?id=xxx  { leader, acting }  只有 guoguo / ruo_xi 能改；leader 传空 = 撤掉
 */
import { store, storageError } from './_kv.js'
import { json, readBody, currentUser } from './_auth.js'
import { isMemberAdmin, matchMember } from './_guild.js'
import config from '../src/config.js'

const KEY = 'eden:departments'

async function readStore() {
  const raw = await store.get(KEY)
  if (!raw) return {}
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  } catch (e) {
    return {}
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, { items: await readStore() })
  }

  const storageMsg = storageError()
  if (storageMsg) return json(res, 503, { error: storageMsg })

  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '请先登录' })
  if (!isMemberAdmin(user)) return json(res, 403, { error: '只有果果和会长可以任命部长' })

  const url = new URL(req.url || '/', 'http://localhost')
  const id = url.searchParams.get('id')

  if (req.method === 'PATCH') {
    if (!id) return json(res, 400, { error: '缺少部门 id' })
    if (!(config.departments || []).some(d => d.key === id)) return json(res, 404, { error: '没有这个部门' })

    const body = await readBody(req)
    const leader = String(body.leader || '').trim()
    const acting = Boolean(body.acting)
    const data = await readStore()

    if (!leader) {
      delete data[id]
      await store.set(KEY, JSON.stringify(data))
      return json(res, 200, { ok: true, items: data })
    }

    // 部长必须是名册里的人（config 或页面上录入的成员）
    const member = await matchMember(leader)
    if (!member) return json(res, 400, { error: '名册里没有这个游戏 ID' })

    data[id] = { leader: String(member.id), acting, by: user.gameName, at: Date.now() }
    await store.set(KEY, JSON.stringify(data))
    return json(res, 200, { ok: true, items: data })
  }

  return json(res, 405, { error: '不支持的方法' })
}
