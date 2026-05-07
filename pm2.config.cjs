module.exports = {
    apps: [{
      name: "masoul-law-app",
      script: "./dist/boot.js",
      cwd: "/root/masauol_new",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      },
      max_memory_restart: "500M",
      restart_delay: 3000,
      max_restarts: 5,
      min_uptime: "10s"
    }]
  };
