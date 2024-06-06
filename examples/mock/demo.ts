interface Result<T> {
	code: number;
	message: string;
	data: T;
}

interface User {
	name: string;
	age: number;
	address: string;
}

type R1 = Result<User>;
