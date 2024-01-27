import { maxNodeLen, maxNodes } from "../myData/limits";

export const validateNodeNumber = (charArray, start, charArrayN, lenLimit) => {
  // check that the number lies strictly in the range 1...maxNodes
  if (charArrayN - start === 0 || charArrayN - start > lenLimit) return false;

  let n = parseInt(charArray.slice(start, charArrayN).join(""));
  return isNaN(n) ||
    n < 0 ||
    (!n && lenLimit === maxNodeLen) ||
    (!n && s.length > 1) ||
    (lenLimit === maxNodeLen && n > maxNodes)
    ? null
    : n;
};
