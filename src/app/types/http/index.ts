export interface RequestOptions<Req = unknown> {
  url: string;
  method: string;
  data?: Req;
  params?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  [x: string]: unknown;
  code: number;
  message: string;
  data: T;
}

export interface ErrorResponse {
  code: number;
  data: {
    success: boolean;
    code: number;
    message: string;
    error: string;
  };
  message: string;
}
