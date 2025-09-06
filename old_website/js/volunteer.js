document.getElementById("volunteer-form").addEventListener('submit', (e) => {
    setTimeout(function () {
        var contactForm = document.getElementById("volunteer-form-div")
        contactForm.setAttribute("style", "-webkit-animation: fadeOut 1s; animation: fadeOut 1s;  animation-fill-mode: forwards;");
        document.getElementById("volunteer-form").setAttribute("style", "display:none;");
        contactForm.innerHTML = `<h1>Thank you for your Time!</h1> `
        contactForm.setAttribute("style", "-webkit-animation: fadeIn 1s; animation: fadeIn 1s;  animation-fill-mode: forwards;");

    }, 500);


})
var Google_Entry_ID_Name="entry.732137333";
var Google_Entry_ID_Email="entry.1986461492";   
var Google_Entry_ID_Phone="entry.1784783803";    
var Google_Entry_ID_Msg="entry.587179085";           
//var Google_Form_Link="https://forms.gle/6FrVGCLosfq7XfWn7" 
var Google_Form_Link="https://docs.google.com/forms/d/e/1FAIpQLSccawIjPtn5c1B09JE5BtXDwTHpjP0xwB6VgDg5ErG61-XqNA/viewform?usp=sf_link"
// Replacing Variables At Top Of This Document

