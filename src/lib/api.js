/** 前端调用后端接口的薄封装（都走 /api，本地和线上一致） */
const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  let data = {}
  try {
    data = await res.json()
  } catch (e) {
    data = {}
  }

  if (!res.ok) {
    throw new Error(data.error || `请求失败（${res.status}）`)
  }
  return data
}

export const api = {
  me: () => request('/me'),
  register: payload => request('/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: payload => request('/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/logout', { method: 'POST' }),

  territories: () => request('/territories'),
  addTerritory: payload => request('/territories', { method: 'POST', body: JSON.stringify(payload) }),
  deleteTerritory: id => request('/territories?id=' + encodeURIComponent(id), { method: 'DELETE' })
}
