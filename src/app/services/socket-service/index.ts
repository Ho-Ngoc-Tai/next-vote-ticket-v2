/* eslint-disable no-unused-vars */
import { ENVIRONMENT } from "@constants/environment";
import { eventKeys } from "@constants/socket";
import { env } from "next-runtime-env";
import type { Socket } from "socket.io-client";

// ---------------------------------------------------------------------------
// NativeWSWrapper — wraps native WebSocket with on/off/disconnect API
// ---------------------------------------------------------------------------
export class NativeWSWrapper {
  private ws: WebSocket;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 2000;
  connected = false;

  constructor(private readonly url: string) {
    this.ws = this.createWS();
  }

  private createWS(): WebSocket {
    const ws = new WebSocket(this.url);

    ws.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emitLocal("open", null);
    };

    ws.onclose = () => {
      this.connected = false;
      this.emitLocal("close", null);
      this.tryReconnect();
    };

    ws.onerror = (event) => {
      this.emitLocal("error", event);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        // Emit to generic "message" listeners
        this.emitLocal("message", data);
        // Emit to event-type listeners (e.g. Binance "e" field like "kline")
        if (data?.e) this.emitLocal(data.e, data);
      } catch {
        this.emitLocal("message", event.data);
      }
    };

    return ws;
  }

  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.ws = this.createWS();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private emitLocal(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  on<T = any>(event: string, callback: (data: T) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback as (data: any) => void);
    return this;
  }

  off<T = any>(event: string, callback: (data: T) => void): this {
    this.listeners.get(event)?.delete(callback as (data: any) => void);
    return this;
  }

  send(data: object | string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent auto-reconnect
    this.ws.close();
    this.listeners.clear();
    this.connected = false;
  }
}

// ---------------------------------------------------------------------------
// SocketService — Socket.io cho internal API + factory cho external WS
// ---------------------------------------------------------------------------
class SocketService {
  private socket: Socket | null = null;
  private connectPromise: Promise<Socket> | null = null;
  // Quản lý các topic đã subscribe
  private subscribedTopics: Map<string, any> = new Map();
  // Quản lý các event đã on và callback của chúng
  private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  private getSocketUrl(): string {
    let socketUrl = env("NEXT_PUBLIC_CORE_API_DOMAIN");

    if (!socketUrl) {
      const environment = env("NEXT_PUBLIC_ENV");
      socketUrl =
        environment === ENVIRONMENT.DEVELOPMENT || environment === ENVIRONMENT.TESTING
          ? "https://t-api.votingcrypto.com"
          : "https://api.votingcrypto.com";
    }
    return socketUrl;
  }

  /**
   * Kết nối tới external WebSocket URL (wss:// / ws://).
   * Trả về NativeWSWrapper với API on/off/send/disconnect.
   *
   * @example
   * const ws = socketService.connectExternal(
   *   "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
   * );
   * ws.on("kline", (data) => console.log(data.k));
   * // Cleanup:
   * ws.disconnect();
   */
  connectExternal(url: string): NativeWSWrapper {
    if (typeof window === "undefined") {
      throw new Error("WebSocket can only be used on client-side");
    }
    return new NativeWSWrapper(url);
  }

  async connect(): Promise<Socket> {
    // Chỉ khởi tạo socket ở client-side
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Socket can only be initialized on client-side"));
    }

    const url = this.getSocketUrl();
    // Return existing promise if already connecting
    if (this.connectPromise) {
      return this.connectPromise;
    }

    // Return socket if already connected
    if (this.socket?.connected) {
      return Promise.resolve(this.socket);
    }

    // Create new connection promise
    this.connectPromise = (async () => {
      try {
        // Lazy load socket.io-client only on client-side
        const { default: io } = await import("socket.io-client");
        if (!io) {
          throw new Error("Socket.io is not available");
        }

        return new Promise<Socket>((resolve, reject) => {
          this.socket = io(url, {
            path: "/socket.io",
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            upgrade: true,
          });

          if (!this.socket) {
            reject(new Error("Failed to create socket instance"));
            return;
          }

          // Listen for 'connected' event from server
          this.socket.on("connected", () => {
            // connected to namespace
            // console.warn("connected to namespace");
          });

          this.socket.on("connect", () => {
            this.connectPromise = null;
            resolve(this.socket as Socket);
            // console.warn("connected to socket");
          });

          this.socket.on("disconnect", () => {
            // socket disconnected
            // console.warn("disconnected from socket");
          });

          this.socket.on("error", (error: unknown) => {
            console.error("Socket error:", error as Error);
            // console.warn("error connecting to socket");
            this.connectPromise = null;
            reject(error);
          });
        });
      } catch (error) {
        this.connectPromise = null;
        console.error("Failed to initialize socket:", error);
        throw error;
      }
    })();

    return this.connectPromise;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectPromise = null;
      // Clear tất cả tracking khi disconnect
      this.subscribedTopics.clear();
      this.eventListeners.clear();
    }
  }

  emit<T>(event: string, data: T, callback?: (response: unknown) => void): void {
    if (typeof window === "undefined" || !this.socket) return;
    this.socket.emit(event, data, callback);
  }

  async on<T>(event: string, callback: (response: T) => void): Promise<void> {
    if (typeof window === "undefined") return;

    if (!this.socket || !this.socket.connected) {
      await this.connect();
    }

    // Track event listener
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);

    this.socket?.on(event, callback);
  }

  off<T>(event: string, callback: (response: T) => void): void {
    if (typeof window === "undefined" || !this.socket) return;

    // Remove từ tracking
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }

    this.socket.off(event, callback);
  }

  processSubscribe<T, P>(body: T): Promise<P> {
    return new Promise<P>((resolve, reject) => {
      if (typeof window === "undefined" || !this.socket) {
        reject(new Error("Socket is not available"));
        return;
      }
      this.socket.emit(eventKeys.subscribe, body, (response: unknown) => {
        if (response) {
          resolve(response as P);
        } else {
          reject(new Error("No response from server"));
        }
      });
    });
  }

  async subscribe<T, P>(body: T): Promise<P> {
    try {
      if (!this.socket || !this.socket.connected) {
        await this.connect();
      }

      // Tạo key unique cho topic (dựa trên topicKey và params nếu có)
      const subscribeBody = body as any;
      const topicIdentifier = this.getTopicIdentifier(subscribeBody);

      // Kiểm tra đã subscribe chưa
      if (this.subscribedTopics.has(topicIdentifier)) {
        return Promise.resolve(this.subscribedTopics.get(topicIdentifier) as P);
      }

      const result = await this.processSubscribe<T, P>(body);

      // Lưu vào tracking sau khi subscribe thành công
      this.subscribedTopics.set(topicIdentifier, result);

      return result;
    } catch (error) {
      throw error;
    }
  }

  private getTopicIdentifier(body: any): string {
    // Tạo identifier unique cho topic dựa trên topicKey và params
    const topicKey = body?.topicKey || "";
    return `${topicKey}`;
  }

  unsubscribe<T>(body: T, callback?: (response: unknown) => void): void {
    if (typeof window === "undefined" || !this.socket) return;

    const subscribeBody = body as any;
    const topicIdentifier = this.getTopicIdentifier(subscribeBody);

    // Remove khỏi tracking
    if (this.subscribedTopics.has(topicIdentifier)) {
      this.subscribedTopics.delete(topicIdentifier);
    }

    this.socket.emit(eventKeys.unsubscribe, body, callback);
  }

  isConnected(): boolean {
    if (typeof window === "undefined") return false;
    return this.socket?.connected || false;
  }

  // Kiểm tra đã subscribe topic chưa
  isSubscribed(body: any): boolean {
    const topicIdentifier = this.getTopicIdentifier(body);
    return this.subscribedTopics.has(topicIdentifier);
  }

  // Lấy danh sách các topic đã subscribe
  getSubscribedTopics(): string[] {
    return Array.from(this.subscribedTopics.keys());
  }

  // Lấy danh sách các event đã on
  getEventListeners(): string[] {
    return Array.from(this.eventListeners.keys());
  }

  // Lấy số lượng callback cho một event
  getEventListenerCount(event: string): number {
    return this.eventListeners.get(event)?.size || 0;
  }

  // Clear tất cả event listeners cho một event
  clearEventListeners(event: string): void {
    if (typeof window === "undefined" || !this.socket) return;

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        this.socket?.off(event, callback as (...args: any[]) => void);
      });
      this.eventListeners.delete(event);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();

export default socketService;
