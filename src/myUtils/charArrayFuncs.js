// my own version of ranged slice
// i implemented this because i was confused about mutability of js
export const mySubstr = (arr, i, j) => {
  return arr.slice(i, j).join("");
};
