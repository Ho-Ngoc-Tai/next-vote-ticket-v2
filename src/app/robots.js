export default function robots() {
  const baseUrl = process.env.BASE_URL || "https://ticket.votingcrypto.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
