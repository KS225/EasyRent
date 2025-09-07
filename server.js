// server.js
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcryptjs";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// MySQL Connection
const db = await mysql.createConnection({
  host: "localhost",
  user: "Vrushali",
  password: "Vrushali@1220",
  database: "vehiclerental",
});
console.log("Connected to MySQL!");

// ----------------- SIGNUP -----------------
app.post("/api/signup", async (req, res) => {
  const { fullName, dob, email, contact, city, state, pincode, username, password } = req.body;

  if (!fullName || !dob || !email || !contact || !city || !state || !pincode || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existing] = await db.execute(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length > 0) return res.status(400).json({ message: "Email or username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      `INSERT INTO users
       (full_name, dob, email, contact, city, state, pincode, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, dob, email, contact, city, state, pincode, username, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- LOGIN -----------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    req.session.userId = user.id;
    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, fullName: user.full_name },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- CURRENT USER -----------------
app.get("/api/current-user", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  try {
    const [rows] = await db.execute(
      "SELECT id, username, full_name FROM users WHERE id = ?",
      [req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error("Current User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- BOOKING API -----------------
app.post("/api/bookings", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Please login first" });

  const {
    vehicleId,
    pickup,
    drop,
    dateFrom,
    dateTo,
    price,
    driverName,
    driverContact,
    driverAge,
    driverLicense,
  } = req.body;

  if (!vehicleId || !pickup || !drop || !dateFrom || !dateTo || !price || !driverName || !driverContact || !driverAge || !driverLicense) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await db.execute(
      `INSERT INTO bookings 
       (user_id, vehicle_id, pickup_location, drop_location, date_from, date_to, price, driver_name, driver_contact, driver_age, driver_license)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.session.userId, vehicleId, pickup, drop, dateFrom, dateTo, price, driverName, driverContact, driverAge, driverLicense]
    );

    res.status(201).json({ message: "Booking saved successfully" });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Failed to save booking" });
  }
});

// ----------------- BOOKINGS HISTORY -----------------
app.get("/api/bookings-history", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Please login first" });

  try {
    const [rows] = await db.execute(
      `SELECT 
         b.id AS booking_id,
         b.vehicle_id,
         COALESCE(v.name, 'Unknown Vehicle') AS vehicle_name,
         b.pickup_location,
         b.drop_location,
         b.date_from,
         b.date_to,
         b.price,
         b.driver_name,
         b.driver_contact,
         b.driver_age,
         b.driver_license,
         b.created_at
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.session.userId]
    );

    const bookings = rows.map(row => ({ id: row.booking_id, ...row }));
    res.json({ bookings });
  } catch (err) {
    console.error("Bookings History Error:", err);
    res.status(500).json({ message: "Failed to fetch bookings history" });
  }
});


// ----------------- LOGOUT -----------------
app.post("/api/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

app.put("/api/update-profile", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { city, state, pincode, password } = req.body;

    await db.query(
      "UPDATE users SET city = ?, state = ?, pincode = ? WHERE id = ?",
      [city, state, pincode, req.session.userId]
    );

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [hashedPassword, req.session.userId]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/profile", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await db.query(
      `SELECT 
        full_name, 
        email, 
        username, 
        dob,
        city, 
        state, 
        pincode, 
        contact,
        TIMESTAMPDIFF(YEAR, dob, CURDATE()) AS age
       FROM users 
       WHERE id = ?`,
      [req.session.userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add these imports at the top
import multer from "multer";
import fs from "fs";

// Setup multer
const upload = multer({ dest: "uploads/" });

// ----------------- UPLOAD AVATAR -----------------
app.post("/api/upload-avatar", upload.single("avatar"), async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const avatarPath = `/uploads/${req.file.filename}`;
    await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
      avatarPath,
      req.session.userId,
    ]);
    res.json({ message: "Avatar updated successfully", avatar: avatarPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading avatar" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// server.js or routes/vehicles.js
app.get("/api/vehicles", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vehicles"); // MySQL
    res.json({ vehicles: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- Serve React build -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 