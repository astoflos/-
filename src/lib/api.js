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
  deleteTerritory: id => request('/territories?id=' + encodeURIComponent(id), { method: 'DELETE' }),

  members: () => request('/members'),
  addMember: payload => request('/members', { method: 'POST', body: JSON.stringify(payload) }),
  deleteMember: id => request('/members?id=' + encodeURIComponent(id), { method: 'DELETE' }),

  recovery: () => request('/recovery'),
  setRecovery: code => request('/recovery', { method: 'POST', body: JSON.stringify({ code }) }),
  clearRecovery: () => request('/recovery', { method: 'DELETE' }),

  projects: () => request('/projects'),
  addProject: payload => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  setProjectStatus: (id, status) => request('/projects?id=' + encodeURIComponent(id), {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  finishProject: id => request('/projects?id=' + encodeURIComponent(id) + '&finish=1', { method: 'POST' }),
  deleteProject: id => request('/projects?id=' + encodeURIComponent(id), { method: 'DELETE' }),

  departments: () => request('/departments'),
  setDepartmentLeader: (id, leader, acting) => request('/departments?id=' + encodeURIComponent(id), {
    method: 'PATCH',
    body: JSON.stringify({ leader, acting })
  })
}
