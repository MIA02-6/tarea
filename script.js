// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Simple contact form handler (existing behavior)
  const contactForm = document.querySelector('#contacto form');
  if(contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Gracias por tu mensaje. Nos pondremos en contacto pronto.');
      contactForm.reset();
    });
  }

  // Cart logic
  const cartKey = 'laRotiseria_cart_v1';
  let cart = JSON.parse(localStorage.getItem(cartKey) || '{}'); // {id: {id,name,price,qty}}

  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

  const cartCanvas = new bootstrap.Offcanvas(document.getElementById('cartCanvas'));

  function saveCart(){
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
  }

  function renderCart(){
    // update badge count
    const qty = Object.values(cart).reduce((s, p) => s + p.qty, 0);
    cartCount.textContent = qty;
    if(qty === 0) cartCount.style.display = 'none'; else cartCount.style.display = 'inline-block';

    // render items
    cartItemsEl.innerHTML = '';
    let total = 0;
    if(qty === 0){
      cartItemsEl.innerHTML = '<p class="text-muted">Tu carrito está vacío.</p>';
      cartTotalEl.textContent = 'CLP$ 0';
      return;
    }
    for(const id in cart){
      const item = cart[id];
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      const subtotal = item.price * item.qty;
      total += subtotal;
      itemEl.innerHTML = `
        <div class="d-flex justify-content-between">
          <div>
            <strong>${item.name}</strong>
            <div class="text-muted">CLP$ ${numberWithSeparators(item.price)}</div>
          </div>
          <div class="text-end">
            <div class="item-controls mb-1">
              <button class="btn btn-sm btn-outline-secondary decrease" data-id="${id}">-</button>
              <span class="mx-2">${item.qty}</span>
              <button class="btn btn-sm btn-outline-secondary increase" data-id="${id}">+</button>
            </div>
            <div><small>Subtotal: CLP$ ${numberWithSeparators(subtotal)}</small></div>
            <div class="mt-1"><button class="btn btn-sm btn-danger remove-item" data-id="${id}">Eliminar</button></div>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(itemEl);
    }
    cartTotalEl.textContent = 'CLP$ ' + numberWithSeparators(total);
  }

  function numberWithSeparators(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);
      if(cart[id]){
        cart[id].qty += 1;
      } else {
        cart[id] = {id, name, price, qty: 1};
      }
      saveCart();
      // show offcanvas
      cartCanvas.show();
    });
  });

  // Cart interactions delegated
  cartItemsEl.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if(e.target.matches('.increase')){
      cart[id].qty += 1;
      saveCart();
    } else if(e.target.matches('.decrease')){
      cart[id].qty -= 1;
      if(cart[id].qty <= 0) delete cart[id];
      saveCart();
    } else if(e.target.matches('.remove-item')){
      delete cart[id];
      saveCart();
    }
  });

  clearCartBtn.addEventListener('click', () => {
    if(confirm('¿Vaciar el carrito?')){
      cart = {};
      saveCart();
    }
  });

  checkoutBtn.addEventListener('click', () => {
    if(Object.keys(cart).length === 0){
      alert('Tu carrito está vacío.');
      return;
    }
    // For demo purposes we only show an order summary and then clear cart
    let summary = 'Resumen de tu pedido:\n\n';
    let total = 0;
    for(const id in cart){
      const it = cart[id];
      summary += `${it.name} x${it.qty} - CLP$ ${numberWithSeparators(it.price * it.qty)}\n`;
      total += it.price * it.qty;
    }
    summary += `\nTotal: CLP$ ${numberWithSeparators(total)}\n\nGracias por tu compra (demo).`;
    alert(summary);
    cart = {};
    saveCart();
    cartCanvas.hide();
  });

  // Show cart on button
  cartBtn.addEventListener('click', () => {
    cartCanvas.show();
    renderCart();
  });

  // initialize render
  renderCart();

  // Simple login (client-side demo)
  const loginBtn = document.getElementById('loginBtn');
  const loginModalEl = document.getElementById('loginModal');
  const loginModal = new bootstrap.Modal(loginModalEl);
  const loginForm = document.getElementById('loginForm');
  const userInput = document.getElementById('userInput');

  function updateLoginUI(){
    const user = localStorage.getItem('laRotiseria_user');
    if(user){
      loginBtn.textContent = user + ' • Cerrar';
      loginBtn.classList.remove('btn-warning');
      loginBtn.classList.add('btn-outline-secondary');
    } else {
      loginBtn.textContent = 'Iniciar Sesión';
      loginBtn.classList.remove('btn-outline-secondary');
      loginBtn.classList.add('btn-warning');
    }
  }

  loginBtn.addEventListener('click', () => {
    const user = localStorage.getItem('laRotiseria_user');
    if(user){
      // log out
      if(confirm('¿Cerrar sesión?')){
        localStorage.removeItem('laRotiseria_user');
        updateLoginUI();
      }
    } else {
      loginModal.show();
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = userInput.value.trim();
    const password = document.getElementById('passInput').value;
    // Demo: hardcoded credential: cliente / 1234
    if((username === 'cliente' && password === '1234') || username.length > 2){
      localStorage.setItem('laRotiseria_user', username);
      updateLoginUI();
      loginModal.hide();
      alert('Bienvenido ' + username + '! (demo)');
    } else {
      alert('Credenciales inválidas (demo). Usa cliente / 1234 o cualquier usuario con más de 2 caracteres.');
    }
    loginForm.reset();
  });

  updateLoginUI();
});
