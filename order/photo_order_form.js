// Photo Order Form JavaScript

// Function to update pose numbering
function updatePoseNumbering() {
    const poses = document.querySelectorAll('.pose');
    poses.forEach((pose, index) => {
        pose.querySelector('h2').textContent = `Pose ${index + 1}`;
        pose.setAttribute('data-pose-id', index + 1);
    });
}

// Function to update remove buttons' disabled state
function updateRemoveButtons() {
    const poses = document.querySelectorAll('.pose');
    const totalPoses = poses.length;
    
    poses.forEach(pose => {
        const removeButton = pose.querySelector('.remove-pose');
        // Enable remove button only if there's more than one pose
        removeButton.disabled = totalPoses <= 1;
    });
}

// Add listeners once DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Add Pose Button
    document.getElementById('addPose').addEventListener('click', function() {
        // Get the current number of poses and set the new pose's number to be the next sequential number
        const currentPoses = document.querySelectorAll('.pose');
        const nextPoseNumber = currentPoses.length + 1;
        
        const newPose = document.createElement('div');
        newPose.className = 'pose';
        newPose.setAttribute('data-pose-id', nextPoseNumber);
        newPose.innerHTML = `
            <div class="pose-header">
                <h2>Pose ${nextPoseNumber}</h2>
                <button type="button" class="remove-pose">Remove</button>
            </div>
            <div class="people-option">
                <span>Number of people</span>
                <div class="controls-container">
                    <select class="pose-type">
                        <option value="1-3">1-3 ($0)</option>
                        <option value="4-6">4-6 ($15)</option>
                        <option value="7-10">7-10 ($30)</option>
                    </select>
                </div>
            </div>

            <!-- Photo Package -->
            <div class="print-option">
                <label>Photo Package</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="photo-package" value="0" data-price="35" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 2x3 (multiples of 4) -->
            <div class="print-option">
                <label>Print 2x3</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-2x3" value="0" data-price="2.5" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 5x7 -->
            <div class="print-option">
                <label>Print 5x7</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-5x7" value="0" data-price="10" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 8x10 -->
            <div class="print-option">
                <label>Print 8x10</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-8x10" value="0" data-price="15" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 11x14 -->
            <div class="print-option">
                <label>Print 11x14*</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-11x14" value="0" data-price="35" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 16x20 -->
            <div class="print-option">
                <label>Print 16x20*</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-16x20" value="0" data-price="65" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 20x24 -->
            <div class="print-option">
                <label>Print 20x24*</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-20x24" value="0" data-price="95" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>

            <!-- Print 30x40 -->
            <div class="print-option">
                <label>Print 30x40*</label>
                <div class="controls-container">
                    <button type="button" class="quantity-btn decrease">-</button>
                    <input type="number" class="print-30x40" value="0" data-price="200" readonly>
                    <button type="button" class="quantity-btn increase">+</button>
                </div>
            </div>
            <div style="margin-left: 10px;margin-right: 10px;">
                Note: <input type="text" class="pose-description" placeholder="E.g., Candidate only, Graduate with parents, 5 people, Siblings, Family portrait, etc.">
            </div>
            <p style="font-size: 0.8em; color: #666; margin-left: 10px;">* Wood panel backing included</p>
        `;
        document.getElementById('poses').appendChild(newPose);
        updateRemoveButtons();
        updateTotal();
    });

    // Event delegation for the remove pose button
    document.getElementById('poses').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-pose')) {
            const pose = e.target.closest('.pose');
            const poses = document.querySelectorAll('.pose');
            
            // Remove pose only if it's not the last one
            if (poses.length > 1) {
                pose.remove();
                updatePoseNumbering();
                updateRemoveButtons();
                updateTotal();
            }
        }
    });

    document.getElementById('orderForm').addEventListener('change', updateTotal);

    // Event delegation for quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const input = e.target.parentNode.querySelector('input');
            const step = input.classList.contains('print-2x3') ? 4 : 1;
            const currentValue = parseInt(input.value) || 0;
            
            if (e.target.classList.contains('increase')) {
                input.value = currentValue + step;
            } else if (e.target.classList.contains('decrease')) {
                input.value = Math.max(0, currentValue - step);
            }
            
            input.dispatchEvent(new Event('change'));
            updateTotal();
        }
    });

    // Form submission and validation
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Always prevent default submission

        // Validate print options
        const poses = document.querySelectorAll('.pose');
        for (let i = 0; i < poses.length; i++) {
            const pose = poses[i];
            const printInputs = pose.querySelectorAll('input[type="number"]');
            let hasSelection = false;
            for (const input of printInputs) {
                if (parseInt(input.value) > 0) {
                    hasSelection = true;
                    break;
                }
            }
            if (!hasSelection) {
                alert(`Please select at least one print option for Pose ${i + 1}.`);
                return; // Stop here if validation fails
            }
        }

        // If we get here, validation passed
        // Gather all the order data
        let orderData = [];
        poses.forEach((pose, index) => {
            let poseData = {
                poseNumber: index + 1,
                poseType: pose.querySelector('.pose-type').value,
                prints: {},
                description: pose.querySelector('.pose-description').value
            };
            pose.querySelectorAll('input[type="number"]').forEach(input => {
                if (parseInt(input.value) > 0) {
                    // Find the label text for this input
                    const label = input.closest('.print-option').querySelector('label').textContent.trim();
                    poseData.prints[label] = input.value;
                }
            });
            orderData.push(poseData);
        });

        // Add the order data to the form
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'order_details';
        hiddenInput.value = JSON.stringify(orderData);
        this.appendChild(hiddenInput);

        // Now manually submit the form
        this.submit();
    });

    // Initialize the remove buttons on page load
    updateRemoveButtons();
});

// Function to update totals
function updateTotal() {
    let subtotal = 0;
    const poses = document.querySelectorAll('.pose');
    poses.forEach(pose => {
        const poseType = pose.querySelector('.pose-type').value;
        if (poseType === '4-6') subtotal += 15;
        if (poseType === '7-10') subtotal += 30;
        
        pose.querySelectorAll('input[type="number"]').forEach(input => {
            let quantity = parseInt(input.value) || 0; // Use 0 if NaN
            const price = parseFloat(input.getAttribute('data-price'));
            if (input.classList.contains('print-2x3')) {
                quantity = Math.floor(quantity / 4) * 4; // Ensure quantity is a multiple of 4
                input.value = quantity; // Update the input value
            }
            subtotal += quantity * price;
        });
    });

    // Only charge shipping if subtotal is less than $35 and not zero
    const shipping = (subtotal > 0 && subtotal < 35) ? 15 : 0;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('shipping').textContent = shipping.toFixed(2);
    document.getElementById('total').textContent = (subtotal + shipping).toFixed(2);
}