<template>
  <div>
    <section class="hero-card">
      <div class="hero-grid">
        <div class="hero-main">
          <h1 class="hero-quote">{{ config.guild.motto }}</h1>
          <typewriter :strings="config.typeWriterStrings" />
          <p class="hero-intro">{{ config.guild.intro }}</p>

          <div class="hero-meta">
            <span class="tag">所在服务器 · {{ config.server.name }}</span>
            <span class="tag">版本 {{ config.server.version }}</span>
            <span class="tag">特色 · {{ config.server.feature }}</span>
            <span class="tag">成立 · {{ config.guild.founded }}</span>
          </div>

          <div class="hero-meta">
            <span class="tag solid">会长 {{ config.leaders.leader.name }}（{{ config.leaders.leader.id }}）</span>
            <span class="tag">{{ config.members.length }} 位成员</span>
            <span class="tag">入会需满 16 岁</span>
          </div>
        </div>

        <aside class="clock-card">
          <p class="clock-time clock-font">{{ clock }}</p>
          <p class="clock-date">{{ date }}</p>
          <p class="clock-sub">{{ config.guild.name }} · {{ config.server.name }} {{ config.server.version }}</p>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="stat-row">
        <div class="stat"><b>{{ stats.members }}</b><span>公会成员</span></div>
        <div class="stat"><b>{{ stats.territories }}</b><span>登记领地</span></div>
        <div class="stat"><b>{{ stats.buildings }}</b><span>公会建筑</span></div>
        <div class="stat"><b>{{ stats.gifts }}</b><span>初遇礼物品</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <i class="bar"></i>
        <h2>公会公告</h2>
        <span>NOTICE</span>
        <button class="more" type="button" @click="$emit('navigate', 'about')">关于公会 ›</button>
      </div>
      <div class="grid" style="grid-template-columns: 1fr;">
        <article class="notice" v-for="n in config.notices" :key="n.title">
          <div class="notice-date">{{ n.date }}</div>
          <div class="notice-body">
            <h3><span class="notice-tag">{{ n.tag }}</span>{{ n.title }}</h3>
            <p>{{ n.text }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <i class="bar"></i>
        <h2>逛一逛</h2>
        <span>QUICK LINKS</span>
      </div>
      <div class="grid grid-3">
        <button class="quick" type="button" @click="$emit('navigate', 'territory')">
          <span class="quick-ico"><v-icon size="20">mdi-map-marker-radius-outline</v-icon></span>
          <span>
            <h3>公会领地</h3>
            <p>{{ stats.territories }} 处领地与机器，一键复制传送指令</p>
          </span>
        </button>
        <button class="quick" type="button" @click="$emit('navigate', 'recruit')">
          <span class="quick-ico"><v-icon size="20">mdi-gift-outline</v-icon></span>
          <span>
            <h3>招新福利</h3>
            <p>满配附魔防具、工具与附魔书清单</p>
          </span>
        </button>
        <button class="quick" type="button" @click="$emit('navigate', 'members')">
          <span class="quick-ico"><v-icon size="20">mdi-account-group-outline</v-icon></span>
          <span>
            <h3>成员名册</h3>
            <p>{{ stats.members }} 位成员，各有各的一块地</p>
          </span>
        </button>
      </div>
    </section>

    <div class="footer">
      <span v-for="line in config.statement" :key="line">{{ line }}<br /></span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import typewriter from '../typewriter.vue'
import { getFormattedTime } from '../../utils/common.js'

const props = defineProps({
  configdata: { type: Object, required: true },
  date: { type: String, default: '' }
})

defineEmits(['navigate'])

const config = computed(() => props.configdata)

const clock = ref(getFormattedTime(new Date()).replace(/ : /g, ':'))
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    clock.value = getFormattedTime(new Date()).replace(/ : /g, ':')
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const stats = computed(() => {
  const territories = config.value.territories || []
  const gifts = (config.value.recruit.groups || []).reduce((sum, g) => sum + (g.items || []).length, 0)
  return {
    members: (config.value.members || []).length,
    territories: territories.length,
    buildings: territories.filter(t => t.type === 'building').length,
    gifts
  }
})
</script>
