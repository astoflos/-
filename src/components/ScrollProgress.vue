<template>
  <div class="scroll-progress" aria-hidden="true">
    <i :style="{ transform: 'scaleX(' + progress + ')' }"></i>
  </div>
</template>

<script>
export default {
  name: 'ScrollProgress',
  data() {
    return { progress: 0, raf: 0 }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)
    cancelAnimationFrame(this.raf)
  },
  methods: {
    onScroll() {
      // 手机端不显示顶部彩条，也就不用算进度
      if (typeof window !== 'undefined' && window.innerWidth <= 760) return
      if (this.raf) return
      this.raf = requestAnimationFrame(() => {
        this.raf = 0
        const h = document.documentElement.scrollHeight - window.innerHeight
        this.progress = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0
      })
    }
  }
}
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 55;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.35);
}

/* 手机端隐藏顶部彩条 */
@media (max-width: 760px) {
  .scroll-progress {
    display: none;
  }
}

.scroll-progress i {
  display: block;
  height: 100%;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, #ffb08c, #ef9ac1, #b7a6ff, #86c3ff, #6fd0bd);
  box-shadow: 0 0 12px rgba(239, 154, 193, 0.55);
}
</style>
