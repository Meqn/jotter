/**
 * 动画播放控制器
 * 
 * 实现方案:
 * 按时间计算: 开始时间和当前时间 (进度 = (当前时间 - 开始时间) / 总时长)
 */
export class Animation {
  /**
   * 构造函数
   * @param {object} options 参数
   * @param {number} options.duration - 动画时长 
   * @param {function} options.timing - 时序函数
   * @param {function} options.draw - 每帧绘图函数
   * @param {number} options.speed - 播放速度倍率
   * @param {boolean} run 是否立即播放
   */
  constructor(options = {}, run = true) {
    if (typeof options.draw !== 'function') {
      throw new Error('draw must be a function')
    }

    this.duration = options.duration || 1000
    this.timing = options.timing || (t => t) // 时序函数,默认匀速播放
    this.draw = options.draw

    this._speed = options.speed || 1
    this._paused = true // 是否暂停
    this._startTime = 0 // 开始时间
    this._pauseTime = 0 // 暂停时间
    this._rafId = null // requestAnimationFrame id
    this._progress = 0 // 当前进度

    if (run) {
      this.run()
    }
  }

  _getProgress(time) {
    // 继续播放 (开始时间 += 暂停的时间)
    if (this._pauseTime > 0) {
      this._startTime += time - this._pauseTime
      this._pauseTime = 0
    }
    
    // timeFraction 从 0 增加到 1
    const timeFraction = (time - this._startTime) / this.duration * this._speed
    // 计算当前动画状态
    this._progress =  this.timing(Math.min(1, timeFraction))
    return this._progress
  }

  /**
   * 每一帧执行的循环函数
   * @param {number} time 当前时间
   */
  _animate(time) {
    if (this._paused) return

    const progress = this._getProgress(time || performance.now())
    this.draw(progress)

    if (progress < 1) {
      this._rafId = requestAnimationFrame(this._animate.bind(this))
    } else {
      this._reset()
    }
  }

  /**
   * 重置
   */
  _reset() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
    }
    this._rafId = null
    this._paused = true
    this._pauseTime = 0
    this._startTime = 0
    this._progress = 0
  }

  /**
   * 启动动画
   */
  run() {
    if (this._rafId) return
    if (this._paused) this._paused = false

    this._startTime = performance.now()
    this._rafId = requestAnimationFrame(this._animate.bind(this))
  }

  play() {
    // 1. 暂停后播放
    if (this._rafId && this._paused) {
      this._paused = false
      // this._startTime += performance.now() - this._pauseTime
      this._rafId = requestAnimationFrame(this._animate.bind(this))
      return
    }
    // 2. 重新播放
    this.run()
  }

  stop() {
    this._reset()
    this.draw(0)
  }

  pause() {
    this._paused = true
    this._pauseTime = performance.now()
  }

  /**
   * 前进n秒
   * @param {number} time 前进的秒数
   */
  forward(time) {
    if (!this._rafId) return
    time = Math.round(time * 1000)
    // 超出剩余播放时间，会立即结束并重置，无需限制
    this._startTime -= time

    if (this._paused) {
      const p = this._getProgress(performance.now())
      this.draw(p)
      this._pauseTime = performance.now()
      if (p >= 1) this._reset()
    }
  }

  /**
   * 后退n秒
   * @param {number} time 后退的秒数
   */
  backward(time) {
    if (!this._rafId) return

    time = Math.round(time * 1000)
    const now = performance.now()
    // 回退时间不能超出已播放时间
    if (now - this._startTime < time) {
      this._startTime = now
    } else {
      this._startTime += time
    }

    if (this._paused) {
      const p = this._getProgress(performance.now())
      this.draw(p <= 0 ? 0 : p)
      this._pauseTime = performance.now()
      if (p <= 0) this._reset()
    }
  }

  setSpeed(rate) {
    //! 这里逻辑有问题，先简单处理 (播放过的时间按照原始速度，后续的播放按照新的速度)
    if (rate > 0 && !isNaN(rate)) {
      this._speed = rate
    }
  }

  setProgress(progress) {
    if (!this._rafId) return

    const time = (progress - this._progress) * this.duration * this._speed / 1000
    if (time >= 0) {
      // 前进
      this.forward(Math.abs(time))
    } else {
      // 后退
      this.backward(Math.abs(time))
    }
  }
}
