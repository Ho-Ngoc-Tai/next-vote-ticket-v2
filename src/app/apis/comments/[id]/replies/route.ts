import { RouteService, methods } from "@services/route-service";
import { CORE_COMMENT_REPLIES_ENDPOINT } from "@routes/core.api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_COMMENT_REPLIES_ENDPOINT(id),
  });
}
