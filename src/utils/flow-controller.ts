import { semaphore } from '~/utils/semaphore'
import { Message, Settings } from '~/models'
import { querySelectorAsync, waitAllImagesLoaded } from '~/utils/dom-helper'
import MessageSettings from '~/utils/message-settings'
import { parse } from '~/utils/message-parser'
import { render } from '~/utils/message-renderer'

const SEM_PERMITS = Number.MAX_SAFE_INTEGER // overridden by "Max Messages" setting
let sem = semaphore(SEM_PERMITS, SEM_PERMITS)

interface Timeline {
  willAppear: number
  didAppear: number
  willDisappear: number
  didDisappear: number
}

export default class FlowController {
  private _enabled = false
  private _following = false
  private _settings: Settings | undefined
  private timelines: Timeline[][] = []
  private observer: MutationObserver | undefined
  private followingTimer = -1
  private cleanupTimer = -1

  get enabled() {
    return this._enabled
  }

  set enabled(value: boolean) {
    this._enabled = value
    if (!this._enabled) {
      this.clear()
    }
  }

  get following() {
    return this._following
  }

  set following(value: boolean) {
    this._following = value
    if (value) {
      const scrollToBottom = () => {
        const hovered = !!document.querySelector('#chat:hover')
        if (hovered) {
          return
        }
        const scroller = document.querySelector('#item-scroller')
        if (scroller) {
          scroller.scrollTop = scroller.scrollHeight
        }
      }
      scrollToBottom()
      this.followingTimer = window.setInterval(scrollToBottom, 1000)
    } else {
      clearInterval(this.followingTimer)
    }
  }

  get settings() {
    return this._settings
  }

  set settings(value: Settings | undefined) {
    this._settings = value
    const numSemPermits = value?.maxDisplays || SEM_PERMITS
    sem = semaphore(numSemPermits, numSemPermits)
  }

  private async proceed(element: HTMLElement) {
    sem.acquire(async () => {
      if (!this._enabled || !this.settings) {
        return
      }

      const video = parent.document.querySelector<HTMLVideoElement>(
        'ytd-watch-flexy video.html5-main-video'
      )
      if (!video || video.paused) {
        return
      }

      const container = parent.document.querySelector<HTMLElement>(
        '.ylcf-message-container'
      )
      if (!container) return

      const [lines, height] = this.getLinesAndHeight(
        video.offsetHeight,
        this.settings
      )

      const message = await parse(element)
      if (!message) {
        return
      }

      const me = await this.createMessageElement(message, height, this.settings)
      if (!me) {
        return
      }

      me.style.display = 'none'
      container.appendChild(me)
      await waitAllImagesLoaded(me)

      if (!this.settings || video.paused) {
        me.remove()
        return
      }

      me.style.display = 'flex'

      const messageRows = Math.ceil(me.offsetHeight / Math.ceil(height))
      const timeline = this.createTimeline(me, container.offsetWidth, this.settings)

      const index = this.getIndex(lines, messageRows, timeline)
      if (index + messageRows > lines && this.settings.overflow === 'hidden') {
        me.remove()
        return
      }
      this.pushTimeline(timeline, index, messageRows)

      const z = Math.floor(index / lines)
      const y = (index % lines) + (z % 2 > 0 ? 0.5 : 0)
      const opacity = this.settings.opacity ** (z + 1)
      const top =
        this.settings.stackDirection === 'bottom_to_top'
          ? video.offsetHeight - height * (y + messageRows + 0.1)
          : height * (y + 0.1)

      me.style.top = `${top}px`
      me.style.opacity = String(opacity)
      me.style.zIndex = String(z + 1 + 11) // 11 is set to z-index on div.webgl

      const animation = this.createAnimation(me, container.offsetWidth, this.settings)
      animation.play()

      return new Promise((resolve) => {
        animation.onfinish = () => {
          me.remove()
          resolve(); // sem is released on promise resolve
        }
      })
    })
  }

  private getLinesAndHeight(videoHeight: number, settings: Settings) {
    let lines, height
    if (settings.heightType === 'fixed') {
      height = settings.lineHeight
      lines = Math.floor((videoHeight - height * 0.2) / height)
    } else {
      lines = settings.lines
      height = videoHeight / (lines + 0.2)
    }
    lines = settings.maxLines > 0 ? Math.min(settings.maxLines, lines) : lines
    return [lines, height]
  }

  private async createMessageElement(
    message: Message,
    height: number,
    settings: Settings
  ) {
    const ms = new MessageSettings(message, settings)
    if (!ms.template) {
      return null
    }

    const element = render(ms.template, {
      ...message,
      author: ms.author ? message.author : undefined,
      avatarUrl: ms.avatar ? message.avatarUrl : undefined,
      fontColor: ms.fontColor,
      fontStyle: ms.fontStyle,
      backgroundColor: ms.backgroundColor,
      height,
      width: settings.maxWidth,
      outlineRatio: settings.outlineRatio,
      emojiStyle: settings.emojiStyle,
    })

    if (!element) {
      return null
    }

    element.classList.add('ylcf-flow-message')

    return element
  }

  private createTimeline(
    element: HTMLElement,
    containerWidth: number,
    settings: Settings
  ) {
    const displayMillis = settings.displayTime * 1000
    const delayMillis = settings.delayTime * 1000
    const w = element.offsetWidth
    const v = (containerWidth + w) / displayMillis
    const t = w / v
    const n = Date.now()

    return {
      willAppear: n + delayMillis,
      didAppear: n + t + delayMillis,
      willDisappear: n + displayMillis - t + delayMillis,
      didDisappear: n + displayMillis + delayMillis,
    }
  }

  private createAnimation(
    element: HTMLElement,
    containerWidth: number,
    settings: Settings
  ) {

    const duration = settings.displayTime * 1000
    const delay = settings.delayTime * 1000
    const numSteps = settings.performanceThrottling;
    const easing = numSteps === 0 ? undefined : `steps(${numSteps}, end)`;
    const keyframes = [
      { transform: `translate(${containerWidth}px, 0px)` },
      { transform: `translate(${0 - element.offsetWidth}px, 0px)` },
    ]
    const animation = element.animate(keyframes, { duration, delay, easing })
    animation.pause()
    return animation
  }

  private isDeniedIndex(index: number, lines: number) {
    // e.g. if lines value is "12", denied index is "23", "47", "71" ...
    return index % (lines * 2) === lines * 2 - 1
  }

  private getIndex(lines: number, messageRows: number, timeline: Timeline) {
    let index = this.timelines.findIndex((_, i, timelines) => {
      const mod = (i + messageRows) % lines
      if (mod > 0 && mod < messageRows) {
        return false
      }
      return Array(messageRows)
        .fill(1)
        .every((_, j) => {
          if (this.isDeniedIndex(i + j, lines)) {
            return false
          }

          const ts = timelines[i + j]
          if (!ts) {
            return true
          }

          const t = ts[ts.length - 1]
          if (!t) {
            return true
          }

          return (
            t.didDisappear < timeline.willDisappear &&
            t.didAppear < timeline.willAppear
          )
        })
    })
    if (index === -1) {
      index = this.timelines.length
      const mod = (index + messageRows) % lines
      if (mod > 0 && mod < messageRows) {
        index += messageRows - mod
      }
      if (this.isDeniedIndex(index + messageRows - 1, lines)) {
        index += messageRows
      }
    }
    return index
  }

  private pushTimeline(timeline: Timeline, index: number, messageRows: number) {
    Array(messageRows)
      .fill(1)
      .forEach((_, j) => {
        const i = index + j
        if (!this.timelines[i]) {
          this.timelines[i] = []
        }
        this.timelines[i].push(timeline)
      })
  }

  async observe() {
    this.observer?.disconnect()

    const items = await querySelectorAsync(
      '#items.yt-live-chat-item-list-renderer'
    )
    if (!items) {
      return
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const nodes = Array.from(mutation.addedNodes)
        nodes.forEach((node: Node) => {
          if (node instanceof HTMLElement) {
            this.proceed(node)
          }
        })
      })
    })
    this.observer.observe(items, { childList: true })

    this.cleanupTimer = window.setInterval(() => {
      this.timelines = this.timelines.map((timelines) => {
        return timelines.filter((timeline) => {
          return timeline.didDisappear > Date.now()
        })
      })
    }, 1000)
  }

  disconnect() {
    clearInterval(this.cleanupTimer)
    this.observer?.disconnect()
  }

  play() {
    parent.document.querySelectorAll('.ylcf-flow-message').forEach((e) => {
      e.getAnimations().forEach((a) => a.play())
    })
  }

  pause() {
    parent.document.querySelectorAll('.ylcf-flow-message').forEach((e) => {
      e.getAnimations().forEach((a) => a.pause())
    })
  }

  clear() {
    parent.document.querySelectorAll('.ylcf-flow-message').forEach((e) => {
      e.remove()
    })
    this.timelines = []
  }
}
