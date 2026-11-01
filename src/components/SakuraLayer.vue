<template>
  <canvas ref="canvas" class="sakura-layer" aria-hidden="true"></canvas>
</template>

<script>
/**
 * 漫天下落的樱花：canvas 绘制，数量按屏幕宽度自适应，
 * 页面切到后台时自动暂停，系统开启「减少动态效果」时只画静止少量花瓣。
 */
const COLORS = ['#ffd7e6', '#ffc2d9', '#ffe6f1', '#f8bcd6', '#ffd9c9']

export default {
  name: 'SakuraLayer',
  data() {
    return { petals: [], raf: 0, last: 0 }
  },
  mounted() {
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext('2d')
    this.resize()
    this.initPetals()
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)

    if (!this.reduce) this.raf = requestAnimationFrame(this.loop)
    else this.drawStatic()
  },
  beforeUnmount() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
  },
  methods: {
    onResize() {
      this.resize()
      this.initPetals()
      if (this.reduce) this.drawStatic()
    },
    onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(this.raf)
        this.raf = 0
      } else if (!this.reduce && !this.raf) {
        this.last = 0
        this.raf = requestAnimationFrame(this.loop)
      }
    },
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      this.w = window.innerWidth
      this.h = window.innerHeight
      this.canvas.width = Math.floor(this.w * dpr)
      this.canvas.height = Math.floor(this.h * dpr)
      this.canvas.style.width = this.w + 'px'
      this.canvas.style.height = this.h + 'px'
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    initPetals() {
      const count = this.w < 640 ? 14 : this.w < 1100 ? 26 : 38
      this.petals = Array.from({ length: count }, () => this.makePetal(true))
    },
    makePetal(spread) {
      return {
        x: Math.random() * this.w,
        y: spread ? Math.random() * this.h : -20 - Math.random() * 80,
        size: 5 + Math.random() * 6,
        vy: 0.35 + Math.random() * 0.55,
        vx: -0.25 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        spin: (-0.012 + Math.random() * 0.024) || 0.01,
        sway: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        speedPhase: 0.006 + Math.random() * 0.01,
        opacity: 0.45 + Math.random() * 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }
    },
    loop(ts) {
      this.raf = requestAnimationFrame(this.loop)
      if (ts - this.last < 1000 / 45) return
      this.last = ts

      const ctx = this.ctx
      ctx.clearRect(0, 0, this.w, this.h)

      for (const p of this.petals) {
        p.phase += p.speedPhase
        p.y += p.vy
        p.x += p.vx + Math.sin(p.phase) * p.sway * 0.35
        p.angle += p.spin

        if (p.y > this.h + 30 || p.x < -60 || p.x > this.w + 60) {
          Object.assign(p, this.makePetal(false))
          p.y = -20
          p.x = Math.random() * this.w
        }

        this.drawPetal(p)
      }
    },
    drawPetal(p) {
      const ctx = this.ctx
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      ctx.beginPath()
      // 一片花瓣：上尖下圆
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.5, p.size * 0.75, p.size * 0.7, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.75, p.size * 0.7, -p.size * 0.9, -p.size * 0.5, 0, -p.size)
      ctx.fill()
      ctx.restore()
    },
    drawStatic() {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.w, this.h)
      this.petals = this.petals.slice(0, 12)
      this.petals.forEach(p => this.drawPetal(p))
    }
  }
}
</script>

<style scoped>
.sakura-layer {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
