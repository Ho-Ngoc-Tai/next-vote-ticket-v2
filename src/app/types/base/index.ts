import { LOADING_STATUS } from "@constants/status";

type LoadingStatus = (typeof LOADING_STATUS)[keyof typeof LOADING_STATUS];

export interface FetchDataArgs {
  page?: number;
  limit?: number;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  [key: string]: unknown;
}

export interface BaseReducerState<T, P = FetchDataArgs> {
  status: LoadingStatus;
  error: unknown;
  params: P;
  total: number;
  items: T[];
  platform?: string;
  data?: T;
}

export type BasePagination<P = Record<string, never>> = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} & P;

export interface BaseApiResponse<T = unknown, P = unknown> {
  message?: string;
  status?: string;
  code?: number;
  data?: T;
  meta?: BasePagination<P>;
}
