const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(cors());
app.use(express.json());
const SECRET = "supersecretkey";
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    name TEXT,
    plan TEXT DEFAULT 'free'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    tenantId INTEGER,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    tenantId INTEGER,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
  )`);
  db.get("SELECT COUNT(*) as count FROM tenants", (err, row) => {
    if(row.count === 0) {
      db.run("INSERT INTO tenants (slug, name, plan) VALUES (?, ?, ?)", ["acme", "Acme", "free"]);
      db.run("INSERT INTO tenants (slug, name, plan) VALUES (?, ?, ?)", ["globex", "Globex", "free"]);
      const hashedPassword = bcrypt.hashSync("password", 10);
      db.run("INSERT INTO users (email, password, role, tenantId) VALUES (?, ?, ?, ?)", ["admin@acme.test", hashedPassword, "admin", 1]);
      db.run("INSERT INTO users (email, password, role, tenantId) VALUES (?, ?, ?, ?)", ["user@acme.test", hashedPassword, "member", 1]);
      db.run("INSERT INTO users (email, password, role, tenantId) VALUES (?, ?, ?, ?)", ["admin@globex.test", hashedPassword, "admin", 2]);
      db.run("INSERT INTO users (email, password, role, tenantId) VALUES (?, ?, ?, ?)", ["user@globex.test", hashedPassword, "member", 2]);
    }
  });
});
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});