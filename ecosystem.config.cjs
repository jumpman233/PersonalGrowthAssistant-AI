const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '.env')
})

module.exports = {
  apps: [
    {
      name: 'growth-compass',
      script: '.output/server/index.mjs',
      cwd: '/home/ubuntu/project/PersonalGrowthAssistant-AI',

      exec_mode: 'fork',
      instances: 1,

      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3000,
	      DATABASE_URL: process.env.DATABASE_URL,
        AI_API_KEY: process.env.AI_API_KEY,
        AI_BASE_URL: process.env.AI_BASE_URL,
        AI_MODEL_NAME: process.env.AI_MODEL_NAME,
        AI_PROVIDER: process.env.AI_PROVIDER,
        AI_MOCK_MODE: process.env.AI_MOCK_MODE,
      },

      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
