const os = require('os');

module.exports = {
  apps : [{
    name: 'GameServer',
    script: 'server/index.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    port: process.env.PORT || 2567,
    instances: os.cpus().length,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    exec_mode   : 'fork', 
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'team battle royale',
      ref  : 'origin/master',
      repo : 'https://github.com/ArnolFokam/Battle-arena.git'
    }
  }
};
