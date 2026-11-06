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
| 音乐 | `music`（Meting 接口 + 关键词，`autoplay` 控制自动播放） |
| 极简模式入口 | `minimal.url`（默认 `/minimal/`，以后绑了二级域名可改成完整地址） |
| 入会问卷二维码 | `.join.form.qr`，图片在 `public/img/site/join-qr.jpg` |
| 公会口令（可选） | `auth.guildCode` |

## 音乐自动播放

`config.music.autoplay` 默认是 `true`。开屏页的点击 / 触摸本身就是一次用户手势，进站时会直接起播；
如果浏览器仍然拦截（常见于没有开屏的二次访问），播放器会等下一次点击或按键再补播，不会影响页面。
想关掉自动播放，把 `autoplay` 改成 `false` 即可。

## 极简模式（纯黑白信息页）

侧栏 logo 下方有一个「极简」按钮，默认打开 `/minimal/`；手机端这个按钮会变成左下角的悬浮键：

- 整页只有黑、白两色，没有图片、动画和色彩；除了「分页导航」之外，没有登录、音乐、搜索、筛选、弹窗、复制等功能；
- 内容仍然来自 `src/config.js`，并按完整站点的顺序分成 7 页：首页 / 领地 / 招新 / 成员 / 项目 / 部门 / 关于；
- 分页导航在页面顶部和底部，支持上一页 / 下一页、页内目录和浏览器前进后退（地址栏会变成 `#p2` 这样的分页锚点）；
- 页面保留极简排版：宋体正文、原来的字号 / 行高 / 段间距，没有卡片、圆角和装饰；
- 页面是构建时生成的一个静态 HTML 文件（只带分页用的一小段内联脚本）：
  `scripts/minimal-page.js` 负责渲染，`scripts/build-minimal.js` 负责写入
  `dist/minimal/index.html`，`npm run build` 会自动执行；
- 本地 `npm run dev` 时，`/minimal/` 由 Vite 中间件直接返回，改完 `config.js` 刷新即可看到；
- 以后想放到二级域名 `minimal.eden-guild.top`：在 Vercel 里给项目加这个域名，然后把
  `config.minimal.url` 改成 `https://minimal.eden-guild.top/`。`vercel.json` 里已经预留了
  该域名的根路径重写，指向极简页。

## 账号系统（会员 / 公会成员）

- 访客可以直接浏览；点侧栏「登录 / 注册」注册，填 **游戏名 + QQ + 密码**。
- 一个游戏名只能注册一次，一个 QQ 也只能注册一次。
- **游戏名如果和名册里的 `id` 相同**，注册后身份就是「公会成员」，否则是「会员」。
  名册 = `config.js` 里写死的 `members` + 页面「录入成员」加的那些。
- 公会成员可以在「公会领地」页登记新领地；「成员名册」的录入功能只给 `auth.memberAdmins` 里的账号
  （默认只有 `guoguo` 和 `ruo_xi`，其他公会成员看不到这个按钮，接口也会拒）。
- 密码用 scrypt 加盐哈希存储，不存明文；登录态是一个 7 天有效的 HttpOnly Cookie。
- 会员名册的名字谁都能注册 → 如果想防止冒充，在 `config.auth.guildCode` 填一个口令，
  之后注册名册里的名字就必须输入这个口令（普通会员不受影响）。

### 忘记密码：恢复码（不需要环境变量）

只对 **guoguo / ruo_xi** 两个账号生效，一共三层，平时只用第一层：

1. **自己设的恢复码（推荐）**：先用正常密码登录一次 → 右下角调色板按钮 → 弹窗最下面「账号恢复码」→
   设一个至少 8 位的码。它按 scrypt 加盐存在 KV 里（`eden:recovery:<游戏名>`），不存明文、也不进仓库。
   以后忘了密码，账号填 `guoguo` / `ruo_xi`、密码填这个码就能进；想换或想关，在同一个地方重设 / 清除。
2. **`EDEN_RECOVERY_CODE`（可选）**：哪天能在 Vercel 里加环境变量了，填上就直接生效，不用改代码。
3. **`KV_REST_API_TOKEN`（兜底）**：接上 KV 之后 Vercel 会自动注入这个变量，把它的值当密码也能登进来。
   值很长，适合在电脑上复制粘贴——属于「连恢复码都忘了」时的最后一招。

三个账号前提：这两个账号要先注册过，否则会提示你先去注册。
想改名单，`api/login.js` 和 `api/recovery.js` 里的 `RECOVERY_ACCOUNTS` 一起改。

## 彩蛋

点侧栏左上角的 **logo** 会进一个彩蛋页：

- 背景是星空延时视频，四周飘着一堆竖排诗句，各自绕竖轴慢慢转（结构和动画照搬 `onlyto/skystar.html`）；
- 中间分两页、逐字打出来：**伊甸园 + 恭喜你发现了彩蛋** → 淡出 → **今夜整片夜空将会为你闪烁 + 点击任意键继续**；
- 出现提示后再点一下（或按任意键）就回到首页。

- 只在电脑端生效（宽度 ≤ 760px 点 logo 没反应）；
- 视频在 `public/video/starry-night.mp4`（8.2 MB，只在打开彩蛋时才加载，不影响正常首屏）；
- 诗句清单在 `src/components/EasterEgg.vue` 的 `POEMS`，随机范围和参考页一致（每次打开重新随机）；
- 中间文案在同文件的 `TITLE / SUB / LINE2` 三个常量里改。

## 项目申报

「项目申报」是给公会成员报项目的地方：要花多少钱、要什么材料，先记一笔，做完由会长确认。

- **谁能填**：公会成员（会员只能看）；
- **一条项目记录什么**：名称、项目执行（确认完成后会变成领地主人）、参与成员、类型、
  简介、预估财政、所需材料、开始时间、当前状态（计划中 / 进行中 / 已完成）；
- 所需材料分三种填法：**填写材料**（材料名 + 数量，一行一项，可以一直往下加）、
  **待补充**、**无**；后两种在卡片上直接写成「待补充 / 无」，只有真填了材料才显示「N 项」并可展开；
- 卡片上材料多了会默认收起来，点「所需材料 N 项」展开，最多 30 行；
- **确认完成**：只有 `auth.memberAdmins` 里的人（默认 guoguo / ruo_xi）能点，而且项目得先标成「已完成」。
  确认后按类型处理：
  - 建筑 → 作为「公会建筑」录入领地
  - 科技 → 作为「公会资源」录入领地
  - 活动 → 只有财政支持，不记录
  - 附属 → 不记录，项目直接结束
  处理完这条项目就从列表里删掉；
- 改状态：申报人本人或管理员；删除：同上；
- 数据存在 KV 的 `eden:projects`，第一次打开时会把「主城扩建—扶桑」这条示例写进去。

## 切页 / 横幅素材

- 各栏目的横幅在 `config.js` 的 `banners`；
- `public/img/site/banners/` 里放了 5 张备用横幅（`banner-01` ~ `banner-05`），
  项目申报现在用的是 `banner-04`，想换直接改 `banners.projects` 的路径；
- 图片建议 1600px 宽以上、横向构图，页面里按 `cover` 裁。

## 公会部门

八个部门写在 `config.js` 的 `departments` 里（管理 / 组织 / 科技 / 后勤 / 财政 / 外交 / 战争 / 建筑），
每个部门有固定的职责说明，部长则由页面指定。

- 每张卡片右半边是从透明渐渐显出来的一张图（`public/img/site/departments/dept-01` ~ `dept-11`，
  前 8 张已经分给八个部门，剩下的留作以后加部门），右侧还有一条部门色的「书签边」，
  颜色写在每个部门的 `tint` 里；
- 点部门卡片进入部门页：卡片会先「拉长」成详情卡的大小（一层影子做 FLIP），再淡入真正的内容；
  同时画面中间飘出一句打字机效果的问候，停一会儿后自己淡掉。
  问候语 = `greet` + 「XX部欢迎你」；登录状态下会自动接「，亲爱的昵称。」，
  昵称从名册里按游戏 ID 找，找不到就用登录名。每个部门的开场白写在 `greet` 字段里；
- 部门页现在只有一句「这里什么都没有」，以后放项目/成员/公告；
- **任命部长**：只有 `auth.memberAdmins` 里的人（默认 guoguo / ruo_xi）能在卡片上点「任命部长」；
  人选从成员名册里挑（按游戏 ID 对应），可以勾「代理」；不选人就等于撤掉部长；
- **和成员名册联动**：被任命的人，成员卡片和名片上会多一个「XX部部长 / XX部代理部长」的标签；
- 部长设置存在 KV 的 `eden:departments`，只记「哪个部门是谁 + 是否代理」。

## 成员名册 & 特邀嘉宾

- **成员名册**：`config.js` 的 `members` 是写死的那批；**只有 `auth.memberAdmins` 里的账号**
  （默认 `guoguo` / `ruo_xi`）能在「成员名册」页点「＋ 录入成员」。
  录入的会存进 KV（`eden:members`），和写死的一起显示，带「新录入」标记。
  录入时只需填昵称、游戏 ID、职位、介绍；头像和 UID 会自动生成（头像按 ID 从 `avatar-1` ~ `avatar-24` 里挑，重录也不会变）。
- 录入的成员可以删：同样是这两个账号能删，其他公会成员看不到删除按钮、直接调接口也是 403。
  想换能录入的人，改 `config.auth.memberAdmins` 列表就行（前端按钮和服务端校验都跟着它走）。
- 录入之后，对方用这个游戏 ID 注册就会直接是「公会成员」。
- **特邀嘉宾**：`config.js` 的 `guests`，和成员完全分开的一份名单，不算公会成员、也不参与注册身份判定。
  卡片布局和成员一样（同一套 4 列网格），只有头像圈和 UID 名牌是紫色；
  UID 用 `D` + 5 位数字，名片上另外显示「所在公会 · 职务」；没填公会但有 `joinDate` 的，就显示加入日期。
  没填 `avatar` 就显示昵称首字 + `color` 底色。
- **申请成为特邀嘉宾**：不在导航里，入口是「成员名册 → 特邀嘉宾」标题行右边那行小字。
  点下去嘉宾卡会像扑克牌一样收拢堆叠，然后展开一页申请说明（加群要写什么、审核大概怎么样）。
  文案在 `src/components/GuestApply.vue`，改里面的文字即可；群号自动读 `config.contacts` 里带「QQ」的那条。
- 名片签名支持 `~~划掉~~` 写成删除线，例如 `'~~伊甸园最帅之人~~，全铃兰最帅之人！！'`。
- **备用头像**：`public/img/site/avatars/` 里还留着
  - 成员备用：`avatar-9.jpg` ~ `avatar-24.jpg`（16 张，新成员直接填 `/img/site/avatars/avatar-1X.jpg`）
  - 嘉宾备用：`guest-1.jpg` ~ `guest-4.jpg`（4 张，给以后的特邀嘉宾用）
  
  都是 420×420 的 JPEG，和现有头像同一规格，直接用就行。

### 数据存哪里

生产环境用 **Vercel KV（Upstash Redis）**，代码在 `api/`：

```
api/register.js    注册
api/login.js       登录（含恢复码通道）
api/logout.js      退出
api/me.js          当前登录状态
api/territories.js 领地登记（GET 列表 / POST 新增 / DELETE 删除）
api/members.js     成员录入（GET 列表 / POST 新增 / DELETE 删除）
api/recovery.js    恢复码设置（GET 状态 / POST 设置 / DELETE 清除）
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
scripts/minimal-page.js  极简页渲染器（纯黑白 + 分页导航）
scripts/build-minimal.js 构建时写出 dist/minimal/index.html
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
