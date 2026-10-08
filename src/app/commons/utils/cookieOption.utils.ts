export const cookiesOption = (
  expires?: number | null
): {
  expires?: Date; //seconds
  domain?: string;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
} => {
  if (!expires || expires === 0) {
    // xoá cookie
    return {
      expires: new Date(0), // mốc 1970 => hết hạn ngay
      domain: process.env.COOKIE_DOMAIN || ".vote.com",
      httpOnly: true,
      sameSite: "lax",
      // secure: true
    };
  }
  const date = new Date();
  date.setTime(+date + expires); //
  // set cookie với thời hạn (seconds)
  return {
    expires: date, // exp là timestamp giây
    domain: process.env.COOKIE_DOMAIN || ".vote.com",
    httpOnly: true,
    sameSite: "lax",
    // secure: true,
  };
};
export const cookiesOptionWithoutHttpOnly = (expires: number | null | undefined) => {
  return {
    expires: expires ? new Date(expires || 0) : new Date(0),
    domain: process.env.COOKIE_DOMAIN || ".vote.com",
    sameSite: "lax" as const,
    // secure: true,
  };
};
