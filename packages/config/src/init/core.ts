import minimist from 'minimist';

const argv = minimist<{
	t?: string;
	template?: string;
}>(process.argv.slice(2), { string: ['_'] });
// 当前程序的执行目录
async function init() {
	// 命令行第一个参数，替换反斜杠 / 为空字符串
	const argTargetDir = formatTargetDir(argv._[0]);
	console.log('argTargetDir', argTargetDir);
}

init().catch(error => {
	console.error(error);
});

function formatTargetDir(targetDir: string) {
	return targetDir?.trim().replace(/\/+$/g, '');
}
