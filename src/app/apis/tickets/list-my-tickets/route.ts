import { CORE_TICKET_LIST_MY_TICKETS_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";

export async function GET(request: Request): Promise<Response> {
  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_TICKET_LIST_MY_TICKETS_ENDPOINT,
  });
}
