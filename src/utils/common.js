export function setMeta(title, description, keywords, icon) {
  // 设置标题
  document.title = title

  // 设置描述
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', description)
  }

  // 设置关键词
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  if (metaKeywords) {
    metaKeywords.setAttribute('content', keywords)
  }

  // 设置站点图标
  const webico = document.querySelector('link[rel="icon"]')
  if (webico) {
    webico.href = icon
  }
}

export function getFormattedTime(currentDate) {
  return currentDate
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/:/g, ' : ')
}

export function getFormattedDate(currentDate) {
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][currentDate.getDay()]

  return `${year} 年 ${month} 月 ${day} 日 ${weekday}`
}

export function dataConsole() {
  console.log(
    '%c 伊甸园 · EDEN ',
    'background-color:#7a66d6;color:#FFFFFF;font-size:22px;font-weight:bold;padding:8px 16px;border-radius:6px;'
  )
  console.log(
    '%c 循此踏入伊甸 —— 铃兰花圃 1.21.11 ',
    'color:#ef9ac1;font-size:13px;'
  )
  console.log(
    `%c Copyright © ${new Date().getFullYear()} Eden Guild `,
    'color:#999;font-size:11px;'
  )
}
