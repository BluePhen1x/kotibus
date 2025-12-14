// Landing Page Authentication

let users = JSON.parse(localStorage.getItem('kotibus_users')) || [];

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

function toggleForm(e) {
  e.preventDefault();
  document.getElementById('loginForm').classList.toggle('active');
  document.getElementById('signupForm').classList.toggle('active');
  
  // Clear form fields
  document.getElementById('loginFormElement').reset();
  document.getElementById('signupFormElement').reset();
}

function hashPassword(password) {
  // Simple hash function (for demo - in production use bcrypt or similar)
  return btoa(password); // Base64 encoding for demo purposes
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Handle Sign Up
document.getElementById('signupFormElement').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!name) {
    showToast('Please enter your name');
    return;
  }

  if (!validateEmail(email)) {
    showToast('Please enter a valid email');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match');
    return;
  }

  // Check if email already exists
  if (users.find(u => u.email === email)) {
    showToast('Email already registered. Please sign in.');
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('kotibus_users', JSON.stringify(users));

  // Auto login
  const userSession = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    isGuest: false
  };
  localStorage.setItem('kotibus_user', JSON.stringify(userSession));

  showToast('Account created successfully!');
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 1500);
});

// Handle Sign In
document.getElementById('loginFormElement').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please enter email and password');
    return;
  }

  const user = users.find(u => u.email === email && u.password === hashPassword(password));

  if (!user) {
    showToast('Invalid email or password');
    return;
  }

  // Create session
  const userSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    isGuest: false
  };
  localStorage.setItem('kotibus_user', JSON.stringify(userSession));

  showToast('Signed in successfully!');
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 1500);
});

// Handle Guest Mode
document.getElementById('guestBtn').addEventListener('click', () => {
  const guestSession = {
    id: 'guest_' + Date.now(),
    name: 'Guest',
    email: null,
    isGuest: true
  };
  localStorage.setItem('kotibus_user', JSON.stringify(guestSession));
  localStorage.setItem('kotibus_guest_mode', 'true');

  showToast('Welcome! Browsing as guest...');
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 1000);
});

// Initialize - check if already logged in
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('kotibus_user'));
  if (currentUser) {
    window.location.href = '/index.html';
  }
});
