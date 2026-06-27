# KOSRES PM2 Ecosystem Config
# Start both apps:  pm2 start ecosystem.config.js
# Reload both:      pm2 reload all
# View logs:        pm2 logs

module.exports = {
  apps: [
    {
      name:         "kosres-api",
      cwd:          "/var/www/kosres/server",
      script:       "dist/main.js",
      instances:    1,               // increase to 2 on larger servers
      exec_mode:    "cluster",
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT:     3001,
      },
      error_file:   "/var/log/kosres/api-error.log",
      out_file:     "/var/log/kosres/api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
      autorestart:   true,
      watch:         false,
    },
    {
      name:         "kosres-web",
      cwd:          "/var/www/kosres/client",
      script:       "node_modules/.bin/next",
      args:         "start",
      instances:    1,
      exec_mode:    "fork",
      max_memory_restart: "500M",
      env: {
        NODE_ENV:   "production",
        PORT:       3000,
      },
      error_file:   "/var/log/kosres/web-error.log",
      out_file:     "/var/log/kosres/web-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
      autorestart:   true,
      watch:         false,
    },
  ],
}
