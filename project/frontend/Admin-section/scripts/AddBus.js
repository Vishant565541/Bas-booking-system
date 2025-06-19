document.addEventListener("DOMContentLoaded", function () {
    let form = document.getElementById("addNewBusForm");
    let baseURL = "http://localhost:5000";

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        addbus();
    });
});

async function addbus() {
    console.log("Form submitted");

    let busName = document.getElementById("busname").value.trim();
    let busNo = document.getElementById("busNumber").value.trim();
    let busType = document.getElementById("bustype").value.trim();
    let routeFrom = document.getElementById("routeFrom").value.trim();
    let routeTo = document.getElementById("routeTo").value.trim();
    let arrivalTime = document.getElementById("arrivalTime").value.trim();
    let departureTime = document.getElementById("departureTime").value.trim();
    let fare = document.getElementById("fare").value.trim();
    let date = document.getElementById("date").value.trim();
    let availableSeats = document.getElementById("availableSeats").value.trim();

    // Input Validation
    if (!busName || !busNo || !routeFrom || !routeTo || !fare || !date || !availableSeats) {
        alert("Please fill in all required fields.");
        return;
    }

   

    let formData = {
        busName: busName,
        busNo: busNo,
        busType: busType,
        routeFrom: routeFrom,
        routeTo: routeTo,
        arrivalTime: arrivalTime,
        departureTime: departureTime,
        fare: parseFloat(fare),
        date: date,
        availableSeats: parseInt(availableSeats),
    };

    console.log("Collected Form Data:", formData);

    try {
        console.log("Making POST request to server...");
        let response = await fetch("http://localhost:5000/api/admin/addbus", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        let data = await response.json();
        console.log("Server Response:", data);

        if (response.ok) {
            alert("Successfully Added!");
            document.getElementById("addNewBusForm").reset();
        } else {
            alert(`Error: ${data.message || "Failed to add bus"}`);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("An error occurred. Please try again.");
    }
}