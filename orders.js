import { getOrders, updateOrderStatus } from './database.js';

// DOM elements
const ordersBody = document.getElementById('ordersBody');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const messageDiv = document.getElementById('message');
const noOrdersDiv = document.getElementById('noOrders');

// All orders from the database
let allOrders = [];

// Initialize the page
async function init() {
    try {
        // Get all orders from the database
        allOrders = await getOrders();
        
        // Set up event listeners
        statusFilter.addEventListener('change', filterOrders);
        dateFilter.addEventListener('change', filterOrders);
        
        // Display the orders
        displayOrders(allOrders);
        
        if (allOrders.length > 0) {
            showMessage('Orders loaded successfully', 'success');
        } else {
            showMessage('No orders found in the database', 'info');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Failed to load orders. Please check the console for details.', 'error');
    }
}

// Display orders in the table
function displayOrders(orders) {
    ordersBody.innerHTML = '';
    
    if (orders.length === 0) {
        noOrdersDiv.classList.remove('hidden');
        return;
    }
    
    noOrdersDiv.classList.add('hidden');
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format the date
        const orderDate = order.date || formatDate(new Date(order.created_at?.toDate()));
        
        row.innerHTML = `
            <td>${order.id.substring(0, 8)}...</td>
            <td>${order.customerName}</td>
            <td>${order.phoneNumber}</td>
            <td>${orderDate}</td>
            <td>
                ${order.items.length} items
                <button class="view-details-btn" data-id="${order.id}">View</button>
                <div id="details-${order.id}" class="order-details hidden">
                    ${generateItemsList(order.items)}
                    <div class="delivery-info">
                        <p><strong>Delivery Date:</strong> ${order.deliveryDate || 'Not specified'}</p>
                        <p><strong>Delivery Time:</strong> ${order.deliveryTime || 'Not specified'}</p>
                    </div>
                </div>
            </td>
            <td>₹${order.total}</td>
            <td>
                <span class="status status-${order.status}">${capitalizeFirst(order.status)}</span>
            </td>
            <td class="action-buttons">
                ${getActionButtons(order)}
            </td>
        `;
        
        ordersBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addButtonEventListeners();
}

// Generate HTML for items list
function generateItemsList(items) {
    let html = '<div class="items-list">';
    items.forEach(item => {
        html += `
            <div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.total}</span>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

// Get appropriate action buttons based on order status
function getActionButtons(order) {
    const { id, status } = order;
    
    switch (status) {
        case 'new':
            return `
                <button class="btn btn-success process-btn" data-id="${id}">Process</button>
                <button class="btn btn-danger cancel-btn" data-id="${id}">Cancel</button>
            `;
        case 'processing':
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
    // Process button
    document.querySelectorAll('.process-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            await updateStatus(id, 'processing');
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
            if (confirm('Are you sure you want to cancel this order?')) {
                await updateStatus(id, 'cancelled');
            }
        });
    });
    
    // View details button
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const detailsDiv = document.getElementById(`details-${id}`);
            
            if (detailsDiv.classList.contains('hidden')) {
                detailsDiv.classList.remove('hidden');
                button.textContent = 'Hide';
            } else {
                detailsDiv.classList.add('hidden');
                button.textContent = 'View';
            }
        });
    });
}

// Update the status of an order
async function updateStatus(id, status) {
    try {
        // Show loading state
        showMessage('Updating order status...', 'info');
        
        // Update the status in the database
        const success = await updateOrderStatus(id, status);
        
        if (success) {
            // Update the status in the local array
            const index = allOrders.findIndex(r => r.id === id);
            if (index !== -1) {
                allOrders[index].status = status;
            }
            
            // Re-filter and display the orders
            filterOrders();
            
            // Show success message
            showMessage(`Order ${id} has been marked as ${status}`, 'success');
        } else {
            showMessage('Failed to update order status', 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showMessage('An error occurred while updating the order status', 'error');
    }
}

// Filter orders based on status and date filters
function filterOrders() {
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    
    // Filter by status
    let filteredOrders = allOrders;
    if (statusValue !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.status === statusValue);
    }
    
    // Filter by date
    if (dateValue !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        
        filteredOrders = filteredOrders.filter(o => {
            let orderDate;
            if (o.created_at && typeof o.created_at.toDate === 'function') {
                orderDate = o.created_at.toDate();
            } else {
                // If created_at is not a Firestore timestamp, try to use the date string
                orderDate = o.date ? new Date(o.date) : new Date();
            }
            
            switch (dateValue) {
                case 'today':
                    return isSameDay(orderDate, today);
                case 'yesterday':
                    return isSameDay(orderDate, yesterday);
                case 'thisWeek':
                    return orderDate >= startOfWeek && orderDate < today;
                case 'lastWeek':
                    return orderDate >= startOfLastWeek && orderDate < startOfWeek;
                default:
                    return true;
            }
        });
    }
    
    // Display filtered orders
    displayOrders(filteredOrders);
}

// Format date for display
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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