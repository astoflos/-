<template>
  <div>
    <div class="section-head" style="margin-top: 0;">
      <i class="bar"></i>
      <h2>成员名册</h2>
      <span>共 {{ config.members.length }} 人</span>
    </div>

    <div class="grid grid-4">
      <article
        class="member"
        v-for="m in config.members"
        :key="m.id"
        :class="{ 'is-leader': m.role === '会长' || m.role === '副会长' }"
      >
        <div class="avatar" :style="{ background: m.color }">{{ initial(m.name) }}</div>
        <h3>{{ m.name }}</h3>
        <p class="id">{{ m.id }}</p>
        <span class="role">{{ m.role }}</span>
        <p v-if="m.note" class="note">{{ m.note }}</p>
      </article>
    </div>

    <section class="section">
      <div class="card">
        <h3 class="card-title">关于名册</h3>
        <p class="card-sub">
          名册按入会时间排列。游戏 ID 以游戏内为准，如发现拼写有误或想补充个人标签，
          直接在群里 @管理 即可，我们会尽快更新。
        </p>
        <p class="card-sub" style="margin-bottom: 0;">
          名册之外，公会还有很多一起玩过的朋友——只要在伊甸留下过建筑，这里就永远有你的位置。
        </p>
      </div>
    </section>

    <div class="footer">
      <span v-for="line in config.statement" :key="line">{{ line }}<br /></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

const config = computed(() => props.configdata)

function initial(name) {
  const s = String(name || '').trim()
  return s ? s.slice(0, 1) : '?'
}
</script>
