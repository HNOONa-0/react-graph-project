import React from "react";
import "./ButtonStyles.css";
const Button = ({ onClick, buttonText, className, isDirectedMain }) => {
  return (
    <button
      // for some function we need to know current state of isDirected
      // so as to not have needless renders

      onClick={onClick ? () => onClick(buttonText, isDirectedMain) : null}
      className={className}
      disabled={!onClick ? true : false}
    >
      {buttonText}
    </button>
  );
};
export default Button;
