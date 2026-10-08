import { CORE_USER_INFO_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";

export async function GET(request: Request): Promise<Response> {
  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_USER_INFO_ENDPOINT,
  });
}
