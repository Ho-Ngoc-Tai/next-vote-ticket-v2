import { cookies, headers } from "next/headers";
import AxiosCommon, { AxiosOptions } from "../Axios";
import { API_NOT_TOKEN } from "@routes/apiNotToken";
import { logger } from "@commons/logger";
import { encryptCryptoJS, shouldEncrypt } from "@commons/utils/crypto.utils";

class MediaService extends AxiosCommon {
  constructor(options: AxiosOptions) {
    super(options);

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: any) => {
        const isMatchApiNotToken = API_NOT_TOKEN?.map((path) => `/${path}`).includes(config.url);
        if (!isMatchApiNotToken) {
          const uCookies = await cookies();
          const token = uCookies.get(process.env.COOKIE_TOKEN_UPLOAD_NAME!)?.value;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Forward headers
        const headerLst = await headers();
        config.headers["User-Agent"] = headerLst.get("User-Agent");
        config.headers["Content-Type"] = "multipart/form-data";
        config.headers["address-ip"] = headerLst.get("cf-connecting-ip");
        config.headers["x-forwarded-for"] =
          headerLst.get("x-forwarded-for") || headerLst.get("connection.remoteAddress");

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

            return {
              code: response.data.code,
              message: response.data.message,
              success: response.data.success,
              data: shouldEncrypt()
                ? encryptCryptoJS(JSON.stringify(items || data || response.data))
                : items || data || response.data,
              ...(data?.items && {
                meta: {
                  total: data.total,
                  page: data.page,
                  limit: data.limit,
                  ...rest,
                },
              }),
            };
          }

          return (
            response.data || {
              code: response?.data?.code || 500,
              message: response?.data?.message || "Unknown error",
              data: response?.data?.data || null,
            }
          );
        } catch (error) {
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

          return Promise.reject({
            code: status || error.code || 500,
            message: error.message,
            data: error?.response?.data,
          });
        } catch (error) {
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

export default MediaService;
