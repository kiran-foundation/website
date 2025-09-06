// Simple validation utility for meta tags
export function validateMetaTags(props: any, common: any) {
  const errors: string[] = [];

  // Validate required Open Graph properties
  const ogTitle =
    props.ogTitle ?? common.ogTitle ?? props.title ?? common.title;
  const ogDescription =
    props.ogDescription ??
    common.ogDescription ??
    props.description ??
    common.description;
  const ogImage = props.ogImage ?? common.ogImage;
  const ogUrl = props.ogUrl ?? common.ogUrl;

  if (!ogTitle) errors.push("Missing og:title");
  if (!ogDescription) errors.push("Missing og:description");
  if (!ogImage) errors.push("Missing og:image");
  if (!ogUrl) errors.push("Missing og:url");

  // Validate Twitter Card properties
  const twitterTitle = props.twitterTitle ?? ogTitle;
  const twitterDescription = props.twitterDescription ?? ogDescription;
  const twitterImage = props.twitterImage ?? ogImage;

  if (!twitterTitle) errors.push("Missing twitter:title");
  if (!twitterDescription) errors.push("Missing twitter:description");
  if (!twitterImage) errors.push("Missing twitter:image");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to convert relative URLs to absolute
export function makeAbsoluteUrl(
  url: string,
  baseUrl: string = "https://kiran.foundation"
): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
}
