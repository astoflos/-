<template>
  <div
    class="splash"
    :class="{ 'is-leaving': leaving, 'is-armed': armed }"
    :style="{ '--splash-bg': `url('${image}')`, '--door-img': `url('${doors}')` }"
    role="button"
    tabindex="0"
    aria-label="进入伊甸园公会主页"
    @click="enter"
    @keydown.enter.prevent="enter"
    @keydown.space.prevent="enter"
  >
    <div class="splash-art"></div>

    <div class="splash-slice s1"></div>
    <div class="splash-slice s2"></div>
    <div class="splash-slice s3"></div>
    <div class="splash-slice s4"></div>

    <div class="splash-shade"></div>

    <div class="splash-content">
      <p class="kicker">EDEN GUILD</p>
      <h1 class="title">循此踏入伊甸</h1>
      <p class="sub">铃兰花圃 · 伊甸园</p>
      <p class="hint">点击任意处进入</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EdenSplash',
  props: {
    image: { type: String, default: '' },
    doors: { type: String, default: '' } // 兼容旧参数，当前版本不使用
  },
  emits: ['enter'],
  data() {
    return { leaving: false, armed: false, armTimer: null }
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', this.onKey)

    // 刚打开时无论鼠标在哪都保持收拢；用户动一下鼠标后才允许悬停展开
    this.armTimer = setTimeout(() => {
      window.addEventListener('pointermove', this.onArm, { once: true, passive: true })
    }, 400)
  },
  beforeUnmount() {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', this.onKey)
    window.removeEventListener('pointermove', this.onArm)
    clearTimeout(this.armTimer)
  },
  methods: {
    onArm() {
      this.armed = true
    },
    onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') this.enter()
    },
    enter() {
      if (this.leaving) return
      this.leaving = true
      document.body.style.overflow = ''
      setTimeout(() => this.$emit('enter'), 700)
    }
  }
}
</script>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 60;
  overflow: hidden;
  background: #0b1024;
  cursor: pointer;
  outline: none;
  transition: opacity 0.7s ease, filter 0.7s ease;
}

.splash.is-leaving {
  opacity: 0;
  filter: blur(12px);
  pointer-events: none;
}

/* 底层完整图片 */
.splash-art {
  position: absolute;
  inset: 0;
  background-image: var(--splash-bg);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
  animation: artIn 1.6s ease forwards;
  filter: brightness(0.86) saturate(1.05);
}

@keyframes artIn {
  from { transform: scale(1.08); }
  to { transform: scale(1.02); }
}

/* 四块「碎裂」裁切层：静止时很淡，悬停时散开 */
.splash-slice {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.72;
  filter: drop-shadow(4px 4px 14px rgba(0, 0, 0, 0.45));
  transition: left 0.6s ease, right 0.6s ease, opacity 0.6s ease;
  pointer-events: none;
}

.splash-slice::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--door-img);
  background-size: cover;
  background-position: center;
  filter: brightness(0.95);
}

.s1 { left: -40%; transform: rotateZ(100deg); }
.s1::after { transform: rotateZ(-100deg); }

.s2 { left: -40%; transform: rotateZ(-100deg); }
.s2::after { transform: rotateZ(100deg); }

.s3 { right: -40%; transform: rotateZ(105deg); }
.s3::after { transform: rotateZ(-105deg); }

.s4 { right: -40%; transform: rotateZ(-100deg); }
.s4::after { transform: rotateZ(100deg); }

.splash.is-armed:hover .s1 { left: -58%; }
.splash.is-armed:hover .s2 { left: -66%; }
.splash.is-armed:hover .s3 { right: -59%; }
.splash.is-armed:hover .s4 { right: -67%; }

.splash.is-armed:hover .splash-slice {
  opacity: 0.92;
}

/* 暗角 + 中心压暗，保证文字清楚 */
.splash-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, rgba(8, 10, 28, 0.18) 0%, rgba(8, 10, 28, 0.55) 100%),
    linear-gradient(180deg, rgba(8, 10, 28, 0.35), rgba(8, 10, 28, 0.15) 40%, rgba(8, 10, 28, 0.45));
}

/* 文字：没展开时完全不显示，幕布拉开的过程中逐渐浮现 */
.splash-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  pointer-events: none;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 1.05s ease 0.12s, transform 1.05s cubic-bezier(0.22, 0.61, 0.36, 1) 0.12s;
}

.splash.is-armed:hover .splash-content {
  opacity: 1;
  transform: none;
}

/* 触屏没有 hover：直接显示文字，否则进不去 */
@media (hover: none) {
  .splash-content {
    opacity: 1;
    transform: none;
  }
}

.kicker {
  margin: 0 0 14px;
  font-size: 11px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  color: rgba(255, 255, 255, 0.72);
}

.title {
  margin: 0;
  font-family: "myfont", "STXingkai", "华文行楷", "KaiTi", cursive;
  font-size: clamp(34px, 6.4vw, 66px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 0.14em;
  text-indent: 0.14em;
  color: #f6f2ff;
  text-shadow: 0 2px 22px rgba(0, 0, 0, 0.6);
}

.sub {
  margin: 12px 0 0;
  font-size: 12px;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: rgba(255, 255, 255, 0.6);
}


.hint {
  position: absolute;
  bottom: 34px;
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.55);
  animation: hintFloat 2.4s ease-in-out infinite;
}

@keyframes hintFloat {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-4px); opacity: 0.9; }
}

@media (max-width: 640px) {
  .title {
    font-size: 32px;
    letter-spacing: 0.1em;
    text-indent: 0.1em;
  }
  .sub { font-size: 11px; }
  .hint { bottom: 26px; font-size: 11px; }
}

@media (prefers-reduced-motion: reduce) {
  .splash-content {
    transition: none;
  }
  .splash-art {
    animation: none;
  }
  .splash-slice {
    transition: none;
  }
}
</style>
