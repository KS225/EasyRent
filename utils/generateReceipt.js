import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ correct way to import

export const generateBookingReceipt = (booking) => {
  const doc = new jsPDF();

  // Header
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(40, 167, 69); // brand green
  doc.rect(0, 0, pageWidth, 25, "F"); // filled header rectangle

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("EasyRent Vehicles", pageWidth / 2, 17, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text("Booking Receipt", pageWidth / 2, 35, { align: "center" });

  // Table with booking details
  autoTable(doc, {
    startY: 45,
    head: [["Field", "Details"]],
    body: [
      ["Booking ID", booking.id || "N/A"],
      ["Transaction ID", booking.transactionId || "N/A"],
      ["Vehicle", booking.vehicleName],
      ["From", booking.pickup],
      ["To", booking.drop],
      ["From Date", booking.dateFrom],
      ["To Date", booking.dateTo],
      ["Driver Name", booking.driverName],
      ["Driver Contact", booking.driverContact],
      ["Total Price", `${booking.price}.RS`],
    ],
    theme: "grid",
    headStyles: { fillColor: [40, 167, 69], textColor: 255 },
    styles: { cellPadding: 3, fontSize: 11 },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || 70;
  doc.setFontSize(10);
  doc.text(
    "Thank you for booking with EasyRent! We wish you a safe ride.",
    pageWidth / 2,
    finalY + 15,
    { align: "center" }
  );

  // Save PDF
  doc.save(`BookingReceipt_${booking.id || "N/A"}.pdf`);
};
