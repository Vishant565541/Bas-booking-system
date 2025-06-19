// frontend/script.js
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded");
    getProduct(); // Fetch data when the DOM is ready
    setupLogout(); // Setup logout functionality
});

let Tbody = document.getElementById("Tbody");
let uuid = JSON.parse(localStorage.getItem("uuid")) || "";
let baseURL = "http://localhost:5000/api/admin";

function getProduct() {
    console.log("Fetching buses...");
    fetch(`http://localhost:5000/api/admin/viewAllBus`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Buses fetched:", data);
            showData(data);
        })
      
}

function showData(data) {
    
    Tbody.innerHTML = ""; // Clear existing table content
    if (!data || data.length === 0) {
        Tbody.innerHTML = "<tr><td colspan='11'>No buses found.</td></tr>";
        return;
    }

    let htmlData = data.map((el) => getCard(el._id, el.busName, el.busNo, el.busType, el.routeFrom, el.routeTo, el.arrivalTime, el.departureTime, el.date, el.availableSeats));
    Tbody.innerHTML = htmlData.join(""); // Use join("") for efficiency
    console.log(el._id)
    setupEventListeners(); // Attach event listeners after data is rendered
}

function getCard(_id, BusName,BusNo, BusType, RouteFrom, RouteTo, ArrivalTime, DepartureTime, Date, AvailableSeats) {
    // let imgURL = _id % 2 === 0 ? "https://img.etimg.com/thumb/width-1200,height-900,imgsize-216810,resizemode-75,msid-94221038/news/bengaluru-news/bengalureans-can-soon-enjoy-double-decker-bus-rides-in-new-e-avatar.jpg" : "https://assets.volvo.com/is/image/VolvoInformationTechnologyAB/1860x1050-volvo-9700-CGI1?qlt=82&wid=1024&ts=1656931444230&dpr=off&fit=constrain";

    return `
        <tr id="ID${_id}">
            <td>${_id}</td>
            <td><input type="text" id="BusName" value="${BusName}" disabled></td>
            <td><input type="text" id="BusNo" value="${BusNo}" disabled></td>
            <td><input type="text" id="BusType" value="${BusType}" disabled></td>
            <td><input type="text" id="RouteFrom" value="${RouteFrom}" disabled></td>
            <td><input type="text" id="RouteTo" value="${RouteTo}" disabled></td>
            <td><input type="text" id="ArrivalTime" value="${ArrivalTime}" disabled></td>
            <td><input type="text" id="DepartureTime" value="${DepartureTime}" disabled></td>
            <td><input type="text" id="dates" value="${Date}" disabled></td>
            <td><input type="text" id="AvailableSeats" value="${AvailableSeats}" disabled></td>
           
            <td class="edit" data-id="${_id}">Edit</td>
            <td class="delete" data-id="${_id}">Delete</td>
        </tr>
    `;
}

function setupEventListeners() {
    console.log("inside setup ")
    let editButtons = document.getElementsByClassName("edit");
    let deleteButtons = document.getElementsByClassName("delete");

    for (let editButton of editButtons) {
        editButton.addEventListener("click", (e) => {
            let rowId = e.target.dataset._id; // Assuming your edit button has data-busno attribute
            console.log("Edit button clicked, rowid:", rowId);
            toggleBilling(rowId, e.target); // Pass busNo to toggleBilling
        });
    }
    

    for (let deleteButton of deleteButtons) {
        deleteButton.addEventListener("click", (e) => {
            let id = e.target.dataset.id;
            console.log("Delete button clicked, id:", id);
            deleteProduct(id);
        });
    }
}

function toggleBilling(rowId, element) {
    const billingItems = document.querySelectorAll(`#ID${rowId} input[type="text"]`);
    let obj = {};

    billingItems.forEach((item) => {
        item.disabled = !item.disabled;
        let el = item.getAttribute("id");
        if (!item.disabled) {
            element.innerText = "Save";
            item.style.border = "1px solid black";
            item.style.width = "100%";
        } else {
            obj[el] = item.value;
            element.innerText = "Edit";
            item.style.border = "none";
            item.style.width = "100%";
        }
    });

    if (Object.keys(obj).length !== 0) {
        updateData(obj, rowId);
    }
}

function updateData(obj, id) {
    obj.id = id;
    fetch(`http://localhost:5000/api/admin/updateBus/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
    })
    .then(() => {
        getProduct();
    })
    .catch((error) => {
        console.error("Error updating data:", error);
        alert("Failed to update bus data. Please check the console.");
    });
}

function deleteProduct(id) {
    fetch(`http://localhost:5000/api/admin/deleteBus/${id}?key=${uuid}`, {
        method: "DELETE",
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then(errorData => {
                alert(errorData.message);
            });
        }
        getProduct();
    })
    .catch((error) => {
        console.error("Error deleting data:", error);
        alert("Failed to delete bus. Please check the console.");
    });
}

function setupLogout() {
    let logoutLink = document.getElementById("logout");
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        Swal.fire({
            title: "Logout Confirmation",
            text: "Are you sure you want to logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Logged Out!",
                    text: "You have been successfully logged out.",
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                }).then(() => {
                    fetch(`${baseURL}/logout?key=${uuid}`, {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                        },
                    })
                    .then(() => {
                        window.location.href = "login.html";
                    })
                    .catch((error) => {
                        console.error("Logout error:", error);
                        alert("Logout failed. Please check the console.");
                    });
                });
            }
        });
    });
}