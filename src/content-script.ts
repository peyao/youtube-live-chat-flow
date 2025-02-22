import { Settings } from '~/models'
import { querySelectorAsync } from '~/utils/dom-helper'
import { SELECTOR } from './utils/elementSelectors'

let settings: Settings

const isVideoUrl = () => new URL(location.href).pathname === '/watch'

const waitCollapsed = async () => {
  const iframe = await querySelectorAsync(SELECTOR.YTD_LIVE_CHAT_FRAME)
  return new Promise<boolean>((resolve) => {
    const expireTime = Date.now() + 1000
    const timer = window.setInterval(async () => {
      const collapsed = iframe?.hasAttribute('collapsed') ?? false
      if (collapsed || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(collapsed)
      }
    }, 100)
  })
}

const init = async () => {
  if (!isVideoUrl()) {
    return
  }

  if (!settings.chatVisible) {
    return
  }

  const collapsed = await waitCollapsed()
  if (!collapsed) {
    return
  }

  // FIXME: Is this correct? I don't see an anchor in the DOM, but there is a button.
  const button = await querySelectorAsync<HTMLAnchorElement>(
    '#show-hide-button a'
  )
  button && button.click()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type } = message
  switch (type) {
    case 'url-changed':
      init().then(() => sendResponse())
      return true
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.runtime.sendMessage({ type: 'content-loaded' })
  settings = data.settings
  await init()
})
