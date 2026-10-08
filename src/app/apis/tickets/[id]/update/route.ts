import { NextRequest } from "next/server";
import { CORE_TICKET_UPDATE_ENDPOINT } from "@routes/core.api";
import { methods, RouteService } from "@services/route-service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;

  return RouteService({
    request,
    method: methods.PUT,
    endpoint: CORE_TICKET_UPDATE_ENDPOINT(id),
  });
}
