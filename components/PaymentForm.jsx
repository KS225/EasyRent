import React, { useState } from "react";
import "../styles/PaymentForm.css";

const PaymentForm = ({ amount, onSuccess, onCancel }) => {
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [error, setError] = useState("");

    const validateExpiry = (exp) => {
        if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
        const [month, year] = exp.split("/").map(Number);
        if (month < 1 || month > 12) return false;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear() % 100;

        return year > currentYear || (year === currentYear && month >= currentMonth);
    };

    const handlePay = (e) => {
        e.preventDefault();

        // Validation
        if (cardNumber.length < 13 || cardNumber.length > 16) {
            setError("Card number must be 13–16 digits");
            return;
        }
        if (cardName.trim().length < 3) {
            setError("Please enter a valid cardholder name");
            return;
        }
        if (!validateExpiry(expiry)) {
            setError("Invalid expiry date");
            return;
        }
        if (!/^\d{3,4}$/.test(cvv)) {
            setError("Invalid CVV (3 or 4 digits)");
            return;
        }

        setError(""); // clear error
        // simulate success
        onSuccess({
            transactionId: "TXN" + Math.floor(Math.random() * 1000000),
        });
    };

    return (
        <div className="payment-overlay">
            <div className="payment-modal">
                <h2>Payment</h2>
                <p className="amount">Total Amount: ₹{amount}</p>
                <form onSubmit={handlePay} className="payment-form">
                    {error && <p className="error">{error}</p>}

                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setCardNumber(val.slice(0, 16));
                            }}
                            placeholder="1234 5678 9012 3456"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                            type="text"
                            value={cardName}
                            onChange={(e) => {
                                // Allow only letters and spaces
                                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                setCardName(val);
                            }}
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group small">
                            <label>Expiry (MM/YY)</label>
                            <input
                                type="text"
                                value={expiry}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, "");
                                    if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                    setExpiry(val.slice(0, 5));
                                }}
                                placeholder="MM/YY"
                                required
                            />
                        </div>
                        <div className="form-group small">
                            <label>CVV</label>
                            <input
                                type="password"
                                value={cvv}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setCvv(val.slice(0, 4));
                                }}
                                placeholder="123"
                                required
                            />
                        </div>
                    </div>

                    <div className="payment-buttons">
                        <button type="submit" className="btn pay-btn">
                            Pay Now
                        </button>
                        <button
                            type="button"
                            className="btn cancel-btn"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
