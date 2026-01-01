import axios from "axios";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Vibration } from "react-native";
import { io, Socket } from "socket.io-client";
import { QueueStatus, Token } from "../models/types";
import { TokenManager } from "../services/api";
import { TokenService } from "../services/token.service";

// ============================================
// SOCKET CONFIG
// ============================================
const SOCKET_URL = "https://qure-backend-api.onrender.com";
const API_BASE_URL = "https://qure-backend-api.onrender.com/api";

// ============================================
// CONTEXT TYPES
// ============================================
interface QueueContextType {
  isConnected: boolean;
  activeToken: Token | null;
  queueStatus: QueueStatus | null;
  isLoading: boolean;
  error: string | null;
  joinQueue: (token: Token) => void;
  leaveQueue: () => Promise<void>;
  generateTokenForClinic: (clinicId: string) => Promise<Token | null>;
  refreshActiveToken: () => Promise<void>;
  reconnectSocket: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType>({} as QueueContextType);

// ============================================
// QUEUE PROVIDER
// ============================================
export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  // Only use state for values that need to trigger re-renders
  const [isConnected, setIsConnected] = useState(false);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for socket and flags to avoid re-renders and stale closures
  const socketRef = useRef<Socket | null>(null);
  const isRefreshingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const activeTokenRef = useRef<Token | null>(null);

  // Sync activeToken ref with state
  useEffect(() => {
    activeTokenRef.current = activeToken;
  }, [activeToken]);

  // ============================================
  // REFRESH TOKEN HELPER
  // ============================================
  const refreshAuthToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current) return null;
    isRefreshingRef.current = true;

    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        console.log("No refresh token available");
        return null;
      }

      console.log("Refreshing auth token for socket...");
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
        deviceInfo: { userAgent: "QureClinics-Mobile-App" },
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      await TokenManager.setTokens(accessToken, newRefreshToken);
      console.log("Token refreshed successfully");
      return accessToken;
    } catch (err) {
      console.error("Failed to refresh token:", err);
      await TokenManager.clearTokens();
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // ============================================
  // SOCKET INITIALIZATION
  // ============================================
  const initSocket = useCallback(async (authToken?: string) => {
    // Disconnect existing socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = authToken || (await TokenManager.getAccessToken());

    if (!token) {
      console.log("No auth token, skipping socket connection");
      return;
    }

    console.log("Initializing socket connection...");
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    // Handle auth errors with token refresh
    newSocket.on("connect_error", async (err) => {
      console.error("Socket connection error:", err.message);
      setIsConnected(false);

      // Check if it's an auth error
      const isAuthError =
        err.message.includes("auth") ||
        err.message.includes("unauthorized") ||
        err.message.includes("jwt") ||
        err.message.includes("token");

      if (isAuthError && !isRefreshingRef.current) {
        console.log("Auth error detected, attempting token refresh...");
        const newToken = await refreshAuthToken();
        if (newToken && socketRef.current) {
          // Reconnect with new token
          console.log("Reconnecting socket with new token...");
          socketRef.current.auth = { token: newToken };
          socketRef.current.connect();
        } else {
          setError("Authentication failed. Please log in again.");
        }
      } else if (!isAuthError) {
        setError("Connection failed");
      }
    });

    // Queue events
    newSocket.on("join-queue", () => {
      console.log("Successfully joined queue room");
    });

    newSocket.on("join-queue-error", (message: string) => {
      console.error("Failed to join queue:", message);
      setError(message);
    });

    newSocket.on("leave-queue", () => {
      console.log("Left queue room");
    });

    newSocket.on("queue:status_update", (status: QueueStatus) => {
      console.log("Queue status update:", status);
      setQueueStatus(status);
    });

    newSocket.on("queue:empty", (message: string) => {
      console.log("Queue empty:", message);
    });

    // Personal token events
    newSocket.on("queue:your_token_called", (updatedToken: Token) => {
      console.log("Your token was called!");
      setActiveToken(updatedToken);
      Vibration.vibrate([0, 500, 200, 500]);
      Alert.alert(
        "🎉 Your Turn!",
        `Token #${updatedToken.tokenNumber} has been called. Please proceed to the counter.`,
        [{ text: "OK", style: "default" }]
      );
    });

    newSocket.on("queue:your_token_skipped", (updatedToken: Token) => {
      console.log("Your token was skipped");
      setActiveToken(updatedToken);
      Alert.alert(
        "Token Skipped",
        "Your token has been skipped. Please contact the staff if this was a mistake.",
        [{ text: "OK", style: "default" }]
      );
    });

    newSocket.on("queue:your_token_completed", () => {
      console.log("Your token was completed");
      setActiveToken(null);
      setQueueStatus(null);
      Alert.alert("Visit Complete", "Thank you for your visit!", [
        { text: "OK", style: "default" },
      ]);
    });

    socketRef.current = newSocket;
  }, [refreshAuthToken]);

  // ============================================
  // RECONNECT SOCKET (for manual reconnection)
  // ============================================
  const reconnectSocket = useCallback(async () => {
    console.log("Manual socket reconnection requested");
    await initSocket();
  }, [initSocket]);

  // Initialize socket on mount - only once
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // QUEUE METHODS - Use refs to access socket
  // ============================================
  const joinQueue = useCallback((token: Token) => {
    setActiveToken(token);
    setError(null);

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("join-queue", token.queueId);
    }
  }, []);

  const leaveQueue = useCallback(async () => {
    const socket = socketRef.current;
    const token = activeTokenRef.current;

    if (socket?.connected && token) {
      socket.emit("leave-queue", token.queueId);
    }

    // Optionally cancel the token via API
    if (token) {
      try {
        await TokenService.cancelToken(token.id);
      } catch (err) {
        console.warn("Failed to cancel token via API:", err);
      }
    }

    setActiveToken(null);
    setQueueStatus(null);
  }, []);

  const generateTokenForClinic = useCallback(
    async (clinicId: string): Promise<Token | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await TokenService.generateTokenForClinic(clinicId);
        joinQueue(token);
        return token;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate token";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [joinQueue]
  );

  const refreshActiveToken = useCallback(async () => {
    try {
      const tokens = await TokenService.getMyActiveTokens();
      if (tokens.length > 0) {
        const token = tokens[0];
        setActiveToken(token);

        // Rejoin the queue room using ref
        const socket = socketRef.current;
        if (socket?.connected) {
          socket.emit("join-queue", token.queueId);
        }
      }
    } catch (err) {
      console.error("Failed to refresh active token:", err);
    }
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: QueueContextType = {
    isConnected,
    activeToken,
    queueStatus,
    isLoading,
    error,
    joinQueue,
    leaveQueue,
    generateTokenForClinic,
    refreshActiveToken,
    reconnectSocket,
  };

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================
export const useQueue = (): QueueContextType => {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }

  return context;
};

export default QueueContext;
