export default {
	input: [
		{
			input: 'src/index.ts',
			name: 'kitify',
		},
		//==> type
		{
			input: 'src/type/type.ts',
			name: 'type',
		},
		{
			input: 'src/type/isType.ts',
			name: 'isType',
		},
	],
	formats: ['cjs', 'esm', 'umd'],
	target: ['es2015', 'es5'],
	outDir: 'dist',
}
