export default {
  apps: [
    {
      name: 'growth-compass',
      script: '.output/server/index.mjs',
      exec_mode: 'cluster',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        NITRO_HOST: '0.0.0.0',
        NITRO_PORT: '3000',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
}
