<template>
  <div>
    <!-- ---------- 部门列表 ---------- -->
    <template v-if="!detail">
      <div class="section-head" style="margin-top: 0;">
        <i class="bar"></i>
        <h2>公会部门</h2>
        <span>共 {{ departments.length }} 个部门 · 点击进入</span>
      </div>

      <div class="dept-grid" v-reveal>
        <article
          v-for="d in departments"
          :key="d.key"
          class="dept"
          tabindex="0"
          role="button"
          :style="{ '--dept-img': `url(${d.image || ''})`, '--dept-tint': d.tint || '#7a66d6' }"
          @click="openDetail(d, $event)"
          @keydown.enter.prevent="openDetail(d, $event)"
          @keydown.space.prevent="openDetail(d, $event)"
        >
          <div class="dept-head">
            <h3>{{ d.name }}</h3>
            <span v-if="leaderOf(d)" class="dept-badge" :class="{ acting: isActing(d) }">
              {{ isActing(d) ? '代理部长' : '部长' }}
            </span>
            <span v-else class="dept-badge empty">部长待定</span>
          </div>

          <p class="dept-duty">{{ d.duty }}</p>

          <div class="dept-foot">
            <div class="dept-leader" v-if="leaderOf(d)">
              <img v-if="leaderOf(d).avatar" :src="leaderOf(d).avatar" :alt="leaderOf(d).name" />
              <span v-else class="dept-avatar" :style="{ background: leaderOf(d).color || '#7a66d6' }">
                {{ initial(leaderOf(d).name) }}
              </span>
              <span class="dept-name">
                <b>{{ leaderOf(d).name }}</b>
                <em>{{ leaderOf(d).id }}</em>
              </span>
            </div>
            <div class="dept-leader none" v-else>
              <span class="dept-avatar blank">?</span>
              <span class="dept-name"><b>待定</b><em>还没有人接手</em></span>
            </div>

            <button v-if="isAdmin" class="dept-edit" type="button" @click.stop="openEditor(d)">
              任命部长
            </button>
          </div>
        </article>
      </div>

      <div class="footer">
        <span>部长由会长或果果任命，可以标成「代理」；任命后成员名册会同步显示。</span>
      </div>
    </template>

    <!-- ---------- 部门详情 ---------- -->
    <template v-else>
      <button class="dept-back" type="button" @click="back">‹ 返回部门列表</button>

      <section
        class="dept-hero"
        :class="{ 'is-ready': heroReady }"
        :style="{ '--dept-img': `url(${detail.image || ''})`, '--dept-tint': detail.tint || '#7a66d6' }"
      >
        <div class="dept-hero-head">
          <div>
            <p class="dept-hero-kicker">DEPARTMENT</p>
            <h2>{{ detail.name }}</h2>
          </div>
          <span v-if="leaderOf(detail)" class="dept-badge" :class="{ acting: isActing(detail) }">
            {{ isActing(detail) ? '代理部长' : '部长' }}
          </span>
          <span v-else class="dept-badge empty">部长待定</span>
        </div>

        <p class="dept-hero-duty">{{ detail.duty }}</p>

        <div class="dept-hero-leader">
          <template v-if="leaderOf(detail)">
            <img v-if="leaderOf(detail).avatar" class="dept-hero-avatar" :src="leaderOf(detail).avatar" :alt="leaderOf(detail).name" />
            <span v-else class="dept-hero-avatar letter" :style="{ background: leaderOf(detail).color || '#7a66d6' }">
              {{ initial(leaderOf(detail).name) }}
            </span>
            <div class="dept-hero-info">
              <b>{{ leaderOf(detail).name }}</b>
              <em>{{ leaderOf(detail).id }}</em>
            </div>
          </template>
          <template v-else>
            <span class="dept-hero-avatar letter blank">?</span>
            <div class="dept-hero-info">
              <b>部长待定</b>
              <em>还没有人接手</em>
            </div>
          </template>
        </div>
      </section>

      <div class="dept-empty">
        <span class="dept-empty-mark">✦</span>
        <p>这里什么都没有</p>
        <span class="dept-empty-sub">部门的项目、成员和公告以后会放在这一页</span>
      </div>

      <div class="footer">
        <span>{{ detail.name }} · 伊甸园 Eden</span>
      </div>
    </template>

    <!-- ---------- 任命部长 ---------- -->
    <v-dialog v-model="dialog" max-width="420">
      <div class="dialog-card" v-if="editing">
        <h2 class="dialog-title">任命{{ editing.name }}部长</h2>

        <label class="field">
          <span>从名册里选一个人</span>
          <select v-model="pick">
            <option value="">— 不设部长 —</option>
            <option v-for="m in roster" :key="m.id" :value="m.id">{{ m.name }}（{{ m.id }}）</option>
          </select>
        </label>

        <label class="dept-check">
          <input v-model="acting" type="checkbox" :disabled="!pick" />
          <span>标记为「代理」</span>
        </label>

        <p v-if="err" class="err">{{ err }}</p>

        <button class="eden-join" type="button" style="width: 100%; margin-top: 6px;" :disabled="busy" @click="saveLeader">
          {{ busy ? '保存中…' : '保存' }}
        </button>
      </div>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="2000" location="bottom" rounded="pill">
      {{ snackText }}
    </v-snackbar>

    <!-- 打字出来的那句问候 -->
    <Teleport to="body">
      <Transition name="greet">
        <div v-if="greetShow" class="dept-greet">
          <p class="dept-greet-text" :style="{ '--greet-tint': greetTint || '#7a66d6' }">
            <span class="greet-mark" aria-hidden="true"></span>{{ greetTyped }}<i v-if="greetTyping" class="greet-caret"></i>
          </p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { api } from '../../lib/api.js'
import { auth } from '../../lib/auth.js'

const props = defineProps({
  configdata: { type: Object, required: true }
})

const config = computed(() => props.configdata)
const departments = computed(() => config.value.departments || [])

const settings = ref({})
const extraMembers = ref([])
const detail = ref(null)
const heroReady = ref(false)

// 打开部门时飘出来的那句问候
const greetShow = ref(false)
const greetTyped = ref('')
const greetTyping = ref(false)
const greetTint = ref('#7a66d6')
let greetToken = 0
const timers = []
const wait = ms => new Promise(resolve => {
  const id = setTimeout(resolve, ms)
  timers.push(id)
})

const dialog = ref(false)
const editing = ref(null)
const pick = ref('')
const acting = ref(false)
const busy = ref(false)
const err = ref('')
const snackbar = ref(false)
const snackText = ref('')

const isAdmin = computed(() => {
  if (!auth.user) return false
  const list = (config.value.auth && config.value.auth.memberAdmins) || ['guoguo', 'ruo_xi']
  return list.map(id => String(id).toLowerCase()).includes(String(auth.user.gameName || '').toLowerCase())
})

/** 名册 = config 里写死的 + 页面上录入的 */
const roster = computed(() => [
  ...(config.value.members || []),
  ...extraMembers.value
].map(m => ({ ...m, uid: m.uid || '' })))

function initial(name) {
  const s = String(name || '').trim()
  return s ? s.slice(0, 1).toUpperCase() : '?'
}

function leaderOf(d) {
  const s = settings.value[d.key]
  if (!s || !s.leader) return null
  return roster.value.find(m => String(m.id).toLowerCase() === String(s.leader).toLowerCase()) || { name: s.leader, id: s.leader }
}

function isActing(d) {
  const s = settings.value[d.key]
  return Boolean(s && s.acting)
}

/** 当前登录的人叫什么（名册优先，其次游戏名） */
function viewerName() {
  if (!auth.user) return ''
  const key = String(auth.user.gameName || '').toLowerCase()
  const hit = roster.value.find(m => String(m.id).toLowerCase() === key)
  if (hit) return hit.name
  const g = (config.value.guests || []).find(x => String(x.id).toLowerCase() === key)
  if (g) return g.name
  return auth.user.gameName
}

function greetTextFor(d) {
  const head = d.greet || ''
  const who = viewerName()
  return who ? `${head}${d.name}欢迎你，亲爱的${who}。` : `${head}${d.name}欢迎你。`
}

function stopGreet() {
  greetToken++
  timers.forEach(t => clearTimeout(t))
  timers.length = 0
  greetShow.value = false
  greetTyping.value = false
}

async function playGreet(d) {
  stopGreet()
  const token = greetToken
  const alive = () => token === greetToken
  const text = greetTextFor(d)

  greetTint.value = d.tint || '#7a66d6'
  greetTyped.value = ''
  greetTyping.value = true
  greetShow.value = true

  await wait(380)
  for (let i = 1; i <= text.length; i++) {
    if (!alive()) return
    greetTyped.value = text.slice(0, i)
    await wait(95)
  }
  if (!alive()) return
  greetTyping.value = false

  await wait(1700)
  if (!alive()) return
  greetShow.value = false
}

/**
 * 点开部门：直接切到详情，只有文字浮现，没有卡片飞行动画。
 */
async function openDetail(d) {
  if (detail.value) return

  detail.value = d
  heroReady.value = false
  await nextTick()

  window.scrollTo({ top: 0, behavior: 'auto' })
  await nextTick()

  heroReady.value = true
  playGreet(d)
}

function back() {
  stopGreet()
  detail.value = null
  heroReady.value = false
  window.scrollTo({ top: 0, behavior: 'auto' })
}

onBeforeUnmount(() => {
  timers.forEach(t => clearTimeout(t))
})

function openEditor(d) {
  editing.value = d
  const s = settings.value[d.key] || {}
  pick.value = s.leader || ''
  acting.value = Boolean(s.acting)
  err.value = ''
  dialog.value = true
}

async function saveLeader() {
  if (!editing.value || busy.value) return
  busy.value = true
  err.value = ''
  try {
    const res = await api.setDepartmentLeader(editing.value.key, pick.value, pick.value ? acting.value : false)
    settings.value = res.items || {}
    dialog.value = false
    snackText.value = pick.value ? `已任命：${pick.value}` : '已撤掉部长'
    snackbar.value = true
  } catch (e) {
    err.value = e.message || '保存失败'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.departments()
    settings.value = res.items || {}
  } catch (e) {
    settings.value = {}
  }
  try {
    const res = await api.members()
    extraMembers.value = res.items || []
  } catch (e) {
    extraMembers.value = []
  }
})
</script>

<style scoped>
.dept-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.dept {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 18px 14px;
  border-radius: 18px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  box-shadow: var(--eden-shadow-sm);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

/* 右半边：从透明渐渐显出来的一张图 */
.dept::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 52%;
  background-image: var(--dept-img);
  background-size: cover;
  background-position: center;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.25) 38%, #000 100%);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.25) 38%, #000 100%);
  transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 书签色：右边一条细边 */
.dept::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, var(--dept-tint), rgba(255, 255, 255, 0.2));
  opacity: 0.85;
  pointer-events: none;
  z-index: 0;
}

.dept > * {
  position: relative;
  z-index: 1;
}

.dept:hover::before {
  opacity: 0.72;
  transform: scale(1.05);
}

.dept:hover {
  transform: translateY(-3px);
  box-shadow: var(--eden-shadow);
}

.dept:focus-visible {
  outline: 2px solid rgba(122, 102, 214, 0.45);
  outline-offset: 3px;
}

.dept-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.dept-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--eden-ink);
  letter-spacing: 0.02em;
}

.dept-badge {
  padding: 2px 9px;
  font-size: 10.5px;
  font-weight: 700;
  border-radius: 999px;
  color: #4c2f96;
  background: linear-gradient(120deg, #ece5ff, #cbb9f5);
}

.dept-badge.acting {
  color: #7a4b12;
  background: linear-gradient(120deg, #ffe9b8, #f7d28a);
}

.dept-badge.empty {
  color: var(--eden-muted);
  background: rgba(122, 102, 214, 0.08);
  font-weight: 600;
}

.dept-duty {
  margin: 0 0 12px;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--eden-ink-2);
}

.dept-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px dashed var(--eden-line);
}

.dept-leader {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.dept-leader img,
.dept-avatar {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(103, 84, 160, 0.18);
}

.dept-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}

.dept-avatar.blank {
  background: rgba(122, 102, 214, 0.16);
  color: var(--eden-muted);
}

.dept-name {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dept-name b {
  font-size: 12.5px;
  color: var(--eden-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-name em {
  font-style: normal;
  font-size: 10.5px;
  color: var(--eden-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-edit {
  margin-left: auto;
  padding: 5px 11px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.08);
  border: 1px dashed rgba(122, 102, 214, 0.3);
  border-radius: 999px;
  cursor: pointer;
}

.dept-edit:hover {
  background: rgba(122, 102, 214, 0.16);
}

/* ---------- 详情 ---------- */
.dept-back {
  margin-bottom: 12px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  color: var(--eden-accent);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--eden-line);
  border-radius: 999px;
  cursor: pointer;
}

.dept-hero {
  position: relative;
  padding: 20px 22px;
  border-radius: 20px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  box-shadow: var(--eden-shadow);
  overflow: hidden;
}

.dept-hero::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 58%;
  background-image: var(--dept-img);
  background-size: cover;
  background-position: center;
  opacity: 0.42;
  pointer-events: none;
  z-index: 0;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 40%, #000 100%);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 40%, #000 100%);
}

.dept-hero::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(180deg, var(--dept-tint), rgba(255, 255, 255, 0.2));
  opacity: 0.85;
  pointer-events: none;
  z-index: 0;
}

.dept-hero > * {
  position: relative;
  z-index: 1;
}

.dept-hero-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.dept-hero-kicker {
  margin: 0 0 2px;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--eden-accent-2);
}

.dept-hero-head h2 {
  margin: 0;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 28px;
  font-weight: 400;
  color: var(--eden-ink);
}

.dept-hero-duty {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--eden-ink-2);
}

.dept-hero-leader {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px dashed var(--eden-line);
}

.dept-hero-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 6px 14px rgba(103, 84, 160, 0.2);
}

.dept-hero-avatar.letter {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.dept-hero-avatar.blank {
  background: rgba(122, 102, 214, 0.16);
  color: var(--eden-muted);
}

.dept-hero-info b {
  display: block;
  font-size: 14px;
  color: var(--eden-ink);
}

.dept-hero-info em {
  font-style: normal;
  font-size: 11px;
  color: var(--eden-muted);
}

.dept-empty {
  margin-top: 14px;
  padding: 46px 20px;
  text-align: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px dashed rgba(122, 102, 214, 0.22);
}

.dept-empty-mark {
  font-size: 20px;
  color: rgba(122, 102, 214, 0.4);
}

.dept-empty p {
  margin: 8px 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--eden-ink-2);
}

.dept-empty-sub {
  font-size: 11.5px;
  color: var(--eden-muted);
}

.dept-check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--eden-ink-2);
  cursor: pointer;
}

.dept-check input {
  width: 15px;
  height: 15px;
  accent-color: var(--eden-accent);
}

@media (max-width: 900px) {
  .dept-grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- 打开部门：影子拉长 + 实体淡入 ---------- */
.dept-hero {
  opacity: 0;
  transition: opacity 0.45s ease;
}

.dept-hero.is-ready {
  opacity: 1;
}

.dept-ghost {
  position: fixed;
  z-index: 95;
  border-radius: 18px;
  overflow: hidden;
  background: #fffdfa;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 52px rgba(60, 44, 110, 0.28);
  transform-origin: top left;
  transition: transform 0.46s cubic-bezier(0.22, 0.61, 0.36, 1);
  pointer-events: none;
}

.dept-ghost::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 52%;
  background-image: var(--dept-img);
  background-size: cover;
  background-position: center;
  opacity: 0.5;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.25) 38%, #000 100%);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.25) 38%, #000 100%);
}

.dept-ghost::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 5px;
  background: var(--dept-tint);
  opacity: 0.85;
}

/* ---------- 打字出来的问候 ---------- */
.dept-greet {
  position: fixed;
  left: 0;
  right: 0;
  top: 52%;
  z-index: 96;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  pointer-events: none;
}

.dept-greet-text {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  margin: 0;
  padding: 13px 26px 13px 20px;
  font-family: "myfont", "STXingkai", "华文行楷", "KaiTi", cursive;
  font-size: clamp(18px, 2.1vw, 28px);
  line-height: 1.5;
  letter-spacing: 0.1em;
  color: var(--eden-ink);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 44px rgba(60, 44, 110, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(16px) saturate(1.25);
  backdrop-filter: blur(16px) saturate(1.25);
}

/* 左边那条部门色的小竖条 */
.greet-mark {
  flex: 0 0 auto;
  width: 5px;
  height: 1.1em;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--greet-tint, #7a66d6), rgba(255, 255, 255, 0.35));
  box-shadow: 0 0 14px var(--greet-tint, #7a66d6);
}

.greet-caret {
  display: inline-block;
  width: 2px;
  height: 0.9em;
  margin-left: 0.06em;
  vertical-align: -0.06em;
  background: currentColor;
  opacity: 0.7;
  animation: greetCaret 1s steps(1) infinite;
}

@keyframes greetCaret {
  0%, 49% { opacity: 0.7; }
  50%, 100% { opacity: 0; }
}

.greet-enter-active {
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.greet-leave-active {
  transition: opacity 1.4s ease, transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.greet-enter-from,
.greet-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 760px) {
  /* 手机上改成底部浮条，不去挡上面的内容 */
  .dept-greet {
    top: auto;
    bottom: 148px;
    padding: 0 12px;
  }

  .dept-greet-text {
    width: 100%;
    justify-content: center;
    gap: 9px;
    padding: 11px 14px;
    font-size: 15px;
    line-height: 1.55;
    letter-spacing: 0.04em;
    text-align: center;
    border-radius: 16px;
  }

  .greet-mark {
    width: 4px;
  }
}
</style>
