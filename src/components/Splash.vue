<template>
  <div
    class="splash"
    :class="{ 'is-leaving': leaving }"
    :style="{ '--splash-bg': `url('${image}')` }"
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
    image: { type: String, default: '' }
  },
  emits: ['enter'],
  data() {
    return { leaving: false }
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
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
  opacity: 0;
  filter: drop-shadow(4px 4px 14px rgba(0, 0, 0, 0.45));
  transition: left 0.6s ease, right 0.6s ease, opacity 0.6s ease;
  pointer-events: none;
}

.splash-slice::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--splash-bg);
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

.splash:hover .s1 { left: -58%; }
.splash:hover .s2 { left: -66%; }
.splash:hover .s3 { right: -59%; }
.splash:hover .s4 { right: -67%; }

.splash:hover .splash-slice {
  opacity: 0.55;
}

/* 压一层暗角，保证文字清楚 */
.splash-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, rgba(8, 10, 28, 0.18) 0%, rgba(8, 10, 28, 0.55) 100%),
    linear-gradient(180deg, rgba(8, 10, 28, 0.35), rgba(8, 10, 28, 0.15) 40%, rgba(8, 10, 28, 0.45));
}

/* 文字 */
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
}

.kicker {
  margin: 0 0 14px;
  font-size: 11px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  color: rgba(255, 255, 255, 0.72);
  opacity: 0;
  animation: riseIn 0.9s ease 0.15s forwards;
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
  opacity: 0;
  animation: riseIn 1s ease 0.3s forwards;
}

.sub {
  margin: 12px 0 0;
  font-size: 12px;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  animation: riseIn 1s ease 0.55s forwards;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  .sub {
    font-size: 11px;
  }
  .hint {
    bottom: 26px;
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-art,
  .kicker,
  .title,
  .sub,
  .hint {
    animation: none;
    opacity: 1;
  }
}
</style>
