let adminToken = null;
let currentTicketId = null;
let allTickets = [];
let sessionWarningTimer = null;

document.addEventListener('DOMContentLoaded', async function() {
  document.getElementById('login-form').addEventListener('submit', adminLogin);
  document.getElementById('filter-status').addEventListener('change', applyTicketFilters);
  document.getElementById('search-ticket').addEventListener('input', applyTicketFilters);

  const savedToken = sessionStorage.getItem('adminToken');
  if (!savedToken) {
    showLoginPanel();
    return;
  }

  adminToken = savedToken;
  const sessionInfo = await validateSession();
  if (!sessionInfo) {
    forceLogout();
    return;
  }

  scheduleSessionWarning(sessionInfo.sessionRemainingMs, sessionInfo.sessionTtlMs);
  showAdminPanel();
  loadDashboard();
});

async function validateSession() {
  try {
    const response = await fetch('/api/admin/me', {
      headers: { 'x-admin-token': adminToken }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
}

function scheduleSessionWarning(remainingMs, ttlMs) {
  clearTimeout(sessionWarningTimer);
  const WARNING_BEFORE_MS = 5 * 60 * 1000;
  const warnIn = remainingMs - WARNING_BEFORE_MS;
  if (warnIn <= 0) {
    showToast('Phiên làm việc sắp hết hạn. Vui lòng lưu công việc!', 'warning');
    return;
  }
  sessionWarningTimer = setTimeout(() => {
    showToast('Phiên làm việc còn khoảng 5 phút. Nhấn bất kỳ thao tác nào để gia hạn.', 'warning');
  }, warnIn);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, type === 'warning' ? 6000 : 3500);
}

async function adminLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok) {
      adminToken = result.token;
      sessionStorage.setItem('adminToken', adminToken);
      showAdminPanel();
      await loadDashboard();
      const sessionInfo = await validateSession();
      if (sessionInfo) scheduleSessionWarning(sessionInfo.sessionRemainingMs, sessionInfo.sessionTtlMs);
      return;
    }

    showToast('Lỗi: ' + result.error, 'error');
  } catch (error) {
    console.error('Login error:', error);
    showToast('Lỗi kết nối!', 'error');
  }
}

function showLoginPanel() {
  document.getElementById('login-panel').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('login-panel').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'flex';
}

function showSection(sectionId, navIndex) {
  ['dashboard', 'tickets-section', 'services-section', 'change-password-section'].forEach(id => {
    document.getElementById(id).style.display = id === sectionId ? 'block' : 'none';
  });

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.nav-item')[navIndex].classList.add('active');
}

function loadDashboard() {
  showDashboard();
}

function showDashboard() {
  showSection('dashboard', 0);
  loadStats();
}

function showTickets() {
  showSection('tickets-section', 1);
  loadAllTickets();
}

function showServices() {
  showSection('services-section', 2);
  loadServicesAdmin();
}

function showChangePassword() {
  showSection('change-password-section', 3);
  document.getElementById('password-message').textContent = '';
  document.getElementById('change-password-form').reset();
}

async function logout() {
  if (!confirm('Bạn chắc chắn muốn đăng xuất?')) {
    return;
  }

  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 'x-admin-token': adminToken }
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  forceLogout();
}

function forceLogout() {
  sessionStorage.removeItem('adminToken');
  clearTimeout(sessionWarningTimer);
  adminToken = null;
  document.getElementById('ticket-modal').style.display = 'none';
  showLoginPanel();
}

async function loadStats() {
  try {
    const tickets = await fetchAdminJson('/api/admin/tickets');
    document.getElementById('total-tickets').textContent = tickets.length;
    document.getElementById('open-tickets').textContent = tickets.filter(t => t.status === 'open').length;
    document.getElementById('inprogress-tickets').textContent = tickets.filter(t => t.status === 'in-progress').length;
    document.getElementById('closed-tickets').textContent = tickets.filter(t => t.status === 'closed').length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadAllTickets() {
  try {
    allTickets = await fetchAdminJson('/api/admin/tickets');
    applyTicketFilters();
  } catch (error) {
    console.error('Error loading tickets:', error);
    showToast('Lỗi tải danh sách tickets!', 'error');
  }
}

function applyTicketFilters() {
  const status = document.getElementById('filter-status').value;
  const keyword = document.getElementById('search-ticket').value.trim().toLowerCase();

  const filtered = allTickets.filter(ticket => {
    const matchesStatus = !status || ticket.status === status;
    const haystack = [
      ticket.ticket_code,
      ticket.customer_name,
      ticket.customer_email,
      ticket.service_name,
      ticket.title
    ].join(' ').toLowerCase();

    return matchesStatus && (!keyword || haystack.includes(keyword));
  });

  displayTickets(filtered);
}

function displayTickets(tickets) {
  const tbody = document.getElementById('tickets-body');
  tbody.innerHTML = '';

  if (tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Không có ticket nào</td></tr>';
    return;
  }

  tickets.forEach(ticket => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${escapeHtml(ticket.ticket_code)}</strong></td>
      <td>${escapeHtml(ticket.customer_name)}</td>
      <td>${escapeHtml(ticket.service_name || 'N/A')}</td>
      <td>${escapeHtml(ticket.title)}</td>
      <td><span class="priority-${ticket.priority}">${formatPriority(ticket.priority)}</span></td>
      <td><span class="badge badge-${ticket.status}">${formatStatus(ticket.status)}</span></td>
      <td>${new Date(ticket.created_at).toLocaleDateString('vi-VN')}</td>
      <td>
        <button class="action-btn btn-view" onclick="viewTicket(${ticket.id})">Xem</button>
        <button class="action-btn btn-delete" onclick="deleteTicketConfirm(${ticket.id})">Xóa</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function viewTicket(ticketId) {
  currentTicketId = ticketId;
  const ticket = allTickets.find(t => t.id === ticketId);

  if (!ticket) {
    alert('Không tìm thấy ticket');
    return;
  }

  displayTicketModal(ticket);
  document.getElementById('ticket-modal').style.display = 'flex';
}

function displayTicketModal(ticket) {
  document.getElementById('detail-code').textContent = ticket.ticket_code;
  document.getElementById('detail-customer').textContent = ticket.customer_name;
  document.getElementById('detail-email').textContent = ticket.customer_email;
  document.getElementById('detail-phone').textContent = ticket.customer_phone || 'N/A';
  document.getElementById('detail-service').textContent = ticket.service_name || 'N/A';
  document.getElementById('detail-title').textContent = ticket.title;
  document.getElementById('detail-description').textContent = ticket.description;
  document.getElementById('detail-priority').textContent = formatPriority(ticket.priority);
  document.getElementById('detail-status').value = ticket.status;
  document.getElementById('detail-created').textContent = new Date(ticket.created_at).toLocaleString('vi-VN');
}

function closeModal() {
  document.getElementById('ticket-modal').style.display = 'none';
  currentTicketId = null;
}

async function updateTicketStatus() {
  const newStatus = document.getElementById('detail-status').value;

  try {
    await fetchAdminJson(`/api/admin/tickets/${currentTicketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    showToast('Cập nhật trạng thái thành công!');
    closeModal();
    await loadAllTickets();
    await loadStats();
  } catch (error) {
    console.error('Update ticket error:', error);
    showToast('Lỗi cập nhật!', 'error');
  }
}

async function deleteTicket() {
  if (!confirm('Bạn chắc chắn muốn xóa ticket này?')) {
    return;
  }

  try {
    await fetchAdminJson(`/api/admin/tickets/${currentTicketId}`, { method: 'DELETE' });
    showToast('Đã xóa ticket thành công!');
    closeModal();
    await loadAllTickets();
    await loadStats();
  } catch (error) {
    console.error('Delete ticket error:', error);
    showToast('Lỗi xóa ticket!', 'error');
  }
}

async function deleteTicketConfirm(ticketId) {
  if (!confirm('Bạn chắc chắn muốn xóa ticket này?')) {
    return;
  }

  try {
    await fetchAdminJson(`/api/admin/tickets/${ticketId}`, { method: 'DELETE' });
    showToast('Đã xóa ticket thành công!');
    await loadAllTickets();
    await loadStats();
  } catch (error) {
    console.error('Delete ticket error:', error);
    showToast('Lỗi xóa ticket!', 'error');
  }
}

async function loadServicesAdmin() {
  const grid = document.getElementById('admin-services-grid');
  const message = document.getElementById('services-message');
  message.textContent = '';
  grid.innerHTML = '<div class="loading">Đang tải dịch vụ...</div>';

  try {
    const services = await fetchAdminJson('/api/admin/services');
    grid.innerHTML = '';

    services.forEach(service => {
      const card = document.createElement('form');
      card.className = 'service-edit-card';
      card.onsubmit = event => updateService(event, service.id);
      card.innerHTML = `
        <div class="service-card-preview">
          <div class="service-icon">🖥️</div>
          <strong>${escapeHtml(service.name)}</strong>
          <span>${escapeHtml(service.description || '')}</span>
        </div>
        <div class="form-group">
          <label for="service-name-${service.id}">Tên dịch vụ</label>
          <input id="service-name-${service.id}" value="${escapeAttribute(service.name)}" required>
        </div>
        <div class="form-group">
          <label for="service-description-${service.id}">Mô tả</label>
          <textarea id="service-description-${service.id}" rows="3" required>${escapeHtml(service.description || '')}</textarea>
        </div>
        <button type="submit" class="btn-primary">Lưu dịch vụ</button>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Load services error:', error);
    grid.innerHTML = '';
    message.textContent = 'Không tải được danh sách dịch vụ.';
    message.className = 'admin-message error';
  }
}

async function updateService(event, serviceId) {
  event.preventDefault();

  const name = document.getElementById(`service-name-${serviceId}`).value;
  const description = document.getElementById(`service-description-${serviceId}`).value;
  const message = document.getElementById('services-message');

  try {
    await fetchAdminJson(`/api/admin/services/${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, icon: 'desktop' })
    });

    showToast('Đã cập nhật dịch vụ thành công!');
    await loadServicesAdmin();
  } catch (error) {
    console.error('Update service error:', error);
    showToast('Lỗi cập nhật dịch vụ: ' + (error.message || ''), 'error');
  }
}

async function changePassword(e) {
  e.preventDefault();

  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const messageDiv = document.getElementById('password-message');

  if (newPassword !== confirmPassword) {
    messageDiv.innerHTML = '<span class="message-error">Mật khẩu xác nhận không trùng khớp.</span>';
    return;
  }

  if (newPassword.length < 8) {
    messageDiv.innerHTML = '<span class="message-error">Mật khẩu phải có ít nhất 8 ký tự.</span>';
    return;
  }

  try {
    const result = await fetchAdminJson('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword
      })
    });

    messageDiv.innerHTML = `<span class="message-success">${escapeHtml(result.message)}</span>`;
    document.getElementById('change-password-form').reset();

    setTimeout(() => {
      alert('Mật khẩu đã được đổi. Vui lòng đăng nhập lại.');
      forceLogout();
    }, 1200);
  } catch (error) {
    console.error('Change password error:', error);
    messageDiv.innerHTML = `<span class="message-error">${escapeHtml(error.message || 'Lỗi kết nối!')}</span>`;
  }
}

async function fetchAdminJson(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'x-admin-token': adminToken
  };

  const response = await fetch(url, { ...options, headers });
  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    forceLogout();
    throw new Error('Phiên đăng nhập hết hạn');
  }

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }

  if (result.sessionTtlMs && result.sessionRemainingMs) {
    scheduleSessionWarning(result.sessionRemainingMs, result.sessionTtlMs);
  }

  return result;
}

function formatStatus(status) {
  const statuses = {
    open: 'Mở',
    'in-progress': 'Đang xử lý',
    closed: 'Đóng'
  };
  return statuses[status] || status;
}

function formatPriority(priority) {
  const priorities = {
    low: 'Thấp',
    medium: 'Bình thường',
    high: 'Cao',
    urgent: 'Cấp bách'
  };
  return priorities[priority] || priority;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}
