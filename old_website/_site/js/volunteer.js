// Google Form entry IDs
const Google_Entry_IDs = {
    name: "entry.732137333",
    email: "entry.1986461492",
    phone: "entry.1784783803",
    message: "entry.587179085"
};

// Google Form link
const Google_Form_Link = "https://docs.google.com/forms/d/e/1FAIpQLSccawIjPtn5c1B09JE5BtXDwTHpjP0xwB6VgDg5ErG61-XqNA/viewform?usp=sf_link";

// Handle form submission
document.getElementById("volunteer-form").addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(e.target);
    const entryData = {
        [Google_Entry_IDs.name]: formData.get('name'),
        [Google_Entry_IDs.email]: formData.get('email'),
        [Google_Entry_IDs.phone]: formData.get('phone'),
        [Google_Entry_IDs.message]: formData.get('message')
    };

    // Create a URL-encoded string for the form data
    const queryString = new URLSearchParams(entryData).toString();

    // Submit data to the Google Form
    fetch(`${Google_Form_Link}?${queryString}`, {
        method: 'POST',
        mode: 'no-cors',
    })
    .then(() => {
        setTimeout(() => {
            const contactFormDiv = document.getElementById("volunteer-form-div");
            contactFormDiv.setAttribute("style", "animation: fadeOut 1s forwards;");
            document.getElementById("volunteer-form").style.display = "none";
            contactFormDiv.innerHTML = `<h1>Thank you for your Time!</h1>`;
            contactFormDiv.setAttribute("style", "animation: fadeIn 1s forwards;");
        }, 500);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
