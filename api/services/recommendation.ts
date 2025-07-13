import { Product } from '../models/Product';
import RecommendationRepository from '../repositories/recommendation';
import { userDetailsInput } from '../validators/user-details-input';

interface UserDetails {
  age: number;
  income: number;
  number_of_dependents: number;
  risk_tolerance: 'high' | 'medium' | 'low';
}

interface RecommendationResponse {
  recommendation: {
    product: Product;
    title: string;
    explanation: string;
  };
}

class RecommendationService {
  constructor(private repository: RecommendationRepository) {}

  async getRecommendations(userDetails: UserDetails): Promise<RecommendationResponse> {
    const validatedData = userDetailsInput.parse(userDetails);
    const recommendations = await this.repository.getRecommendations(validatedData);

    if (recommendations.length === 0) {
      throw new Error('No suitable products found for the given user details.');
    }

    const bestProduct = recommendations[0];
    const title = this.generateRecommendationTitle(bestProduct);
    const explanation = this.generateExplanation(bestProduct, validatedData);

    return {
      recommendation: {
        product: bestProduct,
        title,
        explanation
      },
    };
  }

  private generateRecommendationTitle(product: Product): string {
    const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
    
    switch (product.product_type) {
      case 'life':
        return `${product.name} – ${formatCurrency(product.coverage_amount)} for ${product.term} years`;
      case 'health':
        return `${product.name} – ${formatCurrency(product.coverage_amount)} coverage`;
      case 'auto':
        return `${product.name} – ${formatCurrency(product.coverage_amount)} coverage`;
      case 'home':
        return `${product.name} – ${formatCurrency(product.coverage_amount)} property coverage`;
      default:
        return `${product.name} – ${formatCurrency(product.coverage_amount)} coverage`;
    }
  }

  private generateExplanation(product: Product, userDetails: UserDetails): string {
    const reasons: string[] = [];

    if (userDetails.age < 30 && product.product_type === 'health') {
      reasons.push('health insurance is essential for young professionals');
    } else if (userDetails.age >= 30 && userDetails.age < 50 && product.product_type === 'life') {
      reasons.push('life insurance becomes crucial as you build your career and family');
    } else if (userDetails.age >= 50 && product.product_type === 'life') {
      reasons.push('comprehensive life coverage is important for protecting your family\'s future');
    }

    if (userDetails.number_of_dependents > 0 && product.product_type === 'life') {
      reasons.push(`with ${userDetails.number_of_dependents} dependent(s), this provides essential financial security`);
    }

    const monthlyPremium = product.premium;
    const monthlyIncome = userDetails.income / 12;
    const premiumPercentage = ((monthlyPremium / monthlyIncome) * 100).toFixed(1);
    reasons.push(`the premium of $${monthlyPremium}/month represents only ${premiumPercentage}% of your monthly income`);

    if (userDetails.risk_tolerance === 'low' && product.premium < 100) {
      reasons.push('this affordable option aligns with your conservative approach to financial planning');
    } else if (userDetails.risk_tolerance === 'high' && product.coverage_amount > 200000) {
      reasons.push('this higher coverage option matches your willingness to invest in comprehensive protection');
    }

    // according to my research, the recommended coverage is 5 times your income plus 2 times for each dependent
    // this is a common industry standard for life insurance
    // and health insurance coverage
    const recommendedCoverage = userDetails.income * (5 + userDetails.number_of_dependents * 2);
    if (product.coverage_amount >= recommendedCoverage * 0.8) {
      reasons.push('this coverage amount meets our recommended protection level for your situation');
    }

    if (reasons.length === 0) {
      reasons.push('this product offers the best balance of coverage and affordability for your profile');
    }

    return `We recommend this because ${reasons.join(', ')}.`;
  }

}

export default RecommendationService;