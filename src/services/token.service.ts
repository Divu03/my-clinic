import { Token } from '../models/types';
import api from './api';

// Toggle this to FALSE when your backend is ready
const USE_MOCK_TOKENS = true;

export const TokenService = {
  /**
   * Generates a token for a specific clinic's queue.
   */
  generateTokenForClinic: async (clinicId: string): Promise<{ data: Token }> => {
    
    // DEMO: Hardcoded Mock Data logic
    if (USE_MOCK_TOKENS) {
      console.log("Simulating Token Generation for Clinic:", clinicId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockToken: Token = {
        id: 'mock-token-123',
        tokenNumber: 42, // The user will get Token #42
        status: 'WAITING',
        queueId: 'mock-queue-id',
        patientId: 'current-user-id'
      };

      return { data: mockToken };
    }

    // Real API Call
    // Matches your Backend Controller: router.post("/", ...)
    const response = await api.post('/tokens', { queueId: clinicId }); // Note: API expects queueId, typically clinicId maps to it or you fetch queueId first
    return response.data;
  },

  /**
   * Optional: Get current active token for the user
   */
  getMyActiveToken: async (): Promise<Token | null> => {
    if (USE_MOCK_TOKENS) {
      return {
        id: 'mock-token-123',
        tokenNumber: 42,
        status: 'WAITING',
        queueId: 'mock-queue-id',
        patientId: 'current-user-id'
      };
    }
    const response = await api.get('/tokens/my-active');
    return response.data;
  }
};