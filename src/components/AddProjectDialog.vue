<template>
  <v-dialog :model-value="modelValue" max-width="560" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <div class="dialog-card dialog-scroll">
      <h2 class="dialog-title">申报项目</h2>
      <p class="dialog-tip">
        报一笔要花多少钱、要什么材料，方便大家一起看。<br />
        项目完成并确认后，会按类型自动进领地或直接结束。
      </p>

      <form @submit.prevent="submit">
        <label class="field">
          <span>项目名称</span>
          <input v-model.trim="form.name" maxlength="40" placeholder="例如：主城扩建—扶桑" autocomplete="off" />
        </label>

        <label class="field">
          <span>项目执行（游戏 ID）</span>
          <input v-model.trim="form.owner" maxlength="32" placeholder="例如：ruo_xi" autocomplete="off" spellcheck="false" />
        </label>

        <label class="field">
          <span>参与成员（可留空）</span>
          <input v-model.trim="form.members" maxlength="60" placeholder="例如：全体公会成员" autocomplete="off" />
        </label>

        <label class="field">
          <span>项目类型</span>
          <select v-model="form.type">
            <option v-for="t in types" :key="t.key" :value="t.key">{{ t.label }} —— {{ t.note }}</option>
          </select>
        </label>

        <label class="field">
          <span>项目简介</span>
          <textarea v-model.trim="form.intro" maxlength="200" rows="3" placeholder="一句话说清要做什么"></textarea>
        </label>

        <label class="field">
          <span>预估所需财政</span>
          <input v-model.trim="form.budget" maxlength="40" placeholder="例如：约 100w 金币" autocomplete="off" />
        </label>

        <div class="field">
          <span>所需材料</span>
          <div class="mat-modes">
            <label :class="{ on: form.materialsNote === '' }">
              <input v-model="form.materialsNote" type="radio" value="" /> 填写材料
            </label>
            <label :class="{ on: form.materialsNote === 'todo' }">
              <input v-model="form.materialsNote" type="radio" value="todo" /> 待补充
            </label>
            <label :class="{ on: form.materialsNote === 'none' }">
              <input v-model="form.materialsNote" type="radio" value="none" /> 无
            </label>
          </div>

          <div v-if="!form.materialsNote" class="mat-rows">
            <div class="mat-row" v-for="(m, i) in form.materials" :key="i">
              <input v-model.trim="m.name" maxlength="40" placeholder="材料名，例如：橡木原木" autocomplete="off" />
              <input v-model.trim="m.qty" maxlength="30" placeholder="数量，例如：3000" class="mat-qty" autocomplete="off" />
              <button
                type="button"
                class="mat-del"
                :disabled="form.materials.length === 1"
                aria-label="删掉这一行"
                @click="removeRow(i)"
              >✕</button>
            </div>
            <button type="button" class="mat-add" @click="addRow">＋ 添加材料</button>
          </div>
        </div>

        <label class="field">
          <span>项目开始时间</span>
          <input v-model="form.startDate" type="date" />
        </label>

        <label class="field">
          <span>当前状态</span>
          <select v-model="form.status">
            <option v-for="s in statuses" :key="s.key" :value="s.key">{{ s.label }}</option>
          </select>
        </label>

        <p v-if="error" class="err">{{ error }}</p>

        <button class="eden-join" type="submit" :disabled="loading" style="width: 100%;">
          {{ loading ? '提交中…' : '提交申报' }}
        </button>
      </form>
    </div>
  </v-dialog>
</template>

<script>
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'

function today() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default {
  name: 'AddProjectDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    types: { type: Array, default: () => [] },
    statuses: { type: Array, default: () => [] }
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
      return {
        name: '',
        owner: auth.user ? auth.user.gameName : '',
        members: '',
        type: 'build',
        intro: '',
        budget: '',
        materials: [{ name: '', qty: '' }],
        materialsNote: '',
        startDate: today(),
        status: 'plan'
      }
    },
    addRow() {
      if (this.form.materials.length >= 30) return
      this.form.materials.push({ name: '', qty: '' })
    },
    removeRow(i) {
      if (this.form.materials.length <= 1) return
      this.form.materials.splice(i, 1)
    },
    async submit() {
      if (this.loading) return
      this.error = ''

      if (!this.form.name) return (this.error = '请填项目名称')
      if (!this.form.owner) return (this.error = '请填项目主人')

      this.loading = true
      try {
        const res = await api.addProject({
          ...this.form,
          materials: this.form.materialsNote ? [] : this.form.materials.filter(m => m.name || m.qty)
        })
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

<style scoped>
.dialog-tip {
  margin: -4px 0 14px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--eden-muted);
}

/* 材料表格 */
.mat-modes {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.mat-modes label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  font-size: 12px;
  color: var(--eden-ink-2);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--eden-line);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.mat-modes label.on {
  color: #fff;
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
  border-color: transparent;
}

.mat-modes input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.mat-rows {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.mat-row {
  display: grid;
  grid-template-columns: 1fr 96px 26px;
  gap: 7px;
  align-items: center;
}

.mat-row input {
  width: 100%;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--eden-ink);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--eden-line);
  border-radius: 9px;
  outline: none;
}

.mat-row input:focus {
  border-color: rgba(122, 102, 214, 0.45);
}

.mat-del {
  width: 26px;
  height: 26px;
  padding: 0;
  font-size: 11px;
  color: var(--eden-muted);
  background: rgba(192, 90, 122, 0.08);
  border: 1px solid rgba(192, 90, 122, 0.25);
  border-radius: 8px;
  cursor: pointer;
}

.mat-del:disabled {
  opacity: 0.35;
  cursor: default;
}

.mat-add {
  align-self: flex-start;
  margin-top: 2px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.08);
  border: 1px dashed rgba(122, 102, 214, 0.32);
  border-radius: 999px;
  cursor: pointer;
}

.mat-add:hover {
  background: rgba(122, 102, 214, 0.14);
}

.dialog-card textarea {
  width: 100%;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: var(--eden-ink);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--eden-line);
  border-radius: 10px;
  resize: vertical;
  outline: none;
}

.dialog-card textarea:focus {
  border-color: rgba(122, 102, 214, 0.45);
}
</style>
