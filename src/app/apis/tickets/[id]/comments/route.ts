import { RouteService } from "@services/route-service";
import { CORE_COMMENT_LIST_ENDPOINT, CORE_COMMENT_CREATE_ENDPOINT } from "@routes/core.api";
import { methods } from "@services/route-service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return RouteService({
    request,
    method: methods.GET,
    endpoint: CORE_COMMENT_LIST_ENDPOINT(id),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return RouteService({
    request,
    method: methods.POST,
    endpoint: CORE_COMMENT_CREATE_ENDPOINT(id),
  });
}
