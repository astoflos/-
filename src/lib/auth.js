import { reactive } from 'vue'
import { api } from './api.js'

/** 全局登录状态（简单的响应式 store，够用就不引入 Pinia） */
export const auth = reactive({
  user: null,
  ready: false,
  error: ''
})

export function isGuild() {
  return !!auth.user && auth.user.role === 'guild'
}

export function roleLabel(user) {
  if (!user) return ''
  return user.role === 'guild' ? '公会成员' : '会员'
}

export async function loadMe() {
  try {
    const res = await api.me()
    auth.user = res.user || null
  } catch (e) {
    auth.user = null
  } finally {
    auth.ready = true
  }
}

export async function login(payload) {
  const res = await api.login(payload)
  auth.user = res.user
  return res.user
}

export async function register(payload) {
  const res = await api.register(payload)
  auth.user = res.user
  return res.user
}

export async function logout() {
  try {
    await api.logout()
  } catch (e) {
    /* 网络失败也把本地状态清掉 */
  }
  auth.user = null
}
