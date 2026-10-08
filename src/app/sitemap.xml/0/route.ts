import { WEB_SEO_ROUTE } from "@routes/webSeo";
import { buildPagesSitemap } from "@commons/seo/sitemapConfig";
import { env } from "next-runtime-env";

export async function GET() {
  const sitemapCates = WEB_SEO_ROUTE.map((route) => {
    return {
      url: `${process.env.BASE_URL || env("NEXT_PUBLIC_BASE_URL")}${route?.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
    };
  });
  const pagesSitemapXML = await buildPagesSitemap(sitemapCates);
  return new Response(pagesSitemapXML, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
