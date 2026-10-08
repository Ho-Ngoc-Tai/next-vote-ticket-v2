// src/app/api/upload/route.ts

import { post as postUpload } from "@commons/ajax/media";
import { post } from "@commons/ajax/server";
import { cookiesOption } from "@commons/utils/cookieOption.utils";
import { decryptCryptoJS, shouldEncrypt } from "@commons/utils/crypto.utils";
import { CORE_GET_TOKEN_UPLOAD_ENDPOINT, CORE_UPLOAD_ENDPOINT } from "@routes/core.api";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files: File[] = formData.getAll("files") as File[];
    const source = (formData.get("source") as string) || "gallery";

    if (!files.length) {
      return Response.json({ success: false, message: "No files uploaded", code: 601 });
    }

    const tokenResp = await post(CORE_GET_TOKEN_UPLOAD_ENDPOINT, {});
    const decryptedData = shouldEncrypt()
      ? JSON.parse(decryptCryptoJS(String(tokenResp?.data || "")))
      : tokenResp?.data;
    if (!decryptedData?.uploadToken) {
      return Response.json({ code: 401, message: "Cannot get upload token", success: false });
    }

    const uploadToken = decryptedData.uploadToken;

    // Decode token to get expiry
    const tokenDecoded = jwt.decode(String(uploadToken)) as any;
    const tokenIat = tokenDecoded?.iat;
    const tokenExp = tokenDecoded?.exp;
    const duration = tokenExp && tokenIat ? (tokenExp - tokenIat) * 1000 : undefined;

    // ----------- SET COOKIE -----------
    const cookieStore = await cookies();
    cookieStore.set(process.env.COOKIE_TOKEN_UPLOAD_NAME!, String(uploadToken), cookiesOption(duration) as any);

    const uploadForm = new FormData();

    for (const file of files) {
      //   const arrayBuffer = await file.arrayBuffer();
      //   const buffer = Buffer.from(arrayBuffer);
      uploadForm.append("files", file);
    }
    uploadForm.append("source", source);

    // ----------- CALL REMOTE UPLOAD API -----------
    const uploadResp = await postUpload(CORE_UPLOAD_ENDPOINT, uploadForm);

    return Response.json(uploadResp);
  } catch (error) {
    return Response.json(error);
  }
}
