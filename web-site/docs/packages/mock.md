---
sidebar_position: 1
---

# Mock

解析 interface 生成对应类型的数据

## 使用

```ts
import { Mock } from "@rr-utils/mock";

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
	users: User[];
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

const data = mock.generate("Obj", {
  name: {
    type: "string",
    min: 1,
    max: 2,
    language: "en",
  },
  age: {
    type: "number_float",
    min: 0,
    max: 1,
    fixed: 3,
  },
  users: {
    type: "array",
    length: 1,
  },
});

console.log(data);
/**
 * 
 * 生成数据 
{
  name: '8',
  age: 0.13,
  address: '摏績闁',
  users: [
    {
      name: 'Xz2l',
      age: 35677.67,
      address: '7w',
      map: [Map],
      set: [Set]
    }
  ]
}
 */
```

目前仅支持对大部分基本类型和引用类型进行 mock，其他类型暂不支持

且暂时仅支持对浅层字段进行自定义操作
