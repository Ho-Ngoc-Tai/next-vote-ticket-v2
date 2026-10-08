/* eslint-disable no-unused-vars */
import { ApiResponse, ErrorResponse, RequestOptions } from "@interfaces/http";
import { ajaxDelete, get, patch, post, put } from "@commons/ajax/server";
import { shouldEncrypt } from "@commons/utils/crypto.utils";
import crypto from "crypto";
import { env } from "next-runtime-env";

export const methods = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "deleted",
  PATCH: "patch",
};

export const cacheTypes = {
  SHORT: "SHORT",
  MEDIUM: "MEDIUM",
  LONG: "LONG",
} as const;

type CacheType = keyof typeof cacheTime;

const cacheTime = {
  SHORT: {
    time: 60, // 1 phút
    stale: 10, // 10 giây
    maxAge: 30, // browser cache 30s
  },
  MEDIUM: {
    time: 300, // 5 phút
    stale: 15, // revalidate
    maxAge: 180, // browser cache 3 phút
  },
  LONG: {
    time: 1800, // 30 phút
    stale: 60, // revalidate
    maxAge: 900, // browser cache 15 phút
  },
};

const generateETag = (data: unknown): string => {
  const hash = crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
  return `"${hash}"`;
};

const handleRequest = async (
  request: Request,
  method: string,
  endpoint: string,
  body: unknown,
  options: Partial<RequestOptions>
) => {
  if (method === methods.GET) {
    if (!body) {
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries());
      return await get(endpoint, params, options);
    }
    return await get(endpoint, body as Record<string, unknown>, options);
  }
  if (method === methods.POST) {
    return await post(endpoint, body as Record<string, unknown>, options);
  }
  if (method === methods.PUT) {
    return await put(endpoint, body as Record<string, unknown>, options);
  }
  if (method === methods.DELETE) {
    return await ajaxDelete(endpoint, body as Record<string, unknown>, options);
  }
  if (method === methods.PATCH) {
    return await patch(endpoint, body as Record<string, unknown>, options);
  }
};

export const RouteService = async ({
  request,
  method,
  endpoint,
  handleResponse,
  body,
  options = {},
  cacheType,
}: {
  request: Request;
  method: string;
  endpoint: string;
  handleResponse?: (_response: unknown, _headers: Record<string, string>) => unknown;
  body?: unknown;
  options?: Partial<RequestOptions>;
  cacheType?: CacheType;
}): Promise<Response> => {
  try {
    let bodyReq = body;
    if (!bodyReq && method !== methods.GET) {
      bodyReq = await request.json();
    }
    const response = (await handleRequest(request, method, endpoint, bodyReq, options)) as unknown as ApiResponse;
    let headers: Record<string, string> = {};
    if (method === methods.GET && cacheType) {
      const cache = cacheTime[cacheType];
      headers["Cache-Control"] =
        `public, max-age=${cache.maxAge}, s-maxage=${cache.time}, stale-while-revalidate=${cache.stale}`;
      headers["CDN-Cache-Control"] = `public, s-maxage=${cache.time}, stale-while-revalidate=${cache.stale}`;
      headers["Vary"] = "Accept-Encoding, Authorization";
      headers["ETag"] = generateETag(response?.data);
      headers["Last-Modified"] = new Date().toUTCString();
    }

    if (env("NEXT_PUBLIC_ENV") !== "production") {
      headers = {
        ...headers,
        "core-route": endpoint,
      };
    }

    if (handleResponse) {
      return handleResponse(response, headers) as unknown as Response;
    }

    if ((response?.code === 200 && response?.success && response?.data) || response?.code === 204) {
      const dataRes = response?.data;
      if (shouldEncrypt()) {
        return Response.json(
          {
            code: 200,
            success: true,
            message: response?.message,
            data: dataRes,
            meta: response?.meta,
          },
          { headers }
        );
      }

      return Response.json(
        {
          code: 200,
          success: true,
          message: response?.message,
          ...(method !== methods.GET
            ? {
                data: {
                  ...(bodyReq as Record<string, unknown>),
                  ...(dataRes as Record<string, unknown>),
                },
              }
            : {
                data: dataRes,
              }),
          meta: response?.meta,
        },
        { headers }
      );
    }
    const res = {
      code: 500,
      success: false,
      data: (response as unknown as Record<string, unknown>) || (response?.data as Record<string, unknown>),
    };
    if (response?.message === "Request failed with status code 404") {
      res.code = 404;
      res.data = {
        ...(res.data as Record<string, unknown>),
        message: "Đường dẫn core api không tồn tại",
      };
    }
    return Response.json(res, { headers });
  } catch (error: unknown) {
    const errorResponse = error as unknown as ErrorResponse;
    return Response.json(
      {
        code: 500,
        success: false,
        error: errorResponse || {},
        message: errorResponse?.message || "Unknown error",
      },
      { headers: { "core-route": endpoint } }
    );
  }
};
