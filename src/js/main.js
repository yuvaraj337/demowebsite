// Fruits Corner - Main Application Logic & Interactivity

import { categories, products } from './products.js';
import { cart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCategories();
  initProducts();
  initSearch();
  initModals();
  initCartDrawer();
  initNewsletter();
  initWishlist();
  
  // Initial cart UI sync
  cart.updateUI();
});

// Sticky Header & Navigation active state
function initHeader() {
  const headerWrapper = document.querySelector('.header-wrapper');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      headerWrapper?.classList.add('scrolled');
    } else {
      headerWrapper?.classList.remove('scrolled');
    }

    // Scroll spy for active link
    const sections = ['home', 'shop', 'about', 'offers', 'contact'];
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop - 120;
        if (window.scrollY >= top) {
          current = id;
        }
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile drawer controls
  const toggleMobileMenu = (open) => {
    if (open) {
      mobileNavDrawer?.classList.add('active');
      mobileOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNavDrawer?.classList.remove('active');
      mobileOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  mobileToggle?.addEventListener('click', () => toggleMobileMenu(true));
  mobileNavClose?.addEventListener('click', () => toggleMobileMenu(false));
  mobileOverlay?.addEventListener('click', () => toggleMobileMenu(false));

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });
}

// Render Categories
function initCategories() {
  const container = document.getElementById('category-grid-container');
  if (!container) return;

  const catsToRender = categories.filter(c => c.id !== 'all');

  container.innerHTML = catsToRender.map(cat => `
    <div class="category-card" data-category="${cat.id}">
      <div class="category-img-wrap">
        <img src="${cat.image}" alt="${cat.name}" loading="lazy">
      </div>
      <h3 class="category-name">${cat.name}</h3>
      <span class="category-count">${cat.count} varieties</span>
      <div class="category-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </div>
  `).join('');

  // Category card click filters products
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-category');
      filterProductsByCategory(catId);
      const shopSec = document.getElementById('shop');
      if (shopSec) {
        shopSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

let activeFilter = 'all';

// Render Best Seller Products
function initProducts() {
  renderProductGrid(products);
  initProductTabs();
}

function renderProductGrid(items) {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-muted);">
        <p style="font-size: 1.2rem; font-weight: 600;">No fresh fruits found in this selection.</p>
        <button onclick="window.resetProductFilter()" class="btn-view-all" style="margin-top: 14px;">View All Fruits</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(p => `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}">
      <div class="product-badge-wrap">
        <span class="product-tag">${p.tag}</span>
      </div>
      <button class="product-wishlist-btn" data-id="${p.id}" title="Add to Favorites" aria-label="Favorite">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      </button>
      <div class="product-img-box" onclick="window.openProductModal('${p.id}')">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-quick-view-overlay">Quick View</div>
      </div>
      <div class="product-body">
        <div class="product-rating-row">
          <span class="stars">★★★★★</span>
          <span class="rating-num" style="font-weight: 700; color: #374151;">${p.rating}</span>
          <span class="reviews-count">(${p.reviewsCount})</span>
        </div>
        <h3 class="product-name" onclick="window.openProductModal('${p.id}')">${p.name}</h3>
        <span class="product-farm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          ${p.farm}
        </span>
        <div class="product-footer">
          <div class="price-wrap">
            <span class="price-current">₹${p.price}<span class="price-unit">/${p.unit}</span></span>
            <span class="price-original">₹${p.originalPrice}</span>
          </div>
          <button class="btn-add-cart" onclick="window.handleAddToCart('${p.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function initProductTabs() {
  const tabs = document.querySelectorAll('.filter-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      activeFilter = filter;
      applyProductFilter(filter);
    });
  });
}

function applyProductFilter(filter) {
  if (filter === 'all') {
    renderProductGrid(products);
  } else if (filter === 'bestsellers') {
    renderProductGrid(products.filter(p => p.isBestSeller));
  } else if (filter === 'essentials') {
    renderProductGrid(products.filter(p => ['apples', 'bananas', 'oranges'].includes(p.category)));
  } else if (filter === 'exotic') {
    renderProductGrid(products.filter(p => ['berries', 'seasonal', 'mangoes'].includes(p.category)));
  }
}

function filterProductsByCategory(catId) {
  const filtered = products.filter(p => p.category === catId);
  const tabs = document.querySelectorAll('.filter-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  renderProductGrid(filtered);
}

window.resetProductFilter = () => {
  const allTab = document.querySelector('.filter-tab-btn[data-filter="all"]');
  if (allTab) allTab.click();
};

window.handleAddToCart = (prodId) => {
  const p = products.find(i => i.id === prodId);
  if (p) {
    cart.addItem(p, 1);
  }
};

// Wishlist interaction
function initWishlist() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.product-wishlist-btn');
    if (btn) {
      e.stopPropagation();
      btn.classList.toggle('active');
      const isFav = btn.classList.contains('active');
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isFav ? '#ef4444' : 'none');
      }
      cart.showToast(isFav ? 'Added to your favorites ❤️' : 'Removed from favorites', 'info');
    }
  });
}

// Search Modal
function initSearch() {
  const searchTriggers = document.querySelectorAll('.action-search-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchClose = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  const openSearch = () => {
    searchModal?.classList.add('active');
    setTimeout(() => searchInput?.focus(), 150);
  };

  const closeSearch = () => {
    searchModal?.classList.remove('active');
    if (searchInput) searchInput.value = '';
    renderSearchResults('');
  };

  searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
  searchClose?.addEventListener('click', closeSearch);
  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  searchInput?.addEventListener('input', (e) => {
    renderSearchResults(e.target.value.trim());
  });

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    if (!query) {
      resultsContainer.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">Type a fruit name (e.g., Apple, Mango, Orange)...</p>';
      return;
    }

    const matches = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<p style="color: #6b7280; text-align: center; padding: 20px;">No fruits match "${query}"</p>`;
      return;
    }

    resultsContainer.innerHTML = matches.map(p => `
      <div class="search-result-row" onclick="window.openProductModal('${p.id}'); document.getElementById('search-modal-close').click();">
        <div class="search-row-left">
          <img src="${p.image}" alt="${p.name}" class="search-row-img">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--color-primary-dark);">${p.name}</h4>
            <span style="font-size: 0.82rem; color: #059669; font-weight: 600;">₹${p.price} / ${p.unit}</span>
          </div>
        </div>
        <button class="btn-add-cart" style="padding: 6px 12px; font-size: 0.8rem;" onclick="event.stopPropagation(); window.handleAddToCart('${p.id}');">
          Add +
        </button>
      </div>
    `).join('');
  }
}

// Product Quick View Modal
function initModals() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('product-modal-close');

  const closeModal = () => modal?.classList.remove('active');

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.openProductModal = (prodId) => {
    const p = products.find(i => i.id === prodId);
    if (!p || !modal) return;

    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-img').alt = p.name;
    document.getElementById('modal-tag').textContent = p.tag;
    document.getElementById('modal-title').textContent = p.name;
    document.getElementById('modal-price').innerHTML = `₹${p.price} <span style="font-size: 1rem; color: var(--color-text-light); font-weight: 500;">/${p.unit}</span>`;
    document.getElementById('modal-desc').textContent = p.description;
    document.getElementById('modal-farm').textContent = `Farm Origin: ${p.farm}`;
    
    // Nutrition
    const nutriWrap = document.getElementById('modal-nutri-wrap');
    if (nutriWrap && p.nutrition) {
      nutriWrap.innerHTML = Object.entries(p.nutrition).map(([k, v]) => `
        <div class="nutri-pill"><strong>${k.toUpperCase()}:</strong> ${v}</div>
      `).join('');
    }

    const modalAddBtn = document.getElementById('modal-add-btn');
    if (modalAddBtn) {
      modalAddBtn.onclick = () => {
        const qty = parseInt(document.getElementById('modal-qty-input')?.value || '1', 10);
        cart.addItem(p, qty);
        closeModal();
      };
    }

    modal.classList.add('active');
  };
}

// Cart Drawer
function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  const openBtns = document.querySelectorAll('.cart-open-trigger');
  const closeBtn = document.getElementById('cart-drawer-close');
  const applyCouponBtn = document.getElementById('cart-apply-coupon');
  const couponInput = document.getElementById('cart-coupon-input');
  const whatsappCheckoutBtn = document.getElementById('cart-whatsapp-checkout');

  const toggleCart = (open) => {
    if (open) {
      drawer?.classList.add('active');
      overlay?.classList.add('active');
      cart.updateUI();
    } else {
      drawer?.classList.remove('active');
      overlay?.classList.remove('active');
    }
  };

  openBtns.forEach(btn => btn.addEventListener('click', () => toggleCart(true)));
  
  const headerOrderBtn = document.getElementById('header-order-btn');
  headerOrderBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart(true);
  });

  closeBtn?.addEventListener('click', () => toggleCart(false));
  overlay?.addEventListener('click', () => toggleCart(false));

  applyCouponBtn?.addEventListener('click', () => {
    const code = couponInput?.value || '';
    cart.applyCoupon(code);
    if (couponInput) couponInput.value = '';
  });

  whatsappCheckoutBtn?.addEventListener('click', () => {
    let msg = cart.generateWhatsAppOrderMessage();
    const phone = '916302094687';
    if (!msg) {
      // Predefined default order inquiry message when cart is empty
      const defaultText = `*Order - Fruits Corner (Freshness Lives Here)*\n--------------------------------------\nHello Fruits Corner! I would like to order fresh fruits.\nPlease send me the available fruit list and today's specials! 🌿`;
      msg = encodeURIComponent(defaultText);
    }
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`, '_blank');
  });
}

// Newsletter
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input && input.value) {
      cart.showToast(`Thank you! Fresh fruit offers sent to ${input.value}`, 'success');
      input.value = '';
    }
  });
}
