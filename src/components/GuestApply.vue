<template>
  <Teleport to="body">
    <Transition name="ga">
      <div v-if="modelValue" class="ga" @click.self="close">
        <div class="ga-panel" role="dialog" aria-modal="true" aria-labelledby="ga-title">
          <button class="ga-close" type="button" aria-label="关闭" @click="close">✕</button>

          <p class="ga-kicker">GUEST APPLICATION</p>
          <h1 id="ga-title" class="ga-title">申请成为特邀嘉宾</h1>

          <p class="ga-lead">
            特邀嘉宾不在公会编制里，也不只是挂个名头——是和我们玩得来、聊得来，愿意偶尔过来坐坐的朋友。
            想来的话不用写长篇申请，在群里跟我们说一声就好。
          </p>

          <section class="ga-step">
            <span class="ga-num">01</span>
            <div class="ga-body">
              <h2>加群时写明这四件事</h2>
              <ul class="ga-list">
                <li><b>来意</b><span>为什么想成为特邀嘉宾</span></li>
                <li><b>所属公会</b><span>你现在在哪座公会</span></li>
                <li><b>当前职务</b><span>会长 / 副会长 / 成员，没有就写成员</span></li>
                <li><b>游戏内名称</b><span>进服用的那个 ID</span></li>
              </ul>
            </div>
          </section>

          <section class="ga-step">
            <span class="ga-num">02</span>
            <div class="ga-body">
              <h2>我们会先一起玩几次</h2>
              <p class="ga-text">
                不是面试，也不用准备什么。一起盖点东西、看看机器、在群里聊几句，
                彼此觉得顺，这张椅子就给你留着。
              </p>
            </div>
          </section>

          <div class="ga-note">
            <p>
              特邀的申请会比入会严一些，也慢一些——因为人少，我们想先认识你，再决定邀不邀请。
            </p>
            <p>
              如果最后没能通过，请别急着觉得是自己不够好。大多时候只是我们玩东西的方式、
              对建筑和机器的偏好、对公会的想法不太一样，硬凑在一起反而谁都不自在。
              这和你这个人好不好、玩得行不行，真的没有关系。
            </p>
            <p>
              伊甸的门一直开着。做朋友不需要名分，哪天路过，随时欢迎进来坐坐。
            </p>
          </div>

          <div class="ga-foot">
            <span class="ga-qq-label">公会 QQ 群</span>
            <b class="ga-qq">{{ qq || '—' }}</b>
            <button class="eden-join ga-copy" type="button" @click="copyQq">
              {{ copied ? '已复制' : '复制群号' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  qq: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const copied = ref(false)
let lastOverflow = ''

function close() {
  emit('update:modelValue', false)
}

async function copyQq() {
  if (!props.qq) return
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.qq)
    } else {
      const ta = document.createElement('textarea')
      ta.value = props.qq
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    setTimeout(() => { copied.value = false }, 1600)
  } catch (e) { /* 复制失败就不提示了 */ }
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  open => {
    if (open) {
      lastOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = lastOverflow
      window.removeEventListener('keydown', onKey)
    }
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = lastOverflow
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.ga {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 18px;
  overflow-y: auto;
  background:
    radial-gradient(60% 50% at 20% 10%, rgba(214, 204, 255, 0.5), transparent 70%),
    radial-gradient(60% 50% at 85% 90%, rgba(255, 214, 236, 0.45), transparent 70%),
    rgba(24, 18, 46, 0.52);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.ga-panel {
  position: relative;
  width: 100%;
  max-width: 620px;
  margin: auto;
  padding: 30px 30px 24px;
  border-radius: 22px;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(233, 226, 255, 0.9), transparent 62%),
    radial-gradient(120% 80% at 100% 100%, rgba(255, 232, 244, 0.9), transparent 62%),
    #fffdfa;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 40px 90px rgba(40, 26, 80, 0.42);
}

.ga-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 28px;
  height: 28px;
  font-size: 12px;
  color: var(--eden-muted);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(122, 102, 214, 0.16);
  border-radius: 50%;
  cursor: pointer;
}

.ga-kicker {
  margin: 0 0 6px;
  font-size: 10.5px;
  letter-spacing: 0.3em;
  color: var(--eden-accent-2);
}

.ga-title {
  margin: 0 0 12px;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--eden-ink);
}

.ga-lead {
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 1.85;
  color: var(--eden-ink-2);
}

.ga-step {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.ga-num {
  flex: 0 0 auto;
  font-family: "digitalfont", monospace;
  font-size: 18px;
  line-height: 1.3;
  color: rgba(122, 102, 214, 0.45);
}

.ga-body h2 {
  margin: 0 0 8px;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--eden-ink);
}

.ga-text {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--eden-ink-2);
}

.ga-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ga-list li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 11px;
  font-size: 12.5px;
  color: var(--eden-ink-2);
  background: rgba(255, 255, 255, 0.66);
  border: 1px dashed rgba(122, 102, 214, 0.22);
  border-radius: 10px;
}

.ga-list b {
  flex: 0 0 78px;
  font-weight: 800;
  color: var(--eden-accent);
}

.ga-list span {
  flex: 1;
  min-width: 0;
}

.ga-note {
  margin: 4px 0 18px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 245, 250, 0.9), rgba(243, 240, 255, 0.9));
  border: 1px solid rgba(183, 166, 255, 0.28);
}

.ga-note p {
  margin: 0 0 9px;
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--eden-ink-2);
}

.ga-note p:last-child {
  margin-bottom: 0;
  color: var(--eden-accent);
}

.ga-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px dashed var(--eden-line);
}

.ga-qq-label {
  flex: 0 0 auto;
  font-size: 12px;
  white-space: nowrap;
  color: var(--eden-muted);
}

.ga-qq {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 15px;
  letter-spacing: 0.06em;
  color: var(--eden-accent);
}

.ga-copy {
  flex: 0 0 auto;
  width: auto;
  margin-left: auto;
  padding: 8px 20px;
}

/* 入场 */
.ga-enter-active,
.ga-leave-active {
  transition: opacity 0.42s ease;
}

.ga-enter-active .ga-panel,
.ga-leave-active .ga-panel {
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.42s ease;
}

.ga-enter-from,
.ga-leave-to {
  opacity: 0;
}

.ga-enter-from .ga-panel,
.ga-leave-to .ga-panel {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

@media (max-width: 640px) {
  .ga {
    padding: 16px 12px;
  }

  .ga-panel {
    padding: 24px 18px 18px;
    border-radius: 18px;
  }

  .ga-title {
    font-size: 24px;
  }

  .ga-list b {
    flex-basis: 66px;
  }

  .ga-foot {
    flex-wrap: wrap;
  }

  .ga-copy {
    width: 100%;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ga-enter-active,
  .ga-leave-active,
  .ga-enter-active .ga-panel,
  .ga-leave-active .ga-panel {
    transition: none;
  }
}
</style>
