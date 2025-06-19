const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./backend/config/db");
const userRoutes = require("./backend/routes/userRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

// ✅ Serve Static Files FIRST
app.use(express.static(path.join(__dirname, "frontend", "User-Side")));
app.use(express.static(path.join(__dirname, "frontend", "Admin-section")));

// ✅ Route for User Homepage
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "User-Side", "index.html"));
});

// ✅ Route for Admin Homepage
app.get("/admin", (req, res) => {
  const filePath = path.resolve(__dirname, "frontend", "Admin-section", "Admin_Home.html");
  console.log("Trying to serve file:", filePath);

  res.sendFile(filePath, (err) => {
      if (err) {
          console.error("Error serving Admin_Home.html:", err);
          res.status(err.status || 500).send("Error loading Admin_Home.html");
      } else {
          console.log("Admin_Home.html served successfully");
      }
  });
});


// ✅ User and Admin API Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
