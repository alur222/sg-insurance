// Insurance product data model

export interface Product {
  id: string;
  name: string;
  description: string;
  premium: number;
  term: number; // in years
  coverage_amount: number;
  product_type: string; // e.g., 'life', 'health', 'auto', 'home'
  created_at: Date;
  updated_at: Date;
}
