const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  OWNER_EMAIL
} = process.env;

function isEmailEnabled() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_FROM);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

async function sendMail(options) {
  if (!isEmailEnabled()) {
    console.log('Email is not configured. Skipping:', options.subject);
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: MAIL_FROM,
    ...options
  });
}

function buildCustomerConfirmation(ticket) {
  return {
    to: ticket.customer_email,
    subject: `[Duy Network] Đã nhận yêu cầu ${ticket.ticket_code}`,
    text: `Xin chào ${ticket.customer_name},

Duy Network đã nhận yêu cầu hỗ trợ của bạn.

Mã ticket: ${ticket.ticket_code}
Dịch vụ: ${ticket.service_name || 'Chưa phân loại'}
Tiêu đề: ${ticket.title}
Mức độ ưu tiên: ${ticket.priority}

Mình đang sắp xếp và sẽ phản hồi trong thời gian sớm nhất.

Trân trọng,
Duy Network`,
    html: `
      <p>Xin chào ${escapeHtml(ticket.customer_name)},</p>
      <p>Duy Network đã nhận yêu cầu hỗ trợ của bạn.</p>
      <ul>
        <li><strong>Mã ticket:</strong> ${escapeHtml(ticket.ticket_code)}</li>
        <li><strong>Dịch vụ:</strong> ${escapeHtml(ticket.service_name || 'Chưa phân loại')}</li>
        <li><strong>Tiêu đề:</strong> ${escapeHtml(ticket.title)}</li>
        <li><strong>Mức độ ưu tiên:</strong> ${escapeHtml(ticket.priority)}</li>
      </ul>
      <p>Mình đang sắp xếp và sẽ phản hồi trong thời gian sớm nhất.</p>
      <p>Trân trọng,<br>Duy Network</p>
    `
  };
}

function buildOwnerNotification(ticket) {
  return {
    to: OWNER_EMAIL || SMTP_USER,
    subject: `[Duy Network] Ticket mới ${ticket.ticket_code}`,
    text: `Có ticket mới:

Mã ticket: ${ticket.ticket_code}
Khách hàng: ${ticket.customer_name}
Email: ${ticket.customer_email}
SĐT: ${ticket.customer_phone || 'N/A'}
Dịch vụ: ${ticket.service_name || 'Chưa phân loại'}
Tiêu đề: ${ticket.title}
Mức độ ưu tiên: ${ticket.priority}

Mô tả:
${ticket.description}`,
    html: `
      <h2>Ticket mới: ${escapeHtml(ticket.ticket_code)}</h2>
      <p><strong>Khách hàng:</strong> ${escapeHtml(ticket.customer_name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(ticket.customer_email)}</p>
      <p><strong>SĐT:</strong> ${escapeHtml(ticket.customer_phone || 'N/A')}</p>
      <p><strong>Dịch vụ:</strong> ${escapeHtml(ticket.service_name || 'Chưa phân loại')}</p>
      <p><strong>Tiêu đề:</strong> ${escapeHtml(ticket.title)}</p>
      <p><strong>Mức độ ưu tiên:</strong> ${escapeHtml(ticket.priority)}</p>
      <p><strong>Mô tả:</strong></p>
      <p>${escapeHtml(ticket.description).replace(/\n/g, '<br>')}</p>
    `
  };
}

async function sendTicketEmails(ticket) {
  await Promise.all([
    sendMail(buildCustomerConfirmation(ticket)),
    sendMail(buildOwnerNotification(ticket))
  ]);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  isEmailEnabled,
  sendTicketEmails
};
