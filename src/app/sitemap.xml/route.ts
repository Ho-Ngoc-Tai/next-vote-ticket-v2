import { buildSitemapIndex } from "@commons/seo/sitemapConfig";
import { env } from "next-runtime-env";

// import { WEB_SEO_ROUTE } from "@commons/route/webSeo";
// import { buildSitemapIndex } from "@commons/seo/sitemapConfig";
const childXml = ["news"];
// Main async function to get sitemap index XML
export async function GET() {
  try {
    // get index file sitemap by category level 1
    const cateIndex = childXml.map(
      (cate) => `${process.env.BASE_URL || env("NEXT_PUBLIC_BASE_URL")}/sitemap-${cate}.xml`
    );

    // Build the sitemap index XML string containing links to all sitemap files.
    const sitemapIndexXML = await buildSitemapIndex(cateIndex);

    // Return the sitemap index XML with the appropriate content type.
    return new Response(sitemapIndexXML, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch {
    const sitemapIndexXML = await buildSitemapIndex(null);
    return new Response(sitemapIndexXML, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
