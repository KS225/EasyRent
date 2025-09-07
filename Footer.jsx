// src/components/Footer.jsx
import React from "react";
import "../styles/Footer.css";

const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} EasyRent. All Rights Reserved.</p>
  </footer>
);

export default Footer;
