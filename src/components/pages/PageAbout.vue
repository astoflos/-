<template>
  <div>
    <section class="card">
      <h2 class="card-title" style="font-size: 19px;">{{ config.guild.name }} · {{ config.guild.en }}</h2>
      <p class="card-sub" style="margin-bottom: 6px;">{{ config.guild.slogan }}</p>
      <p class="about-text">{{ config.guild.intro }}</p>
      <div class="hero-meta">
        <span class="tag">成立 {{ config.guild.founded }}</span>
        <span class="tag">{{ config.server.name }} · {{ config.server.version }}</span>
        <span class="tag">主玩 {{ config.server.feature }}</span>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <i class="bar"></i>
        <h2>公会守则</h2>
        <span>RULES</span>
      </div>
      <div class="card">
        <div class="rule" v-for="(r, i) in config.rules" :key="r">
          <span class="idx">{{ i + 1 }}</span>
          <span>{{ r }}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <i class="bar"></i>
        <h2>我们走过的路</h2>
        <span>MILESTONES</span>
      </div>
      <div class="card">
        <div class="timeline">
          <div class="tl" v-for="m in config.milestones" :key="m.title">
            <time>{{ m.date }}</time>
            <h4>{{ m.title }}</h4>
            <p>{{ m.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <i class="bar"></i>
        <h2>找到我们</h2>
        <span>CONTACT</span>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <h3 class="card-title">联系方式</h3>
          <div class="contact-row" v-for="c in config.contacts" :key="c.label">
            <v-icon size="16">{{ c.icon }}</v-icon>
            <span>{{ c.label }}</span>
            <em>{{ c.value }}</em>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">加入我们</h3>
          <p class="card-sub">{{ config.join.note }}</p>
          <button class="eden-join" type="button" @click="$emit('join')">查看加入流程</button>
        </div>
      </div>
    </section>

    <div class="footer">
      <span v-for="line in config.statement" :key="line">{{ line }}<br /></span>
      <span>本站由公会成员维护 · 与服务器官方无关</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

defineEmits(['join'])

const config = computed(() => props.configdata)
</script>

<style scoped>
.about-text {
  margin: 10px 0;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--eden-ink-2);
}
</style>
