import { type Product, type InsertProduct, type Category, type InsertCategory, type Customer, type InsertCustomer, type Admin, type InsertAdmin } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // Products
  getProducts(page?: number, limit?: number, category?: string): Promise<{ products: Product[], total: number }>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Admin
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class JSONFileStorage implements IStorage {
  private dataDir = path.join(process.cwd(), "server", "data");
  private productsFile = path.join(this.dataDir, "products.json");
  private categoriesFile = path.join(this.dataDir, "categories.json");
  private customersFile = path.join(this.dataDir, "customers.json");
  private adminFile = path.join(this.dataDir, "admin.json");

  constructor() {
    this.initializeFiles();
  }

  private async initializeFiles() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
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

  // Products
  async getProducts(page = 1, limit = 12, category?: string): Promise<{ products: Product[], total: number }> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    
    let filteredProducts = products;
    if (category && category !== "all") {
      filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    const total = filteredProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      products: filteredProducts.slice(start, end),
      total
    };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    return products.find(p => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    const newProduct: Product = {
      ...product,
      id: randomUUID(),
      createdAt: new Date()
    };
    products.push(newProduct);
    await this.writeJSONFile(this.productsFile, products);
    return newProduct;
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return undefined;
    
    products[index] = { ...products[index], ...productUpdate };
    await this.writeJSONFile(this.productsFile, products);
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.readJSONFile<Product>(this.productsFile);
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    await this.writeJSONFile(this.productsFile, filteredProducts);
    return true;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.readJSONFile<Category>(this.categoriesFile);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    return categories.find(c => c.id === id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    const newCategory: Category = {
      ...category,
      id: randomUUID(),
      createdAt: new Date()
    };
    categories.push(newCategory);
    await this.writeJSONFile(this.categoriesFile, categories);
    return newCategory;
  }

  async updateCategory(id: string, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return undefined;
    
    categories[index] = { ...categories[index], ...categoryUpdate };
    await this.writeJSONFile(this.categoriesFile, categories);
    return categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.readJSONFile<Category>(this.categoriesFile);
    const filteredCategories = categories.filter(c => c.id !== id);
    
    if (filteredCategories.length === categories.length) return false;
    
    await this.writeJSONFile(this.categoriesFile, filteredCategories);
    return true;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.readJSONFile<Customer>(this.customersFile);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.readJSONFile<Customer>(this.customersFile);
    return customers.find(c => c.id === id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customers = await this.readJSONFile<Customer>(this.customersFile);
    const newCustomer: Customer = {
      ...customer,
      id: randomUUID(),
      createdAt: new Date()
    };
    customers.push(newCustomer);
    await this.writeJSONFile(this.customersFile, customers);
    return newCustomer;
  }

  // Admin
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const admins = await this.readJSONFile<Admin>(this.adminFile);
    return admins.find(a => a.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const admins = await this.readJSONFile<Admin>(this.adminFile);
    const newAdmin: Admin = {
      ...admin,
      id: randomUUID(),
      createdAt: new Date()
    };
    admins.push(newAdmin);
    await this.writeJSONFile(this.adminFile, admins);
    return newAdmin;
  }
}

export const storage = new JSONFileStorage();
