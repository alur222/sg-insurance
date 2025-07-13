'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { getRecommendations } from '@/lib/api';
import { UserDetails, RecommendationResponse } from '@/types/api';

export default function InsuranceRecommendationApp() {
  const [age, setAge] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [dependents, setDependents] = useState<number>(0);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');

  const recommendationMutation = useMutation({
    mutationFn: (userDetails: UserDetails) => getRecommendations(userDetails),
    onSuccess: (data: RecommendationResponse) => {
      console.log('Recommendation received:', data);
    },
    onError: (error: Error) => {
      console.error('Error getting recommendation:', error);
    },
  });

  const handleGetRecommendation = () => {
    if (!age || age < 18 || !income || income <= 0) {
      alert('Please fill in all required fields with valid values (age must be 18+, income must be positive)');
      return;
    }

    const userDetails: UserDetails = {
      age,
      income,
      number_of_dependents: dependents,
      risk_tolerance: riskTolerance,
    };

    recommendationMutation.mutate(userDetails);
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Insurance Recommendation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              placeholder="Enter your age"
              value={age || ''}
              onChange={e => setAge(Number(e.target.value))}
              type='number'
              min="18"
              max="100"
            />
          </div>
          <div>
            <Label htmlFor="income">Annual Income (USD) *</Label>
            <Input
              id="income"
              placeholder="Enter your annual income"
              value={income || ''}
              onChange={e => setIncome(Number(e.target.value))}
              type='number'
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="dependents">Number of Dependents</Label>
            <Input
              id="dependents"
              placeholder="Number of people depending on you"
              value={dependents || ''}
              onChange={e => setDependents(Number(e.target.value))}
              type='number'
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
            <Select value={riskTolerance} onValueChange={(val) => setRiskTolerance(val as 'low' | 'medium' | 'high')}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Conservative approach</SelectItem>
                <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                <SelectItem value="high">High - Aggressive approach</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full" 
            onClick={handleGetRecommendation}
            disabled={recommendationMutation.isPending}
          >
            {recommendationMutation.isPending ? 'Getting Recommendation...' : 'Get Insurance Recommendation'}
          </Button>
        </CardContent>
      </Card>

      {recommendationMutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">
              Error: {recommendationMutation.error?.message || 'Failed to get recommendation'}
            </p>
          </CardContent>
        </Card>
      )}

      {recommendationMutation.data && (
        <div className="space-y-4">
          {/* Primary Recommendation */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Recommended for You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="text-lg font-semibold text-green-900">
                {recommendationMutation.data.recommendation.title}
              </h3>
              <p className="text-green-700">
                {recommendationMutation.data.recommendation.explanation}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Monthly Premium:</span>
                  <p>${recommendationMutation.data.recommendation.product.premium}</p>
                </div>
                <div>
                  <span className="font-medium">Coverage:</span>
                  <p>${recommendationMutation.data.recommendation.product.coverage_amount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
