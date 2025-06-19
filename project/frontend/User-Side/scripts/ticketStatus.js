// Frontend (JavaScript)

const search_ticket_button = document.getElementById("search-ticket-button");
const ticket_tabel = document.getElementById("ticket-table");
const ticket_cancel_buttons = document.getElementById(
    "cancel-or-download-ticket"
);
const download_ticket_button = document.getElementById(
    "download-ticket-button"
);
const cancel_ticket_button = document.getElementById("cancel-ticket-button");
var fetchedDataId = null;
var fetchedTicketData = null; // To store fetched ticket data for download

const currUserId = JSON.parse(localStorage.getItem("uuid"));
if (currUserId == null) {
    alert("Please Login to Check Ticket status...!");
    window.location.href = "./login.html";
}

function fetchAndDisplayTicket(searchId) { // Only declare it once here
    // const apiUrl = `http://localhost:5000/api/admin/view/${searchId}?key=${currUserId}`;
    const authToken = localStorage.getItem("authToken"); // Retrieve the token
    console.log("Auth Token:", authToken); // Log the token for debugging
    console.log("User ID:", currUserId); // Log the user ID for debugging
    console.log("Search ID:", searchId); // Log the search ID for debugging
    fetch(`http://localhost:5000/api/admin/view/${searchId}?key=${currUserId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`, // Include the token in the Authorization header
        },
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || "Network response was not ok");
            });
        }
        return response.json();
    })
    .then((data) => {
                console.log(data);
                fetchedTicketData = data; // Store the fetched data
                fetchedDataId = data.reservationId;
        
                ticket_tabel.style.visibility = "visible";
                ticket_cancel_buttons.style.visibility = "visible";
                document.getElementById("ticketId").textContent = data.reservationId;
                document.getElementById("departure-time").textContent = data.bus.departureTime + " IST";
                document.getElementById("busName").textContent = data.bus.busName;
                document.getElementById("source").textContent = data.source;
                document.getElementById("destination").textContent = data.destination;
                document.getElementById("reservationDate").textContent = new Date(data.reservationDate).toLocaleDateString(); // Format date
                document.getElementById("name").textContent = data.name; // Display name
                console.log(data.name)
                console.log(data.email)
                document.getElementById("email").textContent = data.email; // Display email
                document.getElementById("ticketStatus").textContent = data.reservationStatus; // Display reservation status
        
                // Apply styling to the ticket status
                const ticketStatusElement = document.getElementById("ticketStatus");
                console.log(ticketStatusElement);
        
                // Remove any existing status-specific classes
                ticketStatusElement.classList.remove("status-confirmed", "status-cancelled", "status-pending");
        
                // Add status-specific classes for different styles
                if (data.reservationStatus.toLowerCase() === "confirmed") {
                    ticketStatusElement.classList.add("status-confirmed");
                } else if (data.reservationStatus.toLowerCase() === "cancelled") {
                    ticketStatusElement.classList.add("status-cancelled");
                } else if (data.reservationStatus.toLowerCase() === "pending") {
                    ticketStatusElement.classList.add("status-pending");
                }
        
                ticketStatusElement.classList.add("ticket-status"); // Add the generic class last
            })
            .catch((error) => {
                alert(`Error: ${error.message || "Failed to fetch ticket details. Please enter the correct Ticket ID."}`); // More informative error
            });
}
search_ticket_button.addEventListener("click", () => {
    
    const searchId = document.getElementById("search-ticket-id").value;
    if (searchId == "") {
        alert("Please Enter Id To Check Status");
        return;
    }
    fetchAndDisplayTicket(searchId);
});

function cancelTicket() {
    const userConfirmed = confirm("Are You Sure You Want To Cancel ?");
    const authToken = localStorage.getItem("authToken"); // Retrieve the token
    console.log("Auth Token:", authToken); // Log the token for debugging
    if (userConfirmed) {
        // const cancelTicketApi = `http://localhost:5000/api/admin/delete/${fetchedDataId}?key=${currUserId}`;
        fetch(`http://localhost:5000/api/admin/delete/${fetchedDataId}`, {
                     method: "DELETE", // Use DELETE method
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    })
        .then((response) => {
            if (response.ok) {
                return response.json().then((data) => {
                    alert("Reservation Cancelled Successfully...!");
                    window.location.href = "http://127.0.0.1:5000/index.html";
                });
            } else {
                return response.json().then(errData => { // Capture error details
                    alert(`Error cancelling ticket: ${errData.message || "Failed to cancel reservation."}`);
                    console.error("Error cancelling ticket:", errData);
                });
            }
        })
        .catch((error) => {
            alert(`Error cancelling ticket: ${error.message || "An unexpected error occurred while cancelling."}`);
            console.error("Error cancelling ticket:", error);
        });
    }
}

cancel_ticket_button.addEventListener("click", cancelTicket);

download_ticket_button.addEventListener("click", () => {
    if (fetchedTicketData) {
        // Create a simple PDF content (you might want to use a library like jsPDF for more complex layouts)
        const { reservationId, bus, source, destination, reservationDate, reservationStatus, name, email } = fetchedTicketData;

        const pdfContent = `
            Ticket ID: ${reservationId}
            Name: ${name}
            Email: ${email}
            Bus Name: ${bus.busName}
            Departure Time: ${bus.departureTime} IST
            Source: ${source}
            Destination: ${destination}
            Reservation Date: ${new Date(reservationDate).toLocaleDateString()}
            Status: ${reservationStatus}
        `;

        // Create a Blob with the PDF content (as plain text for simplicity)
        const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });

        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket_${reservationId}.txt`; // Suggest a filename

        // Programmatically click the link to start the download
        document.body.appendChild(a);
        a.click();

        // Clean up the temporary URL and link
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert("Please search for a ticket first to download.");
    }
});