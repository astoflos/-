<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <div class="dialog-card">
      <h2 class="dialog-title">登记新领地</h2>

      <form @submit.prevent="submit">
        <label class="field">
          <span>类型</span>
          <select v-model="form.type">
            <option value="private">公会资源</option>
            <option value="building">公会建筑</option>
            <option value="public">公益资源</option>
          </select>
        </label>

        <label class="field">
          <span>领地名字</span>
          <input v-model.trim="form.cmd" maxlength="40" placeholder="例如：伊甸园刷石机" autocomplete="off" />
        </label>

        <label class="field">
          <span>一句话介绍</span>
          <input v-model.trim="form.desc" maxlength="60" placeholder="例如：刷石机" autocomplete="off" />
        </label>

        <label class="field">
          <span>产物（顿号隔开，可留空）</span>
          <input v-model.trim="form.products" maxlength="120" placeholder="例如：圆石、石头" autocomplete="off" />
        </label>

        <p v-if="error" class="err">{{ error }}</p>

        <button class="eden-join" type="submit" :disabled="loading" style="width: 100%;">
          {{ loading ? '提交中…' : '提交登记' }}
        </button>
      </form>
    </div>
  </v-dialog>
</template>

<script>
import { api } from '../lib/api.js'

export default {
  name: 'AddTerritoryDialog',
  props: {
    modelValue: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'added'],
  data() {
    return {
      loading: false,
      error: '',
      form: { type: 'private', cmd: '', desc: '', products: '' }
    }
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.error = ''
        this.form = { type: 'private', cmd: '', desc: '', products: '' }
      }
    }
  },
  methods: {
    async submit() {
      if (this.loading) return
      this.error = ''

      if (!this.form.cmd) return (this.error = '请填领地名字')

      this.loading = true
      try {
        const res = await api.addTerritory(this.form)
        this.$emit('added', res.item)
        this.$emit('update:modelValue', false)
      } catch (e) {
        this.error = e.message || '提交失败'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
