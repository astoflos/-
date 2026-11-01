<template>
  <div>
    <section class="recruit-hero">
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

    <section class="section" v-for="(group, gi) in recruit.groups" :key="group.title">
      <div class="section-head">
        <i class="bar"></i>
        <h2>{{ group.title }}</h2>
        <span>{{ group.note }}</span>
      </div>
      <div class="grid" :class="group.items.length > 8 ? 'grid-4' : 'grid-3'">
        <article class="item" v-for="item in group.items" :key="item.name">
          <h4 :class="{ gold: isGoldName(item) }">{{ item.name }}</h4>
          <div class="qty">{{ item.qty }}</div>
          <ul v-if="item.enchants">
            <li v-for="e in item.enchants" :key="e" :class="{ gold: (item.gold || []).includes(e) }">{{ e }}</li>
          </ul>
          <p v-else class="note">{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="section">
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
      <span>礼包清单会随版本与公会仓库情况调整，以游戏内实际发放为准。</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
