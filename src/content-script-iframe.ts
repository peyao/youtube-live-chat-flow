import FlowController from '~/utils/flow-controller'
import chat from '~/assets/chat.svg'
import downArrow from '~/assets/down-arrow.svg'
import refresh from '~/assets/refresh.svg'
import { querySelectorAsync } from '~/utils/dom-helper'

const controller = new FlowController()
let observer: MutationObserver | undefined

const menuButtonConfigs = [
  {
    svg: downArrow,
    title: 'Follow New Messages',
    className: 'ylcf-follow-button',
    onclick: async () =>
      await chrome.runtime.sendMessage({ type: 'menu-button-clicked' }),
    isActive: () => controller.following,
  },
  {
    svg: refresh,
    title: 'Reload Frame',
    className: 'ylcf-reload-button',
    onclick: () => window.location.reload(),
    isActive: () => false,
  },
]

const updateControlButton = () => {
  const button = parent.document.querySelector('.ylcf-control-button')
  button && button.setAttribute('aria-pressed', String(controller.enabled))
}

const removeControlButton = () => {
  const button = parent.document.querySelector('.ylcf-control-button')
  button && button.remove()
}

const addControlButton = () => {
  removeControlButton()

  const controls = parent.document.querySelector(
    '.ytp-chrome-bottom .ytp-chrome-controls .ytp-right-controls'
  )
  if (!controls) {
    return
  }

  const button = document.createElement('button')
  button.classList.add('ytp-button', 'ylcf-control-button')
  button.title = 'Flow messages'
  button.onclick = async () =>
    await chrome.runtime.sendMessage({ type: 'control-button-clicked' })
  button.innerHTML = chat

  // Change SVG viewBox
  const svg = button.querySelector('svg')
  if (svg) {
    svg.setAttribute('viewBox', '-8 -8 40 40')
    svg.setAttribute('height', '100%')
    svg.setAttribute('width', '100%')
  }

  controls.prepend(button)

  updateControlButton()
}

const removeChatInput = () => {
  const chatInput = parent.document.querySelector('.ylcf-control-chat-input')
  chatInput?.remove()
}

const addChatInput = () => {
  removeChatInput()

  const button = parent.document.querySelector('.ylcf-control-button')
  if (!button) return

  const chatInput = document.createElement('input')
  chatInput.classList.add('ylcf-control-chat-input')

  const handleKeydown = (e: KeyboardEvent) => {
    e.stopPropagation() // prevent default controls (e.g. f - fullscreen) from receiving event
    const el = e.target as HTMLElement
    switch (e.key) {
      case 'Enter': {
        console.log("input value: ", chatInput.value)
        if (!chatInput.value) {
          el.blur()
        } else {
          const textNode = document.createTextNode(chatInput.value)
          const officialChatInput = document.querySelector('#input.yt-live-chat-text-input-field-renderer')
          console.log("el: ", officialChatInput)
          officialChatInput?.appendChild(textNode)
          // TODO: Doesn't work
          // const sendButton = parent.document.querySelector<HTMLButtonElement>(
          //   '#send-button button#button'
          // )
          // sendButton?.click()
        }
        break
      }
      case 'Escape':
      case 'Tab':
        el.blur()
        break
    }
  }
  chatInput.addEventListener('keydown', handleKeydown)
  
  const controls = parent.document.querySelector(
    '.ytp-chrome-bottom .ytp-chrome-controls .ytp-right-controls'
  )
  if (!controls) return
  controls.prepend(chatInput)
}

const updateMenuButtons = () => {
  for (const config of menuButtonConfigs) {
    const button = document.querySelector(`.${config.className}`)
    if (!button) {
      return
    }
    if (config.isActive()) {
      button.classList.add('ylcf-active-menu-button')
    } else {
      button.classList.remove('ylcf-active-menu-button')
    }
  }
}

const addMenuButtons = () => {
  const refIconButton = document.querySelector(
    '#chat-messages > yt-live-chat-header-renderer > yt-icon-button'
  )
  if (!refIconButton) {
    return
  }

  for (const config of menuButtonConfigs) {
    const icon = document.createElement('yt-icon')
    icon.classList.add('yt-live-chat-header-renderer', 'style-scope')

    const iconButton = document.createElement('yt-icon-button')
    iconButton.id = 'overflow'
    iconButton.classList.add(
      'yt-live-chat-header-renderer',
      'style-scope',
      'ylcf-menu-button',
      config.className
    )
    iconButton.title = config.title
    iconButton.onclick = config.onclick
    iconButton.append(icon)

    refIconButton.parentElement?.insertBefore(iconButton, refIconButton)

    // insert svg after wrapper button appended
    icon.innerHTML = config.svg
  }

  updateMenuButtons()
}

const removeChatInputControl = () => {
  const button = parent.document.querySelector('.ylcf-controller')
  button && button.remove()
  parent.document.body.classList.remove('ylcf-input-injected')
}

const moveChatInputControl = () => {
  removeChatInputControl()

  // if no channels
  const interaction = document.querySelector(
    'yt-live-chat-message-input-renderer #interaction-message'
  )
  if (interaction?.children.length) {
    return
  }

  // check inputs
  // container for everything under regular chat box
  const container = document.querySelector(
    'yt-live-chat-message-input-renderer #container'
  )
  container?.classList.add("ylcf-container")

  if (container) {
    const header = document.querySelector('yt-live-chat-header-renderer')
    header?.classList.add("ylcf-with-input")
  }

  // top : element includes live chat input ("Say something..."), user avatar, username
  const top = document.querySelector(
    'yt-live-chat-message-input-renderer #container #top'
  )

  // buttons : element includes buttons for emojis, superchat, live chat input length, send button
  const buttons = document.querySelector(
    'yt-live-chat-message-input-renderer #container #buttons.yt-live-chat-message-input-renderer'
  )
  if (!top || !buttons) {
    return
  }

  // check toolbar
  const leftControls = parent.document.querySelector<HTMLInputElement>(
    '.ytp-chrome-bottom .ytp-chrome-controls .ytp-left-controls'
  )
  const rightControls = parent.document.querySelector<HTMLInputElement>(
    '.ytp-chrome-bottom .ytp-chrome-controls .ytp-right-controls'
  )
  if (!leftControls || !rightControls) {
    return
  }
  // ylcf-control-button

  const input = top.querySelector<HTMLInputElement>('div#input')
  const messageButtons = buttons.querySelector('#message-buttons')
  if (!input || !messageButtons) {
    return
  }
  input.addEventListener('keydown', (e) => {
    e.stopPropagation()
    const el = e.target as HTMLElement
    console.log("e: ", e)
    switch (e.key) {
      case 'Enter': {
        if (!e.isComposing) {
          if (el.innerHTML !== '') {
            const sendButton = messageButtons.querySelector<HTMLButtonElement>(
              '#send-button button#button'
            )
            sendButton?.click()
          } else {
            el.blur()
          }
        }
        break
      }
      case 'Escape':
      case 'Tab':
        el.blur()
        break
    }
  })
  input.addEventListener('focus', () => {
    parent.document.body.classList.add('ylcf-focused-input')
  })
  input.addEventListener('blur', () => {
    parent.document.body.classList.remove('ylcf-focused-input')
  })
  parent.window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      input.focus()
    }
  })

  const controls = document.createElement('div')

  // setup resize observer
  const controlsObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[]) => {
      const [entry] = entries
      if (entry.contentRect.width < 512) {
        parent.document.body.classList.add('ylcf-small-input')
      } else {
        parent.document.body.classList.remove('ylcf-small-input')
      }
    }
  )
  controlsObserver.observe(controls)
}

const getVideoElement = () => {
  return parent.document.querySelector<HTMLVideoElement>(
    'ytd-watch-flexy video.html5-main-video'
  )
}

// div container element where messages will be rendered,
// this is used so we can add an overflow
const addMessageContainer = () => {

  const video = getVideoElement()
  if (!video) return

  let messageContainer = parent.document.querySelector<HTMLDivElement>(
    '.ylcf-message-container'
  )
  if (messageContainer) {
    copyVideoStyle(messageContainer, video)
    return
  }

  const videoContainer = parent.document.querySelector<HTMLDivElement>(
    '.ytd-player .html5-video-player'
  )
  if (!videoContainer) return

  messageContainer = document.createElement('div')
  messageContainer.style.overflow = 'hidden'
  messageContainer.classList.add('ylcf-message-container')
  messageContainer.style.position = 'absolute'
  copyVideoStyle(messageContainer, video)

  function copyVideoStyle(messageContainer: HTMLDivElement, video: HTMLVideoElement) {
    messageContainer.style.top = video.style.top
    messageContainer.style.left = video.style.left
    messageContainer.style.height = video.style.height
    messageContainer.style.width = video.style.width
  }

  videoContainer.appendChild(messageContainer)
}

const addVideoEventListener = () => {
  const video = getVideoElement()
  if (!video) return

  video.addEventListener('play', () => controller.play())
  video.addEventListener('pause', () => controller.pause())

  moveChatInputControl()
}

const observe = async () => {
  await controller.observe()

  observer = new MutationObserver(async () => {
    moveChatInputControl()
    await controller.observe()
  })

  const itemList = await querySelectorAsync('#item-list.yt-live-chat-renderer')
  if (itemList) {
    observer.observe(itemList, { childList: true })
  }

  // observer = new MutationObserver(() => {
  //   // alert("[observer callback] check console")
  //   moveChatInputControl()
  // })

  const container = await querySelectorAsync('yt-live-chat-message-input-renderer #container')
  if (container) {
    observer.observe(container, { childList: true });
  }
  
  const video = getVideoElement()
  if (!video) return
  const videoResizeObserver = new ResizeObserver(() => {
    addMessageContainer() // resize message container whenever video el resizes
  })
  videoResizeObserver.observe(video)
}

const disconnect = () => {
  controller.disconnect()
  observer?.disconnect()
}

const init = async () => {
  disconnect()
  controller.clear()
  removeControlButton()
  removeChatInputControl()

  addVideoEventListener()
  addControlButton()
  addMenuButtons()
  // addChatInput()
  addMessageContainer()

  await observe()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type, data } = message
  switch (type) {
    case 'url-changed':
      init().then(() => sendResponse())
      return true
    case 'enabled-changed':
      controller.enabled = data.enabled
      updateControlButton()
      return sendResponse()
    case 'following-changed':
      controller.following = data.following
      updateMenuButtons()
      return sendResponse()
    case 'settings-changed':
      controller.settings = data.settings
      return sendResponse()
  }
})

// Used to prevent running handleDOMContentLoaded() twice.
// Because handleVisibilityChange calls handleDomContentLoaded() when re-entering the tab,
// but both handleVisibilityChange & DOMContentLoaded runs when going fullscreen.
let alreadyInited = false

function handleUnload() {
  alreadyInited = false
  disconnect()
  controller.clear()
  removeControlButton()
  removeChatInputControl()
}
async function handleDOMContentLoaded() {
  if (alreadyInited) return
  alreadyInited = true
  const data = await chrome.runtime.sendMessage({ type: 'iframe-loaded' })

  controller.enabled = data.enabled
  controller.following = data.following
  controller.settings = data.settings

  await init()
  
  window.addEventListener('unload', handleUnload)
}
document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)

async function handleVisibilityChange() {
  if (parent.document.visibilityState === "hidden") {
    handleUnload()
  } else {
    handleDOMContentLoaded()
  }
}
document.addEventListener("visibilitychange", handleVisibilityChange);

