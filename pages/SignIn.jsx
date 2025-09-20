import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthPages.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    email: "",
    contact: "",
    city: "",
    state: "",
    pincode: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");       // message state
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(""); // reset message

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    const { confirmPassword, ...signupData } = formData;

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage("Account created successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 1500); // redirect after 1.5s
      } else {
        setMessage(data.message || "Signup failed");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setMessage("Server error");
      setMessageType("error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input type="date" name="dob" onChange={handleChange} required />
        <input name="city" placeholder="City" onChange={handleChange} required />
        <input name="state" placeholder="State" onChange={handleChange} required />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} required pattern="\d{6}" />
        <input name="contact" placeholder="Contact" onChange={handleChange} required pattern="\d{10}" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input name="username" placeholder="Username" onChange={handleChange} required />

        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            minLength={6}
          />
          <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
            minLength={6}
          />
          <button type="button" className="show-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Display message below password fields */}
        {message && (
          <p className={`form-message ${messageType}`}>{message}</p>
        )}

        <button type="submit" className="btn">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default SignIn;