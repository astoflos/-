<template>
  <Teleport to="body">
    <Transition name="egg-shell">
      <div
        v-if="modelValue"
        ref="root"
        class="egg"
        :class="{ 'is-closing': closing }"
        role="dialog"
        aria-modal="true"
        aria-label="彩蛋"
        tabindex="-1"
        @click="onClick"
      >
        <video class="egg-video" :src="videoSrc" autoplay muted loop playsinline preload="auto"></video>

        <div class="egg-veil" aria-hidden="true"></div>

        <!-- 满天飘的诗句：结构和参考页一致，每句都是一个会转的竖排字条 -->
        <div class="container" aria-hidden="true">
          <div
            v-for="(w, i) in words"
            :key="i"
            class="word-box"
            :style="{
              '--margin-top': w.mt + 'vh',
              '--animation-duration': w.dur + 's',
              '--animation-delay': w.delay + 's'
            }"
          >
            <div class="word" :style="{ '--margin-left': w.ml + 'vw' }">{{ w.text }}</div>
          </div>
        </div>

        <div class="egg-stage">
          <Transition name="egg-page" mode="out-in">
            <div v-if="page === 1" key="p1" class="egg-page">
              <h1 class="egg-title">{{ big }}<i v-if="typing === 'big'" class="caret"></i></h1>
              <p class="egg-sub">{{ sub }}<i v-if="typing === 'sub'" class="caret"></i></p>
            </div>

            <div v-else key="p2" class="egg-page">
              <p class="egg-line">{{ line2 }}<i v-if="typing === 'line2'" class="caret"></i></p>
              <Transition name="egg-hint">
                <p v-if="hint" class="egg-hint">点击任意键继续</p>
              </Transition>
            </div>
          </Transition>
        </div>

        <p class="egg-brand" aria-hidden="true">EDEN GUILD</p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'closed'])

const root = ref(null)

// 用变量而不是写在 src 上：写死的话 Vite 会把它当静态资源提前 import，进站就拉 8MB
const videoSrc = '/video/starry-night.mp4'

/* ---------------- 文案 ---------------- */
const TITLE = '伊甸园'
const SUB = '恭喜你发现了彩蛋'
const LINE2 = '今夜整片夜空将会为你闪烁'

const page = ref(1)
const big = ref('')
const sub = ref('')
const line2 = ref('')
const typing = ref('')
const hint = ref(false)
const done = ref(false)

/* ---------------- 满天飘的诗句（沿用参考页那份） ---------------- */
const POEMS = [
  '伤心桥下春波绿',
  '曾是惊鸿照影来',
  '当年明月在',
  '曾照彩云归',
  '归去来兮',
  '真堪偕隐',
  '画船听雨眠',
  '愿为江水',
  '与君重逢',
  '一日不见兮',
  '思之若狂',
  '好想回到那个夏天',
  '趴在桌子上偷偷看你',
  '偷偷表白一个叫dmz的女孩',
  '你曾是我灰色人生中的一道彩虹',
  '柳絮空缱绻',
  '南风知不知',
  '我见青山多妩媚',
  '料青山见我也应如是',
  '取次花丛懒回顾',
  '半缘修道半缘君',
  '三笑徒然当一痴',
  '人生若只如初见',
  '我余光中都是你',
  '人生自是有情痴',
  '此恨不关风与月',
  '因为你，我多少适应了这个世界',
  '春蚕到死丝方尽',
  '蜡炬成灰泪始干',
  '今夜何夕',
  '见此良人',
  '愿我如星君如月',
  '夜夜流光相皎洁',
  '情不所起',
  '一往而深',
  '玲珑骰子安红豆',
  '入骨相思知不知',
  '多情只有春庭月',
  '尤为离人照落花',
  '若有知音见采',
  '不辞唱遍阳春',
  '休言半纸无多重',
  '万斛离愁尽耐担',
  '夜月一帘幽梦',
  '和光同尘',
  '杳霭流玉',
  '月落星沉',
  '霞姿月韵',
  '喜上眉梢',
  '醉后不知天在水',
  '满船星梦压星河',
  '落花人独立',
  '微雨燕双飞',
  '掬水月在手',
  '弄花香满衣',
  '夜深忽梦少年事',
  '唯梦闲人不梦君',
  '垆边人似月',
  '皓腕凝霜雪',
  '众里嫣然通一顾',
  '人间颜色如尘土',
  '若非群玉山头见',
  '会向瑶台月下逢',
  '沉鱼落雁鸟惊喧',
  '羞花闭月花愁颤',
  '解释春风无限恨',
  '沉香亭北倚阑干'
]

/** 和参考页一样的随机数：返回两位小数的字符串 */
function randomNum(min, max) {
  return (Math.random() * (max - min + 1) + min).toFixed(2)
}

// 每次打开位置都重新随机，和参考页 init() 的行为一致
const words = ref([])

function initWords() {
  words.value = POEMS.map(text => ({
    text,
    mt: randomNum(-40, 20),
    ml: randomNum(6, 35),
    dur: randomNum(8, 20),
    delay: randomNum(-20, 0)
  }))
}

/* ---------------- 打字机节奏 ---------------- */
let runToken = 0
let timers = []
let lastOverflow = ''

const wait = ms => new Promise(resolve => {
  const id = setTimeout(resolve, ms)
  timers.push(id)
})

function clearAll() {
  runToken++
  timers.forEach(t => clearTimeout(t))
  timers = []
}

/** 一个字一个字往外吐 */
async function typeInto(text, setter, speed, alive) {
  setter('')
  for (let i = 1; i <= text.length; i++) {
    if (!alive()) return
    setter(text.slice(0, i))
    await wait(speed)
  }
}

async function play() {
  clearAll()
  const token = runToken
  const alive = () => token === runToken

  initWords()
  closing.value = false

  page.value = 1
  big.value = ''
  sub.value = ''
  line2.value = ''
  hint.value = false
  done.value = false

  typing.value = 'big'
  await typeInto(TITLE, v => { big.value = v }, 340, alive)
  if (!alive()) return

  await wait(360)
  typing.value = 'sub'
  await typeInto(SUB, v => { sub.value = v }, 140, alive)
  if (!alive()) return
  typing.value = ''

  // 第一页停留一会儿，再整页淡出
  await wait(1800)
  if (!alive()) return

  page.value = 2
  await wait(1250)
  if (!alive()) return

  typing.value = 'line2'
  await typeInto(LINE2, v => { line2.value = v }, 140, alive)
  if (!alive()) return
  typing.value = ''

  await wait(700)
  if (!alive()) return

  // 提示一出现就能点，别让人等
  hint.value = true
  done.value = true
}

const closing = ref(false)

function close() {
  if (closing.value) return
  closing.value = true

  // 先让文字、诗句和星空自己淡掉，再整体收走，避免直接“啪”一下切回主页
  timers.push(setTimeout(() => {
    emit('update:modelValue', false)
    emit('closed')
  }, 1100))
}

function onClick() {
  if (done.value && !closing.value) close()
}

function onKey(e) {
  if (!props.modelValue) return
  if (done.value && !closing.value) {
    e.preventDefault()
    close()
  }
}

watch(
  () => props.modelValue,
  open => {
    if (open) {
      lastOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
      play()
      requestAnimationFrame(() => root.value && root.value.focus())
    } else {
      clearAll()
      document.body.style.overflow = lastOverflow
      window.removeEventListener('keydown', onKey)
    }
  }
)

onBeforeUnmount(() => {
  clearAll()
  document.body.style.overflow = lastOverflow
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.egg {
  position: fixed;
  inset: 0;
  z-index: 300;
  overflow: hidden;
  outline: none;
  cursor: default;
  background: radial-gradient(ellipse at 50% 38%, #101a33 0%, #05070f 58%, #01020a 100%);
}

.egg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.egg-veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 45%,
    rgba(4, 6, 16, 0.06) 0%,
    rgba(3, 5, 12, 0.42) 55%,
    rgba(2, 3, 8, 0.72) 100%);
}

/* ---------------- 满天飘的诗句（结构/动画照搬参考页） ---------------- */
.container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  /* 透视放在这一层；不加 preserve-3d，字的 3D 就关在这一层里，
     不会跑到中间文字上方去 */
  perspective: 1300px;
  z-index: 0;
}

.word-box,
.word-box .word {
  position: absolute;
  animation: rotY 0s linear infinite;
  animation-duration: var(--animation-duration);
  animation-delay: var(--animation-delay);
  transform-style: preserve-3d;
}

.word-box {
  top: 50%;
  left: 50%;
  margin-top: var(--margin-top);
}

.word-box .word {
  top: 0;
  left: 0;
  margin-left: var(--margin-left);
  font-family: '楷体', 'KaiTi', 'STXingkai', '华文行楷', cursive;
  font-size: 20px;
  color: #baabda;
}

@keyframes rotY {
  to { transform: rotateY(360deg); }
}

/* ---------------- 中间文字 ---------------- */
.egg-stage {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  text-align: center;
  pointer-events: none;
}

/* 中间压一层很淡的暗底，保证诗多的时候字还看得清 */
.egg-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(ellipse 42% 26% at 50% 50%,
    rgba(3, 5, 12, 0.72) 0%,
    rgba(3, 5, 12, 0.42) 46%,
    transparent 72%);
}

.egg-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.egg-title {
  margin: 0;
  font-family: "myfont", "STXingkai", "华文行楷", "KaiTi", cursive;
  font-size: clamp(52px, 7.4vw, 92px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: #f4f8ff;
  text-shadow: 0 0 38px rgba(160, 190, 255, 0.6), 0 4px 24px rgba(0, 0, 0, 0.65);
}

.egg-sub {
  margin: 0;
  min-height: 1.4em;
  font-family: "myfont", "STXingkai", "华文行楷", "KaiTi", cursive;
  font-size: 26px;
  letter-spacing: 0.18em;
  text-indent: 0.18em;
  color: #dfe9ff;
  text-shadow: 0 0 22px rgba(137, 168, 255, 0.5), 0 2px 16px rgba(0, 0, 0, 0.6);
}

.egg-line {
  margin: 0;
  min-height: 1.4em;
  font-family: "myfont", "STXingkai", "华文行楷", "KaiTi", cursive;
  font-size: clamp(26px, 2.6vw, 38px);
  letter-spacing: 0.14em;
  text-indent: 0.14em;
  color: #e8f9fd;
  text-shadow: 0 0 26px rgba(137, 168, 255, 0.55), 0 2px 18px rgba(0, 0, 0, 0.6);
}

.egg-hint {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  color: rgba(226, 238, 255, 0.85);
  text-shadow: 0 0 14px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.9);
  animation: eggBlink 4.6s ease-in-out infinite;
}

@keyframes eggBlink {
  0%, 100% { opacity: 0.42; }
  50% { opacity: 0.92; }
}

/* 光标 */
.caret {
  display: inline-block;
  width: 2px;
  height: 0.86em;
  margin-left: 0.08em;
  vertical-align: -0.06em;
  background: currentColor;
  animation: caretBlink 1.05s steps(1) infinite;
}

@keyframes caretBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.egg-brand {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  margin: 0;
  font-size: 9.5px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  color: rgba(190, 205, 255, 0.3);
  pointer-events: none;
}

/* ---------------- 过渡 ---------------- */

/* 退出：文字先虚掉、诗句向外散开、星空淡去，最后整页收走 */
.egg.is-closing .egg-stage {
  opacity: 0;
  filter: blur(8px);
  transform: scale(0.97);
  transition: opacity 1.1s ease, filter 1.1s ease, transform 1.2s ease;
}

.egg.is-closing .container {
  opacity: 0;
  transform: scale(1.12);
  transition: opacity 1.2s ease, transform 1.5s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.egg-page-enter-active {
  transition: opacity 1.5s ease, filter 1.5s ease;
}

.egg-page-leave-active {
  transition: opacity 1.2s ease, filter 1.2s ease;
}

.egg-page-enter-from,
.egg-page-leave-to {
  opacity: 0;
  filter: blur(10px);
}

.egg-hint-enter-active {
  transition: opacity 1.8s ease;
}

.egg-hint-enter-from {
  opacity: 0;
}

.egg-shell-enter-active {
  transition: opacity 0.9s ease;
}

/* 出场时内容已经淡掉了，这里把整屏星空和主页交叉淡出，不留黑场 */
.egg-shell-leave-active {
  transition: opacity 1s ease;
}

.egg-shell-enter-from,
.egg-shell-leave-to {
  opacity: 0;
}

@media (max-height: 620px) {
  .egg-title { font-size: 52px; }
  .egg-sub { font-size: 20px; }
  .egg-line { font-size: 24px; }
  .egg-page { gap: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  /* 站点全局有一条 `* { animation-duration: 0.001ms !important }`，
     会把这一页的旋转也压成不动（字就全堆在右半边）。
     彩蛋本身就是动画，这里用更高优先级把它盖回正常速度。 */
  .word-box,
  .word-box .word {
    animation-duration: var(--animation-duration) !important;
    animation-delay: var(--animation-delay) !important;
  }

  .egg-hint {
    animation: none;
    opacity: 0.8;
  }
}
</style>

