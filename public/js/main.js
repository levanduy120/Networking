const learningPaths = [
  {
    title: 'Network Foundation',
    description: 'TCP/IP, subnetting, OSI, mô hình LAN/WAN và cách đọc sơ đồ mạng doanh nghiệp.',
    tags: ['Beginner', '4 tuần', 'Có lab'],
    url: '/network/network-foundation.html'
  },
  {
    title: 'Switching & VLAN',
    description: 'VLAN, trunk, access port, STP, EtherChannel và checklist xử lý lỗi layer 2.',
    tags: ['Core skill', 'Cisco', 'Packet Tracer'],
    url: '/network/switching-vlan.html'
  },
  {
    title: 'Routing & Internet Edge',
    description: 'Static route, OSPF cơ bản, NAT, DHCP, DNS, gateway và mô hình kết nối Internet.',
    tags: ['Junior NE', 'Lab thật', 'Troubleshooting'],
    url: '/network/routing-internet-edge.html'
  },
  {
    title: 'Firewall & VPN Basic',
    description: 'Policy, NAT firewall, site-to-site VPN, remote access VPN và log analysis.',
    tags: ['Security', 'SME', 'Use case'],
    url: '/network/firewall-vpn-basic.html'
  },
  {
    title: 'WiFi & Office Network',
    description: 'Thiết kế WiFi văn phòng, roaming, channel, SSID, VLAN mapping và tối ưu trải nghiệm user.',
    tags: ['Wireless', 'Office', 'Checklist'],
    url: '/network/wifi-office-network.html'
  },
  {
    title: 'IT Support To Network Engineer',
    description: 'Lộ trình chuyển từ helpdesk/sysadmin sang network engineer với kỹ năng cần có khi phỏng vấn.',
    tags: ['Career', 'Mentor', 'Roadmap'],
    url: '/network/it-support-to-network-engineer.html'
  }
];

const courses = [
  {
    title: 'Network căn bản cho người mới',
    description: 'Từ IP, subnet, gateway đến cách kiểm tra kết nối bằng ping, traceroute, ARP, DNS.',
    duration: '8 buổi',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    url: '/courses/network-basic.html'
  },
  {
    title: 'Cấu hình Switch Cisco thực chiến',
    description: 'VLAN, trunk, port-security, STP, EtherChannel và mô hình switch access/distribution.',
    duration: '10 buổi',
    level: 'Core skill',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
    url: '/courses/switch-cisco.html'
  },
  {
    title: 'Firewall, NAT và VPN cơ bản',
    description: 'Hiểu luồng traffic, tạo rule, NAT, phân tích log và dựng VPN site-to-site mẫu.',
    duration: '12 buổi',
    level: 'Security basic',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=900&q=80',
    url: '/courses/firewall-nat-vpn.html'
  },
  {
    title: 'Mentor 1:1 xử lý lab và định hướng đi làm',
    description: 'Kèm riêng theo mục tiêu: lab doanh nghiệp, review cấu hình, định hướng portfolio và phỏng vấn.',
    duration: 'Linh hoạt',
    level: 'Mentor',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    url: '/courses/mentor-1-1.html'
  }
];

const resources = [
  {
    title: 'Checklist chuẩn bị EVE-NG Lab',
    description: 'CPU/RAM, image, network adapter, cloud node, cách đặt tên node và snapshot lab.',
    url: '/resources/eve-ng-prep.html'
  },
  {
    title: 'Template IP Plan cho văn phòng nhỏ',
    description: 'Bảng chia VLAN, subnet, gateway, DHCP scope và ghi chú thiết bị.',
    url: '/resources/ip-plan-template.html'
  },
  {
    title: 'Checklist cấu hình switch mới',
    description: 'Hostname, management IP, VLAN, trunk, backup config và bảo mật cơ bản.',
    url: '/resources/switch-checklist.html'
  },
  {
    title: 'Firewall Change Checklist',
    description: 'Checklist trước/sau khi đổi rule firewall, NAT, VPN để giảm rủi ro downtime.',
    url: '/resources/firewall-change-checklist.html'
  },
  {
    title: 'Mẫu nhật ký troubleshooting',
    description: 'Ghi nhận sự cố, giả thuyết, bước kiểm tra, kết quả và hướng phòng tránh.',
    url: '/resources/troubleshooting-log.html'
  }
];

const eveLabs = [
  {
    title: 'Fortinet Branch Office Firewall',
    vendor: 'Fortinet',
    description: 'Dựng FortiGate làm Internet edge cho chi nhánh: VLAN, policy, NAT, VPN site-to-site.',
    tags: ['FortiGate', 'Firewall', 'VPN'],
    url: '/labs/fortinet-branch-firewall.html'
  },
  {
    title: 'Palo Alto Security Policy Lab',
    vendor: 'Palo Alto',
    description: 'Tạo zone, interface, security policy, NAT và đọc traffic log khi rule bị deny.',
    tags: ['PAN-OS', 'Policy', 'Log'],
    url: '/labs/palo-alto-policy.html'
  },
  {
    title: 'Cisco Campus VLAN & OSPF',
    vendor: 'Cisco',
    description: 'Mô hình core/access switch, VLAN, trunk, inter-VLAN routing và OSPF cơ bản.',
    tags: ['Cisco', 'VLAN', 'OSPF'],
    url: '/labs/cisco-campus.html'
  },
  {
    title: 'MikroTik Small Business Edge',
    vendor: 'MikroTik',
    description: 'RouterOS cho văn phòng nhỏ: DHCP, NAT, firewall filter, VLAN và VPN remote.',
    tags: ['RouterOS', 'NAT', 'VPN'],
    url: '/labs/mikrotik-smb-edge.html'
  },
  {
    title: 'Ruijie Office Switching & WiFi',
    vendor: 'Ruijie',
    description: 'Switch/AP Ruijie cho văn phòng: VLAN, trunk uplink, SSID staff/guest và guest isolation.',
    tags: ['Ruijie', 'WiFi', 'VLAN'],
    url: '/labs/ruijie-office-wifi.html'
  }
];

const testimonials = [
  {
    name: 'Minh Tuấn',
    role: 'IT Support → Junior Network Engineer',
    company: 'Công ty logistics, TP.HCM',
    quote: 'Trước đây tôi chỉ biết cắm dây và restart router. Sau 3 tháng học, tôi đã tự thiết kế VLAN cho văn phòng 80 người, cấu hình FortiGate và viết được tài liệu IP plan bàn giao. Cách dạy theo checklist rất sát với công việc thật.',
    highlight: 'Tự triển khai mạng văn phòng 80 người'
  },
  {
    name: 'Ngọc Hằng',
    role: 'Helpdesk → Network Admin',
    company: 'Retail chain, Hà Nội',
    quote: 'Lab EVE-NG theo từng vendor giúp tôi hiểu sự khác biệt giữa Cisco và Fortinet. Phần mentor 1:1 cho tôi review lại cấu hình sai mà tự mình không nhận ra được. Sau khóa học tôi tự tin hơn nhiều khi phỏng vấn vị trí Network Engineer.',
    highlight: 'Thành công phỏng vấn Network Engineer'
  },
  {
    name: 'Phúc Thịnh',
    role: 'Sinh viên CNTT → Network Intern',
    company: 'MSP, TP.HCM',
    quote: 'Học xong Network Foundation và Switching/VLAN, tôi có đủ kiến thức để bắt đầu thực tập tại công ty IT outsourcing. Checklist sau mỗi bài giúp tôi biết mình cần làm được gì trước khi qua bài tiếp theo — rất rõ ràng.',
    highlight: 'Có thực tập ngay sau 2 tháng học'
  }
];

const paymentSteps = [
  {
    title: '1. Gửi đăng ký',
    description: 'Học viên gửi form ở trang đăng ký học để mô tả mục tiêu và khóa quan tâm.'
  },
  {
    title: '2. Xác nhận lịch học',
    description: 'Hai bên thống nhất lịch học, hình thức học và yêu cầu lab.'
  },
  {
    title: '3. Quét MoMo QR',
    description: 'Chuyển khoản qua MoMo 0813323305 theo nội dung KH [Tên] [SĐT].'
  },
  {
    title: '4. Nhận tài liệu',
    description: 'Sau xác nhận, học viên nhận link lớp, tài liệu, lab guide và nhóm hỗ trợ.'
  }
];

document.addEventListener('DOMContentLoaded', function() {
  renderLearningPaths();
  renderCourses();
  renderLabs();
  renderResources();
  renderPaymentSteps();
  renderTestimonials();
  loadEnterpriseServices();
  loadServices();

  document.querySelectorAll('.js-ticket-form').forEach(form => {
    form.addEventListener('submit', createTicket);
  });

  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

function renderLearningPaths() {
  const grid = document.getElementById('path-grid');
  if (!grid) return;

  grid.innerHTML = learningPaths.map(path => `
    <a class="path-card clickable-card" href="${escapeAttribute(path.url)}">
      <h3>${escapeHtml(path.title)}</h3>
      <p>${escapeHtml(path.description)}</p>
      <div class="path-meta">
        ${path.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
      <span class="card-link">Mở trang nội dung</span>
    </a>
  `).join('');
}

function renderLabs() {
  const grid = document.getElementById('lab-grid');
  if (!grid) return;

  grid.innerHTML = eveLabs.map(lab => `
    <a class="lab-card clickable-card" href="${escapeAttribute(lab.url)}">
      <span class="service-icon">${escapeHtml(lab.vendor.slice(0, 2).toUpperCase())}</span>
      <h3>${escapeHtml(lab.title)}</h3>
      <p>${escapeHtml(lab.description)}</p>
      <div class="path-meta">
        ${lab.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
      <span class="card-link">Mở lab EVE-NG</span>
    </a>
  `).join('');
}

function renderCourses() {
  const grid = document.getElementById('course-grid');
  if (!grid) return;

  grid.innerHTML = courses.map(course => `
    <a class="course-card clickable-card" href="${escapeAttribute(course.url)}">
      <div class="course-image">
        <img src="${escapeAttribute(course.image)}" alt="${escapeAttribute(course.title)}">
      </div>
      <div class="course-body">
        <h3>${escapeHtml(course.title)}</h3>
        <p>${escapeHtml(course.description)}</p>
        <div class="course-meta">
          <span class="tag">${escapeHtml(course.duration)}</span>
          <span class="tag">${escapeHtml(course.level)}</span>
          <span class="tag">Có bài tập</span>
        </div>
        <span class="card-link">Xem nội dung khóa học</span>
      </div>
    </a>
  `).join('');
}

function renderResources() {
  const list = document.getElementById('resource-list');
  if (!list) return;

  list.innerHTML = resources.map(resource => `
    <a class="resource-item clickable-card" href="${escapeAttribute(resource.url)}">
      <h3>${escapeHtml(resource.title)}</h3>
      <p>${escapeHtml(resource.description)}</p>
      <span class="card-link">Mở tài liệu</span>
    </a>
  `).join('');
}

function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  grid.innerHTML = testimonials.map(t => `
    <article class="testimonial-card">
      <div class="testimonial-highlight">${escapeHtml(t.highlight)}</div>
      <blockquote>"${escapeHtml(t.quote)}"</blockquote>
      <div class="testimonial-author">
        <div class="author-avatar">${escapeHtml(t.name.charAt(0))}</div>
        <div>
          <strong>${escapeHtml(t.name)}</strong>
          <span>${escapeHtml(t.role)}</span>
          <span class="author-company">${escapeHtml(t.company)}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function renderPaymentSteps() {
  const list = document.getElementById('payment-steps');
  if (!list) return;

  list.innerHTML = paymentSteps.map(step => `
    <article class="step-item">
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.description)}</p>
    </article>
  `).join('');
}

async function loadServices() {
  try {
    const response = await fetch('/api/services');
    const services = await response.json();
    const selects = document.querySelectorAll('.service-select');
    const hiddenDefaults = document.querySelectorAll('[data-default-service]');

    selects.forEach(select => {
      const firstOption = select.querySelector('option')?.textContent || '-- Chọn --';
      select.innerHTML = `<option value="">${escapeHtml(firstOption)}</option>`;
      services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = service.name;
        select.appendChild(option);
      });
    });

    hiddenDefaults.forEach(input => {
      const preferred = input.dataset.defaultService;
      const matched = services.find(service => service.name === preferred) || services[0];
      if (matched) input.value = matched.id;
    });
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

async function loadEnterpriseServices() {
  const grid = document.getElementById('enterprise-services');
  if (!grid) return;

  try {
    const response = await fetch('/api/services');
    const services = await response.json();

    grid.innerHTML = services.map(service => `
      <article class="service-card">
        <span class="service-icon">IT</span>
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description || '')}</p>
      </article>
    `).join('');
  } catch (error) {
    console.error('Error loading enterprise services:', error);
  }
}

async function createTicket(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = Object.fromEntries(new FormData(form).entries());
  const messageDiv = form.querySelector('[data-form-message]');

  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      messageDiv.className = 'form-message success';
      messageDiv.innerHTML = `
        <strong>Đã nhận thông tin!</strong><br>
        Mã ticket của bạn: <strong>${escapeHtml(result.ticket_code)}</strong><br>
        Vui lòng lưu mã này để theo dõi.
      `;
      form.reset();
      loadServices();
    } else {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Lỗi: ' + (result.error || 'Không gửi được thông tin');
    }

    messageDiv.style.display = 'block';
  } catch (error) {
    console.error('Error:', error);
    messageDiv.className = 'form-message error';
    messageDiv.textContent = 'Lỗi kết nối. Vui lòng chạy server local hoặc thử lại sau.';
    messageDiv.style.display = 'block';
  }
}

async function searchTicket() {
  const code = document.getElementById('search-code').value.trim();

  if (!code) {
    alert('Vui lòng nhập mã ticket');
    return;
  }

  try {
    const response = await fetch(`/api/tickets/search/${encodeURIComponent(code)}`);
    const result = await response.json();
    const resultDiv = document.getElementById('ticket-result');

    if (response.ok) {
      const statusClass = `status-${result.status}`;
      resultDiv.innerHTML = `
        <h3>Thông tin ticket</h3>
        <div class="result-row"><strong>Mã Ticket:</strong><span>${escapeHtml(result.ticket_code)}</span></div>
        <div class="result-row"><strong>Người gửi:</strong><span>${escapeHtml(result.customer_name)}</span></div>
        <div class="result-row"><strong>Email:</strong><span>${escapeHtml(result.customer_email)}</span></div>
        <div class="result-row"><strong>Dịch vụ/Nhu cầu:</strong><span>${escapeHtml(result.service_name || '')}</span></div>
        <div class="result-row"><strong>Tiêu đề:</strong><span>${escapeHtml(result.title)}</span></div>
        <div class="result-row"><strong>Mô tả:</strong><span>${escapeHtml(result.description)}</span></div>
        <div class="result-row"><strong>Trạng thái:</strong><span class="${statusClass}">${formatStatus(result.status)}</span></div>
        <div class="result-row"><strong>Ngày tạo:</strong><span>${new Date(result.created_at).toLocaleString('vi-VN')}</span></div>
      `;
      resultDiv.style.display = 'block';
    } else {
      resultDiv.innerHTML = `<p style="color: red;">${escapeHtml(result.error)}</p>`;
      resultDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Lỗi kết nối. Vui lòng thử lại!');
  }
}

function formatStatus(status) {
  const statuses = {
    open: 'Mới tiếp nhận',
    'in-progress': 'Đang xử lý',
    closed: 'Đã hoàn tất'
  };
  return statuses[status] || status;
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
