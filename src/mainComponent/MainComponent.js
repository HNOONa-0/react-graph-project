import React, { useEffect, useState } from "react";
import ButtonDiv from "../buttonDiv/ButtonDiv";
import Textbox from "../textbox/Textbox";
import GraphInfo from "../graphInfo/GraphInfo";
import MyStage from "../stage/MyStage";

import Demos from "../myData/demoData";
import { randomBetween } from "../myUtils/myRandomFunctions";
import { setTitle } from "../myUtils/generalDocumentFuncs";

import "./MainComponentStyles.css";

export const MainComponent = (props) => {
  const { savedText, updateSavedText } = props;
  // start the app with an initial random demo
  const [demoIdx, setDemoIdx] = useState(
    savedText ? -1 : randomBetween(0, Demos.length)
  );
  // graph info that is passed to stage
  const [graphInfo, setGraphInfo] = useState(new GraphInfo());
  // states related to buttons
  const [isDirectedMain, setIsDirectedMain] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAnime, setIsAnime] = useState(false);

  // another resize observer mein-stage div
  const [stageDimension, setStageDimension] = useState({ width: 0, height: 0 });
  const [resizeObserver, setResizeObserver] = useState(
    new ResizeObserver((entries) => {
      const width = entries[0].target.offsetWidth;
      const height = entries[0].target.offsetHeight;
      setStageDimension({ width, height });
    })
  );

  // refrences for components
  let textRef = React.createRef(null);
  let stageRef = React.createRef(null);
  let buttonDivRef = React.createRef(null);

  // the siblings must communicate with one another
  // what i did was refer children functions from here
  // this is probably not the best way to do this
  const resetScale = () => {
    stageRef.current.resetScale();
  };
  const scatter = () => {
    stageRef.current.scatter();
  };
  const loadRandomDemo = () => {
    let nextIndex = demoIdx;
    // get a new demo
    while (nextIndex === demoIdx) nextIndex = randomBetween(0, Demos.length);
    setDemoIdx(nextIndex);
  };
  const animateDFS = () => {
    stageRef.current.DFS();
  };
  const animateBFS = () => {
    stageRef.current.BFS();
  };
  const tree = () => {
    stageRef.current.tree();
  };
  const downloadURI = () => {
    stageRef.current.downloadURI();
  };
  useEffect(() => {
    // after initial render, observe mein-stage div
    resizeObserver.observe(document.getElementById("mein-stage"));
    setTitle("Graph");

    return () => {
      // disconnect the observer when destroyed
      resizeObserver.disconnect();
    };
  }, []);
  const { width, height } = stageDimension;
  return (
    <div className="main-component" id={"mein-component"}>
      <Textbox
        ref={textRef}
        funcs={{ setGraphInfo, setIsUpdate, updateSavedText }}
        bools={{ isDirectedMain, isUpdate, isAnime }}
        t3Val={demoIdx < 0 ? savedText : Demos[demoIdx]}
      />
      <ButtonDiv
        ref={buttonDivRef}
        bools={{ isDirectedMain, isUpdate, isAnime }}
        funcs={{
          resetScale,
          scatter,
          loadRandomDemo,
          animateDFS,
          animateBFS,
          tree,
          setIsDirectedMain,
          downloadURI,
        }}
      />
      <div
        className="stage-div"
        id={"mein-stage"}
        // we must render with recorded width and height as its used by stage component
      >
        {!width || !height ? null : (
          <MyStage
            ref={stageRef}
            width={width}
            height={height}
            graphInfo={graphInfo}
            funcs={{ setIsUpdate, setIsAnime }}
            bools={{ isDirectedMain, isUpdate, isAnime }}
          />
        )}
      </div>
    </div>
  );
};
