/* ===== EPCC GRADUATION FORM HANDLER ===== */
/* Single-portrait (yearbook-style):
 *   - One Graduate Portrait section with tabbed Packages / Individual Prints
 *   - One Class Group Photo (8x10) section — scheduled, guaranteed item
 *   - Free shipping when subtotal >= $35, flat $5 otherwise.
 */

const SHIPPING_FREE_THRESHOLD = 35;
const SHIPPING_FLAT_RATE = 5;

/* ---------- Tabs (scoped to #portraitSection) ---------- */
function handleTabClick(e) {
    const btn = e.target.closest('.tab-button');
    if (!btn) return;
    const section = btn.closest('#portraitSection');
    if (!section) return;
    const target = btn.getAttribute('data-target');
    section.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    section.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const content = section.querySelector(`.tab-content[data-tab="${target}"]`);
    if (content) content.classList.add('active');
}

/* ---------- Totals ---------- */
function updateTotal() {
    let portraitTotal = 0;
    document.querySelectorAll('.portrait-input').forEach(input => {
        const q = parseInt(input.value) || 0;
        const p = parseFloat(input.getAttribute('data-price')) || 0;
        portraitTotal += q * p;
    });

    const groupInput = document.getElementById('groupPhotoQty');
    const groupQty = parseInt(groupInput?.value) || 0;
    const groupTotal = groupQty * 15;

    const subtotal = portraitTotal + groupTotal;
    const shipping = (subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD) ? SHIPPING_FLAT_RATE : 0;
    const total = subtotal + shipping;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val.toFixed(2);
    };
    set('portraitTotal', portraitTotal);
    set('groupTotal', groupTotal);
    set('subtotal', subtotal);
    set('shipping', shipping);
    set('total', total);

    // Tab indicators
    let pkgCount = 0, printCount = 0;
    document.querySelectorAll('.package-input').forEach(i => pkgCount += parseInt(i.value) || 0);
    document.querySelectorAll('.build-input').forEach(i => printCount += parseInt(i.value) || 0);
    const pkgInd = document.querySelector('#portraitSection .pkg-indicator');
    const prInd = document.querySelector('#portraitSection .print-indicator');
    if (pkgInd) { pkgInd.textContent = pkgCount; pkgInd.classList.toggle('show', pkgCount > 0); }
    if (prInd)  { prInd.textContent  = printCount; prInd.classList.toggle('show', printCount > 0); }
}

/* ---------- Quantity buttons ---------- */
function handleQuantityClick(e) {
    const btn = e.target.closest('.quantity-btn');
    if (!btn) return;
    const input = btn.parentNode.querySelector('input[type="number"]');
    if (!input) return;
    const cur = parseInt(input.value) || 0;
    if (btn.classList.contains('increase')) input.value = cur + 1;
    else input.value = Math.max(0, cur - 1);
    updateTotal();
}

/* ---------- Submit ---------- */
function hasAnySelection() {
    if ((parseInt(document.getElementById('groupPhotoQty')?.value) || 0) > 0) return true;
    return Array.from(document.querySelectorAll('.portrait-input'))
        .some(i => (parseInt(i.value) || 0) > 0);
}

function handleSubmit(e) {
    e.preventDefault();

    if (!hasAnySelection()) {
        alert('Please add at least one item to your order.');
        return;
    }

    // Digital items require email
    const email = document.getElementById('studentEmail')?.value.trim();
    const wantsDigital = Array.from(document.querySelectorAll('.portrait-input'))
        .some(i => (parseInt(i.value) || 0) > 0 &&
                   (i.dataset.item === 'High-Resolution Digital File' ||
                    i.dataset.item === 'Digital + Print Package'));
    if (wantsDigital && !email) {
        alert('Please provide an email address so we can deliver your digital file.');
        document.getElementById('studentEmail')?.focus();
        return;
    }

    // Build order: one pose for graduate portraits, one for group photo
    const poses = [];

    const portraitPrints = {};
    document.querySelectorAll('.portrait-input').forEach(input => {
        const q = parseInt(input.value) || 0;
        if (q > 0) portraitPrints[input.dataset.item] = q;
    });
    if (Object.keys(portraitPrints).length > 0) {
        poses.push({
            poseNumber: 1,
            poseType: '1-3',
            prints: portraitPrints,
            description: 'Graduate Portrait'
        });
    }

    const groupQty = parseInt(document.getElementById('groupPhotoQty')?.value) || 0;
    if (groupQty > 0) {
        poses.push({
            poseNumber: poses.length + 1,
            poseType: '1-3',
            prints: { 'Group Photo 8×10': groupQty },
            description: 'Class of 2026 Group Photo'
        });
    }

    const subtotal = parseFloat(document.getElementById('subtotal').textContent) || 0;
    const shipping = (subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD) ? SHIPPING_FLAT_RATE : 0;

    const completeOrder = {
        poses,
        shipping: { cost: shipping, applied: shipping > 0 }
    };

    const form = e.target;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'order_details';
    hidden.value = JSON.stringify(completeOrder);
    form.appendChild(hidden);

    const src = document.createElement('input');
    src.type = 'hidden';
    src.name = 'source';
    src.value = 'epccGraduation';
    form.appendChild(src);

    form.submit();
}

/* ---------- Init ---------- */
function init() {
    document.addEventListener('click', handleQuantityClick);
    document.addEventListener('click', handleTabClick);
    document.getElementById('orderForm').addEventListener('submit', handleSubmit);
    updateTotal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
