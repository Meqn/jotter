/**
 * @jest-environment jsdom
 */

import Animator from '../src/index'

describe('Animator', () => {
	let animator: Animator

	beforeEach(() => {
		animator = new Animator({
			render() {},
		})
	})

	afterEach(() => {
		animator.stop()
	})

	describe('constructor', () => {
		it('should create an instance of Animator', () => {
			expect(animator).toBeInstanceOf(Animator)
		})

		it('should set default options', () => {
			expect(animator.duration).toBe(1000)
			expect(animator.rate).toBe(1)
			expect(animator.loop).toBe(false)
		})

		it('should throw an error if render is not a function', () => {
			expect(() => {
				new Animator({ render: 'not a function' } as any)
			}).toThrowError('[Animator]: render must be a function')
		})
	})

	describe('render function', () => {
		it('should call the render function with the correct progress', () => {
			const renderMock = jest.fn((n) => n)
			// @ts-ignore
			animator.options.render = renderMock

			animator.start()

			animator.setProgress(0.75)
			expect(renderMock.mock.calls[0][0]).toBe(0.75)
			expect(renderMock).toBeCalled()
			// @ts-ignore
			expect(renderMock).toHaveBeenCalledWith(animator.options.timing(0.75))
		})
	})

	describe('setRate', () => {
		it('should set the rate', () => {
			animator.setRate(2)
			expect(animator.rate).toBe(2)
		})
	})

	describe('setLoop', () => {
		it('should set the loop', () => {
			animator.setLoop(true)
			expect(animator.loop).toBe(true)
		})
	})

	describe('setProgress', () => {
		it('should set the progress', () => {
			animator.start()
			animator.setProgress(0.6)
			expect(animator.progress).toBe(0.6)
		})

		it('should clamp the progress between 0 and 1', () => {
			animator.start()
			animator.setProgress(-1)
			expect(animator.progress).toBe(0)

			animator.pause()
			animator.setProgress(2)
			expect(animator.progress).toBe(1)
		})
	})

	describe('start', () => {
		it('should start the animation', () => {
			animator.start()
			expect(animator.progress).toBe(0)
		})
	})

	describe('play', () => {
		it('should start the animation if not already started', () => {
			animator.play()
			expect(animator.progress).toBe(0)
		})

		it('should resume the animation if paused', () => {
			animator.start()
			animator.pause()
			animator.play()
			setTimeout(() => {
				expect(animator.progress).toBeGreaterThan(0)
			}, 10)
		})
	})

	describe('pause', () => {
		it('should pause the animation', () => {
			animator.pause()
			expect(animator.progress).toBeGreaterThanOrEqual(0)
		})
	})

	describe('stop', () => {
		it('should stop the animation', () => {
			animator.stop()
			expect(animator.progress).toBe(0)
		})
	})

	describe('forward', () => {
		it('should forward the animation time', () => {
			animator.start()
			animator.forward(500)
			expect(animator.progress).toBeGreaterThan(0.4)
		})

		it('should not forward the animation time if paused', () => {
			animator.pause()
			animator.forward(500)
			expect(animator.progress).toBe(0)
		})
	})

	describe('backward', () => {
		it('should backward the animation time', () => {
			animator.start()
			animator.backward(500)
			expect(animator.progress).toBeLessThan(0.6)
		})

		it('should not backward the animation time if paused', () => {
			animator.start()
			animator.pause()
			animator.backward(500)
			expect(animator.progress).toBe(0)
		})
	})
})
