// ===== Config =====
const TAX_RATE = 0.08;              // 8% tax
const MIN_QTY = 1;
const PROMOS = {
  LATTE10: { type: 'percent', value: 10, minSubtotal: 0 },
  COFFEE15: { type: 'percent', value: 15, minSubtotal: 30 },
  FREESHIP: { type: 'flat', value: 5, minSubtotal: 0 }
};

// ===== State =====
// Expected item shape: { name, price (number), image?, qty? }
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedPromo = JSON.parse(localStorage.getItem("appliedPromo")) || null;

// Ensure qty present and valid
cart = cart.map(item => ({
  ...item,
  qty: Math.max(parseInt(item.qty || 1, 10) || 1, MIN_QTY)
}));

// ===== Utilities =====
function currency(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

function saveState() {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("appliedPromo", JSON.stringify(appliedPromo));
}

function computeDiscount(subtotal) {
  if (!appliedPromo) return 0;
  const rule = PROMOS[appliedPromo.code];
  if (!rule) return 0;
  if (subtotal < (rule.minSubtotal || 0)) return 0;

  if (rule.type === 'percent') {
    return subtotal * (rule.value / 100);
  }
  if (rule.type === 'flat') {
    return Math.min(rule.value, subtotal);
  }
  return 0;
}

function computeTotals() {
  const subtotal = cart.reduce(
    (sum, it) => sum + (Number(it.price) * Number(it.qty || 1)),
    0
  );
  const discount = computeDiscount(subtotal);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * TAX_RATE;
  const total = Math.max(taxable + tax, 0);
  return { subtotal, discount, tax, total };
}

// ===== DOM Builders =====
function buildCartItem(item, index) {
  const imgSrc =
    item.image ||
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80";
  return `
    <div class="cart-item" data-index="${index}">
      <img src="${imgSrc}" alt="${escapeHtml(item.name)}" class="cart-item-img" />
      <div class="cart-item-details">
        <h3>${escapeHtml(item.name)}</h3>
        <span>${currency(Number(item.price))}</span>
        <div class="cart-item-quantity">
          <button class="qty-minus" data-index="${index}" aria-label="Decrease quantity">-</button>
          <input type="text" class="qty-input" data-index="${index}" value="${Number(item.qty)}" inputmode="numeric" pattern="[0-9]*" />
          <button class="qty-plus" data-index="${index}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    </div>
  `;
}

function buildEmptyState() {
  return `
    <div class="cart-item" style="justify-content:center; flex-direction:column; gap:10px; background:rgba(255,255,255,0.08);">
      <h3 style="color:#fff; opacity:0.9; margin-bottom:4px;">Your cart is empty</h3>
      <a href="index.html" class="checkout-btn" style="text-decoration:none;">Continue shopping</a>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== Render =====
function displayCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");
  const discountEl = document.getElementById("discount"); // optional

  if (!cartItemsEl) return;

  if (!cart || cart.length === 0) {
    cartItemsEl.innerHTML = buildEmptyState();
    if (subtotalEl) subtotalEl.textContent = currency(0);
    if (taxEl) taxEl.textContent = currency(0);
    if (totalEl) totalEl.textContent = currency(0);
    if (discountEl) discountEl.textContent = `-${currency(0)}`;
    return;
  }

  cartItemsEl.innerHTML = cart.map(buildCartItem).join("");

  const { subtotal, discount, tax, total } = computeTotals();
  if (subtotalEl) subtotalEl.textContent = currency(subtotal);
  if (taxEl) taxEl.textContent = currency(tax);
  if (totalEl) totalEl.textContent = currency(total);
  if (discountEl) discountEl.textContent = `-${currency(discount)}`;

  attachItemEventHandlers();
}

// ===== Event Handlers =====
function attachItemEventHandlers() {
  // Remove
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      removeItem(i);
    });
  });

  // Quantity +
  document.querySelectorAll(".qty-plus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      updateQty(i, (cart[i].qty || 1) + 1);
    });
  });

  // Quantity -
  document.querySelectorAll(".qty-minus").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      updateQty(i, Math.max(MIN_QTY, (cart[i].qty || 1) - 1));
    });
  });

  // Quantity manual input
  document.querySelectorAll(".qty-input").forEach(inp => {
    inp.addEventListener("input", (e) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      const val = parseInt((e.currentTarget.value || "").replace(/\D/g, ""), 10);
      if (isNaN(val)) return; // wait for valid digits
      updateQty(i, Math.max(MIN_QTY, val));
    });
    inp.addEventListener("blur", (e) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      const val = parseInt((e.currentTarget.value || "").replace(/\D/g, ""), 10);
      updateQty(i, Math.max(MIN_QTY, isNaN(val) ? MIN_QTY : val));
    });
  });
}

function updateQty(index, qty) {
  if (!cart[index]) return;
  cart[index].qty = qty;
  saveState();
  displayCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveState();
  displayCart();
}

// ===== Promo Code =====
function applyPromo() {
  const input = document.getElementById("promo-input");
  if (!input) return;
  const code = (input.value || "").trim().toUpperCase();

  if (!code) {
    appliedPromo = null;
    saveState();
    displayCart();
    showPromoFeedback("Promo cleared.", true);
    return;
  }

  if (!PROMOS[code]) {
    showPromoFeedback("Invalid promo code.", false);
    return;
  }

  const { subtotal } = computeTotals(); // current subtotal with current promo; safe to check
  const rule = PROMOS[code];
  if (subtotal < (rule.minSubtotal || 0)) {
    showPromoFeedback(`Requires subtotal ${currency(rule.minSubtotal)}+`, false);
    return;
  }

  appliedPromo = { code };
  saveState();
  displayCart();
  showPromoFeedback(`Applied ${code}.`, true);
}

function showPromoFeedback(msg, ok) {
  const input = document.getElementById("promo-input");
  if (!input) return;
  input.style.borderColor = ok ? "#2ecc71" : "#e63946";
  input.placeholder = msg;
  setTimeout(() => { input.style.borderColor = "rgba(241,218,191,0.5)"; }, 1200);
}

// ===== Checkout =====
function checkout() {
  if (!cart || cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  const { total } = computeTotals();
  alert(`Order placed successfully! Total: ${currency(total)}`);
  cart = [];
  appliedPromo = null;
  saveState();
  displayCart();
}

// ===== Init =====
function initCart() {
  // Wire promo apply button if present
  const promoBtn = document.getElementById("promo-apply");
  if (promoBtn) promoBtn.addEventListener("click", applyPromo);

  // Restore promo code text if present
  const promoInput = document.getElementById("promo-input");
  if (promoInput && appliedPromo?.code) promoInput.value = appliedPromo.code;

  displayCart();
}

document.addEventListener("DOMContentLoaded", initCart);

// Expose checkout if using inline onclick
window.checkout = checkout;
