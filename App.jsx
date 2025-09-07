import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import VehiclesPage from "./pages/VehiclesPage";
import NotFound from "./pages/NotFound"; // optional: create a simple 404 page
import BookingPage from "./pages/BookingPage";
import RentHistory from "./pages/RentHistory";

// inside <Routes>


function App() {
  return (
    <Router>
      <Header /> {/* Single header for all pages */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="*" element={<NotFound />} /> {/* optional fallback */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/rent-history" element={<RentHistory />} />

      </Routes>
    </Router>
  );
}

export default App;
