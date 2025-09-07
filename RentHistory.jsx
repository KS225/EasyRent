import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RentHistory.css";

const RentHistory = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bookings-history", { withCredentials: true })
      .then((res) => {
        console.log("Bookings API response:", res.data);
        setBookings(res.data.bookings || []);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
      });
  }, []);

  return (
    <div className="rent-history">
      <h2>Your Rent History</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Pickup</th>
            <th>Drop</th>
            <th>Date</th>
            <th>Price</th>
            <th>Driver</th>
            <th>Booking Date</th>
          </tr>
        </thead>
        <tbody>
  {bookings.length > 0 ? (
    bookings.map((booking) => (
      <tr key={booking.id}>
        <td>
          <strong>{booking.vehicle_name}</strong> (ID: {booking.vehicle_id})
        </td>
        <td>{booking.pickup_location}</td>
        <td>{booking.drop_location}</td>
        <td>
          {booking.date_from && booking.date_to
            ? `${new Date(booking.date_from).toLocaleDateString()} - ${new Date(
                booking.date_to
              ).toLocaleDateString()}`
            : "N/A"}
        </td>
        <td>₹{booking.price}</td>
        <td>{booking.driver_name}</td>
        <td>{new Date(booking.created_at).toLocaleString()}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" style={{ textAlign: "center" }}>
        No bookings found
      </td>
    </tr>
  )}
</tbody>

      </table>
    </div>
  );
};

export default RentHistory;
