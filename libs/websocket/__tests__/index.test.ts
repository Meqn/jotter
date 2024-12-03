/**
 * @jest-environment jsdom
 */
//@ts-nocheck
import WebSocketConnect from '../src/index'

// Mock WebSocket
class MockWebSocket {
	static CONNECTING = 0
	static OPEN = 1
	static CLOSING = 2
	static CLOSED = 3

	url: string
	protocol: string
	readyState: number
	onopen: () => void
	onclose: () => void
	onerror: () => void
	onmessage: () => void
	binaryType: BinaryType
	extensions: string
	bufferedAmount: number

	constructor(url: string, protocols?: string | string[]) {
		this.url = url
		this.protocol = typeof protocols === 'string' ? protocols : (protocols || [])[0] || ''
		this.readyState = MockWebSocket.CONNECTING
		this.binaryType = 'blob'
		this.extensions = ''
		this.bufferedAmount = 0
	}

	send(data: any) {
		this.bufferedAmount = data.length
	}

	close(code?: number, reason?: string) {
		this.readyState = MockWebSocket.CLOSED
	}
}

// Replace global WebSocket with MockWebSocket
;(global as any).WebSocket = MockWebSocket

describe('WebSocketConnect', () => {
	let wsConnect: WebSocketConnect
	let originalWebSocket: WebSocket

	beforeEach(() => {
		// Store original WebSocket
		originalWebSocket = global.WebSocket
		// Replace with MockWebSocket
		global.WebSocket = MockWebSocket
	})

	afterEach(() => {
		// Clean up WebSocket connection if exists
		if (wsConnect) {
			wsConnect.close()
			wsConnect = null
		}
		// Restore original WebSocket
		global.WebSocket = originalWebSocket
	})

	describe('Constructor', () => {
		it('should create a WebSocket connection with default options', () => {
			wsConnect = new WebSocketConnect('ws://example.com')
			expect(wsConnect).toBeDefined()
			expect(wsConnect.url).toBe('ws://example.com')
			expect(wsConnect.readyState).toBe(MockWebSocket.CONNECTING)
		})

		it('should create a WebSocket connection with specific protocols', () => {
			wsConnect = new WebSocketConnect('ws://example.com', ['chat', 'json'])
			expect(wsConnect.protocol).toBe('chat')
		})

		it('should throw error if no URL is provided', () => {
			expect(() => {
				new WebSocketConnect('')
			}).toThrow(TypeError)
		})

		it('should throw error if WebSocket is not supported', () => {
			// Temporarily remove WebSocket from global
			delete (global as any).WebSocket
			expect(() => {
				new WebSocketConnect('ws://example.com')
			}).toThrow(Error)
			// Restore WebSocket
			global.WebSocket = MockWebSocket
		})
	})

	describe('Configuration Options', () => {
		it('should handle custom reconnect options', () => {
			wsConnect = new WebSocketConnect('ws://example.com', {
				reconnect: {
					enabled: true,
					delay: 1000,
					maxAttempts: 20,
				},
			})
			expect(wsConnect['_opt'].reconnect.maxAttempts).toBe(20)
			expect(wsConnect['_opt'].reconnect.delay).toBe(1000)
		})

		it('should handle default reconnect options', () => {
			wsConnect = new WebSocketConnect('ws://example.com', { reconnect: true })

			expect(wsConnect['_opt'].reconnect.maxAttempts).toBe(10)
			expect(wsConnect['_opt'].reconnect.enabled).toBe(true)
		})

		it('should handle custom ping options', () => {
			wsConnect = new WebSocketConnect('ws://example.com', {
				ping: {
					enabled: true,
					interval: 5000,
					message: 'custom ping',
				},
			})
			expect(wsConnect['_opt'].ping.interval).toBe(5000)
			expect(wsConnect['_opt'].ping.message).toBe('custom ping')
		})

		it('should handle message queue options', () => {
			wsConnect = new WebSocketConnect('ws://example.com', {
				messageQueue: {
					enabled: true,
					max: 100,
				},
			})
			expect(wsConnect['_opt'].messageQueue.max).toBe(100)
		})
	})

	describe('Methods', () => {
		beforeEach(() => {
			wsConnect = new WebSocketConnect('ws://example.com', { messageQueue: true })
		})

		it('should send messages', () => {
			const sendSpy = jest.spyOn(wsConnect['ws']!, 'send')

			// Simulate open state
			wsConnect['ws']!.readyState = MockWebSocket.OPEN

			wsConnect.send('test message')
			expect(sendSpy).toHaveBeenCalledWith('test message')
		})

		it('should queue messages when not connected', () => {
			// Ensure connection is not open
			wsConnect['ws']!.readyState = MockWebSocket.CONNECTING

			wsConnect.send('queued message')

			// Check that message was added to queue
			expect(wsConnect['_q'].queue.includes('queued message')).toBeTruthy()
		})

		it('should close connection', () => {
			const closeSpy = jest.spyOn(wsConnect['ws']!, 'close')

			wsConnect.close(1000, 'normal closure')

			expect(closeSpy).toHaveBeenCalledWith(1000, 'normal closure')
			expect(wsConnect.ws).toBeNull()
		})
	})

	describe('Event Handling', () => {
		beforeEach(() => {
			// 使用假的定时器
			jest.useFakeTimers()
			wsConnect = new WebSocketConnect('ws://example.com', { reconnect: true })
		})

		it('should dispatch events', () => {
			const mockOpenListener = jest.fn()
			const mockConnectListener = jest.fn()
			wsConnect.addEventListener('open', mockOpenListener)
			wsConnect.onconnecting = mockConnectListener

			// Simulate open event
			const openEvent = new Event('open')
			wsConnect.dispatchEvent(openEvent)
			wsConnect.dispatchEvent(new Event('connecting'))

			expect(mockOpenListener).toHaveBeenCalled()
			expect(mockConnectListener).toHaveBeenCalled()
		})

		it('should handle reconnection', () => {
			const reconnectListener = jest.fn()
			wsConnect.addEventListener('reconnect', reconnectListener)

			// Simulate connection close event
			const closeEvent = new CloseEvent('close')
			wsConnect['ws']!.onclose!(closeEvent)

			// 模拟等待实际时间，不需要等待 setTimeout 的时间
			jest.advanceTimersByTime(2000)

			expect(reconnectListener).toHaveBeenCalled()
		})
	})

	describe('Getters', () => {
		beforeEach(() => {
			wsConnect = new WebSocketConnect('ws://example.com')
		})

		it('should return correct static and instance constants', () => {
			expect(WebSocketConnect.CONNECTING).toBe(0)
			expect(WebSocketConnect.OPEN).toBe(1)
			expect(WebSocketConnect.CLOSING).toBe(2)
			expect(WebSocketConnect.CLOSED).toBe(3)

			expect(wsConnect.CONNECTING).toBe(0)
			expect(wsConnect.OPEN).toBe(1)
			expect(wsConnect.CLOSING).toBe(2)
			expect(wsConnect.CLOSED).toBe(3)
		})

		it('should get and set binary type', () => {
			wsConnect.binaryType = 'arraybuffer'
			expect(wsConnect.binaryType).toBe('arraybuffer')
		})

		it('should return protocol and extensions', () => {
			expect(wsConnect.protocol).toBeDefined()
			expect(wsConnect.extensions).toBeDefined()
		})
	})

	describe('Edge Cases', () => {
		it('should handle sending invalid data', () => {
			wsConnect = new WebSocketConnect('ws://example.com')

			// Simulate open state
			wsConnect['ws']!.readyState = MockWebSocket.OPEN

			const sendSpy = jest.spyOn(wsConnect['ws']!, 'send')

			// Send undefined
			wsConnect.send(undefined)
			expect(sendSpy).not.toHaveBeenCalled()

			// Send complex object
			wsConnect.send({ key: 'value' })
			expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ key: 'value' }))
		})
	})
})
