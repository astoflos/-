/**
 * 存储层：优先用 Vercel KV / Upstash Redis（生产），本地开发回落到 JSON 文件。
 * 只需要 SET / GET / DEL / SETNX / SETEX 这几个命令。
 */
import fs from 'node:fs'
import path from 'node:path'

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

export const cloudMode = Boolean(URL && TOKEN)

const IS_PROD = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

/** 线上没配置 KV 时给一句人话，而不是 500 */
export function storageError() {
  if (IS_PROD && !cloudMode) {
    return '云端存储还没配置：请在 Vercel 项目里开通 KV（Storage → Create → Upstash Redis → Connect），再重新部署一次'
  }
  return ''
}

/* ---------------- 云端：直接走 Upstash REST，不额外装依赖 ---------------- */
async function redis(...args) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  })
  if (!res.ok) throw new Error(`KV 请求失败（HTTP ${res.status}）`)
  const data = await res.json()
  if (data.error) throw new Error(`KV 错误：${data.error}`)
  return data.result
}

/* ---------------- 本地：一个 JSON 文件当数据库 ---------------- */
const FILE = path.resolve(process.cwd(), '.dev-data.json')

function readFileStore() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'))
  } catch (e) {
    return {}
  }
}

function writeFileStore(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
}

function fileGet(key) {
  const db = readFileStore()
  const hit = db[key]
  if (!hit) return null
  if (hit.exp && hit.exp < Date.now()) {
    delete db[key]
    writeFileStore(db)
    return null
  }
  return hit.value
}

export const store = {
  async get(key) {
    if (cloudMode) return redis('GET', key)
    return fileGet(key)
  },

  async set(key, value) {
    if (cloudMode) return redis('SET', key, value)
    const db = readFileStore()
    db[key] = { value }
    writeFileStore(db)
    return 'OK'
  },

  async setex(key, seconds, value) {
    if (cloudMode) return redis('SET', key, value, 'EX', seconds)
    const db = readFileStore()
    db[key] = { value, exp: Date.now() + seconds * 1000 }
    writeFileStore(db)
    return 'OK'
  },

  async setnx(key, value) {
    if (cloudMode) return redis('SET', key, value, 'NX')
    const db = readFileStore()
    const old = db[key]
    if (old && (!old.exp || old.exp > Date.now())) return null
    db[key] = { value }
    writeFileStore(db)
    return 'OK'
  },

  async del(key) {
    if (cloudMode) return redis('DEL', key)
    const db = readFileStore()
    delete db[key]
    writeFileStore(db)
    return 1
  }
}
