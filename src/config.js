/* =============================================================================
   伊甸园 Eden · 内容配置文件
   -----------------------------------------------------------------------------
   整个网站的文字、成员、领地、公告、礼包清单，全都在这一个文件里改。
   页面结构（组件）不用动，改完保存，dev 会自动刷新。

   常见修改位置一览：
     · 公会名字 / 口号 / 简介 ........ guild
     · 服务器名称 / 版本 / 特色 ..... server
     · 会长、副会长 ................. leaders
     · 联系方式（QQ 群号） ........... contacts      ← 记得换成真实群号
     · 公会公告 ..................... notices       ← 新的加在最前面
     · 公会领地 ..................... territories   ← 有详细注释，照着复制
     · 招新礼包清单 ................. recruit.groups ← 有详细注释
     · 招新要求 / 加入流程 .......... recruit.requirements / recruit.steps
     · 成员名册 ..................... members       ← 有详细注释，照着复制
     · 特邀嘉宾 ..................... guests        ← 和成员分开的名单，D 开头 UID
     · 公会守则 ..................... rules
     · 里程碑 ....................... milestones
     · 加入我们的弹窗文案 ........... join
     · 首页打字机文案 ............... typeWriterStrings
     · 页面顶部横幅图 / 站点背景 .... banners / background / splashImage
   ============================================================================= */

const config = {
	// ================= 站点元数据 =================
	metaData: {
		title: '伊甸园 Eden · 公会主页',
		description: '伊甸园（Eden）公会主页 —— 铃兰花圃 1.21.11，粘液科技，领地、招新与成员一览。',
		keywords: '伊甸园,Eden,公会,我的世界,铃兰花圃,粘液科技',
		icon: '/img/site/logo.jpg'
	},

	// ================= 站点图像 =================
	logo: '/img/site/logo.jpg',
	background: '/img/site/bg.jpg',
	splashImage: '/img/site/splash.jpg',
	// 开屏幕布用的图（左右两半各切成上下梯形，像舞台幕布拉开）
	splashDoors: '/img/site/splash-doors-galaxy.jpg',

	// 动态壁纸（原模板的动态壁纸）：不想用就把 enable 改成 false，会退回静态插画背景
	wallpaperVideo: {
		enable: true,
		src: '/img/wallpaper/dynamic/toy-aeroplane.webm',
		poster: '/img/site/bg.jpg'
	},

	// 每个栏目顶部的横幅
	banners: {
		home: '/img/site/home.jpg',
		territory: '/img/site/territory.jpg',
		recruit: '/img/site/recruit.jpg',
		members: '/img/site/members.jpg',
		// 项目申报用的是 public/img/site/banners/ 里的图，剩下的几张留作以后换
		projects: '/img/site/banners/banner-04.jpg',
		departments: '/img/site/banners/banner-03.jpg',
		about: '/img/site/about.jpg'
	},

	// ================= 公会基本信息 =================
	guild: {
		name: '伊甸园',
		en: 'EDEN',
		motto: '循此踏入伊甸',
		slogan: '在方块之间，种下一片不会凋谢的花园。',
		intro: '伊甸园是一个以“一起玩、一起建”为宗旨的休闲公会。我们常驻铃兰花圃，主玩建筑，喜欢把机器、建筑和花园都折腾得漂漂亮亮。这里没有强制打卡，也没有内卷，只希望每个愿意留下的人，都能在伊甸找到自己的一块领地。',
		founded: '2026 年秋'
	},

	// 所在服务器（公会主页只作说明，不重点宣传）
	server: {
		name: '铃兰花圃',
		version: '1.21.11',
		feature: '粘液科技'
	},

	// 会长
	leaders: {
		leader: { name: '楉曦', id: 'ruo_xi' }
	},

	// ================= 导航 =================
	nav: [
		{ key: 'home', label: '公会首页', icon: 'mdi-home-variant-outline' },
		{ key: 'territory', label: '公会领地', icon: 'mdi-map-marker-radius-outline' },
		{ key: 'recruit', label: '招新福利', icon: 'mdi-gift-outline' },
		{ key: 'members', label: '成员名册', icon: 'mdi-account-group-outline' },
		{ key: 'projects', label: '项目申报', icon: 'mdi-clipboard-list-outline' },
		{ key: 'departments', label: '公会部门', icon: 'mdi-office-building-outline' },
		{ key: 'about', label: '关于与规则', icon: 'mdi-book-open-variant' }
	],

	// 各栏目横幅下的副标题
	pageInfo: {
		home: '在方块之间，种下一片永不凋谢的花园',
		territory: '领地与机器一览 · 点击指令即可复制传送',
		recruit: '伊甸园初遇礼 · 满足要求即可申请',
		members: '最好的宝子们',
		projects: '想盖点什么、想造台机器，先在这儿报一笔',
		departments: '八个部门，各管一摊事',
		about: '公会简介、守则，还有我们一起走过的路'
	},

	// ================= 联系方式 =================
	// TODO 换群号就改这里的 value
	contacts: [
		{ icon: 'mdi-qqchat', label: 'QQ 群', value: '315931400', link: '' },
		{ icon: 'mdi-clipboard-text-outline', label: '入会问卷', value: '见招新页', link: '' },
		{ icon: 'mdi-server-network', label: '所在服务器', value: '铃兰花圃', link: '' }
	],

	// ================= 公会公告（新的放最前面） =================
	// 想加公告：复制一整行 { date, tag, title, text }，插到数组第一行（首页会按顺序显示）
	notices: [
		{ date: '2026-11-01', tag: '站点', title: '伊甸园公会主页上线', text: '领地一览、招新福利、成员名册都可以在这里查到了，有问题欢迎在群里反馈。' },
		{ date: '2026-10-28', tag: '招新', title: '公会持续招新中', text: '欢迎喜欢建筑、粘液科技或者只是想找人一起玩的朋友，新人进会可领取“伊甸园初遇礼”。' },
		{ date: '2026-10-20', tag: '领地', title: '领地整理完成', text: '公会资源与公益资源领地已重新登记，使用前请先看一遍领地说明，用完记得关机。' }
	],

	// ================= 公会领地 =================
	// ★★★ 以后加领地就看这里 ★★★
	// 在对应分组下面复制一整行 { ... }，改掉字段即可（行尾逗号别忘了）：
	//   type:      'building' 公会建筑 / 'private' 公会资源 / 'public' 公益资源
	//   cmd:       领地名字，页面会自动拼接成 /ps 指令
	//   desc:      一句话介绍，显示在名字下面
	//   products:  产物，用中文顿号「、」隔开；没有产物就写 ''
	//   owner:     领地主人的游戏 ID；公益资源（人人可用）可以写 ''
	// 复制这行改改就能用：
	// { type: 'private', cmd: 'XXX刷石机', desc: '刷石机', products: '圆石', owner: 'guoguo' },
	territories: [
		// ---- 公会建筑 ----
		{ type: 'building', cmd: '伊甸园Eden', desc: '伊甸园公会主城', products: '', owner: 'ruo_xi' },
		{ type: 'building', cmd: '伊甸园Eden.基金', desc: '公会金库', products: '钻石原矿', owner: 'ruo_xi' },

		// ---- 公会资源 ----
		{ type: 'private', cmd: 'Eden沼泽刷怪塔', desc: '沼泽刷怪塔', products: '红石粉、腐肉、骨头、萤石粉、线、黏液球、箭、蜘蛛眼、糖', owner: 'nan_chan' },
		{ type: 'private', cmd: '蜜蜂', desc: '蜜脾农场', products: '蜜脾、蜂蜜瓶', owner: 'njl_141012CZ' },
		{ type: 'private', cmd: 'pa 伊甸园树苗', desc: '菌类农场', products: '诡异菌柄、绯红菌柄', owner: 'nan_chan' },
		{ type: 'private', cmd: '伊甸园工业区.s', desc: '64 核黑金刚熔炉组', products: '烧炼产物（铁锭、金锭、石头等）', owner: 'guoguo' },
		{ type: 'private', cmd: '伊甸园工业区.t', desc: '粘液刷铁机', products: '铁锭、铁块', owner: 'guoguo' },
		{ type: 'private', cmd: 'player的刷铁机', desc: '生电刷铁机', products: '铁锭、基础电路板', owner: 'GamePlayer1' },

		// ---- 公益资源 ----
		{ type: 'public', cmd: '大天尊.刷怪笼', desc: '刷怪笼农场', products: '皮革、烈焰棒、骨头、线、箭、蜘蛛眼', owner: '' },
		{ type: 'public', cmd: '公益甘蔗机', desc: '甘蔗机', products: '甘蔗', owner: '' },
		{ type: 'public', cmd: 'yt', desc: '守卫者农场', products: '海晶碎片、海晶砂粒、生鳕鱼、河豚', owner: '' },
		{ type: 'public', cmd: 'hsk', desc: '沼泽刷怪塔', products: '红石块、腐肉、骨块、萤石粉、线、黏液块、箭、蜘蛛眼、糖', owner: '' },
		{ type: 'public', cmd: 'qyb', desc: '潜影贝农场', products: '潜影壳', owner: '' }
	],

	territoryTypes: [
		{ key: 'all', label: '全部领地' },
		{ key: 'building', label: '公会建筑' },
		{ key: 'private', label: '公会资源' },
		{ key: 'public', label: '公益资源' }
	],

	// ================= 项目申报 =================
	// 类型决定「确认完成」之后这条项目落到哪儿
	projectTypes: [
		{ key: 'event', label: '活动', note: '只有财政支持，完成后不记录' },
		{ key: 'build', label: '建筑', note: '完成后进入公会领地' },
		{ key: 'tech', label: '科技', note: '完成后进入登记领地' },
		{ key: 'attached', label: '附属', note: '子领地或原项目补足，完成后不记录' }
	],

	projectStatus: [
		{ key: 'plan', label: '计划中' },
		{ key: 'doing', label: '进行中' },
		{ key: 'done', label: '已完成' }
	],

	// ================= 公会部门 =================
	// 部门是固定的，部长在页面上由 guoguo / ruo_xi 指定，存在 KV 里。
	// 部长只能从成员名册里挑（按游戏 ID 对应），名册改这里也跟着走。
	// image / tint：卡片右边那块渐显的图和书签色，图在 public/img/site/departments/
	// greet：点开部门时飘出来的那句开场白（后面会自动接「XX部欢迎你」）
	departments: [
		{
			key: 'manage', name: '管理部', tint: '#7a66d6',
			image: '/img/site/departments/dept-01.jpg',
			greet: '政通人和，海晏河清。',
			duty: '统筹公会日常，协调各部门，重大事项由管理部发起并落地，也负责对外代表公会。'
		},
		{
			key: 'org', name: '组织部', tint: '#e58fb6',
			image: '/img/site/departments/dept-02.jpg',
			greet: '来人即缘，留下即家。',
			duty: '负责人事管理与招纳新人：新人接待、入会流程、名册维护，以及成员去留的记录。'
		},
		{
			key: 'tech', name: '科技部', tint: '#6fd0bd',
			image: '/img/site/departments/dept-03.jpg',
			greet: '万物皆可自动化。',
			duty: '粘液科技、生电与红石设施的设计、建造和维护，也负责给成员做技术答疑。'
		},
		{
			key: 'logistics', name: '后勤部', tint: '#f0a868',
			image: '/img/site/departments/dept-04.jpg',
			greet: '兵马未动，粮草先行。',
			duty: '物资仓管、公共设施维护，开荒和活动前的物资准备、场地收拾。'
		},
		{
			key: 'finance', name: '财政部', tint: '#f2c46a',
			image: '/img/site/departments/dept-05.jpg',
			greet: '一分一厘，皆有来处。',
			duty: '公会资金收支、项目预算的审批与结算，定期公布账目。'
		},
		{
			key: 'foreign', name: '外交部', tint: '#86c3ff',
			image: '/img/site/departments/dept-06.jpg',
			greet: '海内存知己，天涯若比邻。',
			duty: '与其他公会、服务器的联络，活动合作与对外交流，维护公会形象。'
		},
		{
			key: 'war', name: '战争部', tint: '#c05a7a',
			image: '/img/site/departments/dept-07.jpg',
			greet: '守土有责，寸土不让。',
			duty: 'PVP 与守备，处理冲突和纠纷，活动期间的安全保障。'
		},
		{
			key: 'build', name: '建筑部', tint: '#b7a6ff',
			image: '/img/site/departments/dept-08.jpg',
			greet: '千仞高塔，始于垒土。',
			duty: '公会建筑的设计与施工：公共建筑和活动场地的规划、取材与落地。'
		}
	],

	// ================= 招新 =================
	recruit: {
		title: '伊甸园初遇礼',
		subtitle: '全套神装 · 海量资源 · 开荒无忧',
		image: '/img/site/gifts.png',
		intro: '正式成员可领一份初遇礼，清单随版本可能有略微调整。',

		// ★★★ 以后加礼包物品就看这里 ★★★
		// 在对应 groups 的 items 里复制一行 { ... } 改字段：
		//   有附魔列表的：{ name: '物品名', qty: '× 1', enchants: ['附魔1', '附魔2'], gold: ['要标成金色的附魔'] }
		//   附魔书的写法：{ name: '保护5', qty: '× 4', desc: '一句话说明', gold: ['保护5'] }
		// 想加一个新分组？复制整个 { title, note, items:[...] } 块，放在下面即可。
		groups: [
			{
				title: '满配附魔防具',
				note: '全保护词条拉满',
				items: [
					{ name: '下界合金头盔', qty: '× 1', enchants: ['保护5', '耐久5', '经验修补', '保护4', '弹射物保护4', '火焰保护4', '爆炸保护4', '荆棘3', '水下呼吸3', '水下速掘'], gold: ['保护5', '耐久5'] },
					{ name: '下界合金胸甲', qty: '× 1', enchants: ['保护5', '耐久5', '经验修补', '保护4', '弹射物保护4', '火焰保护4', '爆炸保护4', '荆棘3'], gold: ['保护5', '耐久5'] },
					{ name: '下界合金护腿', qty: '× 1', enchants: ['保护5', '耐久5', '经验修补', '保护4', '弹射物保护4', '火焰保护4', '爆炸保护4', '荆棘3'], gold: ['保护5', '耐久5'] },
					{ name: '下界合金靴子', qty: '× 1', enchants: ['保护5', '耐久5', '经验修补', '保护4', '弹射物保护4', '火焰保护4', '爆炸保护4', '荆棘3', '摔落缓冲4', '深海探索者3'], gold: ['保护5', '耐久5'] },
					{ name: '电力喷气背包', qty: '× 1', enchants: ['保护5', '耐久5', '经验修补', '保护4', '弹射物保护4', '火焰保护4', '爆炸保护4', '荆棘3'], gold: ['保护5', '耐久5'] },
					{ name: '鞘翅', qty: '× 1', enchants: ['保护5', '耐久5', '经验修补', '保护4', '弹射物保护4', '火焰保护4', '爆炸保护4', '荆棘3'], gold: ['保护5', '耐久5'] }
				]
			},
			{
				title: '武器与工具',
				note: '开荒利器',
				items: [
					{ name: '强化爆破镐（时运）', qty: '× 1', enchants: ['效率5', '耐久3', '经验修补', '时运3'] },
					{ name: '钻石镐（时运）', qty: '× 1', enchants: ['效率5', '耐久3', '经验修补', '时运3'] },
					{ name: '多功能工具', qty: '× 1', enchants: ['效率5', '耐久3', '经验修补'] },
					{ name: '钻石镐（精准）', qty: '× 1', enchants: ['效率5', '耐久3', '经验修补', '精准采集'] },
					{ name: '强化爆破镐（精准）', qty: '× 1', enchants: ['效率5', '耐久3', '经验修补', '精准采集'] },
					{ name: '钻石剑', qty: '× 1', enchants: ['锋利5', '亡灵杀手5', '节肢杀手5', '横扫之刃3', '火焰附加2', '耐久3', '经验修补'] },
					{ name: '三叉戟', qty: '× 1', enchants: ['穿刺5', '耐久3', '经验修补'] },
					{ name: '冰封之弓', qty: '× 1', enchants: ['力量5', '冲击2', '火矢1', '无限', '耐久3', '经验修补'] },
					{ name: '钓鱼竿', qty: '× 1', enchants: ['海之眷顾3', '诱饵3', '耐久3', '经验修补'] }
				]
			},
			{
				title: '附魔书大礼包',
				note: '自由搭配',
				items: [
					{ name: '保护5', qty: '× 4', desc: '顶级防具附魔', gold: ['保护5'] },
					{ name: '耐久5', qty: '× 4', desc: '顶级耐久附魔', gold: ['耐久5'] },
					{ name: '经验修补', qty: '× 4', desc: '装备自动修复' },
					{ name: '连锁砍树', qty: '× 1', desc: '一键砍伐整棵树' },
					{ name: '击退5', qty: '× 1', desc: '超强击退效果' },
					{ name: '忠诚3', qty: '× 1', desc: '三叉戟自动飞回' },
					{ name: '激流3', qty: '× 1', desc: '雨中 / 水中冲刺' },
					{ name: '引雷', qty: '× 1', desc: '雷雨天召唤闪电' },
					{ name: '时运3', qty: '× 1', desc: '增加掉落物上限' },
					{ name: '精准采集', qty: '× 1', desc: '保留原方块形态' }
				]
			}
		],

		requirements: [
			'年满 16 岁',
			'喜欢一起玩，愿意参与公会公共建设',
			'和谐友善',
			'遵守服务器与公会规则，不破坏他人建筑',
			'上线时间自由，不强制发布任务；建筑不会可以学，粘液科技不会也可以教'
		],

		steps: [
			'扫码填写入会问卷（下方二维码）',
			'加入公会 QQ 群 315931400',
			'进服后到主城「伊甸园Eden」报到，登记游戏 ID',
			'找会长「楉曦」领取「伊甸园初遇礼」'
		]
	},

	// ================= 成员 =================
	// ★★★ 以后加成员就看这里 ★★★
	// 复制一整行 { ... } 放在合适的位置，改掉字段即可（行尾逗号别忘了）：
	//   name:  昵称（显示的大字）
	//   id:    游戏 ID（显示在昵称下面）
	//   role:  职位，写 '会长' / '副会长' / '成员'（会长和副会长卡片会自动高亮）
	//   note:  备注，比如负责的建筑或机器；没有就写 ''
	//   color: 头像圆圈的底色，随便换个十六进制颜色即可
	// 复制这行改改就能用：
	// { name: '新成员', id: 'NewPlayer', role: '成员', avatar: '/img/site/avatars/avatar-1.jpg',
	//   uid: 'E12345', joinDate: '2026-01-01', intro: '一句话介绍', quote: 'TA 自己写的一句话', color: '#9d8cd8' },
	// 头像是 public/img/site/avatars/ 下的图片；uid 是 E + 5 位数字，成员之间不要重复。
	members: [
		{
			name: '楉曦', id: 'ruo_xi', role: '会长', color: '#7a66d6',
			avatar: '/img/site/avatars/avatar-1.jpg', uid: 'E47382', joinDate: '2025-09-19',
			intro: '公会的第一块基石。',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: '果果', id: 'guoguo', role: '成员', color: '#e58fb6',
			avatar: '/img/site/avatars/avatar-2.jpg', uid: 'E19064', joinDate: '2025-10-03',
			intro: '什么都不会，什么都会一点，有问题找他就对了。',
			quote: '~~伊甸园最帅之人~~，全铃兰花圃最帅之人！！'
		},
		{
			name: '姐姐', id: 'GamePlayer1', role: '成员', color: '#f0a868',
			avatar: '/img/site/avatars/avatar-3.jpg', uid: 'E82517', joinDate: '2026-09-26',
			intro: '神仙姐姐是吉祥物。',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: '基米', id: 'BiliBili', role: '成员', color: '#63b3c3',
			avatar: '/img/site/avatars/avatar-4.jpg', uid: 'E36049', joinDate: '2025-10-04',
			intro: '常驻夜猫子，最好的哈基米。',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: '小奈', id: 'nan_chan', role: '成员', color: '#9d8cd8',
			avatar: '/img/site/avatars/avatar-5.jpg', uid: 'E91628', joinDate: '2025-10-24',
			intro: '沼泽刷怪塔和菌类农场的主人，科技部中坚力量（如果有科技部）。',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: '鱼儿', id: 'Gakikfg', role: '成员', color: '#74c0a4',
			avatar: '/img/site/avatars/avatar-6.jpg', uid: 'E27450', joinDate: '2026-10-01',
			intro: '还在打复活赛。',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: 'N', id: 'njl_141012CZ', role: '成员', color: '#c79ad0',
			avatar: '/img/site/avatars/avatar-7.jpg', uid: 'E63185', joinDate: '2026-09-19',
			intro: '蜜脾农场的主人，话不多但活很细。',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: '斯怀特', id: 'swight', role: '成员', color: '#8fa4d8',
			avatar: '/img/site/avatars/avatar-8.jpg', uid: 'E50832', joinDate: '2026-10-15',
			intro: '老资历就会欺负人！',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: '鱼', id: 'Microsoft', role: '成员', color: '#c9b471',
			avatar: '/img/site/avatars/avatar-9.jpg', uid: 'E47645', joinDate: '2026-10-23',
			intro: '怎么这么多鱼？',
			quote: '这个人很懒，什么都没有说...'
		},
		{
			name: 'slient', id: 'slient', role: '成员', color: '#8e86c9',
			avatar: '/img/site/avatars/avatar-10.jpg', uid: 'E52912', joinDate: '2026-10-31',
			intro: '可爱小萌新',
			quote: '这个人很懒，什么都没有说...'
		}
	],

	// ================= 特邀嘉宾 =================
	// 和成员名册分开的名单，不算公会成员、也不参与注册身份判定。
	// 复制一行 { ... } 就能加一位（行尾逗号别忘了）：
	//   name:  昵称；id: 游戏 ID；guild: 所在公会；title: 职务（没有就写 ''）
	//   uid:   D + 5 位数字（嘉宾统一 D 开头，成员是 E 开头）
	//   color: 头像底色；avatar: 头像图片（放在 public/img/site/avatars/ 下），留空就显示昵称首字
	//   joinDate: 可选，没有公会时名片上显示这个日期
	guests: [
		{
			name: '黄叔', id: 'ny_huang', guild: '南方集团', title: '会长',
			uid: 'D99514', color: '#7f63c9', avatar: '/img/site/avatars/guest-huang.jpg',
			// intro 是可选的，留空名片上就不显示这一行
			intro: ''
		},
		{
			name: '秋墨', id: 'bmcq', guild: '夜航星', title: '',
			uid: 'D27245', color: '#9a7fd8', avatar: '/img/site/avatars/guest-qiumo.jpg',
			intro: ''
		},
		{
			name: '葫芦', id: 'ieeen', guild: '栖潮屿', title: '档案组长',
			uid: 'D11344', color: '#6d86d6', avatar: '/img/site/avatars/guest-hulu.jpg',
			intro: ''
		},
		{
			name: 'kk', id: 'kilven_killer', guild: '牢九门', title: '会长',
			uid: 'D33862', color: '#7d6bc4', avatar: '/img/site/avatars/guest-1.jpg',
			intro: ''
		}
	],

	// ================= 规则 =================
	rules: [
		'不破坏、不偷窃他人的建筑与物资，公共设施使用后请归位。',
		'领地内建造或改造前，先和领地主人打声招呼。',
		'不要私自改动他人的机器与红石线路，出问题请找原作者。',
		'公益资源领地人人可用，用完记得关机器、清掉落物。',
		'群内友善交流，拒绝引战、刷屏与无关广告。'
	],

	// ================= 里程碑 =================
	milestones: [
		{ date: '2025 秋', title: '伊甸园成立', text: '几位常驻铃兰花圃的玩家凑在一起，公会正式挂牌。' },
		{ date: '2026 春', title: '主城落成', text: '「伊甸园Eden」主城建成，公会开始有了自己的样子。' },
		{ date: '2026 夏', title: '工业区投产', text: '粘液科技工业区上线，熔炉组、刷铁机陆续运转。' },
		{ date: '2026 秋', title: '公会主页上线', text: '领地、招新、成员名册整理成站，欢迎常来看看。' }
	],

	// ================= 账号 / 登录 =================
	// guildCode：注册「名册里的名字」时需要的口令。
	//   留空 '' = 按规则任何同名注册都直接成为公会成员（方便，但别人也能冒充名册成员）
	//   填一个字符串 = 注册名册成员时必须输入这个口令，普通会员不受影响
	auth: {
		guildCode: '',
		// 只有这些账号能「录入成员」和删掉录入的记录（其他公会成员也看不到这个按钮）。
		// 想换人就在这儿改游戏 ID，前端按钮和服务端接口都跟着它走。
		memberAdmins: ['guoguo', 'ruo_xi']
	},

	// ================= 加入流程（弹窗） =================
	join: {
		title: '加入伊甸园',
		note: '满 16 岁即可申请，不强制上线时间。',
		// 入会问卷二维码（图片放在 public/img/site/join-qr.jpg，换图直接覆盖同名文件）
		form: {
			title: '入会问卷',
			qr: '/img/site/join-qr.jpg',
			note: '扫码填写入会问卷'
		},
		steps: [
			'扫码填写入会问卷（下方二维码）',
			'加入公会 QQ 群 315931400',
			'进服后到主城「伊甸园Eden」报到',
			'找会长「楉曦」领取初遇礼'
		]
	},

	// ================= 音乐（侧栏播放器） =================
	// 走 Meting 接口取网易云歌单。默认取「伊甸微光」里 GuoGuo 的歌（两首）。
	// 想换歌：改 keyword（搜索词）或 artist（作者过滤），limit 是保留几首。
	music: {
		enable: true,
		api: 'https://api.i-meto.com/meting/api',
		server: 'netease',
		keyword: '伊甸微光',
		artist: 'GuoGuo',
		limit: 2
	},

	// 首页打字机文案（多写几句，慢慢轮播）
	typeWriterStrings: [
		'在方块之间，种下一片不会凋谢的花园。',
		'机器会坏，花园会开，人会一直在。',
		'循此踏入伊甸，从此不问归途。',
		'我们不是最强的公会，只是想一起把日子过成喜欢的样子。',
		'这里是家。',
		'矿物可以再挖，房子可以再盖，人走了就真的走了，所以请留下来。',
		'铃兰的春天很长，长到足够把一座城慢慢盖完。',
		'我才不是彩蛋。',
		'今天也要有个好心情。',
		'有人负责红石，有人负责花，有人喜欢你。',
		'愿你在伊甸，找到一块属于自己的地，和一盏等你回家的灯。'
	],

	statement: ['伊甸园 Eden · 铃兰花圃 1.21.11', 'Copyright © 2026 Eden Guild']
}

export default config
