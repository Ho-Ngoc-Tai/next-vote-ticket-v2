export function maskStringRender(value: string | null, range: number = 3): string {
  if (!value) return "";

  // Trường hợp là email
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    const start = name.length - range;
    const maskedName =
      name
        .split("")
        .map((ch, i) => (i >= start ? "*" : ch))
        .join("") +
      "@" +
      domain;
    return maskedName;
  }

  // Trường hợp là số điện thoại
  if (/^\d+$/.test(value)) {
    const start = value.length - range;
    const maskedPhone = value
      .split("")
      .map((ch, i) => (i >= start ? "*" : ch))
      .join("");
    return maskedPhone;
  }

  return value;
}

export const generateSlug = (title: string, id: string) => {
  if (!title) return id;
  const converted = title
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .normalize("NFD")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
  return `${converted}-${id}`;
};

export const extractIdFromSlug = (slug: string) => {
  if (!slug) return null;
  const extracted = slug.split("-");
  return extracted[extracted.length - 1];
};

export const extractTextFromHtml = (html: string) => {
  if (!html) return [];

  // Replace <br> tags with newline character to properly split text
  const htmlWithLineBreaks = html.replace(/<br\s*\/?>/gi, "\n");

  // Parse HTML and extract text content as array
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlWithLineBreaks, "text/html");

  // Get only leaf elements to avoid duplicates from nested elements
  const elements = Array.from(
    doc.body.querySelectorAll(
      "p, li, div, span, h1, h2, h3, h4, h5, h6, td, th, em, i, label, button, blockquote, pre, code, article, section, header, footer, figcaption, caption"
    )
  );

  // Split each element's text content by line breaks and flatten the result
  const textArray = elements
    .flatMap((el) => {
      const text = el.textContent?.trim();
      if (!text) return [];
      // Split by newline to handle <br> tags within elements
      return text.split("\n").map((line) => line.trim());
    })
    .filter((text) => text && text.length > 0); // Remove empty strings

  // If no structured elements found, split by line breaks
  const finalArray =
    textArray.length > 0
      ? textArray
      : doc.body.textContent
          ?.trim()
          .split("\n")
          .filter((text) => text.trim().length > 0) || [];
  const uniqueArray = [...new Set(finalArray)];
  return uniqueArray;
};

export function copyText(text: string) {
  if (!text) return false;

  // 1️⃣ HTTPS + browser mới
  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }

  // 2️⃣ Fallback chắc chắn chạy
  const textarea = document.createElement("textarea");
  textarea.value = text;

  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "2em";
  textarea.style.height = "2em";
  textarea.style.padding = "0";
  textarea.style.border = "none";
  textarea.style.outline = "none";
  textarea.style.boxShadow = "none";
  textarea.style.background = "transparent";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
