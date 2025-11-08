/* ===== UI INTERACTIONS ===== */

// Tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Activate corresponding button
    event.target.classList.add('active');
}

// Modal Image Gallery
function onClick(element) {
    document.getElementById("img01").src = element.src;
    document.getElementById("modal01").style.display = "block";
    var captionText = document.getElementById("caption");
    captionText.innerHTML = element.alt;
}

// Navbar scroll behavior
window.onscroll = function() {
    var navbar = document.getElementById("myNavbar");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        navbar.className = "w3-bar" + " w3-white";
    } else {
        navbar.className = navbar.className.replace(" w3-white", "");
    }
    
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") != -1) {
        x.className = "w3-bar-block" + " w3-hide" + " w3-hide-large" + " w3-hide-medium" + " w3-show";
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            x.className = "w3-bar-block" + " w3-hide" + " w3-hide-large" + " w3-hide-medium" + " w3-show" + " w3-white";
        } else {
            x.className = x.className.replace(" w3-white", "");
        }
    } else {
        x.className = x.className.replace(" w3-show", "");
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            x.className = "w3-bar-block" + " w3-hide" + " w3-hide-large" + " w3-hide-medium" + " w3-white";
        } else {
            x.className = x.className.replace(" w3-white", "");
        }
    }
};

// Toggle mobile menu
function toggleFunction() {
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}

// Shipping info toggle (keeping for potential future use)
function toggleShippingInfo() {
    const shippingInfo = document.getElementById('shippingInfo');
    if (shippingInfo && shippingInfo.style.display === 'none') {
        shippingInfo.style.display = 'block';
    } else if (shippingInfo) {
        shippingInfo.style.display = 'none';
    }
}

// Close shipping info when clicking outside
document.addEventListener('click', function(event) {
    const shippingInfo = document.getElementById('shippingInfo');
    const shippingBtn = event.target.closest('.shipping-info-btn');
    
    if (shippingInfo && !shippingBtn && shippingInfo.style.display === 'block') {
        shippingInfo.style.display = 'none';
    }
});
