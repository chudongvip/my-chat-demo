/**
 * 生成随机数字
 * @param len 数字长度
 * @returns 
 */
export const randomNumber = (len: number = 8): number => {
  let num = Math.ceil(Math.random() * Math.pow(10, len));
  if (num <  Math.pow(10, len - 1)) {
    return randomNumber(len);
  }
  return num;
}
/**
 * 生产随机字符串
 * @param len 字符串长度
 * @returns 
 */
export const randomStringNumber = (len: number = 8) => {
  const num = randomNumber(len);
  return '' + num;
}
