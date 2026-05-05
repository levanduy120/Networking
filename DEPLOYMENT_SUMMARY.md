# Deployment Summary - Duy Network Engineer Support Portal

## Current Setup

| Item | Value |
|------|-------|
| Project | Duy Network Engineer Support Portal |
| Public URL | https://it-helpdesk-production.up.railway.app |
| Repository | https://github.com/levanduy120/it-helpdesk |
| Runtime | Node.js + Express |
| Database | SQLite on Railway volume |
| Admin Console | `/admin` |

## Security Update

Admin credentials are no longer documented in this repository.

Set or rotate the admin account with Railway Variables or a local `.env` file:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_new_strong_password
```

Then run:

```bash
node setup-admins.js
```

The password is stored as a bcrypt hash.

Important: previous admin passwords were written in older project documents. Treat them as exposed and rotate them before using the site in production.

## Email Variables

Configure these in Railway Variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=levanduy120@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="Duy Network Engineer <levanduy120@gmail.com>"
OWNER_EMAIL=levanduy120@gmail.com
```

When a customer creates a ticket:

- the customer receives a confirmation email,
- the owner email receives a new-ticket notification.

## Next Checklist

- [ ] Rotate all old admin passwords.
- [ ] Add SMTP variables on Railway.
- [ ] Create a test ticket and verify both emails.
- [ ] Confirm Railway volume is mounted for `data/helpdesk.db`.
- [ ] Add uptime monitoring.
- [ ] Back up SQLite database regularly.
