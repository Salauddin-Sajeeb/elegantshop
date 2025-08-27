import { sql } from "drizzle-orm";
import { pgEnum,pgTable, text, varchar, decimal, integer,numeric,uuid, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema,createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  stock: integer("stock").notNull().default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  interestedProducts: jsonb("interested_products").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const paymentMethodEnum = pgEnum("payment_method", ["cod", "online"]);
export const orderStatusEnum = pgEnum("order_status", [
  "Pending (COD)",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]);
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  items: jsonb("items").$type<Array<{
    id: string;
    name: string;
    price: string;     // your products.price is string (decimal)
    quantity: number;
    image: string;
    category: string;
  }>>().notNull(),
  customer: jsonb("customer").$type<{
    name: string;
    phone: string;
    address: string;
  }>().notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cod"),
  total: numeric("total").notNull(), // store as DECIMAL
  status: orderStatusEnum("status").notNull().default("Pending (COD)"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});


export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export const insertOrderSchema = createInsertSchema(orders, {
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.string(),
    quantity: z.number().int().positive(),
    image: z.string(),
    category: z.string(),
  })).min(1),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(6),
    address: z.string().min(5),
  }),
  paymentMethod: z.enum(["cod","online"]).default("cod"),
  total: z.string().or(z.number()).transform(v => Number(v)), // allow number from client
});
export const orderSchema = createSelectSchema(orders);

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof orderSchema>;


