import { env } from "next-runtime-env";

export const renderMedia = (path: string | { path?: string } | undefined | null) => {
  const mediaDomain = env("NEXT_PUBLIC_MEDIA_DOMAIN") || process.env.MEDIA_DOMAIN;

  // Handle case when path is an object with 'path' property
  let actualPath: string = "";
  if (typeof path === "string") {
    actualPath = path;
  } else if (path && typeof path === "object" && "path" in path) {
    actualPath = path.path || "";
  }

  // Return empty string if no valid path
  if (!actualPath) {
    return "";
  }

  return `${mediaDomain}${actualPath}`;
};
