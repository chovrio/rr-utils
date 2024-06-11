export interface Test {
	name: string;
	age: number;
}

export default [
	{
		url: '/mock/api/getList',
		name: 'Test',
		method: 'get',
		response: origin => {
			return origin;
		},
		option: {}
	}
];
