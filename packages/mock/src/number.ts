export const randomNum = (min: number, max: number) => {
	return Math.floor(randomFloatNum(min, max));
};

export const randomFloatNum = (min: number, max: number, fixed: number = 2) => {
	return Number((Math.random() * (max - min) + min).toFixed(fixed));
};
