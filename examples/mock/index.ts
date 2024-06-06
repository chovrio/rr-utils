import { Mock } from '@rr-utils/mock';

// 示`例 TypeScript 代码
const sourceCode = `
interface Result<T> {
	code: number;
	message: string;
	data: T;
}

interface User {
	name: string;
	age: number;
	address: string;
  map: Map<Test, User>;
	set: Set;
}

interface Obj {
	name: string;
	age: number;
	address: string;
}

type R1 = Result<User>;

interface R2 extends Result<User> {
	sex: false
};

enum Test {
	A = 'a',
  B = 'b'
}
`;

const mock = new Mock(sourceCode);

const data = mock.generate('R1');
if (typeof data !== 'string') {
	console.log(data);
}

// 生成并打印 AST
