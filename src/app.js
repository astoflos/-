import Splash from './components/Splash.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import PageHome from './components/pages/PageHome.vue'
import PageTerritory from './components/pages/PageTerritory.vue'
import PageRecruit from './components/pages/PageRecruit.vue'
import PageMembers from './components/pages/PageMembers.vue'
import PageAbout from './components/pages/PageAbout.vue'
import config from './config.js'
import { setMeta, getFormattedDate, dataConsole } from './utils/common.js'

export default {
  components: {
    Splash,
    MusicPlayer,
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
      date: ''
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

    window.addEventListener('hashchange', this.applyHash)
    this.applyHash()
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.applyHash)
  },
  methods: {
    setMeta,
    dataConsole,
    getFormattedDate,

    onEnter() {
      sessionStorage.setItem('eden-entered', '1')
      this.showSplash = false
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
