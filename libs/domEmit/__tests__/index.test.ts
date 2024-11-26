/**
 * @jest-environment jsdom
 */
//@ts-nocheck
import DomEmitter from '../index'

// Mock window and document for testing
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()
const mockDispatchEvent = jest.fn()

// 模拟 HTMLElement
class MockHTMLElement {
	addEventListener = mockAddEventListener
	removeEventListener = mockRemoveEventListener
	dispatchEvent = mockDispatchEvent
}

// 定义测试用的事件类型
interface TestEvents {
	'test:event': { data: string }
	'custom:event': { value: number }
}

describe('DomEmitter', () => {
	let emitter: DomEmitter<TestEvents>

	beforeEach(() => {
		// 重置所有的mock函数
		jest.clearAllMocks()

		global.document = {
			createElement: () => new MockHTMLElement(),
			createEvent: () => ({
				initCustomEvent: jest.fn(),
			}),
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
			dispatchEvent: mockDispatchEvent,
		}

		emitter = new DomEmitter()
	})

	afterEach(() => {
		emitter.destroy()
	})

	describe('constructor', () => {
		it('should create instance with default target', () => {
			expect(emitter).toBeInstanceOf(DomEmitter)
		})

		it('should create instance with custom target', () => {
			const target = new MockHTMLElement()
			const customEmitter = new DomEmitter(target as unknown as HTMLElement)
			expect(customEmitter).toBeInstanceOf(DomEmitter)
		})

		it('should throw error when document is undefined', () => {
			// @ts-ignore - 测试环境
			delete global.document
			expect(() => new DomEmitter()).toThrow()
		})
	})

	describe('addEventListener', () => {
		it('should add event listener successfully', () => {
			const listener = jest.fn()
			emitter.addEventListener('test:event', listener)
			expect(mockAddEventListener).toHaveBeenCalledWith('test:event', listener, undefined)
		})

		it('should throw error with invalid event type', () => {
			expect(() => {
				// @ts-ignore - 测试无效类型
				emitter.addEventListener(123, () => {})
			}).toThrow(TypeError)
		})

		it('should throw error with invalid listener', () => {
			expect(() => {
				// @ts-ignore - 测试无效监听器
				emitter.addEventListener('test:event', 'not a function')
			}).toThrow(TypeError)
		})
	})

	describe('removeEventListener', () => {
		it('should remove event listener successfully', () => {
			const listener = jest.fn()
			emitter.addEventListener('test:event', listener)
			emitter.removeEventListener('test:event', listener)
			expect(mockRemoveEventListener).toHaveBeenCalledWith('test:event', listener, undefined)
		})

		it('should handle removing non-existent listener', () => {
			const listener = jest.fn()
			emitter.removeEventListener('test:event', listener)
			expect(mockRemoveEventListener).toHaveBeenCalled()
		})
	})

	describe('dispatchEvent', () => {
		it('should dispatch event successfully', () => {
			const event = new CustomEvent('test:event')
			emitter.dispatchEvent(event)
			expect(mockDispatchEvent).toHaveBeenCalledWith(event)
		})

		it('should dispatch event with additional data', () => {
			const event = new CustomEvent('test:event')
			const data = { extra: 'data' }
			emitter.dispatchEvent(event, data)
			expect(mockDispatchEvent).toHaveBeenCalled()
		})

		it('should throw error with invalid event', () => {
			expect(() => {
				emitter.dispatchEvent('not an event')
			}).toThrow(TypeError)
		})
	})

	describe('createEvent', () => {
		it('should throw TypeError for non-string type', () => {
			expect(() => emitter.createEvent(123 as any)).toThrow(TypeError)
		})

		it('should create event with default options', () => {
			const event = emitter.createEvent('testEvent')
			expect(event.type).toEqual('testEvent')
			expect(event.bubbles).toEqual(true)
			expect(event.cancelable).toEqual(true)
			expect(event.composed).toEqual(false)
			expect(event.detail).toEqual(null)
		})

		it('should create event with custom options', () => {
			const customOptions = {
				bubbles: false,
				cancelable: false,
				composed: true,
				detail: { someData: 'custom' },
			}
			const event = emitter.createEvent('customEvent', customOptions)
			expect(event.type).toEqual('customEvent')
			expect(event.bubbles).toEqual(false)
			expect(event.cancelable).toEqual(false)
			expect(event.composed).toEqual(true)
			expect(event.detail).toEqual(customOptions.detail)
		})

		//Fallback for older browsers
		test('should create event for older browsers', () => {
			const mockCreateEvent = jest.fn().mockReturnValue({ initCustomEvent: jest.fn() })
			const CustomEventOld = global.CustomEvent

			// Mock CustomEvent for older browsers
			global.CustomEvent = undefined
			global.document.createEvent = mockCreateEvent

			emitter.createEvent('testEvent')
			expect(mockCreateEvent).toHaveBeenCalled()

			// Restore original CustomEvent
			global.CustomEvent = CustomEventOld
		})
	})

	describe('on/off methods', () => {
		it('should add listener using on() method', () => {
			const listener = jest.fn()
			emitter.on('test:event', listener)
			expect(mockAddEventListener).toHaveBeenCalled()
		})

		it('should remove listener using off() method', () => {
			const listener = jest.fn()
			emitter.on('test:event', listener)
			emitter.off('test:event', listener)
			expect(mockRemoveEventListener).toHaveBeenCalled()
		})
	})

	describe('once method', () => {
		it('should add one-time event listener', () => {
			const listener = jest.fn()
			emitter.once('test:event', listener)

			// 模拟事件触发
			const event = new CustomEvent('test:event')
			const onceListener = mockAddEventListener.mock.calls[0][1]
			onceListener(event)

			expect(mockRemoveEventListener).toHaveBeenCalled()
			expect(listener).toHaveBeenCalledTimes(1)
		})
	})

	describe('emit method', () => {
		it('should emit custom event', () => {
			const detail = { data: 'test' }
			emitter.emit('test:event', detail)
			expect(mockDispatchEvent).toHaveBeenCalled()
		})

		it('should trigger onxxx handler if exists', () => {
			const handler = jest.fn()
			// @ts-ignore - 测试 onxxx 处理器
			emitter.onTestEvent = handler
			emitter.emit('TestEvent')
			expect(handler).toHaveBeenCalled()
		})
	})

	describe('has/size methods', () => {
		it('should check event existence correctly', () => {
			const listener = jest.fn()
			emitter.on('test:event', listener)
			expect(emitter.has('test:event')).toBe(true)
			expect(emitter.has('non:existent')).toBe(false)
		})

		it('should count listeners correctly', () => {
			const listener1 = jest.fn()
			const listener2 = jest.fn()
			emitter.on('test:event', listener1)
			emitter.on('test:event', listener2)
			expect(emitter.size('test:event')).toBe(2)
		})

		it('should include onxxx handler in count when specified', () => {
			const listener = jest.fn()
			emitter.on('test:event', listener)
			// @ts-ignore - 测试 onxxx 处理器
			emitter.onTestEvent = () => {}
			expect(emitter.size('TestEvent', true)).toBe(1)
		})
	})

	describe('clear method', () => {
		it('should clear all listeners for specific event', () => {
			const listener1 = jest.fn()
			const listener2 = jest.fn()
			emitter.on('test:event', listener1)
			emitter.on('custom:event', listener2)
			emitter.clear('test:event')
			expect(emitter.has('test:event')).toBe(false)
			expect(emitter.has('custom:event')).toBe(true)
		})

		it('should clear all listeners when no event specified', () => {
			const listener1 = jest.fn()
			const listener2 = jest.fn()
			emitter.on('test:event', listener1)
			emitter.on('custom:event', listener2)
			emitter.clear()
			expect(emitter.has('test:event')).toBe(false)
			expect(emitter.has('custom:event')).toBe(false)
		})

		it('should clear onxxx handlers', () => {
			// @ts-ignore - 测试 onxxx 处理器
			emitter.onTestEvent = () => {}
			emitter.clear('TestEvent')
			// @ts-ignore - 测试 onxxx 处理器
			expect(emitter.onTestEvent).toBeUndefined()
		})
	})

	describe('destroy method', () => {
		it('should clean up all resources', () => {
			const listener = jest.fn()
			emitter.on('test:event', listener)
			emitter.destroy()
			expect(emitter.has('test:event')).toBe(false)
		})

		it('should handle multiple destroy calls', () => {
			emitter.destroy()
			expect(() => emitter.destroy()).not.toThrow()
		})
	})
})
