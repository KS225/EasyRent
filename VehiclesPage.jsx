import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/VehiclesPage.css";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch logged-in user
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/current-user", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentUser();

    // Fetch vehicles
    const fetchVehicles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vehicles");
        const data = await res.json();
        setVehicles(data.vehicles);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
  }, []);

  const handleBookClick = (vehicle) => {
    if (!user) {
      setShowModal(true);
      return;
    }
    navigate("/booking", { state: { vehicle } });
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" || v.type === filter)
  );

  return (
    <div className="vehicles-page">
      <h1>Available Vehicles</h1>

      {/* Search & Filter */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Luxury">Luxury</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Convertible">Convertible</option>
        </select>
      </div>

      {/* Vehicles Grid */}
      <div className="vehicles-grid">
  {filteredVehicles.map((v) => (
    <div key={v.id} className="vehicle-card">
      <img src={v.image_url} alt={v.name} />
      <h3>{v.name}</h3>
      <p>Brand: {v.brand}</p>
      <p>Type: {v.type}</p>
      <p>Year: {v.year_of_manufacture}</p>
      <p>Seats: {v.seating_capacity}</p>
      <p>Fuel: {v.fuel_type}</p>
      <p>Mileage: {v.mileage} km/l</p>
      <p>Price: ₹{v.price_per_day} / day</p>
      <button className="book-button" onClick={() => handleBookClick(v)}>
        Book Now
      </button>
    </div>
  ))}
</div>


      {/* Sign-in Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sign In Required</h2>
            <p>You must sign in or log in to book a vehicle.</p>
            <div className="modal-buttons">
              <button onClick={() => (window.location.href = "/signin")}>
                Sign In
              </button>
              <button onClick={() => (window.location.href = "/login")}>
                Login
              </button>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
