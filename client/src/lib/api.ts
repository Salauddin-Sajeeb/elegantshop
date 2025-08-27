import { apiRequest } from "./queryClient";

export interface PaginatedResponse<T> {
  products: T[];
  total: number;
}

const BASE = import.meta.env.VITE_API_URL;

export const api = {
  // Products
  getProducts: async (page = 1, limit = 12, category?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category && category !== "all") {
      params.append("category", category);
    }
    const response = await apiRequest("GET", `${BASE}/api/products?${params}`);
    return response.json();
  },

  getProduct: async (id: string) => {
    const response = await apiRequest("GET", `${BASE}/api/products/${id}`);
    return response.json();
  },

  createProduct: async (data: any) => {
    const response = await apiRequest("POST", `${BASE}/api/products`, data);
    return response.json();
  },

  updateProduct: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `${BASE}/api/products/${id}`, data);
    return response.json();
  },

  deleteProduct: async (id: string) => {
    await apiRequest("DELETE", `${BASE}/api/products/${id}`);
  },

  // Categories
  getCategories: async () => {
    const response = await apiRequest("GET", `${BASE}/api/categories`);
    return response.json();
  },

  createCategory: async (data: any) => {
    const response = await apiRequest("POST", `${BASE}/api/categories`, data);
    return response.json();
  },

  updateCategory: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `${BASE}/api/categories/${id}`, data);
    return response.json();
  },

  deleteCategory: async (id: string) => {
    await apiRequest("DELETE", `${BASE}/api/categories/${id}`);
  },

  // Customers
  getCustomers: async () => {
    const response = await apiRequest("GET", `${BASE}/api/customers`);
    return response.json();
  },

  createCustomer: async (data: any) => {
    const response = await apiRequest("POST", `${BASE}/api/customers`, data);
    return response.json();
  },

  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiRequest("POST", `${BASE}/api/auth/login`, credentials);
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest("POST", `${BASE}/api/auth/logout`);
    return response.json();
  },

  checkAuth: async () => {
    const response = await apiRequest("GET", `${BASE}/api/auth/me`);
    return response.json();
  },
};
