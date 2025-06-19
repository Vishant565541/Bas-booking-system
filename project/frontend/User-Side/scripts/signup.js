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

function add_row() {
    let fname = document.getElementById("firstname").value.trim();
    let lname = document.getElementById("lastname").value.trim();
    let email = document.getElementById("email").value.trim();
    let mobile = document.getElementById("mobile").value.trim();
    let password = document.getElementById("password").value.trim();

    // Validation
    if (!fname) {
        showToast("Please enter your first name.");
        return false;
    }
    if (!/^[a-zA-Z]+$/.test(fname)) {
        showToast("First name should only contain letters.");
        return false;
    }
    if (!lname) {
        showToast("Please enter your last name.");
        return false;
    }
    if (!/^[a-zA-Z]+$/.test(lname)) {
        showToast("Last name should only contain letters.");
        return false;
    }

    if (!email) {
        showToast("Please enter your email.");
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.");
        return false;
    }

    if (!mobile) {
        showToast("Please enter your mobile number.");
        return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
        showToast("Mobile number must be 10 digits.");
        return false;
    }

    if (!password) {
        showToast("Please enter your password.");
        return false;
    }

    if (!document.getElementById("agree").checked) {
        showToast("Please check Accepting all terms & conditions!!");
        return false;
    }

    let obj = {
        email: email,
        password: password,
        fname: fname,
        lname: lname,
        phone: mobile,
    };

    addUser(obj);
}

function addUser(obj) {
    let url = "http://localhost:5000/api/users/signup";

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.user || !data.user._id) {
                showToast(data.message || "Invalid Data Provided");
                console.error("Signup Error:", data);
            } else {
                showToast("User Signup Successful!");
                console.log("Signup Success:", data);
            }
        })
        .catch((error) => {
            console.error("Error posting data:", error);
            showToast("Server Error. Please try again.");
        });
}