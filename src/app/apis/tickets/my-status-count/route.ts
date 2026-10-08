import { methods, RouteService } from "@services/route-service";

export const dynamic = "force-dynamic";

import { CORE_MY_TICKET_STATUS_COUNT_TICKETS_ENDPOINT } from "@routes/core.api";

export async function GET(request: Request): Promise<Response> {
  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_MY_TICKET_STATUS_COUNT_TICKETS_ENDPOINT,
  });
}
