// server/storage.ts
import {
  products,
  categories,
  customers,
  admins,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Customer,
  type InsertCustomer,
  type Admin,
  type InsertAdmin,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// Remove JSONFileStorage — we're fully on Postgres now.

function omitUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export interface IStorage {
  // Products
  getProducts(
    page?: number,
    limit?: number,
    category?: string
  ): Promise<{ products: Product[]; total: number }>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    product: Partial<InsertProduct>
  ): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: string,
    category: Partial<InsertCategory>
  ): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(
    id: string,
    customer: Partial<InsertCustomer>
  ): Promise<Customer | undefined>;

  // Admin
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class PostgresStorage implements IStorage {
  // ---------- Products ----------
  async getProducts(
    page = 1,
    limit = 12,
    category?: string
  ): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * limit;

    const where =
      category && category !== "all" ? eq(products.category, category) : undefined;

    const rows = await db
      .select()
      .from(products)
      .where(where ?? sql`true`)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where ?? sql`true`);

    return { products: rows as Product[], total: Number(count) };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [row] = await db.select().from(products).where(eq(products.id, id));
    return (row as Product) ?? undefined;
  }

  async createProduct(input: InsertProduct): Promise<Product> {
    const [row] = await db
      .insert(products)
      .values({
        id: randomUUID(),
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        image: input.image,
        stock: input.stock ?? 0,          // avoid undefined
        rating: input.rating ?? "0",      // schema default is "0"
        featured: input.featured ?? false, // schema default is false
        // createdAt defaults in DB
      })
      .returning();

    return row as Product;
  }

  async updateProduct(
    id: string,
    patch: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const clean = omitUndefined({
      ...patch,
      // keep existing values if omitted
    });

    const [row] = await db
      .update(products)
      .set(clean)
      .where(eq(products.id, id))
      .returning();

    return (row as Product) ?? undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const res = await db.delete(products).where(eq(products.id, id));
    // drizzle node-postgres returns { rowCount }
    // @ts-ignore – rowCount exists on the underlying result
    return (res?.rowCount ?? 0) > 0;
  }

  // ---------- Categories ----------
  async getCategories(): Promise<Category[]> {
    const rows = await db.select().from(categories);
    return rows as Category[];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [row] = await db.select().from(categories).where(eq(categories.id, id));
    return (row as Category) ?? undefined;
  }

  async createCategory(input: InsertCategory): Promise<Category> {
    const [row] = await db
      .insert(categories)
      .values({
        id: randomUUID(),
        name: input.name,
        description: input.description ?? null, // avoid undefined
      })
      .returning();

    return row as Category;
  }

  async updateCategory(
    id: string,
    patch: Partial<InsertCategory>
  ): Promise<Category | undefined> {
    const clean = omitUndefined(patch);
    const [row] = await db
      .update(categories)
      .set(clean)
      .where(eq(categories.id, id))
      .returning();

    return (row as Category) ?? undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const res = await db.delete(categories).where(eq(categories.id, id));
    // @ts-ignore
    return (res?.rowCount ?? 0) > 0;
  }

  // ---------- Customers ----------
  async getCustomers(): Promise<Customer[]> {
    const rows = await db.select().from(customers);
    return rows as Customer[];
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [row] = await db.select().from(customers).where(eq(customers.id, id));
    return (row as Customer) ?? undefined;
  }

  async createCustomer(input: InsertCustomer): Promise<Customer> {
    const [row] = await db
      .insert(customers)
      .values({
        id: randomUUID(),
        name: input.name,
        email: input.email,
        phone: input.phone,
        interestedProducts: (input as any)?.interestedProducts ?? [],
      })
      .returning();

    return row as Customer;
  }

  async updateCustomer(
    id: string,
    patch: Partial<InsertCustomer>
  ): Promise<Customer | undefined> {
    const clean = omitUndefined(patch);
    const [row] = await db
      .update(customers)
      .set(clean)
      .where(eq(customers.id, id))
      .returning();

    return (row as Customer) ?? undefined;
  }

  // ---------- Admin ----------
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [row] = await db.select().from(admins).where(eq(admins.username, username));
    return (row as Admin) ?? undefined;
  }

  async createAdmin(input: InsertAdmin): Promise<Admin> {
    const [row] = await db
      .insert(admins)
      .values({
        id: randomUUID(),
        username: input.username,
        password: input.password, // must already be a bcrypt hash
      })
      .returning();

    return row as Admin;
  }
}

export const storage = new PostgresStorage();
