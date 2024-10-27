import { calcTimeByProgress, timingMap } from '../src/utils'

describe('calcTimeByProgress', () => {
	it('should return the correct time for a given progress', () => {
		// Positive test case
		const params = {
			duration: 1000,
			timing: (t: number) => t,
		}
		expect(calcTimeByProgress(0, params)).toBe(0)
		expect(calcTimeByProgress(0.5, params)).toBe(500)
		expect(calcTimeByProgress(1, params)).toBe(1000)
		expect(calcTimeByProgress(-0.5, params)).toBe(0)
	})

	it('should handle edge cases correctly', () => {
		// Edge case: duration is 1000
		const params = { duration: 1000, timing: timingMap.linear }
		expect(calcTimeByProgress(0, params)).toBe(0)
		expect(calcTimeByProgress(1, params)).toBe(1000)

		// Edge case: duration is 0
		const params2 = { duration: 0, timing: timingMap.linear }
		expect(calcTimeByProgress(0, params2)).toBe(0)
		expect(calcTimeByProgress(1, params2)).toBe(0)
	})
})

describe('timingMap', () => {
	test('should return the expected values for each timing function', () => {
		expect(timingMap.linear(0.5)).toBe(0.5)
		expect(timingMap.easeIn(0.5)).toBe(0.25)
		expect(timingMap.easeOut(0.5)).toBe(0.75)
		expect(timingMap.easeInOut(0.5)).toBe(0.5)
	})
})
