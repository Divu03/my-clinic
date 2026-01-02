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
import { useAuth } from "./AuthContext";

const SOCKET_URL = "https://qure-backend-api.onrender.com";
const API_BASE_URL = "https://qure-backend-api.onrender.com/api";

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

export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const isRefreshingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const activeTokenRef = useRef<Token | null>(null);

  useEffect(() => {
    activeTokenRef.current = activeToken;
  }, [activeToken]);

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

  const initSocket = useCallback(
    async (authToken?: string) => {
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

      newSocket.on("connect", async () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
        setError(null);
        // Refresh active token when socket connects
        await refreshActiveToken();
      });

      newSocket.on("disconnect", async (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);

        const isServerDisconnect =
          reason === "io server disconnect" || reason === "transport close";

        if (
          isServerDisconnect &&
          socketRef.current &&
          !isRefreshingRef.current
        ) {
          console.log(
            "Server disconnected, attempting token refresh and reconnect..."
          );
          const newToken = await refreshAuthToken();
          if (newToken) {
            await initSocket(newToken);
          } else {
            setError("Authentication expired. Please log in again.");
          }
        }
      });

      newSocket.on("connect_error", async (err) => {
        console.log("Socket connection error:", err.message);
        setIsConnected(false);

        const isAuthError =
          err.message.includes("auth") ||
          err.message.includes("unauthorized") ||
          err.message.includes("jwt") ||
          err.message.includes("token");

        if (isAuthError && !isRefreshingRef.current) {
          console.log("Auth error detected, attempting token refresh...");
          const newToken = await refreshAuthToken();
          if (newToken && socketRef.current) {
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
    },
    [refreshAuthToken]
  );

  const reconnectSocket = useCallback(async () => {
    console.log("Manual socket reconnection requested");
    await initSocket();
  }, [initSocket]);

  // Initialize socket when user is authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If user is authenticated and socket not initialized, initialize it
    if (user && !isInitializedRef.current) {
      console.log("User authenticated, initializing socket...");
      isInitializedRef.current = true;
      initSocket();
    }

    // If user is not authenticated, disconnect and reset
    if (!user && isInitializedRef.current) {
      console.log("User logged out, disconnecting socket...");
      isInitializedRef.current = false;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setActiveToken(null);
      setQueueStatus(null);
      setError(null);
    }
  }, [user, authLoading, initSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

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
        console.log("Generated token:", token);
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
      if (!user) return;
      console.log("Refreshing active token...");
      const token = await TokenService.getMyActiveTokens(user.id);
      if (token) {
        console.log("Found active token:", token);
        setActiveToken(token);

        const socket = socketRef.current;
        if (socket?.connected) {
          socket.emit("join-queue", token.queueId);
        }
      } else {
        console.log("No active tokens found");
        setActiveToken(null);
      }
    } catch (err) {
      console.error("Failed to refresh active token:", err);
    }
  }, []);

  // Debug: Log if function is undefined (should never happen)
  if (typeof generateTokenForClinic !== "function") {
    console.error(
      "ERROR: generateTokenForClinic is not a function!",
      typeof generateTokenForClinic,
      generateTokenForClinic
    );
  }

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

export const useQueue = (): QueueContextType => {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }

  return context;
};

export default QueueContext;
