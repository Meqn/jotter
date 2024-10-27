import { calcTimeByProgress } from './utils'

interface AnimatorOptions {
	/** 动画持续时间(ms) */
	duration?: number
	/** 时序函数 */
	timing?: (t: number) => number
	/** 渲染函数 */
	render?: (progress: number) => void
	/** 播放速率 */
	rate?: number
	/** 是否循环播放 */
	loop?: boolean
}

const DEFAULT_OPTIONS: Required<AnimatorOptions> = {
	duration: 1000,
	timing: (t) => t,
	render: () => {},
	rate: 1,
	loop: false,
}

/**
 * 动画播放控制器
 *
 * 实现方案:
 * 1. 按时长计算: 进行时长和总时长 (进度 = 进行时长 / 总时长) ✅
 * 2. 按时间计算: 开始时间和当前时间 (进度 = (当前时间 - 开始时间) / 总时长)
 */
class Animator {
	private readonly options: Required<AnimatorOptions>
	private current: number = 0 // 当前已播放时间
	private lastTick: number = 0 // 上一帧的时间
	private isPaused: boolean = false
	private animationFrameId: number | null = null

	constructor(options: AnimatorOptions = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options }
		this.validateOptions()
	}

	private validateOptions(): void {
		if (typeof this.options.render !== 'function') {
			throw new Error('[Animator]: render must be a function')
		}
	}

	// Getters and Setters
	get duration(): number {
		return this.options.duration
	}

	get rate(): number {
		return this.options.rate
	}

	setRate(rate: number): void {
		this.options.rate = rate
	}

	get loop(): boolean {
		return this.options.loop
	}

	setLoop(enable: boolean): void {
		this.options.loop = enable
	}

	get progress(): number {
		return this.options.timing(this.current / this.duration)
	}

	setProgress(progress: number): void {
		if (!this.animationFrameId) return

		const clampedProgress = Math.max(0, Math.min(progress, 1))
		this.current = calcTimeByProgress(clampedProgress, {
			duration: this.duration,
			timing: this.options.timing,
		})
		this.render()
	}

	// Animation Control Methods
	private tick = (timestamp: number): void => {
		if (this.isPaused) return

		const delta = this.lastTick ? (timestamp - this.lastTick) * this.rate : 0

		this.current = Math.max(0, Math.min(this.current + delta, this.duration))
		this.render()

		if (this.current < this.duration) {
			this.lastTick = timestamp
			this.animationFrameId = requestAnimationFrame(this.tick)
		} else {
			this.handleAnimationComplete()
		}
	}

	private handleAnimationComplete(): void {
		if (this.loop) {
			this.start()
		} else {
			this.stop()
		}
	}

	private render(): void {
		this.options.render(this.options.timing(this.current / this.duration))
	}

	start(): void {
		this.current = 0
		this.isPaused = false
		this.lastTick = 0
		this.animationFrameId = requestAnimationFrame(this.tick)
	}

	play(): void {
		// 重新播放
		if (!this.animationFrameId) {
			this.start()
			return
		}

		// 继续播放
		if (this.isPaused) {
			this.isPaused = false
			this.lastTick = 0
			this.animationFrameId = requestAnimationFrame(this.tick)
		}
	}

	pause(): void {
		this.isPaused = true
	}

	stop(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId)
		}
		this.reset()
	}

	private reset(): void {
		this.isPaused = true
		this.current = 0
		this.lastTick = 0
		this.animationFrameId = null
	}

	/**
	 * 前进指定时间
	 * @param time 前进的时间(ms)
	 */
	forward(time: number): void {
		if (!this.animationFrameId) return

		this.current = Math.min(this.current + time, this.duration)
		if (this.isPaused) {
			this.render()
		}
	}

	/**
	 * 后退指定时间
	 * @param time 后退的时间(ms)
	 */
	backward(time: number): void {
		if (!this.animationFrameId) return

		this.current = Math.max(this.current - time, 0)
		if (this.isPaused) {
			this.render()
		}
	}
}

export default Animator
