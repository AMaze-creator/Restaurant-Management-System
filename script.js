import { saveEmailToDatabase } from './database.js';

const hamburger = document.querySelector('.hambarg');
const menu = document.querySelector('.menu');
const closeBtn = document.getElementById('closebtn');

// ✅ 1. Show menu on hamburger click
hamburger.addEventListener('click', () => {
    menu.classList.add('active');            
    closeBtn.classList.add('active'); 
    hamburger.classList.add('hide'); 
            
});

// ✅ 2. Hide menu on close button click
closeBtn.addEventListener('click', () => {
    menu.classList.remove('active');        
    closeBtn.classList.remove('active');    
    hamburger.classList.remove('hide');
});

// ✅ 3. Hide menu if user clicks outside of menu or icons
document.addEventListener('click', (event) => {
    const clickedOutside =
        !menu.contains(event.target) &&
        !hamburger.contains(event.target) &&
        event.target !== closeBtn;

    if (clickedOutside) {
        menu.classList.remove('active');
        closeBtn.classList.remove('active');
        hamburger.classList.remove('hide');
    }
});

// Handle newsletter subscription form
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    console.log('DOM loaded, setting up newsletter form handler');
    const newsletterForm = document.getElementById("newsletterForm");
    
    if (newsletterForm) {
        console.log('Newsletter form found, adding event listener');
        newsletterForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            
            const emailInput = document.getElementById("newsletterEmail");
            if (!emailInput) {
                console.error('Email input not found!');
                return;
            }
            
            const email = emailInput.value;
            console.log('Email entered:', email);
            
            if (!email) {
                alert("Please enter your email before subscribing.");
                return;
            }
            
            try {
                console.log('Attempting to save email to database...');
                const success = await saveEmailToDatabase(email);
                console.log('Save attempt result:', success);
                
                if (success) {
                    alert("Thank you for subscribing with: " + email);
                    emailInput.value = "";
                } else {
                    alert("Something went wrong with your subscription. Please try again.");
                }
            } catch (error) {
                console.error("Error during subscription: ", error);
                alert("An error occurred during subscription. Please try again later.");
            }
        });
    } else {
        console.error('Newsletter form not found in the DOM!');
    }
});




  