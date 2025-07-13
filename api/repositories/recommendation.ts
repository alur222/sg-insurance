import { Product } from '../models/Product';
import pool from '../config/database';

interface UserDetails {
  age: number;
  income: number;
  number_of_dependents: number;
  risk_tolerance: 'high' | 'medium' | 'low';
}

class RecommendationRepository {
  async getRecommendations(userDetails: UserDetails): Promise<Product[]> {
    let query = `
      SELECT * FROM products 
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramCount = 1;

    if (userDetails.age < 25) {
      query += ` AND product_type IN ('health', 'auto')`;
    } else if (userDetails.age >= 25 && userDetails.age < 40) {
      query += ` AND product_type IN ('life', 'health', 'auto', 'home')`;
    } else if (userDetails.age >= 40 && userDetails.age < 60) {
      query += ` AND product_type IN ('life', 'health', 'home')`;
    } else {
      query += ` AND product_type IN ('life', 'health')`;
    }

    const maxMonthlyPremium = (userDetails.income / 12) * 0.10;
    query += ` AND premium <= $${paramCount++}`;
    values.push(maxMonthlyPremium);

    const minCoverage = userDetails.income * (2 + userDetails.number_of_dependents);
    query += ` AND (product_type != 'life' OR coverage_amount >= $${paramCount++})`;
    values.push(minCoverage);

    // Risk tolerance based sorting
    let riskOrder = '';
    if (userDetails.risk_tolerance === 'low') {
      riskOrder = 'premium ASC, coverage_amount DESC';
    } else if (userDetails.risk_tolerance === 'medium') {
      riskOrder = 'coverage_amount DESC, premium ASC';
    } else { // high risk tolerance
      riskOrder = 'coverage_amount DESC, premium DESC';
    }

    query += ` ORDER BY 
      CASE 
        WHEN product_type = 'life' AND $${paramCount++} > 0 THEN 1
        WHEN product_type = 'health' THEN 2
        ELSE 5
      END,
      ${riskOrder}
      LIMIT 8`;
    
    values.push(userDetails.number_of_dependents);

    const result = await pool.query(query, values);
    return result.rows.map(this.mapRowToProduct);
  }

  async getById(id: string): Promise<Product | undefined> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToProduct(result.rows[0]);
  }

  async getAll(): Promise<Product[]> {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows.map(this.mapRowToProduct);
  }

  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      premium: parseFloat(row.premium),
      term: row.term,
      coverage_amount: parseFloat(row.coverage_amount),
      product_type: row.product_type,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default RecommendationRepository;