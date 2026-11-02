<template>
  <v-dialog :model-value="modelValue" max-width="540" @update:model-value="$emit('update:modelValue', $event)">
    <div class="dialog-card">
      <h2 class="dialog-title">录入新成员</h2>
      <p class="dialog-tip">
        录进来之后，TA 用这个游戏 ID 注册就会自动成为「公会成员」。
      </p>

      <form @submit.prevent="submit">
        <label class="field">
          <span>昵称</span>
          <input v-model.trim="form.name" maxlength="12" placeholder="例如：小奈" autocomplete="off" />
        </label>

        <label class="field">
          <span>游戏 ID</span>
          <input v-model.trim="form.gameId" maxlength="16" placeholder="例如：nan_chan，英文开头" autocomplete="off" spellcheck="false" />
        </label>

        <label class="field">
          <span>职位</span>
          <select v-model="form.role">
            <option value="成员">成员</option>
            <option value="副会长">副会长</option>
            <option value="会长">会长</option>
          </select>
        </label>

        <label class="field">
          <span>加入日期</span>
          <input v-model="form.joinDate" type="date" />
        </label>

        <label class="field">
          <span>一句话介绍（可留空）</span>
          <input v-model.trim="form.intro" maxlength="60" placeholder="例如：刷铁机厂长" autocomplete="off" />
        </label>

        <label class="field">
          <span>名片签名（可留空，<s>~~划掉~~</s> 有效）</span>
          <input v-model.trim="form.quote" maxlength="60" placeholder="例如：~~以前的话~~现在的话" autocomplete="off" />
        </label>

        <p v-if="error" class="err">{{ error }}</p>

        <button class="eden-join" type="submit" :disabled="loading" style="width: 100%;">
          {{ loading ? '录入中…' : '录进名册' }}
        </button>
      </form>
    </div>
  </v-dialog>
</template>

<script>
import { api } from '../lib/api.js'

function today() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default {
  name: 'AddMemberDialog',
  props: {
    modelValue: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'added'],
  data() {
    return {
      loading: false,
      error: '',
      form: this.blank()
    }
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.error = ''
        this.form = this.blank()
      }
    }
  },
  methods: {
    blank() {
      return { name: '', gameId: '', role: '成员', joinDate: today(), intro: '', quote: '' }
    },
    async submit() {
      if (this.loading) return
      this.error = ''

      if (!this.form.name) return (this.error = '请填昵称')
      if (!this.form.gameId) return (this.error = '请填游戏 ID')
      if (!/^[A-Za-z][A-Za-z0-9_]{1,15}$/.test(this.form.gameId)) {
        return (this.error = '游戏 ID 需要英文开头，2–16 位，可带数字和下划线')
      }

      this.loading = true
      try {
        const res = await api.addMember(this.form)
        this.$emit('added', res.item)
        this.$emit('update:modelValue', false)
      } catch (e) {
        this.error = e.message || '录入失败'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.dialog-tip {
  margin: -4px 0 14px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--eden-muted);
}

.dialog-card s {
  text-decoration-thickness: 1px;
}
</style>
