<template>
  <div class="eden-app">
    <Splash v-if="showSplash" :image="configdata.splashImage" @enter="onEnter" />

    <v-app>
      <div class="app-shell">
        <aside class="eden-side">
          <img class="eden-logo" :src="configdata.logo" alt="伊甸园 Eden" />

          <div class="eden-side-head">
            <h1 class="eden-title">{{ configdata.guild.name }}<span>{{ configdata.guild.en }}</span></h1>
            <p class="eden-sub">
              {{ configdata.server.name }} · {{ configdata.server.version }} · {{ configdata.server.feature }}
            </p>
            <p class="eden-motto">{{ configdata.guild.motto }}</p>
          </div>

          <nav class="eden-nav">
            <button
              v-for="item in configdata.nav"
              :key="item.key"
              type="button"
              :class="{ active: view === item.key }"
              @click="go(item.key)"
            >
              <v-icon size="18">{{ item.icon }}</v-icon>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <MusicPlayer v-if="configdata.music && configdata.music.enable !== false" :music="configdata.music" />

          <div class="eden-side-foot">
            <div class="eden-contacts">
              <a
                v-for="c in configdata.contacts"
                :key="c.label"
                class="contact-row"
                :href="c.link || undefined"
                :target="c.link ? '_blank' : undefined"
                rel="noopener"
              >
                <v-icon size="15">{{ c.icon }}</v-icon>
                <span>{{ c.label }}</span>
                <em>{{ c.value }}</em>
              </a>
            </div>
            <button class="eden-join" type="button" @click="dialogJoin = true">加入我们</button>
          </div>
        </aside>

        <main class="eden-main">
          <section class="page-banner">
            <img :src="configdata.banners[view]" :alt="currentNav.label" />
            <div class="banner-text">
              <span class="banner-kicker">EDEN GUILD</span>
              <h2 class="banner-title">{{ bannerTitle }}</h2>
              <p class="banner-sub">{{ pageSub }}</p>
            </div>
          </section>

          <transition name="fade" mode="out-in">
            <component
              :is="currentPage"
              :key="view"
              :configdata="configdata"
              :date="date"
              @navigate="go"
              @join="dialogJoin = true"
            />
          </transition>
        </main>
      </div>

      <v-dialog v-model="dialogJoin" max-width="560" scrollable>
        <div class="dialog-card">
          <h2>{{ configdata.join.title }}</h2>
          <p class="note">{{ configdata.join.note }}</p>
          <div class="dialog-step" v-for="(s, i) in configdata.join.steps" :key="s">
            <span class="num">{{ i + 1 }}</span>
            <span>{{ s }}</span>
          </div>

          <div class="dialog-qr" v-if="configdata.join.form">
            <img :src="configdata.join.form.qr" :alt="configdata.join.form.title" />
            <div class="dialog-qr-text">
              <strong>{{ configdata.join.form.title }}</strong>
              <p>{{ configdata.join.form.note }}</p>
            </div>
          </div>

          <p class="dialog-note" v-if="configdata.contacts.length">
            公会 QQ 群：{{ configdata.contacts[0].value }}
          </p>
          <button class="eden-join" type="button" style="width: 100%; margin-top: 14px;" @click="dialogJoin = false">
            知道了
          </button>
        </div>
      </v-dialog>
    </v-app>
  </div>
</template>

<script src="./app.js"></script>

<style>
@import url(/css/app.less);
@import url(/css/mobile.less);
</style>

<style scoped>
.dialog-note {
  margin: 12px 0 0;
  padding: 10px 12px;
  font-size: 12.5px;
  color: var(--eden-accent);
  background: rgba(122, 102, 214, 0.08);
  border-radius: 10px;
  text-align: center;
}
</style>
