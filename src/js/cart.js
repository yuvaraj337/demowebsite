// Fruits Corner - Shopping Cart State & Interaction Logic

class CartManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('fc_cart') || '[]');
    this.discountPercent = 0;
    this.activeCoupon = null;
    this.initListeners();
  }

  initListeners() {
    // Custom events can be dispatched
  }

  save() {
    localStorage.setItem('fc_cart', JSON.stringify(this.items));
    window.dispatchEvent(new CustomEvent('fc:cart-updated', { detail: { count: this.getCount(), total: this.getTotal() } }));
    this.updateUI();
  }

  addItem(product, quantity = 1) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        quantity: quantity
      });
    }
    this.save();
    this.showToast(`Added ${quantity} ${product.unit} of ${product.name} to cart!`, 'success');
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.save();
  }

  removeItem(productId) {
    const item = this.items.find(i => i.id === productId);
    const name = item ? item.name : 'Item';
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
    this.showToast(`Removed ${name} from cart`, 'info');
  }

  clear() {
    this.items = [];
    this.discountPercent = 0;
    this.activeCoupon = null;
    this.save();
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscountAmount() {
    return Math.round((this.getSubtotal() * this.discountPercent) / 100);
  }

  getDeliveryFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 300 ? 0 : 40; // Free delivery above 300
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return Math.max(0, subtotal - this.getDiscountAmount() + this.getDeliveryFee());
  }

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'FRESH20') {
      this.discountPercent = 20;
      this.activeCoupon = 'FRESH20 (20% OFF)';
      this.save();
      this.showToast('Coupon FRESH20 applied! 20% discount added.', 'success');
      return { success: true, message: '20% discount applied!' };
    } else if (cleanCode === 'WELCOME10') {
      this.discountPercent = 10;
      this.activeCoupon = 'WELCOME10 (10% OFF)';
      this.save();
      this.showToast('Coupon WELCOME10 applied! 10% discount added.', 'success');
      return { success: true, message: '10% discount applied!' };
    } else {
      this.showToast('Invalid coupon code. Try FRESH20', 'error');
      return { success: false, message: 'Invalid code' };
    }
  }

  generateWhatsAppOrderMessage(customerName = 'Customer', address = 'Local Delivery') {
    if (this.items.length === 0) return null;
    let text = `*New Order - Fruits Corner (Freshness Lives Here)*\n`;
    text += `--------------------------------------\n`;
    this.items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.name}* - ${item.quantity} ${item.unit} x ₹${item.price} = ₹${item.price * item.quantity}\n`;
    });
    text += `--------------------------------------\n`;
    text += `*Subtotal:* ₹${this.getSubtotal()}\n`;
    if (this.discountPercent > 0) {
      text += `*Discount (${this.activeCoupon}):* -₹${this.getDiscountAmount()}\n`;
    }
    const delivery = this.getDeliveryFee();
    text += `*Delivery:* ${delivery === 0 ? 'FREE' : '₹' + delivery}\n`;
    text += `*Grand Total:* ₹${this.getTotal()}\n`;
    text += `--------------------------------------\n`;
    text += `*Deliver to:* ${customerName} | ${address}\n`;
    text += `Please confirm my fresh order! 🌿`;
    return encodeURIComponent(text);
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('fc-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fc-toast-container';
      container.className = 'fc-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `fc-toast fc-toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
      <span class="fc-toast-icon">${icon}</span>
      <span class="fc-toast-text">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fc-toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('fc-toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  updateUI() {
    // Update badge counters across the site
    const count = this.getCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.classList.toggle('visible', count > 0);
    });

    // Update cart drawer items if open/present
    const drawerList = document.getElementById('cart-drawer-items');
    const drawerEmpty = document.getElementById('cart-drawer-empty');
    const drawerFooter = document.getElementById('cart-drawer-footer');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const discountRow = document.getElementById('cart-discount-row');
    const discountVal = document.getElementById('cart-discount-val');
    const deliveryVal = document.getElementById('cart-delivery-val');
    const totalEl = document.getElementById('cart-total-val');

    if (!drawerList) return;

    if (this.items.length === 0) {
      if (drawerList) drawerList.innerHTML = '';
      if (drawerEmpty) drawerEmpty.style.display = 'flex';
      if (drawerFooter) drawerFooter.style.display = 'none';
      return;
    }

    if (drawerEmpty) drawerEmpty.style.display = 'none';
    if (drawerFooter) drawerFooter.style.display = 'block';

    drawerList.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-price">₹${item.price} / ${item.unit}</span>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" onclick="window.fcCart.updateQuantity('${item.id}', -1)">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn" onclick="window.fcCart.updateQuantity('${item.id}', 1)">+</button>
            </div>
            <span class="cart-item-line-total">₹${item.price * item.quantity}</span>
            <button class="cart-item-remove" onclick="window.fcCart.removeItem('${item.id}')" title="Remove item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `₹${this.getSubtotal()}`;
    if (discountRow) {
      if (this.discountPercent > 0) {
        discountRow.style.display = 'flex';
        discountVal.textContent = `-₹${this.getDiscountAmount()}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (deliveryVal) {
      const fee = this.getDeliveryFee();
      deliveryVal.textContent = fee === 0 ? 'FREE' : `₹${fee}`;
      deliveryVal.className = fee === 0 ? 'val-free' : '';
    }
    if (totalEl) totalEl.textContent = `₹${this.getTotal()}`;
  }
}

export const cart = new CartManager();
if (typeof window !== 'undefined') {
  window.fcCart = cart;
}
