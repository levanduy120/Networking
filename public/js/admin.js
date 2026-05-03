// ============ GLOBAL VARIABLES ============
let adminToken = null;
let currentTicketId = null;
let allTickets = [];

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Admin panel initializing...');
  const savedToken = localStorage.getItem('adminToken');
  console.log('📝 Saved token:', savedToken);
  
  if (savedToken) {
    adminToken = savedToken;
    console.log('✅ Token found, showing admin panel');
    showAdminPanel();
    loadDashboard();
  } else {
    console.log('❌ No token, showing login');
    showLoginPanel();
    document.getElementById('login-form').addEventListener('submit', adminLogin);
  }
});

// ============ LOGIN ============
async function adminLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  console.log('🔐 Logging in with:', username);

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    console.log('📤 Login response:', result);

    if (response.ok) {
      console.log('✅ Login thành công, token:', result.token);
      adminToken = result.token;
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminUsername', username);
      console.log('✅ Token saved to localStorage');
      showAdminPanel();
      await loadDashboard();
      await loadAllTickets();
    } else {
      alert('Lỗi: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi kết nối!');
  }
}

// ============ UI FUNCTIONS ============
function showLoginPanel() {
  document.getElementById('login-panel').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('login-panel').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'flex';
}

function loadDashboard() {
  showDashboard();
}

function showDashboard() {
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('tickets-section').style.display = 'none';
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.nav-item')[0].classList.add('active');
  
  loadStats();
}

function showTickets() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('tickets-section').style.display = 'block';
  document.getElementById('change-password-section').style.display = 'none';
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.nav-item')[1].classList.add('active');

  loadAllTickets();
}

function showChangePassword() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('tickets-section').style.display = 'none';
  document.getElementById('change-password-section').style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.nav-item')[2].classList.add('active');
  document.getElementById('password-message').textContent = '';
  document.getElementById('change-password-form').reset();
}

function logout() {
  if (confirm('Bạn chắc chứn muốn đăng xuất?')) {
    localStorage.removeItem('adminToken');
    adminToken = null;
    document.getElementById('ticket-modal').style.display = 'none';
    location.reload();
  }
}

// ============ DASHBOARD ============
async function loadStats() {
  console.log('📊 Loading stats...');
  try {
    const response = await fetch('/api/admin/tickets', {
      headers: {
        'x-admin-token': adminToken
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('❌ Error response:', response.status);
      alert('Không có quyền truy cập!');
      logout();
      return;
    }

    const tickets = await response.json();
    console.log('✅ Tickets loaded:', tickets.length);

    const totalCount = tickets.length;
    const openCount = tickets.filter(t => t.status === 'open').length;
    const closedCount = tickets.filter(t => t.status === 'closed').length;

    document.getElementById('total-tickets').textContent = totalCount;
    document.getElementById('open-tickets').textContent = openCount;
    document.getElementById('closed-tickets').textContent = closedCount;
  } catch (error) {
    console.error('❌ Error loading stats:', error);
  }
}

// ============ TICKETS MANAGEMENT ============
async function loadAllTickets() {
  console.log('🎫 Loading all tickets...');
  try {
    const response = await fetch('/api/admin/tickets', {
      headers: {
        'x-admin-token': adminToken
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('❌ Error:', response.status);
      alert('Không có quyền truy cập!');
      logout();
      return;
    }

    const tickets = await response.json();
    console.log('✅ Tickets received:', tickets);
    allTickets = tickets;
    displayTickets(tickets);
  } catch (error) {
    console.error('❌ Error loading tickets:', error);
    alert('Lỗi tải danh sách tickets!');
  }
}

function displayTickets(tickets) {
  const tbody = document.getElementById('tickets-body');
  tbody.innerHTML = '';

  console.log('📋 Displaying', tickets.length, 'tickets');

  if (tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Không có ticket nào</td></tr>';
    return;
  }

  tickets.forEach(ticket => {
    console.log('Adding ticket:', ticket);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${ticket.ticket_code}</strong></td>
      <td>${ticket.customer_name}</td>
      <td>${ticket.service_name || 'N/A'}</td>
      <td>${ticket.title}</td>
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
  console.log('👁️ Viewing ticket:', ticketId);
  currentTicketId = ticketId;

  const ticket = allTickets.find(t => t.id === ticketId);
  if (ticket) {
    displayTicketModal(ticket);
    document.getElementById('ticket-modal').style.display = 'flex';
  } else {
    alert('Không tìm thấy ticket');
  }
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
  console.log('🔄 Updating ticket', currentTicketId, 'to status:', newStatus);

  try {
    const response = await fetch(`/api/admin/tickets/${currentTicketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      alert('✅ Cập nhật thành công!');
      closeModal();
      await loadAllTickets();
    } else {
      alert('Lỗi cập nhật!');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi kết nối!');
  }
}

async function deleteTicket() {
  if (!confirm('Bạn chắc chắn muốn xóa ticket này?')) {
    return;
  }

  console.log('🗑️ Deleting ticket:', currentTicketId);

  try {
    const response = await fetch(`/api/admin/tickets/${currentTicketId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-token': adminToken
      }
    });

    if (response.ok) {
      alert('✅ Xóa thành công!');
      closeModal();
      await loadAllTickets();
    } else {
      alert('Lỗi xóa!');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi kết nối!');
  }
}

function deleteTicketConfirm(ticketId) {
  if (!confirm('Bạn chắc chắn muốn xóa ticket này?')) {
    return;
  }

  console.log('🗑️ Deleting ticket from list:', ticketId);

  fetch(`/api/admin/tickets/${ticketId}`, {
    method: 'DELETE',
    headers: {
      'x-admin-token': adminToken
    }
  }).then(response => {
    if (response.ok) {
      alert('✅ Xóa thành công!');
      loadAllTickets();
    } else {
      alert('Lỗi xóa!');
    }
  });
}

// ============ HELPERS ============
function formatStatus(status) {
  const statuses = {
    'open': 'Mở',
    'in-progress': 'Đang xử lý',
    'closed': 'Đóng'
  };
  return statuses[status] || status;
}

function formatPriority(priority) {
  const priorities = {
    'low': '🟢 Thấp',
    'medium': '🟡 Bình thường',
    'high': '🔴 Cao',
    'urgent': '🔴🔴 Cấp bách'
  };
  return priorities[priority] || priority;
}

// ============ CHANGE PASSWORD ============
async function changePassword(e) {
  e.preventDefault();

  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const messageDiv = document.getElementById('password-message');

  if (newPassword !== confirmPassword) {
    messageDiv.innerHTML = '<span style="color: red;">❌ Mật khẩu xác nhận không trùng khớp!</span>';
    return;
  }

  if (newPassword.length < 6) {
    messageDiv.innerHTML = '<span style="color: red;">❌ Mật khẩu phải có ít nhất 6 ký tự!</span>';
    return;
  }

  // Get username from localStorage (from login session)
  const username = localStorage.getItem('adminUsername') || 'admin';

  try {
    const response = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({
        username: username,
        old_password: currentPassword,
        new_password: newPassword
      })
    });

    const result = await response.json();

    if (response.ok) {
      messageDiv.innerHTML = '<span style="color: green;">✅ ' + result.message + '</span>';
      document.getElementById('change-password-form').reset();
      setTimeout(() => {
        alert('Mật khẩu đã được đổi thành công! Vui lòng đăng nhập lại.');
        logout();
      }, 1500);
    } else {
      messageDiv.innerHTML = '<span style="color: red;">❌ Lỗi: ' + result.error + '</span>';
    }
  } catch (error) {
    console.error('Error:', error);
    messageDiv.innerHTML = '<span style="color: red;">❌ Lỗi kết nối!</span>';
  }
}
