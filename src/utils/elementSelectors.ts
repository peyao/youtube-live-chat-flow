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

