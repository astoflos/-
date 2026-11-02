<template>
  <div>
    <div class="section-head" style="margin-top: 0;">
      <i class="bar"></i>
      <h2>项目申报</h2>
      <span>共 {{ items.length }} 个项目 · 点击状态可改</span>
      <button v-if="canAdd" class="member-add" type="button" @click="dialogAdd = true">
        ＋ 申报项目
      </button>
    </div>

    <div class="toolbar">
      <div class="filters">
        <button
          v-for="f in filters"
          :key="f.key"
          class="filter"
          :class="{ active: cat === f.key }"
          type="button"
          @click="cat = f.key"
        >
          {{ f.label }}
          <em>{{ countOf(f.key) }}</em>
        </button>
      </div>
      <span class="counter">{{ counterText }}</span>
    </div>

    <p v-if="auth.user && !canAdd" class="toolbar-hint">申报项目为公会成员权限</p>

    <div v-if="filtered.length" class="project-grid" v-reveal>
      <article class="project" v-for="p in filtered" :key="p.id">
        <div class="p-top">
          <span class="p-status" :class="p.status">{{ statusLabel(p.status) }}</span>
          <span class="p-type" :class="p.type">{{ typeLabel(p.type) }}</span>
          <span class="p-date">{{ p.startDate }}</span>
        </div>

        <h3 class="p-name">{{ p.name }}</h3>
        <p v-if="p.intro" class="p-intro">{{ p.intro }}</p>

        <div class="p-people">
          <div class="p-box">
            <span>项目执行</span>
            <b>{{ p.owner || '—' }}</b>
          </div>
          <div v-if="p.members" class="p-box">
            <span>参与成员</span>
            <b>{{ p.members }}</b>
          </div>
          <div v-if="p.budget" class="p-box">
            <span>预估财政</span>
            <b>{{ p.budget }}</b>
          </div>
        </div>

        <!-- 材料可能很多，默认收起来；写「无 / 待补充」的直接显示文字 -->
        <div class="p-materials">
          <button v-if="hasMaterials(p)" type="button" class="p-mat-toggle" @click="toggleMat(p.id)">
            <span>所需材料</span>
            <em>{{ materialRows(p).length }} 项</em>
            <i class="p-mat-arrow" :class="{ open: !!openMats[p.id] }">⌄</i>
          </button>
          <div v-else class="p-mat-plain">
            <span>所需材料</span>
            <em>{{ materialsLabel(p) }}</em>
          </div>
          <div v-if="hasMaterials(p)" v-show="openMats[p.id]" class="p-mat-list">
            <div class="p-mat-row" v-for="(m, i) in materialRows(p)" :key="i">
              <b>{{ m.name || '—' }}</b>
              <span>{{ m.qty }}</span>
            </div>
          </div>
        </div>

        <div v-if="canEdit(p)" class="p-actions">
          <label class="p-status-pick">
            <span>状态</span>
            <select :value="p.status" @change="changeStatus(p, $event.target.value)">
              <option v-for="s in statuses" :key="s.key" :value="s.key">{{ s.label }}</option>
            </select>
          </label>

          <button v-if="isAdmin && p.status === 'done'" class="p-finish" type="button" @click="finish(p)">
            确认完成
          </button>

          <button class="p-del" type="button" @click="remove(p)">删除</button>
        </div>
      </article>
    </div>

    <div v-else class="empty-box">
      <strong>还没有项目</strong>
      <span>{{ cat === 'all' ? '公会成员可以点右上角申报一个' : '这个状态下暂时没有项目' }}</span>
    </div>

    <div class="footer">
      <span>项目完成后由会长确认，活动 / 建筑 / 科技会自动进入领地，附属项目直接结束。</span>
    </div>

    <AddProjectDialog
      v-model="dialogAdd"
      :types="types"
      :statuses="statuses"
      @added="onAdded"
    />

    <v-snackbar v-model="snackbar" :timeout="2200" location="bottom" rounded="pill">
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../../lib/api.js'
import { auth } from '../../lib/auth.js'
import AddProjectDialog from '../AddProjectDialog.vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

const config = computed(() => props.configdata)
const types = computed(() => config.value.projectTypes || [])
const statuses = computed(() => config.value.projectStatus || [])

const items = ref([])
const cat = ref('all')
const dialogAdd = ref(false)
const snackbar = ref(false)
const snackText = ref('')
// 每张卡的材料展开状态：{ [id]: true }
const openMats = ref({})

const filters = computed(() => [
  { key: 'all', label: '全部' },
  ...statuses.value.map(s => ({ key: s.key, label: s.label }))
])

const canAdd = computed(() => !!auth.user && auth.user.role === 'guild')
const isAdmin = computed(() => {
  if (!auth.user) return false
  const list = (config.value.auth && config.value.auth.memberAdmins) || ['guoguo', 'ruo_xi']
  return list.map(id => String(id).toLowerCase()).includes(String(auth.user.gameName || '').toLowerCase())
})

const filtered = computed(() => {
  if (cat.value === 'all') return items.value
  return items.value.filter(p => p.status === cat.value)
})

const counterText = computed(() => {
  return filtered.value.length === items.value.length
    ? `共 ${items.value.length} 个`
    : `找到 ${filtered.value.length} 个`
})

function countOf(key) {
  return key === 'all' ? items.value.length : items.value.filter(p => p.status === key).length
}

function typeLabel(key) {
  const hit = types.value.find(t => t.key === key)
  return hit ? hit.label : key
}

function statusLabel(key) {
  const hit = statuses.value.find(s => s.key === key)
  return hit ? hit.label : key
}

function canEdit(p) {
  if (!auth.user) return false
  return isAdmin.value || p.by === auth.user.gameName
}

/** 材料兼容两种存法：新的是数组，老数据是一整段文字 */
function materialRows(p) {
  if (Array.isArray(p.materials)) {
    return p.materials.filter(m => m && (m.name || m.qty))
  }
  const s = String(p.materials || '').trim()
  if (!s) return []
  if (s === '无' || s === '待补充') return []
  return [{ name: s, qty: '' }]
}

/** 真写了材料才用「N 项」折叠，否则直接给「无 / 待补充」 */
function hasMaterials(p) {
  return !p.materialsNote && materialRows(p).length > 0
}

function materialsLabel(p) {
  if (p.materialsNote === 'todo') return '待补充'
  if (p.materialsNote === 'none') return '无'
  const raw = String(p.materials || '').trim()
  if (!Array.isArray(p.materials) && (raw === '待补充' || raw === '无')) return raw
  return '无'
}

function toggleMat(id) {
  openMats.value = { ...openMats.value, [id]: !openMats.value[id] }
}

onMounted(fetchItems)

async function fetchItems() {
  try {
    const res = await api.projects()
    items.value = res.items || []
  } catch (e) {
    items.value = []
  }
}

function toast(text) {
  snackText.value = text
  snackbar.value = true
}

function onAdded(item) {
  items.value.unshift(item)
  toast(`已申报：${item.name}`)
}

async function changeStatus(p, status) {
  if (status === p.status) return
  try {
    const res = await api.setProjectStatus(p.id, status)
    p.status = status
    if (res.items) items.value = res.items
    toast(`已改为「${statusLabel(status)}」`)
  } catch (e) {
    toast(e.message || '改状态失败')
  }
}

async function finish(p) {
  const type = types.value.find(t => t.key === p.type)
  const target = p.type === 'attached'
    ? '附属项目：确认后直接结束，不会进领地'
    : `完成后会作为「${type ? type.label : p.type}」录入领地，项目本身删除`

  if (!window.confirm(`确认「${p.name}」已完成？\n${target}`)) return

  try {
    const res = await api.finishProject(p.id)
    items.value = res.items || items.value.filter(x => x.id !== p.id)
    toast(res.territory ? `已完成，已录入领地：${p.name}` : '已完成，项目结束')
  } catch (e) {
    toast(e.message || '确认失败')
  }
}

async function remove(p) {
  if (!window.confirm(`确定删除项目「${p.name}」吗？`)) return
  try {
    const res = await api.deleteProject(p.id)
    items.value = res.items || items.value.filter(x => x.id !== p.id)
    toast('已删除')
  } catch (e) {
    toast(e.message || '删除失败')
  }
}
</script>

<style scoped>
/* 申报按钮（和成员页那颗同款） */
.member-add {
  margin-left: auto;
  padding: 8px 13px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(122, 102, 214, 0.26);
}

.member-add:hover {
  opacity: 0.94;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.project {
  padding: 16px 18px 14px;
  border-radius: 18px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  box-shadow: var(--eden-shadow-sm);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.project:hover {
  transform: translateY(-3px);
  box-shadow: var(--eden-shadow);
}

.p-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.p-status {
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  border-radius: 999px;
  background: var(--eden-muted);
}

.p-status.plan { background: #9aa0c4; }
.p-status.doing { background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2)); }
.p-status.done { background: var(--eden-ok); }

.p-type {
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  background: rgba(122, 102, 214, 0.1);
  color: var(--eden-accent);
}

.p-type.event { background: rgba(255, 176, 140, 0.18); color: #c2703c; }
.p-type.build { background: rgba(134, 195, 255, 0.2); color: #4278b8; }
.p-type.tech { background: rgba(111, 208, 189, 0.2); color: #2f8b76; }
.p-type.attached { background: rgba(183, 166, 255, 0.22); color: #6a52b8; }

.p-date {
  margin-left: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--eden-muted);
}

.p-name {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 800;
  color: var(--eden-ink);
  letter-spacing: 0.01em;
}

.p-intro {
  margin: 0 0 10px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--eden-ink-2);
}

.p-people {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.p-box {
  flex: 1 1 150px;
  min-width: 0;
  padding: 8px 11px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px dashed var(--eden-line);
}

.p-box span {
  display: block;
  font-size: 11px;
  color: var(--eden-muted);
  margin-bottom: 2px;
}

.p-box b {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--eden-ink-2);
  line-height: 1.5;
  word-break: break-word;
}

.p-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

/* ---------- 材料清单 ---------- */
.p-materials {
  margin-top: 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px dashed var(--eden-line);
  overflow: hidden;
}

.p-mat-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 12px;
  color: var(--eden-ink-2);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.p-mat-toggle:hover {
  background: rgba(122, 102, 214, 0.05);
}

/* 「无 / 待补充」直接一行字 */
.p-mat-plain {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
}

.p-mat-plain span {
  flex: 0 0 62px;
  color: var(--eden-muted);
}

.p-mat-plain em {
  font-style: normal;
  font-weight: 700;
  color: var(--eden-accent);
}

.p-mat-toggle span {
  flex: 0 0 62px;
  color: var(--eden-muted);
}

.p-mat-toggle em {
  font-style: normal;
  color: var(--eden-accent);
  font-weight: 700;
}

.p-mat-arrow {
  margin-left: auto;
  font-style: normal;
  font-size: 12px;
  color: var(--eden-muted);
  transition: transform 0.3s ease;
}

.p-mat-arrow.open {
  transform: rotate(180deg);
}

.p-mat-list {
  padding: 0 12px 10px;
  max-height: 220px;
  overflow-y: auto;
}

.p-mat-row {
  display: flex;
  gap: 12px;
  padding: 5px 0;
  font-size: 12px;
  line-height: 1.5;
  border-top: 1px dashed rgba(122, 102, 214, 0.12);
}

.p-mat-row b {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: var(--eden-ink-2);
  word-break: break-word;
}

.p-mat-row span {
  flex: 0 0 auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--eden-accent);
}

.p-status-pick {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--eden-muted);
}

.p-status-pick select {
  padding: 4px 8px;
  font-family: inherit;
  font-size: 12px;
  color: var(--eden-ink);
  background: #fff;
  border: 1px solid var(--eden-line);
  border-radius: 8px;
  outline: none;
}

.p-finish {
  margin-left: auto;
  padding: 6px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4cae87, #6fd0bd);
  border: none;
  border-radius: 999px;
  cursor: pointer;
}

.p-finish:hover { opacity: 0.92; }

.p-del {
  padding: 4px 0;
  font-family: inherit;
  font-size: 11.5px;
  color: #c05a7a;
  background: none;
  border: none;
  text-decoration: underline dotted;
  cursor: pointer;
}

.p-finish + .p-del {
  margin-left: 10px;
}

@media (max-width: 900px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
