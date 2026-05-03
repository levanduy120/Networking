module.exports = {
  apps: [
    {
      name: 'duy-helpdesk',
      script: 'src/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/duy-helpdesk-error.log',
      out_file: '/var/log/pm2/duy-helpdesk-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
