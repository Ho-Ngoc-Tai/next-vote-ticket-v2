import { post } from "@commons/ajax/server";
import { cookiesOption } from "@commons/utils/cookieOption.utils";
import { CORE_LOGOUT_ENDPOINT } from "@routes/core.api";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export async function POST() {
  try {
    const useCookies = await cookies();

    await post(CORE_LOGOUT_ENDPOINT, {});
    // Clear the authentication cookies
    useCookies.set(process.env.COOKIE_TOKEN_NAME!, "", cookiesOption(0) as any);
    useCookies.set(process.env.COOKIE_REFRESH_TOKEN_NAME!, "", cookiesOption(0) as any);
    // Return a success response
    return Response.json({ code: 200, message: "Logout successful" });
  } catch {
    return Response.json({ code: 500, message: "Internal server error" });
  }
}
