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
	users: Array<User>;
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

const data = mock.generate('Obj', {
	name: {
		type: 'string',
		min: 1,
		max: 2,
		language: 'en'
	},
	age: {
		type: 'number_float',
		min: 0,
		max: 1,
		fixed: 3
	},
	users: {
		type: 'array',
		length: 1
	}
});

console.log(data);
