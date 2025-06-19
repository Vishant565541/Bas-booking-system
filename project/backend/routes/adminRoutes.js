require('dotenv').config();
const express = require("express");
const Bus = require("../models/bus");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const protect = require("../middleware/authMiddleware");
const Reservation = require("../models/reservation");
const User = require("../models/person");
const nodemailer = require('nodemailer');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper function to send booking confirmation email
async function sendBookingConfirmationEmail(userEmail, reservationDetails) {
    console.log("Sending email to:", userEmail);
    console.log("Reservation details:", reservationDetails);

    let formattedDepartureTime = 'Invalid Time';
    try {
        const reservationDate = new Date(reservationDetails.reservationDate);
        const [hours, minutes] = reservationDetails.busDetails.departureTime.split(':');

        // Create a new Date object using the reservation date and departure time
        const departureDateTime = new Date(
            reservationDate.getFullYear(),
            reservationDate.getMonth(),
            reservationDate.getDate(),
            parseInt(hours, 10),
            parseInt(minutes, 10)
        );

        if (!isNaN(departureDateTime)) {
            formattedDepartureTime = departureDateTime.toLocaleTimeString();
        } else {
            console.warn("Warning: Invalid departureTime format:", reservationDetails.busDetails.departureTime);
        }
    } catch (error) {
        console.error("Error parsing departure time:", error);
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Your Bus Ticket Booking Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #007bff; margin-top: 0;">Your Bus Ticket Booking Confirmation</h2>
                    <p style="color: #333;">Dear Customer,</p>
                    <p style="color: #333;">Your bus ticket has been booked successfully!</p>
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 3px; background-color: #fff;">
                        <strong style="color: #555;">Reservation ID:</strong> <span style="color: #333;">${reservationDetails.reservationId}</span>
                    </div>
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 3px; background-color: #fff;">
                        <strong style="color: #555;">Bus:</strong> <span style="color: #333;">${reservationDetails.busDetails.routeFrom} to ${reservationDetails.busDetails.routeTo}</span>
                    </div>
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 3px; background-color: #fff;">
                        <strong style="color: #555;">Date:</strong> <span style="color: #333;">${new Date(reservationDetails.reservationDate).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 3px; background-color: #fff;">
                        <strong style="color: #555;">Time:</strong> <span style="color: #333;">${formattedDepartureTime}</span>
                    </div>
                    <p style="color: #333; margin-top: 20px;">Thank you for booking with us!</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        // Consider if you want to throw this error or handle it differently
    }
}

// Add a new bus (protected route)
router.post("/addbus", protect, async (req, res) => {
    try {
        const {
            busName,
            busNo,
            busType,
            routeFrom,
            routeTo,
            arrivalTime,
            departureTime,
            fare,
            availableSeats,
            date,
        } = req.body;

        if (!busName || !busNo || !routeFrom || !routeTo || !fare || !availableSeats || !date || !departureTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newBus = new Bus({
            busName,
            busNo,
            busType,
            routeFrom,
            routeTo,
            arrivalTime,
            departureTime,
            fare,
            availableSeats,
            date,
        });

        await newBus.save();

        res.status(201).json({ message: "Bus added successfully" });
        console.log("Bus added successfully");
    } catch (error) {
        console.error("Error adding bus:", error);
        res.status(500).json({ message: "Failed to add bus", error: error.message });
    }
});

// Get all buses
router.get("/buses", async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (error) {
        console.error("Error getting buses:", error);
        res.status(500).json({ message: "Failed to get buses", error: error.message });
    }
});

router.get("/viewAllBus", async (req, res) => {
    try {
        console.log("find bus");
        const buses = await Bus.find();
        res.json(buses);
    } catch (error) {
        console.error("Error getting buses:", error);
        res.status(500).json({ message: "Failed to get buses", error: error.message });
    }
});

//booking
router.post("/reservation/:busId", protect, async (req, res) => {
    try {
        console.log("reservation");
        console.log(req.body);
        const { reservationDate, source, destination } = req.body;
        const { busId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        if (bus.availableSeats <= 0) {
            return res.status(400).json({ message: "No seats available" });
        }

        const newReservation = new Reservation({
            userId: req.user.id,
            busId,
            reservationDate,
            source,
            destination,
            name: user.fname,
            email: user.email,
            reservationStatus: "Confirmed",
        });

        await newReservation.save();

        bus.availableSeats -= 1;
        await bus.save();

        res.status(201).json({
            message: "Ticket booked successfully",
            reservationId: newReservation._id,
        });

        // Send confirmation email
        try {
            await sendBookingConfirmationEmail(user.email, {
                reservationId: newReservation._id,
                reservationDate: newReservation.reservationDate,
                busDetails: {
                    routeFrom: bus.routeFrom,
                    routeTo: bus.routeTo,
                    departureTime: bus.departureTime,
                },
            });
        } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
        }
        console.log("Departure Time from Bus object:", bus.departureTime); // Log directly from the bus object

    } catch (error) {
        console.error("Error booking ticket:", error);
        let errorMessage = "Failed to book ticket. ";
        if (error.message.includes("User not found")) {
            errorMessage += "User authentication failed.";
        } else if (error.message.includes("Bus not found")) {
            errorMessage += "The selected bus was not found.";
        } else if (error.message.includes("No seats available")) {
            errorMessage += "No available seats on this bus.";
        } else if (error.message.includes("Cast to ObjectId failed")) {
            errorMessage += "Invalid Bus ID format.";
        } else {
            errorMessage += "An unexpected error occurred.";
        }
        res.status(500).json({ message: errorMessage, error: error.message });
        console.log(error);
    }
});

router.put("/updateBus/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBus = await Bus.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBus) {
            return res.status(404).json({ message: "Bus not found" });
        }
        res.json(updatedBus);
    } catch (error) {
        console.error("Error updating bus:", error);
        res.status(500).json({ message: "Failed to update bus", error: error.message });
    }
});

router.get("/view/:reservationId", protect, async (req, res) => {
    try {
        const { reservationId } = req.params;

        console.log("🔍 Viewing reservation:", reservationId);
        console.log("User ID from token:", req.user.id); // Log the user ID from the token

        // ✅ Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ message: "Invalid reservation ID format." });
        }

        // ✅ Fetch reservation and populate bus
        const reservation = await Reservation.findById(reservationId).populate('busId');

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        // ✅ Ensure reservation has userId
        if (!reservation.userId) {
            console.warn("⚠️ Reservation has no userId field.");
            return res.status(500).json({ message: "Reservation data is incomplete (userId missing)." });
        }

        // ✅ Compare reservation user with logged-in user
        const reservationUserId = reservation.userId.toString();
        const loggedInUserId = req.user.id.toString();

        if (reservationUserId !== loggedInUserId) {
            console.warn("❌ Unauthorized access attempt.");
            console.log("Reservation userId:", reservationUserId);
            console.log("Logged-in userId:", loggedInUserId);
            return res.status(403).json({ message: "Unauthorized access to this reservation." });
        }

        // ✅ Ensure bus details exist
        if (!reservation.busId) {
            return res.status(500).json({ message: "Bus details missing in reservation." });
        }

        // ✅ All good - send reservation details
        res.status(200).json({
            reservationId: reservation._id,
            bus: {
                busName: reservation.busId.busName,
                departureTime: reservation.busId.departureTime,
            },
            source: reservation.source,
            name: reservation.name,
            email: reservation.email,
            destination: reservation.destination,
            reservationDate: reservation.reservationDate,
            reservationStatus: reservation.reservationStatus || "Confirmed",
        });

    } catch (error) {
        console.error("🔥 Error viewing reservation:", error);
        res.status(500).json({
            message: "Failed to view reservation.",
            error: error.message,
        });
    }
});

// DELETE /reservation/delete/:reservationId
router.delete("/delete/:reservationId", protect, async (req, res) => {
    try {
        console.log("Cancelling reservation:", req.params.reservationId);
        console.log("User ID from token:", req.user.id); // Log the user ID from the token
        const { reservationId } = req.params;

        const reservation = await Reservation.findById(reservationId).populate('busId');

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        if (reservation.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Reservation does not belong to this user." });
        }

        // Update bus availability
        const bus = await Bus.findById(reservation.busId);
        if (bus) {
            bus.availableSeats += 1;
            await bus.save();
        }

        await Reservation.findByIdAndDelete(reservationId);
        res.json({ message: "Reservation cancelled successfully." });

    } catch (error) {
        console.error("Error cancelling reservation:", error);
        res.status(500).json({ message: "Failed to cancel reservation.", error: error.message });
    }
});

module.exports = router;