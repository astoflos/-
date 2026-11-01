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

	// 每个栏目顶部的横幅
	banners: {
		home: '/img/site/home.jpg',
		territory: '/img/site/territory.jpg',
		recruit: '/img/site/recruit.jpg',
		members: '/img/site/members.jpg',
		about: '/img/site/about.jpg'
	},

	// ================= 公会基本信息 =================
	guild: {
		name: '伊甸园',
		en: 'EDEN',
		motto: '循此踏入伊甸',
		slogan: '在方块之间，种下一片不会凋谢的花园。',
		intro: '伊甸园是一个以“一起玩、一起建”为宗旨的休闲公会。我们常驻铃兰花圃，主玩粘液科技，喜欢把机器、建筑和花园都折腾得漂漂亮亮。这里没有强制打卡，也没有内卷，只希望每个愿意留下的人，都能在伊甸找到自己的一块地。',
		founded: '2025 年秋'
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
		{ key: 'home', label: '首页', icon: 'mdi-home-variant-outline' },
		{ key: 'territory', label: '公会领地', icon: 'mdi-map-marker-radius-outline' },
		{ key: 'recruit', label: '招新福利', icon: 'mdi-gift-outline' },
		{ key: 'members', label: '成员名册', icon: 'mdi-account-group-outline' },
		{ key: 'about', label: '关于与规则', icon: 'mdi-book-open-variant' }
	],

	// 各栏目横幅下的副标题
	pageInfo: {
		home: '在方块之间，种下一片不会凋谢的花园',
		territory: '领地与机器一览 · 点击指令即可复制传送',
		recruit: '伊甸园初遇礼 · 满足要求即可申请',
		members: '一起盖房子、一起摆机器的人',
		about: '公会简介、守则，与我们一起走过的路'
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

	// ================= 招新 =================
	recruit: {
		title: '伊甸园初遇礼',
		subtitle: '全套神装 · 海量资源 · 开荒无忧',
		image: '/img/site/gifts.png',
		intro: '每一位通过审核、正式加入伊甸园的新成员，都可以领取一份初遇礼。礼包内容会随着版本更新调整，下方为当前清单。',

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
			'遵守服务器与公会规则，不破坏他人建筑',
			'上线时间自由，不强制打卡；粘液科技不会也可以教'
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
	// { name: '新成员', id: 'NewPlayer', role: '成员', note: '', color: '#9d8cd8' },
	members: [
		{ name: '楉曦', id: 'ruo_xi', role: '会长', note: '主城与金库', color: '#7a66d6' },
		{ name: '果果', id: 'guoguo', role: '成员', note: '工业区 · 粘液科技', color: '#e58fb6' },
		{ name: '姐姐', id: 'GamePlayer1', role: '成员', note: '刷铁机', color: '#f0a868' },
		{ name: '基米', id: 'BiliBili', role: '成员', note: '', color: '#63b3c3' },
		{ name: '小奈', id: 'nan_chan', role: '成员', note: '沼泽塔 · 菌类农场', color: '#9d8cd8' },
		{ name: '鱼儿', id: 'Gakikfg', role: '成员', note: '', color: '#74c0a4' },
		{ name: 'N', id: 'njl_141012CZ', role: '成员', note: '蜜脾农场', color: '#c79ad0' },
		{ name: '斯怀特', id: 'swight', role: '成员', note: '', color: '#8fa4d8' }
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

	// ================= 加入流程（弹窗） =================
	join: {
		title: '加入伊甸园',
		note: '满 16 岁即可申请，不强制上线时间，装备和技术都可以慢慢来。',
		// 入会问卷二维码（图片放在 public/img/site/join-qr.jpg，换图直接覆盖同名文件）
		form: {
			title: '入会问卷',
			qr: '/img/site/join-qr.jpg',
			note: '扫码填写入会问卷，管理看到后会拉你进群。'
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

	// 打字机文案
	typeWriterStrings: [
		'在方块之间，种下一片不会凋谢的花园。',
		'机器会坏，花园会开，人会一直在。',
		'循此踏入伊甸，从此不问归途。'
	],

	statement: ['伊甸园 Eden · 铃兰花圃 1.21.11', 'Copyright © 2026 Eden Guild']
}

export default config
