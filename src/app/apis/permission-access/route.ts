import { get } from "@commons/ajax/server";
import { encryptCryptoJS, shouldEncrypt } from "@commons/utils/crypto.utils";
import type { ApiResponse } from "@interfaces/http";
import { CORE_USER_INFO_ENDPOINT } from "@routes/core.api";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const response = (await get(CORE_USER_INFO_ENDPOINT)) as unknown as ApiResponse;
    if (response?.code === 200) {
      const cookieStore = await cookies();
      const token = cookieStore.get(process.env.COOKIE_TOKEN_NAME ?? "vttk")?.value;

      if (!token) {
        return Response.json({ code: 400, message: "Token not found" });
      }

      const encryptedToken = shouldEncrypt() ? encryptCryptoJS(JSON.stringify(token)) : token;

      return Response.json({ code: 200, data: encryptedToken });
    }
    return Response.json({ code: response.code, message: response.message });
  } catch (error) {
    return Response.json({ code: 500, message: (error as Error)?.message ?? "Unknown error" });
  }
}
