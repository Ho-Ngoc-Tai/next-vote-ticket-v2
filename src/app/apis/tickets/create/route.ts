import { NextRequest } from "next/server";
import { CORE_TICKET_CREATE_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";

export async function POST(request: NextRequest): Promise<Response> {
  return RouteService({
    request,
    method: methods.POST,
    endpoint: CORE_TICKET_CREATE_ENDPOINT,
  });
}
