# Bus Booking System

## Overview
This project is a full-stack Bus Booking System that allows users to search for buses, book tickets, check ticket status, cancel reservations, and provide feedback. It also provides an admin dashboard for managing buses, routes, and users.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Frontend](#frontend)
  - [User Side](#user-side)
  - [Admin Section](#admin-section)
- [Database](#database)
- [Setup & Installation](#setup--installation)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)

---

## Features
- User registration and login
- Search for buses by route and date
- Book bus tickets
- View and download ticket status
- Cancel booked tickets
- Submit feedback
- Admin dashboard for managing buses, routes, and users
- Email confirmation for bookings

---

## Project Structure
```
project/
  backend/         # Node.js/Express backend
    config/        # Database config
    middleware/    # Auth middleware
    models/        # Mongoose models
    routes/        # API routes
    server.js      # Backend entry point
  frontend/
    Admin-section/ # Admin dashboard (HTML/CSS/JS)
    User-Side/     # User-facing site (HTML/CSS/JS)
  package.json     # Project dependencies
  server.js        # Main entry (serves frontend & API)
```

---

## Backend
- **Framework:** Node.js with Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT-based, with bcrypt password hashing
- **API Routes:**
  - `/api/users` for user registration, login, profile, and listing
  - `/api/admin` for admin actions: add/view/update/delete buses, manage reservations, view/cancel bookings, and send confirmation emails
- **Email:** Uses Nodemailer for booking confirmations

### Main Models
- **User:** First name, last name, phone, email, password
- **Bus:** Name, number, type, route, times, date, available seats, fare
- **Reservation:** User, bus, date, source, destination, status

---

## Frontend
### User Side
- **Pages:**
  - `index.html`: Home page with search and info
  - `bookTicket.html`: Search and book buses
  - `login.html` / `sugnup.html`: User authentication
  - `ticketStatus.html`: Check and download ticket
  - `cancelTicket.html`: Cancel a ticket
  - `feedback.html`: Submit feedback
- **Features:**
  - Search buses by route and date
  - Book tickets (requires login)
  - View/download/cancel tickets
  - Feedback form (requires login)

### Admin Section
- **Pages:**
  - `Admin_Home.html`: Dashboard with stats and charts
  - `AddBus.html`: Add new buses
  - `bus.html`: View/edit/delete buses
  - `Admin_User_Details.html`: View/delete users
  - `route.html`: Manage routes
- **Features:**
  - Add, edit, delete buses
  - View and manage users
  - Add and manage routes
  - Dashboard with reservation and feedback stats

---

## Database
- **MongoDB** is used for storing users, buses, reservations, and (optionally) feedback.
- Connection is configured in `backend/config/db.js` using `MONGO_URI` from environment variables.

---

## Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd project
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root or backend directory with:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_gmail_address
     EMAIL_PASS=your_gmail_app_password
     ```
4. **Start the server:**
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:5000` by default.
5. **Access the app:**
   - User site: [http://localhost:5000/](http://localhost:5000/)
   - Admin dashboard: [http://localhost:5000/admin](http://localhost:5000/admin)

---

## How It Works
### User Flow
1. **Sign Up / Login:**
   - Users register and log in to access booking features.
2. **Search & Book:**
   - Search for buses by entering source, destination, and date.
   - View available buses and book a ticket (requires login).
   - On booking, a confirmation email is sent.
3. **Ticket Management:**
   - Check ticket status by entering ticket ID.
   - Download ticket as text file.
   - Cancel ticket if needed.
4. **Feedback:**
   - After booking, users can submit feedback about their experience.

### Admin Flow
1. **Login as Admin:**
   - Access the admin dashboard via `/admin` (default admin: a@gmail.com / 123456).
2. **Manage Buses:**
   - Add, edit, or delete buses.
3. **Manage Users:**
   - View and delete users.
4. **Manage Routes:**
   - Add and manage bus routes.
5. **View Stats:**
   - Dashboard shows reservation and feedback statistics.

---

## API Endpoints (Sample)
- `POST /api/users/signup` — Register a new user
- `POST /api/users/login` — User login
- `GET /api/admin/viewAllBus` — List all buses
- `POST /api/admin/addbus` — Add a new bus (admin)
- `POST /api/admin/reservation/:busId` — Book a ticket
- `GET /api/admin/view/:reservationId` — View ticket details
- `DELETE /api/admin/delete/:reservationId` — Cancel a reservation

---

## Technologies Used
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Authentication:** JWT, bcryptjs
- **Email:** Nodemailer
- **Other:** dotenv, cors, uuid

---

## Notes
- Make sure MongoDB is running and accessible.
- For email features, use a Gmail account and app password.
- The project is modular and can be extended with more features (e.g., payment integration, seat selection, etc.).

---

## License
This project is licensed under the ISC License. 
