
const firebaseConfig = {
  apiKey: "AIzaSyDq-dljlsEbgL3276SYRfd57ozqbiQodKQ",
  authDomain: "bong-tastes.firebaseapp.com",
  projectId: "bong-tastes",
  storageBucket: "bong-tastes.firebasestorage.app",
  messagingSenderId: "866977671476",
  appId: "1:866977671476:web:f027418e16b9376fa65d61",
  measurementId: "G-KVMTR9HCE8"
};

console.log('Initializing Firebase...');

// Initialize Firebase with compat version
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
console.log('Firestore initialized');

// Analytics may not be needed for just storing emails
try {
  firebase.analytics();
  console.log('Analytics initialized');
} catch (e) {
  console.log('Analytics initialization failed:', e.message);
}

// Function to save email to Firestore
export async function saveEmailToDatabase(email) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  console.log(`Attempting to save email: ${email} to Firestore...`);
  
  try {
    const docRef = await db.collection("newsletter_subscribers").add({
      email: email,
      subscribed_at: new Date()
    });
    
    console.log("Email saved with ID: ", docRef.id);
    return true;
  } catch (error) {
    console.error("Error saving email: ", error);
    console.error("Error details:", error.code, error.message);
    return false;
  }
}

// Function to save all menu items to Firestore
export async function saveMenuItemsToDatabase(menuItems) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  console.log(`Attempting to save ${menuItems.length} menu items to Firestore...`);
  
  try {
    // Create a batch to perform multiple operations
    const batch = db.batch();
    
    // Get a reference to the menu_items collection
    const menuCollection = db.collection("menu_items");
    
    // Add each menu item to the batch
    menuItems.forEach(item => {
      // Create a document with the same ID as the menu item
      const docRef = menuCollection.doc(item.id.toString());
      batch.set(docRef, {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`All menu items saved successfully to Firestore`);
    return true;
  } catch (error) {
    console.error("Error saving menu items: ", error);
    console.error("Error details:", error.code, error.message);
    return false;
  }
}

// Function to update a menu item in Firestore
export async function updateMenuItemInDatabase(item) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    await db.collection("menu_items").doc(item.id.toString()).update({
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Menu item ${item.id} updated successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating menu item ${item.id}: `, error);
    return false;
  }
}

// Function to get all menu items from Firestore
export async function getMenuItemsFromDatabase() {
  if (!db) {
    console.error('Firestore not initialized');
    return [];
  }
  
  try {
    const snapshot = await db.collection("menu_items").get();
    const menuItems = [];
    
    snapshot.forEach(doc => {
      menuItems.push(doc.data());
    });
    
    console.log(`Retrieved ${menuItems.length} menu items from Firestore`);
    return menuItems;
  } catch (error) {
    console.error("Error getting menu items: ", error);
    return [];
  }
}

// Function to delete a menu item from Firestore
export async function deleteMenuItemFromDatabase(itemId) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    await db.collection("menu_items").doc(itemId.toString()).delete();
    console.log(`Menu item ${itemId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting menu item ${itemId}: `, error);
    return false;
  }
}

// Function to add a single menu item to Firestore
export async function addMenuItemToDatabase(item) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    await db.collection("menu_items").doc(item.id.toString()).set({
      ...item,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Menu item ${item.id} added successfully`);
    return true;
  } catch (error) {
    console.error(`Error adding menu item: `, error);
    return false;
  }
}

// Function to save table reservation to Firestore
export async function saveTableReservation(reservation) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    // Add timestamp to the reservation data
    const reservationWithTimestamp = {
      ...reservation,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending' // Initial status (pending, confirmed, completed, cancelled)
    };
    
    // Add to the table_reservations collection
    const docRef = await db.collection("table_reservations").add(reservationWithTimestamp);
    
    console.log(`Table reservation added with ID: ${docRef.id}`);
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error(`Error saving table reservation: `, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to get all table reservations from Firestore
export async function getTableReservations() {
  if (!db) {
    console.error('Firestore not initialized');
    return [];
  }
  
  try {
    // Get all reservations ordered by date (newest first)
    const snapshot = await db.collection("table_reservations")
      .orderBy("created_at", "desc")
      .get();
      
    const reservations = [];
    
    snapshot.forEach(doc => {
      reservations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Retrieved ${reservations.length} table reservations from Firestore`);
    return reservations;
  } catch (error) {
    console.error("Error getting table reservations: ", error);
    return [];
  }
}

// Function to update table reservation status
export async function updateReservationStatus(id, status) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    await db.collection("table_reservations").doc(id).update({
      status: status,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Reservation ${id} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating reservation status: `, error);
    return false;
  }
}

// Function to save order data to Firestore
export async function saveOrderToDatabase(orderData) {
  if (!db) {
    console.error('Firestore not initialized');
    return { success: false, message: 'Firestore not initialized' };
  }
  
  try {
    // Add timestamp and status to the order data
    const orderWithTimestamp = {
      ...orderData,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new' // Initial status (new, processing, completed, cancelled)
    };
    
    // Add to the orders collection
    const docRef = await db.collection("orders").add(orderWithTimestamp);
    
    console.log(`Order saved with ID: ${docRef.id}`);
    return {
      success: true,
      id: docRef.id,
      message: 'Order saved successfully'
    };
  } catch (error) {
    console.error(`Error saving order: `, error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Function to get all orders from Firestore
export async function getOrders() {
  if (!db) {
    console.error('Firestore not initialized');
    return [];
  }
  
  try {
    // Get all orders ordered by creation date (newest first)
    const snapshot = await db.collection("orders")
      .orderBy("created_at", "desc")
      .get();
      
    const orders = [];
    
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Retrieved ${orders.length} orders from Firestore`);
    return orders;
  } catch (error) {
    console.error("Error getting orders: ", error);
    return [];
  }
}

// Function to update order status
export async function updateOrderStatus(id, status) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    await db.collection("orders").doc(id).update({
      status: status,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Order ${id} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating order status: `, error);
    return false;
  }
}