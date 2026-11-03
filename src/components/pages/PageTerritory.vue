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

      <button v-if="isGuild" class="add-btn" type="button" @click="dialogAdd = true">
        ＋ 登记领地
      </button>

      <span class="counter">{{ counterText }}</span>
    </div>

    <p v-if="auth.user && !isGuild" class="toolbar-hint">登记领地为公会成员权限</p>

    <div v-if="filtered.length" class="territory-grid" v-reveal>
      <article class="territory" v-for="t in filtered" :key="t.id || (t.type + t.cmd)" v-tilt>
        <div class="territory-top">
          <span class="type-tag" :class="t.type">{{ typeLabel(t.type) }}</span>
          <h3 v-html="hl(t.cmd)"></h3>
          <span class="owner">主人：{{ t.owner || '公会用' }}</span>
        </div>

        <p class="desc" v-html="hl(t.desc)"></p>

        <p v-if="t.products" class="products" :title="t.products">
          <b>产物</b><span v-html="hl(t.products)"></span>
        </p>
        <p v-else class="products products-blank" aria-hidden="true"><b>产物</b><span>&nbsp;</span></p>

        <div v-if="t.cmds && t.cmds.length" class="cmd-list">
          <button
            v-for="c in t.cmds"
            :key="c.cmd"
            class="cmd"
            :class="{ copied: copied === c.cmd }"
            type="button"
            @click="copyCmd(c.cmd)"
          >
            <span class="text">/ps {{ c.cmd }}<em class="cmd-label">{{ c.label }}</em></span>
            <span class="copy">{{ copied === c.cmd ? '已复制' : '复制' }}</span>
          </button>
        </div>

        <button v-else class="cmd" :class="{ copied: copied === t.cmd }" type="button" @click="copyCmd(t.cmd)">
          <span class="text">/ps {{ t.cmd }}</span>
          <span class="copy">{{ copied === t.cmd ? '已复制' : '复制' }}</span>
        </button>

        <button v-if="t.custom && isGuild" class="del" type="button" @click="remove(t)">删除这条登记</button>
      </article>
    </div>

    <div v-else class="empty-box">
      <strong>没有找到匹配的领地</strong>
      <span>换个关键词试试吧</span>
    </div>

    <div class="footer">
      <span>点击指令复制，粘贴到游戏聊天栏传送。</span>
    </div>

    <v-snackbar v-model="snackbar" :timeout="1800" location="bottom" rounded="pill">
      {{ snackText }}
    </v-snackbar>

    <AddTerritoryDialog v-model="dialogAdd" @added="onAdded" />
  </div>
</template>

<script>
import { api } from '../../lib/api.js'
import { auth } from '../../lib/auth.js'
import AddTerritoryDialog from '../AddTerritoryDialog.vue'

export default {
  components: { AddTerritoryDialog },
  props: {
    configdata: { type: Object, required: true }
  },
  data() {
    return {
      q: '',
      cat: 'all',
      copied: '',
      snackbar: false,
      snackText: '',
      custom: [],
      dialogAdd: false,
      auth
    }
  },
  computed: {
    config() {
      return this.configdata
    },
    isGuild() {
      return !!auth.user && auth.user.role === 'guild'
    },
    all() {
      // 排序：公会建筑 → 公会资源 → 公益资源；建筑里主城固定第一
      const list = [...this.custom, ...this.config.territories]
      const rank = (t, i) => {
        if (t.type === 'building') {
          const isMain = /主城/.test(t.desc || '') || /伊甸园Eden$/.test(t.cmd || '')
          return isMain ? 0 : 1
        }
        if (t.type === 'private') return 2
        return 3
      }
      return list
        .map((t, i) => ({ t, i }))
        .sort((a, b) => rank(a.t, a.i) - rank(b.t, b.i) || a.i - b.i)
        .map(x => x.t)
    },
    terms() {
      return this.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    },
    filtered() {
      return this.all.filter(t => {
        if (this.cat !== 'all' && t.type !== this.cat) return false
        if (!this.terms.length) return true
        const cmdText = (t.cmds || []).map(c => c.cmd + ' ' + (c.label || '')).join(' ')
        const hay = [t.cmd, t.desc, t.products || '', t.owner || '', cmdText].join(' ').toLowerCase()
        return this.terms.every(term => hay.includes(term))
      })
    },
    counterText() {
      const total = this.all.length
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
  mounted() {
    this.fetchCustom()
  },
  methods: {
    async fetchCustom() {
      try {
        const res = await api.territories()
        this.custom = (res.items || []).map(item => ({ ...item, custom: true }))
      } catch (e) {
        // 接口还没配置好时不影响原有列表展示
        this.custom = []
      }
    },
    onAdded(item) {
      this.custom.unshift({ ...item, custom: true })
      this.snackText = `已登记：${item.cmd}`
      this.snackbar = true
    },
    async remove(t) {
      if (!window.confirm(`确定删除「${t.cmd}」这条登记吗？`)) return
      try {
        await api.deleteTerritory(t.id)
        this.custom = this.custom.filter(x => x.id !== t.id)
        this.snackText = '已删除'
        this.snackbar = true
      } catch (e) {
        this.snackText = e.message || '删除失败'
        this.snackbar = true
      }
    },
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
    async copyCmd(cmd) {
      const text = '/ps ' + cmd
      const ok = await this.copyText(text)
      if (!ok) {
        this.snackText = '复制失败，请长按指令手动复制'
        this.snackbar = true
        return
      }
      this.copied = cmd
      this.snackText = '已复制：' + text
      this.snackbar = true
      setTimeout(() => {
        if (this.copied === cmd) this.copied = ''
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

.add-btn {
  padding: 9px 14px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(122, 102, 214, 0.26);
}

.add-btn:hover {
  opacity: 0.94;
}

.toolbar-hint {
  margin: -4px 0 12px;
  font-size: 12px;
  color: var(--eden-muted);
}

.del {
  align-self: flex-start;
  padding: 2px 0;
  font-size: 11.5px;
  color: #c05a7a;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline dotted;
}

@media (max-width: 900px) {
  .territory-grid {
    /* minmax(0,1fr) 压住卡片最小宽度，避免窄屏被内容撑出屏 */
    grid-template-columns: minmax(0, 1fr);
  }

  .territory {
    min-width: 0;
  }
}
</style>
