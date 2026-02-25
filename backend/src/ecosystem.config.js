module.exports = {
  apps: [{
    name: "Portal_masa",
    script: "app.js",
    env: {
      DB_HOST: "localhost",
      DB_USER: "postgres",
      DB_PASSWORD: "admin",
      DB_NAME: "masa_portal",
      DB_PORT: 5432
    }
  }]
}