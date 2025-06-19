const moving_bus = document.querySelector("#moving-bus"); // Still not used in this snippet
let username = JSON.parse(localStorage.getItem("username")) || null;
let uuid = JSON.parse(localStorage.getItem("uuid")) || null; // Retrieve uuid
console.log("UUID on page load:", uuid);

const customAlertContainer = document.getElementById("customAlert");
const customAlertMessage = document.getElementById("customAlertMessage");

function openCustomAlert(message) {
    customAlertMessage.textContent = message;
    customAlertContainer.style.display = "block";
    setTimeout(() => {
        closeCustomAlert();
        window.location.href = "http://127.0.0.1:5000/index.html";
    }, 3000);
}

function closeCustomAlert() {
    customAlertContainer.style.display = "none";
}

window.addEventListener("scroll", toggleStickyNavbar); // Assuming this function is defined elsewhere

const amenitiesData = [
    { icon: "fa-wifi", name: "Wifi" },
    { icon: "fa-couch", name: "Pillow" },
    { icon: "fa-bottle-water", name: "Water Bottle" },
    { icon: "fa-lightbulb", name: "Reading Lights" },
    { icon: "fa-plug", name: "Charging Point" },
    { icon: "fa-tv", name: "Central Television" },
    { icon: "fa-headset", name: "24x7 Support" },
];

function createAmenityElement(icon, name) {
    const amenityDiv = document.createElement("div");
    amenityDiv.classList.add("box");

    const amenityContent = document.createElement("div");
    amenityContent.classList.add("amenity");

    const iconElement = document.createElement("i");
    iconElement.classList.add("fas", icon);
    amenityContent.appendChild(iconElement);

    const nameElement = document.createElement("h2");
    nameElement.textContent = name;
    amenityContent.appendChild(nameElement);

    amenityDiv.appendChild(amenityContent);

    return amenityDiv;
}

function displayAmenities(startIndex) {
    const slider = document.querySelector(".slider");
    slider.innerHTML = "";

    for (let i = startIndex; i < startIndex + 6; i++) {
        const index = i % amenitiesData.length;
        const amenity = createAmenityElement(
            amenitiesData[index].icon,
            amenitiesData[index].name
        );
        slider.appendChild(amenity);
    }
}

let currentSlide = 0;
const totalBoxes = amenitiesData.length;
const sliderContainer = document.querySelector(".slider-container");

function slideToNext() {
    currentSlide = (currentSlide + 6) % totalBoxes;
    displayAmenities(currentSlide);
}

displayAmenities(currentSlide);
setInterval(slideToNext, 3000);

let account = document.getElementById("account");
console.log("Account element:", account);

// let profileImg = document.getElementById("profileImg"); // Assuming this might be for a profile picture
let logout = document.getElementById("logout");
console.log("Initial UUID:", uuid);

function updateAccountView() {
    if (!uuid) {
        console.log("User not logged in.");
        account.innerText = "LogIn";
        account.style.cssText = "border-radius: 5px; padding: 4px; background-color: #0E9E4D; color: white;";
        account.href = "login.html";
        // if (profileImg) profileImg.style.display = "none";
        if (logout) logout.style.display = "none";
    } else {
        console.log("User logged in as:", username);
        account.innerText = username ? username.split(" ")[0].toUpperCase() : "Account";
        account.href = "#"; // Prevent default link behavior when logged in
        account.style.cssText = "display: block;"; // Ensure it's visible
        // if (profileImg) profileImg.style.display = "block";
        if (logout) logout.style.display = "block";
    }
}

updateAccountView();

async function handleAccountClick(event) {
    event.preventDefault();
    console.log("Account link clicked.");
    if (uuid) {
        let accountDiv = document.getElementById("accountDiv");
        if (accountDiv) {
            accountDiv.style.display = "block";
            fetchUserProfile(uuid);
        } else {
            console.error("Account div not found in the HTML.");
            openCustomAlert("Error: Could not display profile.");
        }
    } else {
        window.location.href = "login.html";
    }
};
console.log("Account link event listener added.",uuid);

async function fetchUserProfile() {
    try {
        alert("Fetching user profile");
        const storedToken = localStorage.getItem('authToken');
         // Retrieve the token from local storage
        console.log("Stored token:", storedToken);
        if (!storedToken) {
            console.error("No token found. User might not be logged in.");
            openCustomAlert("Unauthorized: No token found. Please log in.");
            // Optionally redirect the user to the login page
            return;
        }

        const response = await fetch('http://localhost:5000/api/users/profile', { // Use the correct profile endpoint
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            let errorMessage = `Failed to fetch profile. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage += ` - ${errorData.message}`;
                }
            } catch (parseError) {
                console.error("Error parsing error response:", parseError);
            }
            openCustomAlert(errorMessage);
            return;
        }

        const userData = await response.json();
        console.log("User profile data:", userData);
        displayUserProfile(userData);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        openCustomAlert("Failed to fetch user profile. Please try again.");
    }
}

function displayUserProfile(userData) {
    console.log("Displaying user profile.");
    let accountDiv = document.getElementById("accountDiv");
    if (accountDiv) {
        accountDiv.innerHTML = `
            <div class="profile-container">
                <h3>Profile</h3>
                <p><strong>First Name:</strong> ${userData.fname || "N/A"}</p>
                <p><strong>Last Name:</strong> ${userData.lname || "N/A"}</p>
                <p><strong>Email:</strong> ${userData.email || "N/A"}</p>
                <p><strong>Mobile No:</strong> ${userData.phone || "N/A"}</p>
                <button id="closeProfile">Close</button>
            </div>
        `;

        const closeProfileButton = document.getElementById("closeProfile");
        if (closeProfileButton) {
            closeProfileButton.addEventListener("click", function () {
                accountDiv.style.display = "none";
            });
        } else {
            console.error("Close profile button not found.");
        }

        // Apply styles dynamically (or you can add these classes to your CSS file)
        accountDiv.style.display = "flex";
        accountDiv.style.justifyContent = "center";
        accountDiv.style.alignItems = "center";
        accountDiv.style.position = "fixed";
        accountDiv.style.top = "0";
        accountDiv.style.left = "0";
        accountDiv.style.width = "100%";
        accountDiv.style.height = "100%";
        accountDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; /* Semi-transparent background */
        accountDiv.style.zIndex = "1000"; /* Ensure it's on top */

        const profileContainer = accountDiv.querySelector(".profile-container");
        if (profileContainer) {
            profileContainer.style.background = "rgba(255, 255, 255, 0.2)"; /* Glassmorphism background */
            profileContainer.style.borderRadius = "10px";
            profileContainer.style.padding = "40px";
            profileContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            profileContainer.style.backdropFilter = "blur(10px)"; /* Glassmorphism blur */
            profileContainer.style.border = "1px solid rgba(255, 255, 255, 0.3)";
            profileContainer.style.textAlign = "center";
            profileContainer.style.color = "#333"; /* Text color */
            profileContainer.style.fontSize = "1.1em";
        }

        const h3 = accountDiv.querySelector("h3");
        if (h3) {
            h3.style.color = "#2c3e50";
            h3.style.marginBottom = "20px";
            h3.style.fontSize = "2em";
        }

        const p = accountDiv.querySelectorAll("p");
        p.forEach(item => {
            item.style.marginBottom = "10px";
        });

        const strong = accountDiv.querySelectorAll("strong");
        strong.forEach(item => {
            item.style.fontWeight = "bold";
            item.style.color = "#555";
        });

        if (closeProfileButton) {
            closeProfileButton.style.padding = "10px 20px";
            closeProfileButton.style.backgroundColor = "#e74c3c"; /* Red button */
            closeProfileButton.style.color = "white";
            closeProfileButton.style.border = "none";
            closeProfileButton.style.borderRadius = "5px";
            closeProfileButton.style.cursor = "pointer";
            closeProfileButton.style.fontSize = "1em";
            closeProfileButton.style.marginTop = "20px";
            closeProfileButton.addEventListener("mouseover", function() {
                this.style.backgroundColor = "#c0392b";
            });
            closeProfileButton.addEventListener("mouseout", function() {
                this.style.backgroundColor = "#e74c3c";
            });
        }

    } else {
        console.error("Account div not found while displaying profile.");
        openCustomAlert("Error: Could not display profile.");
    }
}
async function logoutUser(currentUuid) {
    console.log("Initiating logout for UUID:", currentUuid);
    try {
        const response = await fetch('http://localhost:5000/api/users/logout', { // Replace with your backend logout endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uuid: currentUuid }), // Send the UUID to the backend
        });

        if (response.ok) {
            // Logout successful on the backend
            localStorage.removeItem('uuid'); // Remove the UUID from localStorage
            localStorage.removeItem('username'); // remove username
            console.log("Logout successful");
            openCustomAlert("Logout successful. Redirecting...");
            // window.location.href = 'index.html'; // Redirect handled by openCustomAlert
        } else {
            // Logout failed on the backend
            const errorData = await response.json();
            console.error('Logout failed:', errorData.message);
            openCustomAlert('Logout failed: ' + (errorData.message || 'An error occurred.')); // More user-friendly message
        }
    } catch (error) {
        console.error('Network error during logout:', error);
        openCustomAlert('Network error during logout. Please try again.');
    }
}

async function handleLogout(event) {
    event.preventDefault(); // Prevent the default anchor behavior
    console.log("Logout link clicked.");
    if (uuid) {
        await logoutUser(uuid);
    } else {
        console.log('No UUID found. User might not be logged in.');
        window.location.href = "login.html";
    }
}

// Add event listeners
if (account) {
    account.addEventListener("click", handleAccountClick);
} else {
    console.error("Account element not found. Ensure it has the ID 'account'.");
}

if (logout) {
    logout.addEventListener("click", handleLogout);
} else {
    console.error("Logout element not found. Ensure it has the ID 'logout'.");
}