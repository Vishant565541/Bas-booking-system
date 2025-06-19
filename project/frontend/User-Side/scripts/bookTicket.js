document.addEventListener("DOMContentLoaded", function () {
    let searchTicketForm = document.getElementById("search-ticket-form");
    let fetchedBusContainer = document.getElementById("fetched-bus-container");
    let bookHeading = document.getElementById("book-heading");

    if (fetchedBusContainer) {
        console.log("Element with ID 'fetched-bus-container' found.");
    } else {
        console.error("Element with ID 'fetched-bus-container' not found.");
    }

    if (bookHeading) {
        bookHeading.style.display = "none";
        console.log("Element with ID 'book-heading' found.");
    } else {
        console.error("Element with ID 'book-heading' not found.");
    }

    // No need to initialize busDetails here, it's local to displayBus
    searchTicketForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await displayBus(); // Fetch and display buses on submit
    });
});

async function displayBus() {
    console.log("Form submitted");

    let fromCity = document.getElementById("formCity").value.trim();
    let toCity = document.getElementById("toCity").value.trim();
    let departureDate = document.getElementById("departue-date").value.trim();

    console.log("From:", fromCity, "To:", toCity, "Date:", departureDate);

    // Input Validation
    if (!fromCity || !toCity || !departureDate) {
        alert("Please fill in all required fields.");
        return;
    }

    console.log("Fetching bus details...");

    try {
        let response = await fetch(`http://localhost:5000/api/admin/viewAllBus`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json(); // Await response JSON
        console.log("Buses fetched:", data);

        // Ensure 'data' is an array
        if (!Array.isArray(data)) {
            console.error("Invalid data format. Expected an array.");
            return;
        }

        // Log each bus's details
        data.forEach(bus => {
            console.log(`Bus: ${bus.busName}, Type: ${bus.busType}, From: ${bus.routeFrom}, To: ${bus.routeTo}, Departure: ${bus.departureTime}, Arrival: ${bus.arrivalTime},Date:${bus.date} Price: ${bus.fare}, Seats: ${bus.availableSeats},id=${bus._id}`);
        });

        // Check available buses
        checkBusDetails(data, fromCity, toCity, departureDate); // Pass data directly

    } catch (error) {
        console.error("Fetch error:", error);
        alert("Failed to fetch bus details. Please try again.");
    }
}

function checkBusDetails(data, fromCity, toCity, departureDate) {
    console.log("Checking bus details...");

    let availableBuses = data.filter(bus => bus.routeFrom === fromCity && bus.routeTo === toCity);

    if (availableBuses.length === 0) {
        alert(`No bus available from ${fromCity} to ${toCity}`);
        let fetchedBusContainer = document.getElementById("fetched-bus-container");
        if (fetchedBusContainer) {
            fetchedBusContainer.innerHTML = "<p>No buses found for your selection.</p>";
        }
        return;
    }

    createBusDetails(availableBuses, departureDate);
}

function createBusDetails(busDetails, departureDate) {
    console.log("Creating bus details...");
    let fetchedBusContainer = document.getElementById("fetched-bus-container");

    if (fetchedBusContainer) {
        fetchedBusContainer.innerHTML = ""; // Clear previous results

        busDetails.forEach((bus) => {
            fetchedBusContainer.appendChild(createBusDiv(bus, departureDate));
        });

        console.log("Bus details displayed successfully.");
    } else {
        console.error("Element 'fetched-bus-container' not found.");
    }
}

function createBusDiv(bus, departureDate) {
    let busDetailsContainer = document.createElement("div");
    busDetailsContainer.classList.add("bus-details-container");

    let busInfo = `
        <p><strong>Bus Name:</strong> ${bus.busName}</p>
        <p><strong>Bus Type:</strong> ${bus.busType}</p>
        <p><strong>Route:</strong> ${bus.routeFrom} → ${bus.routeTo}</p>
        <p><strong>Departure:</strong> ${bus.departureTime}</p>
        <p><strong>Arrival:</strong> ${bus.arrivalTime}</p>
        <p><strong>Price:</strong> ${bus.fare}</p>
        <p><strong>Date:</strong> ${bus.date}</p>
        <p><strong>Seats Available:</strong> ${bus.availableSeats}</p>
    `;
    busDetailsContainer.innerHTML = busInfo;

    let bookButton = document.createElement("button");
    bookButton.innerText = "Book";
    bookButton.addEventListener("click", () => bookTicket(bus, departureDate));

    busDetailsContainer.appendChild(bookButton);
    return busDetailsContainer;
}

async function bookTicket(bus, departureDate) {
    // Assuming you have the userId and authToken available in your frontend
    const userId = JSON.parse(localStorage.getItem("userId"));
    const authToken = localStorage.getItem("authToken"); // Retrieve the token

    const currBus = bus._id;
    console.log("inside booking");
    console.log("User ID:", userId, "Bus ID:", currBus);
    console.log("Auth Token:", authToken); // Log the token for debugging

    let bodyToSend = {
        userId: userId, // Include userId in the body (backend might still need it)
        reservationDate: departureDate,
        source: bus.routeFrom,
        destination: bus.routeTo,
        busId: currBus
    };

    try {
        console.log("Sending booking request with token...");
        const response = await fetch(`http://localhost:5000/api/admin/reservation/${currBus}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}` // Include the JWT token in the Authorization header
            },
            body: JSON.stringify(bodyToSend),
        });
        console.log("Booking request sent.");

        if (!response.ok) {
            const text = await response.text();
            console.error("Server response was not OK:", text);
            let errorMessage = `HTTP error! Status: ${response.status}`;
            try {
                const errorData = JSON.parse(text);
                if (errorData && errorData.message) {
                    errorMessage += `: ${errorData.message}`;
                }
            } catch (e) {
                // If parsing JSON fails, keep the basic HTTP error message
            }
            alert(`Ticket booking failed. Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Booking response:", data);

        if (response.ok) {
            alert(`Ticket Booked Successfully! Your Ticket Id is ${data.reservationId}`);
            window.location.href = "index.html";
        } else {
            alert(`Error: ${data.message || "Failed to book ticket"}`);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("An error occurred. Please try again.");
        console.log("Ticket booking failed.", error);
    }
}