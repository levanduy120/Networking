# Deployment Guide - Duy Network Engineer Support Portal

## Railway

1. Connect GitHub repository to Railway.
2. Use the existing `railway.json`.
3. Set Railway Variables from `.env.example`.
4. Deploy with `npm start`.

## Required Variables

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_new_strong_password
ADMIN_SESSION_TTL_MINUTES=120
```

## Email Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=levanduy120@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="Duy Network Engineer <levanduy120@gmail.com>"
OWNER_EMAIL=levanduy120@gmail.com
```

## Create Or Rotate Admin

Run this after setting `ADMIN_USERNAME` and `ADMIN_PASSWORD`:

```bash
node setup-admins.js
```

The admin password is stored as a bcrypt hash.

## Database

SQLite data lives in:

```text
data/helpdesk.db
```

On Railway, mount a volume so the database persists between deploys.

## Production Checklist

- [ ] Rotate old admin passwords.
- [ ] Confirm `/admin` is not linked from the public homepage.
- [ ] Configure SMTP variables.
- [ ] Create a test ticket.
- [ ] Verify customer confirmation email.
- [ ] Verify owner notification email.
- [ ] Confirm Railway volume persistence.
- [ ] Set up uptime monitoring.
- [ ] Back up SQLite regularly.
