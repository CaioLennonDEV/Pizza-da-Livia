class AuthManager {
  constructor() {
    this.currentUser = null;
    this.loginModal = document.getElementById('loginModal');
    this.loginForm = document.getElementById('loginForm');
    this.registerForm = document.getElementById('registerForm');
    this.loginButton = document.getElementById('loginButton');
    this.authTabs = document.querySelectorAll('.auth-tab');
    this.closeButtons = document.querySelectorAll('.close');

    this.init();
  }

  init() {
    // Check if user is already logged in
    this.checkAuth();

    // Event Listeners
    this.loginButton.addEventListener('click', () => this.showLoginModal());
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    
    this.authTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    this.closeButtons.forEach(button => {
      button.addEventListener('click', () => this.hideLoginModal());
    });

    window.addEventListener('click', (e) => {
      if (e.target === this.loginModal) {
        this.hideLoginModal();
      }
    });
  }

  async checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { user } = await api.getCurrentUser();
        this.setCurrentUser(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  showLoginModal() {
    this.loginModal.style.display = 'block';
  }

  hideLoginModal() {
    this.loginModal.style.display = 'none';
    this.loginForm.reset();
    this.registerForm.reset();
    this.switchTab('login');
  }

  switchTab(tab) {
    this.authTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.toggle('hidden', form.id !== `${tab}Form`);
    });
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const { user } = await api.login(email, password);
      this.setCurrentUser(user);
      this.hideLoginModal();
      showToast('Login realizado com sucesso!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const userData = {
      name: document.getElementById('registerName').value,
      email: document.getElementById('registerEmail').value,
      password: document.getElementById('registerPassword').value,
      phone: document.getElementById('registerPhone').value,
      address: {
        street: document.getElementById('registerStreet').value,
        number: document.getElementById('registerNumber').value,
        complement: document.getElementById('registerComplement').value,
        neighborhood: document.getElementById('registerNeighborhood').value,
        city: document.getElementById('registerCity').value,
        state: document.getElementById('registerState').value,
        zipCode: document.getElementById('registerZipCode').value
      }
    };

    try {
      const { user } = await api.register(userData);
      this.setCurrentUser(user);
      this.hideLoginModal();
      showToast('Cadastro realizado com sucesso!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.updateUI();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('userChanged', { detail: user }));
  }

  updateUI() {
    const loginButton = document.getElementById('loginButton');
    const profileLink = document.getElementById('profileLink');

    if (this.currentUser) {
      loginButton.textContent = 'Sair';
      loginButton.onclick = () => this.logout();
      profileLink.style.display = 'block';
    } else {
      loginButton.textContent = 'Entrar';
      loginButton.onclick = () => this.showLoginModal();
      profileLink.style.display = 'none';
    }
  }

  logout() {
    api.clearToken();
    this.setCurrentUser(null);
    showToast('Logout realizado com sucesso!', 'success');
    
    // Redirect to home if on protected page
    const protectedPages = ['profile', 'orders'];
    const currentPage = getCurrentPage();
    if (protectedPages.includes(currentPage)) {
      navigateTo('home');
    }
  }
}

// Toast notification function
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize auth manager
const auth = new AuthManager(); 