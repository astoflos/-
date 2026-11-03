/**
 * 公会成员判定 + 表单校验。
 * 名册来自两处：src/config.js 的 members（写死的），以及页面上「录入成员」存进 KV 的名单。
 */
import crypto from 'node:crypto'
import config from '../src/config.js'
import { store } from './_kv.js'

export const MEMBERS_KEY = 'eden:members'
export const MAX_MEMBERS = 200

/* ---------------- KV 里「录入」的成员 ---------------- */

export async function readExtraMembers() {
  const raw = await store.get(MEMBERS_KEY)
  if (!raw) return []
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

export async function writeExtraMembers(list) {
  await store.set(MEMBERS_KEY, JSON.stringify(list.slice(0, MAX_MEMBERS)))
}

/**
 * 名册匹配：config.members 优先，其次找页面上录入的成员。
 * 只按游戏 ID 匹配（中文昵称不作为账号名，避免「N」「果果」这类误判）
 */
export async function matchMember(gameName) {
  const key = String(gameName || '').trim().toLowerCase()
  if (!key) return null

  const builtin = (config.members || []).find(m => String(m.id || '').toLowerCase() === key)
  if (builtin) return builtin

  const extra = await readExtraMembers()
  return extra.find(m => String(m.id || '').toLowerCase() === key) || null
}

/** 会长判定（config.leaders.leader.id），用于「只能删自己录的」这类权限 */
export function isLeader(user) {
  if (!user) return false
  const leaderId = String((config.leaders && config.leaders.leader && config.leaders.leader.id) || '').toLowerCase()
  if (!leaderId) return false
  return String(user.memberId || user.gameName || '').toLowerCase() === leaderId
}

/**
 * 「录入成员」权限：只给 config.auth.memberAdmins 里的账号（默认 guoguo / ruo_xi）。
 * 其他公会成员一样没有这个权限。
 */
export function memberAdmins() {
  const list = (config.auth && config.auth.memberAdmins) || ['guoguo', 'ruo_xi']
  return list.map(id => String(id || '').toLowerCase()).filter(Boolean)
}

export function isMemberAdmin(user) {
  if (!user) return false
  return memberAdmins().includes(String(user.gameName || '').toLowerCase())
}

/** 可选：注册公会名册里的名字时要口令（config.auth.guildCode，留空 = 不校验） */
export function guildCode() {
  return String((config.auth && config.auth.guildCode) || '')
}

/* ---------------- 校验 ---------------- */

export function checkGameName(name) {
  const v = String(name || '').trim()
  if (v.length < 2 || v.length > 16) return '游戏名需要 2–16 位'
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(v)) return '游戏名只能用英文，可以带数字和下划线'
  return null
}

export function checkQQ(qq) {
  const v = String(qq || '').trim()
  if (!/^\d{5,12}$/.test(v)) return 'QQ 号需要 5–12 位数字'
  return null
}

export function checkPassword(pwd) {
  const v = String(pwd || '')
  if (v.length < 6) return '密码至少 6 位'
  if (v.length > 64) return '密码太长啦'
  return null
}

export function checkTerritory(body) {
  const type = String(body.type || '')
  if (!['building', 'private', 'public'].includes(type)) return '领地类型不对'

  const cmd = String(body.cmd || '').trim()
  if (cmd.length < 1 || cmd.length > 40) return '领地名字需要 1–40 个字符'

  const desc = String(body.desc || '').trim()
  if (desc.length > 60) return '介绍最多 60 个字'

  const products = String(body.products || '').trim()
  if (products.length > 120) return '产物最多 120 个字'

  return null
}

/** 录入成员的校验 */
export function checkMember(body) {
  const name = String(body.name || '').trim()
  if (!name) return '请填昵称'
  if (name.length > 12) return '昵称最多 12 个字'

  const gameId = String(body.gameId || '').trim()
  if (!/^[A-Za-z][A-Za-z0-9_]{1,15}$/.test(gameId)) {
    return '游戏 ID 需要英文开头，2–16 位，可带数字和下划线'
  }

  const role = String(body.role || '成员')
  if (!['会长', '副会长', '成员'].includes(role)) return '职位只能是 会长 / 副会长 / 成员'

  if (String(body.intro || '').trim().length > 60) return '介绍最多 60 个字'
  if (String(body.quote || '').trim().length > 60) return '一句话最多 60 个字'

  const joinDate = String(body.joinDate || '').trim()
  if (joinDate && !/^\d{4}-\d{2}-\d{2}$/.test(joinDate)) return '加入日期格式是 2026-01-01'

  return null
}

/* ---------------- 录入成员时自动补的字段 ---------------- */

// 新录入的成员从 avatar-1 ~ avatar-24 里挑（后面那批是备用的）
const AVATAR_COUNT = 24
const COLORS = ['#7a66d6', '#e58fb6', '#f0a868', '#63b3c3', '#9d8cd8', '#74c0a4', '#c79ad0', '#8fa4d8']

function hashOf(seed) {
  let h = 0
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

/** 同一个游戏 ID 永远拿到同一张头像 / 同一个底色，重录也不会变 */
export function pickAvatar(seed) {
  return `/img/site/avatars/avatar-${(hashOf(seed) % AVATAR_COUNT) + 1}.jpg`
}

export function pickColor(seed) {
  return COLORS[hashOf(seed) % COLORS.length]
}

/**
 * 新注册账号的「候选成员档案」：字段顺序和 config.members 里的老成员一致，
 * 方便直接复制到数据库 / config.js 里转正。
 */
export async function candidateProfile(gameName) {
  const extra = await readExtraMembers()
  const taken = [
    ...(config.members || []).map(m => m.uid),
    ...(config.guests || []).map(g => g.uid),
    ...extra.map(m => m.uid)
  ]
  const key = String(gameName || '').trim().toLowerCase()
  return {
    name: String(gameName || '').trim(),
    id: String(gameName || '').trim(),
    role: '成员',
    color: pickColor(key),
    avatar: pickAvatar(key),
    uid: makeUid(taken),
    joinDate: new Date().toISOString().slice(0, 10),
    intro: '',
    quote: ''
  }
}

/** 成员 UID：E + 5 位数字（特邀嘉宾在 config.guests 里手写 D + 5 位） */
export function makeUid(taken = []) {
  const used = new Set((taken || []).map(u => String(u)))
  for (let i = 0; i < 20; i++) {
    const uid = 'E' + String(crypto.randomInt(10000, 100000))
    if (!used.has(uid)) return uid
  }
  return 'E' + String(crypto.randomInt(10000, 100000))
}

/* ---------------- 项目申报 ---------------- */

// 类型：活动 / 建筑 → 完成后进公会领地；科技 → 完成后进登记领地；附属 → 完成后不记录
export const PROJECT_TYPES = ['event', 'build', 'tech', 'attached']
export const PROJECT_STATUS = ['plan', 'doing', 'done']

/** 项目完成后要落到哪种领地上（活动 / 附属返回 ''，表示不用记） */
export const PROJECT_TERRITORY_TYPE = {
  event: '',
  build: 'building',
  tech: 'private',
  attached: ''
}

/** 材料清单统一成 [{ name, qty }]，最多 30 行 */
export function sanitizeMaterials(input) {
  const list = Array.isArray(input) ? input : []
  return list
    .map(m => ({
      name: String((m && m.name) || '').trim().slice(0, 40),
      qty: String((m && m.qty) || '').trim().slice(0, 30)
    }))
    .filter(m => m.name || m.qty)
    .slice(0, 30)
}

export const PROJECT_MATERIALS_NOTE = ['none', 'todo']

export function checkProject(body) {
  const name = String(body.name || '').trim()
  if (!name) return '请填项目名称'
  if (name.length > 40) return '项目名称最多 40 个字'

  const owner = String(body.owner || '').trim()
  if (!owner) return '请填项目执行（游戏 ID）'
  if (owner.length > 32) return '项目执行名字太长'

  if (String(body.members || '').trim().length > 60) return '参与成员最多 60 个字'

  if (!PROJECT_TYPES.includes(String(body.type || ''))) return '项目类型不对'
  if (!PROJECT_STATUS.includes(String(body.status || ''))) return '项目状态不对'

  if (String(body.intro || '').trim().length > 200) return '项目简介最多 200 个字'
  if (String(body.budget || '').trim().length > 40) return '预估财政最多 40 个字'

  const note = String(body.materialsNote || '')
  if (note && !PROJECT_MATERIALS_NOTE.includes(note)) return '材料状态不对'

  if (!note) {
    if (Array.isArray(body.materials)) {
      if (body.materials.length > 30) return '材料最多 30 行'
      const bad = body.materials.find(m => String((m && m.name) || '').length > 40 || String((m && m.qty) || '').length > 30)
      if (bad) return '材料名最多 40 个字、数量最多 30 个字'
    } else if (String(body.materials || '').trim().length > 200) {
      return '所需材料最多 200 个字'
    }
  }

  const startDate = String(body.startDate || '').trim()
  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return '开始日期格式是 2026-01-01'

  return null
}
