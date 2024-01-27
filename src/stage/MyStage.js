import Konva from "konva";
import React, { Component } from "react";
import { Layer, Stage } from "react-konva";

import NodeLabel from "./stageComponents/NodeLabel";
import Node from "./stageComponents/Node";
import ConnectionLine from "./stageComponents/ConnectionLine";
import ConnectionArrow from "./stageComponents/ConnectionArrow";
import { Fill, Radius } from "../myData/limits";
import Weight from "./stageComponents/Weight";
import "./MyStageStyles.css";
// key is used when downloading stage as png
let stageKey = 0;

class MyStage extends Component {
  constructor(props) {
    super(props);
    // define all important properties for the stage
    // define the arrays of objects that lie on the stage (nodes, lines, weughts, ...)
    this.state = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      scale: 1,
      padding: 8,
      tweens: [],
      nodes: [null],
      lines: [],
      arrows: [],
      weights: [],
      labels: [],
    };
    // each type of shape has its own layer for the sake of efficiency
    // and to group related objects in the same layer
    this.stageRef = React.createRef();
    this.shapesLayerRef = React.createRef();
    this.connectionsLayerRef = React.createRef();

    // these mpving shapes were used in previous releases only
    // this.movingCircleRef = React.createRef();
    // this.movingLineRef = React.createRef();
    // this.movingArrowRef = React.createRef();
    this.labelBoxRef = React.createRef();
    this.container = React.createRef();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.graphInfo !== this.props.graphInfo) {
      // if graph info change, re-render on the stage
      this.setState(this.processGraphInfo(prevState), async () => {
        // after it's finished, isUpdate should be false again
        this.props.funcs.setIsUpdate(false);
      });
    } else if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      // after resizing make sure that nodes are bounded inside new size of stage
      this.boundGraph();
    }
  }
  componentDidMount() {
    // after the stage mounts, process the graphInfo to update ui
    let prevState = this.state;
    this.setState(this.processGraphInfo(prevState), async () => {
      this.props.funcs.setIsUpdate(false);
    });
  }
  fromAbsToRelative = (pos) => {
    // this is a simple straight-forward way to convert relative to absolute position
    // create a new konva object, move it to destined location
    // return it's relative position
    let rect = new Konva.Rect({ x: 0, y: 0 });

    this.shapesLayerRef.current.add(rect);
    rect.absolutePosition(this.handleDragBound({ x: pos.x, y: pos.y }));

    let relPos = rect.position();
    rect.destroy();
    return relPos;
  };
  handleDragBound = (
    pos,
    width = this.props.width,
    height = this.props.height,
    scale = this.state.scale,
    padding = this.state.padding
  ) => {
    // this formula takes into account scale, padding and radius
    // to keep nodes inside of the stage
    // we should update 60 to 2*RADIUS
    let newPos = {
      x:
        pos.x < padding * scale
          ? padding * scale
          : pos.x + (60 + padding) * scale > width - 2
          ? width - 2 - (60 + padding) * scale
          : pos.x,
      y:
        pos.y < padding * scale
          ? padding * scale
          : pos.y + (60 + padding) * scale > height - 2
          ? height - 2 - (60 + padding) * scale
          : pos.y,
    };
    return newPos;
  };
  randomPos = (width = this.props.width, height = this.props.height) => {
    // compute random position, convert it to relative position
    let pos = this.fromAbsToRelative(
      this.handleDragBound({
        x: Math.random() * width,
        y: Math.random() * height,
      })
    );
    return pos;
  };
  onNodeMove = (key) => {
    // if a node move, it must move all labels, lines and arrows connected to it
    // which is what the following code does
    this.setState((prevState) => ({
      lines: prevState.lines.map((eachLine) => {
        if (
          eachLine.relatedNodes.from !== key &&
          // the current node must be either from node or to node
          // else this connection is not related to the current node
          eachLine.relatedNodes.to !== key
        )
          return eachLine;
        return {
          ...eachLine,
          lineProps: {
            ...eachLine.lineProps,
            // update points position
            points: ConnectionLine.moveConnection(
              eachLine.relatedNodes.from,
              eachLine.relatedNodes.to,
              null,
              null,
              this.shapesLayerRef
            ),
          },
        };
      }),
      arrows: prevState.arrows.map((eachArrow) => {
        if (
          eachArrow.relatedNodes.from !== key &&
          eachArrow.relatedNodes.to !== key
        )
          return eachArrow;
        return {
          ...eachArrow,
          arrowProps: {
            ...eachArrow.arrowProps,
            points: ConnectionLine.moveConnection(
              eachArrow.relatedNodes.from,
              eachArrow.relatedNodes.to,
              null,
              null,
              this.shapesLayerRef
            ),
          },
        };
      }),
      weights: prevState.weights.map((eachWeight) => {
        if (
          eachWeight.relatedNodes.from !== key &&
          // again, the node must be from or to node
          eachWeight.relatedNodes.to !== key
        )
          return eachWeight;
        // re-render weights with desired angle
        let angle = Weight.angleOfRotation(
          eachWeight.relatedNodes.from,
          eachWeight.relatedNodes.to,
          null,
          null,
          this.shapesLayerRef
        );

        let w = eachWeight.textProps.width;
        let m = ConnectionLine.getLineMidpoint(
          eachWeight.relatedNodes.from,
          eachWeight.relatedNodes.to,
          null,
          null,
          this.shapesLayerRef
        );
        return {
          ...eachWeight,
          textProps: {
            ...eachWeight.textProps,
            x: m.x - (w / 2) * Math.cos(angle),
            y: m.y - (w / 2) * Math.sin(angle),
            rotation: angle * (180 / Math.PI),
          },
        };
      }),
      labels: prevState.labels.map((eachLabel) => {
        // if the label is not the current node label, keep label as its
        if (eachLabel.groupProps.key !== key) return eachLabel;
        const { x, y } = {
          ...this.shapesLayerRef.current
            .findOne("." + key.toString() + "group")
            .position(),
        };
        // move the label as the node is dragged
        return {
          ...eachLabel,
          groupProps: {
            ...eachLabel.groupProps,
            x: x + Radius - eachLabel.groupProps.width / 2,
            y: y + 2 * Radius,
          },
        };
      }),
    }));
  };
  onNodeDragEnd = (e, key) => {
    this.setState((prevState) => ({
      // update the node position to reflect changes
      nodes: prevState.nodes.map((eachNode) => {
        if (eachNode === null || eachNode.groupProps.key !== key)
          return eachNode;
        return {
          ...eachNode,
          groupProps: {
            ...eachNode.groupProps,
            x: e.target.x(),
            y: e.target.y(),
          },
        };
      }),
    }));
  };
  processGraphInfo = (prevState) => {
    // this function uses graph info to render prescribed graph on stage
    if (!prevState) {
      return null;
    }
    // get current stage state
    const { x, y, padding, scale } = prevState;

    const { graphInfo, funcs } = this.props;
    const { graph, weight, keyMaster } = graphInfo;
    const numOfNodes = graphInfo.getNumOfNodes();

    const indexToKey = keyMaster.indexToKey;
    // might need it later
    const keyToIndex = keyMaster.keyToIndex;
    const edgeStack = graph.edgeStack;
    const weightStack = weight.weightStack;
    const indexToLabel = keyMaster.indexToLabel;

    let nodes = [null];
    const oldNodes = prevState.nodes;

    // make nodes first
    for (let i = 1; i < numOfNodes; i++) {
      // dont update position for old nodes, this way they dont move around randomly as mich
      let newPos =
        i < oldNodes.length
          ? { x: oldNodes[i].groupProps.x, y: oldNodes[i].groupProps.y }
          : this.randomPos();
      nodes.push(Node.addNode(newPos, indexToKey[i], i));
    }

    // make the lines and arrows;
    let lines = [];
    let arrows = [];

    for (let i = 1; i < numOfNodes; i++) {
      for (let j = 1; j < numOfNodes; j++) {
        // if there no edges dont add anything
        if (!edgeStack[i][j].length) continue;
        const from = i;
        const to = j;
        const { isDirected, isForward } =
          edgeStack[i][j][edgeStack[i][j].length - 1];
        // if its directed ass new arrow else add new line
        if (!isDirected)
          lines.push(
            ConnectionLine.addLine(
              from,
              to,
              {
                x: nodes[from].groupProps.x + Radius,
                y: nodes[from].groupProps.y + Radius,
              },
              {
                x: nodes[to].groupProps.x + Radius,
                y: nodes[to].groupProps.y + Radius,
              },
              this.shapesLayerRef
            )
          );
        else if (isForward)
          arrows.push(
            ConnectionArrow.addArrow(
              from,
              to,
              {
                x: nodes[from].groupProps.x + Radius,
                y: nodes[from].groupProps.y + Radius,
              },
              {
                x: nodes[to].groupProps.x + Radius,
                y: nodes[to].groupProps.y + Radius,
              },
              this.shapesLayerRef
            )
          );
        else
          arrows.push(
            ConnectionArrow.addArrow(
              to,
              from,
              {
                x: nodes[to].groupProps.x + Radius,
                y: nodes[to].groupProps.y + Radius,
              },
              {
                x: nodes[from].groupProps.x + Radius,
                y: nodes[from].groupProps.y + Radius,
              },
              this.shapesLayerRef
            )
          );
      }
    }

    // make the labels
    let labels = [];
    for (let i = 1; i < numOfNodes; i++) {
      if (!indexToLabel[i].length) continue;
      labels.push(
        NodeLabel.addLabel(
          indexToLabel[i][indexToLabel[i].length - 1],
          {
            x: nodes[i].groupProps.x,
            y: nodes[i].groupProps.y,
          },
          i,
          0,
          this.shapesLayerRef
        )
      );
    }
    // make the weights
    let weights = [];
    for (let i = 1; i < numOfNodes; i++) {
      for (let j = 1; j < numOfNodes; j++) {
        if (!weightStack[i][j].length) continue;
        const w = weightStack[i][j][weightStack[i][j].length - 1];
        const from = i;
        const to = j;
        weights.push(
          Weight.addWeight(
            w,
            from,
            to,
            {
              x: nodes[from].groupProps.x + Radius,
              y: nodes[from].groupProps.y + Radius,
            },
            {
              x: nodes[to].groupProps.x + Radius,
              y: nodes[to].groupProps.y + Radius,
            },
            this.shapesLayerRef
          )
        );
      }
    }
    // return the new state finally
    return { x, y, scale, padding, nodes, arrows, lines, weights, labels };
  };
  boundGraph = () => {
    // function to manually bound the nodes
    let nodes = this.boundNodes();
    this.repositionNodes(nodes);
  };
  scatterGraph = () => {
    // put nodes in a random location
    let nodes = this.scatterNodes();
    this.repositionNodes(nodes);
  };

  treeGraph = () => {
    let nodes = this.completeTree();
    this.repositionNodes(nodes);
  };
  completeTree = (roots = this.props.graphInfo.getTreeRootsData()) => {
    if (this.state.nodes.length <= 1) return [null];

    // calculate maxX, maxY and use it to calc unit width and unit height
    let totalX = 0;
    let maxY = 0;
    for (const root of roots) {
      const { mp, X, Y } = root;

      totalX += !X ? 1 : X;
      maxY = Math.max(maxY, Y);
    }

    const scale = this.state.scale;
    const padding = this.state.padding + Radius;
    // based on current state, calculte unit width and height to divide space as evenly as possible
    // we will use unit width again
    const treeUnitWidth = (this.props.width - 2) / totalX;
    const treeUnitHeight =
      (this.props.height - 2 - 2 * padding * scale) / Math.max(maxY, 1);
    let nodes = [...this.state.nodes];
    // cummlative width, we need it to prop

    let widthSoFar = 0;

    for (const { mp, X, Y } of roots) {
      // so as to not overflow on the width
      const allowedWidth = treeUnitWidth * (!X ? 1 : X);
      for (const [key, pos] of mp) {
        const width = allowedWidth - 2 * padding * scale;
        // we will use unit width again to split width among each
        const unitWidth = width / (!X ? 1 : X);

        const [xOnStage, yOnStage] = [pos.x, pos.y];
        const { x, y } = this.fromAbsToRelative({
          x:
            widthSoFar +
            (padding - Radius) * scale +
            (!X ? 0.5 : xOnStage) * unitWidth,
          y: (padding - Radius) * scale + yOnStage * treeUnitHeight,
        });
        // update the node using its key, if you dont use key you
        // you could easily refrence the wrong node
        nodes[key] = {
          ...nodes[key],
          groupProps: { ...nodes[key].groupProps, x, y },
        };
      }
      widthSoFar += allowedWidth;
    }
    return nodes;
  };
  scatterNodes = () => {
    // get the nodes and change position of each node
    let nodes = this.state.nodes;

    let newRelPos;
    nodes = nodes.map((eachNode) => {
      if (!eachNode) return null;
      newRelPos = this.randomPos();
      return {
        ...eachNode,
        groupProps: { ...eachNode.groupProps, x: newRelPos.x, y: newRelPos.y },
      };
    });
    return nodes;
  };
  boundNodes = () => {
    let nodes = this.state.nodes;
    let curAbsPos;
    let newAbsPos;
    let newRelPos;

    nodes = nodes.map((eachNode) => {
      if (!eachNode) return null;
      // update position of nodes so as to stay inside the stage div
      // get current absolute position, bound it, go back to relative position
      curAbsPos = this.shapesLayerRef.current
        .findOne("." + eachNode.groupProps.key.toString() + "group")
        .absolutePosition();
      newAbsPos = this.handleDragBound(curAbsPos);
      newRelPos = this.fromAbsToRelative(newAbsPos);
      // make sure to use spread operator to trigger render
      return {
        ...eachNode,
        groupProps: { ...eachNode.groupProps, x: newRelPos.x, y: newRelPos.y },
      };
    });
    return nodes;
  };
  scatter = (e) => {
    this.scatterGraph();
  };
  resetScale = () => {
    // reset posiiton, scale
    this.setState({ x: 0, y: 0, scale: 1 }, async () => {
      this.boundGraph();
    });
  };
  tree = (mp, X, Y) => {
    // this will run completeTree and repositionNodes
    this.treeGraph(mp, X, Y);
  };
  repositionNodes = (nodes) => {
    // this is similar to onNodeMove
    // except that all the nodes move
    // you will find similar pieces of code in both functions
    // this is not ideal as it's repetitive, should probably figure out
    // how to use onNodeMove here
    let from, to, k;

    let lines = this.state.lines.map((eachLine) => {
      from = eachLine.relatedNodes.from;
      to = eachLine.relatedNodes.to;
      return {
        ...eachLine,
        lineProps: {
          ...eachLine.lineProps,
          points: ConnectionLine.moveConnection(
            from,
            to,
            {
              x: nodes[from].groupProps.x + Radius,
              y: nodes[from].groupProps.y + Radius,
            },
            {
              x: nodes[to].groupProps.x + Radius,
              y: nodes[to].groupProps.y + Radius,
            },
            this.shapesLayerRef
          ),
        },
      };
    });
    let arrows = this.state.arrows.map((eachArrow) => {
      from = eachArrow.relatedNodes.from;
      to = eachArrow.relatedNodes.to;
      return {
        ...eachArrow,
        arrowProps: {
          ...eachArrow.arrowProps,
          points: ConnectionLine.moveConnection(
            from,
            to,
            {
              x: nodes[from].groupProps.x + Radius,
              y: nodes[from].groupProps.y + Radius,
            },
            {
              x: nodes[to].groupProps.x + Radius,
              y: nodes[to].groupProps.y + Radius,
            },
            this.shapesLayerRef
          ),
        },
      };
    });
    let weights = this.state.weights.map((eachWeight) => {
      from = eachWeight.relatedNodes.from;
      to = eachWeight.relatedNodes.to;

      let angle = Weight.angleOfRotation(
        from,
        to,
        {
          x: nodes[from].groupProps.x + Radius,
          y: nodes[from].groupProps.y + Radius,
        },
        {
          x: nodes[to].groupProps.x + Radius,
          y: nodes[to].groupProps.y + Radius,
        },
        this.shapesLayerRef
      );

      let w = eachWeight.textProps.width;
      let m = ConnectionLine.getLineMidpoint(
        from,
        to,
        {
          x: nodes[from].groupProps.x + Radius,
          y: nodes[from].groupProps.y + Radius,
        },
        {
          x: nodes[to].groupProps.x + Radius,
          y: nodes[to].groupProps.y + Radius,
        },
        this.shapesLayerRef
      );
      return {
        ...eachWeight,
        textProps: {
          ...eachWeight.textProps,
          x: m.x - (w / 2) * Math.cos(angle),
          y: m.y - (w / 2) * Math.sin(angle),
          rotation: angle * (180 / Math.PI),
        },
      };
    });
    let labels = this.state.labels.map((eachLabel) => {
      k = eachLabel.groupProps.key;
      return {
        ...eachLabel,
        groupProps: {
          ...eachLabel.groupProps,
          x: nodes[k].groupProps.x + Radius - eachLabel.groupProps.width / 2,
          y: nodes[k].groupProps.y + 2 * Radius,
        },
      };
    });
    this.setState({ nodes, lines, arrows, weights, labels });
  };
  handleWheel = (e) => {
    // default behaviour is not needed

    e.evt.preventDefault();
    // scale by a little amount 1.02
    const scaleBy = 1.02;
    // get stage and change instance
    const stage = e.target.getStage();

    // could be scaleY since they are both equal
    // we could also use state scale
    const oldScale = stage.scaleX();

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    // we would like to scale relative to current mouse location (absolute position)
    const { x: pointerX, y: pointerY } = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerX - stage.x()) / oldScale,
      y: (pointerY - stage.y()) / oldScale,
    };
    // did we scale up or down?
    const newScale = direction < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    // after we scale, the position of the stage changes
    const newPos = {
      x: pointerX - mousePointTo.x * newScale,
      y: pointerY - mousePointTo.y * newScale,
    };

    this.setState({ scale: newScale, x: newPos.x, y: newPos.y }, async () => {
      this.boundGraph();
    });
  };
  downloadURI = (
    uri = this.stageRef.current.toDataURL(),
    name = "stage" + (++stageKey).toString() + ".png"
  ) => {
    // this is a simple js code to download image of canvas as png
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // delete link;
  };
  resetAllColors = async (
    n,
    // this is simplest way i found to delay function by x amount
    timer = (ms) => new Promise((res) => setTimeout(res, ms))
  ) => {
    // for any type of animation i used await timers to run something like a chain animation
    const timeToWait = 1;
    for (let i = 1; i < n; i++) {
      this.shapesLayerRef.current
        .findOne("." + i.toString() + "groupCircle")
        .to({
          fill: Fill,
          duration: timeToWait,
        });
    }
    if (n > 1) await timer(timeToWait * 1000);
  };
  BFS = async (timer = (ms) => new Promise((res) => setTimeout(res, ms))) => {
    const timeToWait = 1;
    const graphInfo = this.props.graphInfo;
    const { setIsAnime } = this.props.funcs;
    // flag the start of an animation
    setIsAnime(true);

    // get order of bfs traversal and animate them in that order
    const BFSPaths = graphInfo.completeTreeRootsBFS();

    const n = graphInfo.getNumOfNodes();

    for (let i = 0; i < BFSPaths.length; i++) {
      // curBFSPath is a 2d array
      // each row represent a component in our graph
      const curBFSPath = BFSPaths[i];

      for (let j = 0; j < curBFSPath.length; j++) {
        for (let k = 0; k < curBFSPath[j].length; k++) {
          // color the root as pink otherwise color them with orange
          this.shapesLayerRef.current
            .findOne("." + curBFSPath[j][k].toString() + "groupCircle")
            .to({
              fill: !j ? "pink" : "orange",
              duration: timeToWait,
            });
        }
        await timer(timeToWait * 1000);
      }
      // await timer(curBFSPath.length * (timeToWait * 1000));
    }
    this.resetAllColors(n);
    setIsAnime(false);
  };
  DFS = async (timer = (ms) => new Promise((res) => setTimeout(res, ms))) => {
    // this is similar to bfs but delay amount is different
    const timeToWait = 1;
    const graphInfo = this.props.graphInfo;
    const { setIsAnime } = this.props.funcs;
    setIsAnime(true);

    const DFSPaths = graphInfo.completeTreeRootsDFS();

    const n = this.props.graphInfo.getNumOfNodes();

    for (let i = 0; i < DFSPaths.length; i++) {
      const curDFSPath = DFSPaths[i];
      let pathStack = [];
      // we use a stack to color the "backtrack" nodes as lime
      for (let j = 0; j < curDFSPath.length; j++) {
        let isStackTop = !pathStack.length
          ? false
          : pathStack[pathStack.length - 1] === curDFSPath[j]
          ? true
          : false;

        this.shapesLayerRef.current
          .findOne("." + curDFSPath[j].toString() + "groupCircle")
          .to({
            fill: !j ? "pink" : isStackTop ? "lime" : "orange",
            duration: timeToWait,
          });
        if (isStackTop) pathStack.pop();
        else pathStack.push(curDFSPath[j]);
        await timer(timeToWait * 1000);
      }
    }
    this.resetAllColors(n);
    setIsAnime(false);
  };

  render() {
    return (
      <Stage
        height={this.props.height - 2}
        width={this.props.width - 2}
        ref={this.stageRef}
        scaleX={this.state.scale}
        scaleY={this.state.scale}
        onWheel={(e) => this.handleWheel(e)}
      >
        <Layer ref={this.connectionsLayerRef}>
          {this.state.lines.map((eachLine) => {
            return (
              <ConnectionLine
                key={eachLine.lineProps.key}
                lineProps={eachLine.lineProps}
              />
            );
          })}
          {this.state.arrows.map((eachArrow) => {
            return (
              <ConnectionArrow
                key={eachArrow.arrowProps.key}
                arrowProps={eachArrow.arrowProps}
              />
            );
          })}
          {this.state.weights.map((eachWeight) => {
            return (
              <Weight
                key={eachWeight.textProps.key}
                textProps={eachWeight.textProps}
              />
            );
          })}
        </Layer>
        <Layer ref={this.shapesLayerRef}>
          {this.state.nodes.map((eachNode) => {
            // remember that first node is null
            if (!eachNode || !eachNode.groupProps.key) return null;
            return (
              <Node
                key={eachNode.groupProps.key}
                shapeProps={eachNode}
                dragBoundFunc={this.handleDragBound}
                onDragMove={this.onNodeMove}
                onDragEnd={this.onNodeDragEnd}
              />
            );
          })}
          {this.state.labels.map((eachLabel) => {
            return (
              <NodeLabel
                key={eachLabel.groupProps.key}
                shapeProps={eachLabel}
              />
            );
          })}
        </Layer>
      </Stage>
    );
  }
}
export default MyStage;
