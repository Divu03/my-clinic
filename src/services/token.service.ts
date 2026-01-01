import { AxiosError } from "axios";
import { ApiResponse, Queue, Token } from "../models/types";
import api from "./api";

// ============================================
// TOKEN SERVICE
// ============================================
export const TokenService = {
  /**
   * Generate a token for a specific queue
   * POST /api/tokens
   */
  generateToken: async (queueId: string): Promise<Token> => {
    try {
      const response = await api.post<ApiResponse<Token>>("/tokens", {
        queueId,
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error("Failed to generate token");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || "Failed to generate token";
      console.error("Failed to generate token:", message);
      throw new Error(message);
    }
  },

  /**
   * Get user's active tokens
   * GET /api/tokens/my-active
   */
  getMyActiveTokens: async (): Promise<Token[]> => {
    try {
      const response = await api.get<ApiResponse<Token[]>>("/tokens/my-active");

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch active tokens:", error);
      return [];
    }
  },

  /**
   * Get a specific token by ID
   * GET /api/tokens/:tokenId
   */
  getTokenById: async (tokenId: string): Promise<Token | null> => {
    try {
      const response = await api.get<ApiResponse<Token>>(`/tokens/${tokenId}`);

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch token:", error);
      return null;
    }
  },

  /**
   * Cancel a token (leave queue)
   * DELETE /api/tokens/:tokenId
   */
  cancelToken: async (tokenId: string): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<null>>(
        `/tokens/${tokenId}`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to cancel token:", error);
      return false;
    }
  },

  /**
   * Get today's queue for a clinic
   * GET /api/queues/clinic/:clinicId/today
   */
  getClinicTodayQueue: async (clinicId: string): Promise<Queue | null> => {
    try {
      const response = await api.get<ApiResponse<Queue>>(
        `/queues/clinic/${clinicId}/today`
      );

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        // No queue for today
        return null;
      }
      console.error("Failed to fetch clinic queue:", error);
      return null;
    }
  },

  /**
   * Get queue status
   * GET /api/queues/:queueId/status
   */
  getQueueStatus: async (queueId: string): Promise<any | null> => {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/queues/${queueId}/status`
      );

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch queue status:", error);
      return null;
    }
  },

  /**
   * Generate token for a clinic (fetches queue first, then generates token)
   * This is a convenience method that:
   * 1. Gets today's queue for the clinic
   * 2. Generates a token for that queue
   */
  generateTokenForClinic: async (clinicId: string): Promise<Token> => {
    try {
      // Step 1: Get today's queue for the clinic
      const queue = await TokenService.getClinicTodayQueue(clinicId);

      if (!queue) {
        throw new Error(
          "No active queue for this clinic today. The clinic may not have opened their queue yet."
        );
      }

      if (!queue.isActive) {
        throw new Error(
          "The queue for this clinic is not active. Please try again later."
        );
      }

      // Step 2: Generate the token for this queue
      const token = await TokenService.generateToken(queue.id);

      return token;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to join queue. Please try again.";
      throw new Error(message);
    }
  },
};

export default TokenService;
