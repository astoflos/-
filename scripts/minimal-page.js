/* =============================================================================
   极简模式页面生成器
   -----------------------------------------------------------------------------
   输入 src/config.js，输出一张纯黑白、无图片、无动画、无交互的静态信息页。
   构建时由 scripts/build-minimal.js 写成 dist/minimal/index.html；
   开发时由 vite.config.js 里的中间件直接返回，所以 /minimal/ 也能本地预览。
   ============================================================================= */

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ESCAPES[ch])
}

function text(value, fallback = '—') {
  const str = String(value == null ? '' : value).trim()
  return str ? esc(str) : fallback
}

function table(headers, rows, options = {}) {
  const head = headers.map(h => `<th>${esc(h)}</th>`).join('')
  const labels = options.labels || []
  const body = rows.map(cells => `<tr>${cells.map((cell, i) => {
    const label = labels[i] ? ` data-label="${esc(labels[i])}"` : ''
    return `<td${label}>${cell == null ? '—' : cell}</td>`
  }).join('')}</tr>`).join('')
  const cls = options.className ? ` class="${esc(options.className)}"` : ''
  return `<div class="table-wrap"><table${cls}><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
}

function typeLabels(config) {
  const map = {}
  ;(config.territoryTypes || []).forEach(t => { map[t.key] = t.label })
  return map
}

function commandCell(t) {
  if (Array.isArray(t.cmds) && t.cmds.length) {
    return t.cmds
      .map(c => `<code>/ps ${text(c.cmd)}${c.label ? `（${esc(c.label)}）` : ''}</code>`)
      .join('<br>')
  }
  return t.cmd ? `<code>/ps ${text(t.cmd)}</code>` : '—'
}

function renderTerritories(config, labels) {
  const territories = config.territories || []
  const groups = [
    { key: 'building', label: '公会建筑' },
    { key: 'private', label: '公会资源' },
    { key: 'public', label: '公益资源' }
  ]

  return groups.map(group => {
    const list = territories.filter(t => t.type === group.key)
    if (!list.length) return ''
    const rows = list.map(t => [
      `<strong>${text(t.cmd)}</strong>`,
      text(t.desc),
      t.products ? esc(t.products) : '—',
      t.owner ? esc(t.owner) : '—',
      commandCell(t)
    ])
    return `<h3>${esc(labels[group.key] || group.label)}（${list.length}）</h3>` +
      table(['名称', '说明', '产物', '主人', '指令'], rows, {
        className: 'territory-table',
        labels: ['名称', '说明', '产物', '主人', '指令']
      })
  }).join('')
}

function renderRecruit(config) {
  const recruit = config.recruit || {}
  const groups = recruit.groups || []
  const giftCount = groups.reduce((sum, g) => sum + (g.items || []).length, 0)

  const giftHtml = groups.map(group => {
    const items = (group.items || []).map(item => {
      const detail = (item.enchants && item.enchants.length)
        ? ` — ${esc(item.enchants.join('、'))}`
        : (item.desc ? ` — ${esc(item.desc)}` : '')
      return `<li><strong>${text(item.name)}</strong>${item.qty ? ` ${esc(item.qty)}` : ''}${detail}</li>`
    }).join('')
    return `<h3>${text(group.title)}${group.note ? ` · ${esc(group.note)}` : ''}</h3><ul>${items}</ul>`
  }).join('')

  const requirements = (recruit.requirements || []).map(r => `<li>${esc(r)}</li>`).join('')
  const steps = (recruit.steps || []).map(s => `<li>${esc(s)}</li>`).join('')
  const qq = (config.contacts || []).find(c => String(c.label || '').includes('QQ'))

  return `
    <p class="lead">${text(recruit.title)}${recruit.subtitle ? ` · ${esc(recruit.subtitle)}` : ''}</p>
    <p>${text(recruit.intro)}</p>
    <p class="meta">共 ${giftCount} 件物品，随版本与仓库情况调整。</p>
    ${giftHtml}
    <h3>招募要求</h3>
    <ol>${requirements}</ol>
    <h3>加入流程</h3>
    <ol>${steps}</ol>
    <p>${esc((config.join && config.join.note) || '')}</p>
    ${qq ? `<p>公会 QQ 群：${text(qq.value)}</p>` : ''}
  `
}

function renderMembers(config) {
  const members = config.members || []
  const guests = config.guests || []

  const memberHtml = members.map(m => {
    const meta = [m.id, m.uid, m.role, m.joinDate].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('')
    return `<article class="person">
      <p class="person-line"><strong>${text(m.name)}</strong>${meta}</p>
      ${m.intro ? `<p>${esc(m.intro)}</p>` : ''}
      ${m.quote ? `<p class="quote">“${esc(m.quote)}”</p>` : ''}
    </article>`
  }).join('')

  const guestHtml = guests.map(g => {
    const meta = [g.id, g.uid, g.guild, g.title].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('')
    return `<article class="person">
      <p class="person-line"><strong>${text(g.name)}</strong>${meta}</p>
      ${g.intro ? `<p>${esc(g.intro)}</p>` : ''}
    </article>`
  }).join('')

  return `
    <h3>成员（${members.length}）</h3>
    ${memberHtml}
    ${guests.length ? `<h3>特邀嘉宾（${guests.length}）</h3>${guestHtml}` : ''}
  `
}

function renderProjects(config) {
  const types = config.projectTypes || []
  const status = config.projectStatus || []
  const typeRows = types.map(t => [`<strong>${text(t.label)}</strong>`, text(t.note)])
  const statusRows = status.map(s => [`<strong>${text(s.label)}</strong>`])

  return `
    <p>项目申报用于记录公会成员要执行的项目：名称、参与成员、预算、所需材料与进度，完成后由会长确认。以下只保留类型与状态说明。</p>
    ${types.length ? table(['类型', '说明'], typeRows) : ''}
    ${status.length ? table(['状态'], statusRows) : ''}
  `
}

function renderNotices(config) {
  const notices = config.notices || []
  return notices.map(n => `<article class="entry">
    <p class="meta">${text(n.date)}${n.tag ? ` · ${esc(n.tag)}` : ''}</p>
    <h3>${text(n.title)}</h3>
    <p>${text(n.text)}</p>
  </article>`).join('')
}

function renderMilestones(config) {
  const milestones = config.milestones || []
  return milestones.map(m => `<article class="entry">
    <p class="meta">${text(m.date)}</p>
    <h3>${text(m.title)}</h3>
    <p>${text(m.text)}</p>
  </article>`).join('')
}

function renderContacts(config) {
  const contacts = config.contacts || []
  return table(['方式', '内容'], contacts.map(c => [text(c.label), text(c.value)]))
}

function renderFacts(config) {
  const guild = config.guild || {}
  const server = config.server || {}
  const leader = (config.leaders && config.leaders.leader) || {}
  const rows = [
    ['公会名称', `${text(guild.name)} / ${text(guild.en)}`],
    ['成立时间', text(guild.founded)],
    ['所在服务器', `${text(server.name)} · ${text(server.version)}`],
    ['服务器特色', text(server.feature)],
    ['会长', leader.name ? `${esc(leader.name)}${leader.id ? `（${esc(leader.id)}）` : ''}` : '—']
  ]
  return table(['项目', '内容'], rows.map(r => [r[0], r[1]]))
}

export function renderMinimalHtml(config) {
  const guild = config.guild || {}
  const server = config.server || {}
  const memberCount = (config.members || []).length
  const territories = config.territories || []
  const buildingCount = territories.filter(t => t.type === 'building').length
  const labels = typeLabels(config)
  const statement = (config.statement || []).map(line => `<p>${esc(line)}</p>`).join('')
  const siteUrl = config.siteUrl || 'https://eden-guild.top/'

  // 和完整站点同一套分页顺序：首页 / 领地 / 招新 / 成员 / 项目 / 部门 / 关于
  const pageDefs = [
    {
      id: 'p1',
      title: '公会首页',
      html: `
        <h2>公会简介 <small>ABOUT</small></h2>
        <p class="lead">${text(guild.slogan)}</p>
        <p>${text(guild.intro)}</p>
        ${renderFacts(config)}
        <h2>公会公告 <small>NOTICE</small></h2>
        ${renderNotices(config)}
      `
    },
    {
      id: 'p2',
      title: '公会领地',
      html: `
        <h2>公会领地 <small>TERRITORY</small></h2>
        <p>以下指令仅作展示，需要在游戏内手动输入；本页不提供复制按钮。</p>
        ${renderTerritories(config, labels)}
      `
    },
    {
      id: 'p3',
      title: '招新福利',
      html: `
        <h2>招新福利 <small>RECRUIT</small></h2>
        ${renderRecruit(config)}
      `
    },
    {
      id: 'p4',
      title: '成员名册',
      html: `
        <h2>成员名册 <small>MEMBERS</small></h2>
        ${renderMembers(config)}
      `
    },
    {
      id: 'p5',
      title: '项目申报',
      html: `
        <h2>项目申报 <small>PROJECTS</small></h2>
        ${renderProjects(config)}
      `
    },
    {
      id: 'p6',
      title: '公会部门',
      html: `
        <h2>公会部门 <small>DEPARTMENTS</small></h2>
        <p>部长任命以完整站点为准，这里只保留部门职责。</p>
        <ul class="plain">
          ${(config.departments || []).map(d => `<li><strong>${text(d.name)}</strong>：${text(d.duty)}</li>`).join('')}
        </ul>
      `
    },
    {
      id: 'p7',
      title: '关于与规则',
      html: `
        <h2>关于与规则 <small>ABOUT &amp; RULES</small></h2>
        <h3>公会守则</h3>
        <ol>${(config.rules || []).map(r => `<li>${esc(r)}</li>`).join('')}</ol>
        <h3>我们走过的路</h3>
        ${renderMilestones(config)}
        <h2>找到我们 <small>CONTACT</small></h2>
        ${renderContacts(config)}
        <p>${esc((config.join && config.join.note) || '')}</p>
      `
    }
  ]

  const pagerTop = `<nav class="pager" aria-label="极简模式分页">
    ${pageDefs.map((p, i) => `<a class="page-link${i === 0 ? ' is-current' : ''}" href="#${p.id}" data-page="${i + 1}"${i === 0 ? ' aria-current="page"' : ''}>${String(i + 1).padStart(2, '0')} ${esc(p.title)}</a>`).join('\n    ')}
  </nav>`

  const pageSections = pageDefs.map((p, i) => `<section class="content-page" id="${p.id}" data-title="${esc(p.title)}"${i === 0 ? '' : ' hidden'}>
    ${p.html}
  </section>`).join('\n')

  const siteTitle = `${guild.name || '伊甸园'} ${guild.en || 'EDEN'} · 极简模式`
  const pagerScript = `
<script>
(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll('.content-page'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.page-link'));
  var count = document.getElementById('page-count');
  var prev = document.getElementById('page-prev');
  var next = document.getElementById('page-next');
  var baseTitle = ${JSON.stringify(siteTitle)};

  function pageFromHash() {
    var m = (location.hash || '').match(/^#p([1-9][0-9]*)$/);
    if (!m) return 1;
    return Math.min(pages.length, Math.max(1, parseInt(m[1], 10)));
  }

  function show(n) {
    n = Math.min(pages.length, Math.max(1, n));
    pages.forEach(function (page, i) {
      if (i === n - 1) page.removeAttribute('hidden');
      else page.setAttribute('hidden', '');
    });
    links.forEach(function (link, i) {
      if (i === n - 1) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-current');
        link.removeAttribute('aria-current');
      }
    });
    if (count) count.textContent = '第 ' + n + ' / ' + pages.length + ' 页';
    if (prev) {
      prev.href = '#' + pages[Math.max(0, n - 2)].id;
      prev.setAttribute('data-step', String(Math.max(1, n - 1)));
      if (n === 1) prev.setAttribute('aria-disabled', 'true');
      else prev.removeAttribute('aria-disabled');
    }
    if (next) {
      next.href = '#' + pages[Math.min(pages.length - 1, n)].id;
      next.setAttribute('data-step', String(Math.min(pages.length, n + 1)));
      if (n === pages.length) next.setAttribute('aria-disabled', 'true');
      else next.removeAttribute('aria-disabled');
    }
    document.title = pages[n - 1].getAttribute('data-title') + ' · ' + baseTitle;
    window.scrollTo(0, 0);
  }

  function go(n) {
    var target = 'p' + n;
    if (location.hash === '#' + target) show(n);
    else location.hash = target;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a.page-link, a.pager-step');
    if (!link) return;
    event.preventDefault();
    var n = parseInt(link.getAttribute('data-page') || link.getAttribute('data-step') || '1', 10);
    if (!n || n < 1 || n > pages.length) n = pageFromHash();
    go(n);
  });

  window.addEventListener('hashchange', function () {
    show(pageFromHash());
  });

  show(pageFromHash());
})();
</script>`

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${text(guild.name)} ${text(guild.en)} · 极简模式</title>
<meta name="description" content="${esc(config.metaData && config.metaData.description)}">
<meta name="theme-color" content="#ffffff">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  html { background: #fff; color: #000; }
  body {
    margin: 0;
    padding: 30px 18px 70px;
    background: #fff;
    color: #000;
    font-family: "Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", serif;
    font-size: 15px;
    line-height: 1.85;
  }
  .page { max-width: 940px; margin: 0 auto; }
  .content-page { margin: 34px 0 0; }
  .content-page[hidden] { display: none; }
  .content-page h2:not(:first-child) { margin-top: 36px; }
  .pager {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin: 18px 0 0;
    padding: 10px 0;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.8;
  }
  .pager a { text-decoration: none; }
  .pager a.is-current { font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
  .pager-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 42px;
    border-top: 1px solid #000;
    border-bottom: 0;
    padding-top: 12px;
  }
  .pager-step[aria-disabled="true"] { opacity: 0.35; pointer-events: none; }
  header { border-bottom: 2px solid #000; padding-bottom: 22px; }
  .kicker { margin: 0 0 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.18em; }
  h1 { margin: 0; font-size: 36px; line-height: 1.2; font-weight: 700; letter-spacing: 0.08em; }
  h1 span { margin-left: 8px; font-size: 17px; letter-spacing: 0.2em; }
  .motto { margin: 10px 0 6px; font-size: 17px; }
  .meta { margin: 4px 0; font-size: 12.5px; }
  .lead { margin: 10px 0; font-size: 16px; font-weight: 700; }
  section { margin: 34px 0 0; }
  h2 { margin: 0 0 14px; padding-bottom: 5px; border-bottom: 1px solid #000; font-size: 20px; }
  h2 small { margin-left: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; font-weight: 400; letter-spacing: 0.16em; }
  h3 { margin: 20px 0 6px; font-size: 15px; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0; padding-left: 1.4em; }
  li { margin: 4px 0; }
  .table-wrap { width: 100%; overflow-x: auto; }
  table { width: 100%; margin: 10px 0 18px; border-collapse: collapse; font-size: 13.5px; }
  th, td { padding: 6px 8px; border: 1px solid #000; text-align: left; vertical-align: top; }
  th { font-weight: 700; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }
  .entry { margin: 0 0 14px; padding: 0 0 14px; border-bottom: 1px solid #000; }
  .entry:last-child { border-bottom: 0; }
  .person { margin: 0 0 10px; padding: 0 0 10px; border-bottom: 1px solid #000; }
  .person:last-child { border-bottom: 0; }
  .person-line { margin: 0; }
  .person-line span { margin-left: 10px; }
  .quote { margin-left: 1em; }
  .plain { padding-left: 0; list-style: none; }
  .plain li { padding-left: 1em; text-indent: -1em; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 2px solid #000; font-size: 12.5px; }
  a { color: #000; text-decoration: underline; }
  @media (max-width: 640px) {
    body { padding: 20px 12px 48px; font-size: 14px; }
    h1 { font-size: 28px; }
    h1 span { display: block; margin: 4px 0 0; }
    table { font-size: 12px; }
    th, td { padding: 4px 5px; }
    .person-line span { display: block; margin-left: 0; }
    .pager { gap: 4px 10px; font-size: 11.5px; }
    .pager a { display: inline-flex; align-items: center; min-height: 28px; }
    .pager-bottom { align-items: flex-start; }
    .territory-table thead { display: none; }
    .territory-table,
    .territory-table tbody,
    .territory-table tr,
    .territory-table td { display: block; width: 100%; }
    .territory-table tr { margin: 0 0 12px; padding: 6px 8px; border: 1px solid #000; }
    .territory-table td { padding: 2px 0; border: 0; }
    .territory-table td::before { content: attr(data-label) "："; font-weight: 700; }
    .territory-table td:first-child { font-size: 15px; }
    .territory-table td:first-child::before { content: ""; }
  }
  @media print {
    body { padding: 0; font-size: 11pt; }
    a { text-decoration: none; }
    .pager { display: none; }
    .content-page[hidden] { display: block; }
    section { break-inside: avoid; }
  }
</style>
<noscript><style>.content-page[hidden] { display: block; } .pager { display: none; }</style></noscript>
</head>
<body>
<main class="page">
  <header>
    <p class="kicker">EDEN GUILD / MINIMAL</p>
    <h1>${text(guild.name)}<span>${text(guild.en)}</span></h1>
    <p class="motto">${text(guild.motto)}</p>
    <p class="meta">${text(server.name)} · ${text(server.version)} · ${text(server.feature)} · 成立于 ${text(guild.founded)}</p>
    <p class="meta">${memberCount} 位成员 · ${territories.length} 处登记领地 · ${buildingCount} 处公会建筑</p>
  </header>

  ${pagerTop}

  ${pageSections}

  <nav class="pager pager-bottom" aria-label="翻页">
    <a class="pager-step" id="page-prev" href="#${pageDefs[0].id}" data-step="1" aria-disabled="true">← 上一页</a>
    <span id="page-count" aria-live="polite">第 1 / ${pageDefs.length} 页</span>
    <a class="pager-step" id="page-next" href="#${pageDefs.length > 1 ? pageDefs[1].id : pageDefs[0].id}" data-step="${pageDefs.length > 1 ? 2 : 1}">下一页 →</a>
  </nav>

  <footer>
    ${statement}
    <p><a href="${esc(siteUrl)}">返回完整站点：${esc(siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></p>
    <p>本页为极简模式：没有图片、动画和色彩，只保留文字信息与分页导航。</p>
  </footer>
</main>
${pagerScript}
</body>
</html>
`
}
