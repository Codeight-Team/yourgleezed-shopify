import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server.browser';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import type {HydrogenRouterContextProvider} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

/**
 * Minimal CSP that works with React Router streaming SSR + Hydrogen.
 *
 * Problem: React Router v7 + Hydrogen generate inline scripts (hydration bootstrap,
 * ScrollRestoration) that cannot always be given a nonce attribute.
 *
 * Solution: Use a permissive CSP for script-src that allows inline scripts.
 * This is safe because the app is deployed behind Shopify's infrastructure which
 * already provides protection against XSS. CSP is a defense-in-depth measure.
 *
 * For strict CSP with nonce: use Oxygen's native CSP support (not available on Netlify).
 */
function buildCSPHeader(context: HydrogenRouterContextProvider): string {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN ?? '';
  const checkoutDomain = context.env.PUBLIC_CHECKOUT_DOMAIN ?? '';

  const directives = [
    `default-src 'self' https://${storeDomain} https://${checkoutDomain}`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com https://*.shopify.com https://${checkoutDomain}`,
    `style-src 'self' 'unsafe-inline' https://cdn.shopify.com`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' https://cdn.shopify.com`,
    `connect-src 'self' https://${storeDomain} https://monorail-edge.shopifysvc.com https://${checkoutDomain}`,
    `frame-src https://${checkoutDomain} https://pay.shopify.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];

  return directives.join('; ');
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  let isStreamClosing = false;
  const abortController = new AbortController();
  request.signal.addEventListener('abort', () => {
    if (!isStreamClosing) {
      abortController.abort(request.signal.reason);
    }
  });

  // Extract nonce from Hydrogen's CSP for use in React (if available)
  const {nonce} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <ServerRouter
      context={reactRouterContext}
      url={request.url}
      nonce={nonce}
    />,
    {
      nonce,
      signal: abortController.signal,
      onError(error: unknown) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  const transformedBody = body.pipeThrough(
    new TransformStream({
      flush() {
        isStreamClosing = true;
      },
    }),
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', buildCSPHeader(context));

  return new Response(transformedBody, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
