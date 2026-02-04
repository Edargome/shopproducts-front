export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}
