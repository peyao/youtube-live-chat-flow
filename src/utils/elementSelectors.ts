export const CLASS = {
  CONTROL_BUTTON: 'ylcf-control-button',
  ACTIVE_MENU_BUTTON: 'ylcf-active-menu-button',
  MENU_BUTTON: 'ylcf-menu-button',
  MESSAGE_CONTAINER: 'ylcf-message-container'
}

export const SELECTOR = {
  CONTROL_BUTTON: `.${CLASS.CONTROL_BUTTON}`,
  MESSAGE_CONTAINER: `.${CLASS.MESSAGE_CONTAINER}`,
  YT_LEFT_CONTROLS: '.ytp-chrome-bottom .ytp-chrome-controls .ytp-left-controls',
  YT_RIGHT_CONTROLS: '.ytp-chrome-bottom .ytp-chrome-controls .ytp-right-controls',
  REF_ICON_BUTTON: '#chat-messages > yt-live-chat-header-renderer > yt-icon-button',

  // video
  YTD_PLAYER: '.ytd-player .html5-video-player',
  YTD_WATCH_FLEXY: 'ytd-watch-flexy video.html5-main-video',
  YTD_WATCH_FLEXY_CHAT_PADDING: '#panels-full-bleed-container',

  // chat
  YTD_LIVE_CHAT_FRAME: 'ytd-live-chat-frame',
}

export function getControlButton(document: Document) {
  return document.querySelector(SELECTOR.CONTROL_BUTTON)
}

export function getRefIconButton(document: Document) {
  return document.querySelector(SELECTOR.REF_ICON_BUTTON)
}

export function getMessageContainer(document: Document) {
  return document.querySelector<HTMLDivElement>(SELECTOR.MESSAGE_CONTAINER)
}

// YouTube Specific
export function getYouTubeLeftControls(document: Document) {
  return document.querySelector(SELECTOR.YT_LEFT_CONTROLS)
}

export function getYouTubeRightControls(document: Document) {
  return document.querySelector(SELECTOR.YT_RIGHT_CONTROLS)
}

// What is this?
export function getYouTubeVideoContainer(document: Document) {
  return document.querySelector(SELECTOR.YTD_PLAYER)
}

export function getYouTubeVideoElement(document: Document) {
  return document.querySelector<HTMLVideoElement>(SELECTOR.YTD_WATCH_FLEXY)
}

export function getYouTubeLiveChatFrame(document: Document) {
  return document.querySelector<HTMLElement>(SELECTOR.YTD_LIVE_CHAT_FRAME)
}

