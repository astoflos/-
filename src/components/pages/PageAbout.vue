<template>
  <div>
    <section class="card" v-reveal>
      <h2 class="card-title" style="font-size: 19px;">{{ config.guild.name }} · {{ config.guild.en }}</h2>
      <p class="card-sub" style="margin-bottom: 6px;">{{ config.guild.slogan }}</p>
      <p class="about-text">{{ config.guild.intro }}</p>
      <div class="hero-meta">
        <span class="tag">成立 {{ config.guild.founded }}</span>
        <span class="tag">{{ config.server.name }} · {{ config.server.version }}</span>
        <span class="tag">主玩 {{ config.server.feature }}</span>
      </div>
    </section>

    <section class="section" v-reveal="{ delay: 60 }">
      <div class="section-head">
        <i class="bar"></i>
        <h2>公会印象</h2>
        <span>GALLERY</span>
      </div>
      <div class="gallery" :class="{ 'is-flower': mobile }">
        <figure
          class="polaroid"
          v-for="(shot, i) in shots"
          :key="shot.src"
          :style="petal(i)"
          @click="openShot(shot)"
        >
          <img :src="shot.src" :alt="shot.cap" loading="lazy" />
          <figcaption>{{ shot.cap }}</figcaption>
        </figure>
      </div>

      <div class="card">
        <h3 class="card-title">一块地，一群人</h3>
        <p class="card-sub">
          白天各忙各的，晚上在主城碰头。有人在盖塔，有人在修机器，也有人只是坐在屋顶看云。
        </p>
        <p class="card-sub" style="margin-bottom: 0;">
          我们没什么宏大的目标，只是想把这片方块世界，过得像家一点。
        </p>
      </div>
    </section>

    <section class="section" v-reveal>
      <div class="section-head">
        <i class="bar"></i>
        <h2>公会守则</h2>
        <span>RULES</span>
      </div>
      <div class="card">
        <div class="rule" v-for="(r, i) in config.rules" :key="r">
          <span class="idx">{{ i + 1 }}</span>
          <span>{{ r }}</span>
        </div>
      </div>
    </section>

    <section class="section" v-reveal="{ delay: 60 }">
      <div class="section-head">
        <i class="bar"></i>
        <h2>我们走过的路</h2>
        <span>MILESTONES</span>
      </div>
      <div class="card">
        <div class="timeline">
          <div class="tl" v-for="m in config.milestones" :key="m.title">
            <time>{{ m.date }}</time>
            <h4>{{ m.title }}</h4>
            <p>{{ m.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" v-reveal="{ delay: 120 }">
      <div class="section-head">
        <i class="bar"></i>
        <h2>找到我们</h2>
        <span>CONTACT</span>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <h3 class="card-title">联系方式</h3>
          <div class="contact-row" v-for="c in config.contacts" :key="c.label">
            <v-icon size="16">{{ c.icon }}</v-icon>
            <span>{{ c.label }}</span>
            <em>{{ c.value }}</em>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">加入我们</h3>
          <p class="card-sub">{{ config.join.note }}</p>
          <button class="eden-join" type="button" @click="$emit('join')">查看加入流程</button>
        </div>
      </div>
    </section>

    <div class="footer">
      <span v-for="line in config.statement" :key="line">{{ line }}<br /></span>
      <span>本站由公会成员维护 · 与服务器官方无关</span>
    </div>

    <!-- 手机端点开花瓣看大图 -->
    <v-dialog v-model="dialogShot" max-width="520">
      <div v-if="currentShot" class="shot-card">
        <img :src="currentShot.src" :alt="currentShot.cap" />
        <p class="shot-cap">{{ currentShot.cap }}</p>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  configdata: { type: Object, required: true }
})

defineEmits(['join'])

const config = computed(() => props.configdata)

/* 公会印象：白框相片墙；手机端排成五瓣花 */
const shots = [
  { src: '/img/site/postcard.jpg', cap: '伊甸 · 某个下午', rot: -2.6 },
  { src: '/img/site/gallery-1.jpg', cap: '云上来客', rot: 2.2 },
  { src: '/img/site/gallery-2.jpg', cap: '夜航', rot: -1.8 },
  { src: '/img/site/gallery-3.jpg', cap: '旧塔', rot: 2.8 },
  { src: '/img/site/gallery-4.jpg', cap: '风来的方向', rot: -2.2 }
]

const mobile = ref(false)
let mq = null
const onMq = e => { mobile.value = e.matches }

onMounted(() => {
  mq = window.matchMedia('(max-width: 760px)')
  mobile.value = mq.matches
  if (mq.addEventListener) mq.addEventListener('change', onMq)
  else if (mq.addListener) mq.addListener(onMq)
})

onBeforeUnmount(() => {
  if (!mq) return
  if (mq.removeEventListener) mq.removeEventListener('change', onMq)
  else if (mq.removeListener) mq.removeListener(onMq)
})

/* 五瓣花：以中心为圆心，每 72° 放一张，半径 29%（36% 宽的卡片，不会出屏） */
const FLOWER_R = 31
function petal(i) {
  const base = { '--rot': shots[i].rot + 'deg', transitionDelay: i * 50 + 'ms' }
  if (!mobile.value) return base
  const angle = ((-90 + i * 72) * Math.PI) / 180
  return {
    ...base,
    left: (50 + FLOWER_R * Math.cos(angle)).toFixed(2) + '%',
    top: (50 + FLOWER_R * Math.sin(angle)).toFixed(2) + '%'
  }
}

const dialogShot = ref(false)
const currentShot = ref(null)
function openShot(shot) {
  if (!mobile.value) return
  currentShot.value = shot
  dialogShot.value = true
}
</script>

<style scoped>
.about-text {
  margin: 10px 0;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--eden-ink-2);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
  align-items: start;
}

.polaroid {
  margin: 0;
  padding: 8px 8px 30px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 14px 30px rgba(103, 84, 160, 0.2);
  transform: rotate(var(--rot, 0deg));
  transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.45s ease;
}

.polaroid:hover {
  transform: rotate(0deg) translateY(-6px) scale(1.03);
  box-shadow: 0 22px 44px rgba(103, 84, 160, 0.3);
}

.polaroid img {
  width: 100%;
  display: block;
  border-radius: 3px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.polaroid figcaption {
  margin-top: 8px;
  text-align: center;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--eden-muted);
}

@media (max-width: 1100px) {
  .gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

/* 手机端：五张照片排成一朵花，点开看大图 */
@media (max-width: 760px) {
  .gallery.is-flower {
    position: relative;
    display: block;
    width: min(90vw, 340px);
    height: min(90vw, 340px);
    margin: 6px auto 18px;
  }

  .is-flower .polaroid {
    position: absolute;
    width: 34%;
    margin: 0;
    padding: 5px 5px 18px;
    transform: translate(-50%, -50%) rotate(var(--rot));
    box-shadow: 0 10px 22px rgba(103, 84, 160, 0.24);
  }

  .is-flower .polaroid:hover,
  .is-flower .polaroid:active {
    transform: translate(-50%, -50%) rotate(var(--rot));
    box-shadow: 0 10px 22px rgba(103, 84, 160, 0.24);
  }

  .is-flower .polaroid figcaption {
    margin-top: 4px;
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 点开花瓣后的大图 */
.shot-card {
  padding: 10px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(60, 44, 110, 0.3);
}

.shot-card img {
  display: block;
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 10px;
}

.shot-cap {
  margin: 10px 0 2px;
  text-align: center;
  font-family: "myfont", "STXingkai", "华文行楷", cursive;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--eden-muted);
}
</style>
