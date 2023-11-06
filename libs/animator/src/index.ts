import type {IOptions} from './types'
import {calcTimeByProgress} from './util'

const defaults: Pick<IOptions, 'duration' | 'timing' | 'render' | 'rate'> = {
  duration: 1000,
  timing: t => t,
  render: () => {},
  rate: 1
}

/**
 * 动画播放控制器
 *
 * 实现方案:
 * 1. 按时长计算: 进行时长和总时长 (进度 = 进行时长 / 总时长) ✅
 * 2. 按时间计算: 开始时间和当前时间 (进度 = (当前时间 - 开始时间) / 总时长)
 */
export default class Animator {
  private options: IOptions

  private _current: number
  private _lastTick: number | null
  private _paused: boolean
  private _rafId: number | null

  constructor(options: IOptions = {}) {
    this.options = Object.assign({}, defaults, options) as IOptions // 设置options (象征性阻止直接修改实例配置属性)

    if (typeof this.options.render !== 'function') {
      throw new Error('[Animator]: render must be a function')
    }

    this._current = 0 // 当前已播放时间
    this._lastTick = 0 // 上一帧的时间
    this._paused = false // 是否暂停
    this._rafId = null // requestAnimationFrame id
  }

  get duration() {
    return this.options.duration
  }

  get rate() {
    return this.options.rate
  }

  setRate(rate: number) {
    this.options.rate = rate
  }

  get loop() {
    return this.options.loop
  }
  setLoop(enable: boolean) {
    this.options.loop = enable
  }

  get progress() {
    return this.options.timing(this._current / this.duration)
  }

  setProgress(progress: number) {
    if (!this._rafId) return

    progress = Math.min(Math.max(progress, 0), 1)
    this._current = calcTimeByProgress(progress, {
      duration: this.duration,
      timing: this.options.timing
    })
    this._render()
  }

  /**
   * 每一帧执行的循环函数
   * @param {number} timestamp 当前时间
   */
  private _tick(timestamp: number) {
    if (!this._paused) {
      const delta = this._lastTick
        ? (timestamp - this._lastTick) * this.rate
        : 0
      this._current += delta
      this._current = Math.min(Math.max(this._current, 0), this.duration)
      this._render()
      if (this._current < this.duration) {
        this._lastTick = timestamp
        this._rafId = requestAnimationFrame(this._tick.bind(this))
      } else {
        // 播放完之后停止
        if (this.loop) {
          this.start()
        } else {
          this.stop()
        }
      }
    }
  }

  private _render() {
    this.options.render(this.options.timing(this._current / this.duration))
  }

  start() {
    this._current = 0
    this._paused = false
    this._lastTick = 0
    this._rafId = requestAnimationFrame(this._tick.bind(this))
  }

  play() {
    // 1. 重新播放
    if (!this._rafId) {
      this.start()
      return
    }

    // 2. 继续播放
    if (this._paused) {
      this._paused = false
      this._lastTick = 0
      this._rafId = requestAnimationFrame(this._tick.bind(this))
    }
  }

  pause() {
    this._paused = true
  }

  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
    }
    this._paused = true
    this._current = 0
    this._lastTick = 0
    this._rafId = null
  }

  /**
   * 前进时间
   * @param {number} time 时间, 单位: ms
   */
  forward(time: number) {
    if (!this._rafId) return

    this._current += time
    this._current = Math.min(this._current, this.duration)
    if (this._paused) {
      this._render()
    }
  }

  /**
   * 后退时间
   * @param {number} time 时间, 单位: ms
   */
  backward(time: number) {
    if (!this._rafId) return

    this._current -= time
    this._current = Math.max(this._current, 0)
    if (this._paused) {
      this._render()
    }
  }
}
