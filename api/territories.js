/**
 * /api/territories
 *   GET    列出「登记表」里新增的领地（页面会把它和 config.js 里原有的领地合并显示）
 *   POST   新增领地（只有公会成员能加）
 *   DELETE 删除某条新增的领地（只有公会成员能删）
 */
import crypto from 'node:crypto'
import { store, storageError } from './_kv.js'
import { json, readBody, currentUser, publicUser } from './_auth.js'
import { checkTerritory } from './_guild.js'

const KEY = 'eden:territories'
const MAX = 300

async function readItems() {
  const raw = await store.get(KEY)
  if (!raw) return []
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

async function writeItems(items) {
  await store.set(KEY, JSON.stringify(items.slice(0, MAX)))
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await readItems()
    return json(res, 200, { items })
  }

  const user = await currentUser(req)
  if (!user) {
    return json(res, 401, { error: '请先登录' })
  }
  if (user.role !== 'guild') {
    return json(res, 403, { error: '只有公会成员可以登记领地' })
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    const bad = checkTerritory(body)
    if (bad) return json(res, 400, { error: bad })

    const items = await readItems()

    const item = {
      id: 't_' + crypto.randomBytes(6).toString('hex'),
      type: body.type,
      cmd: String(body.cmd).trim(),
      desc: String(body.desc || '').trim(),
      products: String(body.products || '').trim(),
      owner: user.memberId || user.gameName,
      by: user.gameName,
      createdAt: Date.now()
    }

    items.unshift(item)
    await writeItems(items)

    return json(res, 200, { item, items, user: publicUser(user) })
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url || '/', 'http://localhost')
    const id = url.searchParams.get('id')
    if (!id) return json(res, 400, { error: '缺少 id' })

    const items = await readItems()
    const next = items.filter(t => t.id !== id)
    if (next.length === items.length) return json(res, 404, { error: '没找到这条领地' })

    await writeItems(next)
    return json(res, 200, { ok: true, items: next })
  }

  return json(res, 405, { error: '不支持的方法' })
}
