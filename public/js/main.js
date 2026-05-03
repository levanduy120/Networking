// ============ LOAD SERVICES ============
document.addEventListener('DOMContentLoaded', function() {
  loadServices();
  
  // Form submit
  document.getElementById('ticket-form').addEventListener('submit', createTicket);
});

async function loadServices() {
  try {
    const response = await fetch('/api/services');
    const services = await response.json();
    
    const servicesGrid = document.getElementById('services-grid');
    const serviceSelect = document.getElementById('service_id');
    
    services.forEach(service => {
      // Add to grid
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <div class="icon">🖥️</div>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
      `;
      servicesGrid.appendChild(card);
      
      // Add to select
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name;
      serviceSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

// ============ CREATE TICKET ============
async function createTicket(e) {
  e.preventDefault();
  
  const formData = {
    customer_name: document.getElementById('customer_name').value,
    customer_email: document.getElementById('customer_email').value,
    customer_phone: document.getElementById('customer_phone').value,
    service_id: document.getElementById('service_id').value,
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    priority: document.getElementById('priority').value
  };

  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    const messageDiv = document.getElementById('form-message');
    
    if (response.ok) {
      messageDiv.className = 'form-message success';
      messageDiv.innerHTML = `
        ✅ <strong>Tạo ticket thành công!</strong><br>
        Mã ticket của bạn: <strong>${result.ticket_code}</strong><br>
        Vui lòng lưu mã này để theo dõi
      `;
      document.getElementById('ticket-form').reset();
    } else {
      messageDiv.className = 'form-message error';
      messageDiv.innerHTML = `❌ Lỗi: ${result.error}`;
    }
    
    messageDiv.style.display = 'block';
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
    const messageDiv = document.getElementById('form-message');
    messageDiv.className = 'form-message error';
    messageDiv.innerHTML = '❌ Lỗi kết nối. Vui lòng thử lại!';
    messageDiv.style.display = 'block';
  }
}

// ============ SEARCH TICKET ============
async function searchTicket() {
  const code = document.getElementById('search-code').value.trim();
  
  if (!code) {
    alert('Vui lòng nhập mã ticket');
    return;
  }

  try {
    const response = await fetch(`/api/tickets/search/${code}`);
    const result = await response.json();

    const resultDiv = document.getElementById('ticket-result');

    if (response.ok) {
      const statusClass = `status-${result.status}`;
      resultDiv.innerHTML = `
        <h3>Thông Tin Ticket</h3>
        <div class="result-row">
          <strong>Mã Ticket:</strong>
          <span>${result.ticket_code}</span>
        </div>
        <div class="result-row">
          <strong>Tên Khách Hàng:</strong>
          <span>${result.customer_name}</span>
        </div>
        <div class="result-row">
          <strong>Email:</strong>
          <span>${result.customer_email}</span>
        </div>
        <div class="result-row">
          <strong>Dịch Vụ:</strong>
          <span>${result.service_name}</span>
        </div>
        <div class="result-row">
          <strong>Tiêu Đề:</strong>
          <span>${result.title}</span>
        </div>
        <div class="result-row">
          <strong>Mô Tả:</strong>
          <span>${result.description}</span>
        </div>
        <div class="result-row">
          <strong>Trạng Thái:</strong>
          <span class="${statusClass}">${formatStatus(result.status)}</span>
        </div>
        <div class="result-row">
          <strong>Mức Độ:</strong>
          <span>${formatPriority(result.priority)}</span>
        </div>
        <div class="result-row">
          <strong>Ngày Tạo:</strong>
          <span>${new Date(result.created_at).toLocaleString('vi-VN')}</span>
        </div>
      `;
      resultDiv.style.display = 'block';
    } else {
      resultDiv.innerHTML = `<p style="color: red;">❌ ${result.error}</p>`;
      resultDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi kết nối. Vui lòng thử lại!');
  }
}

// Helper functions
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
    'urgent': '🔴 Cấp bách'
  };
  return priorities[priority] || priority;
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}
