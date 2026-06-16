import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a Shopify menu item URL into an app-relative path when it points
 * at the store's own domain, leaving genuinely external URLs untouched.
 * Shared by the header and footer menus to avoid duplicated logic.
 */
export function toAppHref(
  url: string,
  publicStoreDomain?: string,
  primaryDomainUrl?: string,
): {href: string; isExternal: boolean} {
  const isInternal =
    url.includes('myshopify.com') ||
    (publicStoreDomain ? url.includes(publicStoreDomain) : false) ||
    (primaryDomainUrl ? url.includes(primaryDomainUrl) : false);

  const href = isInternal ? new URL(url).pathname : url;
  return {href, isExternal: !href.startsWith('/')};
}
