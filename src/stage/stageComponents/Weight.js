import Konva from "konva";
import React, { PureComponent } from "react";
import ConnectionLine from "./ConnectionLine";
import MyText from "./MyText";
import Node from "./Node";
let weightKey = 0;
// weight that is displayed in the middle of the arrow
class Weight extends PureComponent {
  static addWeight(w, from, to, pos1, pos2, shapesLayerRef) {
    let weightText = w.toString();

    let text = new Konva.Text({
      fontSize: 20,
      fontFamily: "sans-serif",
      text: weightText,
    });
    shapesLayerRef.current.add(text);

    // the weight appears in the middle and an angle of rotation
    // to be displayed properly
    let m = ConnectionLine.getLineMidpoint(
      from,
      to,
      pos1,
      pos2,
      shapesLayerRef
    );
    let angle = this.angleOfRotation(from, to, pos1, pos2, shapesLayerRef);

    const newWeight = {
      textProps: {
        key: ++weightKey,
        name: weightKey.toString() + "weight",
        x: m.x - (text.width() / 2) * Math.cos(angle),
        y: m.y - (text.width() / 2) * Math.sin(angle),
        rotation: angle * (180 / Math.PI),
        width: text.width(),
        text: weightText,
        fontSize: 20,
        fontFamily: "sans-serif",
      },
      relatedNodes: { from, to },
    };

    text.destroy();
    return newWeight;
  }
  static angleOfRotation(key1, key2, p1, p2, shapesLayerRef) {
    // mathmatical formula to rotate text as desired
    const pos1 =
      p1 !== null ? p1 : Node.getPosOfNodeCenter(key1, shapesLayerRef);
    const pos2 =
      p2 !== null ? p2 : Node.getPosOfNodeCenter(key2, shapesLayerRef);

    let angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
    return angle > Math.PI / 2 || angle < -Math.PI / 2
      ? angle + Math.PI
      : angle;
  }
  render() {
    const textProps = this.props.textProps;
    return <MyText textProps={textProps} />;
  }
}
export default Weight;
// return <Text {...this.props.props.textProps} />;
