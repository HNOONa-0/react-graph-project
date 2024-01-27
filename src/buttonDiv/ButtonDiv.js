import { Component } from "react";
import Button from "../button/Button";
import "./ButtonDivStyles.css";

const buttonTextData = [
  "Reset scale",
  "Scatter",
  "Load random demo",
  "DFS",
  "BFS",
  "Tree",
  "Undirected",
  "Directed",
  "Download as PNG",
];
class ButtonDiv extends Component {
  constructor(props) {
    super(props);
  }
  onClick = (buttonText, state = undefined) => {
    const {
      resetScale,
      scatter,
      loadRandomDemo,
      animateDFS,
      animateBFS,
      tree,
      setIsDirectedMain,
      downloadURI,
    } = this.props.funcs;
    // could have just used a map but every button calls the right function
    switch (buttonText) {
      case "Reset scale":
        resetScale();
        break;
      case "Scatter":
        scatter();
        break;
      case "Load random demo":
        loadRandomDemo();
        break;
      case "DFS":
        animateDFS();
        break;
      case "BFS":
        animateBFS();
        break;
      case "Tree":
        tree();
        break;
      case "Undirected":
        if (state) setIsDirectedMain(false);
        break;
      case "Directed":
        if (!state) setIsDirectedMain(true);
        break;
      case "Download as PNG":
        downloadURI();
        break;
      default:
        break;
    }
  };
  render() {
    const { isDirectedMain, isUpdate, isAnime } = this.props.bools;
    // i had to divide button div into smaller flexboxes to get desired behaviour
    return (
      <div className="button-div-1">
        <div className="button-div-2">
          <Button
            // i should instead have used the disabled property
            onClick={isUpdate || isAnime ? null : this.onClick}
            buttonText={"Reset scale"}
            className={"button-1 button-4"}
            isDirectedMain={isDirectedMain}
          />
          <Button
            onClick={isUpdate || isAnime ? null : this.onClick}
            buttonText={"Scatter"}
            className={"button-1"}
            isDirectedMain={isDirectedMain}
          />
          <Button
            onClick={isUpdate || isAnime ? null : this.onClick}
            buttonText={"Load random demo"}
            className={"button-1"}
            isDirectedMain={isDirectedMain}
          />
          <div className="button-div-3">
            <Button
              onClick={isUpdate || isAnime ? null : this.onClick}
              buttonText={"DFS"}
              className={"button-1 button-3"}
              isDirectedMain={isDirectedMain}
            />
            <Button
              onClick={isUpdate || isAnime ? null : this.onClick}
              buttonText={"BFS"}
              className={"button-1 button-3"}
              isDirectedMain={isDirectedMain}
            />
          </div>
        </div>
        <div className="button-div-2">
          <Button
            onClick={isUpdate || isAnime ? null : this.onClick}
            buttonText={"Tree"}
            className={"button-1"}
            isDirectedMain={isDirectedMain}
          />
          <div className="button-div-3">
            <Button
              onClick={isUpdate || isAnime ? null : this.onClick}
              buttonText={"Undirected"}
              className={"button-1 " + (!isDirectedMain ? "darker-button" : "")}
              isDirectedMain={isDirectedMain}
            />
            <Button
              onClick={isUpdate || isAnime ? null : this.onClick}
              buttonText={"Directed"}
              className={"button-1 " + (isDirectedMain ? "darker-button" : "")}
              isDirectedMain={isDirectedMain}
            />
          </div>
        </div>
        <div className="button-div-2">
          <Button
            onClick={isUpdate || isAnime ? null : this.onClick}
            buttonText={"Download as PNG"}
            className={"button-1 button-5"}
            isDirectedMain={isDirectedMain}
          />
        </div>
      </div>
    );
  }
}
export default ButtonDiv;
