import { env } from "next-runtime-env";

export async function buildSitemapIndex(sitemaps: any | null) {
  // XML declaration and opening tag for the sitemap index.
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

  // Sitemap chính (sitemap-0.xml)
  xml += "<sitemap>";
  xml += `<loc>${process.env.BASE_URL || env("NEXT_PUBLIC_BASE_URL")}/sitemap-0.xml</loc>`; // Location tag specifying the URL of a sitemap file.
  xml += "</sitemap>";

  // Các sitemap con
  if (sitemaps) {
    for (const sitemapURL of sitemaps) {
      xml += "<sitemap>";
      xml += `<loc>${sitemapURL}</loc>`;
      xml += `<lastmod>${new Date().toISOString().split("T")[0]}</lastmod>`;
      xml += "</sitemap>";
    }
  }

  xml += "</sitemapindex>";
  return xml;
}

export async function buildPagesSitemap(
  pages: {
    url: string;
    lastModified?: string;
    changeFrequency?: string;
    image?: string;
  }[]
) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';

  for (const page of pages) {
    xml += "<url>";
    xml += `<loc>${page.url}</loc>`;
    xml += `<lastmod>${page.lastModified ?? new Date().toISOString().split("T")[0]}</lastmod>`;
    xml += `<changefreq>${page.changeFrequency ?? "weekly"}</changefreq>`;
    if (page.image) {
      xml += `<image:image>
        <image:loc>${page.image}</image:loc>
      </image:image>`;
    }
    xml += "</url>";
  }

  xml += "</urlset>";
  return xml;
}
