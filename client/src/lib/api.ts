import { apiRequest } from "./queryClient";

export interface PaginatedResponse<T> {
  products: T[];
  total: number;
}

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
    
    const response = await apiRequest("GET", `/api/products?${params}`);
    return response.json();
  },

  getProduct: async (id: string) => {
    const response = await apiRequest("GET", `/api/products/${id}`);
    return response.json();
  },

  createProduct: async (data: any) => {
    const response = await apiRequest("POST", "/api/products", data);
    return response.json();
  },

  updateProduct: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `/api/products/${id}`, data);
    return response.json();
  },

  deleteProduct: async (id: string) => {
    await apiRequest("DELETE", `/api/products/${id}`);
  },

  // Categories
  getCategories: async () => {
    const response = await apiRequest("GET", "/api/categories");
    return response.json();
  },

  createCategory: async (data: any) => {
    const response = await apiRequest("POST", "/api/categories", data);
    return response.json();
  },

  updateCategory: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `/api/categories/${id}`, data);
    return response.json();
  },

  deleteCategory: async (id: string) => {
    await apiRequest("DELETE", `/api/categories/${id}`);
  },

  // Customers
  getCustomers: async () => {
    const response = await apiRequest("GET", "/api/customers");
    return response.json();
  },

  createCustomer: async (data: any) => {
    const response = await apiRequest("POST", "/api/customers", data);
    return response.json();
  },

  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },

  checkAuth: async () => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};
