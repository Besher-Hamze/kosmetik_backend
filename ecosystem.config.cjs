module.exports = {
  apps: [
    {
      name: "kosmetik-api",
      script: "dist/main.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3020,
      },
      max_memory_restart: "512M",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      time: true,
      autorestart: true,
      watch: false,
    },
  ],
};
