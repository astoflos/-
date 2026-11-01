<template>
  <p class="typer">
    <span class="quote">“</span><span ref="text" class="text"></span><span class="quote">”</span>
  </p>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TypeIt from 'typeit'

const props = defineProps({
  strings: { type: Array, default: () => [] }
})

const text = ref(null)
let inst = null

onMounted(() => {
  if (!props.strings || !props.strings.length || !text.value) return
  inst = new TypeIt(text.value, {
    strings: props.strings,
    speed: 85,
    lifeLike: true,
    breakLines: false,
    loop: true,
    cursorChar: '|',
    cursor: true
  }).go()
})

onBeforeUnmount(() => {
  try { if (inst) inst.destroy() } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.typer {
  margin: 0;
  min-height: 28px;
  font-size: 18px;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--eden-accent);
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
}

.quote {
  opacity: 0.55;
}

@media (max-width: 640px) {
  .typer {
    font-size: 15px;
    min-height: 24px;
  }
}
</style>
