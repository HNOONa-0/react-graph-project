import React from "react";
import { Link } from "react-router-dom";
import "./NavbarStyles.css";

const Navbar = () => {
  return (
    <div className="wrapper-nav-bar">
      <nav className="nav-bar">
        <div className="logo">
          <Link to="/">Graph</Link>
        </div>
        <ul className="nav-links"></ul>
      </nav>
    </div>
  );
};
export default Navbar;
