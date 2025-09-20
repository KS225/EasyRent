import React, { useEffect, useState } from "react";
import "../styles/RentHistory.css";
import { generateBookingReceipt } from "../utils/generateReceipt";

const RentHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback modal state
  const [feedbackBookingId, setFeedbackBookingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings-history", {
          credentials: "include",
        });
        if (res.status === 401) {
          alert("You must be logged in to view your booking history.");
          setBookings([]);
          setLoading(false);
          return;
        }
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

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert("Booking cancelled successfully.");
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling booking.");
    }
  };

  // Submit feedback
  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return alert("Please select a star rating.");
    if (!feedbackText.trim()) return alert("Please enter your review.");

    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${feedbackBookingId}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ rating: feedbackRating, reviewText: feedbackText }),
        }
      );

      if (res.ok) {
        alert("Thank you for your feedback!");
        setBookings((prev) =>
          prev.map((b) =>
            b.id === feedbackBookingId
              ? { ...b, feedback: { rating: feedbackRating, reviewtext: feedbackText } }
              : b
          )
        );
        setFeedbackBookingId(null);
        setFeedbackText("");
        setFeedbackRating(0);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback.");
    }
  };

  if (loading) return <p>Loading rent history...</p>;
  if (!bookings.length)
    return (
      <div className="rent-history">
        <h3>Your Rent History</h3>
        <p>No bookings found.</p>
      </div>
    );

  return (
    <div className="rent-history">
      <div className="history-header">
        <h3>Your Rent History</h3>
      </div>
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
            <th>Receipt</th>
            <th>Feedback</th>
            <th>Cancel</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.vehicle_name}</td>
              <td>{b.pickup_location}</td>
              <td>{b.drop_location}</td>
              <td>
                {new Date(b.date_from).toLocaleDateString()} to {new Date(b.date_to).toLocaleDateString()}
              </td>
              <td>₹{b.price}</td>
              <td>{b.driver_name}</td>
              <td>{new Date(b.created_at).toLocaleString()}</td>
              <td>
                <button
                  className="btn download-btn"
                  onClick={() =>
                    generateBookingReceipt({
                      id: b.id,
                      transactionId: b.transaction_id,
                      vehicleName: b.vehicle_name,
                      pickup: b.pickup_location,
                      drop: b.drop_location,
                      dateFrom: b.date_from,
                      dateTo: b.date_to,
                      driverName: b.driver_name,
                      driverContact: b.driver_contact,
                      price: b.price,
                    })
                  }
                >
                  Download PDF
                </button>
              </td>
              <td>
                {b.feedback ? (
                  <div>
                    <div>
                      {"★".repeat(b.feedback.rating) + "☆".repeat(5 - b.feedback.rating)}
                    </div>
                    <div>{b.feedback.reviewtext}</div>
                  </div>
                ) : (
                  <button
                    className="btn feedback-btn"
                    onClick={() => {
                      setFeedbackBookingId(b.id);
                      setFeedbackText("");
                      setFeedbackRating(0);
                    }}
                  >
                    Leave Feedback
                  </button>
                )}
              </td>
              <td>
                <button
                  className="btn cancel-btn"
                  onClick={() => handleCancelBooking(b.id)}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Feedback Modal */}
      {feedbackBookingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {bookings.find((b) => b.id === feedbackBookingId)?.feedback
                ? "Edit Feedback"
                : "Leave Feedback"}
            </h3>

            {/* Star rating */}
            <div style={{ fontSize: 30, margin: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    cursor: "pointer",
                    color: (hoverRating || feedbackRating) >= star ? "#ffc107" : "#e4e5e9",
                  }}
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Write your review here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                borderRadius: 5,
                border: "1px solid #ccc",
              }}
            />

            <div className="modal-buttons">
              <button className="btn confirm-btn" onClick={handleFeedbackSubmit}>
                Submit
              </button>
              <button className="btn cancel-btn" onClick={() => setFeedbackBookingId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentHistory;
