const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Bus Booking System API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
