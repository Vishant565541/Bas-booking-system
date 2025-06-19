const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
const navbar = document.querySelector('.navbar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menu.classList.toggle('open');
});
  
// Function to toggle the sticky class on the navbar
//This function toggles the sticky class on the navbar element when the user scrolls past the top of the page
function toggleStickyNavbar() {
    //Check if the user has scrolled past the top of the page
    if (window.scrollY > navbar.offsetTop) {
        //Add the sticky class to the navbar element
    navbar.classList.add('sticky');
    } else {
        //Remove the sticky class from the navbar element
    navbar.classList.remove('sticky');
    }
}

// Listen for scroll events and apply the sticky class accordingly
window.addEventListener('scroll', toggleStickyNavbar);


