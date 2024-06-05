import type { Config } from 'prettier';

const config: Config = {
	arrowParens: 'avoid', // 箭头函数参数周围是否要有括号，'avoid' 表示在只有一个参数时省略括号
	bracketSpacing: true, // 对象字面量中的括号旁是否要添加空格，例如: { foo: bar }
	bracketSameLine: false, // 是否将多行 HTML (HTML, JSX, Vue, Angular) 元素的 > 放在最后一行的末尾，而不是单独一行
	endOfLine: 'lf', // 使用的换行符类型: 'lf' (Unix), 'crlf' (Windows), 'cr' (老 Mac), or 'auto'
	jsxSingleQuote: false, // JSX 中是否使用单引号
	printWidth: 120, // 每行的最大长度
	proseWrap: 'never', // 是否将超过 printWidth 的 markdown 文本自动换行
	semi: true, // 每个语句末尾是否有分号
	singleQuote: true, // 是否用单引号替代双引号
	tabWidth: 2, // 一个 tab 占用的空格数
	trailingComma: 'none', // 是否在对象和数组的尾部加逗号，例如: [1, 2, 3,]
	useTabs: true // 是否使用 tab 来进行缩进
};

module.exports = config;
