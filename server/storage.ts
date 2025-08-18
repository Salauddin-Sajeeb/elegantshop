import {
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Customer,
  type InsertCustomer,
  type Admin,
  type InsertAdmin,
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

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

// Use DATA_DIR on Render (persistent disk), fallback to ./server/data locally
const DATA_DIR =
  process.env.DATA_DIR ?? path.resolve(import.meta.dirname, "data");

// helper: remove keys whose value is undefined (so updates don’t clobber with undefined)
function omitUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export class JSONFileStorage implements IStorage {
  private productsFile = path.join(DATA_DIR, "products.json");
  private categoriesFile = path.join(DATA_DIR, "categories.json");
  private customersFile = path.join(DATA_DIR, "customers.json");
  private adminFile = path.join(DATA_DIR, "admin.json");

  constructor() {
    void this.initializeFiles();
  }

  private async initializeFiles() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await this.ensureFileExists(this.productsFile, "[]");
      await this.ensureFileExists(this.categoriesFile, "[]");
      await this.ensureFileExists(this.customersFile, "[]");
      await this.ensureFileExists(this.adminFile, "[]");
    } catch (error) {
      console.error("Error initializing data files:", error);
    }
  }

  private async ensureFileExists(filePath: string, defaultContent: string) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, defaultContent, "utf-8");
    }
  }

  private async readJSONFile<T>(filePath: string): Promise<T[]> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private async writeJSONFile<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  // ---------- Products ----------
  async getProducts(
    page = 1,
    limit = 12,
    category?: string
  ): Promise<{ products: Product[]; total: number }> {
    const products = await this.readJSONFile<Product>(this.productsFile);

    let filtered = products;
    if (category && category !== "all") {
      filtered = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    return { products: filtered.slice(start, end), total };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    return products.find((p) => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const products = await this.readJSONFile<Product>(this.productsFile);

    const newProduct: Product = {
      ...product,
      id: randomUUID(),
      // ensure no undefineds for required fields in the select type
      stock: product.stock ?? 0,
      rating: product.rating ?? null,
      featured: product.featured ?? null,
      createdAt: new Date(), // Date fits Date|null
    };

    products.push(newProduct);
    await this.writeJSONFile(this.productsFile, products);
    return newProduct;
  }

  async updateProduct(
    id: string,
    productUpdate: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    const i = products.findIndex((p) => p.id === id);
    if (i === -1) return undefined;

    // keep existing values where update is undefined
    const patch = omitUndefined({
      ...productUpdate,
      stock:
        productUpdate.stock !== undefined ? productUpdate.stock : products[i].stock,
      rating:
        productUpdate.rating !== undefined ? productUpdate.rating : products[i].rating,
      featured:
        productUpdate.featured !== undefined
          ? productUpdate.featured
          : products[i].featured,
    });

    products[i] = { ...products[i], ...patch };
    await this.writeJSONFile(this.productsFile, products);
    return products[i];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    await this.writeJSONFile(this.productsFile, filtered);
    return true;
  }

  // ---------- Categories ----------
  async getCategories(): Promise<Category[]> {
    return this.readJSONFile<Category>(this.categoriesFile);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    return categories.find((c) => c.id === id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);

    const newCategory: Category = {
      ...category,
      id: randomUUID(),
      // ensure description is not undefined (schema select likely string|null)
      description: category.description ?? null,
      createdAt: new Date(),
    };

    categories.push(newCategory);
    await this.writeJSONFile(this.categoriesFile, categories);
    return newCategory;
  }

  async updateCategory(
    id: string,
    categoryUpdate: Partial<InsertCategory>
  ): Promise<Category | undefined> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    const i = categories.findIndex((c) => c.id === id);
    if (i === -1) return undefined;

    const patch = omitUndefined({
      ...categoryUpdate,
      description:
        categoryUpdate.description !== undefined
          ? categoryUpdate.description
          : categories[i].description,
    });

    categories[i] = { ...categories[i], ...patch };
    await this.writeJSONFile(this.categoriesFile, categories);
    return categories[i];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;
    await this.writeJSONFile(this.categoriesFile, filtered);
    return true;
  }

  // ---------- Customers ----------
  async getCustomers(): Promise<Customer[]> {
    return this.readJSONFile<Customer>(this.customersFile);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.readJSONFile<Customer>(this.customersFile);
    return customers.find((c) => c.id === id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customers = await this.readJSONFile<Customer>(this.customersFile);

    const newCustomer: Customer = {
      ...customer,
      id: randomUUID(),
      // ensure required strings aren’t undefined
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      // ensure array default if insert omitted it
      // (type might be unknown[] | null depending on your schema inference)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interestedProducts: (customer as any).interestedProducts ?? [],
      createdAt: new Date(),
    };

    customers.push(newCustomer);
    await this.writeJSONFile(this.customersFile, customers);
    return newCustomer;
  }

  async updateCustomer(
    id: string,
    customerUpdate: Partial<InsertCustomer>
  ): Promise<Customer | undefined> {
    const customers = await this.readJSONFile<Customer>(this.customersFile);
    const i = customers.findIndex((c) => c.id === id);
    if (i === -1) return undefined;

    const patch = omitUndefined({
      ...customerUpdate,
      // keep existing array if update omitted it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interestedProducts:
        (customerUpdate as any)?.interestedProducts !== undefined
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (customerUpdate as any).interestedProducts
          : customers[i].interestedProducts,
    });

    customers[i] = { ...customers[i], ...patch };
    await this.writeJSONFile(this.customersFile, customers);
    return customers[i];
  }

  // ---------- Admin ----------
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const admins = await this.readJSONFile<Admin>(this.adminFile);
    return admins.find((a) => a.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const admins = await this.readJSONFile<Admin>(this.adminFile);
    const newAdmin: Admin = {
      ...admin,
      id: randomUUID(),
      createdAt: new Date(),
    };
    admins.push(newAdmin);
    await this.writeJSONFile(this.adminFile, admins);
    return newAdmin;
  }
}

export const storage = new JSONFileStorage();
