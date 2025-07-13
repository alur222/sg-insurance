export interface Product {
  id: string;
  name: string;
  description: string;
  premium: number;
  term: number;
  coverage_amount: number;
  product_type: string;
  created_at: string;
  updated_at: string;
}

export interface UserDetails {
  age: number;
  income: number;
  number_of_dependents: number;
  risk_tolerance: 'low' | 'medium' | 'high';
}

export interface RecommendationResponse {
  recommendation: {
    product: Product;
    title: string;
    explanation: string;
  };
}
