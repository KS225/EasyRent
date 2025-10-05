// src/components/Footer.jsx
import React from "react";
import "../styles/Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-contact">
        <h4>Contact Us</h4>
        <p>Email: <a href="mailto:support@easyrent.com">support@easyrent.com</a></p>
        <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
        <p>Address: 123 EasyRent Street, Mumbai, India</p>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} EasyRent. All Rights Reserved.</p>
    </div>
  </footer>
);

export default Footer;
