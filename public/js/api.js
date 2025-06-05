const API_URL = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Algo deu errado');
    }

    return data;
  }

  // Auth
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });

    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });

    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/products?${queryString}`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getProduct(id) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Orders
  async createOrder(orderData) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData)
    });

    return this.handleResponse(response);
  }

  async getMyOrders() {
    const response = await fetch(`${API_URL}/orders/my-orders`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getOrder(id) {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async cancelOrder(id) {
    const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // User Profile
  async updateProfile(profileData) {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData)
    });

    return this.handleResponse(response);
  }

  async changePassword(passwordData) {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData)
    });

    return this.handleResponse(response);
  }

  // Admin
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/orders?${queryString}`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async updateOrderStatus(id, status) {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });

    return this.handleResponse(response);
  }

  async createProduct(productData) {
    const formData = new FormData();
    
    for (const key in productData) {
      if (key === 'sizes' || key === 'ingredients') {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    }

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  async updateProduct(id, productData) {
    const formData = new FormData();
    
    for (const key in productData) {
      if (key === 'sizes' || key === 'ingredients') {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  async deleteProduct(id) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }
}

const api = new ApiService(); 