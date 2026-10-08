import { CORE_CHAT_MESSAGES_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json();
  if (!body?.conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }
  return RouteService({
    request,
    method: methods.POST,
    endpoint: CORE_CHAT_MESSAGES_ENDPOINT(body.conversationId),
    body,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return new Response("Conversation ID is required", { status: 400 });
  }
  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_CHAT_MESSAGES_ENDPOINT(conversationId),
  });
}
