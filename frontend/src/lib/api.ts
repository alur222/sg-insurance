import { UserDetails, RecommendationResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getRecommendations = async (userDetails: UserDetails): Promise<RecommendationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/recommendation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userDetails),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
