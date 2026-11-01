/**
 * v-reveal：滚动进入视口时轻轻浮现。
 * 用法：<section v-reveal>  或  <div v-reveal="{ delay: 120 }">
 */
export const reveal = {
  mounted(el, binding) {
    const delay = (binding.value && binding.value.delay) || 0
    el.classList.add('reveal')
    if (delay) el.style.transitionDelay = delay + 'ms'

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
    )

    io.observe(el)
    el.__revealObserver = io
  },
  unmounted(el) {
    if (el.__revealObserver) el.__revealObserver.disconnect()
  }
}

export default reveal
