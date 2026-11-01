<template>
  <div>
    <section class="recruit-hero" v-reveal>
      <div>
        <h1 class="recruit-title">{{ recruit.title }}</h1>
        <p class="recruit-sub">{{ recruit.subtitle }}</p>
        <p class="recruit-intro">{{ recruit.intro }}</p>
        <div class="hero-meta">
          <span class="tag solid">满 16 岁可申请</span>
          <span class="tag">正式成员专享</span>
          <span class="tag">随版本更新调整</span>
          <span class="tag">共 {{ giftCount }} 件</span>
        </div>
      </div>
      <div class="hero-media">
        <img :src="recruit.image" alt="伊甸园初遇礼物资一览" />
      </div>
    </section>

    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>礼包清单</h2>
        <span>点标题展开 / 收起</span>
      </div>

      <div class="folds">
        <div class="fold" v-for="(group, gi) in recruit.groups" :key="group.title">
          <button class="fold-head" type="button" :class="{ open: isOpen(gi) }" @click="toggle(gi)">
            <span class="fold-idx">0{{ gi + 1 }}</span>
            <span class="fold-title">{{ group.title }}</span>
            <span class="fold-note">{{ group.note }} · {{ group.items.length }} 件</span>
            <span class="fold-arrow">⌄</span>
          </button>

          <div class="fold-body" :class="{ open: isOpen(gi) }">
            <div class="fold-inner">
              <div class="grid item-grid" :class="group.items.length > 8 ? 'grid-4' : 'grid-3'">
                <article class="item" v-for="item in group.items" :key="item.name">
                  <div class="item-top">
                    <h4 :class="{ gold: isGoldName(item) }">{{ item.name }}</h4>
                    <span class="qty">{{ item.qty }}</span>
                  </div>
                  <ul class="ench" v-if="item.enchants">
                    <li v-for="e in item.enchants" :key="e" :class="{ gold: (item.gold || []).includes(e) }">{{ e }}</li>
                  </ul>
                  <p v-else class="note">{{ item.desc }}</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>怎么加入</h2>
        <span>HOW TO JOIN</span>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <h3 class="card-title">招募要求</h3>
          <div class="rule" v-for="(r, i) in recruit.requirements" :key="r">
            <span class="idx">{{ i + 1 }}</span>
            <span>{{ r }}</span>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">加入流程</h3>
          <div class="rule" v-for="(s, i) in recruit.steps" :key="s">
            <span class="idx">{{ i + 1 }}</span>
            <span>{{ s }}</span>
          </div>
          <button class="eden-join" type="button" style="margin-top: 14px;" @click="$emit('join')">加入伊甸园</button>
        </div>
      </div>

      <!-- 入会问卷二维码：换图直接覆盖 public/img/site/join-qr.jpg -->
      <div class="card qr-card" v-if="configdata.join && configdata.join.form">
        <img :src="configdata.join.form.qr" :alt="configdata.join.form.title" />
        <div class="qr-text">
          <h3 class="card-title">{{ configdata.join.form.title }}</h3>
          <p class="card-sub">{{ configdata.join.form.note }}</p>
          <p class="card-sub" style="margin-bottom: 0;">公会 QQ 群：{{ qq }}</p>
        </div>
      </div>
    </section>

    <div class="footer">
      <span>礼包随版本与仓库情况调整。</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

defineEmits(['join'])

const recruit = computed(() => props.configdata.recruit)

const qq = computed(() => {
  const list = props.configdata.contacts || []
  const hit = list.find(c => c.label && c.label.indexOf('QQ') >= 0)
  return hit ? hit.value : ''
})

const giftCount = computed(() =>
  (recruit.value.groups || []).reduce((sum, g) => sum + (g.items || []).length, 0)
)

/* 手风琴：默认全部收起 */
const openSet = ref([])

function isOpen(index) {
  return openSet.value.includes(index)
}

function toggle(index) {
  const i = openSet.value.indexOf(index)
  if (i >= 0) openSet.value.splice(i, 1)
  else openSet.value.push(index)
}

function isGoldName(item) {
  return (item.gold || []).includes(item.name)
}
</script>

<style scoped>
.recruit-intro {
  margin: 6px 0 12px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--eden-ink-2);
}

.hero-media img {
  box-shadow: 0 10px 24px rgba(103, 84, 160, 0.18);
}

/* 礼包手风琴 */
.folds {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fold {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 22px rgba(103, 84, 160, 0.1);
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  backdrop-filter: blur(12px) saturate(1.1);
  overflow: hidden;
  transition: background 0.25s ease, box-shadow 0.3s ease;
}

.fold:hover {
  background: rgba(255, 255, 255, 0.55);
}

.fold-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 18px;
  font-family: inherit;
  text-align: left;
  color: var(--eden-ink);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.fold-head:hover {
  background: rgba(255, 255, 255, 0.4);
}

.fold-head.open {
  background: linear-gradient(90deg, rgba(122, 102, 214, 0.1), rgba(239, 154, 193, 0.05));
}

.fold-idx {
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 17px;
  color: var(--eden-accent-2);
  opacity: 0.8;
}

.fold-title {
  font-size: 15.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.fold-note {
  margin-left: auto;
  font-size: 11.5px;
  color: var(--eden-muted);
}

.fold-arrow {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.1);
  border-radius: 50%;
  font-size: 12px;
  transition: transform 0.35s ease, background 0.25s ease;
}

.fold-head.open .fold-arrow {
  transform: rotate(180deg);
  background: rgba(122, 102, 214, 0.18);
}

.fold-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.fold-body.open {
  grid-template-rows: 1fr;
}

.fold-inner {
  min-height: 0;
  overflow: hidden;
  padding: 0 18px 18px;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s;
}

.fold-body.open .fold-inner {
  opacity: 1;
  transform: none;
}

/* 礼包小卡：更轻、更干净 */
.item {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(122, 102, 214, 0.12);
  box-shadow: none;
}

.item:hover {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(122, 102, 214, 0.3);
}

.item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.item-top h4 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--eden-ink);
  word-break: break-word;
}

.item-top .qty {
  flex: 0 0 auto;
  padding: 1px 7px;
  font-size: 11px;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.1);
  border-radius: 999px;
}

.ench {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--eden-ink-2);
}

.ench li {
  position: relative;
  padding-left: 9px;
}

.ench li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(122, 102, 214, 0.45);
}

.ench li.gold {
  color: #c47a12;
  font-weight: 700;
}

.ench li.gold::before {
  background: #e2a33b;
}

.note {
  margin: 0;
  font-size: 11.5px;
  color: var(--eden-muted);
}

@media (max-width: 640px) {
  .fold-note {
    display: none;
  }

  .ench {
    grid-template-columns: 1fr;
  }
}

/* 入会问卷卡片 */
.qr-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
}

.qr-card img {
  flex: 0 0 130px;
  width: 130px;
  height: 130px;
  padding: 6px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(103, 84, 160, 0.12);
}

.qr-text {
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .qr-card {
    flex-direction: column;
    text-align: center;
  }
}

.item h4.gold {
  color: #c47a12;
}

.card .rule:first-of-type {
  border-top: 1px dashed var(--eden-line);
  margin-top: 6px;
}
</style>
