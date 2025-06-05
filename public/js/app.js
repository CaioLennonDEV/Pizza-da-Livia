class App {
  constructor() {
    this.mainContent = document.getElementById('mainContent');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.currentPage = 'home';

    this.init();
  }

  init() {
    // Set up navigation
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.dataset.page);
      });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.loadPage(e.state.page);
      }
    });

    // Load initial page
    const path = window.location.pathname.substring(1) || 'home';
    this.navigateTo(path, true);
  }

  navigateTo(page, replace = false) {
    const method = replace ? 'replaceState' : 'pushState';
    window[method]({ page }, '', `/${page}`);
    this.loadPage(page);
  }

  async loadPage(page) {
    this.currentPage = page;
    this.updateActiveLink();

    // Clear main content
    this.mainContent.innerHTML = '<div class="loading">Carregando...</div>';

    try {
      switch (page) {
        case 'home':
          await this.renderHomePage();
          break;
        case 'menu':
          await this.renderMenuPage();
          break;
        case 'orders':
          if (!auth.currentUser) {
            auth.showLoginModal();
            this.navigateTo('home');
            return;
          }
          await this.renderOrdersPage();
          break;
        case 'profile':
          if (!auth.currentUser) {
            auth.showLoginModal();
            this.navigateTo('home');
            return;
          }
          await this.renderProfilePage();
          break;
        default:
          this.render404Page();
      }
    } catch (error) {
      this.renderErrorPage(error);
    }
  }

  updateActiveLink() {
    this.navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === this.currentPage);
    });
  }

  async renderHomePage() {
    try {
      const featuredProducts = await api.getProducts({ featured: true });
      
      this.mainContent.innerHTML = `
        <section class="hero">
          <div class="hero-content">
            <h1>Pizzaria da Livia</h1>
            <p>A melhor pizza da cidade, feita com amor e ingredientes selecionados</p>
            <button class="btn-primary" onclick="app.navigateTo('menu')">Ver Cardápio</button>
          </div>
        </section>

        <section class="featured">
          <h2>Destaques</h2>
          <div class="products-grid">
            ${featuredProducts.map(product => this.renderProductCard(product)).join('')}
          </div>
        </section>

        <section class="about">
          <div class="about-content">
            <h2>Sobre Nós</h2>
            <p>A Pizzaria da Livia é conhecida por suas deliciosas pizzas artesanais, preparadas com ingredientes frescos e de alta qualidade. Nossa massa é feita diariamente e fermentada naturalmente, resultando em uma pizza leve e saborosa.</p>
          </div>
        </section>
      `;
    } catch (error) {
      this.renderErrorPage(error);
    }
  }

  async renderMenuPage() {
    try {
      const products = await api.getProducts();
      const categories = ['Pizza', 'Bebida', 'Acompanhamento'];
      
      const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = products.filter(p => p.category === category);
        return acc;
      }, {});

      this.mainContent.innerHTML = `
        <section class="menu">
          <h1>Cardápio</h1>
          
          ${categories.map(category => `
            <div class="menu-section">
              <h2>${category}s</h2>
              <div class="products-grid">
                ${productsByCategory[category].map(product => this.renderProductCard(product)).join('')}
              </div>
            </div>
          `).join('')}
        </section>
      `;
    } catch (error) {
      this.renderErrorPage(error);
    }
  }

  async renderOrdersPage() {
    try {
      const orders = await api.getMyOrders();

      this.mainContent.innerHTML = `
        <section class="orders">
          <h1>Meus Pedidos</h1>
          
          ${orders.length === 0 ? `
            <p class="empty-state">Você ainda não fez nenhum pedido</p>
          ` : `
            <div class="orders-list">
              ${orders.map(order => this.renderOrderCard(order)).join('')}
            </div>
          `}
        </section>
      `;
    } catch (error) {
      this.renderErrorPage(error);
    }
  }

  async renderProfilePage() {
    const user = auth.currentUser;

    this.mainContent.innerHTML = `
      <section class="profile">
        <h1>Meu Perfil</h1>
        
        <form id="profileForm" class="form">
          <div class="form-group">
            <label for="profileName">Nome</label>
            <input type="text" id="profileName" value="${user.name}" required>
          </div>
          
          <div class="form-group">
            <label for="profileEmail">Email</label>
            <input type="email" id="profileEmail" value="${user.email}" disabled>
          </div>
          
          <div class="form-group">
            <label for="profilePhone">Telefone</label>
            <input type="tel" id="profilePhone" value="${user.phone}" required>
          </div>
          
          <h2>Endereço</h2>
          
          <div class="form-group">
            <label for="profileStreet">Rua</label>
            <input type="text" id="profileStreet" value="${user.address.street}" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="profileNumber">Número</label>
              <input type="text" id="profileNumber" value="${user.address.number}" required>
            </div>
            
            <div class="form-group">
              <label for="profileComplement">Complemento</label>
              <input type="text" id="profileComplement" value="${user.address.complement || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label for="profileNeighborhood">Bairro</label>
            <input type="text" id="profileNeighborhood" value="${user.address.neighborhood}" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="profileCity">Cidade</label>
              <input type="text" id="profileCity" value="${user.address.city}" required>
            </div>
            
            <div class="form-group">
              <label for="profileState">Estado</label>
              <input type="text" id="profileState" value="${user.address.state}" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="profileZipCode">CEP</label>
            <input type="text" id="profileZipCode" value="${user.address.zipCode}" required>
          </div>
          
          <button type="submit" class="btn-primary">Salvar Alterações</button>
        </form>
        
        <div class="password-section">
          <h2>Alterar Senha</h2>
          
          <form id="passwordForm" class="form">
            <div class="form-group">
              <label for="currentPassword">Senha Atual</label>
              <input type="password" id="currentPassword" required>
            </div>
            
            <div class="form-group">
              <label for="newPassword">Nova Senha</label>
              <input type="password" id="newPassword" required>
            </div>
            
            <button type="submit" class="btn-primary">Alterar Senha</button>
          </form>
        </div>
      </section>
    `;

    // Set up form handlers
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const profileData = {
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        address: {
          street: document.getElementById('profileStreet').value,
          number: document.getElementById('profileNumber').value,
          complement: document.getElementById('profileComplement').value,
          neighborhood: document.getElementById('profileNeighborhood').value,
          city: document.getElementById('profileCity').value,
          state: document.getElementById('profileState').value,
          zipCode: document.getElementById('profileZipCode').value
        }
      };

      try {
        const { user } = await api.updateProfile(profileData);
        auth.setCurrentUser(user);
        showToast('Perfil atualizado com sucesso!', 'success');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const passwordData = {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
      };

      try {
        await api.changePassword(passwordData);
        document.getElementById('passwordForm').reset();
        showToast('Senha alterada com sucesso!', 'success');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  renderProductCard(product) {
    return `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          ${product.category === 'Pizza' ? `
            <div class="sizes">
              ${product.sizes.map(size => `
                <button class="size-btn" onclick="app.addToCart('${product._id}', '${size.name}')">
                  ${size.name} - ${this.formatPrice(size.price)}
                </button>
              `).join('')}
            </div>
          ` : `
            <button class="btn-primary" onclick="app.addToCart('${product._id}')">
              Adicionar - ${this.formatPrice(product.price)}
            </button>
          `}
        </div>
      </div>
    `;
  }

  renderOrderCard(order) {
    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">Pedido #${order._id.slice(-6)}</span>
          <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
          <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
        </div>
        
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <span>${item.quantity}x ${item.product.name}</span>
              ${item.size ? `<span>(${item.size})</span>` : ''}
              <span>${this.formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span>Total:</span>
            <span>${this.formatPrice(order.totalAmount)}</span>
          </div>
          
          ${order.status === 'Pendente' || order.status === 'Confirmado' ? `
            <button class="btn-danger" onclick="app.cancelOrder('${order._id}')">
              Cancelar Pedido
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  render404Page() {
    this.mainContent.innerHTML = `
      <section class="error-page">
        <h1>404</h1>
        <p>Página não encontrada</p>
        <button class="btn-primary" onclick="app.navigateTo('home')">Voltar para o Início</button>
      </section>
    `;
  }

  renderErrorPage(error) {
    this.mainContent.innerHTML = `
      <section class="error-page">
        <h1>Erro</h1>
        <p>${error.message}</p>
        <button class="btn-primary" onclick="window.location.reload()">Tentar Novamente</button>
      </section>
    `;
  }

  formatPrice(price) {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  async addToCart(productId, size = null) {
    try {
      const product = await api.getProduct(productId);
      cart.addItem(product, size);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async cancelOrder(orderId) {
    try {
      await api.cancelOrder(orderId);
      await this.renderOrdersPage();
      showToast('Pedido cancelado com sucesso!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
}

// Initialize app
const app = new App();

// Export for global access
window.app = app;
window.navigateTo = (page) => app.navigateTo(page);
window.getCurrentPage = () => app.currentPage; 