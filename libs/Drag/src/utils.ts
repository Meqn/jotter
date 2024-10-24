// Matrix 解析器
export const matrixParser = (() => {
	if (typeof DOMMatrix === 'function') {
		return (transform: string): DOMMatrix => new DOMMatrix(transform)
	} else if (typeof WebKitCSSMatrix === 'function') {
		return (transform: string): WebKitCSSMatrix => new WebKitCSSMatrix(transform)
	} else {
		// 'matrix(1, 0, 0, 1, 10, 20)'
		// 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 30, 40, 0, 1)'
		const matrixReg = /matrix\((.*)\)/
		const matrix3dReg = /matrix3d\((.*)\)/
		return (transform: string): { m41: number; m42: number } => {
			// 先判断是否为3D矩阵
			const is3dMatrix = transform.indexOf('matrix3d') === 0
			const matches = transform.match(is3dMatrix ? matrix3dReg : matrixReg)
			if (matches) {
				const values = matches[1].split(',').map(parseFloat)
				return {
					m41: values[is3dMatrix ? 12 : 4] || 0,
					m42: values[is3dMatrix ? 13 : 5] || 0,
				}
			}
			return { m41: 0, m42: 0 }
		}
	}
})()
