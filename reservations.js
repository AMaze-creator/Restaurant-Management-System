import { getTableReservations, updateReservationStatus } from './database.js';

// DOM elements
const reservationsBody = document.getElementById('reservationsBody');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const messageDiv = document.getElementById('message');
const noReservationsDiv = document.getElementById('noReservations');

// All reservations from the database
let allReservations = [];

// Initialize the page
async function init() {
    try {
        // Get all reservations from the database
        allReservations = await getTableReservations();
        
        // Set up event listeners
        statusFilter.addEventListener('change', filterReservations);
        dateFilter.addEventListener('change', filterReservations);
        
        // Display the reservations
        displayReservations(allReservations);
        
        if (allReservations.length > 0) {
            showMessage('Reservations loaded successfully', 'success');
        } else {
            showMessage('No reservations found in the database', 'info');
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        showMessage('Failed to load reservations. Please check the console for details.', 'error');
    }
}

// Display reservations in the table
function displayReservations(reservations) {
    reservationsBody.innerHTML = '';
    
    if (reservations.length === 0) {
        noReservationsDiv.classList.remove('hidden');
        return;
    }
    
    noReservationsDiv.classList.add('hidden');
    
    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        
        // Format the date
        const formattedDate = formatDate(reservation.reservationDate);
        
        row.innerHTML = `
            <td>${reservation.id.substring(0, 8)}...</td>
            <td>${reservation.customerName}</td>
            <td>${reservation.phoneNumber}</td>
            <td>${formattedDate}</td>
            <td>${reservation.reservationTime}</td>
            <td>${reservation.guestCount}</td>
            <td>
                <span class="status status-${reservation.status}">${capitalizeFirst(reservation.status)}</span>
            </td>
            <td class="action-buttons">
                ${getActionButtons(reservation)}
            </td>
        `;
        
        reservationsBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addButtonEventListeners();
}

// Get appropriate action buttons based on reservation status
function getActionButtons(reservation) {
    const { id, status } = reservation;
    
    switch (status) {
        case 'pending':
            return `
                <button class="btn btn-success confirm-btn" data-id="${id}">Confirm</button>
                <button class="btn btn-danger cancel-btn" data-id="${id}">Cancel</button>
            `;
        case 'confirmed':
            return `
                <button class="btn btn-success complete-btn" data-id="${id}">Complete</button>
                <button class="btn btn-danger cancel-btn" data-id="${id}">Cancel</button>
            `;
        case 'completed':
            return `
                <span class="btn btn-secondary" disabled>Completed</span>
            `;
        case 'cancelled':
            return `
                <span class="btn btn-secondary" disabled>Cancelled</span>
            `;
        default:
            return '';
    }
}

// Add event listeners to the buttons
function addButtonEventListeners() {
    // Confirm button
    document.querySelectorAll('.confirm-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            await updateStatus(id, 'confirmed');
        });
    });
    
    // Complete button
    document.querySelectorAll('.complete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            await updateStatus(id, 'completed');
        });
    });
    
    // Cancel button
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (confirm('Are you sure you want to cancel this reservation?')) {
                await updateStatus(id, 'cancelled');
            }
        });
    });
}

// Update the status of a reservation
async function updateStatus(id, status) {
    try {
        // Show loading state
        showMessage('Updating reservation status...', 'info');
        
        // Update the status in the database
        const success = await updateReservationStatus(id, status);
        
        if (success) {
            // Update the status in the local array
            const index = allReservations.findIndex(r => r.id === id);
            if (index !== -1) {
                allReservations[index].status = status;
            }
            
            // Re-filter and display the reservations
            filterReservations();
            
            // Show success message
            showMessage(`Reservation ${id} has been ${status}`, 'success');
        } else {
            showMessage('Failed to update reservation status', 'error');
        }
    } catch (error) {
        console.error('Error updating reservation status:', error);
        showMessage('An error occurred while updating the reservation status', 'error');
    }
}

// Filter reservations based on status and date filters
function filterReservations() {
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    
    // Filter by status
    let filteredReservations = allReservations;
    if (statusValue !== 'all') {
        filteredReservations = filteredReservations.filter(r => r.status === statusValue);
    }
    
    // Filter by date
    if (dateValue !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        filteredReservations = filteredReservations.filter(r => {
            const reservationDate = new Date(r.reservationDate);
            
            switch (dateValue) {
                case 'today':
                    return isSameDay(reservationDate, today);
                case 'tomorrow':
                    return isSameDay(reservationDate, tomorrow);
                case 'thisWeek':
                    return reservationDate >= today && reservationDate < nextWeek;
                case 'nextWeek':
                    const weekAfter = new Date(nextWeek);
                    weekAfter.setDate(weekAfter.getDate() + 7);
                    return reservationDate >= nextWeek && reservationDate < weekAfter;
                default:
                    return true;
            }
        });
    }
    
    // Display filtered reservations
    displayReservations(filteredReservations);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show message
function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    // Remove the 'hidden' class to show the message
    messageDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 