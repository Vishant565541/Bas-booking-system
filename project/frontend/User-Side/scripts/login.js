let currUserID = JSON.parse(localStorage.getItem('uuid'));
console.log(currUserID);

if (currUserID === undefined) {
    currUserID = null;
}

// Function to show the custom toast notification
function showToast(message) {
    const toastContainer = document.getElementById("customToastContainer");
    const toast = document.createElement("div");
    toast.className = "custom-toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto-hide the toast after 3 seconds (adjust as needed)
    setTimeout(function () {
        toastContainer.removeChild(toast);
    }, 3000);
}

function sign_in() {
    let password = document.getElementById("password").value.trim();
    let email = document.getElementById("email").value.trim();

    console.log(password, email)

    // Validation
    if (!email) {
        showToast("Please enter your email.");
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.");
        return false;
    }

    if (!password) {
        showToast("Please enter your password.");
        return false;
    }

    // You can add more specific password validation rules here if needed

    let signInObj = {
        email: email,
        password: password,
    };

    if (signInObj.email === "a@gmail.com" && signInObj.password === "123456") {
        loginAdmin();
    } else {
        loginUser(signInObj);
    }
}

async function loginUser(obj) {
    let url = "http://localhost:5000/api/users/login";
    console.log(url);
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj),
    })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
            if (result.status === 200 || result.status === 201) {
                showToast("✅ User SignIn Successful!");
                localStorage.setItem("uuid", JSON.stringify(result.body.uuid)); // Store UUID
                const token = result.body.token; // Get the token from the response
                localStorage.setItem('authToken', token); // Store the token
                const uuid = JSON.parse(localStorage.getItem("uuid")); // Retrieve the stored UUID
                const storedToken = localStorage.getItem('authToken'); // Retrieve the stored token

                console.log("Token stored:", token);
                console.log("UUID stored:", uuid);
                console.log("Retrieved token:", storedToken);
                console.log("Login Successful", result.body.userId);
                alert("Login Successful");
                window.location.href = "index.html"; // Redirect to home page.
            } else if (result.status === 400) {
                showToast("⚠️ Bad Request: " + result.body.message);
            } else {
                showToast("❌ Error: " + result.body.message);
            }
        })
        .catch(error => {
            showToast("Network Error. Please try again.");
            console.error('Error posting data:', error);
        });
}
async function loginAdmin() {
    console.log("Inside admin");

    let url = "http://localhost:5000/admin";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            console.log("Admin Login Successful!!");
        }
        const data = await response.json();
        console.log("Fetched Data:", data);

        if (!data.userId) {
            showToast(data.message);
        } else {
            showToast("Admin Login Successful!!");
            showToast("Welcome Admin!!");

            localStorage.setItem("uuid", JSON.stringify(data.uuid));

            window.location.href = "../frontend/Admin-section/Admin_Home.html";
        }
    } catch (error) {
        showToast("Network Error. Please try again.");
        console.error("Error fetching data:", error);
    }
}