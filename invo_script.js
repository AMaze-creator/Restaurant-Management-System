document.addEventListener('DOMContentLoaded', function () {
    const orderData = JSON.parse(localStorage.getItem('currentOrder'));

    if (!orderData) {
        alert('no order data found');
        window.location.href = 'menu.html';
        return;
    }

    document.getElementById('customer-name-display').textContent = orderData.customerName;
    document.getElementById('phone-number-display').textContent = orderData.phoneNumber;
    document.getElementById('delivery-date-display').textContent = orderData.deliveryDate;
    document.getElementById('delivery-time-display').textContent = orderData.deliveryTime;
    document.getElementById('invoice-date').textContent = 'Date: ' + orderData.date;
    document.getElementById('invoice-time').textContent = 'Time: ' + orderData.time;
    document.getElementById('invoice-id').textContent = 'Invoice-id: ' + orderData.orderNumber;
    document.getElementById('invoice-total').textContent = '₹' + orderData.total;

    // Show database order ID if available
    if (orderData.databaseOrderId) {
        const databaseOrderIdElement = document.getElementById('database-order-id');
        databaseOrderIdElement.style.display = 'block';
        databaseOrderIdElement.textContent = 'Database ID: ' + orderData.databaseOrderId;
    }

    const invoiceItemsBody = document.getElementById('invoice-item-body');
    
    orderData.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>${item.quantity}</td>
            <td>₹${item.total}</td>
        `;
        invoiceItemsBody.appendChild(row);
    });
    // Add event listeners
    document.getElementById('print-invoice').addEventListener('click', function() {
        window.print();
    });
    
    document.getElementById('back-to-order').addEventListener('click', function() {
        window.location.href = 'menu.html';
    });
});