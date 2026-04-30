/* ════════════════════════════════════════════════════════
   ADMIN PANEL JAVASCRIPT - VOID Streetwear
   ════════════════════════════════════════════════════════ */

// Configuración
const API_URL = 'http://localhost:3000/api';
let adminToken = localStorage.getItem('voidAdminToken') || null;

// ════════════════════════════════════════════════════════
// ADMIN LOGIN
// ════════════════════════════════════════════════════════

function openAdminLogin() {
  if (adminToken) {
    openAdminPanel();
    return;
  }
  document.getElementById('adminLoginOverlay').classList.add('open');
  document.getElementById('adminLoginModal').classList.add('open');
}

function closeAdminLogin() {
  document.getElementById('adminLoginOverlay').classList.remove('open');
  document.getElementById('adminLoginModal').classList.remove('open');
  document.getElementById('adminPassword').value = '';
  document.getElementById('adminPasswordErr').classList.remove('show');
}

function submitAdminLogin() {
  const password = document.getElementById('adminPassword').value;

  if (!password) {
    document.getElementById('adminPasswordErr').textContent = 'Contraseña requerida';
    document.getElementById('adminPasswordErr').classList.add('show');
    return;
  }

  fetch(`${API_URL}/auth/login-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      document.getElementById('adminPasswordErr').textContent = data.error;
      document.getElementById('adminPasswordErr').classList.add('show');
    } else {
      adminToken = data.token;
      localStorage.setItem('voidAdminToken', data.token);
      closeAdminLogin();
      openAdminPanel();
      showToast('✓ ACCESO DE ADMINISTRADOR CONCEDIDO');
    }
  })
  .catch(err => {
    document.getElementById('adminPasswordErr').textContent = 'Error de conexión';
    document.getElementById('adminPasswordErr').classList.add('show');
  });
}

function logoutAdmin() {
  adminToken = null;
  localStorage.removeItem('voidAdminToken');
  closeAdminPanel();
  showToast('✓ SESIÓN DE ADMINISTRADOR CERRADA');
}

// ════════════════════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════════════════════

function openAdminPanel() {
  if (!adminToken) {
    openAdminLogin();
    return;
  }
  document.getElementById('adminPanelOverlay').classList.add('open');
  document.getElementById('adminPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  loadDashboard();
}

function closeAdminPanel() {
  document.getElementById('adminPanelOverlay').classList.remove('open');
  document.getElementById('adminPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));

  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`content-${tab}`).classList.add('active');

  if (tab === 'dashboard') loadDashboard();
  if (tab === 'products') loadProducts();
  if (tab === 'orders') loadOrders();
}

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════

function loadDashboard() {
  fetch(`${API_URL}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error(data.error);
      return;
    }
    const s = data.stats;
    document.getElementById('stat-revenue').textContent = `${s.totalRevenue.toFixed(2)}€`;
    document.getElementById('stat-orders').textContent = s.totalOrders;
    document.getElementById('stat-products').textContent = s.totalProducts;
    document.getElementById('stat-pending').textContent = s.pendingOrders;
  })
  .catch(err => console.error('Error loading dashboard:', err));
}

// ════════════════════════════════════════════════════════
// PRODUCTOS
// ════════════════════════════════════════════════════════

let productsList = [];

function loadProducts() {
  fetch(`${API_URL}/products`)
  .then(res => res.json())
  .then(data => {
    productsList = data.products || [];
    renderProductsList();
  })
  .catch(err => console.error('Error loading products:', err));
}

function renderProductsList() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;

  container.innerHTML = productsList.map(p => `
    <div class="admin-product-item">
      <div class="admin-product-img" style="background: var(--gray2);"></div>
      <div class="admin-product-info">
        <h4>${p.name}</h4>
        <p>${p.category} | Stock: ${p.stock}</p>
      </div>
      <div class="admin-product-price">${p.price.toFixed(2)}€</div>
      <div class="admin-product-actions">
        <button class="admin-btn admin-btn-edit" onclick="editProduct(${p.id})">Editar</button>
        <button class="admin-btn admin-btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function showAddProductForm() {
  document.getElementById('productFormTitle').textContent = 'Nuevo Producto';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productCategory').value = 'best_sellers';
  document.getElementById('productStock').value = '';
  document.getElementById('productImages').value = '';
  document.getElementById('productForm').classList.add('active');
}

function editProduct(id) {
  const p = productsList.find(x => x.id === id);
  if (!p) return;

  document.getElementById('productFormTitle').textContent = 'Editar Producto';
  document.getElementById('productId').value = p.id;
  document.getElementById('productName').value = p.name;
  document.getElementById('productDescription').value = p.description || '';
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productStock').value = p.stock;
  document.getElementById('productImages').value = p.images ? p.images.join(', ') : '';
  document.getElementById('productForm').classList.add('active');
}

function saveProduct(e) {
  e.preventDefault();

  const id = document.getElementById('productId').value;
  const product = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    stock: parseInt(document.getElementById('productStock').value) || 0,
    images: document.getElementById('productImages').value.split(',').map(s => s.trim()).filter(s => s),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  };

  const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
  const method = id ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showToast('ERROR: ' + data.error);
    } else {
      showToast(id ? '✓ PRODUCTO ACTUALIZADO' : '✓ PRODUCTO CREADO');
      closeProductForm();
      loadProducts();
    }
  })
  .catch(err => {
    showToast('ERROR: ' + err.message);
  });
}

function closeProductForm() {
  document.getElementById('productForm').classList.remove('active');
}

function deleteProduct(id) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

  fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showToast('ERROR: ' + data.error);
    } else {
      showToast('✓ PRODUCTO ELIMINADO');
      loadProducts();
    }
  })
  .catch(err => {
    showToast('ERROR: ' + err.message);
  });
}

// ════════════════════════════════════════════════════════
// PEDIDOS
// ════════════════════════════════════════════════════════

function loadOrders() {
  fetch(`${API_URL}/orders`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error(data.error);
      return;
    }
    renderOrdersList(data.orders || []);
  })
  .catch(err => console.error('Error loading orders:', err));
}

function renderOrdersList(orders) {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">No hay pedidos aún</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-orders-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>${new Date(o.created_at).toLocaleDateString('es-ES')}</td>
            <td>${o.total.toFixed(2)}€</td>
            <td><span class="admin-status-badge admin-status-${o.status}">${o.status}</span></td>
            <td>
              <select onchange="updateOrderStatus(${o.id}, this.value)" style="background: var(--gray2); border: 1px solid var(--gray3); color: var(--white); font-family: var(--fm); font-size: 8px; padding: 4px 8px;">
                <option value="">Cambiar estado...</option>
                <option value="confirmed">Confirmado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function updateOrderStatus(orderId, status) {
  if (!status) return;

  fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showToast('ERROR: ' + data.error);
    } else {
      showToast('✓ ESTADO ACTUALIZADO');
      loadOrders();
    }
  })
  .catch(err => {
    showToast('ERROR: ' + err.message);
  });
}

// ════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Check if admin is already logged in
  if (localStorage.getItem('voidAdminToken')) {
    adminToken = localStorage.getItem('voidAdminToken');
  }
});
