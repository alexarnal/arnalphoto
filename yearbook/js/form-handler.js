/* ===== FORM CALCULATIONS & VALIDATION ===== */

function updateTotal() {
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
    
    // Update display
    document.getElementById('yearbookTotal').textContent = yearbookTotal.toFixed(2);
    document.getElementById('portraitTotal').textContent = portraitTotal.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

function updateTabIndicators() {
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
    
    if (packageCount > 0) {
        packagesIndicator.textContent = packageCount;
        packagesIndicator.classList.add('show');
    } else {
        packagesIndicator.classList.remove('show');
    }
    
    if (printsCount > 0) {
        printsIndicator.textContent = printsCount;
        printsIndicator.classList.add('show');
    } else {
        printsIndicator.classList.remove('show');
    }
}

// Quantity button handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('quantity-btn')) {
        const input = e.target.parentNode.querySelector('input[type="number"]');
        const currentValue = parseInt(input.value) || 0;
        
        if (e.target.classList.contains('increase')) {
            input.value = currentValue + 1;
        } else if (e.target.classList.contains('decrease')) {
            input.value = Math.max(0, currentValue - 1);
        }
        
        updateTotal();
        updateTabIndicators();
    }
});

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validation: Check if at least one item is selected
            let hasYearbookSelection = false;
            let hasPortraitSelection = false;
            
            document.querySelectorAll('.group-input').forEach(input => {
                if (parseInt(input.value) > 0) {
                    hasYearbookSelection = true;
                }
            });
            
            document.querySelectorAll('.portrait-input').forEach(input => {
                if (parseInt(input.value) > 0) {
                    hasPortraitSelection = true;
                }
            });
            
            if (!hasYearbookSelection && !hasPortraitSelection) {
                alert('Please select at least one item before submitting your order.');
                return;
            }

            // Email validation for digital orders
            const digitalFileQty = parseInt(document.querySelector('input[name="digital_file_qty"]').value) || 0;
            const digitalPackageQty = parseInt(document.querySelector('input[name="digital_print_package_qty"]').value) || 0;
            const emailInput = document.getElementById('studentEmail');
            
            if ((digitalFileQty > 0 || digitalPackageQty > 0) && !emailInput.value.trim()) {
                alert('Please provide an email address for digital file delivery.');
                emailInput.focus();
                return;
            }

            // Gather order data
            let orderData = [];
            
            // Yearbook service
            let yearbookData = {
                poseNumber: 1,
                poseType: 'yearbook',
                prints: {},
                description: 'NHS Yearbook Portrait Service'
            };
            
            document.querySelectorAll('.group-input').forEach(input => {
                if (parseInt(input.value) > 0) {
                    const itemName = input.parentNode.parentNode.querySelector('.item-name').textContent.trim();
                    yearbookData.prints[itemName] = input.value;
                }
            });
            
            if (Object.keys(yearbookData.prints).length > 0) {
                orderData.push(yearbookData);
            }
            
            // Portrait prints
            let portraitData = {
                poseNumber: orderData.length + 1,
                poseType: 'portrait',
                prints: {},
                description: 'Personal Portrait Prints'
            };
            
            document.querySelectorAll('.portrait-input').forEach(input => {
                if (parseInt(input.value) > 0) {
                    const itemName = input.parentNode.parentNode.querySelector('.item-name').textContent.trim();
                    portraitData.prints[itemName] = input.value;
                }
            });
            
            if (Object.keys(portraitData.prints).length > 0) {
                orderData.push(portraitData);
            }
            
            // Create complete order object
            const completeOrder = {
                poses: orderData,
                delivery: {
                    method: 'NHS Advisor',
                    timeline: '2-3 weeks'
                }
            };

            // Add order data to form
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'order_details';
            hiddenInput.value = JSON.stringify(completeOrder);
            this.appendChild(hiddenInput);

            // Submit the form
            this.submit();
        });
    }
    
    // Initialize
    updateTotal();
    updateTabIndicators();
});
