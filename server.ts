import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database setup
  const db = new Database("database.sqlite");
  db.pragma("journal_mode = WAL");

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      permissions TEXT,
      createdAt TEXT,
      lastLogin TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      stock INTEGER,
      sku TEXT,
      description TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      productId TEXT,
      productName TEXT,
      userId TEXT,
      username TEXT,
      checkOutDate TEXT,
      returnDate TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT,
      message TEXT,
      createdAt TEXT,
      read INTEGER
    );
  `);

  // Seed initial data if empty
  const userCount = db.prepare("SELECT count(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    const adminId = Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO users (id, username, password, role, permissions, createdAt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      "admin",
      "admin123",
      "SUPER_ADMIN",
      JSON.stringify(['view_dashboard', 'manage_users', 'edit_roles', 'view_reports', 'system_settings']),
      new Date().toISOString(),
      "active"
    );

    db.prepare(`
       INSERT INTO products (id, name, category, stock, sku, description, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('p1', 'Neural Core Alpha', 'Hardware', 42, 'NC-001', 'High-performance neural processing unit for AI workloads.', new Date().toISOString());
  }

  // API Routes
  
  // Users
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      user.permissions = JSON.parse(user.permissions || '[]');
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username, role, permissions, createdAt, lastLogin, status FROM users").all() as any[];
    users.forEach(u => u.permissions = JSON.parse(u.permissions || '[]'));
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { username, role, password, permissions } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO users (id, username, role, password, permissions, createdAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, username, role, password || 'admin123', JSON.stringify(permissions || []), createdAt, 'active');
      res.json({ id, username, role, createdAt, status: 'active' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, role, status, permissions } = req.body;
    db.prepare(`
      UPDATE users SET username = ?, role = ?, status = ?, permissions = ?
      WHERE id = ?
    `).run(username, role, status, JSON.stringify(permissions), id);
    res.json({ success: true });
  });

  app.delete("/api/users/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products ORDER BY updatedAt DESC").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, category, stock, sku, description } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const updatedAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO products (id, name, category, stock, sku, description, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, category, stock, sku, description, updatedAt);
    res.json({ id, updatedAt });
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    if (fields.length === 0) return res.json({ success: true });
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    db.prepare(`UPDATE products SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values, new Date().toISOString(), id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Logs (Movements)
  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY checkOutDate DESC").all();
    res.json(logs);
  });

  app.post("/api/logs/checkout", (req, res) => {
    const { productId, userId, username } = req.body;
    const product: any = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
    if (!product || product.stock <= 0) return res.status(400).json({ error: "Product unavailable" });

    const logId = Math.random().toString(36).substr(2, 9);
    const checkOutDate = new Date().toISOString();

    const transaction = db.transaction(() => {
      db.prepare("UPDATE products SET stock = stock - 1, updatedAt = ? WHERE id = ?").run(checkOutDate, productId);
      db.prepare(`
        INSERT INTO logs (id, productId, productName, userId, username, checkOutDate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(logId, productId, product.name, userId, username, checkOutDate, 'checked_out');
      
      const notiId = Math.random().toString(36).substr(2, 9);
      db.prepare("INSERT INTO notifications (id, type, message, createdAt, read) VALUES (?, ?, ?, ?, ?)").run(
        notiId, 'issue', `تم تسليم ${product.name} إلى ${username}`, checkOutDate, 0
      );
    });
    transaction();
    res.json({ success: true });
  });

  app.post("/api/logs/checkin", (req, res) => {
    const { logId } = req.body;
    const log: any = db.prepare("SELECT * FROM logs WHERE id = ?").get(logId);
    if (!log || log.status === 'returned') return res.status(400).json({ error: "Invalid log" });

    const returnDate = new Date().toISOString();
    const transaction = db.transaction(() => {
      db.prepare("UPDATE products SET stock = stock + 1, updatedAt = ? WHERE id = ?").run(returnDate, log.productId);
      db.prepare("UPDATE logs SET status = 'returned', returnDate = ? WHERE id = ?").run(returnDate, logId);
      
      const notiId = Math.random().toString(36).substr(2, 9);
      db.prepare("INSERT INTO notifications (id, type, message, createdAt, read) VALUES (?, ?, ?, ?, ?)").run(
        notiId, 'return', `قام ${log.username} بإعادة ${log.productName}`, returnDate, 0
      );
    });
    transaction();
    res.json({ success: true });
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 50").all() as any[];
    notifications.forEach(n => n.read = !!n.read);
    res.json(notifications);
  });

  app.post("/api/notifications/read", (req, res) => {
    db.prepare("UPDATE notifications SET read = 1").run();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
