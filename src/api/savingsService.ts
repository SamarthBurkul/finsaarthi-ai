// Savings API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// ==================== SAVINGS STATE API ====================

/**
 * Get current savings state for the user
 */
const getState = async () => {
  const response = await fetch(`${API_BASE_URL}/savings/state`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Update savings state (daily goal, selected goal, etc.)
 */
const updateState = async (data: {
  dailyGoal?: number;
  selectedGoal?: string;
  goalPrice?: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/savings/state`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

// ==================== SAVE TODAY API ====================

/**
 * Mark today as saved
 */
const saveToday = async () => {
  const response = await fetch(`${API_BASE_URL}/savings/save-today`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==================== SAVINGS LOGS API ====================

/**
 * Get savings logs history
 */
const getLogs = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/savings/logs?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  );
  return handleResponse(response);
};

// ==================== PROJECTIONS API ====================

/**
 * Get savings projections
 */
const getProjections = async () => {
  const response = await fetch(`${API_BASE_URL}/savings/projections`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==================== LIFE GOALS API ====================

/**
 * Get all life goals
 */
const getAllGoals = async () => {
  const response = await fetch(`${API_BASE_URL}/savings/goals`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Create a new life goal
 */
const createGoal = async (data: {
  goalName: string;
  targetAmount: number;
  targetDate?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/savings/goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

/**
 * Update a life goal
 */
const updateGoal = async (goalId: string, data: {
  currentSavedAmount?: number;
  status?: 'active' | 'completed';
}) => {
  const response = await fetch(`${API_BASE_URL}/savings/goals/${goalId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

/**
 * Delete a life goal
 */
const deleteGoal = async (goalId: string) => {
  const response = await fetch(`${API_BASE_URL}/savings/goals/${goalId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==================== DASHBOARD API ====================

/**
 * Get dashboard summary
 */
const getDashboardSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/savings/dashboard`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Export all services
export const savingsService = {
  // State
  getState,
  updateState,
  
  // Daily saving
  saveToday,
  
  // Logs
  getLogs,
  
  // Projections
  getProjections,
  
  // Goals
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  
  // Dashboard
  getDashboardSummary
};

export default savingsService;
