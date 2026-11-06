<template>
  <div class="music" v-if="tracks.length || loading">
    <div class="music-row">
      <div class="cover" :class="{ spinning: playing }">
        <img :src="current.pic || fallbackCover" alt="专辑封面" @error="onCoverError" />
      </div>

      <div class="meta">
        <span class="title">{{ loading ? '加载歌单…' : (current.title || '伊甸微光') }}</span>
        <span class="artist">{{ loading ? '' : (current.author || 'GuoGuo') }}</span>
        <div class="bar">
          <i :style="{ width: percent + '%' }"></i>
        </div>
      </div>

      <div class="ctrl">
        <button type="button" aria-label="上一首" @click="prev">⏮</button>
        <button type="button" class="play" :aria-label="playing ? '暂停' : '播放'" @click="toggle">
          {{ playing ? '❚❚' : '▶' }}
        </button>
        <button type="button" aria-label="下一首" @click="next">⏭</button>
      </div>
    </div>

    <audio
      ref="audio"
      :src="current.url"
      preload="auto"
      @timeupdate="onTime"
      @ended="next"
      @error="onError"
      @play="playing = true"
      @pause="playing = false"
    ></audio>
  </div>
</template>

<script>
export default {
  name: 'EdenMusic',
  props: {
    music: { type: Object, default: () => ({}) },
    // 进站自动起播；浏览器拦截时会退化成「第一次点击/按键时补播」
    autoplay: { type: Boolean, default: true }
  },
  data() {
    return {
      tracks: [],
      index: 0,
      playing: false,
      loading: true,
      percent: 0,
      fallbackCover: '/img/site/logo.jpg',
      autoplayBlocked: false,
      pendingPlay: false,
      userPaused: false,
      gestureBound: false
    }
  },
  computed: {
    current() {
      return this.tracks[this.index] || {}
    }
  },
  mounted() {
    if (this.music && this.music.enable === false) {
      this.loading = false
      return
    }
    // 浏览器不允许纯程序化外放；先挂一次手势监听，首屏点开屏时就会补播
    this.bindGesture()
    this.loadTracks()
  },
  beforeUnmount() {
    this.removeGesture()
    const a = this.$refs.audio
    if (a) {
      a.pause()
      a.removeAttribute('src')
    }
  },
  methods: {
    async loadTracks() {
      const cfg = this.music || {}
      const api = cfg.api || 'https://api.i-meto.com/meting/api'
      const url = `${api}?server=${encodeURIComponent(cfg.server || 'netease')}` +
        `&type=search&id=${encodeURIComponent(cfg.keyword || '伊甸微光')}`

      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const list = await res.json()
        const artist = (cfg.artist || '').toLowerCase()
        const picked = (Array.isArray(list) ? list : [])
          .filter(t => t && t.url)
          .filter(t => !artist || String(t.author || '').toLowerCase().includes(artist))
          .slice(0, Number(cfg.limit) || 2)

        this.tracks = picked.length ? picked : (Array.isArray(list) ? list.slice(0, Number(cfg.limit) || 2) : [])
        if (!this.tracks.length) throw new Error('empty playlist')
      } catch (e) {
        // 接口挂了就悄悄隐藏播放器，不影响页面
        this.tracks = []
      } finally {
        this.loading = false
        await this.$nextTick()
        // 歌单就绪后再起播：此时用户往往已经点过开屏，浏览器会把这次播放当作「有交互」
        if (this.autoplay && !this.userPaused) this.playNow()
      }
    },

    /** 首屏任意一次点击 / 按键都可以作为「用户已交互」的解锁信号 */
    bindGesture() {
      if (this.gestureBound) return
      this.gestureBound = true
      this._gestureHandler = () => {
        this.removeGesture()
        if (!this.userPaused && !this.playing) this.playNow()
      }
      document.addEventListener('pointerdown', this._gestureHandler, true)
      document.addEventListener('keydown', this._gestureHandler, true)
    },

    removeGesture() {
      if (this._gestureHandler) {
        document.removeEventListener('pointerdown', this._gestureHandler, true)
        document.removeEventListener('keydown', this._gestureHandler, true)
      }
      this._gestureHandler = null
      this.gestureBound = false
    },

    /** 主动播放一次；被拦截时保持 pending，等下一次手势再试 */
    async playNow() {
      const a = this.$refs.audio
      if (!a) return
      if (!this.tracks.length || !this.current.url) {
        this.pendingPlay = true
        return
      }
      if (this.playing || this._playPending) return
      this._playPending = true
      try {
        await a.play()
        this.pendingPlay = false
        this.autoplayBlocked = false
      } catch (e) {
        this.playing = false
        this.autoplayBlocked = true
        this.pendingPlay = true
        this.bindGesture()
      } finally {
        this._playPending = false
      }
    },

    toggle() {
      const a = this.$refs.audio
      if (!a) return
      if (this.playing) {
        this.userPaused = true
        this.pendingPlay = false
        a.pause()
      } else {
        this.userPaused = false
        this.playNow()
      }
    },
    next() {
      if (!this.tracks.length) return
      this.index = (this.index + 1) % this.tracks.length
      this.$nextTick(() => this.playIfWasPlaying())
    },
    prev() {
      if (!this.tracks.length) return
      this.index = (this.index - 1 + this.tracks.length) % this.tracks.length
      this.$nextTick(() => this.playIfWasPlaying())
    },
    playIfWasPlaying() {
      const a = this.$refs.audio
      if (!a || this.userPaused) return
      a.load()
      this.playNow()
    },
    onTime() {
      const a = this.$refs.audio
      if (!a || !a.duration || !isFinite(a.duration)) return
      this.percent = Math.min(100, (a.currentTime / a.duration) * 100)
    },
    onError() {
      this.playing = false
      // 单曲失效时自动跳下一首（只跳一次，避免死循环）
      if (this.tracks.length > 1 && !this._errorHops) {
        this._errorHops = 1
        this.next()
        setTimeout(() => { this._errorHops = 0 }, 3000)
      }
    },
    onCoverError(e) {
      e.target.src = this.fallbackCover
    }
  }
}
</script>

<style scoped>
.music {
  margin-top: 16px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(122, 102, 214, 0.16);
}

.music-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cover {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(122, 102, 214, 0.22);
  animation: spin 9s linear infinite;
  animation-play-state: paused;
}

.cover.spinning {
  animation-play-state: running;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
}

.meta .title {
  font-size: 12px;
  font-weight: 700;
  color: var(--eden-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta .artist {
  font-size: 10.5px;
  color: var(--eden-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar {
  margin-top: 4px;
  height: 3px;
  border-radius: 3px;
  background: rgba(122, 102, 214, 0.16);
  overflow: hidden;
}

.bar i {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--eden-accent), var(--eden-accent-2));
  transition: width 0.2s linear;
}

.ctrl {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ctrl button {
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 9px;
  line-height: 1;
  color: var(--eden-accent);
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ctrl button:hover {
  background: rgba(122, 102, 214, 0.12);
}

.ctrl .play {
  width: 26px;
  height: 26px;
  font-size: 10px;
  color: #fff;
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
}

.ctrl .play:hover {
  background: linear-gradient(135deg, var(--eden-accent), var(--eden-accent-2));
  opacity: 0.9;
}

@media (max-width: 980px) {
  .music {
    margin-top: 0;
  }
}
</style>
