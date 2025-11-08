/* ===== FORM CALCULATIONS & VALIDATION ===== */

/**
 * Calculate and update the order total
 */
function updateTotal() {
    try {
        // Calculate yearbook service total
        let yearbookTotal = 0;
        document.querySelectorAll('.group-input').forEach(input => {
            const quantity = parseInt(input.value) || 0;
            const price = parseFloat(input.getAttribute('data-price')) || 0;
            yearbookTotal += quantity * price;
        });
        
        // Calculate portrait prints total
        let portraitTotal = 0;
        document.querySelectorAll('.portrait-input').forEach(input => {
            const quantity = parseInt(input.value) || 0;
            const price = parseFloat(input.getAttribute('data-price')) || 0;
            portraitTotal += quantity * price;
        });
        
        const total = yearbookTotal + portraitTotal;
        
        // Update display elements
        const yearbookEl = document.getElementById('yearbookTotal');
        const portraitEl = document.getElementById('portraitTotal');
        const totalEl = document.getElementById('total');
        
        if (yearbookEl) yearbookEl.textContent = yearbookTotal.toFixed(2);
        if (portraitEl) portraitEl.textContent = portraitTotal.toFixed(2);
        if (totalEl) totalEl.textContent = total.toFixed(2);
        
    } catch (error) {
        console.error('Error updating total:', error);
    }
}

/**
 * Update the tab indicators showing item counts
 */
function updateTabIndicators() {
    try {
        // Count packages
        let packageCount = 0;
        document.querySelectorAll('.package-input').forEach(input => {
            packageCount += parseInt(input.value) || 0;
        });
        
        // Count individual prints
        let printsCount = 0;
        document.querySelectorAll('.build-input').forEach(input => {
            printsCount += parseInt(input.value) || 0;
        });
        
        // Update indicators
        const packagesIndicator = document.getElementById('packages-indicator');
        const printsIndicator = document.getElementById('prints-indicator');
        
        if (packagesIndicator) {
            if (packageCount > 0) {
                packagesIndicator.textContent = packageCount;
                packagesIndicator.classList.add('show');
            } else {
                packagesIndicator.classList.remove('show');
            }
        }
        
        if (printsIndicator) {
            if (printsCount > 0) {
                printsIndicator.textContent = printsCount;
                printsIndicator.classList.add('show');
            } else {
                printsIndicator.classList.remove('show');
            }
        }
    } catch (error) {
        console.error('Error updating tab indicators:', error);
    }
}

/**
 * Validate that required email is present for digital orders
 */
function validateDigitalOrderEmail() {
    const digitalFileQty = parseInt(document.querySelector('input[name="digital_file_qty"]')?.value) || 0;
    const digitalPackageQty = parseInt(document.querySelector('input[name="digital_print_package_qty"]')?.value) || 0;
    const emailInput = document.getElementById('studentEmail');
    
    if ((digitalFileQty > 0 || digitalPackageQty > 0) && emailInput && !emailInput.value.trim()) {
        alert('Please provide an email address for digital file delivery.');
        emailInput.focus();
        return false;
    }
    
    return true;
}

/**
 * Check if at least one item is selected
 */
function hasItemsSelected() {
    let hasSelection = false;
    
    // Check yearbook service
    document.querySelectorAll('.group-input').forEach(input => {
        if (parseInt(input.value) > 0) {
            hasSelection = true;
        }
    });
    
    // Check portrait prints
    document.querySelectorAll('.portrait-input').forEach(input => {
        if (parseInt(input.value) > 0) {
            hasSelection = true;
        }
    });
    
    return hasSelection;
}

/**
 * Gather order data from form inputs
 */
function gatherOrderData() {
    const orderData = [];
    
    // Yearbook service data
    const yearbookData = {
        poseNumber: 1,
        poseType: 'yearbook',
        prints: {},
        description: 'NHS Yearbook Portrait Service'
    };
    
    document.querySelectorAll('.group-input').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            const itemNameEl = input.closest('.print-option')?.querySelector('.item-name');
            if (itemNameEl) {
                const itemName = itemNameEl.textContent.trim().replace(/\s+/g, ' ');
                yearbookData.prints[itemName] = quantity;
            }
        }
    });
    
    if (Object.keys(yearbookData.prints).length > 0) {
        orderData.push(yearbookData);
    }
    
    // Portrait prints data
    const portraitData = {
        poseNumber: orderData.length + 1,
        poseType: 'portrait',
        prints: {},
        description: 'Personal Portrait Prints'
    };
    
    document.querySelectorAll('.portrait-input').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            const itemNameEl = input.closest('.print-option')?.querySelector('.item-name');
            if (itemNameEl) {
                const itemName = itemNameEl.textContent.trim().replace(/\s+/g, ' ');
                portraitData.prints[itemName] = quantity;
            }
        }
    });
    
    if (Object.keys(portraitData.prints).length > 0) {
        orderData.push(portraitData);
    }
    
    return {
        poses: orderData,
        delivery: {
            method: 'NHS Advisor',
            timeline: '2-3 weeks'
        }
    };
}

/**
 * Handle quantity button clicks
 */
function handleQuantityButtonClick(e) {
    if (!e.target.classList.contains('quantity-btn')) return;
    
    const input = e.target.parentNode.querySelector('input[type="number"]');
    if (!input) return;
    
    const currentValue = parseInt(input.value) || 0;
    
    if (e.target.classList.contains('increase')) {
        input.value = currentValue + 1;
    } else if (e.target.classList.contains('decrease')) {
        input.value = Math.max(0, currentValue - 1);
    }
    
    updateTotal();
    updateTabIndicators();
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Validation: Check if at least one item is selected
        if (!hasItemsSelected()) {
            alert('Please select at least one item before submitting your order.');
            return;
        }
        
        // Validation: Check email for digital orders
        if (!validateDigitalOrderEmail()) {
            return;
        }
        
        // Gather order data
        const completeOrder = gatherOrderData();
        
        // Add order data to form as hidden input
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'order_details';
        hiddenInput.value = JSON.stringify(completeOrder);
        e.target.appendChild(hiddenInput);
        
        // Submit the form
        e.target.submit();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred while submitting your order. Please try again.');
    }
}

/**
 * Initialize form handlers when DOM is ready
 */
function initializeFormHandlers() {
    // Attach quantity button click handler
    document.addEventListener('click', handleQuantityButtonClick);
    
    // Attach form submit handler
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize totals and indicators
    updateTotal();
    updateTabIndicators();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormHandlers);
} else {
    // DOM is already ready
    initializeFormHandlers();
}