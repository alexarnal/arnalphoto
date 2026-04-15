/* ===== FIRST COMMUNION FORM HANDLER ===== */
/* Multi-pose aware. Derived from yearbook/form-handler.js but FC-specific:
 *   - Supports Add Pose / Remove Pose
 *   - Has a global "Mass Moment" (Eucharist 5x7) section with a required
 *     disclaimer acknowledgement checkbox.
 *   - Free shipping when subtotal >= $35, flat $5 otherwise.
 */

const SHIPPING_FREE_THRESHOLD = 35;
const SHIPPING_FLAT_RATE = 5;

/* ---------- Pose template ---------- */
function poseTemplate(poseNumber) {
    return `
      <div class="pose-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0;">Pose ${poseNumber}</h3>
        <button type="button" class="remove-pose w3-button w3-small" style="color:#888;">
          <i class="fa fa-times"></i> Remove
        </button>
      </div>

      <div class="tab-container">
        <div class="tab-buttons">
          <button type="button" class="tab-button active" data-target="packages">
            <i class="fa fa-gift"></i> Photo Packages
            <span class="tab-indicator pkg-indicator">0</span>
          </button>
          <button type="button" class="tab-button" data-target="prints">
            <i class="fa fa-th"></i> Individual Prints
            <span class="tab-indicator print-indicator">0</span>
          </button>
        </div>

        <!-- Packages -->
        <div class="tab-content active" data-tab="packages">
          <div class="print-option">
            <div class="item-details">
              <div class="item-name">Keepsake Package <span class="recommended-badge">POPULAR</span></div>
              <div class="item-price">$40.00</div>
              <div class="item-description">1 (8×10) + 2 (5×7) + 4 (2×3 wallets)</div>
            </div>
            <div class="controls-container">
              <button type="button" class="quantity-btn decrease">-</button>
              <input type="number" class="pose-input package-input" data-item="Keepsake Package" value="0" data-price="40" readonly>
              <button type="button" class="quantity-btn increase">+</button>
            </div>
          </div>
          <div class="print-option">
            <div class="item-details">
              <div class="item-name">Digital + Print Package</div>
              <div class="item-price">$60.00</div>
              <div class="item-description">2 (5×7) + 4 (2×3 wallets) + High-Res Digital File</div>
            </div>
            <div class="controls-container">
              <button type="button" class="quantity-btn decrease">-</button>
              <input type="number" class="pose-input package-input" data-item="Digital + Print Package" value="0" data-price="60" readonly>
              <button type="button" class="quantity-btn increase">+</button>
            </div>
          </div>
          <div class="print-option">
            <div class="item-details">
              <div class="item-name">Premium Package</div>
              <div class="item-price">$90.00</div>
              <div class="item-description">1 (11×14) + 2 (8×10) + 4 (5×7)</div>
            </div>
            <div class="controls-container">
              <button type="button" class="quantity-btn decrease">-</button>
              <input type="number" class="pose-input package-input" data-item="Premium Package" value="0" data-price="90" readonly>
              <button type="button" class="quantity-btn increase">+</button>
            </div>
          </div>
        </div>

        <!-- Individual prints -->
        <div class="tab-content" data-tab="prints">
          ${individualPrintRow('Wallet Prints (2×3)', 'Set of 4 wallet-sized prints', 10)}
          ${individualPrintRow('Standard Print (5×7)', 'Single 5×7 print', 10)}
          ${individualPrintRow('Large Print (8×10)', 'Single 8×10 print', 15)}
          ${individualPrintRow('Statement Print (11×14)', 'Single 11×14 print', 35)}
          ${individualPrintRow('Wall Portrait (16×20)', 'Single 16×20 print', 65)}
          ${individualPrintRow('Gallery Print (20×24)', 'Single 20×24 print', 95)}
          ${individualPrintRow('Showcase Print (30×40)', 'Single 30×40 print', 200)}
          ${individualPrintRow('High-Resolution Digital File', 'Full-resolution file delivered via email', 40)}
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:16px;margin-top:16px;flex-wrap:wrap;">
        <label style="font-weight:600;">People in pose:</label>
        <select class="pose-type" style="padding:8px;border:1px solid #ddd;border-radius:4px;">
          <option value="1-3">1–3 (no charge)</option>
          <option value="4-6">4–6 (+$15)</option>
          <option value="7-10">7–10 (+$30)</option>
        </select>
      </div>
      <div style="margin-top:12px;">
        <label style="display:block;font-weight:600;margin-bottom:4px;">Note (optional)</label>
        <input type="text" class="pose-description"
               placeholder="E.g., Communicant only, with parents, with siblings, full family…"
               style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
      </div>
    `;
}

function individualPrintRow(name, description, price) {
    return `
      <div class="print-option">
        <div class="item-details">
          <div class="item-name">${name}</div>
          <div class="item-price">$${price.toFixed(2)}</div>
          <div class="item-description">${description}</div>
        </div>
        <div class="controls-container">
          <button type="button" class="quantity-btn decrease">-</button>
          <input type="number" class="pose-input build-input" data-item="${name}" value="0" data-price="${price}" readonly>
          <button type="button" class="quantity-btn increase">+</button>
        </div>
      </div>`;
}

/* ---------- Pose management ---------- */
function renumberPoses() {
    document.querySelectorAll('#poses .pose').forEach((pose, i) => {
        const h = pose.querySelector('h3');
        if (h) h.textContent = `Pose ${i + 1}`;
        pose.setAttribute('data-pose-id', i + 1);
    });
    const poses = document.querySelectorAll('#poses .pose');
    poses.forEach(p => {
        const btn = p.querySelector('.remove-pose');
        if (btn) btn.disabled = poses.length <= 1;
    });
}

function addPose() {
    const container = document.getElementById('poses');
    const n = container.querySelectorAll('.pose').length + 1;
    const wrapper = document.createElement('div');
    wrapper.className = 'pose content-section';
    wrapper.setAttribute('data-pose-id', n);
    wrapper.innerHTML = poseTemplate(n);
    container.appendChild(wrapper);
    renumberPoses();
    updateTotal();
}

/* ---------- Tabs (scoped per-pose) ---------- */
function handleTabClick(e) {
    const btn = e.target.closest('.tab-button');
    if (!btn) return;
    const pose = btn.closest('.pose');
    if (!pose) return;
    const target = btn.getAttribute('data-target');
    pose.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    pose.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const content = pose.querySelector(`.tab-content[data-tab="${target}"]`);
    if (content) content.classList.add('active');
}

/* ---------- Totals ---------- */
function updateTotal() {
    let subtotal = 0;

    // Mass Moment (Eucharist 5x7)
    const eucharistInput = document.getElementById('eucharistQty');
    if (eucharistInput) {
        const q = parseInt(eucharistInput.value) || 0;
        subtotal += q * 10;
    }

    // Poses
    document.querySelectorAll('#poses .pose').forEach(pose => {
        const poseType = pose.querySelector('.pose-type')?.value;
        if (poseType === '4-6') subtotal += 15;
        if (poseType === '7-10') subtotal += 30;

        pose.querySelectorAll('.pose-input').forEach(input => {
            const q = parseInt(input.value) || 0;
            const p = parseFloat(input.getAttribute('data-price')) || 0;
            subtotal += q * p;
        });

        // Tab indicators per pose
        let pkgCount = 0, printCount = 0;
        pose.querySelectorAll('.package-input').forEach(i => pkgCount += parseInt(i.value) || 0);
        pose.querySelectorAll('.build-input').forEach(i => printCount += parseInt(i.value) || 0);
        const pkgInd = pose.querySelector('.pkg-indicator');
        const prInd  = pose.querySelector('.print-indicator');
        if (pkgInd) pkgInd.classList.toggle('show', pkgCount > 0), pkgInd.textContent = pkgCount;
        if (prInd)  prInd.classList.toggle('show', printCount > 0), prInd.textContent = printCount;
    });

    const shipping = (subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD) ? SHIPPING_FLAT_RATE : 0;
    const total = subtotal + shipping;

    const sEl = document.getElementById('subtotal');
    const shEl = document.getElementById('shipping');
    const tEl = document.getElementById('total');
    if (sEl)  sEl.textContent  = subtotal.toFixed(2);
    if (shEl) shEl.textContent = shipping.toFixed(2);
    if (tEl)  tEl.textContent  = total.toFixed(2);
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
    if ((parseInt(document.getElementById('eucharistQty')?.value) || 0) > 0) return true;
    const anyPose = Array.from(document.querySelectorAll('#poses .pose-input'))
        .some(i => (parseInt(i.value) || 0) > 0);
    return anyPose;
}

function handleSubmit(e) {
    e.preventDefault();

    // Must order something
    if (!hasAnySelection()) {
        alert('Please add at least one item to your order.');
        return;
    }

    // If Eucharist selected, disclaimer ack is required
    const eucharistQty = parseInt(document.getElementById('eucharistQty')?.value) || 0;
    const ack = document.getElementById('eucharistAck');
    if (eucharistQty > 0 && ack && !ack.checked) {
        alert('Please acknowledge the Eucharist Moment disclaimer before continuing.');
        ack.focus();
        return;
    }

    // Digital items require email
    const email = document.getElementById('studentEmail')?.value.trim();
    const wantsDigital = Array.from(document.querySelectorAll('.pose-input'))
        .some(i => (parseInt(i.value) || 0) > 0 &&
                   (i.dataset.item === 'High-Resolution Digital File' ||
                    i.dataset.item === 'Digital + Print Package'));
    if (wantsDigital && !email) {
        alert('Please provide an email address so we can deliver your digital file.');
        document.getElementById('studentEmail')?.focus();
        return;
    }

    // Build order object
    const poses = [];

    // Global Mass Moment pose (line item style)
    if (eucharistQty > 0) {
        poses.push({
            poseNumber: 0,
            poseType: '1-3',
            prints: { 'Eucharist Moment (5x7)': eucharistQty },
            description: 'Eucharist Moment - conditional capture (refundable if not captured)'
        });
    }

    document.querySelectorAll('#poses .pose').forEach((pose, i) => {
        const poseData = {
            poseNumber: i + 1,
            poseType: pose.querySelector('.pose-type')?.value || '1-3',
            prints: {},
            description: pose.querySelector('.pose-description')?.value || ''
        };
        pose.querySelectorAll('.pose-input').forEach(input => {
            const q = parseInt(input.value) || 0;
            if (q > 0) {
                const item = input.dataset.item;
                poseData.prints[item] = q;
            }
        });
        if (Object.keys(poseData.prints).length > 0) poses.push(poseData);
    });

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
    src.value = 'firstCommunion';
    form.appendChild(src);

    form.submit();
}

/* ---------- Init ---------- */
function init() {
    document.addEventListener('click', handleQuantityClick);
    document.addEventListener('click', handleTabClick);

    const addBtn = document.getElementById('addPose');
    if (addBtn) addBtn.addEventListener('click', addPose);

    document.getElementById('poses').addEventListener('click', e => {
        if (e.target.closest('.remove-pose')) {
            const poses = document.querySelectorAll('#poses .pose');
            if (poses.length <= 1) return;
            e.target.closest('.pose').remove();
            renumberPoses();
            updateTotal();
        }
    });

    // Seed first pose
    const container = document.getElementById('poses');
    if (container && container.children.length === 0) addPose();

    // Eucharist changes
    const eq = document.getElementById('eucharistQty');
    if (eq) eq.addEventListener('change', updateTotal);

    // Catch select changes (pose type)
    document.getElementById('orderForm').addEventListener('change', updateTotal);

    document.getElementById('orderForm').addEventListener('submit', handleSubmit);

    renumberPoses();
    updateTotal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
