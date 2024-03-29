import React, { PureComponent } from "react";
import { Rect } from "react-konva";
// older version of use rectangle component inside NodeLabel class
class MyRect extends PureComponent {
  render() {
    const { name, x, y, fill, opacity, width, height } = this.props.rectProps;
    return (
      <Rect
        name={name}
        x={x}
        y={y}
        fill={fill}
        opacity={opacity}
        width={width}
        height={height}
      />
    );
  }
}
export default MyRect;
