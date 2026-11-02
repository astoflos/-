/**
 * /api/projects —— 项目申报
 *
 *   GET   列出所有项目（谁都能看）
 *   POST  申报项目（只有公会成员能填）
 *   PATCH ?id=        改状态（申报人本人或 guoguo / ruo_xi）
 *   POST  ?id=&finish=1  确认完成（只有 guoguo / ruo_xi）
 *        → 按类型决定：活动 / 建筑 进公会领地，科技 进登记领地，附属 直接结束
 */
import crypto from 'node:crypto'
import { store, storageError } from './_kv.js'
import { json, readBody, currentUser } from './_auth.js'
import { checkProject, PROJECT_TERRITORY_TYPE, sanitizeMaterials, isMemberAdmin } from './_guild.js'
import { readItems as readTerritories, writeItems as writeTerritories } from './territories.js'

const KEY = 'eden:projects'
const MAX = 200

/** 第一次打开时写进去的示例项目 */
const SEED = [
  {
    id: 'p_fusang_0001',
    name: '主城扩建—扶桑',
    owner: 'ruo_xi',
    members: '全体公会成员',
    type: 'attached',
    intro: '对公会主城进行扩建，主要内容是建造扶桑树',
    budget: '约 100w 金币',
    materials: [],
    materialsNote: 'todo',
    startDate: '2026-10-12',
    status: 'doing',
    by: 'ruo_xi',
    createdAt: Date.parse('2026-10-12T00:00:00+08:00')
  }
]

async function readItems() {
  const raw = await store.get(KEY)
  if (raw === null || raw === undefined) {
    // 第一次：把示例项目种进去，之后它就是普通数据了
    await store.set(KEY, JSON.stringify(SEED))
    return SEED.map(p => ({ ...p }))
  }
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.map(normalize) : []
  } catch (e) {
    return []
  }
}

/** 老数据里「待补充 / 无」是当成一行材料存的，读的时候转成新的 materialsNote */
function normalize(p) {
  if (!p || typeof p !== 'object') return p
  if (p.materialsNote) return p
  const mats = Array.isArray(p.materials) ? p.materials : null
  if (mats && mats.length === 1 && !String(mats[0].qty || '').trim()) {
    const name = String(mats[0].name || '').trim()
    if (name === '无') return { ...p, materials: [], materialsNote: 'none' }
    if (name === '待补充') return { ...p, materials: [], materialsNote: 'todo' }
  }
  return p
}

async function writeItems(items) {
  await store.set(KEY, JSON.stringify(items.slice(0, MAX)))
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const items = await readItems()
    return json(res, 200, { items })
  }

  const storageMsg = storageError()
  if (storageMsg) return json(res, 503, { error: storageMsg })

  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '请先登录' })

  const url = new URL(req.url || '/', 'http://localhost')
  const id = url.searchParams.get('id')
  const finish = url.searchParams.get('finish')

  /* ---------- 申报 ---------- */
  if (req.method === 'POST' && !id) {
    if (user.role !== 'guild') return json(res, 403, { error: '只有公会成员可以申报项目' })

    const body = await readBody(req)
    const bad = checkProject(body)
    if (bad) return json(res, 400, { error: bad })

    const items = await readItems()
    const item = {
      id: 'p_' + crypto.randomBytes(6).toString('hex'),
      name: String(body.name).trim(),
      owner: String(body.owner).trim(),
      members: String(body.members || '').trim(),
      type: String(body.type),
      intro: String(body.intro || '').trim(),
      budget: String(body.budget || '').trim(),
      materials: String(body.materialsNote || '') ? [] : sanitizeMaterials(body.materials),
      materialsNote: String(body.materialsNote || ''),
      startDate: String(body.startDate || '').trim(),
      status: String(body.status),
      by: user.gameName,
      createdAt: Date.now()
    }

    items.unshift(item)
    await writeItems(items)
    return json(res, 200, { item, items })
  }

  // 以下都要先找到项目
  const items = await readItems()
  const hit = items.find(p => p.id === id)
  if (!hit) return json(res, 404, { error: '没找到这个项目' })

  /* ---------- 确认完成（只有果果 / 会长） ---------- */
  if (req.method === 'POST' && finish) {
    if (!isMemberAdmin(user)) return json(res, 403, { error: '只有果果和会长可以确认完成' })
    if (hit.status !== 'done') return json(res, 400, { error: '项目状态还不是「已完成」' })

    const territoryType = PROJECT_TERRITORY_TYPE[hit.type] || ''
    let territory = null

    if (territoryType) {
      const list = await readTerritories()
      territory = {
        id: 't_' + crypto.randomBytes(6).toString('hex'),
        type: territoryType,
        cmd: hit.name,
        desc: hit.intro || hit.name,
        products: '',
        owner: hit.owner || user.gameName,
        by: user.gameName,
        createdAt: Date.now(),
        fromProject: hit.id
      }
      list.unshift(territory)
      await writeTerritories(list)
    }

    // 项目结束：直接从列表里拿掉
    const next = items.filter(p => p.id !== id)
    await writeItems(next)

    return json(res, 200, { ok: true, territory, items: next })
  }

  /* ---------- 改状态 ---------- */
  if (req.method === 'PATCH') {
    const body = await readBody(req)
    const status = String(body.status || '')

    if (!['plan', 'doing', 'done'].includes(status)) return json(res, 400, { error: '状态不对' })
    if (hit.by !== user.gameName && !isMemberAdmin(user)) {
      return json(res, 403, { error: '只能改自己申报的项目' })
    }

    hit.status = status
    await writeItems(items)
    return json(res, 200, { ok: true, item: hit, items })
  }

  /* ---------- 删除 ---------- */
  if (req.method === 'DELETE') {
    if (hit.by !== user.gameName && !isMemberAdmin(user)) {
      return json(res, 403, { error: '只能删自己申报的项目' })
    }
    const next = items.filter(p => p.id !== id)
    await writeItems(next)
    return json(res, 200, { ok: true, items: next })
  }

  return json(res, 405, { error: '不支持的方法' })
}
