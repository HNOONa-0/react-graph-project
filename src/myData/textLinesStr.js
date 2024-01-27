import { setLines } from "../myUtils/setLines";
import { maxLines } from "./limits";

// this is a cache string
// its used by text box by directly substringing it
const textLinesStr = setLines(maxLines + 100);
export default textLinesStr;
