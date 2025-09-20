import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

import car1 from "../assets/car1.jpg";
import car2 from "../assets/car2.jpg";
import car3 from "../assets/car3.jpg";


const sampleVehicles = [
  { id: 1, name: "Sedan Car", image: car1 },
  { id: 2, name: "SUV Car", image: car2 },
  { id: 3, name: "Luxury Car", image: car3 },
  { id: 4, name: "Hatchback", image: car1 },
  { id: 5, name: "Convertible", image: car3 },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? sampleVehicles.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === sampleVehicles.length - 1 ? 0 : prev + 1
    );
  };

  // Show 3 cards at a time
  const visibleVehicles = [
    sampleVehicles[currentIndex],
    sampleVehicles[(currentIndex + 1) % sampleVehicles.length],
    sampleVehicles[(currentIndex + 2) % sampleVehicles.length],
  ];

  return (
    <div className="homepage">
      <section className="hero">
        <h1>Welcome to EasyRent</h1>
        <p>Book your vehicle online easily and quickly.</p>
        <button className="explore-btn" onClick={() => navigate("/vehicles")}>
          Explore Vehicles
        </button>
      </section>

      <section className="vehicles">
        <h2>Our Vehicles</h2>
        <div className="carousel-container">
          <button className="arrow left" onClick={prevSlide}>
            &#10094;
          </button>

          <div className="vehicle-grid">
            {visibleVehicles.map((v) => (
              <div key={v.id} className="vehicle-card">
                <img src={v.image} alt={v.name} />
                <h3>{v.name}</h3>
              </div>
            ))}
          </div>

          <button className="arrow right" onClick={nextSlide}>
            &#10095;
          </button>
        </div>
      </section>
     
    </div>
  );
};

export default HomePage;