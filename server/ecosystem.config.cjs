module.exports = {
  apps: [
    {
      name: '94club-api',
      cwd: __dirname,
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production'
      },
      time: true,
      max_restarts: 10,
      exp_backoff_restart_delay: 250
    }
  ]
};

