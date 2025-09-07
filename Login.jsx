import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthPages.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(""); // new state for message
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(""); // reset message

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 200) {
        setMessage("Login successful!");
        setMessageType("success");
        setTimeout(() => navigate("/profile"), 1000); // redirect after 1s
      } else {
        setMessage(data.message || "Login failed");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setMessage("Server error");
      setMessageType("error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="show-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Display message below password */}
        {message && (
          <p className={`form-message ${messageType}`}>{message}</p>
        )}

        <button type="submit" className="btn">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signin">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
