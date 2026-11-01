<template>
  <div>
    <div class="section-head" style="margin-top: 0;">
      <i class="bar"></i>
      <h2>成员名册</h2>
      <span>共 {{ config.members.length }} 人 · 点击名片查看</span>
    </div>

    <div class="grid grid-4" v-reveal>
      <article
        class="member"
        v-for="m in config.members"
        :key="m.id"
        v-tilt
        tabindex="0"
        role="button"
        @click="openCard(m)"
        @keydown.enter.prevent="openCard(m)"
        @keydown.space.prevent="openCard(m)"
      >
        <div class="avatar-img">
          <img :src="m.avatar" :alt="m.name" loading="lazy" />
        </div>
        <h3>{{ m.name }}</h3>
        <p class="id">{{ m.id }}</p>
        <span class="uid">{{ m.uid }}</span>
      </article>
    </div>

    <div class="footer">
      <span v-for="line in config.statement" :key="line">{{ line }}<br /></span>
    </div>

    <v-dialog v-model="dialog" max-width="430">
      <div class="id-card" v-if="current">
        <button class="id-close" type="button" aria-label="关闭" @click="dialog = false">✕</button>

        <div class="id-head">
          <img class="id-avatar" :src="current.avatar" :alt="current.name" />
          <div class="id-title">
            <h2>{{ current.name }}</h2>
            <p class="id-name">{{ current.id }}</p>
            <span class="id-uid">{{ current.uid }}</span>
          </div>
        </div>

        <div class="id-meta">
          <span>加入日期</span>
          <b>{{ current.joinDate }}</b>
        </div>

        <p class="id-intro">{{ current.intro }}</p>

        <blockquote class="id-quote">“{{ current.quote }}”</blockquote>

        <div v-if="isSelf" class="egg">
          <span class="egg-spark">✦</span>
          <p class="egg-title">这是你自己的名片</p>
          <p class="egg-text">伊甸的门一直给你留着——无论多久回来一次，这里都有你的位置。</p>
        </div>

        <p class="id-foot">EDEN GUILD · 成员凭证</p>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { auth } from '../../lib/auth.js'

const props = defineProps({
  configdata: { type: Object, required: true }
})

const config = computed(() => props.configdata)

const dialog = ref(false)
const current = ref(null)

const isSelf = computed(() => {
  if (!current.value || !auth.user) return false
  return String(auth.user.gameName).toLowerCase() === String(current.value.id).toLowerCase()
})

function openCard(member) {
  current.value = member
  dialog.value = true
}
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

.id-quote::before {
  content: "“";
  position: absolute;
  left: 10px;
  top: 6px;
  font-size: 30px;
  color: rgba(239, 154, 193, 0.55);
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
</style>
