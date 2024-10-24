/**
 * @jest-environment jsdom
 */
//@ts-nocheck
import { matrixParser } from '../src/utils'

describe('matrixParser', () => {
	const originalDOMMatrix = global.DOMMatrix
	const originalWebKitCSSMatrix = global.WebKitCSSMatrix

	beforeEach(() => {
		// 清除之前的所有模拟
		global.DOMMatrix = undefined
		global.WebKitCSSMatrix = undefined
	})

	afterEach(() => {
		// 恢复原始值
		global.DOMMatrix = originalDOMMatrix
		global.WebKitCSSMatrix = originalWebKitCSSMatrix
	})

	describe('DOMMatrix', () => {
		beforeEach(() => {
			global.DOMMatrix = originalDOMMatrix
		})

		test('应该正确解析 2D matrix', () => {
			const result = matrixParser('matrix(1, 0, 0, 1, 10, 20)')
			expect(result.m41).toBe(10)
			expect(result.m42).toBe(20)
		})

		test('应该正确解析 3D matrix', () => {
			const result = matrixParser('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 30, 40, 0, 1)')
			expect(result.m41).toBe(30)
			expect(result.m42).toBe(40)
		})
	})

	describe('WebKitCSSMatrix', () => {
		beforeEach(() => {
			global.WebKitCSSMatrix = originalWebKitCSSMatrix
		})

		test('应该正确解析 2D matrix', () => {
			const result = matrixParser('matrix(1, 0, 0, 1, 15, 25)')
			expect(result.m41).toBe(15)
			expect(result.m42).toBe(25)
		})

		test('应该正确解析 3D matrix', () => {
			const result = matrixParser('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 35, 45, 0, 1)')
			expect(result.m41).toBe(35)
			expect(result.m42).toBe(45)
		})
	})

	describe('Custom Matrix', () => {
		test('应该正确解析 2D matrix', () => {
			const result = matrixParser('matrix(1, 0, 0, 1, 50, 60)')
			expect(result.m41).toBe(50)
			expect(result.m42).toBe(60)
		})

		test('应该正确解析 3D matrix', () => {
			const result = matrixParser('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 70, 80, 0, 1)')
			expect(result.m41).toBe(70)
			expect(result.m42).toBe(80)
		})

		test('应该处理无效的转换字符串', () => {
			const result = matrixParser('invalid-transform')
			expect(result.m41).toBe(0)
			expect(result.m42).toBe(0)
		})

		test('应该处理空转换字符串', () => {
			const result = matrixParser('')
			expect(result.m41).toBe(0)
			expect(result.m42).toBe(0)
		})
	})
})
