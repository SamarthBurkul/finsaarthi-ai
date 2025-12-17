// Career Analysis API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
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

// Analyze career
const analyzeCareer = async (data: {
  currentJobRole: string;
  yearsOfExperience: number;
  workLocation: string;
  keySkills: string;
  industry: string;
  educationLevel: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/career/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

// Get analysis history
const getAnalysisHistory = async (limit?: number) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/career/history?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  );
  return handleResponse(response);
};

// Get specific analysis
const getAnalysis = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/career/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const careerService = {
  analyzeCareer,
  getAnalysisHistory,
  getAnalysis
};

export default careerService;
