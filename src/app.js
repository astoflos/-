import Splash from './components/Splash.vue'
import SakuraLayer from './components/SakuraLayer.vue'
import ScrollProgress from './components/ScrollProgress.vue'
import CursorGlow from './components/CursorGlow.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import AuthDialog from './components/AuthDialog.vue'
import PageHome from './components/pages/PageHome.vue'
import PageTerritory from './components/pages/PageTerritory.vue'
import PageRecruit from './components/pages/PageRecruit.vue'
import PageMembers from './components/pages/PageMembers.vue'
import PageAbout from './components/pages/PageAbout.vue'
import config from './config.js'
import { setMeta, getFormattedDate, dataConsole } from './utils/common.js'
import { auth, loadMe, logout } from './lib/auth.js'

export default {
  components: {
    Splash,
    SakuraLayer,
    ScrollProgress,
    CursorGlow,
    MusicPlayer,
    AuthDialog,
    PageHome,
    PageTerritory,
    PageRecruit,
    PageMembers,
    PageAbout
  },
  data() {
    return {
      configdata: config,
      showSplash: false,
      view: 'home',
      dialogJoin: false,
      dialogAuth: false,
      dialogSettings: false,
      bgOpacity: 100,
      date: '',
      bannerShift: 0,
      bannerRaf: 0,
      auth
    }
  },
  computed: {
    currentNav() {
      return this.configdata.nav.find(n => n.key === this.view) || this.configdata.nav[0]
    },
    currentPage() {
      return 'Page' + this.view.charAt(0).toUpperCase() + this.view.slice(1)
    },
    pageSub() {
      const info = this.configdata.pageInfo || {}
      return info[this.view] || ''
    },
    bannerTitle() {
      if (this.view === 'home') {
        return `${this.configdata.guild.name} · ${this.configdata.guild.en}`
      }
      return this.currentNav.label
    }
  },
  mounted() {
    // 背景图由配置注入 CSS 变量
    document.documentElement.style.setProperty('--eden-bg', `url('${this.configdata.background}')`)

    if (this.configdata.wallpaperVideo && this.configdata.wallpaperVideo.enable) {
      document.documentElement.classList.add('has-bg-video')
    }

    this.setMeta(
      this.configdata.metaData.title,
      this.configdata.metaData.description,
      this.configdata.metaData.keywords,
      this.configdata.metaData.icon
    )
    this.dataConsole()
    this.date = this.getFormattedDate(new Date())

    // 开屏每个会话只出现一次
    this.showSplash = !sessionStorage.getItem('eden-entered')

    // 背景可见度设置
    try {
      const saved = Number(localStorage.getItem('eden-bg-opacity'))
      if (Number.isFinite(saved) && saved >= 0 && saved <= 100) this.bgOpacity = saved
    } catch (e) { /* 忽略 */ }
    this.applyBg(this.bgOpacity)

    // 拉一次登录状态
    loadMe()

    window.addEventListener('hashchange', this.applyHash)
    this.applyHash()

    // 横幅轻微视差（尊重系统的减少动态效果设置）
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', this.onScroll, { passive: true })
    }
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.applyHash)
    window.removeEventListener('scroll', this.onScroll)
  },
  watch: {
    bgOpacity(val) {
      this.applyBg(val)
      try {
        localStorage.setItem('eden-bg-opacity', String(val))
      } catch (e) { /* 忽略 */ }
    }
  },
  methods: {
    setMeta,
    dataConsole,
    getFormattedDate,

    onEnter() {
      sessionStorage.setItem('eden-entered', '1')
      this.showSplash = false
    },

    initials(name) {
      const s = String(name || '').trim()
      return s ? s.slice(0, 1).toUpperCase() : '?'
    },

    applyBg(value) {
      const v = Math.max(0, Math.min(100, Number(value) || 0))
      document.documentElement.style.setProperty('--veil-opacity', String(v / 100))
    },

    resetBg() {
      this.bgOpacity = 100
    },

    onScroll() {
      if (this.bannerRaf) return
      this.bannerRaf = requestAnimationFrame(() => {
        this.bannerRaf = 0
        const y = window.scrollY || window.pageYOffset || 0
        this.bannerShift = Math.min(36, Math.round(y * 0.08))
      })
    },

    async doLogout() {
      await logout()
    },

    applyHash() {
      const key = (location.hash || '').replace(/^#/, '')
      if (this.configdata.nav.some(n => n.key === key)) {
        this.view = key
      } else if (!key) {
        this.view = 'home'
      }
      this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    },

    go(key) {
      this.view = key
      if (location.hash !== '#' + key) {
        location.hash = key
      } else {
        this.applyHash()
      }
    }
  }
}
