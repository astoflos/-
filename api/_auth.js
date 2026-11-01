/**
 * 账号、密码、会话的公共方法。
 * 密码用 scrypt 加盐哈希，绝不明文存储。
 */
import crypto from 'node:crypto'
import { store } from './_kv.js'

const COOKIE = 'eden_session'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 天

export function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

/** 读取并解析请求体（Vercel 会预解析，dev 插件也会，这里兜底） */
export async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body) } catch (e) { return {} }
    }
    return req.body || {}
  }
  return new Promise(resolve => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')) } catch (e) { resolve({}) }
    })
    req.on('error', () => resolve({}))
  })
}

export function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex')
}

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a), 'hex')
  const bb = Buffer.from(String(b), 'hex')
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

export function parseCookies(req) {
  const raw = req.headers.cookie || ''
  const out = {}
  raw.split(';').forEach(pair => {
    const i = pair.indexOf('=')
    if (i < 0) return
    out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim())
  })
  return out
}

function isProd() {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
}

export function setSessionCookie(res, token) {
  const parts = [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL}`
  ]
  if (isProd()) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearSessionCookie(res) {
  const parts = [`${COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']
  if (isProd()) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export async function createSession(userId) {
  const token = crypto.randomBytes(24).toString('hex')
  await store.setex(`eden:session:${token}`, SESSION_TTL, userId)
  return token
}

export async function currentUser(req) {
  const token = parseCookies(req)[COOKIE]
  if (!token) return null

  const userId = await store.get(`eden:session:${token}`)
  if (!userId) return null

  const raw = await store.get(`eden:user:${userId}`)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export async function destroySession(req) {
  const token = parseCookies(req)[COOKIE]
  if (token) await store.del(`eden:session:${token}`)
}

/** 对外暴露的用户信息（不含 salt / hash） */
export function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    gameName: user.gameName,
    role: user.role,          // 'member' 会员 / 'guild' 公会成员
    memberId: user.memberId || '',
    createdAt: user.createdAt
  }
}
