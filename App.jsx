import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import VehiclesPage from "./pages/VehiclesPage";
import NotFound from "./pages/NotFound";
import BookingPage from "./pages/BookingPage";
import RentHistory from "./pages/RentHistory";
import Chat from "./components/chat";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Default HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />

        {/* User */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/rent-history" element={<RentHistory />} />

        {/* Vehicles & Booking */}
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/booking" element={<BookingPage />} />

        {/* Catch-all redirect to HomePage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Chatbot visible on all pages */}
      <Chat />
      <Footer />
    </Router>
  );
}

export default App;
