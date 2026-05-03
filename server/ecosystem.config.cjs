module.exports = {
  apps: [
    {
      name: '94club-api',
      cwd: __dirname,
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production'
        // Видео-розыгрыш (после удаления строк raffle_winners): RAFFLE_FIXED_DRAW: '1:8,2:16,3:20,4:19'
      },
      time: true,
      max_restarts: 10,
      exp_backoff_restart_delay: 250
    }
  ]
};

