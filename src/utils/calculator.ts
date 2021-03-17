
export const randomNumber = (len: number = 8): number => {
  let num = Math.ceil(Math.random() * Math.pow(10, len));
  if (num <  Math.pow(10, len - 1)) {
    return randomNumber(len);
  }
  return num;
}

export const randomStringNumber = (len: number = 8) => {
  const num = randomNumber(len);
  return '' + num;
}
