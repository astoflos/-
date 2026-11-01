<template>
  <div ref="glow" class="cursor-glow" aria-hidden="true"></div>
</template>

<script>
export default {
  name: 'CursorGlow',
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    this.el = this.$refs.glow
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    this.pos = { ...this.target }
    this.el.style.opacity = '1'

    window.addEventListener('pointermove', this.onMove, { passive: true })
    this.raf = requestAnimationFrame(this.tick)
  },
  beforeUnmount() {
    window.removeEventListener('pointermove', this.onMove)
    cancelAnimationFrame(this.raf)
  },
  methods: {
    onMove(e) {
      this.target.x = e.clientX
      this.target.y = e.clientY
    },
    tick() {
      this.raf = requestAnimationFrame(this.tick)
      this.pos.x += (this.target.x - this.pos.x) * 0.12
      this.pos.y += (this.target.y - this.pos.y) * 0.12
      this.el.style.transform = `translate3d(${this.pos.x - 240}px, ${this.pos.y - 240}px, 0)`
    }
  }
}
</script>

<style scoped>
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  background: radial-gradient(
    circle,
    rgba(239, 154, 193, 0.22) 0%,
    rgba(183, 166, 255, 0.16) 38%,
    rgba(134, 195, 255, 0.08) 62%,
    transparent 72%
  );
  filter: blur(18px);
  will-change: transform;
}
</style>
