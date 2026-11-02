<template>
  <div>
    <div class="section-head" style="margin-top: 0;">
      <i class="bar"></i>
      <h2>成员名册</h2>
      <span>共 {{ all.length }} 人 · {{ guests.length }} 位特邀嘉宾 · 点击名片查看</span>
      <button v-if="canEdit" class="member-add" type="button" @click="dialogAdd = true">
        ＋ 录入成员
      </button>
    </div>

    <div class="grid grid-4 member-grid" v-reveal>
      <article
        class="member"
        v-for="m in all"
        :key="m.id"
        v-tilt
        tabindex="0"
        role="button"
        @click="openCard(m)"
        @keydown.enter.prevent="openCard(m)"
        @keydown.space.prevent="openCard(m)"
      >
        <div class="avatar-img">
          <img v-if="m.avatar" :src="m.avatar" :alt="m.name" loading="lazy" />
          <span v-else class="avatar-letter" :style="{ background: m.color || '#7a66d6' }">{{ initial(m.name) }}</span>
        </div>
        <h3>{{ m.name }}</h3>
        <p class="id">{{ m.id }}</p>
        <span class="uid">{{ m.uid }}</span>
        <span v-if="deptLabel(m)" class="dept-tag">{{ deptLabel(m) }}</span>
        <em v-if="m.custom" class="custom-tag">新录入</em>
      </article>
    </div>

    <!-- ---------- 特邀嘉宾：和成员分开的一份名单 ---------- -->
    <section v-if="guests.length" class="guest-section">
      <div class="section-head">
        <i class="bar"></i>
        <h2>特邀嘉宾</h2>
        <span>GUESTS · 共 {{ guests.length }} 位 · 不算公会成员</span>
        <button class="guest-apply-link" type="button" @click="openApply">
          申请成为特邀嘉宾 ›
        </button>
      </div>

      <div ref="guestGrid" class="grid grid-4 member-grid guest-grid" :class="{ 'is-stacking': stacking }" v-reveal>
        <article
          class="member guest"
          v-for="g in guests"
          :key="g.uid || g.id"
          v-tilt
          tabindex="0"
          role="button"
          @click="openCard(g)"
          @keydown.enter.prevent="openCard(g)"
          @keydown.space.prevent="openCard(g)"
        >
          <div class="avatar-img guest-avatar">
            <img v-if="g.avatar" :src="g.avatar" :alt="g.name" loading="lazy" />
            <span v-else class="avatar-letter" :style="{ background: g.color || '#7f63c9' }">{{ initial(g.name) }}</span>
          </div>
          <h3>{{ g.name }}</h3>
          <p class="id">{{ g.id }}</p>
          <span class="uid guest-uid">{{ g.uid }}</span>
        </article>
      </div>
    </section>

    <div class="footer">
      <span v-for="line in config.statement" :key="line">{{ line }}<br /></span>
    </div>

    <v-dialog v-model="dialog" max-width="430">
      <div class="id-card" :class="{ 'is-guest': isGuest }" v-if="current">
        <button class="id-close" type="button" aria-label="关闭" @click="dialog = false">✕</button>

        <div class="id-head">
          <img v-if="current.avatar" class="id-avatar" :src="current.avatar" :alt="current.name" />
          <span v-else class="id-avatar id-avatar-letter" :style="{ background: current.color || '#7a66d6' }">
            {{ initial(current.name) }}
          </span>
          <div class="id-title">
            <h2>{{ current.name }}</h2>
            <p class="id-name">{{ current.id }}</p>
            <span class="id-uid">{{ current.uid }}</span>
          </div>
        </div>

        <div class="id-meta" v-if="isGuest">
          <span>{{ current.guild ? '所在公会' : '加入日期' }}</span>
          <b v-if="current.guild">{{ current.guild }}<template v-if="current.title"> · {{ current.title }}</template></b>
          <b v-else>{{ current.joinDate || '—' }}</b>
        </div>
        <div class="id-meta" v-else>
          <span>加入日期</span>
          <b>{{ current.joinDate }}</b>
        </div>

        <p class="id-intro" v-if="current.intro">{{ current.intro }}</p>

        <p class="id-dept" v-if="deptLabel(current)">兼任：{{ deptLabel(current) }}</p>

        <blockquote class="id-quote" v-if="current.quote">
          <template v-for="(seg, i) in quoteParts(current.quote)" :key="i"><s v-if="seg.strike">{{ seg.text }}</s><template v-else>{{ seg.text }}</template></template>”
        </blockquote>

        <div v-if="isSelf" class="egg">
          <span class="egg-spark">✦</span>
          <p class="egg-title">这是你自己的名片</p>
          <p class="egg-text">伊甸的门一直给你留着——无论多久回来一次，这里都有你的位置。</p>
        </div>

        <button v-if="canRemove" class="id-del" type="button" @click="removeMember">
          删除这条名册记录
        </button>

        <p class="id-foot">{{ isGuest ? 'EDEN GUILD · 特邀嘉宾' : 'EDEN GUILD · 成员凭证' }}</p>
      </div>
    </v-dialog>

    <AddMemberDialog v-model="dialogAdd" @added="onAdded" />
    <GuestApply v-model="applyOpen" :qq="qq" />

    <v-snackbar v-model="snackbar" :timeout="1800" location="bottom" rounded="pill">
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { auth } from '../../lib/auth.js'
import { api } from '../../lib/api.js'
import AddMemberDialog from '../AddMemberDialog.vue'
import GuestApply from '../GuestApply.vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

const config = computed(() => props.configdata)

const dialog = ref(false)
const dialogAdd = ref(false)
const current = ref(null)
const custom = ref([])
const snackText = ref('')
const snackbar = ref(false)
// 部门部长：{ [deptKey]: { leader, acting } }，用来在名片上标「兼任」
const deptSettings = ref({})

/* 扑克牌堆叠 → 申请页 */
const stacking = ref(false)
const applyOpen = ref(false)
const guestGrid = ref(null)
let stackTimer = null

const guests = computed(() => config.value.guests || [])

/* 申请页里要展示的 QQ 群号，直接从 contacts 里取，改配置就跟着变 */
const qq = computed(() => {
  const hit = (config.value.contacts || []).find(c => String(c.label || '').indexOf('QQ') >= 0)
  return hit ? String(hit.value || '') : ''
})

/* config.js 里写死的在前，页面上录入的接在后面 */
const all = computed(() => [
  ...(config.value.members || []),
  ...custom.value.map(m => ({ ...m, custom: true }))
])

/* 录入成员只对 config.auth.memberAdmins 里的账号开放（默认 guoguo / ruo_xi） */
const memberAdmins = computed(() => {
  const list = (config.value.auth && config.value.auth.memberAdmins) || ['guoguo', 'ruo_xi']
  return list.map(id => String(id || '').toLowerCase()).filter(Boolean)
})

const canEdit = computed(() => {
  if (!auth.user) return false
  return memberAdmins.value.includes(String(auth.user.gameName || '').toLowerCase())
})

const isGuest = computed(() => !!current.value && guests.value.includes(current.value))

const isSelf = computed(() => {
  if (!current.value || !auth.user || isGuest.value) return false
  return String(auth.user.gameName).toLowerCase() === String(current.value.id).toLowerCase()
})

/* 能录就能删（权限同一批人） */
const canRemove = computed(() => canEdit.value && !!current.value && !!current.value.custom)

onMounted(fetchMembers)
onMounted(fetchDepartments)

async function fetchDepartments() {
  try {
    const res = await api.departments()
    deptSettings.value = res.items || {}
  } catch (e) {
    deptSettings.value = {}
  }
}

/** 这个人在哪个部门当部长（有的话），比如「组织部部长」 */
function deptLabel(member) {
  if (!member || !member.id) return ''
  const list = config.value.departments || []
  const hits = []
  for (const d of list) {
    const s = deptSettings.value[d.key]
    if (s && s.leader && String(s.leader).toLowerCase() === String(member.id).toLowerCase()) {
      hits.push(d.name + (s.acting ? '代理部长' : '部长'))
    }
  }
  return hits.join(' · ')
}

async function fetchMembers() {
  try {
    const res = await api.members()
    custom.value = res.items || []
  } catch (e) {
    custom.value = []
  }
}

function initial(name) {
  const s = String(name || '').trim()
  return s ? s.slice(0, 1).toUpperCase() : '?'
}

/** 名片签名里 ~~划掉~~ 会渲染成删除线 */
function quoteParts(text) {
  const out = []
  const re = /~~([^~]+)~~/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), strike: false })
    out.push({ text: m[1], strike: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), strike: false })
  return out
}

function openCard(member) {
  current.value = member
  dialog.value = true
}

function onAdded(item) {
  custom.value.unshift({ ...item, custom: true })
  current.value = { ...item, custom: true }
  dialog.value = true
  snackText.value = `已录入：${item.name}（${item.id}）`
  snackbar.value = true
}

async function removeMember() {
  if (!current.value) return
  const target = current.value
  if (!window.confirm(`确定把「${target.name}（${target.id}）」从名册里删掉吗？`)) return
  try {
    await api.deleteMember(target.id)
    custom.value = custom.value.filter(m => m.id !== target.id)
    dialog.value = false
    snackText.value = '已删除'
    snackbar.value = true
  } catch (e) {
    snackText.value = e.message || '删除失败'
    snackbar.value = true
  }
}

/**
 * 申请特邀：先把嘉宾卡像扑克牌一样收拢堆叠，再展开申请页。
 * 每张卡的位移按它到屏幕中心的距离算，所以不管滚到哪儿、几张卡都能收。
 */
function openApply() {
  if (stacking.value || applyOpen.value) return

  const grid = guestGrid.value
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!grid || reduce) {
    applyOpen.value = true
    return
  }

  const cards = Array.from(grid.querySelectorAll('.guest'))
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const mid = (cards.length - 1) / 2

  cards.forEach((el, i) => {
    const r = el.getBoundingClientRect()
    el.style.setProperty('--dx', Math.round(cx - (r.left + r.width / 2)) + 'px')
    el.style.setProperty('--dy', Math.round(cy - (r.top + r.height / 2)) + 'px')
    el.style.setProperty('--rot', ((i - mid) * 7).toFixed(1) + 'deg')
    el.style.transform = '' // 清掉 v-tilt 写过的那点内联 transform
  })

  stacking.value = true
  clearTimeout(stackTimer)
  stackTimer = setTimeout(() => { applyOpen.value = true }, 640)
}

watch(applyOpen, open => {
  if (open) return
  clearTimeout(stackTimer)
  stackTimer = setTimeout(() => { stacking.value = false }, 240)
})

onBeforeUnmount(() => clearTimeout(stackTimer))
</script>

<style scoped>
.avatar-img {
  width: 84px;
  height: 84px;
  margin: 0 auto 10px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #ffb08c, #ef9ac1, #b7a6ff, #86c3ff);
  box-shadow: 0 8px 18px rgba(103, 84, 160, 0.22);
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.member:hover .avatar-img {
  transform: translateY(-3px) scale(1.04);
}

.avatar-img img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
}

/* 没有头像图时用首字 */
.avatar-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 6px rgba(60, 44, 110, 0.25);
}

.member .uid {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--eden-muted);
  background: rgba(122, 102, 214, 0.08);
  border-radius: 999px;
}

.member {
  cursor: pointer;
}

.member:focus-visible {
  outline: 2px solid rgba(122, 102, 214, 0.5);
  outline-offset: 3px;
}

/* 录入成员按钮 */
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

.custom-tag {
  display: block;
  margin-top: 6px;
  font-size: 10px;
  font-style: normal;
  letter-spacing: 0.08em;
  color: #9a86c8;
}

/* 部门职务（和「公会部门」页联动） */
.dept-tag {
  display: inline-block;
  margin-top: 5px;
  margin-left: 4px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 700;
  color: #4c2f96;
  background: linear-gradient(120deg, #ece5ff, #cbb9f5);
  border-radius: 999px;
}

.id-dept {
  margin: 0 0 12px;
  padding: 8px 12px;
  font-size: 12px;
  color: #4c2f96;
  background: linear-gradient(120deg, rgba(236, 229, 255, 0.9), rgba(203, 185, 245, 0.75));
  border-radius: 10px;
  position: relative;
  z-index: 1;
}

/* ---------- 特邀嘉宾 ---------- */
.guest-section {
  margin-top: 26px;
}

/* 卡片本身沿用成员那套，只把头像圈和 UID 名牌换成紫色 */
.guest {
  position: relative;
  overflow: hidden;
  transition: transform 0.62s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s ease;
}

/* 申请入口：低调一点，藏在标题行右侧 */
.guest-apply-link {
  margin-left: auto;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--eden-accent);
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(122, 102, 214, 0.22);
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(103, 84, 160, 0.1);
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.guest-apply-link:hover {
  color: #fff;
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
  border-color: transparent;
  transform: translateY(-1px);
}

.guest-apply-link:focus-visible {
  outline: 2px solid rgba(122, 102, 214, 0.45);
  outline-offset: 3px;
  border-radius: 999px;
}

/* 扑克牌收拢：位移和角度由 JS 写进 --dx / --dy / --rot */
.guest-grid.is-stacking .guest {
  transform: translate3d(var(--dx, 0px), var(--dy, 0px), 0) rotate(var(--rot, 0deg)) scale(0.9);
  box-shadow: 0 26px 50px rgba(60, 44, 110, 0.32);
  pointer-events: none;
}

.guest-avatar {
  background: linear-gradient(135deg, #cbb9f5, #9a7fd8, #7f63c9);
}

.member .guest-uid {
  color: #6a4fb8;
  background: linear-gradient(120deg, #e9e2ff, #d3c2f7);
}

/* ---------- 名片 ---------- */
.id-card {
  position: relative;
  padding: 22px 20px 16px;
  border-radius: 20px;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(255, 214, 236, 0.55), transparent 60%),
    radial-gradient(120% 80% at 100% 100%, rgba(183, 166, 255, 0.45), transparent 60%),
    #fffdfa;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 30px 60px rgba(60, 44, 110, 0.28);
  overflow: hidden;
}

.id-card.is-guest {
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(214, 204, 255, 0.62), transparent 60%),
    radial-gradient(120% 80% at 100% 100%, rgba(255, 214, 236, 0.4), transparent 60%),
    #fdfbff;
}

.id-card.is-guest .id-uid {
  color: #4c2f96;
  background: linear-gradient(120deg, #ece5ff, #cbb9f5);
  box-shadow: inset 0 0 0 1px rgba(139, 111, 214, 0.28);
}

.id-card::before {
  content: "";
  position: absolute;
  inset: -40% -60%;
  background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.75) 50%, transparent 60%);
  transform: translateX(-60%);
  animation: cardShine 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes cardShine {
  0%, 55% { transform: translateX(-60%); }
  80%, 100% { transform: translateX(60%); }
}

.id-close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 24px;
  height: 24px;
  font-size: 12px;
  color: var(--eden-muted);
  background: rgba(255, 255, 255, 0.75);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
}

.id-head {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.id-avatar {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  object-fit: cover;
  padding: 3px;
  background: linear-gradient(135deg, #ffb08c, #ef9ac1, #b7a6ff);
  box-shadow: 0 10px 22px rgba(103, 84, 160, 0.25);
}

.id-avatar-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #9a7fd8, #7f63c9);
}

.id-title h2 {
  margin: 0;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 26px;
  font-weight: 400;
  line-height: 1.1;
  color: var(--eden-ink);
}

.id-name {
  margin: 2px 0 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  color: var(--eden-muted);
}

.id-uid {
  display: inline-block;
  padding: 2px 9px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #7a4b12;
  background: linear-gradient(120deg, #ffe9b8, #f7d28a);
  border-radius: 6px;
}

.id-meta {
  display: flex;
  justify-content: space-between;
  margin: 16px 0 12px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--eden-ink-2);
  background: rgba(255, 255, 255, 0.6);
  border: 1px dashed rgba(122, 102, 214, 0.25);
  border-radius: 10px;
  position: relative;
  z-index: 1;
}

.id-meta b {
  color: var(--eden-accent);
  font-weight: 700;
}

.id-intro {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--eden-ink-2);
  position: relative;
  z-index: 1;
}

.id-quote {
  margin: 0;
  padding: 10px 12px 10px 34px;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 15px;
  line-height: 1.6;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.06);
  border-radius: 12px;
  position: relative;
  z-index: 1;
}

.id-quote s {
  color: rgba(122, 102, 214, 0.45);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.id-quote::before {
  content: "“";
  position: absolute;
  left: 10px;
  top: 6px;
  font-size: 30px;
  color: rgba(239, 154, 193, 0.55);
}

.id-del {
  display: block;
  width: 100%;
  margin: 12px 0 0;
  padding: 8px;
  font-family: inherit;
  font-size: 11.5px;
  color: #c05a7a;
  background: rgba(192, 90, 122, 0.07);
  border: 1px dashed rgba(192, 90, 122, 0.35);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.id-del:hover {
  background: rgba(192, 90, 122, 0.12);
}

.egg {
  position: relative;
  margin-top: 14px;
  padding: 14px;
  text-align: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 233, 184, 0.75), rgba(255, 214, 236, 0.75));
  border: 1px solid rgba(242, 196, 106, 0.6);
  overflow: hidden;
  animation: eggIn 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes eggIn {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.egg::after {
  content: "";
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.8), transparent 40%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.6), transparent 45%);
  animation: eggGlow 5s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes eggGlow {
  from { opacity: 0.4; transform: rotate(0deg); }
  to { opacity: 0.9; transform: rotate(12deg); }
}

.egg-spark {
  display: block;
  font-size: 18px;
  color: #d99a2b;
  animation: sparkPulse 2.2s ease-in-out infinite;
}

@keyframes sparkPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.25); opacity: 1; }
}

.egg-title {
  margin: 4px 0 2px;
  font-size: 13px;
  font-weight: 800;
  color: #8a5a12;
}

.egg-text {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.65;
  color: #9a6a24;
}

.id-foot {
  margin: 14px 0 0;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.28em;
  color: rgba(143, 135, 168, 0.7);
}

@media (prefers-reduced-motion: reduce) {
  .id-card::before,
  .egg::after,
  .egg-spark {
    animation: none;
  }
}

@media (max-width: 640px) {
  .section-head {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .section-head > span {
    flex: 1 1 100%;
  }

  .member-add {
    width: auto;
    margin-left: 0;
  }

  .guest-apply-link {
    margin-left: 0;
  }
}
</style>
