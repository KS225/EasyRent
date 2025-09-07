import React, { useEffect, useState } from "react";
import "../styles/RentHistory.css";

const RentHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings-history", {
          credentials: "include",
        });
        const data = await res.json();
        setBookings(data.bookings || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <p>Loading rent history...</p>;
  if (!bookings.length) return <p>No bookings found.</p>;

  return (
    <div className="rent-history">
      <h3>Your Rent History</h3>
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
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.vehicle_name}</td>
              <td>{b.pickup_location}</td>
              <td>{b.drop_location}</td>
              <td>{b.date}</td>
              <td>₹{b.price}</td>
              <td>{b.driver_name}</td>
              <td>{new Date(b.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentHistory;
