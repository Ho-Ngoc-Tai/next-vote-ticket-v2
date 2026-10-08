import { CORE_CHAT_CONVERSATIONS_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  return RouteService({
    request,
    method: methods.POST,
    endpoint: CORE_CHAT_CONVERSATIONS_ENDPOINT,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_CHAT_CONVERSATIONS_ENDPOINT,
  });
}
