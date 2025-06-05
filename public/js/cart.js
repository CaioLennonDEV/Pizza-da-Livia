class CartManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.cartModal = document.getElementById('cartModal');
    this.cartButton = document.getElementById('cartButton');
    this.cartItems = document.getElementById('cartItems');
    this.cartSubtotal = document.getElementById('cartSubtotal');
    this.cartTotal = document.getElementById('cartTotal');
    this.checkoutButton = document.getElementById('checkoutButton');
    this.closeButtons = document.querySelectorAll('.close');
    this.deliveryFee = 5; // Taxa de entrega fixa

    this.init();
  }

  init() {
    this.updateCartCount();
    this.cartButton.addEventListener('click', () => this.showCartModal());
    this.checkoutButton.addEventListener('click', () => this.checkout());
    
    this.closeButtons.forEach(button => {
      button.addEventListener('click', () => this.hideCartModal());
    });

    window.addEventListener('click', (e) => {
      if (e.target === this.cartModal) {
        this.hideCartModal();
      }
    });
  }

  addItem(product, size = null, quantity = 1, observations = '') {
    const existingItemIndex = this.items.findIndex(item => 
      item.product._id === product._id && 
      ((!size && !item.size) || (size && item.size === size))
    );

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity;
    } else {
      this.items.push({
        product,
        size,
        quantity,
        observations,
        price: size ? product.sizes.find(s => s.name === size).price : product.price
      });
    }

    this.saveCart();
    this.updateCartCount();
    showToast('Item adicionado ao carrinho!', 'success');
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  updateQuantity(index, quantity) {
    if (quantity < 1) return;
    
    this.items[index].quantity = quantity;
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateCartCount() {
    const count = this.items.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
  }

  calculateSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  calculateTotal() {
    return this.calculateSubtotal() + this.deliveryFee;
  }

  formatPrice(price) {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  showCartModal() {
    this.renderCartItems();
    this.cartModal.style.display = 'block';
  }

  hideCartModal() {
    this.cartModal.style.display = 'none';
  }

  renderCartItems() {
    this.cartItems.innerHTML = '';

    if (this.items.length === 0) {
      this.cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
      this.checkoutButton.disabled = true;
    } else {
      this.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
          <div class="cart-item-info">
            <h3>${item.product.name}</h3>
            ${item.size ? `<p>Tamanho: ${item.size}</p>` : ''}
            ${item.observations ? `<p>Observações: ${item.observations}</p>` : ''}
            <p>Preço: ${this.formatPrice(item.price)}</p>
          </div>
          <div class="cart-item-actions">
            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
            <button class="remove-btn" onclick="cart.removeItem(${index})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        this.cartItems.appendChild(itemElement);
      });

      this.checkoutButton.disabled = false;
    }

    const subtotal = this.calculateSubtotal();
    const total = this.calculateTotal();

    this.cartSubtotal.textContent = this.formatPrice(subtotal);
    this.cartTotal.textContent = this.formatPrice(total);
  }

  async checkout() {
    if (!auth.currentUser) {
      auth.showLoginModal();
      showToast('Faça login para continuar com o pedido', 'info');
      return;
    }

    try {
      const orderData = {
        items: this.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          observations: item.observations
        })),
        deliveryAddress: auth.currentUser.address,
        totalAmount: this.calculateTotal(),
        deliveryFee: this.deliveryFee,
        paymentMethod: 'Dinheiro' // Implementar seleção de método de pagamento
      };

      const order = await api.createOrder(orderData);
      this.clearCart();
      this.hideCartModal();
      showToast('Pedido realizado com sucesso!', 'success');
      navigateTo('orders');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
}

// Initialize cart manager
const cart = new CartManager(); 