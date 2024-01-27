// changes
import React from "react";
import { Component } from "react";
import Parse from "./parse/Parse";
import { maxChars, maxLines } from "../myData/limits";
import setV2d from "../myUtils/setV2d";
import textLinesStr from "../myData/textLinesStr";
import { linesEndIndex } from "../myUtils/setLines";
import "./TextboxStyles.css";
// buffer to hold line instructions
let textBuffer = setV2d(maxLines + 10, maxChars + 10, "array", "0");
// timer to delay the time between text (instructions) update and processing said text
let myTimer;

class Textbox extends Component {
  constructor(props) {
    super(props);
    // init state from text coming from app component
    // to restore graph before resizing
    this.state = this.processEventString(props.t3Val, false);
    // textbox to number the lines
    this.t1 = React.createRef();
    // textbox to hold instructions
    this.t2 = React.createRef();
    // init graph data
    this.setGraphInfo(this.state.rowsN, false);
  }
  // this method is called when a prop or the state changes
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.t3Val !== this.props.t3Val) {
      // process new graph from new text coming from app
      this.processAndSend(this.props.t3Val, false, false);
    } else if (
      prevProps.bools.isDirectedMain !== this.props.bools.isDirectedMain
    ) {
      // alternate between directed and undirected graph
      this.props.funcs.setIsUpdate(false);
      this.setGraphInfo(this.state.rowsN, false);
    }
  }
  componentWillUnmount() {
    // update text before unmounting
    this.props.funcs.updateSavedText(this.state.t2Val);
  }
  setT1Val = (t1Val) => {
    this.setState({ t1Val });
  };
  setT2Val = (t2Val) => {
    this.setState({ t2Val });
  };
  setRowsN = (rowsN) => {
    this.setState({ rowsN });
  };
  processEventString = (s, isDemo = false) => {
    // s is the string to be processed to build the graph
    // isDemo are we processing a demo
    const { setIsUpdate } = this.props.funcs;
    // dont allow user to update box area text
    setIsUpdate(false);
    let cols = 1;
    let rows = 0;

    // read text into the buffer to execute instructions
    for (let i = 0; rows < maxLines - 1 && i < s.length; i++) {
      // make sure not to exceed max char/line and max lines
      if (cols >= maxChars && !(cols === maxChars && s[i] === "\n")) {
        continue;
      }
      textBuffer[rows][cols++] = s[i];
      if (s[i] === "\n") {
        textBuffer[rows][0] = cols;
        cols = 1;
        rows++;
      }
    }
    textBuffer[rows][cols++] = null;
    textBuffer[rows][0] = cols;

    return {
      t2Val: s,
      t1Val: textLinesStr.substring(0, linesEndIndex(rows + 1)),
      rowsN: rows + 1,
    };
  };
  setGraphInfo = (rowsN, isDelay = true) => {
    const { setGraphInfo } = this.props.funcs;
    const { isDirectedMain } = this.props.bools;
    // delay by 350 ms if isDelay
    // when the user updates text we dont want to instantly update the ui
    // bad naming, this is not a recursive call
    if (isDelay) {
      clearTimeout(myTimer);
      myTimer = setTimeout(() => {
        setGraphInfo(Parse.parseAllLines(textBuffer, rowsN, isDirectedMain));
      }, 350);
    } else {
      // run with no delay, dp this when loading random demo for example
      setGraphInfo(Parse.parseAllLines(textBuffer, rowsN, isDirectedMain));
    }
  };
  processAndSend = (s = "", isDemo = false, isDelay = true) => {
    const state = this.processEventString(s, isDemo);
    // after state is updated, set the graph info, its done with
    // following async call
    this.setState(state, async () => {
      this.setGraphInfo(state.rowsN, isDelay);
    });
  };
  getCurText = () => {
    return this.state.t2Val;
  };
  render() {
    const state = this.state;
    // if there is an animation running, dont allow the user to update
    const { isAnime } = this.props.bools;
    return (
      <div className="text-area-div">
        <textarea
          className="t1"
          value={state.t1Val}
          ref={this.t1}
          readOnly
        ></textarea>
        <textarea
          value={state.t2Val}
          ref={this.t2}
          className="t2"
          autoCorrect={"off"}
          spellCheck={false}
          readOnly={isAnime}
          onScroll={(e) => {
            // scroll with the second textbox
            this.t1.current.scrollTop = e.target.scrollTop;
          }}
          onChange={(e) => {
            // process the text after changing
            this.processAndSend(e.target.value);
          }}
        ></textarea>
      </div>
    );
  }
}
export default Textbox;
