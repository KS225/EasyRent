// src/pages/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/BookingPage.css";

/* Fix default Leaflet icon paths (CDN) */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ========== CONFIG ==========
// Replace with your real ORS api key string (keep secret in env for production)
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ5NDVkZWM0NzIxNDBmNzQ4NDJmZGIyYzMyOGYxZTUwNjU5NzBmYTZkY2I5ZGNjM2UyM2ZhMzgwIiwiaCI6Im11cm11cjY0In0=";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicle } = location.state || {};

  if (!vehicle) {
    return (
      <div className="booking-container">
        <h2>No vehicle selected. Please go back and choose one.</h2>
        <button className="btn" onClick={() => navigate("/vehicles")}>
          Back to Vehicles
        </button>
      </div>
    );
  }

  // ---------- state ----------
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const [fromPos, setFromPos] = useState(null); // { lat, lng }
  const [toPos, setToPos] = useState(null);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [activePicker, setActivePicker] = useState(null); // "from" | "to" | null

  const [distanceKm, setDistanceKm] = useState(null);
  const [price, setPrice] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);

  const [consentChecked, setConsentChecked] = useState(false);

  // driver form & booking
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [driverAge, setDriverAge] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  // ---------- helpers: ORS requests ----------
  // Reverse geocoding: coords -> address
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lat=${lat}&point.lon=${lng}`
      );
      const data = await res.json();
      const label = data.features?.[0]?.properties?.label || "";
      return label;
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return "";
    }
  };

  // Forward geocoding: address -> coords
  const getCoordsFromAddress = async (address) => {
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      const coords = data.features?.[0]?.geometry?.coordinates;
      if (coords) {
        return { lat: coords[1], lng: coords[0], label: data.features[0].properties.label };
      }
      return null;
    } catch (err) {
      console.error("Forward geocoding error:", err);
      return null;
    }
  };

const fetchDistanceFromORS = async (startPos, endPos) => {
  try {
    const res = await fetch("http://localhost:5000/api/directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: [startPos.lng, startPos.lat],
        end: [endPos.lng, endPos.lat],
      }),
    });

    const data = await res.json();
    console.log("Proxy ORS response:", data);

    const meters = data?.routes?.[0]?.summary?.distance;
    if (!meters) throw new Error("No route found");

    return meters / 1000; // convert to km
  } catch (err) {
    console.error("Distance error:", err);
    return null;
  }
};



  // ---------- map click handler component ----------
  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
        if (!activePicker) return; // only pick when user selected which pin to set
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const addr = await getAddressFromCoords(lat, lng);
        if (activePicker === "from") {
          setFromPos({ lat, lng });
          setFromAddress(addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } else if (activePicker === "to") {
          setToPos({ lat, lng });
          setToAddress(addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setActivePicker(null); // turn off pick mode after click
      },
    });
    return null;
  }

  // ---------- calculate days ----------
  const calculateDays = () => {
    if (!dateFrom || !dateTo) return 1;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // ---------- calculate price ----------
  const calculatePrice = async () => {
    setPrice(null);
    setFeeDetails(null);
    setDistanceKm(null);

    if (!fromPos || !toPos) {
      alert("Please provide both Source (From) and Destination (To).");
      return;
    }
    if (!dateFrom || !dateTo) {
      alert("Please choose From and To dates.");
      return;
    }

    const distKm = await fetchDistanceFromORS(fromPos, toPos);
    if (distKm === null) {
      alert("Could not calculate route distance. Try another route.");
      return;
    }

    const days = calculateDays();

    // Fee structure
    const baseFare = 100; // flat
    const ratePerKm = 15; // ₹/km
    const serviceFeePercent = 5; // %

    const distanceCost = distKm * ratePerKm;
    const rentalCost = (vehicle.price_per_day || 0) * days;
    const subTotal = baseFare + distanceCost + rentalCost;
    const serviceFee = (subTotal * serviceFeePercent) / 100;
    const total = subTotal + serviceFee;

    setDistanceKm(distKm.toFixed(2));
    setPrice(Math.round(total));
    setFeeDetails({
      baseFare,
      distance: distKm.toFixed(2),
      ratePerKm,
      rentalCost: Math.round(rentalCost),
      serviceFee: serviceFee.toFixed(2),
      serviceFeePercent,
      days,
      distanceCost: Math.round(distanceCost),
    });
    // Scroll to price box maybe
    setTimeout(() => {
      const el = document.querySelector(".price-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  // ---------- handle manual address blurs ----------
  const onFromBlur = async () => {
    if (!fromAddress) return;
    const found = await getCoordsFromAddress(fromAddress);
    if (found) {
      setFromPos({ lat: found.lat, lng: found.lng });
      setFromAddress(found.label);
    } else {
      // do not clear
    }
  };

  const onToBlur = async () => {
    if (!toAddress) return;
    const found = await getCoordsFromAddress(toAddress);
    if (found) {
      setToPos({ lat: found.lat, lng: found.lng });
      setToAddress(found.label);
    }
  };

  // ---------- booking flow ----------
  const startDriverForm = () => {
    if (!consentChecked) {
      alert("Please accept the booking terms & consent before proceeding.");
      return;
    }
    if (!price) {
      alert("Please calculate price first.");
      return;
    }
    // generate captcha
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let cap = "";
    for (let i = 0; i < 6; i++) cap += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaValue(cap);
    setCaptchaInput("");
    setShowDriverForm(true);
  };

  const submitDriverForm = async (e) => {
    e.preventDefault();
    if (captchaInput.trim() !== captchaValue) {
      alert("CAPTCHA does not match.");
      return;
    }

    // licensing length check (min 6 maybe)
    if (driverLicense.trim().length < 6) {
      alert("License number seems too short.");
      return;
    }

    const bookingPayload = {
      vehicleId: vehicle.id,
      pickup: fromAddress,
      drop: toAddress,
      from_coords: fromPos,
      to_coords: toPos,
      dateFrom,
      dateTo,
      distanceKm,
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
        body: JSON.stringify(bookingPayload),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingConfirmed(true);
        setBookingMessage(data.message || "Booking saved");
        // Clear form / keep booking details as desired
        setShowDriverForm(false);
      } else {
        alert(data.message || "Failed to save booking");
      }
    } catch (err) {
      console.error("Booking submit error:", err);
      alert("Error saving booking. Try again.");
    }
  };

  // small helper to show which marker to pick
  const pickModeLabel = activePicker ? (activePicker === "from" ? "Click map to set SOURCE" : "Click map to set DESTINATION") : "Click 'Pick on map' then map to set";

  // ---------- render ----------
  return (
    <div className="booking-container">
      <div className="left-column">
        <div className="vehicle-card">
          <img className="vehicle-image" src={vehicle.image_url || "/assets/car-1.jpg"} alt={vehicle.name} />
          <h2 className="vehicle-name">{vehicle.name}</h2>
          <div className="vehicle-meta">
            <div>Brand: {vehicle.brand || "—"}</div>
            <div>Type: {vehicle.type || "—"}</div>
            <div>Seats: {vehicle.seating_capacity || "—"}</div>
            <div>Fuel: {vehicle.fuel_type || "—"}</div>
            <div>₹{vehicle.price_per_day} / day</div>
          </div>
          {vehicle.description && <p className="vehicle-desc">{vehicle.description}</p>}
        </div>
      </div>

      <div className="right-column">
        <h2>Book Your Ride</h2>

        <div className="date-row">
          <label>From Date</label>
          <input type="date" value={dateFrom} min={today} onChange={(e) => {
            setDateFrom(e.target.value);
            if (dateTo && e.target.value > dateTo) setDateTo("");
          }} />
          <label>To Date</label>
          <input type="date" value={dateTo} min={dateFrom || today} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="map-container">
          <div className="map-controls">
            <button
              className={`pick-btn ${activePicker === "from" ? "active" : ""}`}
              onClick={() => setActivePicker((p) => (p === "from" ? null : "from"))}
            >
              Pick SOURCE on map
            </button>

            <button
              className={`pick-btn ${activePicker === "to" ? "active" : ""}`}
              onClick={() => setActivePicker((p) => (p === "to" ? null : "to"))}
            >
              Pick DESTINATION on map
            </button>

            <div className="pick-instruction">{activePicker ? pickModeLabel : "Or enter addresses below"}</div>
          </div>

          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "340px", borderRadius: 8 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            {fromPos && <Marker position={[fromPos.lat, fromPos.lng]} />}
            {toPos && <Marker position={[toPos.lat, toPos.lng]} />}
          </MapContainer>

          <div className="location-inputs">
            <div className="loc-col">
              <label>Source (From)</label>
              <input
                type="text"
                value={fromAddress}
                placeholder="Type address or pick on map"
                onChange={(e) => setFromAddress(e.target.value)}
                onBlur={onFromBlur}
              />
              {fromPos && (
                <div className="pinpointed-location">
                  <div><strong>Pinpoint:</strong> {fromPos.lat.toFixed(5)}, {fromPos.lng.toFixed(5)}</div>
                </div>
              )}
            </div>

            <div className="loc-col">
              <label>Destination (To)</label>
              <input
                type="text"
                value={toAddress}
                placeholder="Type address or pick on map"
                onChange={(e) => setToAddress(e.target.value)}
                onBlur={onToBlur}
              />
              {toPos && (
                <div className="pinpointed-location">
                  <div><strong>Pinpoint:</strong> {toPos.lat.toFixed(5)}, {toPos.lng.toFixed(5)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="actions-row">
          <button className="btn calculate-btn" onClick={calculatePrice}>Calculate Price</button>
        </div>

        <div className="price-section">
          {!price && <p className="muted">Price will appear here after calculation.</p>}
          {price && (
            <>
              <h3>Estimated Price: ₹{price}</h3>
              <p className="distance">Distance: {distanceKm} km</p>

              {feeDetails && (
                <div className="fee-breakdown">
                  <p>Base fare: ₹{feeDetails.baseFare}</p>
                  <p>Distance cost: ₹{feeDetails.distanceCost} ({feeDetails.distance} km × ₹{feeDetails.ratePerKm}/km)</p>
                  <p>Rental ({feeDetails.days} days): ₹{feeDetails.rentalCost}</p>
                  <p>Service fee ({feeDetails.serviceFeePercent}%): ₹{feeDetails.serviceFee}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="consent-section">
          <h4>Booking Terms & Consent</h4>
          <p>
            By confirming you agree that the vehicle will be returned in the same condition it was at pickup,
            with a <strong>full fuel tank</strong>, and without additional damage. The renter is responsible for
            fuel, tolls, and traffic fines. You also consent to the collection of trip details for booking and support.
          </p>
          <label className="consent-checkbox">
            <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
            I have read and agree to the terms above.
          </label>
        </div>

        <div className="actions-row">
          <button
            className="btn confirm-btn"
            onClick={startDriverForm}
            disabled={!consentChecked || !price}
            title={!consentChecked ? "Accept terms to proceed" : !price ? "Calculate price first" : "Proceed"}
          >
            Confirm Booking
          </button>
        </div>
      </div>

      {/* Driver form modal */}
      {showDriverForm && (
        <div className="modal-overlay">
          <div className="modal-content driver-modal">
            <h3>Driver Details & CAPTCHA</h3>
            <form onSubmit={submitDriverForm}>
              <label>Driver Name</label>
              <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} required />

              <label>Driver Contact</label>
              <input type="tel" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} required maxLength={10} />

              <label>Driver Age</label>
              <input type="number" value={driverAge} onChange={(e) => setDriverAge(e.target.value)} required min={18} />

              <label>Driver License No.</label>
              <input type="text" value={driverLicense} onChange={(e) => setDriverLicense(e.target.value)} required maxLength={20} />

              <div className="captcha-row">
                <div className="captcha-box">{captchaValue}</div>
                <input type="text" placeholder="Enter CAPTCHA" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn confirm-btn">Submit Booking</button>
                <button type="button" className="btn cancel-btn" onClick={() => setShowDriverForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {bookingConfirmed && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Booking Confirmed</h3>
            <p>{bookingMessage || "Your booking has been recorded."}</p>
            <div className="modal-buttons">
              <button className="btn" onClick={() => setBookingConfirmed(false)}>Close</button>
              <button className="btn" onClick={() => navigate("/rent-history")}>View Rent History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
