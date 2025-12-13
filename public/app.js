// Frontend: loads products, manages cart (localStorage), checkout flow, category filtering, product modal

const productsEl = document.getElementById('products');
const cartBtn = document.getElementById('cart-btn');
const cartEl = document.getElementById('cart');
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');
const closeCartBtn = document.getElementById('close-cart');
const toast = document.getElementById('toast');
const navLinks = document.querySelectorAll('.nav-link');

// Modal elements
const productModal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');
const modalAddToCartBtn = document.getElementById('modalAddToCart');

let products = [];
let filteredProducts = [];
let currentCategory = 'hoodies';
let selectedProduct = null;
let selectedSize = null;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function updateCartUI() {
  cartCountEl.textContent = cart.reduce((s, i) => s + (i.quantity || i.qty || 0), 0);
  cartItemsEl.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<li style="padding: 16px; text-align: center; color: #666;">Your cart is empty</li>';
  } else {
    cart.forEach(item => {
      const li = document.createElement('li');
      const qty = item.quantity || item.qty || 0;
      const total = item.salePrice * qty;
      li.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          <small>Rs ${item.salePrice.toFixed(0)} × ${qty}</small>
        </div>
        <div>Rs ${total.toFixed(0)}</div>
      `;
      cartItemsEl.appendChild(li);
    });
  }
  
  cartTotalEl.textContent = cart.reduce((s, i) => s + i.salePrice * (i.quantity || i.qty || 0), 0).toFixed(0);
}

function addToCart(id, quantity = 1) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  
  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      salePrice: p.salePrice,
      qty: quantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`${p.name} added to cart`);
}

async function loadProducts() {
  try {
    const res = await fetch('/data/products.json');
    products = await res.json();
    filterProducts('hoodies');
    updateCartUI();
  } catch (err) {
    console.error(err);
    showToast('Failed to load products');
  }
}

function filterProducts(category) {
  currentCategory = category;
  filteredProducts = products.filter(p => p.category === category);
  renderProducts();
  
  // Update active nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-category') === category) {
      link.classList.add('active');
    }
  });
}

function openProductModal(productId) {
  selectedProduct = products.find(p => p.id === productId);
  selectedSize = null;
  
  if (!selectedProduct) return;
  
  // Populate modal
  document.getElementById('modalTitle').textContent = selectedProduct.name;
  document.getElementById('modalDescription').textContent = selectedProduct.detailedDescription;
  document.getElementById('modalImage').src = selectedProduct.image;
  document.getElementById('modalSalePrice').textContent = `Rs ${selectedProduct.salePrice.toFixed(0)}`;
  document.getElementById('modalOriginalPrice').textContent = `Rs ${selectedProduct.originalPrice.toFixed(0)}`;
  
  const discount = Math.round(((selectedProduct.originalPrice - selectedProduct.salePrice) / selectedProduct.originalPrice) * 100);
  document.getElementById('modalDiscount').textContent = `${discount}% OFF`;
  
  // Populate size options
  const sizeOptions = document.getElementById('sizeOptions');
  sizeOptions.innerHTML = '';
  selectedProduct.sizes.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-btn';
    btn.textContent = size;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = size;
    });
    sizeOptions.appendChild(btn);
  });
  
  // Show modal
  productModal.classList.remove('hidden');
}

function closeProductModal() {
  productModal.classList.add('hidden');
  selectedProduct = null;
  selectedSize = null;
}

function renderProducts() {
  productsEl.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    productsEl.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #666;">No products in this category</div>';
    return;
  }
  
  filteredProducts.forEach(p => {
    const discount = Math.round(((p.originalPrice - p.salePrice) / p.originalPrice) * 100);
    const sizesStr = p.sizes.join(', ');
    
    const article = document.createElement('article');
    article.className = 'card';
    article.style.cursor = 'pointer';
    article.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="card-image">
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="card-pricing">
          <span class="card-price-sale">Rs ${p.salePrice.toFixed(0)}</span>
          <span class="card-price-original">Rs ${p.originalPrice.toFixed(0)}</span>
          <span style="color: var(--accent); font-weight: 600;">${discount}% OFF</span>
        </div>
        <div class="card-sizes">Sizes: ${sizesStr}</div>
        <button data-id="${p.id}" class="card-button">ADD TO CART</button>
      </div>
    `;
    
    // Click anywhere on card to open modal
    article.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-button')) {
        // Open modal for size selection instead of direct add
        openProductModal(p.id);
      } else {
        openProductModal(p.id);
      }
    });
    
    productsEl.appendChild(article);
  });
}

// Event listeners
cartBtn.addEventListener('click', () => {
  window.location.href = '/cart.html';
});

closeCartBtn.addEventListener('click', () => {
  cartEl.classList.add('hidden');
});

// Modal events
closeModalBtn.addEventListener('click', closeProductModal);
modalOverlay.addEventListener('click', closeProductModal);

modalAddToCartBtn.addEventListener('click', () => {
  if (!selectedProduct) return;
  if (!selectedSize) {
    showToast('Please select a size');
    return;
  }
  
  const p = selectedProduct;
  const existing = cart.find(x => x.id === p.id && x.size === selectedSize);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      description: p.description,
      salePrice: p.salePrice,
      originalPrice: p.originalPrice,
      size: selectedSize,
      image: p.image,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`${p.name} (${selectedSize}) added to cart`);
  closeProductModal();
});

// Keyboard close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !productModal.classList.contains('hidden')) {
    closeProductModal();
  }
});

// Navigation filtering
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const category = link.getAttribute('data-category');
    filterProducts(category);
  });
});

checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) {
    showToast('Cart is empty');
    return;
  }
  
  const name = prompt('Enter your name for the order:');
  if (!name) return;
  
  const email = prompt('Enter your email (optional):');
  
  const order = {
    customer: { name, email: email || 'N/A' },
    items: cart
  };
  
  try {
    const res = await fetch('/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    
    const json = await res.json();
    if (json.ok) {
      showToast(`Order #${json.orderId} confirmed!`);
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartUI();
      cartEl.classList.add('hidden');
    } else {
      showToast('Checkout failed. Please try again.');
      console.error(json);
    }
  } catch (err) {
    console.error(err);
    showToast('Checkout error. Please try again.');
  }
});

// Initialize
loadProducts();
