import { saveMenuItemsToDatabase, getMenuItemsFromDatabase, updateMenuItemInDatabase, saveOrderToDatabase } from './database.js';

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


// Menu items data
const menuItems = [
    { id: 1, category: "starters", name: "Beguni", price: 20, image: "image/Beguni.jpeg" },
    { id: 2, category: "starters", name: "Mochar Chop", price: 30, image: "image/Mocha.jpeg" },
    { id: 3, category: "starters", name: "Fish Fry", price: 50, image: "image/fish-fry.jpeg" },
    { id: 4, category: "starters", name: "Fish Kabiraji", price: 70, image: "image/fish-kobiraji.jpg" },
    { id: 5, category: "starters", name: "Paneer Tikka", price: 240, image: "image/paneer-tikka.jpeg" },
    { id: 6, category: "main-course", name: "Chicken Biryani", price: 120, image: "image/chiken-biriyani.jpeg" },
    { id: 7, category: "main-course", name: "Non Veg Thali", price: 200, image: "image/non-veg.jpeg" },
    { id: 8, category: "main-course", name: "Veg Thali", price: 150, image: "image/veg.jpeg" },
    { id: 9, category: "main-course", name: "mutton biryani", price: 200, image: "image/motton.jpeg" },
    { id: 10, category: "main-course", name: "khichuri", price: 100, image: "image/khicuri.jpeg" },
    { id: 11, category: "main-course", name: "Basonti polau", price: 130, image: "image/polau.jpeg" },
    { id: 12, category: "main-course", name: "Ghee bhat", price: 70, image: "image/ghee-bhat.jpg" },
    { id: 13, category: "main-course", name: "kosha mangso", price: 180, image: "image/chiken.jpeg" },
    { id: 14, category: "main-course", name: "Shorshe ilish", price: 180, image: "image/ilish.jpeg" },
    { id: 15, category: "main-course", name: "chingri malai curry", price: 180, image: "image/chingri.jpeg" },
    { id: 16, category: "main-course", name: "Shahi paneer", price: 150, image: "image/poneer.jpeg" },
    { id: 17, category: "dessert", name: "Mishti doi", price: 30, image: "image/doi.jpeg" },
    { id: 18, category: "dessert", name: "Rasgulla", price: 8, image: "image/rosgulla.jpeg" },
    { id: 19, category: "dessert", name: "payesh", price: 50, image: "image/payes.jpeg" },
    { id: 20, category: "dessert", name: "cham cham", price: 15, image: "image/chomchom.jpeg" },
];

// Cart items
let cartItems = [];
let orderNumber = generateOrderNumber();

// DOM Elements
const menuGrid = document.getElementById('menu-items');
const orderItems = document.getElementById('order-items');
const searchInput = document.getElementById('search-input');
const selectcatagory = document.getElementById('manu-catagory');
const customerNameInput = document.getElementById('customer-name');
const phoneNumberInput = document.getElementById('phone-number');
const deliveryTimeInput = document.getElementById('deliveryTime');
const deliveryDateInput = document.getElementById('deliveryDate');
const generateInvoiceBtn = document.getElementById('generate-invoice');
const validationMessage = document.getElementById('validation-message');
const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');
const timeError = document.getElementById('time-error');
const dateError = document.getElementById('date-error');

// Initialize the app
async function init() {
    // Save menu items to database on first load
    await saveMenuToDatabase();
    
    // Try to get menu items from database
    const dbMenuItems = await getMenuItemsFromDatabase();
    
    // Use database menu items if available, otherwise use local menu items
    const itemsToDisplay = dbMenuItems.length > 0 ? dbMenuItems : menuItems;
    
    renderMenuItems(itemsToDisplay);
    renderOrderItems();

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    deliveryDateInput.min = today;

    // Add event listeners
    searchInput.addEventListener('input', handleSearch);
    selectcatagory.addEventListener('change', handlecatagory);
    generateInvoiceBtn.addEventListener('click', generateInvoice);

    // Input validation listeners
    customerNameInput.addEventListener('input', () => {
        validateField(customerNameInput, nameError, 'Please enter customer name');
    });

    phoneNumberInput.addEventListener('input', () => {
        validateField(phoneNumberInput, phoneError, 'Please enter phone number');
    });
    
    deliveryDateInput.addEventListener('input', () => {
        validateField(deliveryDateInput, dateError, 'Please select a delivery date');
    });
}

// Save menu items to database if they don't already exist
async function saveMenuToDatabase() {
    try {
        console.log("Checking if menu items need to be saved to database...");
        const existingItems = await getMenuItemsFromDatabase();
        
        if (existingItems.length === 0) {
            console.log("No menu items found in database. Saving...");
            await saveMenuItemsToDatabase(menuItems);
            console.log("Menu items saved to database successfully");
        } else {
            console.log(`${existingItems.length} menu items already exist in database`);
        }
    } catch (error) {
        console.error("Error saving menu items to database:", error);
    }
}

function renderMenuItems(items) {
    menuGrid.innerHTML = '';

    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-item-img">
            <h3 class="menu-item-name">${item.name}</h3>
            <p class="menu-item-price">₹${item.price}</p>
            <button class="add-btn" data-id="${item.id}">
                <i class="fas fa-plus"></i>
            </button> 
        `;
        menuGrid.appendChild(menuItem);

        // Add event listener to the add button
        const addBtn = menuItem.querySelector('.add-btn');
        addBtn.addEventListener('click', () => addToCart(item));
    });
}

//Handle catagory
function handlecatagory(cat) {
    const selectedCategory = cat.target.value;
    console.log("Selected Category:", selectedCategory); // Debugging

    if (selectedCategory === "all") {
        renderMenuItems(menuItems);
        return;
    }

    // Filter menu items by category
    const filteredItems = menuItems.filter(item => item.category === selectedCategory);

    renderMenuItems(filteredItems);
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === '') {
        renderMenuItems(menuItems);
        return;
    }

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
    );

    renderMenuItems(filteredItems);
}
// Add item to cart
function addToCart(item) {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.total = existingItem.price * existingItem.quantity;
    } else {
        cartItems.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            total: item.price
        });
    }

    renderOrderItems();
    invoicesection();
}

// Remove item from cart
function removeFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    renderOrderItems();
    invoicesection();
}

// Render order items
function renderOrderItems() {
    if (cartItems.length === 0) {
        orderItems.innerHTML = '<div class="empty-order">No items added to order yet</div>';
        return;
    }

    orderItems.innerHTML = '';

    cartItems.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-price">₹${item.price}</div>
            <div class="order-item-qty">${item.quantity}</div>
            <div class="order-item-total">₹${item.total}</div>
            <button class="delete-btn" data-id="${item.id}">
                <i class="fa fa-trash-o delete"></i>
            </button>
        `;

        orderItems.appendChild(orderItem);

        // Add event listener to the delete button
        const deleteBtn = orderItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => removeFromCart(item.id));
    });
    invoicesection();
}
function invoicesection() {
    const invoiceSection = document.getElementById("invoice-section");
    const totalPriceElement = document.getElementById("total-price");

    // Example: calculate total from a cart array
    let total = 0;
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        // Show section & update total
        invoiceSection.style.display = "block";
        totalPriceElement.textContent = total;
    } else {
        // Hide section if cart is empty
        invoiceSection.style.display = "none";
    }
}

function validateRequiredFields() {
    let isValid = true;

    // Reset error messages
    resetValidationMessages();

    // Validate customer name
    if (!customerNameInput.value.trim()) {
        showError(customerNameInput, nameError, 'Please enter customer name');
        isValid = false;
    }

    // Validate phone number
    if (!phoneNumberInput.value.trim()) {
        showError(phoneNumberInput, phoneError, 'Please enter phone number');
        isValid = false;
    }

    // Validate delivery time
    if (!deliveryTimeInput.value) {
        deliveryTimeInput.classList.add('error');
        timeError.textContent = 'Please select delivery time';
        isValid = false;
    }

    // Validate delivery date
    if (!deliveryDateInput.value) {
        deliveryDateInput.classList.add('error');
        dateError.textContent = 'Please select delivery date';
        isValid = false;
    }

    return isValid;
}
// Show error for a field
function showError(inputElement, errorElement, message) {
    inputElement.classList.add('error');
    errorElement.textContent = message;
}
// Validate a single field
function validateField(inputElement, errorElement, errorMessage) {
    if (!inputElement.value.trim()) {
        showError(inputElement, errorElement, errorMessage);
        return false;
    } else {
        inputElement.classList.remove('error');
        errorElement.textContent = '';
        return true;
    }
}

// Reset validation messages
function resetValidationMessages() {
    // Reset input fields
    customerNameInput.classList.remove('error');
    phoneNumberInput.classList.remove('error');
    deliveryTimeInput.classList.remove('error');
    deliveryDateInput.classList.remove('error');


    // Reset error messages
    nameError.textContent = '';
    phoneError.textContent = '';
    timeError.textContent = '';
    dateError.textContent = '';

    // Hide validation message
    validationMessage.style.display = 'none';
    validationMessage.classList.remove('error', 'success');
}

function showValidationMessage(message, type) {
    validationMessage.textContent = message;
    validationMessage.classList.add(type);
    validationMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        validationMessage.style.display = 'none';
        validationMessage.classList.remove(type);
    }, 5000);
}

// Generate invoice
async function generateInvoice() {
    // Validate required fields
    if (!validateRequiredFields()) {
        return;
    }

    // Save order data to localStorage
    const orderData = {
        customerName: customerNameInput.value,
        phoneNumber: phoneNumberInput.value,
        deliveryTime: deliveryTimeInput.value,
        deliveryDate: deliveryDateInput.value,
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.total, 0),
        orderNumber: orderNumber,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // Save order to database
    try {
        showValidationMessage('Processing your order...', 'success');
        const result = await saveOrderToDatabase(orderData);
        
        if (result.success) {
            // Update the orderNumber with the database ID
            orderData.databaseOrderId = result.id;
            localStorage.setItem('currentOrder', JSON.stringify(orderData));
            showValidationMessage('Order saved to database successfully!', 'success');
            
            // Open invoice in new window
            window.open('invoice.html', '_blank');
        } else {
            showValidationMessage('Error saving order: ' + result.message, 'error');
            // Still open invoice as we saved to localStorage
            window.open('invoice.html', '_blank');
        }
    } catch (error) {
        showValidationMessage('Error saving order: ' + error.message, 'error');
        // Still open invoice as we saved to localStorage
        window.open('invoice.html', '_blank');
    }
}

// Generate random order number
function generateOrderNumber() {
    return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);





