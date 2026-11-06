<!--
  活动结束后删除本页：
  1. 删除本文件 src/components/pages/PageCompetition.vue；
  2. 打开 src/app.js，删除 PageCompetition 的 import 和 components 注册；
     如果有 bannerTitle 里的 competition 分支，也可以一并删除；
  3. 打开 src/config.js，删除 nav 里的 competition 行、pageInfo.competition、
     banners.competition、notices 里的赛事公告，以及整个 competition 对象；
  4. 重新 build / push，页面入口和内容就都没有了。
  以后加新页面：复制一个 pages/PageXxx.vue，在 app.js 注册，在 config.nav 加 key='xxx'，
  currentPage 会自动对应到 PageXxx。
-->
<template>
  <div class="comp-page">
    <!-- ===== 公告头图 ===== -->
    <section class="card comp-hero" v-reveal>
      <div class="comp-hero-main">
        <div class="comp-badges">
          <span class="comp-badge">官方公告</span>
          <span class="comp-badge soft">{{ comp.status }}</span>
        </div>

        <h1 class="comp-title">{{ comp.title }}</h1>
        <p class="comp-sub">{{ comp.subtitle }}</p>
        <p class="comp-intro">{{ comp.intro }}</p>

        <div class="hero-meta">
          <span v-for="tag in comp.tags" :key="tag" class="tag solid">{{ tag }}</span>
        </div>

        <div class="comp-actions">
          <button class="eden-join" type="button" @click="openSignup">立即报名</button>
          <button class="comp-ghost" type="button" @click="scrollToRules">查看赛制</button>
        </div>

        <p class="comp-when">
          比赛时间：<b>{{ comp.date }}</b>
          <span>·</span>
          报名截止：<b>{{ signup.deadline }}</b>
          <span>·</span>
          报名免费
        </p>
      </div>

      <aside class="comp-poster" aria-hidden="true">
        <span class="comp-poster-kicker">EDEN FIGHT NIGHT</span>
        <h2>有限制<br /><em>格斗大赛</em></h2>
        <p>4 人混战 · 单败晋级</p>
        <i class="comp-poster-line"></i>
        <p>败者组再战 · BO3 冠军战</p>
        <span class="comp-poster-seal">首届</span>
      </aside>
    </section>

    <!-- ===== 公告正文 ===== -->
    <section class="card comp-announce" v-reveal="{ delay: 50 }">
      <div class="comp-announce-head">
        <v-icon size="18">mdi-bullhorn-outline</v-icon>
        <b>赛事公告</b>
        <span>ANNOUNCEMENT</span>
      </div>
      <p>{{ comp.announcement }}</p>
      <div class="comp-announce-foot">
        <span>伊甸园公会 · 管理组</span>
        <span>{{ comp.date }}</span>
      </div>
    </section>

    <!-- ===== 速览 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>赛事速览</h2>
        <span>OVERVIEW</span>
      </div>
      <div class="comp-stats">
        <div v-for="item in comp.highlights" :key="item.label" class="comp-stat">
          <b>{{ item.value }}</b>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </section>

    <!-- ===== 奖励 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>赛事奖励</h2>
        <span>REWARDS</span>
      </div>
      <div class="comp-prizes">
        <article
          v-for="prize in comp.rewards"
          :key="prize.title"
          class="comp-prize"
          :class="{ grand: prize.grand }"
        >
          <span class="comp-prize-ico"><v-icon size="20">{{ prize.icon }}</v-icon></span>
          <div class="comp-prize-body">
            <h3>{{ prize.title }}</h3>
            <b>{{ prize.value }}</b>
            <p>{{ prize.note }}</p>
          </div>
        </article>
      </div>
      <p class="comp-footnote">奖励不重复叠加；最终冠军在主赛 / 败者组奖励之外，另得坚守光环 II 附魔书。</p>
    </section>

    <!-- ===== 流程 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>赛制流程</h2>
        <span>FORMAT</span>
      </div>
      <div class="comp-flow">
        <article v-for="item in comp.flow" :key="item.step" class="comp-flow-item">
          <span class="comp-flow-step">{{ item.step }}</span>
          <v-icon size="22">{{ item.icon }}</v-icon>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
          <span class="tag">{{ item.tag }}</span>
        </article>
      </div>
    </section>

    <!-- ===== 规则 ===== -->
    <section id="competition-rules" class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>比赛规则</h2>
        <span>RULES</span>
      </div>

      <div class="comp-rule-grid">
        <article class="card comp-rule-card">
          <div class="comp-rule-head">
            <v-icon size="18">mdi-sword-cross</v-icon>
            <h3>主赛 · 全程 4 人混战</h3>
          </div>
          <ul class="comp-list">
            <li v-for="line in comp.mainRules" :key="line">{{ line }}</li>
          </ul>
        </article>

        <article class="card comp-rule-card">
          <div class="comp-rule-head">
            <v-icon size="18">mdi-recycle-variant</v-icon>
            <h3>败者组</h3>
          </div>
          <ul class="comp-list">
            <li v-for="line in comp.loserRules" :key="line">{{ line }}</li>
          </ul>
        </article>

        <article class="card comp-rule-card">
          <div class="comp-rule-head">
            <v-icon size="18">mdi-crown-outline</v-icon>
            <h3>最终冠军战</h3>
          </div>
          <ul class="comp-list">
            <li v-for="line in comp.finalRules" :key="line">{{ line }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- ===== 装备 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>装备与道具</h2>
        <span>LOADOUT</span>
      </div>
      <div class="card comp-loadout">
        <div class="comp-loadout-head">
          <v-icon size="20">mdi-shield-sword-outline</v-icon>
          <h3>有限制格斗</h3>
          <span class="tag solid">待定</span>
        </div>
        <ul class="comp-list">
          <li v-for="line in comp.equipment" :key="line">{{ line }}</li>
        </ul>
      </div>
    </section>

    <!-- ===== 成就 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>成就奖</h2>
        <span>ACHIEVEMENTS</span>
      </div>
      <div class="comp-achievements">
        <article v-for="item in comp.achievements" :key="item.name" class="comp-achievement">
          <span class="comp-achievement-ico"><v-icon size="19">{{ item.icon }}</v-icon></span>
          <div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </article>
      </div>
      <p class="comp-footnote">成就奖由裁判组根据服务器记录、录像和现场判定发放；达成即得，可与名次奖励叠加。</p>
    </section>

    <!-- ===== 通用规则 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>通用规则与判罚</h2>
        <span>CONDUCT</span>
      </div>
      <div class="card comp-conduct">
        <ul class="comp-list">
          <li v-for="line in comp.generalRules" :key="line">{{ line }}</li>
        </ul>
      </div>
    </section>

    <!-- ===== 报名 ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>报名入口</h2>
        <span>SIGN UP</span>
      </div>

      <div class="comp-signup card">
        <div class="comp-signup-main">
          <span class="comp-kicker">JOIN THE FIGHT</span>
          <h3>{{ signup.priority || '伊甸园公会成员优先报名' }}</h3>
          <p>{{ signup.note }}</p>

          <div class="comp-qq-row">
            <span>{{ signup.contact || '果果 QQ' }}</span>
            <b>{{ qq }}</b>
            <button type="button" @click="copyQQ">{{ copied ? '已复制' : '复制 QQ' }}</button>
          </div>

          <div class="comp-actions">
            <button class="eden-join" type="button" @click="openSignup">立即报名</button>
            <a
              v-if="signup.formUrl"
              class="eden-join comp-link-btn"
              :href="signup.formUrl"
              target="_blank"
              rel="noopener"
            >{{ signup.formText || '打开报名表' }}</a>
          </div>
        </div>

        <ol class="comp-signup-steps">
          <li v-for="step in signup.steps" :key="step">{{ step }}</li>
        </ol>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>常见问题</h2>
        <span>FAQ</span>
      </div>
      <div class="comp-faq">
        <details v-for="item in comp.faq" :key="item.q">
          <summary>{{ item.q }}</summary>
          <p>{{ item.a }}</p>
        </details>
      </div>
    </section>

    <div class="footer">
      <span v-for="line in configdata.statement" :key="line">{{ line }}<br /></span>
      <span>赛事最终解释权归伊甸园公会管理组所有</span>
    </div>

    <!-- ===== 报名弹窗 ===== -->
    <v-dialog v-model="dialogSignup" max-width="540" scrollable>
      <div class="dialog-card comp-signup-dialog">
        <div class="comp-dialog-kicker">EDEN FIGHT NIGHT · SIGN UP</div>
        <h2>报名入口</h2>
        <p class="note">{{ signup.note }}</p>

        <div class="comp-qq-row">
          <span>{{ signup.contact || '果果 QQ' }}</span>
          <b>{{ qq }}</b>
          <button type="button" @click="copyQQ">{{ copied ? '已复制' : '复制 QQ' }}</button>
        </div>

        <div class="dialog-step" v-for="(step, index) in signup.steps" :key="step">
          <span class="num">{{ index + 1 }}</span>
          <span>{{ step }}</span>
        </div>

        <p class="comp-dialog-hint">不会写报名信息？点下面复制格式，填好后发给果果即可。</p>

        <div class="comp-dialog-actions">
          <button class="eden-join" type="button" @click="copyTemplate">
            {{ templateCopied ? '已复制报名格式' : '复制报名格式' }}
          </button>
          <a
            v-if="signup.formUrl"
            class="eden-join comp-link-btn"
            :href="signup.formUrl"
            target="_blank"
            rel="noopener"
          >{{ signup.formText || '打开报名表' }}</a>
          <button class="comp-ghost" type="button" @click="dialogSignup = false">关闭</button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

const comp = computed(() => props.configdata.competition || {})
const signup = computed(() => comp.value.signup || {})
const qq = computed(() => {
  if (signup.value.qq) return signup.value.qq
  const hit = (props.configdata.contacts || []).find(c => String(c.label || '').includes('QQ'))
  return hit ? hit.value : '315931400'
})

const dialogSignup = ref(false)
const copied = ref(false)
const templateCopied = ref(false)
let copiedTimer = null
let templateTimer = null

function openSignup() {
  dialogSignup.value = true
}

function scrollToRules() {
  const el = document.getElementById('competition-rules')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (e) {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch (err) {
      return false
    }
  }
}

async function copyQQ() {
  if (await copyText(qq.value)) {
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copied.value = false }, 1800)
  }
}

async function copyTemplate() {
  const text = signup.value.template || `游戏 ID：\nQQ：\n可参赛时段：\n是否已阅读规则：`
  if (await copyText(text)) {
    templateCopied.value = true
    clearTimeout(templateTimer)
    templateTimer = setTimeout(() => { templateCopied.value = false }, 1800)
  }
}
</script>

<style scoped>
.comp-page {
  --comp-accent: var(--eden-accent);
}

#competition-rules {
  scroll-margin-top: 20px;
}

.comp-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.65fr);
  gap: 22px;
  padding: 26px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(247, 240, 255, 0.9));
}

.comp-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.comp-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #fff;
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
  border-radius: 999px;
}

.comp-badge.soft {
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.1);
  border: 1px solid rgba(122, 102, 214, 0.2);
}

.comp-title {
  margin: 0;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 40px;
  line-height: 1.2;
  letter-spacing: 0.04em;
  color: var(--eden-ink);
}

.comp-sub {
  margin: 8px 0 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--eden-accent);
}

.comp-intro {
  margin: 12px 0 0;
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--eden-ink-2);
}

.comp-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.comp-actions .eden-join {
  width: auto;
  margin: 0;
  padding: 11px 22px;
}

.comp-ghost {
  padding: 10px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--eden-accent);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(122, 102, 214, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.comp-ghost:hover {
  background: #fff;
  border-color: rgba(122, 102, 214, 0.55);
}

.comp-when {
  margin: 16px 0 0;
  font-size: 11.5px;
  color: var(--eden-muted);
}

.comp-when b {
  color: var(--eden-ink-2);
}

.comp-when span {
  margin: 0 6px;
  opacity: 0.5;
}

.comp-poster {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 260px;
  padding: 26px 22px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(150deg, #35285f 0%, #6e58c7 55%, #ef9ac1 100%);
  border-radius: 18px;
  box-shadow: 0 16px 34px rgba(74, 54, 140, 0.28);
}

.comp-poster::before,
.comp-poster::after {
  content: "";
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  pointer-events: none;
}

.comp-poster::before {
  width: 180px;
  height: 180px;
  right: -50px;
  top: -60px;
}

.comp-poster::after {
  width: 110px;
  height: 110px;
  left: -38px;
  bottom: -46px;
}

.comp-poster-kicker {
  font-size: 10px;
  letter-spacing: 0.24em;
  color: rgba(255, 255, 255, 0.65);
}

.comp-poster h2 {
  position: relative;
  margin: 12px 0 8px;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 34px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: 0.08em;
}

.comp-poster h2 em {
  font-style: normal;
  color: #ffd9e9;
}

.comp-poster p {
  margin: 4px 0;
  font-size: 11.5px;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.72);
}

.comp-poster-line {
  display: block;
  width: 34px;
  height: 1px;
  margin: 12px 0;
  background: rgba(255, 255, 255, 0.45);
}

.comp-poster-seal {
  position: absolute;
  right: 18px;
  bottom: 16px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "myfont", cursive;
  font-size: 13px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  transform: rotate(-12deg);
  opacity: 0.9;
}

.comp-announce {
  margin-top: 16px;
  padding: 18px 20px;
  border-left: 4px solid var(--eden-accent);
}

.comp-announce-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--eden-accent);
}

.comp-announce-head b {
  font-size: 14px;
}

.comp-announce-head span {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  color: var(--eden-muted);
}

.comp-announce p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.85;
  color: var(--eden-ink-2);
}

.comp-announce-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  font-size: 10.5px;
  color: var(--eden-muted);
}

.comp-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.comp-stat {
  padding: 16px 10px;
  text-align: center;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  border-radius: 16px;
  box-shadow: var(--eden-shadow-sm);
}

.comp-stat b {
  display: block;
  font-size: 21px;
  line-height: 1.25;
  color: var(--eden-accent);
}

.comp-stat span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--eden-muted);
}

.comp-prizes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.comp-prize {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  border-radius: 14px;
  box-shadow: var(--eden-shadow-sm);
}

.comp-prize.grand {
  color: #fff;
  background: linear-gradient(135deg, #4b3a8e, #7a66d6 58%, #e58fb6);
  border-color: transparent;
}

.comp-prize-ico {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.1);
  border-radius: 10px;
}

.comp-prize.grand .comp-prize-ico {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.comp-prize-body {
  min-width: 0;
}

.comp-prize h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
}

.comp-prize b {
  display: block;
  margin-top: 3px;
  font-size: 14px;
  color: var(--eden-accent);
}

.comp-prize.grand b {
  color: #ffe4ae;
}

.comp-prize p {
  margin: 4px 0 0;
  font-size: 10.5px;
  line-height: 1.55;
  color: var(--eden-muted);
}

.comp-prize.grand p {
  color: rgba(255, 255, 255, 0.72);
}

.comp-footnote {
  margin: 10px 0 0;
  font-size: 10.5px;
  color: var(--eden-muted);
}

.comp-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.comp-flow-item {
  position: relative;
  padding: 18px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  border-radius: 18px;
  box-shadow: var(--eden-shadow-sm);
}

.comp-flow-step {
  position: absolute;
  top: 12px;
  right: 14px;
  font-family: "digitalfont", monospace;
  font-size: 20px;
  color: rgba(122, 102, 214, 0.18);
}

.comp-flow-item > .v-icon {
  color: var(--eden-accent);
}

.comp-flow-item h3 {
  margin: 10px 0 4px;
  font-size: 14px;
}

.comp-flow-item p {
  margin: 0 0 10px;
  font-size: 11.5px;
  line-height: 1.65;
  color: var(--eden-ink-2);
}

.comp-rule-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.comp-rule-card {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  padding: 16px 18px;
}

.comp-rule-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--eden-accent);
}

.comp-rule-head h3 {
  margin: 0;
  font-size: 14px;
  color: var(--eden-ink);
}

.comp-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  line-height: 1.8;
  color: var(--eden-ink-2);
}

.comp-list li {
  position: relative;
  padding-left: 12px;
  margin: 3px 0;
}

.comp-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(122, 102, 214, 0.5);
}

.comp-kicker {
  font-size: 9.5px;
  letter-spacing: 0.18em;
  color: var(--eden-accent);
}

.comp-loadout {
  border-style: dashed;
  border-color: rgba(122, 102, 214, 0.3);
}

.comp-loadout-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--eden-accent);
}

.comp-loadout-head h3 {
  margin: 0;
  font-size: 14px;
  color: var(--eden-ink);
}

.comp-loadout-head .tag {
  margin-left: auto;
}

.comp-achievements {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.comp-achievement {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  border-radius: 14px;
}

.comp-achievement-ico {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.1);
  border-radius: 9px;
}

.comp-achievement h3 {
  margin: 0 0 2px;
  font-size: 12.5px;
}

.comp-achievement p {
  margin: 0;
  font-size: 11px;
  line-height: 1.55;
  color: var(--eden-muted);
}

.comp-conduct {
  border-left: 4px solid rgba(122, 102, 214, 0.4);
}

.comp-signup {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(240px, 0.8fr);
  gap: 20px;
  padding: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(247, 240, 255, 0.92));
  border-color: rgba(122, 102, 214, 0.2);
}

.comp-signup-main h3 {
  margin: 5px 0 6px;
  font-size: 18px;
}

.comp-signup-main > p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--eden-ink-2);
}

.comp-qq-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px dashed rgba(122, 102, 214, 0.3);
  border-radius: 12px;
  font-size: 12px;
}

.comp-qq-row span {
  color: var(--eden-muted);
}

.comp-qq-row b {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px;
  color: var(--eden-accent);
}

.comp-qq-row button {
  margin-left: auto;
  padding: 4px 9px;
  font-family: inherit;
  font-size: 10.5px;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.1);
  border: 1px solid rgba(122, 102, 214, 0.2);
  border-radius: 7px;
  cursor: pointer;
}

.comp-signup-steps {
  margin: 0;
  padding-left: 18px;
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--eden-ink-2);
}

.comp-signup-steps li {
  margin: 4px 0;
}

.comp-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.comp-faq {
  display: grid;
  gap: 8px;
}

.comp-faq details {
  padding: 12px 14px;
  background: var(--eden-card-2);
  border: 1px solid var(--eden-border);
  border-radius: 12px;
}

.comp-faq summary {
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--eden-ink);
}

.comp-faq p {
  margin: 8px 0 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--eden-ink-2);
}

.comp-signup-dialog {
  padding: 22px;
}

.comp-dialog-kicker {
  font-size: 9.5px;
  letter-spacing: 0.18em;
  color: var(--eden-muted);
}

.comp-signup-dialog h2 {
  margin: 4px 0 6px;
}

.comp-dialog-hint {
  margin: 12px 0 0;
  font-size: 11px;
  color: var(--eden-muted);
}

.comp-dialog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.comp-dialog-actions .eden-join {
  width: auto;
  margin: 0;
  padding: 10px 16px;
}

@media (max-width: 1000px) {
  .comp-hero {
    grid-template-columns: 1fr;
  }

  .comp-poster {
    min-height: 200px;
  }

  .comp-signup {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  #competition-rules {
    scroll-margin-top: 132px;
  }

  .comp-hero {
    padding: 18px;
    border-radius: 18px;
  }

  .comp-title {
    font-size: 29px;
  }

  .comp-sub {
    font-size: 12.5px;
  }

  .comp-poster {
    min-height: 180px;
    padding: 20px;
  }

  .comp-poster h2 {
    font-size: 29px;
  }

  .comp-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .comp-prizes,
  .comp-flow,
  .comp-rule-grid,
  .comp-achievements {
    grid-template-columns: 1fr;
  }

  .comp-rule-card {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .comp-announce-foot {
    flex-direction: column;
    gap: 4px;
  }

  .comp-qq-row button {
    margin-left: 0;
  }

  .comp-dialog-actions .eden-join,
  .comp-dialog-actions .comp-ghost {
    flex: 1;
  }
}

@media (max-width: 420px) {
  .comp-actions .eden-join,
  .comp-actions .comp-ghost {
    flex: 1;
  }

  .comp-title {
    font-size: 26px;
  }

  .comp-poster-seal {
    display: none;
  }
}
</style>
