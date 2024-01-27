import React, { PureComponent } from "react";
import { Text } from "react-konva";
// text that appear below the node
class MyText extends PureComponent {
  render() {
    const {
      name,
      x,
      y,
      width,
      height,
      text,
      align,
      verticalAlign,
      fontFamily,
      fontSize,
      rotation,
    } = this.props.textProps;
    return (
      <Text
        name={name}
        x={x}
        y={y}
        width={width}
        height={height}
        text={text}
        align={align}
        verticalAlign={verticalAlign}
        fontFamily={fontFamily}
        fontSize={fontSize}
        rotation={rotation}
      />
    );
  }
}
export default MyText;
