// changes
// new function that returns objects appropiate to string literal
const objectFromStr = (objectAsStr, index) => {
  objectAsStr = objectAsStr.toString();
  objectAsStr = objectAsStr.toLowerCase();
  // there is a better way to do this
  // maybe by using the spread operator, we would not need this function
  switch (objectAsStr) {
    case "set":
      return new Set();
    case "map":
      return new Map();
    case "array":
      return [];
    case "string":
      return new String();
    case "false":
      return false;
    case "true":
      return true;
    case "null":
      return null;
    case "0":
      return 0;
    case "1":
      // sequence
      return index;
    default:
      return undefined;
  }
};
export default objectFromStr;
