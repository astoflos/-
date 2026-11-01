<template>
  <div>
    <div class="toolbar">
      <label class="search">
        <v-icon size="18">mdi-magnify</v-icon>
        <input
          v-model="q"
          type="search"
          placeholder="搜索名称 / 介绍 / 产物，如：刷铁机"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search"
        />
        <button v-if="q" class="clear" type="button" aria-label="清除" @click="q = ''">✕</button>
      </label>

      <div class="filters">
        <button
          v-for="f in config.territoryTypes"
          :key="f.key"
          class="filter"
          :class="{ active: cat === f.key }"
          type="button"
          @click="cat = f.key"
        >
          {{ f.label }}
        </button>
      </div>

      <span class="counter">{{ counterText }}</span>
    </div>

    <div v-if="filtered.length" class="territory-grid">
      <article class="territory" v-for="t in filtered" :key="t.cmd + t.type">
        <div class="territory-top">
          <span class="type-tag" :class="t.type">{{ typeLabel(t.type) }}</span>
          <h3 v-html="hl(t.cmd)"></h3>
          <span class="owner">主人：{{ t.owner || '公会用' }}</span>
        </div>

        <p class="desc" v-html="hl(t.desc)"></p>

        <p v-if="t.products" class="products">
          <b>产物</b><span v-html="hl(t.products)"></span>
        </p>

        <button class="cmd" :class="{ copied: copied === t.cmd }" type="button" @click="copy(t)">
          <span class="text">/ps {{ t.cmd }}</span>
          <span class="copy">{{ copied === t.cmd ? '已复制' : '复制' }}</span>
        </button>
      </article>
    </div>

    <div v-else class="empty-box">
      <strong>没有找到匹配的领地</strong>
      <span>换个关键词试试吧</span>
    </div>

    <div class="footer">
      <span>点击指令即可一键复制，粘贴到游戏聊天栏执行传送。</span><br />
      <span>使用公共机器后请关机并清理掉落物，谢谢配合。</span>
    </div>

    <v-snackbar v-model="snackbar" :timeout="1800" location="bottom" rounded="pill">
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  props: {
    configdata: { type: Object, required: true }
  },
  data() {
    return {
      q: '',
      cat: 'all',
      copied: '',
      snackbar: false,
      snackText: ''
    }
  },
  computed: {
    config() {
      return this.configdata
    },
    terms() {
      return this.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    },
    filtered() {
      return this.config.territories.filter(t => {
        if (this.cat !== 'all' && t.type !== this.cat) return false
        if (!this.terms.length) return true
        const hay = [t.cmd, t.desc, t.products || '', t.owner || ''].join(' ').toLowerCase()
        return this.terms.every(term => hay.includes(term))
      })
    },
    counterText() {
      const total = this.config.territories.length
      return this.filtered.length === total
        ? `共 ${total} 个`
        : `找到 ${this.filtered.length} 个`
    }
  },
  watch: {
    q() {
      this.copied = ''
    },
    cat() {
      this.copied = ''
    }
  },
  methods: {
    typeLabel(type) {
      const hit = this.config.territoryTypes.find(t => t.key === type)
      return hit ? hit.label : '其他'
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    },
    escapeReg(s) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    hl(text) {
      const raw = this.esc(text || '')
      if (!this.terms.length) return raw
      const pattern = this.terms
        .map(t => this.escapeReg(this.esc(t)))
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
      if (!pattern.length) return raw
      return raw.replace(new RegExp('(' + pattern.join('|') + ')', 'gi'), '<mark>$1</mark>')
    },
    async copy(t) {
      const text = '/ps ' + t.cmd
      const ok = await this.copyText(text)
      if (!ok) {
        this.snackText = '复制失败，请长按指令手动复制'
        this.snackbar = true
        return
      }
      this.copied = t.cmd
      this.snackText = '已复制：' + text
      this.snackbar = true
      setTimeout(() => {
        if (this.copied === t.cmd) this.copied = ''
      }, 1600)
    },
    async copyText(text) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          return true
        }
      } catch (e) { /* 降级 */ }

      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        return ok
      } catch (e) {
        return false
      }
    }
  }
}
</script>

<style scoped>
.territory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

@media (max-width: 640px) {
  .territory-grid {
    grid-template-columns: 1fr;
  }
}
</style>
