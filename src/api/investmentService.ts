// Investment Comparison API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Compare investments
const compareInvestments = async (data: {
  selectedInvestments: string[];
  investmentAmount: number;
  timePeriod: string;
  riskPreference: string;
  investmentGoal: string;
  liquidityPreference: string;
  investmentFrequency: string;
  considerTax: boolean;
}) => {
  const response = await fetch(`${API_BASE_URL}/investment/compare`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

// Get comparison history
const getComparisonHistory = async (limit?: number) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/investment/history?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  );
  return handleResponse(response);
};

// Get specific comparison
const getComparison = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/investment/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const investmentService = {
  compareInvestments,
  getComparisonHistory,
  getComparison
};

export default investmentService;
