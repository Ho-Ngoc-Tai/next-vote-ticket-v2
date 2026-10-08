/* eslint-disable no-unused-vars */

import { API_NOT_TOKEN } from "@/src/app/routes/apiNotToken";
import { CORE_CHECK_REFRESH_TOKEN_ENDPOINT, CORE_LOGIN_ENDPOINT } from "@/src/app/routes/core.api";
import { NEXT_LOGOUT_ENDPOINT } from "@/src/app/routes/next.api";
import axios from "axios";
import http from "http";
import https from "https";
import jwt from "jsonwebtoken";
import { getLocale } from "next-intl/server";
import { cookies, headers } from "next/headers";
import AxiosCommon, { AxiosOptions } from "../Axios";
import { logger } from "@commons/logger";
import { encryptCryptoJS, shouldEncrypt } from "@commons/utils/crypto.utils";
import { cookiesOption } from "@commons/utils/cookieOption.utils";
// === Refresh Token State ===
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

// Buffer time để refresh token trước khi hết hạn (60 giây)
const TOKEN_REFRESH_BUFFER_SECONDS = 60;

// Create shared agents with keepAlive for better performance
const agentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
};
const httpsAgent = new https.Agent(agentOptions);
const httpAgent = new http.Agent(agentOptions);

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Kiểm tra xem token có sắp hết hạn hay không
function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object" || !decoded.exp) {
      return true; // Nếu không decode được hoặc không có exp, coi như hết hạn
    }
    const exp = decoded.exp;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = exp - now;
    // Refresh nếu token còn ít hơn TOKEN_REFRESH_BUFFER_SECONDS giây
    return timeUntilExpiry <= TOKEN_REFRESH_BUFFER_SECONDS;
  } catch {
    return true; // Nếu có lỗi khi decode, coi như cần refresh
  }
}

class ServiceService extends AxiosCommon {
  constructor(options: AxiosOptions) {
    super(options);

    // Set agents: httpsAgent for https:// URLs, httpAgent for http:// (e.g. localhost)
    this.axiosInstance.defaults.httpsAgent = httpsAgent;
    this.axiosInstance.defaults.httpAgent = httpAgent;

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: any) => {
        const isMatchApiNotToken = API_NOT_TOKEN?.map((path) => `/${path}`).includes(config.url);
        if (!isMatchApiNotToken) {
          const uCookies = await cookies();
          let token = uCookies.get(process.env.COOKIE_TOKEN_NAME!)?.value;
          const refreshToken = uCookies.get(process.env.COOKIE_REFRESH_TOKEN_NAME!)?.value;

          // Preemptive refresh: Kiểm tra và refresh token nếu sắp hết hạn
          if (token && refreshToken && isTokenExpiringSoon(token)) {
            token = (await refreshTokenHandler(refreshToken)) || token;
          }

          // Nếu token không tồn tại, thử refresh
          if (!token && refreshToken) {
            token = (await refreshTokenHandler(refreshToken)) || undefined;
          }

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Forward headers
        const headerLst = await headers();
        config.headers["User-Agent"] = headerLst.get("User-Agent");
        config.headers["Content-Type"] = "application/json";
        config.headers["address-ip"] = headerLst.get("cf-connecting-ip");
        config.headers["x-forwarded-for"] =
          headerLst.get("x-forwarded-for") || headerLst.get("connection.remoteAddress");
        const locale = await getLocale();
        config.headers["Accept-Language"] = locale || "en";
        config.headers["Lang"] = locale || "en";
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        try {
          logger.info(`[REQUEST] ${response?.config?.method?.toUpperCase()} ${response?.config?.url}`);
          logger.info(`[BODY] ${JSON.stringify(response?.config?.data || response?.config?.params || {})}`);
          logger.info(`[RESPONSE ${response?.status}] ${JSON.stringify(response?.data)}`);

          if (response?.data?.code >= 200 && response?.data?.code < 300) {
            const data = response.data?.data;

            // Tách bỏ "items" và giữ phần còn lại
            const { items, ...rest } = data || {};
            let encryptedData = items || data || response.data;
            if (shouldEncrypt()) {
              encryptedData = encryptCryptoJS(JSON.stringify(items || data || response.data));
            }

            const res = {
              code: response.data.code,
              message: response.data.message,
              success: response.data.success,
              data: encryptedData,
              ...(data?.items && {
                meta: {
                  total: data.total,
                  page: data.page,
                  limit: data.limit,
                  ...rest,
                },
              }),
            };
            return res;
          }

          return (
            response.data || {
              code: response?.data?.code || 500,
              message: response?.data?.message || "Unknown error",
              data: response?.data || response?.data?.data || null,
            }
          );
        } catch (error) {
          logger.info(`[ERROR] ${JSON.stringify(error)}`);
          return Promise.reject({
            code: 500,
            message: "error",
            error,
          });
        }
      },
      async (error: any) => {
        try {
          const status = error?.response?.data?.statusCode || error?.status;

          logger.info(`[REQUEST] ${error?.config?.method?.toUpperCase()} ${error?.config?.url}`);
          logger.info(`[BODY] ${JSON.stringify(error?.config?.data || error?.config?.params || {})}`);
          logger.info(`[RESPONSE ${status}] ${JSON.stringify(error?.response?.data)}`);

          const originalRequest = error.config;

          if (error?.response?.request?.path === `/${CORE_LOGIN_ENDPOINT}`) {
            return Promise.reject({
              code: status || error.code || 500,
              message: error.message,
              ...error?.response?.data,
            });
          }
          if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const uCookies = await cookies();
            const refreshToken = uCookies.get(process.env.COOKIE_REFRESH_TOKEN_NAME!)?.value;

            if (refreshToken) {
              try {
                const newToken = await refreshTokenHandler(refreshToken);

                if (newToken) {
                  // originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newToken}`,
                  };
                  return this.axiosInstance(originalRequest); // retry request
                }
              } catch (e) {
                // refresh fail → logout
                await clearAuthCookies();
                await logoutAction();
                return Promise.reject(e);
              }
            }
            // refresh token không tồn tại → logout

            await clearAuthCookies();
            // await logoutAction();
            return false;
          }

          return Promise.reject({
            code: status || error.code || 500,
            message: error.message,
            ...error?.response?.data,
          });
        } catch (error) {
          logger.info(`[ERROR] ${JSON.stringify(error)}`);
          return Promise.reject({
            code: 500,
            message: "error",
            error,
          });
        }
      }
    );
  }
}

// ==== Helpers ====

async function clearAuthCookies() {
  const uCookies = await cookies();
  uCookies.set(process.env.COOKIE_TOKEN_NAME!, "", cookiesOption(0) as any);
  uCookies.set(process.env.COOKIE_REFRESH_TOKEN_NAME!, "", cookiesOption(0) as any);
}

// Quản lý refresh token 1 lần duy nhất
async function refreshTokenHandler(refreshToken: string): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshTokenAction(refreshToken);
    onRefreshed(newToken);
    return newToken;
  } catch {
    onRefreshed(null);
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function refreshTokenAction(refreshToken: string): Promise<string | null> {
  try {
    const useCoookies = await cookies();
    const headerLst = await headers();
    const respToken = await axios.post(
      `${process.env.CORE_API_DOMAIN}/${CORE_CHECK_REFRESH_TOKEN_ENDPOINT}`,
      { refreshToken },
      {
        httpsAgent,
        httpAgent,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": headerLst.get("User-Agent"),
          "address-ip": headerLst.get("cf-connecting-ip"),
          "x-forwarded-for": headerLst.get("x-forwarded-for") || headerLst.get("connection.remoteAddress"),
        },
      }
    );

    if (respToken?.data?.data?.accessToken) {
      // update cookie
      const tokenDecoded = jwt.decode(String(respToken?.data?.data?.accessToken));

      const tokenIat =
        typeof tokenDecoded === "object" && tokenDecoded !== null ? (tokenDecoded as jwt.JwtPayload).iat : undefined;
      const tokenExp =
        typeof tokenDecoded === "object" && tokenDecoded !== null ? (tokenDecoded as jwt.JwtPayload).exp : undefined;
      useCoookies.set(
        process.env.COOKIE_TOKEN_NAME!,
        String(respToken?.data?.data?.accessToken),
        cookiesOption(tokenExp && tokenIat ? (tokenExp - tokenIat) * 1000 : undefined) as any
      );

      const refreshTokenDecoded = jwt.decode(String(respToken?.data?.data?.refreshToken));
      const refreshIat =
        typeof refreshTokenDecoded === "object" && refreshTokenDecoded !== null
          ? (refreshTokenDecoded as jwt.JwtPayload).iat
          : undefined;
      const refreshExp =
        typeof refreshTokenDecoded === "object" && refreshTokenDecoded !== null
          ? (refreshTokenDecoded as jwt.JwtPayload).exp
          : undefined;

      useCoookies.set(
        process.env.COOKIE_REFRESH_TOKEN_NAME!,
        String(respToken?.data?.data?.refreshToken),
        cookiesOption(refreshExp && refreshIat ? (refreshExp - refreshIat) * 1000 : undefined) as any
      );
      // await checkRefreshToken(respToken.data); // cập nhật lại cookie/token trong hệ thống
      return respToken.data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function logoutAction() {
  try {
    const headerLst = await headers();
    const baseUrl = process.env.BASE_URL;
    const endpoint = `${baseUrl}/api${NEXT_LOGOUT_ENDPOINT}`;
    await axios.post(
      endpoint,
      {},
      {
        httpsAgent,
        httpAgent,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": headerLst.get("User-Agent"),
          "address-ip": headerLst.get("cf-connecting-ip"),
          "x-forwarded-for": headerLst.get("x-forwarded-for") || headerLst.get("connection.remoteAddress"),
        },
      }
    );
  } catch (error) {
    console.error("logout error:", error);
  }
}

export default ServiceService;
