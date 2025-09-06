document.getElementById("contact-form").addEventListener('submit', () => {
    setTimeout(function () {
        var contactForm = document.getElementById("contact-form-div")
        contactForm.setAttribute("style", "-webkit-animation: fadeOut 1s; animation: fadeOut 1s;  animation-fill-mode: forwards;");
        document.getElementById("contact-form").setAttribute("style", "display:none;");
        contactForm.innerHTML = `<h1>Your message has been sent; Thank you!</h1> `
        contactForm.setAttribute("style", "-webkit-animation: fadeIn 1s; animation: fadeIn 1s;  animation-fill-mode: forwards;");

    }, 500);


})
var Google_Entry_ID_Name="entry.1405737972";
var Google_Entry_ID_Email="entry.1290086262";   
var Google_Entry_ID_Phone="entry.1357912889";    
var Google_Entry_ID_Msg="entry.1964045563";           
var Google_Form_Link="https://docs.google.com/forms/d/e/1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ/formResponse?" 

// Replacing Variables At Top Of This Document

