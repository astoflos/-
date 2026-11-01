# 伊甸园 Eden · 公会官网

Vue 3 + Vuetify 3 + Vite 写的一页式公会主页，带开屏动画、音乐播放器、领地登记表、招新福利和成员名册。

线上地址：部署在 Vercel（项目 `astoflos-projects`）。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173 ，注册/登录接口会自动跑起来
npm run build      # 产物在 dist/
npm run preview    # 预览构建结果（预览模式下没有 /api，注册登录会失败）
```

> 本地账号数据存在项目根目录的 `.dev-data.json`（已在 .gitignore 里），删掉就等于清空所有测试账号。

## 内容怎么改

全部集中在 `src/config.js`：

| 想改什么 | 位置 |
| --- | --- |
| 公会名、口号、简介 | `guild` |
| 服务器名称 / 版本 / 特色 | `server` |
| 会长、副会长 | `leaders` |
| QQ 群号、联系方式 | `contacts` |
| 公告 | `notices`（新的放最前面） |
| 领地 | `territories`（有注释，照着复制一行） |
| 招新礼包 | `recruit.groups` |
| 招新要求、加入流程 | `recruit.requirements` / `recruit.steps` |
| 成员名册 | `members`（有注释，照着复制一行；名字用于判断「公会成员」身份） |
| 守则、里程碑 | `rules` / `milestones` |
| 音乐 | `music`（Meting 接口 + 关键词） |
| 入会问卷二维码 | `.join.form.qr`，图片在 `public/img/site/join-qr.jpg` |
| 公会口令（可选） | `auth.guildCode` |

## 账号系统（会员 / 公会成员）

- 访客可以直接浏览；点侧栏「登录 / 注册」注册，填 **游戏名 + QQ + 密码**。
- 一个游戏名只能注册一次，一个 QQ 也只能注册一次。
- **游戏名如果和 `members` 里的 `id` 或 `name` 相同**，注册后身份就是「公会成员」，否则是「会员」。
- 公会成员可以在「公会领地」页登记新领地（列表最前面会出现，带删除按钮）。
- 密码用 scrypt 加盐哈希存储，不存明文；登录态是一个 7 天有效的 HttpOnly Cookie。
- 会员名册的名字谁都能注册 → 如果想防止冒充，在 `config.auth.guildCode` 填一个口令，
  之后注册名册里的名字就必须输入这个口令（普通会员不受影响）。

### 数据存哪里

生产环境用 **Vercel KV（Upstash Redis）**，代码在 `api/`：

```
api/register.js    注册
api/login.js       登录
api/logout.js      退出
api/me.js          当前登录状态
api/territories.js 领地登记（GET 列表 / POST 新增 / DELETE 删除）
api/_kv.js         存储层（有 KV 环境变量时走 Upstash REST，本地开发回落 JSON 文件）
api/_auth.js       会话、Cookie、密码哈希
api/_guild.js      名册匹配 + 表单校验
```

需要两个环境变量（在 Vercel 里开通 KV 后会自动注入）：

```
KV_REST_API_URL
KV_REST_API_TOKEN
```

（也兼容 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`）

没配置 KV 时，线上接口会返回一句提示，而不是直接 500。

## 部署

代码推到 GitHub 的 `main` 分支后，Vercel 会自动重新构建部署。

1. GitHub Desktop 里 Commit → Push。
2. 打开 Vercel 项目 → Deployments 看是否成功。
3. 第一次使用账号功能前，先在 Vercel 里开通 KV（见下）。

### 在 Vercel 开通 KV（只需要点一次）

1. 打开 <https://vercel.com/astoflos-projects>，进入这个网站的项目。
2. 顶部 **Storage** → **Create Database** → 选 **Upstash for Redis**（免费档够用）。
3. 创建后点 **Connect Project**，选这个项目，环境选 Production + Preview + Development。
4. 回到 **Deployments**，点最新一次部署右侧的 **Redeploy**（或随便推一次代码）。

做完后注册、登录、领地登记就会真正存到云端，换电脑也能登录。

## 目录结构

```
api/                 云函数（Vercel Serverless）
scripts/api-dev.js   本地开发时把 api/* 挂进 Vite 的中间件
src/config.js        所有内容的配置
src/App.vue          外壳：侧栏、导航、开屏、弹窗
src/components/
  Splash.vue         开屏动画
  MusicPlayer.vue    侧栏音乐播放器
  AuthDialog.vue     登录 / 注册弹窗
  AddTerritoryDialog.vue  登记领地弹窗
  pages/             首页、领地、招新、成员、关于
src/lib/api.js       前端调接口
src/lib/auth.js      登录状态
public/css/          样式（app.less / mobile.less / style.css）
public/img/site/     站点图片（logo、横幅、问卷二维码）
template-original/   最初的开源模板备份（不参与构建，也不推送到仓库）
```
