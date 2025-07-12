import { getMenuItemsFromDatabase, saveMenuItemsToDatabase, updateMenuItemInDatabase, deleteMenuItemFromDatabase, addMenuItemToDatabase } from './database.js';

// Initialize variables
let menuItems = [];
let nextId = 1;

// DOM elements
const menuItemsBody = document.getElementById('menuItemsBody');
const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const modalTitle = document.getElementById('modalTitle');
const itemForm = document.getElementById('itemForm');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const messageDiv = document.getElementById('message');

// Form fields
const itemId = document.getElementById('itemId');
const itemName = document.getElementById('itemName');
const itemCategory = document.getElementById('itemCategory');
const itemPrice = document.getElementById('itemPrice');
const itemImage = document.getElementById('itemImage');

// Initialize the admin page
async function init() {
    try {
        // Get menu items from the database
        const dbMenuItems = await getMenuItemsFromDatabase();
        
        if (dbMenuItems.length > 0) {
            menuItems = dbMenuItems;
            
            // Find the highest ID to determine the next ID to use
            nextId = Math.max(...menuItems.map(item => item.id)) + 1;
        }
        
        // Render menu items
        renderMenuItems();
        
        // Set up event listeners
        setupEventListeners();
        
        showMessage('Menu items loaded successfully', 'success');
    } catch (error) {
        console.error('Error initializing admin page:', error);
        showMessage('Failed to load menu items. Please check the console for details.', 'error');
    }
}

// Render menu items in the table
function renderMenuItems() {
    menuItemsBody.innerHTML = '';
    
    menuItems.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${formatCategory(item.category)}</td>
            <td>₹${item.price}</td>
            <td>
                <img src="${item.image}" alt="${item.name}" width="50" height="50" 
                     onerror="this.onerror=null; this.src='image/placeholder.jpg';" />
            </td>
            <td class="action-buttons">
                <button class="btn btn-primary edit-btn" data-id="${item.id}">Edit</button>
                <button class="btn btn-danger delete-btn" data-id="${item.id}">Delete</button>
            </td>
        `;
        
        menuItemsBody.appendChild(row);
    });
    
    // Add event listeners to the buttons
    addButtonEventListeners();
}

// Format category for display
function formatCategory(category) {
    if (category === 'main-course') return 'Main Course';
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Set up event listeners
function setupEventListeners() {
    // Open modal to add new item
    addItemBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Menu Item';
        resetForm();
        openModal();
    });
    
    // Close modal
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the content
    window.addEventListener('click', event => {
        if (event.target === itemModal) {
            closeModal();
        }
    });
    
    // Form submission
    itemForm.addEventListener('submit', handleFormSubmit);
}

// Add event listeners to the edit and delete buttons
function addButtonEventListeners() {
    // Edit button
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.dataset.id);
            editItem(id);
        });
    });
    
    // Delete button
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.dataset.id);
            if (confirm('Are you sure you want to delete this item?')) {
                deleteItem(id);
            }
        });
    });
}

// Open the modal
function openModal() {
    itemModal.style.display = 'block';
}

// Close the modal
function closeModal() {
    itemModal.style.display = 'none';
    resetForm();
}

// Reset the form
function resetForm() {
    itemId.value = '';
    itemForm.reset();
}

// Edit an item
function editItem(id) {
    const item = menuItems.find(item => item.id === id);
    
    if (item) {
        modalTitle.textContent = 'Edit Menu Item';
        
        itemId.value = item.id;
        itemName.value = item.name;
        itemCategory.value = item.category;
        itemPrice.value = item.price;
        itemImage.value = item.image;
        
        openModal();
    }
}

// Delete an item
async function deleteItem(id) {
    try {
        // Remove from the database using our function
        const success = await deleteMenuItemFromDatabase(id);
        
        if (success) {
            // Remove from local array
            menuItems = menuItems.filter(item => item.id !== id);
            
            // Re-render the table
            renderMenuItems();
            
            showMessage('Item deleted successfully', 'success');
        } else {
            showMessage('Failed to delete item from database', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showMessage('Failed to delete item. Please check the console for details.', 'error');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const isEditing = itemId.value !== '';
    
    try {
        const formData = {
            name: itemName.value,
            category: itemCategory.value,
            price: parseInt(itemPrice.value),
            image: itemImage.value
        };
        
        if (isEditing) {
            // Update existing item
            const id = parseInt(itemId.value);
            
            const updatedItem = {
                ...formData,
                id: id
            };
            
            // Update in the database
            await updateMenuItemInDatabase(updatedItem);
            
            // Update in the local array
            const index = menuItems.findIndex(item => item.id === id);
            if (index !== -1) {
                menuItems[index] = updatedItem;
            }
            
            showMessage('Item updated successfully', 'success');
        } else {
            // Add new item
            const newItem = {
                ...formData,
                id: nextId
            };
            
            // Add to the database using our function
            const success = await addMenuItemToDatabase(newItem);
            
            if (success) {
                // Add to the local array
                menuItems.push(newItem);
                
                // Increment the next ID
                nextId++;
            } else {
                throw new Error('Failed to add item to database');
            }
            
            showMessage('Item added successfully', 'success');
        }
        
        // Close the modal and re-render the table
        closeModal();
        renderMenuItems();
    } catch (error) {
        console.error('Error saving item:', error);
        showMessage('Failed to save item. Please check the console for details.', 'error');
    }
}

// Show a message
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    // Remove the 'hidden' class to show the message
    messageDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 