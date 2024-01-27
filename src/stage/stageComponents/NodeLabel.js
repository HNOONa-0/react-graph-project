import Konva from "konva";
import React, { PureComponent } from "react";
import { Group } from "react-konva";
import { Fill, FontSize, Radius } from "../../myData/limits";
import MyRect from "./MyRect";
import MyText from "./MyText";
// label that appears below the node
class NodeLabel extends PureComponent {
  static addLabel(t, pos, idx, c = 0, shapesLayerRef) {
    // c was used for position purposes but now it's not used
    let text = new Konva.Text({
      fontSize: FontSize,
      fontFamily: "sans-serif",
      text: t,
    });
    shapesLayerRef.current.add(text);

    // it's positions is related to the node so we first find the position
    // of accompanying node
    const newLabel = {
      groupProps: {
        key: idx,
        name: idx.toString() + "label",
        width: text.width(),
        height: FontSize,
        x: pos.x + Radius - text.width() / 2,
        y: pos.y + 2 * Radius,
      },
      rectProps: {
        name: idx.toString() + "labelRect",
        x: 0,
        y: 0,
        fill: Fill,
        opacity: 0.5,
        width: text.width(),
        height: FontSize,
      },
      textProps: {
        name: idx.toString() + "labelText",
        x: 0,
        y: 0,
        text: t,
        width: text.width(),
        height: text.height(),
        fontSize: FontSize,
        fontFamily: "sans-serif",
        align: "center",
      },
    };
    text.destroy();
    return newLabel;
  }
  render() {
    const shapeProps = this.props.shapeProps;
    const { groupProps, rectProps, textProps } = shapeProps;
    const { key, name, x, y, width, height } = groupProps;
    return (
      <Group key={key} name={name} x={x} y={y} width={width} height={height}>
        <MyRect rectProps={rectProps} />
        <MyText textProps={textProps} />
      </Group>
    );
  }
}
export default NodeLabel;
// return (
//   <Group {...this.props.props.groupProps}>
//     <Rect {...this.props.props.rectProps} />
//     <Text {...this.props.props.textProps} />
//   </Group>
// );
