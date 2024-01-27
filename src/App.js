import React, { Fragment, useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import Home from "./pages/Home";
import { minWindowHeight, minWindowWidth } from "./myData/limits";
import "./App.css";

function App() {
  // dimensions of body (web page)
  const [bodyDimension, setBodyDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // observe root div with resize observer
  // we could use resize event but this works well
  const [resizeObserver, setResizeObserver] = useState(
    new ResizeObserver((entries) => {
      // get width and height of observed body
      const width = entries[0].target.offsetWidth;
      const height = entries[0].target.offsetHeight;
      // update state
      setBodyDimension({ width, height });
    })
  );
  // save graph text before resizing so you may use it when size is valid again
  const [savedText, updateSavedText] = useState("");
  useEffect(() => {
    // observe the the entries
    resizeObserver.observe(document.getElementById("root"));
    return () => {
      // this maybe unnecessary
      resizeObserver.disconnect();
    };
  }, []);

  const { width, height } = bodyDimension;
  return (
    <Router>
      <Fragment>
        <Navbar></Navbar>
        <Routes>
          <Route
            exact
            path="/"
            element={
              width < minWindowWidth || height < minWindowHeight ? (
                <h1 style={{ textAlign: "center" }}>
                  this App needs more space to run
                </h1>
              ) : (
                <Home
                  savedText={savedText}
                  updateSavedText={updateSavedText}
                ></Home>
              )
            }
          ></Route>
        </Routes>
      </Fragment>
    </Router>
  );
}
export default App;
