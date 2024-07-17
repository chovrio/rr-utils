export default {
	include: ['packages/**/*.spec.ts'],
	test: {
		globals: true,
		environment: 'jsdom'
	}
};
