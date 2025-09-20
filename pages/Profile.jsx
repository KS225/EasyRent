import React, { useEffect, useState } from "react";
import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    username: "",
    age: "",
    contact: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [changePwdStep, setChangePwdStep] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user) {
          setUser({
            full_name: data.user.full_name,
            email: data.user.email,
            username: data.user.username,
            contact: data.user.contact,
            city: data.user.city,
            state: data.user.state,
            pincode: data.user.pincode,
            age: data.user.age,
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Generate CAPTCHA
  useEffect(() => {
    if (changePwdStep === 3) generateCaptcha();
  }, [changePwdStep]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(captcha);
  };

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (changePwdStep === 3) {
      if (!newPassword || !confirmPassword)
        return setMessage("Please fill password fields");
      if (newPassword !== confirmPassword)
        return setMessage("Passwords do not match");
      if (captchaInput !== captchaValue) return setMessage("Captcha incorrect");
    }

    try {
      const res = await fetch("http://localhost:5000/api/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          password: changePwdStep === 3 ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (res.status === 200) {
        setMessage("Profile updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        setCaptchaInput("");
        setChangePwdStep(0);
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <h2>{user.full_name}</h2>
          <p>{user.email}</p>
        </div>

        <form onSubmit={handleUpdate} className="profile-form">
          <h3>Account Details</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={user.full_name} readOnly />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={user.username} readOnly />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="text" value={user.age || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input type="text" value={user.contact} readOnly />
          </div>

          <h3>Address</h3>
          <div className="form-group">
            <label>City</label>
            <input name="city" value={user.city} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>State</label>
            <input name="state" value={user.state} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input name="pincode" value={user.pincode} onChange={handleChange} required />
          </div>

          <h3>Change Password</h3>
          {changePwdStep === 0 && (
            <button type="button" className="change-btn" onClick={() => setChangePwdStep(1)}>
              Change Password
            </button>
          )}

          {changePwdStep >= 1 && (
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          )}

          {changePwdStep >= 2 && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {changePwdStep === 3 && (
            <div className="form-group">
              <label>Enter CAPTCHA:</label>
              <div className="captcha">
                <div className="captcha-box">{captchaValue}</div>
                <button type="button" onClick={generateCaptcha}>
                  Refresh
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>
          )}

          {/* Buttons */}
          {changePwdStep > 0 && changePwdStep < 3 && (
            <button
              type="button"
              className="save-btn"
              onClick={() => setChangePwdStep(changePwdStep + 1)}
            >
              Next
            </button>
          )}

          {changePwdStep === 3 && (
            <button type="submit" className="save-btn">
              Update Password
            </button>
          )}

          {changePwdStep === 0 && (
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          )}

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;