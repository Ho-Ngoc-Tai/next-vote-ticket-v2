import { buildPagesSitemap } from "@commons/seo/sitemapConfig";
import { WEB_SEO_ROUTE } from "@routes/webSeo";
import { env } from "next-runtime-env";
export async function GET() {
  // request: Request,
  // { params }: { params: Promise<{ id: string }> }
  try {
    const xmlMap = WEB_SEO_ROUTE.map((item) => {
      return {
        url: `${process.env.BASE_URL || env("NEXT_PUBLIC_BASE_URL")}${item?.path}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
      };
    });
    const pagesSitemapXML = await buildPagesSitemap(xmlMap);
    return new Response(pagesSitemapXML, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.warn(error);
  }
}
