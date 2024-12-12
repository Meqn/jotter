export default function isType(value: any, type?: string): string | boolean {
	const valType = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
	if (type && typeof type === 'string') {
		return valType === type.toLowerCase()
	}
	return valType
}
