import { randomNum } from "./number";

export const generate_string = (min: number, max: number) => {
  const random = Math.random();
  if (random > 0.5) return generate_en(min, max);
  else return generate_cn(min, max);
};

export const generate_en = (min: number, max: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = randomNum(min, max);
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generate_cn = (min: number, max: number) => {
  let result = "";
  const len = randomNum(min, max);
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(
      Math.floor(Math.random() * (0x9fa5 - 0x4e00) + 0x4e00),
    );
  }
  return result;
};
