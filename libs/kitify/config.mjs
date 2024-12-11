export default {
	input: [
		{
			input: 'src/index.ts',
			name: 'kitify',
		},
		{
			input: 'src/type.ts',
			name: 'kitifyType',
		},
	],
	formats: ['cjs', 'esm', 'umd'],
	target: ['es2015', 'es5'],
	outDir: 'dist',
}
