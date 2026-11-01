/**
 * v-tilt：鼠标在卡片上移动时轻微 3D 倾斜，并有一团跟着鼠标的高光。
 * 触屏 / 减少动态效果时自动不启用。
 */
export const tilt = {
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const max = (binding.value && binding.value.max) || 5
    el.classList.add('tilt')

    const move = e => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform =
        `perspective(760px) rotateX(${(-py * max).toFixed(2)}deg) ` +
        `rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`
      el.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%')
      el.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%')
    }

    const leave = () => {
      el.style.transform = ''
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.__tilt = { move, leave }
  },
  unmounted(el) {
    if (!el.__tilt) return
    el.removeEventListener('pointermove', el.__tilt.move)
    el.removeEventListener('pointerleave', el.__tilt.leave)
  }
}

export default tilt
