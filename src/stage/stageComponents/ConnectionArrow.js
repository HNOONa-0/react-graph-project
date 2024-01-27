import React, { PureComponent } from "react";
import { Arrow } from "react-konva";
import ConnectionLine from "./ConnectionLine";
let arrowKey = 0;

class ConnectionArrow extends PureComponent {
  static addArrow(from, to, pos1 = null, pos2 = null, shapesLayerRef) {
    // each arrow/line has key, name and defined by points
    // we use key and name later if we would like to refernce the arrow/line
    // a connection arrow/line connect from and to nodes
    // so if one node moves the would too
    return {
      arrowProps: {
        key: ++arrowKey,
        name: arrowKey.toString() + "arrow",
        points: ConnectionLine.moveConnection(from, to, pos1, pos2),
      },
      relatedNodes: { from, to },
    };
  }
  render() {
    const { key, name, points } = this.props.arrowProps;
    return (
      <Arrow
        key={key}
        name={name}
        points={points}
        stroke="black"
        fill="black"
      ></Arrow>
    );
  }
}
export default ConnectionArrow;
// return (
//   <Arrow
//     {...this.props.props.arrowProps}
//     stroke="black"
//     fill="black"
//   ></Arrow>
// );
