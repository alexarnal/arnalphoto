/* ===== UI INTERACTIONS ===== */

// Tab switching with proper event handling
function switchTab(tabName, event) {
    try {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabName + '-tab');
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error(`Tab with ID '${tabName}-tab' not found`);
        }
        
        // Activate corresponding button - handle both direct calls and event calls
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        } else if (event && event.target) {
            event.target.classList.add('active');
        }
    } catch (error) {
        console.error('Error switching tabs:', error);
    }
}

// Modal Image Gallery
function onClick(element) {
    try {
        const modal = document.getElementById("modal01");
        const img = document.getElementById("img01");
        const caption = document.getElementById("caption");
        
        if (modal && img && caption) {
            img.src = element.src;
            modal.style.display = "block";
            caption.innerHTML = element.alt;
        }
    } catch (error) {
        console.error('Error opening modal:', error);
    }
}

// Navbar scroll behavior
function handleNavbarScroll() {
    const navbar = document.getElementById("myNavbar");
    const navDemo = document.getElementById("navDemo");
    
    if (!navbar) return;
    
    const scrolled = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;
    
    // Update main navbar
    if (scrolled) {
        if (!navbar.className.includes("w3-white")) {
            navbar.className = "w3-bar w3-white";
        }
    } else {
        navbar.className = navbar.className.replace(" w3-white", "");
    }
    
    // Update mobile menu if it exists
    if (navDemo) {
        const isShowing = navDemo.className.indexOf("w3-show") !== -1;
        
        if (isShowing) {
            if (scrolled) {
                navDemo.className = "w3-bar-block w3-hide w3-hide-large w3-hide-medium w3-show w3-white";
            } else {
                navDemo.className = "w3-bar-block w3-hide w3-hide-large w3-hide-medium w3-show";
            }
        } else {
            if (scrolled) {
                navDemo.className = "w3-bar-block w3-hide w3-hide-large w3-hide-medium w3-white";
            } else {
                navDemo.className = "w3-bar-block w3-hide w3-hide-large w3-hide-medium";
            }
        }
    }
}

// Attach scroll handler
window.addEventListener('scroll', handleNavbarScroll);

// Toggle mobile menu
function toggleFunction() {
    const navDemo = document.getElementById("navDemo");
    if (!navDemo) return;
    
    if (navDemo.className.indexOf("w3-show") === -1) {
        navDemo.className += " w3-show";
    } else {
        navDemo.className = navDemo.className.replace(" w3-show", "");
    }
}

// Shipping info toggle (keeping for potential future use)
function toggleShippingInfo() {
    const shippingInfo = document.getElementById('shippingInfo');
    if (!shippingInfo) return;
    
    if (shippingInfo.style.display === 'none' || !shippingInfo.style.display) {
        shippingInfo.style.display = 'block';
    } else {
        shippingInfo.style.display = 'none';
    }
}

// Close shipping info when clicking outside
document.addEventListener('click', function(event) {
    const shippingInfo = document.getElementById('shippingInfo');
    if (!shippingInfo) return;
    
    const shippingBtn = event.target.closest('.shipping-info-btn');
    
    if (!shippingBtn && shippingInfo.style.display === 'block') {
        shippingInfo.style.display = 'none';
    }
});