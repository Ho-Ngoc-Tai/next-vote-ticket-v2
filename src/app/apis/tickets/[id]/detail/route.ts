import { CORE_TICKET_DETAIL_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;

  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_TICKET_DETAIL_ENDPOINT(id),
  });
}
