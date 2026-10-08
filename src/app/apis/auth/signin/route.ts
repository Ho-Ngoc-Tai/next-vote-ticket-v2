import { CORE_LOGIN_ENDPOINT, CORE_LOGIN_GOOGLE_ENDPOINT } from "@routes/core.api";
import { post } from "@commons/ajax/server";
import { cookiesOption } from "@commons/utils/cookieOption.utils";
import { decryptCryptoJS, shouldEncrypt } from "@commons/utils/crypto.utils";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Here you would typically handle the sign-in logic, such as checking credentials
    // against a database and returning a token or user data.
    // For demonstration, we'll just return the received data.
    let endpoint = CORE_LOGIN_ENDPOINT;
    if (body?.provider === "google") {
      // If the provider is Google, we might want to use a different endpoint
      endpoint = CORE_LOGIN_GOOGLE_ENDPOINT; // Adjust this as per your actual endpoint for Google login
    }
    const resp: any = await post(endpoint, body);

    if (!resp) {
      return Response.json({ error: "No response from server" }, { status: 500 });
    }
    const useCoookies = await cookies();
    // save cookie if needed
    if (resp?.code === 200) {
      const decryptedData = shouldEncrypt() ? JSON.parse(decryptCryptoJS(resp?.data)) : resp?.data;
      const tokenDecoded = jwt.decode(String(decryptedData?.accessToken));
      const tokenExp =
        typeof tokenDecoded === "object" && tokenDecoded !== null ? (tokenDecoded as jwt.JwtPayload).exp : undefined;
      useCoookies.set(
        process.env.COOKIE_TOKEN_NAME!,
        String(decryptedData?.accessToken),
        cookiesOption(tokenExp ? tokenExp * 1000 : undefined) as any
      );
      const refreshTokenDecoded = jwt.decode(String(decryptedData?.refreshToken));
      const refreshExp =
        typeof refreshTokenDecoded === "object" && refreshTokenDecoded !== null
          ? (refreshTokenDecoded as jwt.JwtPayload).exp
          : undefined;
      useCoookies.set(
        process.env.COOKIE_REFRESH_TOKEN_NAME!,
        String(decryptedData?.refreshToken),
        cookiesOption(refreshExp ? refreshExp * 1000 : undefined) as any
      );

      // remove ref cookie after signup
      useCoookies.delete({
        name: "ref", // tên cookie cần xóa
        domain: process.env.COOKIE_DOMAIN,
        httpOnly: false,
        sameSite: "lax",
        maxAge: 0,
      });
    }
    return Response.json(resp);
  } catch (error) {
    return Response.json(error);
  }
}
