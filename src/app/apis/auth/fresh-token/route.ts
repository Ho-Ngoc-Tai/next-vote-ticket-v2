import { cookiesOption } from "@commons/utils/cookieOption.utils";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const useCoookies = await cookies();
    // save cookie if needed
    const tokenDecoded = jwt.decode(String(body?.accessToken));
    const tokenExp =
      typeof tokenDecoded === "object" && tokenDecoded !== null ? (tokenDecoded as jwt.JwtPayload).exp : undefined;

    useCoookies.set(
      process.env.COOKIE_TOKEN_NAME!,
      String(body?.accessToken),
      cookiesOption(tokenExp ? tokenExp * 1000 : undefined) as any
    );
    const refreshTokenDecoded = jwt.decode(String(body?.refreshToken));
    const refreshExp =
      typeof refreshTokenDecoded === "object" && refreshTokenDecoded !== null
        ? (refreshTokenDecoded as jwt.JwtPayload).exp
        : undefined;

    useCoookies.set(
      process.env.COOKIE_REFRESH_TOKEN_NAME!,
      String(body?.refreshToken),
      cookiesOption(refreshExp ? refreshExp * 1000 : undefined) as any
    );
    return Response.json({ code: 200, message: "Check refresh token success" });
    // Here you would typically
  } catch (error) {
    return Response.json(error);
  }
}
