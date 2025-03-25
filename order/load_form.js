// Form Loader Script
document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the form should be inserted
    const formContainer = document.getElementById('photo-order-form-container');
    
    if (!formContainer) {
        console.error('Error: No element with ID "photo-order-form-container" found on the page.');
        return;
    }
    
    // Load the form content
    fetch('../order/photo_order_form.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Insert the form HTML into the container
            formContainer.innerHTML = html;
            
            // Now that the form is loaded, load and execute the form script
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = '../order/photo_order_form.js';
                script.onload = resolve;
                document.body.appendChild(script);
            });
        })
        .catch(error => {
            console.error('Error loading photo order form:', error);
            formContainer.innerHTML = '<p>Error loading the order form. Please try again later.</p>';
        });
});