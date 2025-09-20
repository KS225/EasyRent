import { useState } from "react";
import "../styles/chat.css";

const promptTree = {
  start: {
    text: "Hey! How can I assist you today?",
    options: [
      { label: "Booking a vehicle", next: "booking" },
      { label: "Vehicle info", next: "vehicleInfo" },
      { label: "Pricing & offers", next: "pricing" },
    ],
  },
  booking: {
    text: "Great! What type of vehicle would you like to book?",
    options: [
      { label: "Sedan", next: "bookingConfirm" },
      { label: "SUV", next: "bookingConfirm" },
      { label: "Luxury", next: "bookingConfirm" },
    ],
  },
  vehicleInfo: {
    text: "Sure! What info do you need?",
    options: [
      { label: "Features", next: "infoDetail" },
      { label: "Availability", next: "infoDetail" },
    ],
  },
  pricing: {
    text: "We have some great offers. What do you want to know?",
    options: [
      { label: "Daily rates", next: "pricingDetail" },
      { label: "Weekly rates", next: "pricingDetail" },
    ],
  },
  bookingConfirm: {
    text: "Your booking request is noted. Our team will contact you soon!",
    options: [{ label: "Thank you", next: "start" }],
  },
  infoDetail: {
    text: "Here is the information you requested.",
    options: [{ label: "Thank you", next: "start" }],
  },
  pricingDetail: {
    text: "Here are the current rates and offers.",
    options: [{ label: "Thank you", next: "start" }],
  },
};

const Chat = () => {
  const [visible, setVisible] = useState(false);
  const [history, setHistory] = useState([{ role: "bot", text: promptTree.start.text }]);
  const [currentNode, setCurrentNode] = useState("start");

  const handleOptionClick = (option) => {
    setHistory((prev) => [...prev, { role: "user", text: option.label }]);
    const nextNode = option.next;
    setCurrentNode(nextNode);

    setTimeout(() => {
      setHistory((prev) => [...prev, { role: "bot", text: promptTree[nextNode].text }]);
    }, 300);
  };

  const handleClose = () => {
    setVisible(false);
    // Reset chat
    setHistory([{ role: "bot", text: promptTree.start.text }]);
    setCurrentNode("start");
  };

  return (
    <>
      {/* Floating chat button */}
      {!visible && (
        <button className="chat-toggle-btn" onClick={() => setVisible(true)}>
          💬
        </button>
      )}

      {visible && (
        <div className="chatbot-popup">
          <div className="chat-header">
            <h2>Chatbot</h2>
            <button onClick={handleClose}>×</button>
          </div>

          <div className="chat-body">
            {history.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}-message`}>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="chat-footer">
            {promptTree[currentNode].options.map((opt, idx) => (
              <button key={idx} className="option-btn" onClick={() => handleOptionClick(opt)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
