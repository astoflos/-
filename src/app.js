import Splash from './components/Splash.vue'
import SakuraLayer from './components/SakuraLayer.vue'
import ScrollProgress from './components/ScrollProgress.vue'
import CursorGlow from './components/CursorGlow.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import AuthDialog from './components/AuthDialog.vue'
import EasterEgg from './components/EasterEgg.vue'
import PageHome from './components/pages/PageHome.vue'
import PageTerritory from './components/pages/PageTerritory.vue'
import PageRecruit from './components/pages/PageRecruit.vue'
import PageMembers from './components/pages/PageMembers.vue'
import PageProjects from './components/pages/PageProjects.vue'
import PageDepartments from './components/pages/PageDepartments.vue'
import PageAbout from './components/pages/PageAbout.vue'
// 比赛页：活动结束后删除下面这一行、components 里的 PageCompetition，
// 再按 config.js 顶部注释删除比赛配置即可。
import PageCompetition from './components/pages/PageCompetition.vue'
import config from './config.js'
import { setMeta, getFormattedDate, dataConsole } from './utils/common.js'
import { auth, loadMe, logout } from './lib/auth.js'
import { api } from './lib/api.js'

export default {
  components: {
    Splash,
    SakuraLayer,
    ScrollProgress,
    CursorGlow,
    MusicPlayer,
    AuthDialog,
    EasterEgg,
    PageHome,
    PageTerritory,
    PageRecruit,
    PageMembers,
    PageProjects,
    PageDepartments,
    PageAbout,
    // 活动结束后删除这一行
    PageCompetition
  },
  data() {
    return {
      configdata: config,
      showSplash: false,
      view: 'home',
      dialogJoin: false,
      dialogAuth: false,
      dialogSettings: false,
      navOpen: false,
      liteMode: typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches,
      // 抽屉模式下（≤1024px）音乐和登录会挪进侧边导航底部
      drawerMode: typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches,
      // Teleport 的目标节点要等根 DOM 挂载完才在 document 里，先等一拍再渲染
      uiReady: false,
      eggOpen: false,
      bgOpacity: 100,
      date: '',
      bannerShift: 0,
      bannerRaf: 0,
      recovery: { applicable: false, enabled: false },
      recoveryCode: '',
      recoveryMsg: '',
      recoveryBusy: false,
      auth
    }
  },
  computed: {
    bgImageStyle() {
      const w = this.configdata.wallpaperVideo || {}
      const img = w.poster || this.configdata.background || ''
      return img ? { backgroundImage: `url('${img}')` } : {}
    },
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
      if (this.view === 'competition') {
        return (this.configdata.competition && this.configdata.competition.shortTitle) || '格斗大赛'
      }
      return this.currentNav.label
    },
    minimalUrl() {
      const minimal = this.configdata.minimal || {}
      return minimal.url || '/minimal/'
    }
  },
  mounted() {
    // Teleport 目标节点此时已经在 document 里了
    this.uiReady = true

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

    // 背景可见度设置（没存过就用默认 100，注意 Number(null) 是 0，不能直接转）
    try {
      const raw = localStorage.getItem('eden-bg-opacity')
      if (raw !== null) {
        const saved = Number(raw)
        if (Number.isFinite(saved) && saved >= 0 && saved <= 100) this.bgOpacity = saved
      }
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

    // 窗口宽度切换：同步「手机精简模式」和「抽屉模式」
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mqLite = window.matchMedia('(max-width: 760px)')
      this.onMqLiteChange = e => { this.liteMode = e.matches }
      if (this.mqLite.addEventListener) this.mqLite.addEventListener('change', this.onMqLiteChange)
      else if (this.mqLite.addListener) this.mqLite.addListener(this.onMqLiteChange)

      this.mqDrawer = window.matchMedia('(max-width: 1024px)')
      this.onMqDrawerChange = e => {
        this.drawerMode = e.matches
        if (!e.matches) this.navOpen = false
      }
      if (this.mqDrawer.addEventListener) this.mqDrawer.addEventListener('change', this.onMqDrawerChange)
      else if (this.mqDrawer.addListener) this.mqDrawer.addListener(this.onMqDrawerChange)
    }
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.applyHash)
    window.removeEventListener('scroll', this.onScroll)
    const queries = [
      [this.mqLite, this.onMqLiteChange],
      [this.mqDrawer, this.onMqDrawerChange]
    ]
    queries.forEach(([mq, fn]) => {
      if (!mq || !fn) return
      if (mq.removeEventListener) mq.removeEventListener('change', fn)
      else if (mq.removeListener) mq.removeListener(fn)
    })
  },
  watch: {
    bgOpacity(val) {
      this.applyBg(val)
      try {
        localStorage.setItem('eden-bg-opacity', String(val))
      } catch (e) { /* 忽略 */ }
    },
    dialogSettings(val) {
      if (val) this.loadRecovery()
    }
  },
  methods: {
    setMeta,
    dataConsole,
    getFormattedDate,

    /** 页面设置弹窗里那块「账号安全」，只有后门名单里的账号才会出现 */
    async loadRecovery() {
      if (!auth.user) {
        this.recovery = { applicable: false, enabled: false }
        return
      }
      try {
        this.recovery = await api.recovery()
      } catch (e) {
        this.recovery = { applicable: false, enabled: false }
      }
    },

    async saveRecovery() {
      const code = String(this.recoveryCode || '').trim()
      if (code.length < 8) {
        this.recoveryMsg = '恢复码至少 8 位'
        return
      }
      this.recoveryBusy = true
      this.recoveryMsg = ''
      try {
        await api.setRecovery(code)
        this.recovery = { ...this.recovery, enabled: true }
        this.recoveryCode = ''
        this.recoveryMsg = '已保存。忘了密码时，账号填游戏名、密码填它就能进。'
      } catch (e) {
        this.recoveryMsg = e.message || '保存失败'
      } finally {
        this.recoveryBusy = false
      }
    },

    async clearRecovery() {
      if (!window.confirm('清除恢复码？清除之后就只剩密码能登录了。')) return
      this.recoveryBusy = true
      this.recoveryMsg = ''
      try {
        await api.clearRecovery()
        this.recovery = { ...this.recovery, enabled: false }
        this.recoveryMsg = '已清除'
      } catch (e) {
        this.recoveryMsg = e.message || '清除失败'
      } finally {
        this.recoveryBusy = false
      }
    },

    onEnter() {
      sessionStorage.setItem('eden-entered', '1')
      this.showSplash = false
      // 开屏点击本身就是一次用户手势，直接起播（浏览器不会再拦）
      this.primeMusic()
    },

    /** 把「用户已交互」的信号交给播放器；歌单没好时它会记下待播 */
    primeMusic() {
      const player = this.$refs.musicPlayer
      if (player && typeof player.playNow === 'function') player.playNow()
    },

    openAuth() {
      this.navOpen = false
      this.dialogAuth = true
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
      this.navOpen = false
      await logout()
    },

    /** 点左上角 logo 的彩蛋，只在电脑端开 */
    openEasterEgg() {
      if (window.innerWidth <= 760) return
      this.eggOpen = true
    },

    /** 彩蛋看完回到主页 */
    onEggClosed() {
      if (this.view !== 'home') this.go('home')
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
      this.navOpen = false
      this.view = key
      if (location.hash !== '#' + key) {
        location.hash = key
      } else {
        this.applyHash()
      }
    }
  }
}
