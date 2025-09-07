import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/BookingPage.css";

const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const BookingPage = () => {
  const location = useLocation();
  const { vehicle } = location.state || {};

  if (!vehicle) return <h2>No vehicle selected. Please go back and choose one.</h2>;

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [price, setPrice] = useState(null);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [driverAge, setDriverAge] = useState("");
  const [driverLicense, setDriverLicense] = useState("");

  // CAPTCHA state
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const locationCoords = {
    Mumbai: { lat: 19.076, lon: 72.8777 },
    Pune: { lat: 18.5204, lon: 73.8567 },
    Delhi: { lat: 28.7041, lon: 77.1025 },
    Bangalore: { lat: 12.9716, lon: 77.5946 },
    Chennai: { lat: 13.0827, lon: 80.2707 },
  };

  const calculateDays = () => {
    if (!dateFrom || !dateTo) return 1;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const calculatePrice = () => {
    if (!pickup || !drop || !dateFrom || !dateTo) return alert("Select locations & dates first");

    const pickupCoords = locationCoords[pickup];
    const dropCoords = locationCoords[drop];

    if (!pickupCoords || !dropCoords) return alert("Invalid locations");

    const distance = haversineDistance(pickupCoords, dropCoords);
    const days = calculateDays();
    const total = distance * 15 + vehicle.price_per_day * days;

    setPrice(Math.round(total));
  };

  const handleBooking = () => {
    if (!price) return alert("Calculate price first");

    // Generate CAPTCHA
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaValue(captcha);
    setCaptchaInput("");

    setShowDriverForm(true);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    if (captchaInput !== captchaValue) return alert("CAPTCHA does not match!");

    const bookingData = {
      vehicleId: vehicle.id,
      pickup,
      drop,
      dateFrom,
      dateTo,
      price,
      driverName,
      driverContact,
      driverAge,
      driverLicense,
    };

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();
      if (res.ok) {
        setShowDriverForm(false);
        setShowModal(true);
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking API error:", err);
      alert("Error saving booking. Try again.");
    }
  };

  return (
    <div className="booking-container">
      <div className="vehicle-details">
        <img src={vehicle.image_url || "/default-car.jpg"} alt={vehicle.name} />
        <h2>{vehicle.name}</h2>
        <p>{vehicle.type}</p>
        <p>₹{vehicle.price_per_day} per day</p>
      </div>

      <div className="trip-details">
        <h2>Book Your Ride</h2>

        <label>Pickup Location:</label>
        <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
          <option value="">Select</option>
          {Object.keys(locationCoords).map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <label>Drop Location:</label>
        <select value={drop} onChange={(e) => setDrop(e.target.value)}>
          <option value="">Select</option>
          {Object.keys(locationCoords).map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <label>From Date:</label>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label>To Date:</label>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />

        <button className="btn" onClick={calculatePrice}>Calculate Price</button>
        {price && <div className="price-display">Estimated Price: ₹{price}</div>}

        <button className="btn confirm-btn" onClick={handleBooking}>Confirm Booking</button>
      </div>

      {showDriverForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Driver Details</h2>
            <form onSubmit={handleDriverSubmit}>
              <label>Driver Name:</label>
              <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} required />

              <label>Contact Number:</label>
              <input type="tel" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} required />

              <label>Age:</label>
              <input type="number" value={driverAge} onChange={(e) => setDriverAge(e.target.value)} required />

              <label>License Number:</label>
              <input type="text" value={driverLicense} onChange={(e) => setDriverLicense(e.target.value)} required />

              <label>Enter CAPTCHA: <strong>{captchaValue}</strong></label>
              <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />

              <div className="modal-buttons">
                <button type="submit" className="btn confirm-btn">Submit</button>
                <button type="button" className="btn cancel-btn" onClick={() => setShowDriverForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="confirm-booking">Booking Confirmed!</h3>
            <button className="btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;  