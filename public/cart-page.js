// Cart Page JavaScript

let currentUser = JSON.parse(localStorage.getItem('kotibus_user'));

document.addEventListener('DOMContentLoaded', () => {
  loadCartPage();
  setupEventListeners();
  updateUserUI();
});

function updateUserUI() {
  const userSection = document.getElementById('userSection');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userName = document.getElementById('userName');
  
  if (currentUser && !currentUser.isGuest) {
    // Show user section
    userSection.classList.remove('hidden');
    loginBtn.style.display = 'none';
    userName.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
  } else if (currentUser && currentUser.isGuest) {
    // Show guest info
    userSection.classList.remove('hidden');
    loginBtn.style.display = 'none';
    userName.textContent = 'Guest Mode';
  } else {
    // Show login button
    userSection.classList.add('hidden');
    loginBtn.style.display = 'block';
  }
}

function loadCartPage() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountSpan = document.getElementById('cart-count');
  cartCountSpan.textContent = cart.length;

  if (cart.length === 0) {
    document.getElementById('cartItemsContainer').classList.add('hidden');
    document.getElementById('emptyCartMessage').classList.remove('hidden');
    document.getElementById('checkout-btn').disabled = true;
  } else {
    document.getElementById('emptyCartMessage').classList.add('hidden');
    document.getElementById('cartItemsContainer').classList.remove('hidden');
    renderCartItems(cart);
    calculateOrderSummary(cart);
  }
}

function renderCartItems(cart) {
  const container = document.getElementById('cartItemsContainer');
  container.innerHTML = '';

  cart.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item-card';
    itemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p class="item-size">Size: <strong>${item.size}</strong></p>
        <div class="item-pricing">
          <span class="item-price">Rs ${item.salePrice}</span>
          <span class="item-original">Rs ${item.originalPrice}</span>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-selector">
          <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" readonly>
          <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    container.appendChild(itemElement);
  });
}

function increaseQuantity(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart[index]) {
    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartPage();
    showToast('Quantity updated');
  }
}

function decreaseQuantity(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart[index] && cart[index].quantity > 1) {
    cart[index].quantity -= 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartPage();
    showToast('Quantity updated');
  }
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const removedItem = cart[index];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartPage();
  showToast(`${removedItem.name} removed from cart`);
}

function calculateOrderSummary(cart) {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.salePrice * item.quantity;
  });

  // Apply shipping fee for guest users
  const isGuest = currentUser && currentUser.isGuest;
  const shipping = isGuest ? 150 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + shipping + tax;

  document.getElementById('subtotal').textContent = `Rs ${subtotal.toFixed(2)}`;
  document.getElementById('shipping').textContent = isGuest ? `Rs ${shipping}` : 'FREE';
  document.getElementById('tax').textContent = `Rs ${tax.toFixed(2)}`;
  document.getElementById('total-price').textContent = `Rs ${total.toFixed(2)}`;
}

function setupEventListeners() {
  document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
  document.getElementById('cart-btn').addEventListener('click', () => {
    window.location.href = '/cart.html';
  });
}

function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    showToast('Your cart is empty');
    return;
  }

  // Check if user is guest
  const isGuest = currentUser && currentUser.isGuest;
  if (isGuest) {
    const response = confirm('You are checking out as a guest. Guest checkouts include Rs 150 shipping fee.\n\nWould you like to sign in first for free shipping?');
    if (response) {
      window.location.href = '/landing.html';
      return;
    }
  }

  // Prompt for customer details
  const name = prompt('Enter your full name:');
  if (!name) return;

  const email = prompt('Enter your email:');
  if (!email) return;

  // Create order object
  const order = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    customer: { name, email },
    items: cart
  };

  // Send to server
  fetch('/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  })
    .then(res => res.json())
    .then(data => {
      localStorage.removeItem('cart');
      showToast('Order placed successfully!');
      setTimeout(() => {
        alert(`Order ID: ${data.orderId}\n\nThank you for your purchase!`);
        window.location.href = '/';
      }, 1500);
    })
    .catch(err => {
      console.error('Checkout error:', err);
      showToast('Error placing order. Please try again.');
    });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('kotibus_user');
    localStorage.removeItem('kotibus_guest_mode');
    showToast('Logged out successfully');
    setTimeout(() => {
      window.location.href = '/landing.html';
    }, 1000);
  });
}

// Login Handler
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = '/landing.html';
  });
}
