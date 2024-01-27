// this was what i used previous to linesEndIndex
export const setLines = (c) => {
  let lines = Array(2 * c - 1);
  let j = 1;
  for (let i = 0; i < lines.length - 1; i += 2) {
    lines[i] = j.toString();
    lines[i + 1] = "\n";
    j++;
  }

  lines[lines.length - 1] = c.toString();
  return lines.join("");
};
// this is better for performance
export const linesEndIndex = (n) => {
  const digits = Math.floor(Math.log10(n) + 1);
  let lastIndex = 0;
  for (let i = 0; i < digits; i++) {
    const steps = Math.min(n, Math.pow(10, i + 1) - 1) - Math.pow(10, i) + 1;
    lastIndex += steps * (i + 2);
  }
  return lastIndex - 1;
};
