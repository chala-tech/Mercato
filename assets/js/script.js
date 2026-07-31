document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCart();
  initProductFilter();
  initStarPicker();
  initFormValidation();
});

/* MOBILE NAV TOGGLE */
function initMobileNav() {
  const toggleBtn = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav__links--open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });
}

/* CART */
function initCart() {
  const cartToggle = document.getElementById('cartToggle');
  const cartPanel = document.getElementById('cartPanel');
  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const addButtons = document.querySelectorAll('.btn-add-cart');

  if (!cartToggle && addButtons.length === 0) return;

  const CART_KEY = 'mercato_cart';
  let cart = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    if (!cartCountEl) return;

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalQty;

    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<li class="cart-items__empty">Your cart is empty.</li>';
    } else {
      cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <span>${item.name} × ${item.qty}</span>
          <span>
            ETB ${(item.price * item.qty).toLocaleString()}
            <button class="cart-item__remove" data-index="${index}" aria-label="Remove ${item.name}">✕</button>
          </span>
        `;
        cartItemsEl.appendChild(li);
      });
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (cartTotalEl) cartTotalEl.textContent = `ETB ${total.toLocaleString()}`;
  }

  addButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card.querySelector('.product-card__name').textContent.trim();
      const priceText = card.querySelector('.product-card__price').textContent;
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

      const existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      saveCart();

      const originalText = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => (btn.textContent = originalText), 900);
    });
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('cart-item__remove')) return;
      const index = Number(e.target.dataset.index);
      cart.splice(index, 1);
      saveCart();
    });
  }

  if (cartToggle && cartPanel) {
    cartToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      cartPanel.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!cartPanel.contains(e.target) && e.target !== cartToggle) {
        cartPanel.classList.add('hidden');
      }
    });
  }

  renderCart();
}

/* PRODUCT FILTER / SEARCH */
function initProductFilter() {
  const categorySelect = document.getElementById('filterCategory');
  const searchInput = document.getElementById('filterSearch');
  const searchButton = document.getElementById('filterButton');
  const grid = document.getElementById('productGrid');
  const noResults = document.getElementById('noResults');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));

  function applyFilter() {
    const category = categorySelect ? categorySelect.value : 'all';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const name = card.querySelector('.product-card__name').textContent.toLowerCase();
      const matchesSearch = name.includes(query);

      const show = matchesCategory && matchesSearch;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount += 1;
    });

    if (noResults) {
      noResults.classList.toggle('hidden', visibleCount !== 0);
    }
  }

  if (categorySelect) categorySelect.addEventListener('change', applyFilter);
  if (searchButton) searchButton.addEventListener('click', applyFilter);
  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilter();
      }
    });
  }
}

/* STAR RATING PICKER */
function initStarPicker() {
  const picker = document.getElementById('starPicker');
  const ratingInput = document.getElementById('review-rating');
  if (!picker || !ratingInput) return;

  const stars = Array.from(picker.querySelectorAll('.star-picker__star'));

  function paint(rating) {
    stars.forEach((star) => {
      star.classList.toggle('is-filled', Number(star.dataset.value) <= rating);
    });
  }

  paint(Number(ratingInput.value));

  stars.forEach((star) => {
    star.addEventListener('mouseenter', () => paint(Number(star.dataset.value)));
    star.addEventListener('click', () => {
      ratingInput.value = star.dataset.value;
      paint(Number(star.dataset.value));
    });
  });

  picker.addEventListener('mouseleave', () => paint(Number(ratingInput.value)));
}

/* FORM VALIDATION */
function initFormValidation() {
  validateLoginForm();
  validateSignupForm();
  validateReviewForm();
}

function showError(input, message) {
  input.classList.add('input-error');
  const errorEl = document.getElementById(`${input.id}-error`);
  if (errorEl) errorEl.textContent = message;
}

function clearError(input) {
  input.classList.remove('input-error');
  const errorEl = document.getElementById(`${input.id}-error`);
  if (errorEl) errorEl.textContent = '';
}

function validateLoginForm() {
  const form = document.querySelector('.auth-form');
  const isLoginPage = document.title.toLowerCase().includes('log in');
  if (!form || !isLoginPage) return;

  const username = document.getElementById('username');
  const password = document.getElementById('password');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!username.value.trim()) {
      showError(username, 'Please enter your username.');
      valid = false;
    } else {
      clearError(username);
    }

    if (!password.value) {
      showError(password, 'Please enter your password.');
      valid = false;
    } else {
      clearError(password);
    }

    if (valid) {
      alert('Logged in! (this is a front-end demo — no backend is connected yet)');
      form.reset();
    }
  });
}

function validateSignupForm() {
  const form = document.querySelector('.auth-form');
  const isSignupPage = document.title.toLowerCase().includes('sign up');
  if (!form || !isSignupPage) return;

  const username = document.getElementById('username');
  const email = document.getElementById('email');
  const password = document.getElementById('password');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!username.value.trim()) {
      showError(username, 'Please choose a username.');
      valid = false;
    } else {
      clearError(username);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(email);
    }

    if (password.value.length < 8) {
      showError(password, 'Password must be at least 8 characters.');
      valid = false;
    } else {
      clearError(password);
    }

    if (valid) {
      alert('Account created! (this is a front-end demo — no backend is connected yet)');
      form.reset();
    }
  });
}

function validateReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  const name = document.getElementById('review-name');
  const comment = document.getElementById('review-comment');
  const successMsg = document.getElementById('reviewSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!name.value.trim()) {
      showError(name, 'Please enter your name.');
      valid = false;
    } else {
      clearError(name);
    }

    if (!comment.value.trim()) {
      showError(comment, 'Please write a short review.');
      valid = false;
    } else {
      clearError(comment);
    }

    if (valid) {
      if (successMsg) {
        successMsg.classList.remove('hidden');
        setTimeout(() => successMsg.classList.add('hidden'), 3000);
      }
      form.reset();
      const ratingInput = document.getElementById('review-rating');
      if (ratingInput) {
        ratingInput.value = 5;
        document.getElementById('starPicker')
          ?.dispatchEvent(new Event('mouseleave'));
      }
    }
  });
}