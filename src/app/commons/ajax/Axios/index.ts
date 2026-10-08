import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { METHOD } from "../contants";
import type { ApiResponse, RequestOptions } from "@interfaces/http";

export interface AxiosOptions {
  defaults?: AxiosRequestConfig;
  prefix?: string;
}

class AxiosCommon {
  protected axiosInstance: AxiosInstance;
  protected prefix = "";

  constructor(options: AxiosOptions) {
    this.axiosInstance = axios.create(options?.defaults);
    this.prefix = options?.prefix || "";
  }

  protected async setHeaders(): Promise<void> {
    // Override nếu cần
  }

  private async request<Resp = unknown, Req = unknown>(
    { url, method, data, params }: RequestOptions<Req>,
    opts: Partial<RequestOptions> = {}
  ): Promise<AxiosResponse<ApiResponse<Resp>>> {
    await this.setHeaders();

    // Ghép URL chuẩn, tránh dư/thừa dấu /
    let fullUrl = this.prefix + url;
    if (this.axiosInstance.defaults?.baseURL) {
      const base = this.axiosInstance.defaults?.baseURL?.replace(/\/$/, "");
      // Loại bỏ mọi dấu / ở đầu path
      const path = fullUrl.replace(/^\/+/, "");
      fullUrl = `${base}/${path}`;
    }
    const config: AxiosRequestConfig = {
      url: fullUrl,
      method,
      data: data ?? opts.data,
      params: params ?? opts.params,
    };

    try {
      const response = await this.axiosInstance.request<ApiResponse<Resp>>(config);
      return response as AxiosResponse<ApiResponse<Resp>>;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public get<Resp = unknown>(
    url: string,
    params: Record<string, unknown> = {},
    options: Partial<RequestOptions> = {}
  ): Promise<AxiosResponse<ApiResponse<Resp>>> {
    return this.request<Resp>({ url, method: METHOD.GET, params }, options);
  }

  public post<Resp = unknown, Req = unknown>(
    url: string,
    data: Req,
    options: Partial<RequestOptions> = {}
  ): Promise<AxiosResponse<ApiResponse<Resp>>> {
    return this.request<Resp, Req>({ url, method: METHOD.POST, data }, options);
  }

  public put<Resp = unknown, Req = unknown>(
    url: string,
    data: Req,
    options: Partial<RequestOptions> = {}
  ): Promise<AxiosResponse<ApiResponse<Resp>>> {
    return this.request<Resp, Req>({ url, method: METHOD.PUT, data }, options);
  }

  public patch<Resp = unknown, Req = unknown>(
    url: string,
    data: Req,
    options: Partial<RequestOptions> = {}
  ): Promise<AxiosResponse<ApiResponse<Resp>>> {
    return this.request<Resp, Req>({ url, method: METHOD.PATCH, data }, options);
  }

  public delete<Resp = unknown, Req = unknown>(
    url: string,
    data?: Req,
    options: Partial<RequestOptions> = {}
  ): Promise<AxiosResponse<ApiResponse<Resp>>> {
    return this.request<Resp, Req>({ url, method: METHOD.DELETE, data }, options);
  }
}

export default AxiosCommon;
