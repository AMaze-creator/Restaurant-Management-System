import { saveTableReservation } from './database.js';

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

// Reservation form elements
const form = document.querySelector('form');
const customerNameInput = document.getElementById('customer-name');
const phoneNumberInput = document.getElementById('phone-number');
const guestCountSelect = document.getElementById('guest');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const commentTextarea = document.getElementById('comment');
const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');

// Notification elements
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationCloseBtn = document.getElementById('notification-close');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Set up event listeners
    form.addEventListener('submit', handleReservationSubmit);
    notificationCloseBtn.addEventListener('click', closeNotification);
    
    // Add input validation
    customerNameInput.addEventListener('input', () => {
        validateField(customerNameInput, nameError, 'Please enter your name');
    });
    
    phoneNumberInput.addEventListener('input', () => {
        validateField(phoneNumberInput, phoneError, 'Please enter your phone number');
    });
});

// Handle reservation form submission
async function handleReservationSubmit(event) {
    event.preventDefault();
    
    // Validate form fields
    const isNameValid = validateField(customerNameInput, nameError, 'Please enter your name');
    const isPhoneValid = validateField(phoneNumberInput, phoneError, 'Please enter your phone number');
    
    if (!isNameValid || !isPhoneValid) {
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Get form data
        const reservationData = {
            customerName: customerNameInput.value,
            phoneNumber: phoneNumberInput.value,
            guestCount: Number(guestCountSelect.value),
            reservationDate: dateInput.value,
            reservationTime: timeInput.value,
            specialNotes: commentTextarea.value || '',
        };
        
        // Save reservation to Firebase
        const result = await saveTableReservation(reservationData);
        
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Show success notification
            showNotification(`Reservation successful! Your reservation ID is: ${result.id}`, 'success');
            
            // Reset form
            form.reset();
        } else {
            // Show error notification
            showNotification(`Reservation failed: ${result.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error saving reservation:', error);
        showNotification('An error occurred while processing your reservation. Please try again.', 'error');
    }
}

// Validate a form field
function validateField(inputElement, errorElement, errorMessage) {
    if (!inputElement.value.trim()) {
        inputElement.classList.add('error');
        errorElement.textContent = errorMessage;
        return false;
    } else {
        inputElement.classList.remove('error');
        errorElement.textContent = '';
        return true;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        closeNotification();
    }, 10000);
}

// Close notification
function closeNotification() {
    notification.classList.add('hidden');
}

