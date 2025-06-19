// frontend/user_admin.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded");
    getUserData();
    setupLogout();
  });
  
  let Tbody = document.getElementById("tbody");
  console.log(Tbody);
  
  // let uuid = JSON.parse(localStorage.getItem("uuid")) || "";
  let baseURL = "http://localhost:5000/api/admin";
  
  function getCard(_id, Fname, Lname, Phone, Email) {
    console.log("inside getcard");
    console.log(_id, Fname, Lname, Phone, Email);
    return `
      <tr id="ID${_id}">
        <td>${_id}</td>
        <td><input type="text" id="Fname" value="${Fname}" disabled style="width: 120px; padding: 5px;"></td>
        <td><input type="text" id="Lname" value="${Lname}" disabled style="width: 120px; padding: 5px;"></td>
        <td><input type="text" id="Phone" value="${Phone}" disabled style="width: 120px; padding: 5px;"></td>
        <td><input type="text" id="Email" value="${Email}" disabled style="width: 200px; padding: 5px;"></td>
       
        <td class="edit" data-id="${_id}" style="cursor: pointer; color: blue; padding: 8px;">Edit</td>
        <td class="delete" data-id="${_id}" style="cursor: pointer; color: red; padding: 8px;">Delete</td>
      </tr>
    `;
  }
  
  function showUserData(data) {
    console.log(data);
    console.log("inside showuserdata");
    Tbody.innerHTML = "";
    if (!data || data.length === 0) {
      Tbody.innerHTML = "<tr><td colspan='7' style='text-align: center; padding: 10px;'>No users found.</td></tr>";
      return;
    }
  
    console.log("after if ");
    let htmlData = data.map((el) => getCard(el._id, el.fname, el.lname, el.phone, el.email));
  
    Tbody.innerHTML = htmlData.join(""); // Use join("") for efficiency
    console.log(el._id);
  
    setupEventListeners();
  }
  
  function getUserData() {
    console.log("Fetching users...");
    fetch(`http://localhost:5000/api/users/viewall`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Users fetched:", data);
        showUserData(data);
      })
      ;
  }
  
  function setupEventListeners() {
    console.log("inside setupevent listener");
    let deleteButtons = document.getElementsByClassName("delete");
  
    for (let deleteButton of deleteButtons) {
      deleteButton.addEventListener("click", (e) => {
        let userId = e.target.dataset.id;
        deleteUser(userId);
      });
    }
  }
  
  function deleteUser(userId) {
    fetch(`${baseURL}/delete/${userId}?key=${uuid}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            alert(errorData.message);
          });
        }
        getUserData();
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please check the console.");
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
                localStorage.removeItem("uuid");
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
  