interface Result<T> {
  code: number;
  message: string;
  data: T;
}

interface User {
  name: string;
  age: number | string;
  address: string;
}

type R1 = Result<User>;
