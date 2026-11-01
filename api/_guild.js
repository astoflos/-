/**
 * 公会成员判定 + 表单校验。
 * 名册来自 src/config.js 的 members（改了名册这里会自动跟着变）。
 */
import config from '../src/config.js'

/** 只按游戏 ID 匹配名册（中文昵称不作为账号名，避免「N」「果果」这类误判） */
export function matchGuild(gameName) {
  const key = String(gameName || '').trim().toLowerCase()
  if (!key) return null
  return (config.members || []).find(m => String(m.id || '').toLowerCase() === key) || null
}

/** 可选：注册公会名册里的名字时要口令（config.auth.guildCode，留空 = 不校验） */
export function guildCode() {
  return String((config.auth && config.auth.guildCode) || '')
}

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
