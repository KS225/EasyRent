import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RentHistory.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const downloadReceipt = (booking) => {
    // ---------- Wider PDF in landscape ----------
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // ---------- Logo & Title ----------
    const logoUrl = "/assets/logo.png"; // your app logo path
    const imgWidth = 30;
    const imgHeight = 30;
    const startY = 20;

    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl;
      img.onload = function () {
        doc.addImage(img, "PNG", 20, startY, imgWidth, imgHeight);
        finalizeReceipt();
      };
      img.onerror = finalizeReceipt;
    } else {
      finalizeReceipt();
    }

    function finalizeReceipt() {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;

  // ---------- Title ----------
  doc.setFontSize(20);
  doc.text("Booking Receipt", pageWidth / 2, startY + 15, null, null, "center");

  doc.setFontSize(12);
  doc.text(`Booking ID: ${booking.id}`, marginLeft, startY + 45);

  // Right-aligned Booking Date
  doc.text(
    `Booking Date: ${new Date(booking.created_at).toLocaleString()}`,
    pageWidth - marginRight,
    startY + 45,
    { align: "right" }
  );

  // ---------- Vehicle & Driver Info Table ----------
autoTable(doc, {
  startY: startY + 55,
  head: [["Field", "Details"]],
  body: [
    ["Vehicle", `${booking.vehicle_name} (ID: ${booking.vehicle_id})`],
    ["Pickup Location", booking.pickup_location],
    ["Drop Location", booking.drop_location],
    [
      "Rental Dates",
      `${new Date(booking.date_from).toLocaleDateString()} - ${new Date(
        booking.date_to
      ).toLocaleDateString()}`
    ],
    ["Price", `${booking.price} Rs.`],
    ["Driver Name", booking.driver_name],
  ],
  styles: { 
    fontSize: 12, 
    cellPadding: 5,
    lineWidth: 0.3,     // thickness of borders
    lineColor: [0, 0, 0] // black borders for all cells
  },
  headStyles: { 
    fillColor: [41, 128, 185], 
    textColor: 255,
    lineWidth: 0.3,
    lineColor: [0, 0, 0]
  },
  alternateRowStyles: { 
    fillColor: [240, 240, 240] 
  },
  tableWidth: doc.internal.pageSize.getWidth() - 40, // wide table
  margin: { left: 20, right: 20 },
  didDrawCell: (data) => {
    // Draw border for each cell
    doc.setDrawColor(0, 0, 0); // black color
    doc.setLineWidth(0.3);
    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
  },
});




  // ---------- Footer ----------
  const finalY = doc.lastAutoTable.finalY || startY + 100;
  doc.text("Thank you for booking with us!", pageWidth / 2, finalY + 20, null, null, "center");

  doc.save(`Booking_${booking.id}.pdf`);
}

  };

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
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.vehicle_name}</td>
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
                <td>
                  <button className="btn" onClick={() => downloadReceipt(booking)}>Download</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>No bookings found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RentHistory;
