// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import {
  insertProductSchema,
  insertCategorySchema,
  insertCustomerSchema,
  loginSchema,
} from "../shared/schema";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

export function registerRoutes(app: Express) {
  // behind Vercel proxy (needed for secure cookies)
  app.set("trust proxy", 1);

  // --- Sessions (Postgres store)
  const PgSession = connectPg(session);
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session", // will be auto-created if missing
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET ?? "ecommerce-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24h
        secure: process.env.NODE_ENV === "production", // required for SameSite=None
        sameSite: "none", // allow cross-site cookies to your frontend
      },
    })
  );

  // --- One-time admin initialization (not per request)
  let initPromise: Promise<void> | null = null;
  async function ensureDefaultAdmin() {
    const existing = await storage.getAdminByUsername("admin");
    if (!existing) {
      const hashed = await bcrypt.hash("admin123", 10);
      await storage.createAdmin({ username: "admin", password: hashed });
    }
  }
  app.use(async (_req: Request, _res: Response, next: NextFunction) => {
    initPromise ??= ensureDefaultAdmin().catch((e) =>
      console.error("Admin init error:", e)
    );
    await initPromise;
    next();
  });

  // --- Auth guard
  const requireAuth = (req: any, res: Response, next: NextFunction) => {
    if (!req.session?.adminId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // ---------- Products ----------
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const category = (req.query.category as string) || undefined;
      const result = await storage.getProducts(page, limit, category);
      res.json(result);
    } catch {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const ok = await storage.deleteProduct(req.params.id);
      if (!ok) return res.status(404).json({ message: "Product not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // ---------- Categories ----------
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, data);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const ok = await storage.deleteCategory(req.params.id);
      if (!ok) return res.status(404).json({ message: "Category not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // ---------- Customers ----------
  app.get("/api/customers", requireAuth, async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  // ---------- Auth ----------
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(username);
      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.adminId = admin.id;
      res.json({ message: "Login successful", admin: { id: admin.id, username: admin.username } });
    } catch {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) =>
      err ? res.status(500).json({ message: "Failed to logout" }) : res.json({ message: "Logout successful" })
    );
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ message: "Not authenticated" });
    res.json({ adminId: req.session.adminId });
  });
}
