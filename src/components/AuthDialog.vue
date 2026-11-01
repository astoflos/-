<template>
  <v-dialog :model-value="modelValue" max-width="720" @update:model-value="$emit('update:modelValue', $event)">
    <div class="auth-shell" :class="{ 'is-register': mode === 'register' }">
      <!-- 滑动的表单卡片 -->
      <div class="auth-form-box">
        <!-- 登录 -->
        <form v-show="mode === 'login'" class="auth-form" @submit.prevent="submit">
          <h1>LOGIN</h1>
          <input v-model.trim="form.account" placeholder="游戏名 / QQ" autocomplete="username" />
          <input v-model="form.password" type="password" placeholder="密码" autocomplete="current-password" />

          <p v-if="error" class="err">{{ error }}</p>

          <button type="submit" :disabled="loading">
            {{ loading ? '登录中…' : '登录' }}
          </button>

          <button type="button" class="auth-switch" @click="switchMode('register')">
            没有账号？去注册
          </button>
          <p class="auth-note">一个游戏名 / QQ 只能注册一次</p>
        </form>

        <!-- 注册 -->
        <form v-show="mode === 'register'" class="auth-form" @submit.prevent="submit">
          <h1>REGISTER</h1>
          <input v-model.trim="form.gameName" maxlength="16" placeholder="游戏名（英文）" autocomplete="off" />
          <p v-if="guildMatch" class="hint">名册成员 · 注册后为公会成员</p>
          <input v-model.trim="form.qq" inputmode="numeric" maxlength="12" placeholder="QQ 号" autocomplete="off" />
          <input v-model="form.password" type="password" maxlength="64" placeholder="密码（至少 6 位）" autocomplete="new-password" />
          <input v-model="form.confirm" type="password" maxlength="64" placeholder="确认密码" autocomplete="new-password" />
          <input
            v-if="needGuildCode"
            v-model="form.guildCode"
            placeholder="公会口令"
            autocomplete="off"
          />

          <p v-if="error" class="err">{{ error }}</p>

          <button type="submit" :disabled="loading">
            {{ loading ? '注册中…' : '注册并登录' }}
          </button>

          <button type="button" class="auth-switch" @click="switchMode('login')">
            已有账号？去登录
          </button>
          <p class="auth-note">一个游戏名 / QQ 只能注册一次，密码请记牢</p>
        </form>
      </div>

      <!-- 左侧说明（注册时露出） -->
      <div class="auth-side left">
        <h2>第一次来？</h2>
        <p>满 16 岁即可申请入会</p>
        <img src="/img/site/gallery-1.jpg" alt="伊甸" />
        <button type="button" @click="switchMode('login')">已有账号？去登录</button>
      </div>

      <!-- 右侧说明（登录时露出） -->
      <div class="auth-side right">
        <h2>欢迎回来</h2>
        <p>伊甸的门一直开着</p>
        <img src="/img/site/gallery-4.jpg" alt="伊甸" />
        <button type="button" @click="switchMode('register')">还没有账号？去注册</button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import config from '../config.js'
import { login, register } from '../lib/auth.js'

export default {
  name: 'AuthDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    defaultMode: { type: String, default: 'login' }
  },
  emits: ['update:modelValue', 'done'],
  data() {
    return {
      mode: this.defaultMode,
      loading: false,
      error: '',
      form: {
        gameName: '',
        qq: '',
        account: '',
        password: '',
        confirm: '',
        guildCode: ''
      }
    }
  },
  computed: {
    guildMatch() {
      const key = String(this.form.gameName || '').trim().toLowerCase()
      if (!key) return null
      return (config.members || []).find(m => String(m.id || '').toLowerCase() === key) || null
    },
    needGuildCode() {
      return Boolean(this.guildMatch) && Boolean(config.auth && config.auth.guildCode)
    }
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.error = ''
        this.mode = this.defaultMode
      }
    }
  },
  methods: {
    switchMode(mode) {
      this.mode = mode
      this.error = ''
    },
    async submit() {
      if (this.loading) return
      this.error = ''

      if (this.mode === 'register') {
        if (!this.form.gameName) return (this.error = '请填游戏名')
        if (!/^[A-Za-z][A-Za-z0-9_]{1,15}$/.test(this.form.gameName)) {
          return (this.error = '游戏名只能用英文，可带数字和下划线')
        }
        if (!/^\d{5,12}$/.test(this.form.qq)) return (this.error = 'QQ 号需要 5–12 位数字')
        if (this.form.password.length < 6) return (this.error = '密码至少 6 位')
        if (this.form.password !== this.form.confirm) return (this.error = '两次密码不一样')
      } else {
        if (!this.form.account) return (this.error = '请填游戏名或 QQ')
        if (!this.form.password) return (this.error = '请填密码')
      }

      this.loading = true
      try {
        if (this.mode === 'register') {
          await register({
            gameName: this.form.gameName,
            qq: this.form.qq,
            password: this.form.password,
            guildCode: this.form.guildCode
          })
        } else {
          await login({ account: this.form.account, password: this.form.password })
        }
        this.$emit('update:modelValue', false)
        this.$emit('done')
      } catch (e) {
        this.error = e.message || '操作失败'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-shell {
  position: relative;
  width: 660px;
  max-width: 92vw;
  height: 430px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 30px 70px rgba(60, 44, 110, 0.32);
}

.auth-form-box {
  position: absolute;
  top: -22px;
  left: 16px;
  width: 330px;
  height: 474px;
  padding: 26px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(160deg, #cdb3de 0%, #ab89ca 52%, #9870bc 100%);
  box-shadow: 0 18px 44px rgba(90, 60, 140, 0.35);
  z-index: 2;
  transition: transform 0.55s cubic-bezier(0.66, 0, 0.34, 1);
}

.auth-shell.is-register .auth-form-box {
  transform: translateX(300px);
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-form h1 {
  margin: 0 0 14px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: #fff;
}

.auth-form input {
  width: 76%;
  padding: 9px 0;
  margin: 6px 0;
  font-family: inherit;
  font-size: 13.5px;
  text-indent: 6px;
  color: #fff;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 0;
  outline: none;
  transition: border-color 0.3s ease;
}

.auth-form input::placeholder {
  color: rgba(255, 255, 255, 0.78);
}

.auth-form input:focus {
  border-bottom-color: #fff;
}

.auth-form button[type="submit"] {
  width: 76%;
  margin-top: 18px;
  padding: 11px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #7a66d6;
  background: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.auth-form button[type="submit"]:hover {
  background: #f4ecff;
}

.auth-form button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: default;
}

.auth-form .err {
  width: 76%;
  margin: 6px 0 0;
  font-size: 11.5px;
  color: #ffe1ec;
}

.auth-form .hint {
  width: 76%;
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
}

.auth-switch {
  display: none;
  margin-top: 10px;
  font-family: inherit;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.85);
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
}

.auth-note {
  margin: 12px 0 0;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.62);
  text-align: center;
}

/* 两侧说明 */
.auth-side {
  position: absolute;
  top: 50%;
  width: 46%;
  transform: translateY(-50%);
  text-align: center;
  color: #8e9aaf;
}

.auth-side.left {
  left: 2%;
}

.auth-side.right {
  right: 2%;
}

.auth-side h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #6c5f86;
}

.auth-side p {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.auth-side img {
  width: 124px;
  height: 124px;
  margin: 14px 0 12px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 12px 26px rgba(103, 84, 160, 0.22);
  background: #fdf8ff;
}

.auth-side button {
  padding: 7px 16px;
  font-family: inherit;
  font-size: 12.5px;
  color: #7a66d6;
  background: #fff;
  border: 1px solid #dccbee;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease;
}

.auth-side button:hover {
  color: #fff;
  background: #b394d4;
  border-color: #b394d4;
}

@media (max-width: 760px) {
  .auth-shell {
    width: 100%;
    max-width: 100%;
    height: auto;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }

  .auth-form-box {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    transform: none !important;
    border-radius: 18px;
    padding: 26px 14px 20px;
  }

  .auth-side {
    display: none;
  }

  .auth-switch {
    display: block;
  }
}
</style>
